/* =====================================================================
   GATE CHR — porta de entrada com senha unica (verificada no servidor)
   Inclua <script src="gate.js"></script> no <head> de cada pagina.
   ===================================================================== */
(function () {
  var KEY = "chr_pass";
  try { document.documentElement.style.visibility = "hidden"; } catch (e) {}

  function show() { try { document.documentElement.style.visibility = "visible"; } catch (e) {} }
  function authedNow() { try { window.dispatchEvent(new Event("chr-auth")); } catch (e) {} }

  function buildOverlay() {
    var o = document.createElement("div");
    o.id = "chrGate";
    o.innerHTML =
      '<div class="chrgate-box">' +
      '  <div class="chrgate-logo">CHR Representacao</div>' +
      '  <div class="chrgate-sub">Acesso restrito - informe a senha</div>' +
      '  <input id="chrGateInput" type="password" placeholder="Senha" autocomplete="current-password">' +
      '  <button id="chrGateBtn">Entrar</button>' +
      '  <div id="chrGateErr" class="chrgate-err"></div>' +
      "</div>";
    var css = document.createElement("style");
    css.textContent =
      "#chrGate{position:fixed;inset:0;z-index:999999;background:linear-gradient(135deg,#1f5fae,#16467f);" +
      "display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}" +
      ".chrgate-box{background:#fff;border-radius:16px;padding:30px 28px;width:320px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center}" +
      ".chrgate-logo{font-size:19px;font-weight:800;color:#16467f}" +
      ".chrgate-sub{font-size:13px;color:#6b7785;margin:6px 0 18px}" +
      "#chrGateInput{width:100%;padding:12px 14px;border:1px solid #d9e0e8;border-radius:10px;font-size:15px;margin-bottom:12px}" +
      "#chrGateInput:focus{outline:none;border-color:#1f5fae}" +
      "#chrGateBtn{width:100%;padding:12px;border:none;border-radius:10px;background:#1f5fae;color:#fff;font-weight:700;font-size:15px;cursor:pointer}" +
      "#chrGateBtn:hover{background:#16467f}" +
      ".chrgate-err{color:#dc2626;font-size:13px;margin-top:10px;min-height:16px;font-weight:600}";
    document.head.appendChild(css);
    document.body.appendChild(o);
    show();
    var inp = document.getElementById("chrGateInput");
    var btn = document.getElementById("chrGateBtn");
    var err = document.getElementById("chrGateErr");
    inp.focus();
    function tryPass(p) {
      if (!p) { err.textContent = "Digite a senha."; return; }
      err.textContent = "Verificando...";
      fetch("api.php?action=auth&token=" + encodeURIComponent(p))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok) {
            try { sessionStorage.setItem(KEY, p); } catch (e) {}
            var g = document.getElementById("chrGate");
            if (g) g.remove();
            authedNow();
          } else {
            err.textContent = "Senha incorreta.";
            inp.select();
          }
        })
        .catch(function () { err.textContent = "Nao foi possivel verificar (servidor offline)."; });
    }
    btn.onclick = function () { tryPass(inp.value); };
    inp.onkeydown = function (e) { if (e.key === "Enter") tryPass(inp.value); };
  }

  function init() {
    if (location.protocol === "file:") { show(); authedNow(); return; }
    var have = null;
    try { have = sessionStorage.getItem(KEY); } catch (e) {}
    if (have) { show(); authedNow(); return; }
    buildOverlay();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);

  window.chrToken = function () {
    try { return sessionStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  };
})();
