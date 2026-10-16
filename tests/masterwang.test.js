const test = require('node:test');
const assert = require('node:assert');
const M = require('../js/masterwang.js');
const { packs } = require('../js/packs.js');
const PR = require('../js/products.js');

const base = { bladeWeight: 80, rawSheetWeightFH: 70, rawSheetWeightBH: 70 };

test('física: shakehand = lâmina + 2×round(70×0,685) + 3 g', () => {
  const r = M.calculateAssembledPhysics({ ...base, grip: 'shakehand' });
  assert.equal(r.cutWeightFH, 48); assert.equal(r.cutWeightBH, 48);   // 47,95 → 48
  assert.equal(r.totalWeight, 80 + 48 + 48 + 3);
});
test('física: caneta RPB usa fator 0,61 no BH; caneta clássica usa BH = 2 g de cortiça e fator 0,66 no FH', () => {
  const rpb = M.calculateAssembledPhysics({ ...base, grip: 'penhold_rpb' });
  assert.equal(rpb.cutWeightBH, Math.round(70 * 0.61)); assert.equal(rpb.cutWeightBH, 43);
  assert.equal(rpb.totalWeight, 80 + 48 + 43 + 3);
  const cl = M.calculateAssembledPhysics({ ...base, grip: 'penhold_classic' });
  assert.equal(cl.cutWeightFH, Math.round(70 * 0.66)); assert.equal(cl.cutWeightFH, 46);
  assert.equal(cl.cutWeightBH, 2); assert.equal(cl.totalWeight, 80 + 46 + 2 + 3);
});
test('física: cabeça defensiva usa 0,71; entradas inválidas lançam erro', () => {
  assert.equal(M.calculateAssembledPhysics({ ...base, grip: 'shakehand', bladeHead: 'defensive' }).cutWeightFH, Math.round(70 * 0.71));
  assert.throws(() => M.calculateAssembledPhysics({ ...base, grip: 'canhoto' }));
  assert.throws(() => M.calculateAssembledPhysics({ grip: 'shakehand', bladeWeight: 80 }));
  assert.throws(() => M.calculateAssembledPhysics({ ...base, grip: 'shakehand', bladeHead: 'x' }));
});
test('balanço: limiares 1,15 e 1,02 (valores na fronteira) e rótulos exatos', () => {
  const bal = (blade, fh, bh) => M.calculateAssembledPhysics({ bladeWeight: blade, rawSheetWeightFH: fh, rawSheetWeightBH: bh, grip: 'shakehand' });
  assert.equal(bal(100, 100, 100).balanceCode, 'heavy');                  // 68+69=137 > 115
  assert.equal(bal(100, 60, 60).balanceCode, 'light');                    // 41+41=82 < 102
  assert.equal(bal(100, 80, 80).balanceCode, 'neutral');                  // 55+55=110
  assert.equal(bal(100, 100, 100).balance, 'Head-Heavy (Peso na Cabeça - Maior Potência de Loop)');
  assert.equal(bal(100, 60, 60).balance, 'Head-Light (Peso no Cabo - Transição Rápida e Proteção Articular)');
  assert.equal(bal(100, 80, 80).balance, 'Balanced (Equilíbrio Central Neutro)');
});

const stiff = { id: 'x', nome: 'Lâmina OFF+', classe: 'OFF+', construcao: 'carbono externo' };
const wood = { id: 'w', nome: 'Allround', classe: 'ALL', construcao: '5 camadas All-Wood' };
const R = (id, esn) => ({ id, hardnessESN: esn });
const codes = (d) => d.map((x) => x.code);

