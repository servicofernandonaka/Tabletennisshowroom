const test = require('node:test');
const assert = require('node:assert');
const E = require('../js/engine.js');

const mk = (bladeId, fh, bh, t = '1.8') => ({ bladeId, fh: { rubberId: fh, thicknessId: t }, bh: { rubberId: bh, thicknessId: t } });
const codes = (a) => a.map((x) => x.code);

test('OFF+ + tensor macio gera alerta crítico de bottom-out', () => {
  const a = E.validateSetup(mk('offplus-carbon', 'tensor-soft', 'tensor-medium'), { level: 'pro' });
  assert.ok(a.find((x) => x.code === 'BOTTOM_OUT' && x.severity === 'critical'));
});
test('pino longo + lâmina rígida: bloqueia iniciante, só avisa avançado', () => {
  const s = mk('off-carbon-out', 'inv-classic', 'long-pips', '1.5');
  s.bh.thicknessId = '1.0';
  assert.ok(E.hasBlock(E.validateSetup(s, { level: 'beginner' })));
  const adv = E.validateSetup(s, { level: 'advanced' });
  assert.ok(!E.hasBlock(adv));
  assert.ok(codes(adv).includes('LONGPIPS_STIFF'));
});
test('cores iguais bloqueiam; empunhadura incompatível bloqueia', () => {
  const s = { ...mk('all-wood', 'inv-classic', 'inv-classic'), fhColor: 'red', bhColor: 'red' };
  assert.ok(codes(E.validateSetup(s, {})).includes('COLOR'));
  assert.ok(codes(E.validateSetup(mk('def-wood', 'inv-classic', 'anti', '1.0'), { grip: 'penholder' })).includes('GRIP'));
});
test('peso estimado = soma de lâmina + borrachas + extras', () => {
  const w = E.estimateWeight(mk('all-wood', 'inv-classic', 'inv-classic', '1.8'));
  assert.deepStrictEqual([w.min, w.max], [70 + 34 + 34 + 3, 85 + 44 + 44 + 6]);
});
test('peso alto alerta iniciante (warn) e informa avançado (info)', () => {
  const s = mk('off-carbon-out', 'tensor-hard', 'tensor-hard', 'max');
  assert.equal(E.validateSetup(s, { level: 'beginner' }).find((x) => x.code === 'WEIGHT_HEAVY').severity, 'warn');
  assert.equal(E.validateSetup(s, { level: 'advanced' }).find((x) => x.code === 'WEIGHT_HEAVY').severity, 'info');
});
test('radar fica em 0-10 e throw angle é rotulado', () => {
  const r = E.radar(mk('offplus-carbon', 'tensor-hard', 'tensor-hard', 'max'));
  Object.values(r).forEach((v) => assert.ok(v >= 0 && v <= 10));
  assert.equal(E.throwLabel(3), 'Baixo'); assert.equal(E.throwLabel(5), 'Médio'); assert.equal(E.throwLabel(8), 'Alto');
});
test('filtro de iniciante remove OFF+ e recomendações nunca têm bloqueio', () => {
  const p = { level: 'beginner', style: 'allround', grip: 'shakehand', touch: 'soft', weight: 'light' };
  assert.ok(!E.filterCatalog(p).blades.some((b) => b.cls === 'OFF+'));
  const rec = E.recommend(p, 3);
  assert.ok(rec.length >= 1);
  rec.forEach((r) => assert.ok(!E.hasBlock(r.alerts)));
});
test('defensor recebe recomendação com lâmina DEF/ALL', () => {
  const rec = E.recommend({ level: 'intermediate', style: 'defender', grip: 'shakehand', touch: 'soft', weight: 'any' }, 1)[0];
  assert.ok(['def-wood', 'all-wood'].includes(rec.setup.bladeId));
});
test('preferência por peso leve favorece lâmina < 85 g', () => {
  const rec = E.recommend({ level: 'beginner', style: 'allround', grip: 'shakehand', touch: 'soft', weight: 'light' }, 1)[0];
  assert.ok(E.byId(require('../js/catalog.js').blades, rec.setup.bladeId).weight[1] <= 85);
});
