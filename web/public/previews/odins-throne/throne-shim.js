/* Odin's Throne static-preview shim — makes the built hall run with no backend.
 * REST: /api/namespaces + /api/jobs?namespace=<ns> return fixture data.
 * WS: /ws?namespace=<ns> becomes a fake socket that pushes a jobs-snapshot
 * on open and streams a synthetic Hermes session on subscribe. */
(function () {
  var SPEED = { ms: 260 };
  var NOW = Date.now();
  function iso(msAgo) { return new Date(NOW - msAgo).toISOString(); }

  var NS = [
    { id: "fenrir-agents", label: "Fenrir Ledger Agents" },
    { id: "say-so-agents", label: "SaySo Agents" },
    { id: "mytruthfinder-agents", label: "MyTruthFinder Agents" },
    { id: "shanaghy-com-agents", label: "Shanaghy.com Agents" },
    { id: "re-goatmower-agents", label: "Re-Goatmower Agents" },
    { id: "odins-throne-hermes-agents", label: "Odin's Throne Hermes Agents" },
    { id: "claude-pack-agents", label: "Claude Pack Agents" }
  ];

  function wire(sessionId, name, status, agent, step, issueNumber, title, branch, startedMsAgo) {
    return {
      sessionId: sessionId, name: name, issueNumber: issueNumber, agent: agent,
      step: step, status: status, startedAt: startedMsAgo == null ? null : iso(startedMsAgo),
      completedAt: null, podName: null, issueTitle: title || null, branchName: branch || null
    };
  }
  function job(sessionId, status, title, branch, msAgo) {
    var m = /issue-(\d+)-step(\d+)-([a-z]+)/i.exec(sessionId);
    return wire(sessionId, "agent-" + sessionId, status, m ? m[3] : "firemandecko",
      m ? parseInt(m[2], 10) : 1, m ? parseInt(m[1], 10) : 0, title, branch, msAgo);
  }

  var JOBS_BY_NS = {};
  JOBS_BY_NS["fenrir-agents"] = [
    job("issue-122-step1-firemandecko-79ea58d5", "running", "site: retell the odins-throne stone for the lantern-tree era", "fix/issue-120-throne-stone-retelling", 6.5 * 60000),
    job("issue-115-step1-firemandecko-b7fe6720", "succeeded", "readme catches up to the v3.15/v3.16 tree era", "fix/issue-114-readme-lantern-era", 40 * 60000),
    job("issue-105-step1-loki-3f1e2d3c", "failed", "root-cause the seat misalignment on the tall painting", "fix/issue-105-seat-y-crop", 2 * 3600000),
    job("issue-108-step1-luna-4d5e6f7a", "running", "mock up the decree tablet in moonlight", "ux/issue-108-decree-glow", 11 * 60000),
    job("issue-110-step1-heimdall-5e6f7a8b", "succeeded", "watch the Bifrost: gate the pairing flow", "fix/issue-110-gate-audit", 3 * 3600000),
    job("issue-111-step1-freya-6f7a8b9c", "pending", "collect the saga verses from the Eddas", "research/issue-111-edda-verses", 25 * 60000),
    job("issue-83-step1-firemandecko-8b9c0d1e", "succeeded", "Loki left his scepter unattended in the mead hall", "fix/issue-83-scepter", 26 * 3600000),
    job("issue-81-step1-firemandecko-9c0d1e2f", "succeeded", "Huginn demands overtime pay for thought delivery", "fix/issue-81-huginn-overtime", 30 * 3600000),
    job("issue-79-step1-loki-0d1e2f3a", "failed", "Valhalla thermostat stuck on eternal winter", "fix/issue-79-valhalla-heat", 34 * 3600000),
    job("issue-77-step1-luna-1e2f3a4b", "succeeded", "Sleipnir leaves eight hoofprints on the hall carpet", "fix/issue-77-hoofprints", 38 * 3600000)
  ];
  JOBS_BY_NS["shanaghy-com-agents"] = [
    job("issue-120-step1-firemandecko-79ea58d5", "running", "the stone retold: lantern-tree era sights in the Beheld gallery", "fix/issue-120-throne-stone-retelling", 4 * 60000),
    job("issue-118-step1-luna-7a8b9c0d", "pending", "add prefers-reduced-motion guards for hover transforms", "feat/issue-118-reduced-motion", 18 * 60000),
    job("issue-112-step1-firemandecko-8b9c0d1e", "succeeded", "audit and fix alt text on content images", "fix/issue-112-alt-text", 5 * 3600000)
  ];
  JOBS_BY_NS["say-so-agents"] = [
    job("issue-301-step1-freya-a1b2c3d4", "succeeded", "the speaking hall finds its voice", "feat/issue-301-voice", 22 * 3600000),
    job("issue-302-step1-luna-b2c3d4e5", "running", "the pronunciation coach drills the broad vowels", "ux/issue-302-vowels", 9 * 60000)
  ];
  JOBS_BY_NS["mytruthfinder-agents"] = [
    job("issue-3300-step1-luna-0f1e2d3c", "failed", "the truth-finder fetches the salmon of knowledge", "fix/issue-3300-salmon", 4 * 3600000)
  ];
  JOBS_BY_NS["re-goatmower-agents"] = [
    job("issue-4400-step1-firemandecko-5e6f7a8b", "failed", "the mower eats the ledger grass", "fix/issue-4400-mower", 7 * 3600000)
  ];
  JOBS_BY_NS["odins-throne-hermes-agents"] = [
    job("issue-114-step1-firemandecko-b7fe6720", "succeeded", "readme documents the dim ladder and the realm knowledge db", "fix/issue-114-readme-lantern-era", 55 * 60000)
  ];
  JOBS_BY_NS["claude-pack-agents"] = [
    job("issue-25-step1-firemandecko-f2f45a3f", "succeeded", "the first garden ballad under the new bed", "fix/issue-25-garden-ballad-path", 28 * 3600000),
    job("issue-16-step1-luna-c3d4e5f6", "succeeded", "the imagen generator moves into the pack", "feat/issue-16-imagen-pack", 50 * 3600000)
  ];
  NS.forEach(function (ns) {
    if (!JOBS_BY_NS[ns.id]) JOBS_BY_NS[ns.id] = [];
  });

  /* ── REST stub ── */
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input) {
    var url = String(input);
    var jsonResponse = function (body, status) {
      if (status === undefined) status = 200;
      return Promise.resolve({
        ok: status >= 200 && status < 300, status: status,
        json: function () { return Promise.resolve(body); },
        text: function () { return Promise.resolve(JSON.stringify(body)); }
      });
    };
    if (url.indexOf("/api/namespaces") !== -1) return jsonResponse({ namespaces: NS });
    var m = /\/api\/jobs\?namespace=([^&]+)/.exec(url);
    if (m) {
      var ns = decodeURIComponent(m[1]);
      var jobs = JOBS_BY_NS[ns] || [];
      return jsonResponse({ jobs: jobs, count: jobs.length });
    }
    if (url.indexOf("/api/logs/") !== -1) {
      return realFetch(input).catch(function () {
        return jsonResponse({ error: "no pod" }, 404);
      });
    }
    return realFetch(input);
  };

  /* ── the synthetic Hermes session the log terminal streams ── */
  var SESSION_ID = "issue-120-step1-firemandecko-79ea58d5";
  var LINES = [
    "=== Agent Sandbox Entrypoint ===",
    "Session: issue-120-step1-firemandecko-79ea58d5",
    "Branch: fix/issue-120-throne-stone-retelling",
    "Model: z-ai/glm-5.3 (provider: openrouter)",
    "[ok] DNS ready (attempt 1)",
    "=== Starting Hermes Agent ===",
    "Model: z-ai/glm-5.3 (provider: openrouter)",
    "Session: issue-120-step1-firemandecko-79ea58d5",
    "--- TASK PROMPT ---",
    "You are FiremanDecko, the Principal Engineer. Fix GitHub Issue #120: retell the odins-throne stone.",
    "--- END PROMPT ---",
    "[hermes] WARNING: this process is PID 1 with no init above it.",
    "Query: You are FiremanDecko, the Principal Engineer. Fix GitHub Issue #120.",
    "ECHO LINE THAT MUST NEVER RENDER",
    "──────────────────",
    "☤ Hermes",
    "I'll start by walking the stone as it stands, then let the tree tell itself.",
    "──────────────────",
    "",
    "💻 $ git log --oneline -3  0.8s",
    "📖 Read web/content/projects/odins-throne.html",
    "🔎 Searching tools · throne-gallery film-note  0.2s",
    "📖 Reading tool details · 3 tools",
    "📋 Plan 1/8 task(s)",
    "✍️ Write web/content/projects/odins-throne.html",
    "│ web/content/projects/odins-throne.html",
    "│ @@ -30,24 +30,38 @@",
    "│ +    <p>The realms sit as lanterns on a painted tree.</p>",
    "│ +    <p>The lantern is the holder of the spirit.</p>",
    "",
    "🔧 Patch web/content/projects/odins-throne.css",
    "│ @@ -356,7 +356,11 @@",
    "│ +.throne-gallery .thr-lead img{aspect-ratio:1278/1242;max-width:600px}",
    "│ +.throne-gallery .thr-portrait img{aspect-ratio:10/16}",
    "",
    "📋 Plan update 6/8 ✓",
    "──────────────────",
    "☤ Hermes",
    "The stone is retold. Six sights stand in the Beheld gallery; the prose walks the painted tree. The hall stands lit.",
    "᛭᛭᛭ DECREE COMPLETE ᛭᛭᛭ISSUE: #120VERDICT: DONEPR: https://github.com/declanshanaghy/shanaghy.com/pull/122SUMMARY:\n- Retold What It Is and The Build Story in the seanchaí voice\n- Added three new Beheld gallery figures\n- Scoped css treatments for the near-square leadCHECKS:\n- build: PASSSEAL: FiremanDecko · ᚠᛁᚱᛖᛗᚨᚾᛞᛖᚲᛟ · Principal EngineerSIGNOFF: Forged in fire, tempered by craft᛭᛭᛭ END DECREE ᛭᛭᛭",
    "──────────────────",
    "",
    "Resume this session with:",
    "hermes --resume local-c2aff5bc16827c6f",
    "Session:        local-c2aff5bc16827c6f",
    "Title:          Compose FiremanDecko prompt with sandbox preamble",
    "Duration:       2m 29s",
    "Messages:       51 (1 user, 49 tool calls)"
  ];

  /* ── WS stub: jobs-snapshot on open, session stream on subscribe ── */
  FakeWebSocket.CONNECTING = 0; FakeWebSocket.OPEN = 1; FakeWebSocket.CLOSING = 2; FakeWebSocket.CLOSED = 3;
  var wsSeq = 0;
  function FakeWebSocket(url) {
    var self = this;
    self._id = ++wsSeq;
    self.url = url;
    self.readyState = 0;
    self._listeners = { open: [], message: [], close: [], error: [] };
    var ns = "fenrir-agents";
    var m = /[?&]namespace=([^&]+)/.exec(String(url));
    if (m) ns = decodeURIComponent(m[1]);
    setTimeout(function () {
      self.readyState = 1;
      self._listeners.open.forEach(function (f) { f({ target: self }); });
      self._emit("jobs-snapshot", { jobs: JOBS_BY_NS[ns] || [] });
    }, 140);
  }
  FakeWebSocket.prototype = {
    CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3,
    addEventListener: function (type, f) { (this._listeners[type] = this._listeners[type] || []).push(f); },
    removeEventListener: function (type, f) {
      var arr = this._listeners[type] || [];
      var i = arr.indexOf(f); if (i !== -1) arr.splice(i, 1);
    },
    _emit: function (type, payload) {
      var data = JSON.stringify(Object.assign({ type: type, ts: Date.now() }, payload));
      var self = this;
      (this._listeners.message || []).forEach(function (f) { f({ data: data, target: self }); });
    },
    _stream: function (sessionId) {
      var self = this;
      var i = 0;
      function tick() {
        if (self.readyState !== 1) return;
        if (i >= LINES.length) {
          self._emit("verdict", { sessionId: sessionId, result: "PASS" });
          self._emit("stream-end", { sessionId: sessionId, reason: "completed" });
          return;
        }
        self._emit("log-line", { sessionId: sessionId, line: LINES[i] });
        i++;
        setTimeout(tick, SPEED.ms);
      }
      setTimeout(tick, 500);
    },
    send: function (raw) {
      var msg;
      try { msg = JSON.parse(raw); } catch (e) { return; }
      (window.__throneSends = window.__throneSends || []).push(msg.type + ":" + (msg.sessionId || "") + " @ws" + this._id);
      if (msg.type === "subscribe") {
        this._streaming = this._streaming || {};
        if (this._streaming[msg.sessionId]) return; // idempotent: one stream per session per socket
        this._streaming[msg.sessionId] = true;
        this._stream(msg.sessionId);
      }
      else if (msg.type === "set-speed") SPEED.ms = msg.speed;
      else if (msg.type === "ping") this._emit("pong", {});
    },
    close: function () {
      this.readyState = 3;
      var self = this;
      (this._listeners.close || []).forEach(function (f) { f({ target: self }); });
    }
  };
  window.WebSocket = FakeWebSocket;
  window.__thronePreviewSpeed = function (ms) { SPEED.ms = ms; };
})();