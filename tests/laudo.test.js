const test = require('node:test');
const assert = require('node:assert');
const L = require('../js/laudo.js');

const ctx = (over) => ({
  date: new Date(2026, 9, 16, 10, 30), kind: 'wizard',
  player: { name: 'Maria Silva', title: 'Identificação do perfil do jogador', lines: [['Empunhadura', 'Clássica (Shakehand)'], ['Frequência de treino', '2 a 3 vezes por semana']] },
  primary: { name: 'Bloqueio Tático & Contra-Ataque de Mesa (Allround+ / Pips Option)', num: 6, match: 100, perfil: 'Quem joga colado na mesa.', variantLabel: 'BH liso',
    components: [['Lâmina (Blade)', 'Yasaka Sweden Extra · 83 g'], ['Borracha Forehand (FH)', 'Xiom Vega Pro · 2.0 mm'], ['Borracha Backhand (BH)', 'Xiom Vega Intro · 1.8 mm']],
    physics: { rows: [['Lâmina', '83 g'], ['Forehand cortado', '48 g (fator de área 0,685)']], total: 182, balance: 'Head-Heavy (Peso na Cabeça - Maior Potência de Loop)' },
    seal: { code: 'green', label: 'Dentro do limite de massa para o seu perfil' },
    metrics: { speed: 82, spin: 85, control: 92, throwAngle: 'Médio', throwAngleBar: 50, dwell: 84 },
    diagnostics: [{ severity: 'WARNING', title: 'Peso acima do limite', message: '⚕️ Alerta Ergonômico: limite excedido.' }, { severity: 'OPTIMAL', title: 'Sinergia', message: '✅ Sinergia Mecânica Perfeita.' }],
    price: '≈ R$ 802 (Intermediário)', verificar: ['Xiom Vega Intro fora do catálogo.'] },
  alternative: { name: 'Formação Competitiva', match: 90, weight: 184, balance: 'Balanced', price: '≈ R$ 1.158 (Pro)' },
  checklist: [['Selagem da madeira', 'Impermeabilize as bordas.'], ['Colagem isenta de VOC', 'Use cola à base d\'água.'], ['Edge Tape', 'Fita de 10 ou 12 mm.']],
  ...over,
});

