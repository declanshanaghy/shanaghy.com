#!/usr/bin/env node
// gen_hero.mjs — generate one hero image via the Gemini API and write it to disk.
//
// Usage:
//   node scripts/gen_hero.mjs "prompt text" [--aspect 21:9] [--output hero.png]
//
// Auth: GEMINI_API_KEY env var (fallback: GOOGLE_API_KEY), sent as x-goog-api-key header.
// On success: prints the absolute path of the saved image to stdout.
// On error:   prints status + response body to stderr, exits 1.

import { createWriteStream, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import https from "node:https";
import { Buffer } from "node:buffer";

const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

const VALID_ASPECTS = new Set(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"]);

function usage() {
  console.error(
    "Usage: node scripts/gen_hero.mjs <prompt> [--aspect <ratio>] [--output <path>]\n" +
      "  --aspect  one of: 1:1 16:9 9:16 4:3 3:4 21:9  (default: 21:9)\n" +
      "  --output  output file path                      (default: hero-<timestamp>.png)"
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let prompt = null;
  let aspect = "21:9";
  let output = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--aspect") {
      aspect = args[++i];
      if (!aspect) usage();
    } else if (args[i] === "--output") {
      output = args[++i];
      if (!output) usage();
    } else if (!args[i].startsWith("--")) {
      prompt = prompt ? prompt + " " + args[i] : args[i];
    } else {
      console.error(`Unknown flag: ${args[i]}`);
      usage();
    }
  }

  if (!prompt) {
    console.error("Error: prompt is required.");
    usage();
  }
  if (!VALID_ASPECTS.has(aspect)) {
    console.error(
      `Error: --aspect must be one of ${[...VALID_ASPECTS].join(", ")}, got: ${aspect}`
    );
    process.exit(1);
  }
  if (!output) {
    output = `hero-${Date.now()}.png`;
  }

  return { prompt, aspect, output };
}

function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const { prompt, aspect, output } = parseArgs(process.argv);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY (or GOOGLE_API_KEY) env var is not set.");
    process.exit(1);
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: aspect },
    },
  };

  const { status, body } = await httpsPost(
    ENDPOINT,
    { "x-goog-api-key": apiKey },
    requestBody
  );

  if (status !== 200) {
    process.stderr.write(`Error: HTTP ${status}\n${body}\n`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    process.stderr.write(`Error: could not parse response JSON:\n${body}\n`);
    process.exit(1);
  }

  const parts = parsed?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart) {
    process.stderr.write(`Error: no image parts in response:\n${body}\n`);
    process.exit(1);
  }

  const absOutput = resolve(output);
  mkdirSync(dirname(absOutput), { recursive: true });

  const imageBytes = Buffer.from(imagePart.inlineData.data, "base64");
  const ws = createWriteStream(absOutput);
  await pipeline(Readable.from(imageBytes), ws);

  process.stdout.write(absOutput + "\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
