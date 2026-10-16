const test = require('node:test');
const assert = require('node:assert');
const M = require('../js/masterwang.js');
const PR = require('../js/products.js');

const WPM = 52 / 12;
const life = (type, h) => M.calculateRubberLifespan({ type, hoursPerWeek: h });

test('exemplo do briefing: 6 h/semana em tensor → "8 a 10 meses" (frase exata)', () => {
  const l = life('tensor', 6);
  assert.equal(l.sentence, 'Para 6 horas semanais de treino, sua borracha Tensor durará aproximadamente 8 a 10 meses.');
  assert.equal(l.text, '8 a 10 meses'); assert.equal(l.months.min, 7.7); assert.equal(l.months.max, 9.6);
});
test('cálculo por tipo (horas ÷ horas semanais ÷ 52/12), conferido à mão', () => {
  assert.deepEqual([life('tacky', 6).months.min, life('tacky', 6).months.max, life('tacky', 6).text], [11.5, 15.4, '12 a 15 meses']);   // 300 e 400 h
  assert.deepEqual([life('short_pips', 6).months.min, life('short_pips', 6).months.max, life('short_pips', 6).text], [15.4, 19.2, '15 a 19 meses']);   // 400 e 500 h
  assert.equal(life('long_pips', 20).text, '5 a 6 meses');
  assert.equal(life('tensor', 20).text, '2 a 3 meses');
  for (const t of ['tensor', 'tacky', 'short_pips', 'long_pips']) for (const h of [1, 2, 5, 10, 20]) {
    const l = life(t, h), d = M.RUBBER_LIFE[t];
    assert.ok(Math.abs(l.months.min - d.minH / h / WPM) < 0.06 && Math.abs(l.months.max - d.maxH / h / WPM) < 0.06, t + ' ' + h);
  }
  assert.deepEqual([M.RUBBER_LIFE.tensor.minH, M.RUBBER_LIFE.tensor.maxH, M.RUBBER_LIFE.tacky.minH, M.RUBBER_LIFE.tacky.maxH, M.RUBBER_LIFE.short_pips.minH, M.RUBBER_LIFE.long_pips.maxH], [200, 250, 300, 400, 400, 500]);
});
test('ponto de atenção em 70% das horas e segmentos da barra somam o total', () => {
  const l = life('tensor', 6);
  assert.equal(l.hours.warn, 140); assert.equal(l.months.warn, 5.4);
  assert.ok(Math.abs(l.segments.ok + l.segments.attention + l.segments.replace - l.segments.total) < 0.11);
  assert.equal(l.segments.total, l.months.max); assert.ok(l.segments.ok < l.months.min && l.months.min < l.months.max);
  assert.equal(M.RUBBER_LIFE.tensor.warnAt, 0.7);
});
test('formatação: singular, anos para estimativas longas e aviso de envelhecimento pelo tempo', () => {
  assert.equal(life('tensor', 100).text, 'cerca de 1 mês');
  assert.match(life('tensor', 1).sentence, /^Para 1 hora semanal de treino/);
  assert.match(life('tensor', 1).text, /^46 a 58 meses \(cerca de 3,8 a 4,8 anos\)$/);
  assert.equal(life('tensor', 1).longLife, true); assert.equal(life('tensor', 6).longLife, false); assert.equal(life('tacky', 6).longLife, false);
});
test('validação de entradas', () => {
  assert.throws(() => M.calculateRubberLifespan({ type: 'xyz', hoursPerWeek: 6 }), /tipo de borracha inválido/);
  assert.throws(() => M.calculateRubberLifespan(), /inválido/);
  for (const h of [0, -3, NaN, 'abc', null, undefined, Infinity]) assert.throws(() => life('tensor', h), /horas semanais inválidas/, String(h));
  assert.equal(life('tensor', '6').months.min, 7.7);   // número em texto (valor de slider) é aceito
});

