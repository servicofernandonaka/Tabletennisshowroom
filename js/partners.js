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
  /* ---------- Formulário de cadastro de parceiros (lógica pura) ---------- */
  var PLATFORMS = ['Shopify', 'Tray', 'Nuvemshop', 'WooCommerce', 'Outra'];
  var EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
  var clean = function (v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 120); };
  /** {ok, errors:{campo:mensagem}, data}. Responsável, loja, e-mail e telefone são obrigatórios; plataforma é opcional (e só aceita a lista). */
  function validate(raw) {
    raw = raw || {};
    var d = { nome: clean(raw.nome, 100), loja: clean(raw.loja, 120), email: clean(raw.email, 120).toLowerCase(), telefone: clean(raw.telefone, 30), plataforma: clean(raw.plataforma, 30) };
    var e = {}, digits = d.telefone.replace(/\D/g, '');
    if (d.nome.length < 2) e.nome = 'Informe o nome do responsável.';
    if (d.loja.length < 2) e.loja = 'Informe o nome da loja ou e-commerce.';
    if (!EMAIL_RE.test(d.email)) e.email = 'Informe um e-mail corporativo válido (ex.: nome@sualoja.com.br).';
    if (!/^[0-9+()\-.\s]+$/.test(d.telefone) || digits.length < 10 || digits.length > 15) e.telefone = 'Informe um WhatsApp ou telefone com DDD (10 a 15 dígitos).';
    if (d.plataforma && PLATFORMS.indexOf(d.plataforma) < 0) d.plataforma = '';
    return { ok: Object.keys(e).length === 0, errors: e, data: d };
  }
  /** Canal de entrega disponível: endpoint (entrega real e confirmada) > e-mail > WhatsApp > nenhum. */
  function channel(cfg) {
    cfg = cfg || {};
    if (/^https:\/\//i.test(String(cfg.partnerFormUrl || ''))) return 'endpoint';
    var l = buildLinks(cfg);
    return l.hasMail ? 'email' : l.hasWa ? 'whatsapp' : 'none';
  }
  function summary(d) {
    return ['Cadastro de parceiro: Guia da Raquete', 'Responsável: ' + d.nome, 'Loja/E-commerce: ' + d.loja, 'E-mail: ' + d.email, 'WhatsApp/Telefone: ' + d.telefone, 'Plataforma: ' + (d.plataforma || 'não informada')].join('\n');
  }
  function mailtoFor(cfg, d) {
    var l = buildLinks(cfg);
    return l.mail.replace(/\?subject=.*$/, '') + '?subject=' + encodeURIComponent('Cadastro de parceiro: ' + d.loja) + '&body=' + encodeURIComponent(summary(d));
  }
  function waFor(cfg, d) { return 'https://wa.me/' + String((cfg && cfg.partnerWhatsapp) || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(summary(d)); }
  function payload(cfg, d, now, page) {
    var out = {}; var ex = (cfg && cfg.partnerFormExtra) || {}; Object.keys(ex).forEach(function (k) { out[k] = ex[k]; });
    out.nome = d.nome; out.loja = d.loja; out.email = d.email; out.telefone = d.telefone; out.plataforma = d.plataforma || '';
    out.origem = 'guia-raquete/parceiros'; out.pagina = String(page || '').split('#')[0]; out.enviadoEm = (now || new Date()).toISOString();
    return out;
  }
  function successText(cfg) {
    var sla = clean(cfg && cfg.partnerSla, 40);
    return 'Proposta recebida com sucesso! Nossa diretoria comercial entrará em contato ' + (sla ? 'em até ' + sla : 'em breve') + '.';
  }
  var api = { buildLinks: buildLinks, SUBJECT: SUBJECT, PLATFORMS: PLATFORMS, validate: validate, channel: channel, summary: summary, mailtoFor: mailtoFor, waFor: waFor, payload: payload, successText: successText };
  if (!win) return api;

  var doc = win.document, dlg = doc.getElementById('partners'), openBtn = doc.getElementById('ptOpen');
  if (!dlg || !openBtn) return api;

  /* ---------- Formulário: DOM ---------- */
  var $ = function (id) { return doc.getElementById(id); };
  var form = $('ptForm'), info = $('ptInfo'), fview = $('ptFormView'), statusEl = $('ptStatus'), done = $('ptDone'), sendBtn = $('ptSend'), busy = false;
  var FIELDS = { nome: 'ptNome', loja: 'ptLoja', email: 'ptEmail', telefone: 'ptTel' }, ERRS = { nome: 'ptNomeErr', loja: 'ptLojaErr', email: 'ptEmailErr', telefone: 'ptTelErr' };
  var reduced = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  api.last = null;
  function showView(name) {
    var f = name === 'form';
    info.hidden = f; fview.hidden = !f; dlg.scrollTop = 0;
    if (f) { $('ptFormHead').hidden = false; form.hidden = false; done.hidden = true; statusEl.hidden = true; var n = $('ptNome'); if (n) n.focus({ preventScroll: true }); }
  }
  function clearErrors() { Object.keys(FIELDS).forEach(function (k) { var i = $(FIELDS[k]); i.removeAttribute('aria-invalid'); $(ERRS[k]).textContent = ''; }); }
  function setStatus(kind, html) { statusEl.className = 'pt-status pt-' + kind; statusEl.innerHTML = html; statusEl.hidden = false; }
  function setBusy(on) { busy = on; sendBtn.disabled = on; sendBtn.classList.toggle('is-busy', on); sendBtn.querySelector('.pt-send-t').textContent = on ? 'Enviando…' : 'Enviar Proposta'; form.setAttribute('aria-busy', on ? 'true' : 'false'); }
  function fallbackLinks(d) {   // alternativas quando a entrega automática falha
    var c = win.MW_CONFIG || {}, l = buildLinks(c), out = [];
    if (l.hasMail) out.push('<a class="btn-cyan" href="' + mailtoFor(c, d).replace(/"/g, '&quot;') + '">✉️ Enviar por e-mail</a>');
    if (l.hasWa) out.push('<a class="btn-cyan" target="_blank" rel="noopener noreferrer" href="' + waFor(c, d).replace(/"/g, '&quot;') + '">💬 Enviar por WhatsApp</a>');
    return out.length ? '<div class="pt-fb">' + out.join('') + '</div>' : '';
  }
  function finishOk(title, text) {   // some o formulário em fade, limpa os campos e mostra a confirmação
    var swap = function () {
      form.reset(); clearErrors(); form.hidden = true; statusEl.hidden = true; $('ptFormHead').hidden = true;
      $('ptDoneTitle').textContent = title; $('ptDoneText').textContent = text; done.hidden = false; done.classList.add('pt-in');
      var c = $('ptDoneClose'); if (c) c.focus({ preventScroll: true });
    };
    if (reduced) swap(); else { form.classList.add('pt-fade'); setTimeout(function () { form.classList.remove('pt-fade'); swap(); }, 260); }
  }
  function onSubmit(ev) {
    ev.preventDefault(); if (busy) return;
    clearErrors(); statusEl.hidden = true;
    var raw = { nome: $('ptNome').value, loja: $('ptLoja').value, email: $('ptEmail').value, telefone: $('ptTel').value, plataforma: $('ptPlat').value };
    var v = validate(raw);
    if (!v.ok) {
      var first = null;
      Object.keys(v.errors).forEach(function (k) { var i = $(FIELDS[k]); i.setAttribute('aria-invalid', 'true'); $(ERRS[k]).textContent = v.errors[k]; if (!first) first = i; });
      if (first) first.focus(); return;
    }
    if ($('ptHp').value) { finishOk('Proposta recebida', successText(win.MW_CONFIG)); return; }   // robô: preencheu a isca; ignora em silêncio
    var cfg = win.MW_CONFIG || {}, ch = channel(cfg), d = v.data;
    if (ch === 'endpoint') {
      setBusy(true);
      var ctl = typeof win.AbortController === 'function' ? new win.AbortController() : null, timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : null;
      win.fetch(cfg.partnerFormUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload(cfg, d, new Date(), win.location.href)), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); api.last = { channel: 'endpoint', ok: true }; finishOk('Proposta enviada', successText(cfg)); })
        .catch(function () { api.last = { channel: 'endpoint', ok: false }; setStatus('err', '<b>Não conseguimos enviar agora.</b> Seus dados continuam no formulário: tente de novo em instantes' + (fallbackLinks(d) ? ' ou use uma das alternativas abaixo.' : '.') + fallbackLinks(d)); })
        .then(function () { if (timer) clearTimeout(timer); setBusy(false); });
      return;
    }
    if (ch === 'email') {
      var url = mailtoFor(cfg, d); api.last = { channel: 'email', ok: true, url: url };
      win.location.href = url;
      finishOk('E-mail preparado', 'Abrimos o seu aplicativo de e-mail com a proposta pronta: falta só enviar. Se nada abriu, escreva para ' + String(cfg.partnerEmail).trim() + '.');
      return;
    }
    if (ch === 'whatsapp') {
      var wurl = waFor(cfg, d); api.last = { channel: 'whatsapp', ok: true, url: wurl };
      win.open(wurl, '_blank', 'noopener');
      finishOk('WhatsApp preparado', 'Abrimos o WhatsApp com a proposta pronta: falta só enviar a mensagem.');
      return;
    }
    api.last = { channel: 'none', ok: false };
    if (win.console && console.warn) console.warn('[Guia da Raquete] Cadastro de parceiros sem canal de entrega: configure partnerFormUrl, partnerEmail ou partnerWhatsapp em js/config.js.');
    setStatus('err', '<b>O recebimento de propostas ainda não está ativo neste site.</b> Seus dados continuam no formulário. Tente novamente mais tarde.');
  }
  if (form) {
    form.addEventListener('submit', onSubmit);
    form.addEventListener('input', function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute('aria-invalid')) { var v = validate({ nome: $('ptNome').value, loja: $('ptLoja').value, email: $('ptEmail').value, telefone: $('ptTel').value }); var k = Object.keys(FIELDS).filter(function (x) { return FIELDS[x] === t.id; })[0]; if (k && !v.errors[k]) { t.removeAttribute('aria-invalid'); $(ERRS[k]).textContent = ''; } } });
    $('ptStartForm').addEventListener('click', function () { showView('form'); });
    $('ptBack').addEventListener('click', function () { showView('info'); });
    $('ptDoneClose').addEventListener('click', function () { close(); });
  }
  var last = null;
  function refreshLinks() { var l = buildLinks(win.MW_CONFIG); doc.getElementById('ptMail').setAttribute('href', l.mail); doc.getElementById('ptWa').setAttribute('href', l.wa); }
  function open() {
    last = doc.activeElement; refreshLinks();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    doc.documentElement.classList.add('dlg-open');
    var c = doc.getElementById('ptClose'); if (c) c.focus({ preventScroll: true });
  }
  function close() { if (typeof dlg.close === 'function') { if (dlg.open) dlg.close(); } else dlg.removeAttribute('open'); }
  dlg.addEventListener('close', function () { doc.documentElement.classList.remove('dlg-open'); if (form) { form.reset(); clearErrors(); form.hidden = false; statusEl.hidden = true; done.hidden = true; setBusy(false); showView('info'); } if (last && last.focus) last.focus({ preventScroll: true }); });
  openBtn.addEventListener('click', open);
  doc.getElementById('ptClose').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });   // clique no fundo escurecido
  dlg.addEventListener('cancel', function () { doc.documentElement.classList.remove('dlg-open'); });
  return api;
});
