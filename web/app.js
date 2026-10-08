// MujoWinPC ploča: tema, jezik (bs/en), noVNC link, best-effort provjera porta.
(function () {
  "use strict";
  var root = document.documentElement;

  // Tema (default tamna).
  var themeBtn = document.getElementById("themeBtn");
  try {
    if (localStorage.getItem("mujo-theme") === "light") root.setAttribute("data-theme", "light");
  } catch (e) { /* privatni mod: ignoriši */ }
  function paintTheme() { themeBtn.textContent = root.getAttribute("data-theme") === "light" ? "🌙" : "☀️"; }
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("mujo-theme", next); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  // Jezik (default bs).
  var langBtn = document.getElementById("langBtn");
  var lang = "bs";
  try { lang = localStorage.getItem("mujo-lang") || "bs"; } catch (e) {}
  function paintLang() {
    document.querySelectorAll("[data-bs]").forEach(function (el) {
      el.textContent = lang === "bs" ? el.getAttribute("data-bs") : el.getAttribute("data-en");
    });
    document.documentElement.lang = lang;
    langBtn.textContent = lang === "bs" ? "EN" : "BS";
  }
  langBtn.addEventListener("click", function () {
    lang = lang === "bs" ? "en" : "bs";
    try { localStorage.setItem("mujo-lang", lang); } catch (e) {}
    paintLang();
  });
  paintLang();

  // noVNC link: isti host, port 8006 (ili ?vnc= za override).
  var params = new URLSearchParams(window.location.search);
  var vncPort = params.get("vnc") || "8006";
  var host = window.location.hostname || "localhost";
  var url = window.location.protocol + "//" + host + ":" + vncPort + "/";
  var link = document.getElementById("novncLink");
  link.href = url;
  document.getElementById("rdpHost").textContent = host + ":3389";

  // Best-effort provjera: da li noVNC odgovara (bez slanja podataka).
  var state = document.getElementById("vmState");
  function setState(cls, bs, en) {
    state.innerHTML = "";
    var dot = document.createElement("span");
    dot.className = "dot " + cls;
    state.appendChild(dot);
    var txt = document.createElement("span");
    txt.setAttribute("data-bs", bs);
    txt.setAttribute("data-en", en);
    txt.textContent = lang === "bs" ? bs : en;
    state.appendChild(txt);
  }
  var done = false;
  function finish(ok) {
    if (done) return; done = true;
    if (ok) setState("ok", "noVNC odgovara — Windows je vjerovatno podignut.", "noVNC answers — Windows is probably up.");
    else setState("bad", "noVNC ne odgovara — VM nije podignut ili se još boota.", "noVNC is not answering — the VM is down or still booting.");
  }
  try {
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); finish(false); }, 6000);
    fetch(url, { mode: "no-cors", signal: ctl.signal })
      .then(function () { clearTimeout(timer); finish(true); })
      .catch(function () { clearTimeout(timer); finish(false); });
  } catch (e) { finish(false); }
})();

