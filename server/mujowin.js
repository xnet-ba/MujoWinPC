"use strict";
// Pozivi mujowin CLI-ja + mock mode (bez VM-a, za razvoj na mašini bez KVM-a).
const { execFile } = require("child_process");
const path = require("path");

const ROOT = process.env.MUJO_ROOT_OVERRIDE || path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "scripts", "mujowin");
const MOCK = process.env.MUJO_MOCK === "1";
const T0 = Date.now();

function mock() { return MOCK; }

// Simulirani boot u mocku: 0-20s starting, 20-60s installing, poslije running.
function mockPhase() {
  const s = (Date.now() - T0) / 1000;
  if (s < 20) return "starting";
  if (s < 60) return "installing";
  return "running";
}

function mockStatus() {
  return { running: mockPhase() === "running", phase: mockPhase(), profile: "standard", version: "11", mock: true };
}

function mockLogs() {
  const p = mockPhase();
  return [`[mock] t+${Math.round((Date.now() - T0) / 1000)}s phase=${p}`, "[mock] QEMU starting…", "[mock] Windows setup…", "[mock] desktop ready (pretend-log)"].join("\n");
}

function runCli(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    execFile(CLI, args, { timeout: timeoutMs || 60000, env: process.env }, (err, stdout, stderr) => {
      if (err) reject(new Error(((stdout || "") + "\n" + (stderr || "")).trim().slice(-2000) || err.message));
      else resolve((stdout || "").trim().slice(-8000));
    });
  });
}

module.exports = { ROOT, CLI, mock, mockPhase, mockStatus, mockLogs, runCli };