test('regra 1 bottom-out: só com ESN < 42,5 (42,5 não dispara) e lâmina rígida', () => {
  const v = (esn) => M.validateMechanicalSynergy({ blade: stiff, fh: R('a', esn), bh: R('b', 46), profile: { level: 'avancado', grip: 'shakehand' }, physics: { totalWeight: 170 } });
  assert.ok(codes(v(40)).includes('BOTTOM_OUT')); assert.equal(v(40).find((d) => d.code === 'BOTTOM_OUT').severity, 'WARNING');
  assert.ok(!codes(v(42.5)).includes('BOTTOM_OUT'));
  assert.ok(!codes(v(null)).includes('BOTTOM_OUT'));                       // sem dado ESN: regra desligada
  assert.ok(!codes(M.validateMechanicalSynergy({ blade: wood, fh: R('a', 40), bh: R('b', 40), profile: {}, physics: { totalWeight: 170 } })).includes('BOTTOM_OUT'));
});
test('regra 2 speed trap: CRITICAL para iniciante/recreativo com lâmina OFF+/outer/ZLC ou borracha Pro; não para intermediário', () => {
  const run = (level, blade, fh) => M.validateMechanicalSynergy({ blade, fh: fh || R('a', 45), bh: R('b', 45), profile: { level }, physics: { totalWeight: 170 } });
  assert.equal(run('iniciante', stiff).find((d) => d.code === 'SPEED_TRAP').severity, 'CRITICAL');
  assert.ok(codes(run('recreativo', wood, R('butterfly-tenergy-05', 36))).includes('SPEED_TRAP'));
  assert.ok(codes(run('iniciante', wood, R('butterfly-dignics-09c', 44))).includes('SPEED_TRAP'));
  assert.ok(codes(run('iniciante', { nome: 'X ZLC', construcao: 'carbono' })).includes('SPEED_TRAP'));
  assert.ok(!codes(run('intermediario', stiff)).includes('SPEED_TRAP'));
  assert.ok(!codes(run('iniciante', wood)).includes('SPEED_TRAP'));
});
test('regra 3 epicondilite: 188 (shakehand), 180 (RPB), 178 (sensível); limites exclusivos', () => {
  const j = (grip, w, sens) => codes(M.validateMechanicalSynergy({ blade: wood, fh: R('a', 45), bh: R('b', 45), profile: { grip, jointSensitivity: sens }, physics: { totalWeight: w } })).includes('JOINT_OVERLOAD');
  assert.equal(j('shakehand', 188), false); assert.equal(j('shakehand', 189), true);
  assert.equal(j('penhold_rpb', 180), false); assert.equal(j('penhold_rpb', 181), true);
  assert.equal(j('shakehand', 178, true), false); assert.equal(j('shakehand', 179, true), true);
  assert.equal(j('penhold_classic', 200, false), false);                   // sem limiar na especificação
});
test('regra 4 sinergia perfeita: ALL/ALL+/OFF-/inner + 40–47,5 ESN em ambas, sem sobrecarga e sem lâmina rígida', () => {
  const s = (blade, a, b, w = 175) => codes(M.validateMechanicalSynergy({ blade, fh: R('a', a), bh: R('b', b), profile: { grip: 'shakehand' }, physics: { totalWeight: w } })).includes('SWEET_SYNERGY');
  assert.equal(s(wood, 40, 47.5), true);
  assert.equal(s(wood, 39.9, 45), false); assert.equal(s(wood, 45, 47.6), false);
  assert.equal(s({ classe: 'OFF-', construcao: 'x' }, 42, 44), true);
  assert.equal(s({ classe: 'OFF', construcao: 'inner carbon' }, 42, 44), true);
  assert.equal(s(wood, 45, 45, 190), false);                               // peso não controlado
  assert.equal(s(stiff, 45, 45), false);
  assert.equal(s(wood, null, 45), false);
});

