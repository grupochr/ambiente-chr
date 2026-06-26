/* Gate desativado — painel de acesso livre (sem senha).
   Mantém um stub de window.chrToken para compatibilidade com páginas
   que ainda o chamam. */
(function () {
  try { window.chrToken = function () { return ""; }; } catch (e) {}
})();
