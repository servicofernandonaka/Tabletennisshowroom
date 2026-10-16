const test = require('node:test'), assert = require('node:assert/strict');
const U = require('../js/userdata.js'), P = require('../js/products.js'), K = require('../js/packs.js');

test('dados do usuário: 20 borrachas e 30 lâminas, ids únicos, marcados como não verificados', () => {
  assert.equal(U.rubbers.length, 20); assert.equal(U.blades.length, 30);
  assert.equal(new Set(U.rubbers.map(r => r.id)).size, 20); assert.equal(new Set(U.blades.map(b => b.id)).size, 30);
  assert.equal(U.META.verificado, false);
  assert.ok(U.rubbers.every(r => r.origem === 'usuario' && r.cutG < r.uncutG && r.usd > 0));
});
test('valores de referência do JSON (Tenergy 05, Hurricane 3 Neo, Viscaria)', () => {
  const t = U.findRubber('butterfly-tenergy-05'); assert.deepEqual([t.esn, t.butterfly, t.uncutG, t.cutG, t.usd], [48, 36, 68, 48, 79.99]);
  const h = U.findRubber('dhs-neo-hurricane-3'); assert.deepEqual([h.dhs, h.esn, h.throwAngle, h.dwell], [39, 52, 'Low-Medium', 'Very High']);
  const v = U.findBlade('butterfly-viscaria'); assert.deepEqual([v.weightG, v.plies, v.flexibility, v.usd], [87, 7, 'Medium-Stiff', 199.99]);
});
test('catalogId aponta sempre para um item existente em products.js', () => {
  U.rubbers.concat(U.blades).forEach(x => { if (x.catalogId) assert.ok(P.find(x.catalogId), x.catalogId); });
});
test('id com erro de digitação preservado em idOriginal; ids de lâmina divergentes do nome sinalizados', () => {
  assert.equal(U.rubbers.find(r => r.id === 'bluestorm-z1').idOriginal, 'bluesstorm-z1');
  assert.ok(U.blades.find(b => b.id === 'xiom-vegas-hx').idMismatch); assert.ok(!U.findBlade('butterfly-viscaria').idMismatch);
});
test('notesForPack só avisa e não altera pesos dos packs', () => {
  const p4 = K.packs.find(p => p.num === 4);
  assert.equal(p4.fh.rawSheetWeight, 73);
  assert.ok(p4.verificar.some(v => /^Dados do usuário: .*Rakza 7 tem 46 g cortada/.test(v)));
  const p5 = K.packs.find(p => p.num === 5);
  assert.equal(p5.blade.weight, 81); assert.ok(p5.verificar.some(v => /YEO.*85 g.*81 g/.test(v)));
  assert.deepEqual(U.notesForPack({ blade: { catalogId: 'stiga-allround-classic', weight: 80, nome: 'x' }, fh: null, bh: null }), []);
});