// Live kontrola preko API-ja (Faza 2). Bez tokena se ništa ne šalje.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var defBase = window.location.protocol + "//" + (window.location.hostname || "localhost") + ":3001";
  var baseInput = $("apiBase"), tokenInput = $("apiToken");
  baseInput.value = params.get("api") || defBase;
  try { if (sessionStorage.getItem("mujo-api")) baseInput.value = sessionStorage.getItem("mujo-api"); } catch (e) {}
  var base = null, token = null, timer = null;
  try { token = sessionStorage.getItem("mujo-token"); } catch (e) {}
  if (token) tokenInput.value = token;

  function lang() { try { return localStorage.getItem("mujo-lang") || "bs"; } catch (e) { return "bs"; } }
  function t(bs, en) { return lang() === "bs" ? bs : en; }
  function paintPlaceholders() {
    document.querySelectorAll("[data-bs-ph]").forEach(function (el) {
      el.placeholder = lang() === "bs" ? el.getAttribute("data-bs-ph") : el.getAttribute("data-en-ph");
    });
  }
  function setLive(cls, msg) {
    $("liveState").innerHTML = "";
    var dot = document.createElement("span");
    dot.className = "dot " + cls;
    $("liveState").appendChild(dot);
    $("liveState").appendChild(document.createTextNode(msg));
  }
  function api(path, opts) {
    opts = opts || {};
    opts.headers = { Authorization: "Bearer " + token };
    return fetch(base + path, opts).then(function (r) {
      if (r.status === 401) throw new Error(t("Loš token (401).", "Bad token (401)."));
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function fmtGB(b) { return b == null ? "?" : (b / 1073741824).toFixed(1) + "G"; }
  function bar(label, used, total) {
    var pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return "<div>" + label + " (" + pct + "%)</div><div class='bar'><i style='width:" + pct + "%'></i></div>";
  }
  function refresh() {
    paintPlaceholders();
    api("/api/status").then(function (s) {
      setLive(s.running ? "ok" : "bad", s.running ? t("VM radi.", "VM is running.") : t("VM ne radi.", "VM is down."));
      ["btnUp", "btnDown", "btnRestart", "btnLogs"].forEach(function (id) { $(id).disabled = false; });
    }).catch(function (e) { setLive("bad", String(e.message || e)); });
    api("/api/boot").then(function (b) {
      $("bootPhase").textContent = t("Boot faza: ", "Boot phase: ") + b.phase + (b.detail ? " (" + b.detail + ")" : "");
    }).catch(function () {});
    api("/api/resources").then(function (r) {
      var h = r.host, used = (h.memTotal - h.memAvailable) || 0;
      $("resBars").innerHTML =
        bar(t("Host RAM ", "Host RAM ") + fmtGB(used) + " / " + fmtGB(h.memTotal), used, h.memTotal || 1) +
        "<div>" + t("Host disk slobodno: ", "Host disk free: ") + fmtGB(h.diskAvailable) + "</div>" +
        "<div>CPU: " + h.cpuCount + " / load " + (h.load1 || 0).toFixed(2) +
        " · VM profil " + r.vm.profile + " (RAM " + (r.vm.RAM_SIZE || "?") + ", CPU " + (r.vm.CPU_CORES || "?") + ", disk " + (r.vm.DISK_SIZE || "?") + ")</div>";
    }).catch(function () {});
  }
  function logs() {
    api("/api/logs?tail=100").then(function (l) { $("logView").textContent = l.logs || "—"; })
      .catch(function (e) { $("logView").textContent = String(e.message || e); });
  }
  $("apiConnect").addEventListener("click", function () {
    base = baseInput.value.replace(/\/$/, "");
    token = tokenInput.value;
    if (!token) { setLive("bad", t("Upiši token.", "Enter the token.")); return; }
    try { sessionStorage.setItem("mujo-token", token); sessionStorage.setItem("mujo-api", base); } catch (e) {}
    tokenInput.value = token;
    refresh(); logs();
    if (timer) clearInterval(timer);
    timer = setInterval(function () { refresh(); }, 5000);
  });
  $("apiDrop").addEventListener("click", function () {
    try { sessionStorage.removeItem("mujo-token"); } catch (e) {}
    token = null; tokenInput.value = "";
    if (timer) { clearInterval(timer); timer = null; }
    ["btnUp", "btnDown", "btnRestart", "btnLogs"].forEach(function (id) { $(id).disabled = true; });
    setLive("unknown", t("Nije povezano.", "Not connected."));
  });
  if (token) $("apiConnect").click();
  [["btnUp", "/api/up"], ["btnDown", "/api/down"], ["btnRestart", "/api/restart"]].forEach(function (pair) {
    $(pair[0]).addEventListener("click", function () {
      api(pair[1], { method: "POST" }).then(function () { refresh(); logs(); })
        .catch(function (e) { setLive("bad", String(e.message || e)); });
    });
  });
  $("btnLogs").addEventListener("click", logs);
})();
