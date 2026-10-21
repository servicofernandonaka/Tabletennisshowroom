const test = require('node:test'), assert = require('node:assert/strict');
const F = require('../js/funnel.js'), Sh = require('../js/share.js');

test('WhatsApp: número opcional (só dígitos) e retrocompatível', () => {
  assert.equal(Sh.buildWhatsAppUrl('oi'), 'https://wa.me/?text=oi');
  assert.equal(Sh.buildWhatsAppUrl('oi', '+55 (11) 99999-9999'), 'https://wa.me/5511999999999?text=oi');
  assert.equal(Sh.buildWhatsAppUrl('a b', ''), 'https://wa.me/?text=a%20b');
});
