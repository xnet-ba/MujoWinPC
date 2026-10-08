"use strict";
// Host resursi (stvarni podaci, ne mock) + VM profil iz profiles/*.env.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { ROOT } = require("./mujowin");

function activeProfile() {
  if (process.env.MUJO_PROFILE) return process.env.MUJO_PROFILE;
  try {
    const f = fs.readFileSync(path.join(ROOT, ".mujowin-profile"), "utf8").trim();
    if (f) return f;
  } catch (_) { /* nema fajla */ }
  return "standard";
}

function readProfileEnv(prof) {
  const out = {};
  try {
    for (const l of fs.readFileSync(path.join(ROOT, "profiles", `${prof}.env`), "utf8").split("\n")) {
      const m = l.match(/^(RAM_SIZE|CPU_CORES|DISK_SIZE)=(.+)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch (_) { /* nepoznat profil */ }
  return out;
}

function meminfo() {
  const out = {};
  try {
    for (const l of fs.readFileSync("/proc/meminfo", "utf8").split("\n")) {
      const m = l.match(/^(MemTotal|MemAvailable):\s+(\d+)/);
      if (m) out[m[1]] = Number(m[2]) * 1024;
    }
  } catch (_) { out.MemTotal = os.totalmem(); out.MemAvailable = os.freemem(); }
  return out;
}

function diskAvail() {
  return new Promise((resolve) => {
    execFile("df", ["-B1", ROOT], (err, stdout) => {
      if (err) return resolve(null);
      const parts = (stdout || "").trim().split("\n").pop().trim().split(/\s+/);
      resolve(parts.length >= 4 ? Number(parts[3]) : null);
    });
  });
}

async function resources() {
  const mem = meminfo();
  const prof = activeProfile();
  return {
    host: {
      memTotal: mem.MemTotal ?? null,
      memAvailable: mem.MemAvailable ?? null,
      cpuCount: os.cpus().length,
      load1: os.loadavg()[0],
      diskAvailable: await diskAvail(),
    },
    vm: { profile: prof, ...readProfileEnv(prof) },
  };
}

module.exports = { resources, activeProfile, readProfileEnv };
