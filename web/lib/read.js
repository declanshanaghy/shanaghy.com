import fs from "fs";
import path from "path";

export function readContent(rel) {
  return fs.readFileSync(path.join(process.cwd(), "content", rel), "utf-8");
}