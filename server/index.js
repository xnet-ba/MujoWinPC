"use strict";
// MujoWinPC API: web ploča ↔ mujowin CLI. Ne mounta Docker socket nigdje;
// sve ide kroz scripts/mujowin kao podproces. Auth: Bearer token, obavezan.
// Sluša na 127.0.0.1 po defaultu — za udaljeni pristup koristi SSH/Codespaces
// port-forward, ne 0.0.0.0 bez TLS-a (vidi docs/SECURITY.md).
const crypto = require("crypto");
const path = require("path");
const express = require("express");
const { mock, mockStatus, mockLogs, runCli } = require("./mujowin");
const { resources } = require("./resources");
const { boot } = require("./boot");

const PORT = Number(process.env.MUJO_API_PORT || 3001);
const BIND = process.env.MUJO_API_BIND || "127.0.0.1";
let TOKEN = process.env.MUJO_API_TOKEN || "";
if (!TOKEN && mock()) {
  TOKEN = crypto.randomBytes(32).toString("hex");
  console.log("[api] mock: ephemeral token za ovaj proces:", TOKEN);
}
if (!TOKEN) {
  console.error("[api] MUJO_API_TOKEN nije postavljen. Generiši: openssl rand -hex 32");
  process.exit(1);
}
const DIGEST = crypto.createHash("sha256").update(TOKEN).digest();

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.resolve(__dirname, "..", "web")));

function authed(req) {
  const h = String(req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!h) return false;
  const d = crypto.createHash("sha256").update(h).digest();
  return d.length === DIGEST.length && crypto.timingSafeEqual(d, DIGEST);
}

// Audit trag: svaki API poziv u stdout (čitaju ga journald/docker logs).
app.use("/api", (req, res, next) => {
  const t = Date.now();
  res.on("finish", () => console.log(`[api] ${req.ip} ${req.method} ${req.path} ${res.statusCode} ${Date.now() - t}ms`));
  next();
});

// Throttling prije auth-a (brute-force tokena takođe troši kvotu).
// Ploča polla ~3 endpointa / 5s (≈36/min) — limit 120/min ima lufta.
const HITS = new Map();
setInterval(() => HITS.clear(), 60 * 1000).unref();
app.use("/api", (req, res, next) => {
  const n = (HITS.get(req.ip) || 0) + 1;
  HITS.set(req.ip, n);
  if (n > 120) return res.status(429).json({ ok: false, error: "previše zahtjeva, uspori" });
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true, mock: mock() }));

app.use("/api", (req, res, next) => {
  if (!authed(req)) return res.status(401).json({ ok: false, error: "neautorizovano" });
  next();
});

app.get("/api/status", async (req, res) => {
  if (mock()) return res.json({ ok: true, ...mockStatus() });
  try {
    const ps = JSON.parse(await runCli(["status", "--json"], 15000));
    res.json({ ok: true, running: ps.some((c) => c.State === "running"), containers: ps });
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e).slice(0, 500) }); }
});

for (const act of ["up", "down", "restart"]) {
  app.post(`/api/${act}`, async (req, res) => {
    if (mock()) return res.json({ ok: true, mock: true, output: `[mock] ${act}` });
    try {
      const out = await runCli([act], act === "up" ? 300000 : 120000);
      res.json({ ok: true, output: out.slice(-2000) });
    } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e).slice(0, 500) }); }
  });
}

app.get("/api/logs", async (req, res) => {
  if (mock()) return res.json({ ok: true, logs: mockLogs() });
  const tail = Math.min(1000, Math.max(10, Number(req.query.tail) || 100));
  try {
    const logs = await runCli(["logs"], 30000);
    res.json({ ok: true, logs: logs.split("\n").slice(-tail).join("\n") });
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e).slice(0, 500) }); }
});

app.get("/api/resources", async (req, res) => res.json({ ok: true, ...(await resources()) }));
app.get("/api/boot", async (req, res) => res.json({ ok: true, ...(await boot()) }));

app.listen(PORT, BIND, () => console.log(`[api] slušam na http://${BIND}:${PORT} (mock=${mock()})`));