test('recomendação: empunhadura filtra por cabo; caneta recebe só o pack 5; sem alternativo quando não há', () => {
  const sh = M.recommendPack({ grip: 'shakehand', goal: 'learn_control', touch: 'soft', body: 'standard_athletic' }, packs);
  assert.equal(sh.primary.pack.id, 'pack-allround-intro'); assert.ok(sh.alternative && sh.alternative.pack.id !== 'pack-penhold-rpb');
  const pen = M.recommendPack({ grip: 'penhold_rpb', goal: 'close_blocker', touch: 'balanced', body: 'standard_athletic' }, packs);
  assert.equal(pen.primary.pack.id, 'pack-penhold-rpb'); assert.equal(pen.alternative, null);
  const cl = M.recommendPack({ grip: 'penhold_classic', goal: 'spin_attacker', touch: 'balanced', body: 'light_safe' }, packs);
  assert.equal(cl.primary.pack.id, 'pack-penhold-rpb');
});
test('recomendação: objetivos diferentes escolhem packs diferentes e match fica em 0–100', () => {
  const pick = (goal, touch) => M.recommendPack({ grip: 'shakehand', goal, touch, body: 'standard_athletic' }, packs).primary;
  assert.equal(pick('spin_attacker', 'soft').pack.id, 'pack-spin-learner');
  assert.equal(pick('competitive_step', 'balanced').pack.id, 'pack-korbel-pro');
  for (const g of ['learn_control', 'spin_attacker', 'close_blocker', 'competitive_step']) { const m = pick(g, 'crisp').match; assert.ok(m >= 0 && m <= 100); }
});
test('perfil sensível a articulações (light_safe) derruba o match de packs pesados e muda o selo', () => {
  const a = { grip: 'shakehand', goal: 'competitive_step', touch: 'balanced' };
  const light = M.recommendPack({ ...a, body: 'light_safe' }, packs), std = M.recommendPack({ ...a, body: 'standard_athletic' }, packs);
  const k = (r) => r.all.find((x) => x.pack.id === 'pack-inner-carbon');
  assert.ok(k(light).match < k(std).match);
  assert.equal(k(light).seal.code, 'red');                                   // 186 g > 178 g
  assert.equal(M.mapAnswersToProfile({ grip: 'shakehand', goal: 'learn_control', body: 'light_safe' }).jointSensitivity, true);
});
test('integridade dos packs: ids de catálogo existem; fora do catálogo está marcado; métricas 0–100', () => {
  assert.equal(packs.length, 6);
  for (const p of packs) {
    for (const c of [p.blade, p.fh, p.bh, ...(p.bhOptions || []).map((o) => o.bh)]) {
      if (c.catalogId) assert.ok(PR.find(c.catalogId), 'catalogId inexistente: ' + c.catalogId);
      else assert.equal(c.noCatalogo, true, c.id + ' sem catalogId deve estar marcado noCatalogo');
    }
    for (const k of ['speed', 'spin', 'control', 'dwell', 'throwAngleBar']) assert.ok(p.metrics[k] >= 0 && p.metrics[k] <= 100, p.id + '.' + k);
    assert.ok(p.verificar.length >= 1 && p.leigo.length > 20);
  }
});

test('cabo da lâmina: FL pesa ~2 g a mais que ST e o peso total acompanha; CS só para caneta', () => {
  const K = require('../js/packs.js');
  const prof = { grip: 'shakehand', goal: 'learn_control', touch: 'soft', body: 'standard_athletic' };
  const p = K.packs[0], base = M.evaluatePack(p, prof);
  const fl = M.evaluatePack(p, prof, undefined, 'FL'), st = M.evaluatePack(p, prof, undefined, 'ST');
  assert.equal(base.pack.blade.weight, p.blade.weight); assert.equal(fl.handle.delta, 0);
  assert.equal(fl.pack.blade.weight - st.pack.blade.weight, 2); assert.equal(fl.physics.totalWeight - st.physics.totalWeight, 2);
  assert.equal(p.blade.weight, 80, 'pack original não é mutado');
  assert.deepEqual(base.handle.options, ['FL', 'ST']);
  assert.equal(M.evaluatePack(p, prof, undefined, 'CS').handle.id, 'FL', 'CS é inválido para shakehand: cai no padrão');
  const pen = K.packs.find((x) => x.num === 5), r = M.evaluatePack(pen, { ...prof, grip: 'penhold_rpb' }, undefined, 'ST');
  assert.equal(r.handle.id, 'CS'); assert.equal(r.handle.delta, 0); assert.deepEqual(r.handle.options, ['CS']);
});
test('selos do Mestre Wang nos packs 1, 2 e 3', () => {
  const K = require('../js/packs.js');
  assert.deepEqual(K.packs.slice(0, 3).map((p) => p.seal[1]), ['Mais Vendido para Iniciantes', 'Inovação em Spin', 'Escolha do Treinador']);
  assert.ok(K.packs.slice(3).every((p) => !p.seal));
});
