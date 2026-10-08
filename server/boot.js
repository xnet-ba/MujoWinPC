"use strict";
// Boot faza: deterministički dio (kontejner radi/ne) + heuristika iz logova.
// Obrasci su uzeti iz STVARNOG dockur v6.06 loga (smoke test bez KVM-a):
// "Downloading Windows 10...", "Adding OEM files to image...",
// "Starting Windows for Docker v6.06...", "Windows started successfully...".
// Format se može promijeniti s verzijom image-a → i dalje best-effort.
const { mock, mockPhase, runCli } = require("./mujowin");

const RULES = [
  [/windows started successfully/i, "ready"],
  [/adding .*xml for automatic installation|adding drivers|adding oem files|creating overlay|writing overlay/i, "installing"],
  [/requesting windows|downloading windows/i, "downloading"],
  [/starting windows for docker|booting windows using qemu|bdsdxe/i, "starting"],
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
