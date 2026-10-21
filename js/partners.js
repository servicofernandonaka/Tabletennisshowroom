/* Área de Parceiros B2B: modal executivo aberto pelo rodapé. `buildLinks` é puro (testável no Node); o resto é DOM.
   Os contatos vêm de MW_CONFIG (partnerEmail, partnerWhatsapp); nada é enviado a lugar nenhum além do link que o visitante clicar. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.MasterWangPartners = factory(root);
})(typeof self !== 'undefined' ? self : this, function (win) {
  var SUBJECT = 'Proposta comercial: parceria com o Guia da Raquete';
  var BODY = 'Olá! Represento um e-commerce de tênis de mesa e gostaria de receber a proposta comercial de parceria com o Guia da Raquete.\n\nLoja/empresa:\nSite:\nContato:';
  var WA_TEXT = 'Olá! Represento um e-commerce de tênis de mesa e gostaria de receber a proposta comercial de parceria com o Guia da Raquete.';
  /** {mail, wa}: mailto com assunto e corpo; wa.me só com dígitos. Sem contato configurado, o link ainda abre o app (o parceiro informa o destinatário). */
  function buildLinks(cfg) {
    cfg = cfg || {};
    var email = String(cfg.partnerEmail || '').trim();
    if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) email = '';
    var digits = String(cfg.partnerWhatsapp || '').replace(/\D/g, '');
    return { mail: 'mailto:' + encodeURIComponent(email).replace(/%40/g, '@') + '?subject=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(BODY),
      wa: 'https://wa.me/' + digits + '?text=' + encodeURIComponent(WA_TEXT), hasMail: !!email, hasWa: !!digits };
  }
  var api = { buildLinks: buildLinks, SUBJECT: SUBJECT };
  if (!win) return api;

  var doc = win.document, dlg = doc.getElementById('partners'), openBtn = doc.getElementById('ptOpen');
  if (!dlg || !openBtn) return api;
  var last = null;
  function refreshLinks() { var l = buildLinks(win.MW_CONFIG); doc.getElementById('ptMail').setAttribute('href', l.mail); doc.getElementById('ptWa').setAttribute('href', l.wa); }
  function open() {
    last = doc.activeElement; refreshLinks();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    doc.documentElement.classList.add('dlg-open');
    var c = doc.getElementById('ptClose'); if (c) c.focus({ preventScroll: true });
  }
  function close() { if (typeof dlg.close === 'function') { if (dlg.open) dlg.close(); } else dlg.removeAttribute('open'); }
  dlg.addEventListener('close', function () { doc.documentElement.classList.remove('dlg-open'); if (last && last.focus) last.focus({ preventScroll: true }); });
  openBtn.addEventListener('click', open);
  doc.getElementById('ptClose').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });   // clique no fundo escurecido
  dlg.addEventListener('cancel', function () { doc.documentElement.classList.remove('dlg-open'); });
  return api;
});
