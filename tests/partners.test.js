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
