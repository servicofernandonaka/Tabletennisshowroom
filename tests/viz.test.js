const test = require('node:test');
const assert = require('node:assert');
const V = require('../js/viz.js');
const Sh = require('../js/share.js');
const M = require('../js/masterwang.js');
const { packs } = require('../js/packs.js');

test('arco: folga sobre a rede e mergulho crescem com o Throw Angle; o arco mais baixo ainda passa a rede', () => {
  const g = [25, 50, 70, 90].map(V.arcGeometry);
  for (let i = 1; i < g.length; i++) { assert.ok(g[i].clearance > g[i - 1].clearance, 'folga cresce'); assert.ok(g[i].dive >= g[i - 1].dive, 'mergulho cresce'); assert.ok(g[i].cy < g[i - 1].cy, 'ponto de controle sobe'); }
  assert.ok(g[0].clearance > 0 && g[0].clearance < 4, 'baixo é rasante mas passa: ' + g[0].clearance);
  assert.ok(g[3].clearance > 25);
  assert.equal(V.clearanceWord(g[0].clearance), 'rasante'); assert.equal(V.clearanceWord(g[3].clearance), 'ampla');
});
test('arco: valores fora de 0–100 são limitados e entrada inválida não quebra', () => {
  assert.equal(V.arcGeometry(500).bar, 100); assert.equal(V.arcGeometry(-5).bar, 0); assert.equal(V.arcGeometry(undefined).bar, 0);
  assert.ok(V.arcGeometry(100).cy > 0, 'ponto de controle dentro do viewBox');
});
test('arco SVG: path Bézier Q, legendas exigidas, mesa/rede, ids únicos e acessibilidade', () => {
  const a = V.arcSvg(70, 'Médio-Alto'), b = V.arcSvg(25, 'Baixo');
  assert.match(a, /<path class="arc-path" d="M30 98 Q196 [\d.]+ 352 110"/);
  assert.ok(a.includes('Folga sobre a Rede (Segurança)') && a.includes('Mergulho do Topspin'));
  assert.match(a, /role="img"/); assert.match(a, /aria-label="[^"]*Médio-Alto[^"]*"/);
  const ids = (a + b).match(/id="[^"]+"/g); assert.equal(new Set(ids).size, ids.length, 'ids duplicados entre SVGs');
  assert.ok(!/(src|href)="https?:/.test(a), 'sem recursos externos');
  assert.notEqual(a.match(/d="([^"]+)"/)[1], b.match(/d="([^"]+)"/)[1], 'trajetórias diferentes');
});
test('radar: 5 eixos com os rótulos exigidos, polígonos semitransparentes e pontos dentro do círculo', () => {
  const vals = { speed: 80, spin: 60, control: 90, dwell: 70, throwAngleBar: 50 };
  const svg = V.radarSvg([{ name: 'A', color: '#00E5FF', values: vals }, { name: 'B', color: '#FF2A5F', values: { speed: 100, spin: 100, control: 100, dwell: 100, throwAngleBar: 100 } }]);
  for (const t of ['Velocidade', '(Speed)', 'Efeito', '(Spin)', 'Controle', '(Control)', 'Retenção', '(Dwell Time)', 'Segurança de Arco', '(Throw)']) assert.ok(svg.includes(t), t);
  assert.equal((svg.match(/fill-opacity="0.35"/g) || []).length, 2);
  // rótulos precisam ter cor explícita (sem fill o SVG usa preto e some no fundo escuro)
  const texts = svg.match(/<text [^>]*>/g); assert.equal(texts.length, 5); texts.forEach((t) => assert.match(t, /fill="#/));
  V.arcSvg(50, 'Médio').match(/<text [^>]*>/g).forEach((t) => assert.match(t, /fill="#/));
  assert.equal(V.AXES.length, 5);
  const p0 = V.radarPoint(0, 100); assert.equal(p0[0], 220); assert.equal(p0[1], 60);                      // topo
  for (let i = 0; i < 5; i++) { const [x, y] = V.radarPoint(i, 100); assert.ok(Math.abs(Math.hypot(x - 220, y - 160) - 100) < 0.2); }
  assert.deepEqual(V.radarPoint(2, 0), [220, 160]);                                                       // valor 0 = centro
  assert.deepEqual(V.radarPoint(1, 500), V.radarPoint(1, 100));                                           // limitado
});
test('radar: valores de pack mapeiam as 5 métricas', () => {
  const v = V.packValues(packs[0].metrics); assert.deepEqual(Object.keys(v).sort(), ['control', 'dwell', 'speed', 'spin', 'throwAngleBar']);
});

test('Pack 06: dados e variantes de BH (liso 182 g, pino curto 166 g)', () => {
  const p = packs.find((x) => x.id === 'pack-tactical-block');
  assert.equal(p.num, 6); assert.equal(p.selo, 'Controle de Ritmo & Bloqueio Ativo'); assert.equal(p.handle, 'shakehand');
  assert.deepEqual([p.metrics.speed, p.metrics.spin, p.metrics.control, p.metrics.throwAngle, p.metrics.dwell], [82, 85, 92, 'Médio', 84]);
  assert.equal(p.bhOptions.length, 2); assert.equal(p.bh, p.bhOptions[0].bh);
  const prof = { grip: 'shakehand', goal: 'close_blocker', touch: 'balanced', body: 'standard_athletic', level: 'intermediario' };
  const smooth = M.evaluatePack(p, prof, 'smooth'), pips = M.evaluatePack(p, prof, 'pips');
  assert.equal(smooth.physics.totalWeight, 83 + 48 + 48 + 3); assert.equal(pips.physics.totalWeight, 83 + 48 + 32 + 3);
  assert.equal(pips.physics.totalWeight, 166); assert.equal(pips.pack.variantId, 'pips'); assert.equal(pips.pack.bh.tipo, 'short-pips');
  assert.equal(M.evaluatePack(p, prof, 'inexistente').pack.variantId, 'smooth');                          // variante inválida cai no padrão
  assert.ok(smooth.diagnostics.some((d) => d.code === 'SWEET_SYNERGY'));
  assert.ok(!pips.diagnostics.some((d) => d.code === 'SWEET_SYNERGY'), 'pino curto sem ESN: regra desligada');
  assert.equal(packs[0].bhOptions, undefined); assert.equal(M.resolveVariant(packs[0], 'x'), packs[0]);   // packs sem variante intactos
});
test('Wizard: bloqueio/colado na mesa recomenda o Pack 06 e não desloca os demais objetivos', () => {
  for (const t of ['soft', 'balanced', 'crisp']) assert.equal(M.recommendPack({ grip: 'shakehand', goal: 'close_blocker', touch: t, body: 'standard_athletic' }, packs).primary.pack.id, 'pack-tactical-block', t);
  const pick = (goal, touch) => M.recommendPack({ grip: 'shakehand', goal, touch, body: 'standard_athletic' }, packs).primary.pack.id;
  assert.equal(pick('learn_control', 'soft'), 'pack-allround-intro'); assert.equal(pick('spin_attacker', 'soft'), 'pack-spin-learner'); assert.equal(pick('competitive_step', 'balanced'), 'pack-korbel-pro');
  const pen = M.recommendPack({ grip: 'penhold_rpb', goal: 'close_blocker', touch: 'balanced', body: 'standard_athletic' }, packs);
  assert.equal(pen.primary.pack.id, 'pack-penhold-rpb');                                                    // cabo caneta: Pack 06 (shakehand) é excluído
  const rec = (body, v) => M.recommendPack({ grip: 'shakehand', goal: 'close_blocker', touch: 'balanced', body }, packs, v);
  const p6 = (r) => r.all.find((x) => x.pack.id === 'pack-tactical-block');
  assert.equal(rec('light_safe', { 'pack-tactical-block': 'pips' }).primary.pack.variantId, 'pips');          // 166 g cabe em ≤ 175 g
  assert.ok(p6(rec('standard_athletic', { 'pack-tactical-block': 'pips' })).match < p6(rec('standard_athletic')).match, '166 g fora de 178–185 g perde pontos');
});

test('WhatsApp: URL wa.me, texto íntegro após decodificar e limite de tamanho', () => {
  const pk = (n) => ({ name: n, match: 92, blade: 'Lâmina X (83 g est.)', fh: 'FH 2.0 mm', bh: 'BH 1.8 mm', weight: 182, balance: 'Head-Heavy', seal: 'Dentro do limite', alerts: ['Peso acima do limite articular'] });
  const d = { summary: 'Empunhadura: Clássica. Objetivo: bloquear.', primary: pk('Pack Um'), alternative: pk('Pack Dois'), url: 'https://exemplo.com/' };
  const t = Sh.fit(d), url = Sh.buildWhatsAppUrl(t);
  assert.ok(url.startsWith('https://wa.me/?text='));
  assert.equal(decodeURIComponent(url.slice('https://wa.me/?text='.length)), t);
  assert.ok(t.includes('*LAUDO BIOMECÂNICO · Mestre Wang*') && t.includes('*Pack principal: Pack Um*') && t.includes('Pack alternativo') && t.includes('Alertas: Peso acima'));
  assert.ok(encodeURIComponent(t).length <= Sh.MAX_ENCODED);
  const big = { ...d, summary: 'x '.repeat(900) };                                                         // texto enorme: corta sem quebrar
  const tb = Sh.fit(big); assert.ok(encodeURIComponent(tb).length <= Sh.MAX_ENCODED); assert.ok(tb.endsWith('…') || !tb.includes('Pack alternativo'));
  assert.ok(!Sh.fit({ ...d, alternative: null }).includes('Pack alternativo'));
});