test('sinais de desgaste por tipo (3 do briefing + pinos quebrados só para pinos)', () => {
  assert.deepEqual(M.wearSignals('tensor').map((s) => s.id), ['grip', 'sponge', 'oxid']);
  assert.deepEqual(M.wearSignals('short_pips').map((s) => s.id), ['grip', 'teeth']);
  const t = M.wearSignals('tensor');
  assert.deepEqual(t.map((s) => s.icon), ['🔴', '🟡', '🔵']);
  assert.match(t[0].desc, /escorrega.*topspin leve/); assert.match(t[1].label, /bottom-out/i); assert.match(t[2].desc, /esbranquiçada ou opaca.*sweet spot/);
});
test('veredito: sem dados = ok; 1 sinal = atenção; 2 sinais = trocar; tempo de uso decide por fase', () => {
  const a = (o) => M.assessRubberWear({ type: 'tensor', hoursPerWeek: 6, ...o });
  assert.equal(a({}).level, 'ok');
  assert.equal(a({ signals: ['grip'] }).level, 'attention'); assert.equal(a({ signals: ['grip', 'oxid'] }).level, 'replace');
  assert.equal(a({ monthsInUse: 3 }).level, 'ok'); assert.equal(a({ monthsInUse: 3 }).phase, 'ok');
  assert.equal(a({ monthsInUse: 5.4 }).level, 'attention'); assert.equal(a({ monthsInUse: 7.6 }).phase, 'attention');
  assert.equal(a({ monthsInUse: 7.7 }).level, 'replace'); assert.equal(a({ monthsInUse: 12 }).message, 'Troque agora: a borracha já está na janela de substituição.');
  assert.equal(a({ monthsInUse: 3, signals: ['sponge', 'oxid', 'grip'] }).level, 'replace', 'sinais vencem o tempo');
  assert.equal(a({ monthsInUse: 0 }).phase, null);
  assert.equal(a({ signals: ['grip', 'grip'] }).signalCount, 1, 'duplicados contam uma vez');
  assert.equal(a({ signals: ['teeth', 'inexistente'] }).signalCount, 0, 'sinal de outro tipo ou inválido é ignorado');
  assert.equal(M.assessRubberWear({ type: 'long_pips', hoursPerWeek: 6, signals: ['teeth'] }).level, 'attention');
  assert.ok(a({ signals: ['grip'] }).reasons.some((r) => /perda de aderência/.test(r)));
  assert.match(a({ monthsInUse: 9 }).reasons[0], /9 meses\) já passou da estimativa mínima de vida útil \(7,7 meses\)/);
});

const items = [...PR.rubbers, ...PR.pips];
test('reposição: só itens do tipo, ativos, com n ≥ 10 e dados; no máximo 3; determinístico', () => {
  for (const type of ['tensor', 'tacky', 'short_pips', 'long_pips']) {
    const r = M.recommendReplacement(items, { type, hoursPerWeek: 6 });
    assert.ok(r.picks.length >= 1 && r.picks.length <= 3, type); assert.deepEqual(r, M.recommendReplacement(items, { type, hoursPerWeek: 6 }));
    for (const p of r.picks) { const it = PR.find(p.id); assert.equal(it.status, 'ativo'); assert.ok(it.n >= 10); }
    assert.ok(r.picks.every((p, i, a) => i === 0 || a[i - 1].score >= p.score), 'ordenado por pontuação');
  }
  const tacky = M.recommendReplacement(items, { type: 'tacky', hoursPerWeek: 6 });
  assert.ok(tacky.picks.every((p) => ['DHS', '729', 'Yinhe'].includes(p.brand)), 'tacky tradicional = marcas chinesas');
  assert.ok(!M.recommendReplacement(items, { type: 'tensor', hoursPerWeek: 6 }).picks.some((p) => /Hurricane|Rakza Z|Dignics 09C/.test(p.name)), 'híbridas e tackys não entram em tensor');
  const sp = M.recommendReplacement(items, { type: 'short_pips', hoursPerWeek: 6 }), lp = M.recommendReplacement(items, { type: 'long_pips', hoursPerWeek: 6 });
  assert.equal(sp.kind, 'pips'); assert.ok(sp.picks.every((p) => PR.find(p.id).tipo === 'pino' && ['curto', 'enganoso'].includes(PR.find(p.id).cat)));
  assert.ok(lp.picks.every((p) => PR.find(p.id).cat === 'longo') && !lp.picks.some((p) => /Curl|Feint AG|Grass|Desperado/.test(p.name)), 'longo: sem descontinuado, incerto ou sem nota');
  assert.ok(!sp.picks.some((p) => /Impartial/.test(p.name)), 'n < 10 fica de fora');
});
test('reposição: treino intenso dá mais peso à durabilidade; filtro de preço e fallback', () => {
  const light = M.recommendReplacement(items, { type: 'tensor', hoursPerWeek: 4 }), heavy = M.recommendReplacement(items, { type: 'tensor', hoursPerWeek: 15 });
  const f = (r, name) => r.picks.concat([]).find((p) => p.name === name);
  assert.ok(heavy.picks[0].dur >= light.picks[0].dur - 1e-9, 'quem treina mais recebe sugestão com durabilidade igual ou maior');
  assert.match(heavy.picks[0].why, /treino intenso/); assert.doesNotMatch(light.picks[0].why, /treino intenso/);
  const only = (id) => (it) => it.id === id, none = () => false;
  const one = M.recommendReplacement(items, { type: 'tensor', hoursPerWeek: 6, pass: only('nittaku-fastarc-g-1') });
  assert.deepEqual(one.picks.map((p) => p.id), ['nittaku-fastarc-g-1']); assert.equal(one.budgetIgnored, false);
  const fb = M.recommendReplacement(items, { type: 'tensor', hoursPerWeek: 6, pass: none });
  assert.equal(fb.budgetIgnored, true); assert.ok(fb.picks.length > 0, 'sem item na faixa de preço: mostra sem filtro e avisa');
  assert.throws(() => M.recommendReplacement(items, { type: 'x' }), /inválido/);
  assert.deepEqual(M.recommendReplacement([], { type: 'tensor', hoursPerWeek: 6 }).picks, []);
});
