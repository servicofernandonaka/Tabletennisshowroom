const test = require('node:test');
const assert = require('node:assert');
const R = require('../js/rating.js');
const P = require('../js/products.js');

test('normalização: pontos de referência das fórmulas do guia', () => {
  assert.equal(R.norm.compressed(7), 0);
  assert.equal(R.norm.compressed(8.5), 5);
  assert.equal(R.norm.compressed(10), 10);
  assert.equal(R.norm.compressed(6), 0);      // limitado a 0
  assert.equal(R.norm.compressed(11), 10);    // limitado a 10
  assert.equal(R.norm.bladeSpeed(6), 0);
  assert.equal(R.norm.bladeSpeed(8), 5);
  assert.equal(R.norm.bladeSpeed(10), 10);
  assert.equal(R.norm.durability(5), 0);
  assert.equal(R.norm.durability(7), 4);
  assert.equal(R.norm.compressed(9.31), 7.7);  // arredonda a 1 casa
  assert.equal(R.norm.compressed(7.15), 0.5);  // meio para cima
});
test('confiança por número de avaliações', () => {
  assert.equal(R.confidence(381), 'alta'); assert.equal(R.confidence(50), 'alta');
  assert.equal(R.confidence(49), 'média'); assert.equal(R.confidence(20), 'média');
  assert.equal(R.confidence(19), 'baixa'); assert.equal(R.confidence(10), 'baixa');
  assert.equal(R.confidence(9), 'sem dados'); assert.equal(R.confidence(null), 'sem dados');
  assert.equal(R.minConfidence(['alta', 'baixa', 'média']), 'baixa');
});
test('combine: velocidade/controle 40/30/30 e spin/arco/durabilidade pela média das borrachas', () => {
  const b = { vel: 8, ctrl: 6 }, f = { vel: 7, ctrl: 5, spin: 8, arco: 6, dur: 4 }, k = { vel: 5, ctrl: 7, spin: 6, arco: 4, dur: 6 };
  assert.deepStrictEqual(R.combine(b, f, k), { velocidade: 6.8, controle: 6, spin: 7, arco: 5, durabilidade: 5 });
  assert.equal(R.combine(b, f, { ...k, arco: null }), null);
});
test('integridade do catálogo: ids únicos, notas 0-10, confiança coerente com n', () => {
  const all = [...P.blades, ...P.rubbers, ...P.pips];
  const ids = new Set(all.map((x) => x.id));
  assert.equal(ids.size, all.length, 'ids duplicados');
  for (const x of all) {
    for (const k of ['vel', 'ctrl', 'rig', 'dur', 'cons', 'spin', 'arco', 'geral']) {
      if (x[k] != null) assert.ok(x[k] >= 0 && x[k] <= 10, `${x.id}.${k}=${x[k]}`);
    }
    assert.equal(x.confianca, R.confidence(x.n), x.id);
  }
});
test('produtos descontinuados não ficam como ativos e radar só com dados completos', () => {
  assert.notEqual(P.find('butterfly-joo-se-hyuk').status, 'ativo');
  assert.notEqual(P.find('butterfly-feint-ag').status, 'ativo');
  const r = P.find('butterfly-tenergy-05'), v = P.find('butterfly-viscaria');
  const c = R.combine(v, r, P.find('butterfly-dignics-05'));
  assert.ok(c && Object.values(c).every((x) => x >= 0 && x <= 10));
  assert.equal(R.combine(P.find('butterfly-diode-pro'), r, r), null);
});
