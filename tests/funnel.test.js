const test = require('node:test'), assert = require('node:assert/strict');
const F = require('../js/funnel.js'), Sh = require('../js/share.js');

test('estágio inicial do funil', () => {
  assert.equal(F.initialStage({ hash: '', search: '', unlocked: false }), 'landing');
  assert.equal(F.initialStage({ hash: '#topo', search: '', unlocked: false }), 'landing');
  assert.equal(F.initialStage({ hash: '#wizard', search: '', unlocked: false }), 'quiz');
  assert.equal(F.initialStage({ hash: '#oficina', search: '', unlocked: false }), 'explore', 'link direto para uma seção abre o site completo');
  assert.equal(F.initialStage({ hash: '', search: '?full=1', unlocked: false }), 'explore');
  assert.equal(F.initialStage({ hash: '', search: '?a=1&full=1', unlocked: false }), 'explore');
  assert.equal(F.initialStage({ hash: '', search: '?full=10', unlocked: false }), 'landing');
  assert.equal(F.initialStage({ hash: '', search: '', unlocked: true }), 'explore', 'quem já fez o diagnóstico volta ao site completo');
  assert.equal(F.initialStage({ hash: '#wizard', search: '', unlocked: true }), 'explore');
});
test('WhatsApp: número opcional (só dígitos) e retrocompatível', () => {
  assert.equal(Sh.buildWhatsAppUrl('oi'), 'https://wa.me/?text=oi');
  assert.equal(Sh.buildWhatsAppUrl('oi', '+55 (11) 99999-9999'), 'https://wa.me/5511999999999?text=oi');
  assert.equal(Sh.buildWhatsAppUrl('a b', ''), 'https://wa.me/?text=a%20b');
});
