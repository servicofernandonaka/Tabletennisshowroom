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

const E = require('../js/engine.js');
test('estrutura: tipo, esponja e classe vêm só de fonte ou regra documentada', () => {
  const g = (id) => P.find(id);
  assert.equal(g('butterfly-tenergy-05').type, 'tensor');
  assert.equal(g('butterfly-tenergy-05-fx').sponge, 'soft');     // BF 32
  assert.equal(g('butterfly-tenergy-05').sponge, 'medium');      // BF 36
  assert.equal(g('butterfly-dignics-09c').sponge, 'hard');       // BF 44
  assert.equal(g('andro-rasanter-r42').sponge, 'soft');          // 42 ESN
  assert.equal(g('yasaka-rakza-7-soft').spongeFonte, 'nome do produto');
  assert.equal(g('butterfly-tenergy-80').dureza.escala, 'BF');
  assert.equal(g('dhs-hurricane-long-5').classe, 'OFF+');
  assert.equal(g('butterfly-viscaria').classe, 'OFF');
  assert.equal(g('butterfly-primorac').classe, null);            // sem fonte: desconhecido, não inferido
  assert.equal(g('butterfly-diode-pro').classe, 'DEF');
  assert.equal(g('butterfly-feint-long-iii').type, 'long-pips');
  assert.equal(g('butterfly-super-anti').type, 'anti');
  for (const id of Object.keys(P.DUREZA)) assert.ok(P.find(id), 'DUREZA aponta para id inexistente: ' + id);
  P.blades.forEach((b) => { if (b.n < 10 || b.rig == null) assert.equal(b.stiffness, null, b.id); });
});
test('sinergia com produtos reais', () => {
  const g = P.find;
  const codes = (a) => a.map((x) => x.code);
  // Hurricane Long 5 (OFF+, rigidez derivada) + Tenergy 05 FX (tensor, esponja macia)
  const hl5 = g('dhs-hurricane-long-5');
  const a = E.validateProducts({ blade: { ...hl5, stiffness: 'stiff' }, fh: g('butterfly-tenergy-05-fx'), bh: g('butterfly-tenergy-05') }, { level: 'pro' });
  assert.ok(codes(a).includes('BOTTOM_OUT'));
  // iniciante + OFF+ bloqueia; lâmina sem classe não dispara regras de classe
  assert.ok(E.hasBlock(E.validateProducts({ blade: hl5, fh: g('yasaka-mark-v'), bh: g('yasaka-mark-v') }, { level: 'beginner' })));
  const unk = E.validateProducts({ blade: g('butterfly-primorac'), fh: g('yasaka-mark-v'), bh: g('yasaka-mark-v') }, { level: 'beginner' });
  assert.ok(!codes(unk).some((c) => c.startsWith('BEGINNER_OFF')));
  // pino longo em lâmina de rigidez derivada alta: bloqueia iniciante
  const stiffBlade = P.blades.find((b) => b.stiffness === 'stiff');
  assert.ok(E.hasBlock(E.validateProducts({ blade: stiffBlade, fh: g('yasaka-mark-v'), bh: g('butterfly-feint-long-iii') }, { level: 'beginner' })));
  // controle baixo vem do radar combinado
  assert.ok(codes(E.validateProducts({ blade: hl5, fh: g('yasaka-mark-v'), bh: g('yasaka-mark-v'), control: 3 }, {})).includes('LOW_CONTROL'));
});
