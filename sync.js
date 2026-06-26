/* === SYNC CHR — Firebase RTDB (sincronização aberta entre aparelhos) ===
   Cada painel sincroniza APENAS a sua própria chave de localStorage, num nó
   próprio do banco. Páginas sem mapeamento (index, vendas) são ignoradas.
   Inclua <script src="sync.js"></script> no <head>, ANTES do script do painel. */
(function () {
  var BASE = "https://jornada-v8-default-rtdb.firebaseio.com/";
  var MAP = {
    "rotas.html":    { key: "chr_rotas_db_v1",    node: "ambiente-chr-rotas" },
    "atacados.html": { key: "chr_atacados_db_v2", node: "ambiente-chr-atacados" },
    "carteira.html": { key: "chr_carteira_ov_v3", node: "ambiente-chr-carteira" }
  };
  var page = (location.pathname.split("/").pop() || "").toLowerCase();
  var cfg = MAP[page];
  if (!cfg) return;
  var KEY = cfg.key;
  var URL = BASE + cfg.node + ".json";

  // PULL inicial (síncrono): traz o estado remoto antes do painel iniciar.
  try {
    var x = new XMLHttpRequest();
    x.open("GET", URL, false);
    x.send(null);
    if (x.status >= 200 && x.status < 300 && x.responseText && x.responseText !== "null") {
      var rem = JSON.parse(x.responseText);
      if (rem != null) localStorage.setItem(KEY, rem);
    }
  } catch (e) {}

  var origSet = localStorage.setItem.bind(localStorage);
  function push() {
    try {
      var v = localStorage.getItem(KEY);
      if (v == null) return;
      var p = new XMLHttpRequest();
      p.open("PUT", URL, true);
      p.setRequestHeader("Content-Type", "application/json");
      p.send(JSON.stringify(v));
    } catch (e) {}
  }

  // PUSH ao alterar (agrupando mudanças)
  var tmr = null;
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (k === KEY) { clearTimeout(tmr); tmr = setTimeout(push, 700); }
  };

  // semeia o remoto com o estado atual (cobre o primeiro uso)
  setTimeout(push, 1800);

  // PULL automático a cada 15s: traz alterações feitas em outro aparelho
  setInterval(function () {
    if (document.hidden) return;
    var ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
    try {
      var g = new XMLHttpRequest();
      g.open("GET", URL, true);
      g.onload = function () {
        if (g.status >= 200 && g.status < 300 && g.responseText && g.responseText !== "null") {
          try {
            var rem = JSON.parse(g.responseText);
            if (rem != null && rem !== localStorage.getItem(KEY)) {
              origSet(KEY, rem);
              location.reload();
            }
          } catch (e) {}
        }
      };
      g.send(null);
    } catch (e) {}
  }, 15000);
})();