test('cabeçalho institucional, data (dd/mm/aaaa), referência e identificação do jogador', () => {
  const h = L.buildReport(ctx());
  assert.ok(h.includes('Table Tennis Showroom • Consultoria Técnica Mestre Wang'));
  assert.equal(L.BRAND, 'Table Tennis Showroom • Consultoria Técnica Mestre Wang');
  assert.ok(h.includes('Emitido em') && h.includes('16/10/2026'));
  assert.match(h, /LT-20261016-P06/); assert.match(L.buildReport(ctx({ primary: { ...ctx().primary, num: undefined, name: 'Pack Sem Número Longo' } })), /LT-20261016-PACK-SEM-N/); assert.ok(h.includes('Maria Silva') && h.includes('Clássica (Shakehand)'));
  assert.ok(h.includes('Diagnóstico Biomecânico personalizado'));
  assert.equal(L.fmtDate(new Date(2026, 0, 5)), '05/01/2026'); assert.equal(L.isoDate(new Date(2026, 0, 5)), '2026-01-05');
  assert.match(L.fmtDate('inválida'), /^\d{2}\/\d{2}\/\d{4}$/, 'data inválida cai na data atual');
});
test('ordem das seções: perfil, setup, massa cortada, balanço, gráfico, sinergia, checklist, investimento', () => {
  const h = L.buildReport(ctx()), at = (t) => { const i = h.indexOf(t); assert.ok(i >= 0, t); return i; };
  const order = ['Identificação do perfil do jogador', 'Setup prescrito', 'Pack alternativo (resumo)', 'Especificações de massa cortada', 'Balanço (Balance Point) e saúde articular', 'Gráfico resumo de desempenho', 'Diagnóstico de sinergia mecânica', 'Checklist de montagem (selagem e cola VOC-Free)', 'Investimento estimado e dados a verificar'].map(at);
  assert.deepEqual(order, order.slice().sort((a, b) => a - b));
  assert.ok(h.includes('Head-Heavy (Peso na Cabeça') && h.includes('Peso total estimado') && h.includes('<b>182 g</b>'));
});
test('escape: nome e textos não injetam HTML', () => {
  const h = L.buildReport(ctx({ player: { name: '<img src=x onerror=alert(1)>"&', title: 'Perfil', lines: [] } }));
  assert.ok(!h.includes('<img') && !h.includes('onerror=alert(1)>'), 'HTML do nome foi escapado');
  assert.ok(h.includes('&lt;img src=x onerror=alert(1)&gt;&quot;&amp;'));
  assert.ok(!/<script/i.test(h));
});
test('nome do arquivo (título do documento) é sanitizado e traz a data', () => {
  assert.equal(L.fileTitle(ctx()), 'Laudo-Tecnico-Mestre-Wang_Maria-Silva_Bloqueio-Tatico-Contra-Ataque-de-Mesa-Allround-Pips-Option_2026-10-16');
  assert.equal(L.fileTitle(ctx({ player: { lines: [] } })).includes('__'), false);
  assert.ok(!/[\/\\:*?"<>|]/.test(L.fileTitle(ctx({ player: { name: 'a/b\\c:d*e?"f<g>h|i', lines: [] } }))));
});
test('modos: laudo do wizard × ficha do pack (sem match e sem alternativo, com nota)', () => {
  const p = L.buildReport(ctx({ kind: 'pack', player: { title: 'Perfil de referência', lines: [['Empunhadura', 'Clássica']] }, note: 'Descreve o pack para um perfil de referência.', alternative: null, primary: { ...ctx().primary, match: null } }));
  assert.ok(p.includes('Ficha técnica do pack') && p.includes('Perfil de referência') && p.includes('Descreve o pack para um perfil de referência.'));
  assert.ok(!p.includes('compatibilidade') && !p.includes('Pack alternativo') && !p.includes('Jogador</th>'));
  const w = L.buildReport(ctx()); assert.ok(w.includes('compatibilidade 100%') && w.includes('Pack alternativo (resumo)') && w.includes('≈ R$ 1.158 (Pro)'));
});
test('gráfico em tema de impressão: sem cores claras (invisíveis no papel); barras em SVG com 5 métricas', () => {
  const h = L.buildReport(ctx());
  assert.ok(!h.includes('#E8EEF8') && !h.includes('#9AA8C2') && !h.includes('rgba(0,229,255'), 'radar sem cores do tema escuro');
  assert.ok(h.includes('fill-opacity="0.35"') && h.includes('Velocidade') && h.includes('Segurança de Arco'));
  const bars = L.barsSvg(ctx().primary.metrics); assert.equal((bars.match(/<rect x="170"/g) || []).length, 10, '5 trilhas + 5 preenchimentos');
  assert.ok(bars.includes('Arco (Throw Angle) · Médio') && /role="img"/.test(bars));
  assert.ok(L.barsSvg({ speed: 500, spin: -3 }).includes('width="220"') && !L.barsSvg({ speed: 500 }).includes('width="1100"'), 'valores fora de 0–100 são limitados');
});
test('sinergia em P&B: rótulos por texto, emojis removidos; checklist com caixas de marcar', () => {
  const h = L.buildReport(ctx());
  assert.ok(h.includes('ATENÇÃO · Peso acima do limite') && h.includes('ÓTIMO · Sinergia') && h.includes('pd-diag-warn') && h.includes('pd-diag-ok'));
  assert.ok(!h.includes('⚕') && !h.includes('✅') && h.includes('Alerta Ergonômico: limite excedido.'));
  assert.equal((h.match(/class="pd-box"/g) || []).length, 3);
  assert.ok(h.includes('Selagem da madeira') && h.includes('Colagem isenta de VOC'));
  assert.ok(L.buildReport(ctx({ primary: { ...ctx().primary, diagnostics: [] } })).includes('Nenhum alerta de sinergia'));
});
test('rodapé, aviso e sem recursos externos', () => {
  const h = L.buildReport(ctx());
  assert.ok(h.includes('pd-foot') && h.includes('não substitui avaliação presencial') && h.includes('LARC vigente'));
  assert.ok(!/(href|src)="https?:/.test(h) && !/<script|onclick|<link/i.test(h));
  assert.equal(typeof L.generatePDFLaudo, 'undefined', 'sem window não expõe a parte de DOM');
});
