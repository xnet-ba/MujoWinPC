"use strict";
// Boot faza: deterministički dio (kontejner radi/ne) + heuristika iz logova.
// Heuristika je best-effort: dockur log format nije ugovoren i može se promijeniti.
const { mock, mockPhase, runCli } = require("./mujowin");

const RULES = [
  [/desktop|oobe.*done|setup.*complete/i, "ready"],
  [/install|unattend|oobe|setup/i, "installing"],
  [/download|pull|extract/i, "downloading"],
  [/qemu|seabios|boot/i, "starting"],
];

async function boot() {
  if (mock()) {
    const p = mockPhase();
    return { phase: p === "running" ? "ready" : p, detail: "mock", running: p === "running" };
  }
  let running = false;
  try {
    const ps = await runCli(["status", "--json"], 15000);
    running = JSON.parse(ps).some((c) => c.State === "running");
  } catch (_) { /* compose/ps greška → down */ }
  if (!running) return { phase: "down", detail: "", running: false };
  let logs = "";
  try { logs = await runCli(["logs"], 15000); } catch (_) { /* ignoriši */ }
  const lines = logs.split("\n").slice(-40).join("\n");
  for (const [re, phase] of RULES) {
    if (re.test(lines)) return { phase, detail: "heuristika iz zadnjih logova (best-effort)", running: true };
  }
  return { phase: "unknown", detail: "kontejner radi, faza se ne raspoznaje iz logova", running: true };
}

module.exports = { boot };
