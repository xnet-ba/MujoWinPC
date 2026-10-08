// Testovi za server API. Pokretanje: node --test tests/test_api.mjs
// Diže pravi server u MUJO_MOCK=1 (nema dockera/KVM-a).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 13201;
const TOKEN = "test-token-1234567890";
const BASE = `http://127.0.0.1:${PORT}`;
let srv;

async function waitUp(tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch (_) { /* još nije gore */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("server se nije podigao");
}

before(async () => {
  srv = spawn("node", ["server/index.js"], {
    cwd: ROOT,
    env: { ...process.env, MUJO_MOCK: "1", MUJO_API_TOKEN: TOKEN, MUJO_API_PORT: String(PORT) },
    stdio: "ignore",
  });
  await waitUp();
});

after(() => srv && srv.kill());

const auth = { Authorization: `Bearer ${TOKEN}` };

test("health radi bez tokena", async () => {
  const r = await fetch(`${BASE}/api/health`);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.mock, true);
});

test("status bez tokena → 401, s lošim → 401", async () => {
  assert.equal((await fetch(`${BASE}/api/status`)).status, 401);
  assert.equal((await fetch(`${BASE}/api/status`, { headers: { Authorization: "Bearer pogresan" } })).status, 401);
});

test("status s tokenom vraća oblik", async () => {
  const j = await (await fetch(`${BASE}/api/status`, { headers: auth })).json();
  assert.equal(j.ok, true);
  assert.equal(typeof j.running, "boolean");
});

test("up/down/restart mock", async () => {
  for (const a of ["up", "down", "restart"]) {
    const r = await fetch(`${BASE}/api/${a}`, { method: "POST", headers: auth });
    assert.equal(r.status, 200);
    assert.equal((await r.json()).ok, true);
  }
});

test("logs vraća tekst", async () => {
  const j = await (await fetch(`${BASE}/api/logs?tail=50`, { headers: auth })).json();
  assert.equal(j.ok, true);
  assert.match(j.logs, /mock/);
});

test("resources vraća host + profil", async () => {
  const j = await (await fetch(`${BASE}/api/resources`, { headers: auth })).json();
  assert.equal(j.ok, true);
  assert.equal(typeof j.host.memTotal, "number");
  assert.equal(typeof j.host.cpuCount, "number");
  assert.ok(j.vm.profile);
});

test("boot vraća poznatu fazu", async () => {
  const j = await (await fetch(`${BASE}/api/boot`, { headers: auth })).json();
  assert.equal(j.ok, true);
  assert.ok(["down", "starting", "downloading", "installing", "ready", "unknown"].includes(j.phase));
});

test("server se odbija bez tokena (non-mock)", async () => {
  const env = { ...process.env, MUJO_API_PORT: "13202" };
  delete env.MUJO_MOCK;
  delete env.MUJO_API_TOKEN;
  const p = spawn("node", ["server/index.js"], { cwd: ROOT, env, stdio: "ignore" });
  const code = await new Promise((res) => p.on("exit", res));
  assert.equal(code, 1);
});
