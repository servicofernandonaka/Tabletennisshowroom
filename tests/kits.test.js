const test = require('node:test'), assert = require('node:assert/strict');
const K = require('../js/kits.js');

test('dados dos kits: fonte em todos, nada marcado como verificado, sem preço em R$ inventado', () => {
  assert.equal(K.KITS.length, 4);
  for (const k of K.KITS) {
    assert.equal(k.verificado, false); assert.ok(k.fontes.length >= 1 && k.fontes.every((f) => /^https:\/\//.test(f.u)), k.id);
    assert.ok(k.ressalvas.length >= 1, k.id + ' tem ressalvas'); assert.ok(!/R\$/.test(JSON.stringify(k)), k.id + ' sem preço em R$');
  }
  assert.equal(K.META.verificado, false);
});
test('só o que tem fonte única vira número: peso do Stiga Pro Carbon; divergentes ficam vazios', () => {
  assert.equal(K.byId('stiga-pro-carbon').peso, 159);
  for (const id of ['timo-boll-silver', 'timo-boll-gold', 'xiom-muv']) assert.equal(K.byId(id).peso, null, id);
});
test('recomendação editorial de kit', () => {
  const r = (o) => K.recommendKit({ grip: 'shakehand', goal: 'learn_control', body: 'standard_athletic', ...o }).kits.map((k) => k.id);
  assert.deepEqual(r({}), ['timo-boll-silver', 'timo-boll-gold']);
  assert.deepEqual(r({ goal: 'close_blocker' }), ['timo-boll-gold', 'timo-boll-silver']);
  assert.deepEqual(r({ goal: 'spin_attacker' }), ['stiga-pro-carbon', 'timo-boll-gold']);
  assert.deepEqual(r({ goal: 'competitive_step' }), ['stiga-pro-carbon', 'timo-boll-gold']);
  assert.deepEqual(r({ body: 'light_safe' }), ['xiom-muv', 'timo-boll-silver'], 'quem precisa de leveza vai para a série leve');
});
test('caneta: sem kit verificado, com orientação', () => {
  const o = K.recommendKit({ grip: 'penhold_rpb', goal: 'learn_control' });
  assert.deepEqual(o.kits, []); assert.match(o.note, /caneta/i);
});
test('link de compra: checkout com parâmetros, ou WhatsApp com a mensagem', () => {
  const kit = K.byId('stiga-pro-carbon');
  const c = K.buyUrl({ checkoutUrl: 'https://loja.exemplo/produto?x=1' }, kit, 'oi');
  assert.match(c, /^https:\/\/loja\.exemplo\/produto\?/); assert.match(c, /kit=stiga-pro-carbon/); assert.match(c, /x=1/);
  assert.equal(K.buyUrl({}, kit, 'oi'), 'https://wa.me/?text=oi');
  assert.equal(K.buyUrl({ whatsapp: '+55 (11) 99999-9999' }, kit, 'a b'), 'https://wa.me/5511999999999?text=a%20b');
  assert.match(decodeURIComponent(K.buyUrl({}, kit)), /Stiga Pro Carbon/);
});
