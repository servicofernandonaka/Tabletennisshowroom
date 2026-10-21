const test = require('node:test'), assert = require('node:assert/strict');
const P = require('../js/partners.js');

test('links de proposta: e-mail válido vira mailto com assunto e corpo; WhatsApp só com dígitos', () => {
  const l = P.buildLinks({ partnerEmail: 'parcerias@exemplo.com.br', partnerWhatsapp: '+55 (11) 99999-9999' });
  assert.match(l.mail, /^mailto:parcerias@exemplo\.com\.br\?subject=/); assert.match(decodeURIComponent(l.mail), /Proposta comercial/);
  assert.match(decodeURIComponent(l.mail), /e-commerce de tênis de mesa/); assert.equal(l.hasMail, true);
  assert.match(l.wa, /^https:\/\/wa\.me\/5511999999999\?text=/); assert.equal(l.hasWa, true);
});
test('sem contato configurado o link ainda funciona (destinatário em branco) e sinaliza ausência', () => {
  const l = P.buildLinks({}); assert.match(l.mail, /^mailto:\?subject=/); assert.equal(l.hasMail, false);
  assert.match(l.wa, /^https:\/\/wa\.me\/\?text=/); assert.equal(l.hasWa, false);
  assert.equal(P.buildLinks().hasMail, false);
});
test('e-mail suspeito é descartado (nada de injeção de cabeçalhos ou esquemas estranhos)', () => {
  for (const bad of ['a@b', 'x y@z.com', 'a@b.com\nBcc:x@y.com', 'javascript:alert(1)', '<a@b.com>', '"a"@b.com'])
    assert.equal(P.buildLinks({ partnerEmail: bad }).hasMail, false, bad);
});

const ok = { nome: 'Maria Souza', loja: 'Loja Ping Pong', email: 'maria@pingpong.com.br', telefone: '(11) 98888-7777', plataforma: 'Shopify' };
test('formulário: dados válidos passam e saem limpos; plataforma é opcional', () => {
  const r = P.validate(ok); assert.equal(r.ok, true); assert.deepEqual(r.errors, {});
  assert.equal(P.validate({ ...ok, plataforma: '' }).ok, true);
  assert.equal(P.validate({ ...ok, email: '  MARIA@PingPong.com.br ' }).data.email, 'maria@pingpong.com.br');
  assert.equal(P.validate({ ...ok, nome: '  Maria\n\tSouza  ' }).data.nome, 'Maria Souza');
});
test('formulário: cada campo obrigatório gera sua mensagem em português', () => {
  const r = P.validate({});
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'loja', 'nome', 'telefone']); assert.equal(r.ok, false);
  assert.match(r.errors.email, /e-mail/i); assert.match(r.errors.telefone, /DDD/);
  for (const bad of ['a@b', 'x y@z.com', 'sem-arroba.com', 'a@b.com\nBcc:x@y.com']) assert.ok(P.validate({ ...ok, email: bad }).errors.email, bad);
  for (const bad of ['123', 'abc12345678', '1'.repeat(16)]) assert.ok(P.validate({ ...ok, telefone: bad }).errors.telefone, bad);
  for (const good of ['11988887777', '+55 (11) 98888-7777', '11 3333-4444']) assert.equal(P.validate({ ...ok, telefone: good }).errors.telefone, undefined, good);
});
test('formulário: plataforma fora da lista é descartada (nada de texto livre)', () => {
  assert.equal(P.validate({ ...ok, plataforma: '<script>' }).data.plataforma, '');
  for (const pl of ['Shopify', 'Tray', 'Nuvemshop', 'WooCommerce', 'Outra']) assert.equal(P.validate({ ...ok, plataforma: pl }).data.plataforma, pl);
});
test('canal de entrega: endpoint HTTPS > e-mail > WhatsApp > nenhum', () => {
  assert.equal(P.channel({ partnerFormUrl: 'https://formspree.io/f/abc', partnerEmail: 'a@b.com' }), 'endpoint');
  assert.equal(P.channel({ partnerFormUrl: 'http://inseguro.exemplo', partnerEmail: 'a@b.com' }), 'email', 'endpoint sem HTTPS é ignorado');
  assert.equal(P.channel({ partnerEmail: 'a@b.com', partnerWhatsapp: '5511999999999' }), 'email');
  assert.equal(P.channel({ partnerWhatsapp: '5511999999999' }), 'whatsapp');
  assert.equal(P.channel({}), 'none'); assert.equal(P.channel(), 'none');
});
test('payload e textos: campos fixos extras, origem, data; mailto e WhatsApp com o resumo', () => {
  const d = P.validate(ok).data, now = new Date('2026-10-21T12:00:00Z');
  const pl = P.payload({ partnerFormExtra: { access_key: 'k1' } }, d, now, 'https://x.com/a/#b');
  assert.deepEqual(pl, { access_key: 'k1', nome: 'Maria Souza', loja: 'Loja Ping Pong', email: 'maria@pingpong.com.br', telefone: '(11) 98888-7777', plataforma: 'Shopify', origem: 'guia-raquete/parceiros', pagina: 'https://x.com/a/', enviadoEm: '2026-10-21T12:00:00.000Z' });
  const m = P.mailtoFor({ partnerEmail: 'parcerias@x.com' }, d); assert.match(m, /^mailto:parcerias@x\.com\?subject=/); assert.match(decodeURIComponent(m), /Loja Ping Pong/); assert.match(decodeURIComponent(m), /Plataforma: Shopify/);
  assert.match(P.waFor({ partnerWhatsapp: '+55 11 99999-9999' }, d), /^https:\/\/wa\.me\/5511999999999\?text=/);
  assert.equal(P.successText({}), 'Proposta recebida com sucesso! Nossa diretoria comercial entrará em contato em breve.');
  assert.equal(P.successText({ partnerSla: '24 horas' }), 'Proposta recebida com sucesso! Nossa diretoria comercial entrará em contato em até 24 horas.');
});
