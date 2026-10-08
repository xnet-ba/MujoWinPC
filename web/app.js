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
