/* UI Dual-Experience: modos, Wizard do Mestre Wang, vitrine de packs, comparador e glossário. Isolado em IIFE. */
(function () {
  var M = window.MasterWangEngine, PK = window.MasterWangPacks.packs, T = window.MasterWangTranslator, S = window.GRSound, V = window.MasterWangViz, SH = window.MasterWangShare, PRC = window.MasterWangPricing, GEO = window.MasterWangGeometry, PR = window.GRProducts;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado: segue sem salvar */ } }
  };
  var play = function (n) { if (S && S.play) S.play(n); };

  /* ---------- Textos ---------- */
  var GRIP = { shakehand: 'Clássica (Shakehand)', penhold_rpb: 'Caneta Moderna / RPB (2 lados)', penhold_classic: 'Caneta Tradicional / Japonesa (1 lado)' };
  var STEPS = [
    { key: 'grip', title: 'Passo 1 de 5 · Empunhadura', q: 'Como você segura a raquete?', opts: [
      ['shakehand', GRIP.shakehand, 'Seguro como um aperto de mão, batendo dos dois lados.'],
      ['penhold_rpb', GRIP.penhold_rpb, 'Seguro como caneta e uso o verso da raquete para atacar de backhand.'],
      ['penhold_classic', GRIP.penhold_classic, 'Seguro como caneta e utilizo apenas a face da frente.']] },
    { key: 'goal', title: 'Passo 2 de 5 · Estilo de jogo e distância da mesa', q: 'Qual é o seu estilo, a sua distância da mesa e o seu objetivo?', opts: [
      ['learn_control', 'Aprender com segurança', 'Quero aprender os fundamentos com segurança, colocar todas as bolas na mesa e sair das raquetes de lazer/supermercado.'],
      ['spin_attacker', 'Aprender a puxar com efeito', 'Já sei rebater e quero aprender a puxar bolas com muito efeito (topspin) sem que a bola escape para fora.'],
      ['close_blocker', 'Jogar colado na mesa', 'Gosto de jogar colado na mesa, bloqueando rápido e controlando o ritmo do ponto.'],
      ['competitive_step', 'Primeiros torneios', 'Treino toda semana em clube/escolinha e quero uma raquete definitiva para disputar meus primeiros torneios.']] },
    { key: 'touch', title: 'Passo 3 de 5 · Sensação tátil', q: 'Que sensação você prefere no impacto?', opts: [
      ['soft', 'Macia e acolhedora', 'Sentir a bola afundar na borracha, dando mais tempo para direcionar o golpe.'],
      ['balanced', 'Equilibrada e nítida', 'Sentir o clique da bola com firmeza, mas sem perder o controle.'],
      ['crisp', 'Firme e direta', 'Batida mais seca e rápida para definir o ponto com potência.']] },
    { key: 'body', title: 'Passo 4 de 5 · Saúde articular e peso', q: 'Como está o seu condicionamento físico e a proteção das articulações?', opts: [
      ['light_safe', 'Leve e protegida (≤ 175 g)', 'Priorizo uma raquete bem leve (≤175g) para não cansar o braço e proteger meu punho, cotovelo e ombro.'],
      ['standard_athletic', 'Peso padrão (178–185 g)', 'Não tenho dores articulares e prefiro peso padrão (178g–185g) para ter mais estabilidade e peso de bola.']] },
    { key: 'freq', title: 'Passo 5 de 5 · Frequência de treino', q: 'Quantas vezes por semana você joga ou treina?', opts: [
      ['casual', 'Até 1 vez por semana', 'Jogo por lazer ou de vez em quando; quero uma raquete tolerante e fácil de usar.'],
      ['regular', '2 a 3 vezes por semana', 'Treino em clube ou escolinha de forma regular e estou evoluindo.'],
      ['intense', '4 vezes ou mais por semana', 'Rotina intensa de treino; preciso de um equipamento que acompanhe a minha evolução.']] }
  ];
  var FREQ_TXT = { casual: 'até 1 vez por semana', regular: '2 a 3 vezes por semana', intense: '4 vezes ou mais por semana' };
  var GOAL_TXT = { learn_control: 'aprender os fundamentos com segurança', spin_attacker: 'aprender a puxar topspin sem errar para fora', close_blocker: 'jogar colado na mesa com bloqueio rápido', competitive_step: 'disputar os primeiros torneios' };
  var GOAL_NEED = { learn_control: 'máxima margem de erro e controle', spin_attacker: 'arco alto e uma esponja que "abraça" a bola', close_blocker: 'estabilidade no bloqueio e transição rápida', competitive_step: 'equilíbrio entre potência e controle' };
  var TOUCH_TXT = { soft: 'macia', balanced: 'equilibrada', crisp: 'firme' };
  var BODY_TXT = { light_safe: 'um limite de até 175 g para poupar punho, cotovelo e ombro', standard_athletic: 'a faixa padrão de 178 a 185 g' };
  var SEV = { CRITICAL: 'Crítico', WARNING: 'Atenção', OPTIMAL: 'Ótimo' };
  var BARS = [['speed', 'Speed'], ['spin', 'Spin'], ['control', 'Control'], ['throwAngleBar', 'Throw Angle'], ['dwell', 'Dwell Time']];

  /* ---------- Estado ---------- */
  var state = { mode: store.get('mw-mode', 'guided'), tw: store.get('mw-tw', 'on') === 'on', grip: store.get('mw-grip', 'shakehand'),
    step: 0, answers: {}, last: null, compare: [], variant: {} };
  if (!GRIP[state.grip]) state.grip = 'shakehand';

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ---------- Modo ---------- */
  function applyMode(mode, persist) {
    state.mode = mode === 'pro' ? 'pro' : 'guided';
    document.body.setAttribute('data-mode', state.mode);
    $$('[data-set-mode]').forEach(function (b) { var on = b.getAttribute('data-set-mode') === state.mode; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    if (persist !== false) store.set('mw-mode', state.mode);
  }
  function modeOfHash(hash) {
    if (!hash || hash.length < 2) return null;
    var el = document.getElementById(decodeURIComponent(hash.slice(1)));
    var host = el && el.closest('[data-mode]');
    return host ? host.getAttribute('data-mode') : null;
  }
  function ensureModeFor(hash) { var m = modeOfHash(hash); if (m && m !== state.mode) applyMode(m); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (a) ensureModeFor(a.getAttribute('href'));
  });
  window.addEventListener('hashchange', function () { ensureModeFor(location.hash); });
  $$('[data-set-mode]').forEach(function (b) {
    b.addEventListener('click', function () { applyMode(b.getAttribute('data-set-mode')); play('tick'); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var next = state.mode === 'guided' ? 'pro' : 'guided'; applyMode(next); $('[data-set-mode="' + next + '"]').focus();
    });
  });

  /* ---------- Tradutor ---------- */
  function setTranslator(on, persist) {
    state.tw = T.setEnabled(on);
    var b = $('#twBtn'); b.setAttribute('aria-pressed', state.tw ? 'true' : 'false');
    b.textContent = '🧠 Tradutor do Mestre Wang: ' + (state.tw ? 'ON' : 'OFF');
    if (persist !== false) store.set('mw-tw', state.tw ? 'on' : 'off');
  }
  $('#twBtn').addEventListener('click', function () { setTranslator(!state.tw); play('tick'); });

  /* ---------- Cartões ---------- */
  function bars(m) {
    return '<div class="bars">' + BARS.map(function (b) {
      var v = m[b[0]], label = b[0] === 'throwAngleBar' ? b[1] + ' · ' + m.throwAngle : b[1];
      return '<div class="bar"><span class="bl">' + esc(label) + '</span><span class="track"><i style="--w:' + v + '%"></i></span><span class="bv">' + v + '</span></div>';
    }).join('') + '</div>';
  }
  function rubRow(side, r) {
    var h = r.hardnessESN != null ? ' · esponja ' + r.hardnessESN + '° ESN' : (r.hardnessNota ? ' · ' + r.hardnessNota : '');
    var flag = r.noCatalogo ? ' <span class="chip chip-warn">fora do catálogo</span>' : '';
    return '<tr><th>' + side + '</th><td>' + esc(r.nome) + ' · ' + esc(r.espessura) + esc(h) + flag + '</td></tr>';
  }
  function diagHtml(list) {
    if (!list.length) return '';
    return list.map(function (d) { return '<div class="diag d-' + d.severity.toLowerCase() + '"><span class="tag">' + (SEV[d.severity] || 'Aviso') + '</span>' + esc(d.message) + '</div>'; }).join('');
  }
  function physicsHtml(ev, grip) {
    var p = ev.physics, bh = grip === 'penhold_classic' ? '2 g (folha de cortiça)' : p.cutWeightBH + ' g';
    return '<div class="phys"><div class="phys-main"><b>' + p.totalWeight + ' g</b><span>peso total estimado (pese a sua raquete)</span></div>' +
      '<ul><li>Lâmina: ' + ev.pack.blade.weight + ' g</li><li>FH cortada: ' + p.cutWeightFH + ' g</li><li>BH: ' + bh + '</li><li>Montagem (cola + edge tape): ' + p.assemblyOverhead + ' g</li></ul>' +
      '<p class="bal">' + esc(p.balance) + '</p><p class="seal seal-' + ev.seal.code + '">🩺 ' + esc(ev.seal.label) + '</p></div>';
  }
  function verifyHtml(p) {
    return '<details class="verif"><summary>Dados a verificar</summary><ul>' + p.verificar.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') +
      '<li>Métricas 0–100 são perfil editorial, não notas de jogadores. Confirme as borrachas no LARC vigente.</li></ul></details>';
  }
  function variantHtml(p, grip, ctx) {
    if (!p.bhOptions || grip === 'penhold_classic') return '';
    return '<fieldset class="variant"><legend>Backhand deste pack</legend>' + p.bhOptions.map(function (opt) {
      return '<label><input type="radio" name="var-' + p.id + '-' + ctx + '" data-variant="' + p.id + '" value="' + opt.id + '"' + (opt.id === p.variantId ? ' checked' : '') + '><span>' + esc(opt.label) + '</span></label>';
    }).join('') + '</fieldset>';
  }
  function vizHtml(p) {
    return '<div class="viz-grid"><figure class="viz-fig"><figcaption>Radar de 5 eixos</figcaption>' + V.radarSvg([{ name: p.nome, color: '#00FF88', values: V.packValues(p.metrics) }]) + '</figure>' +
      '<figure class="viz-fig"><figcaption>Trajetória da bola · arco ' + esc(p.metrics.throwAngle) + '</figcaption>' + V.arcSvg(p.metrics.throwAngleBar, p.metrics.throwAngle) +
      '<p class="note">Ilustração esquemática a partir do Throw Angle editorial, não é simulação física.</p></figure></div>';
  }
  /* ---------- Preço e filtro de investimento ---------- */
  var PRICE_MAX = 3500, PRICE_STEP = 50;
  var ALL_ITEMS = PR.blades.concat(PR.rubbers, PR.pips);
  var FX_DEFAULT = PRC.fxEstimate(ALL_ITEMS) || 7;
  var ps = { lo: 0, hi: PRICE_MAX, unknown: true, fx: FX_DEFAULT };
  try { var sv = JSON.parse(store.get('mw-price', 'null')); if (sv && sv.hi >= sv.lo) { ps.lo = Math.max(0, +sv.lo || 0); ps.hi = Math.min(PRICE_MAX, +sv.hi || PRICE_MAX); ps.unknown = sv.unknown !== false; if (sv.fx > 0.5 && sv.fx < 30) ps.fx = +sv.fx; } } catch (e) { /* estado inválido: usa o padrão */ }
  var fxFmt = function (n) { return String(Math.round(n * 100) / 100).replace('.', ','); };
  function itemPrice(item) { return PRC.priceOf(item, ps.fx); }
  function itemPass(item) { var q = itemPrice(item); return PRC.inRange(q ? q.mid : null, ps.lo, ps.hi, ps.unknown); }
  function bandIcon(v) { var b = PRC.bandInfo(PRC.band(v)); return b ? b.icon : ''; }
  function itemText(item) {
    var q = itemPrice(item); if (!q) return '–';
    return bandIcon(q.mid) + ' ' + (q.estimated ? '≈ ' : '') + (q.min !== q.max ? PRC.fmtBRL(q.min) + '–' + PRC.fmtBRL(q.max).replace('R$ ', '') : PRC.fmtBRL(q.min));
  }
  function packPriceInfo(p) {
    var comps = [p.blade, p.fh, p.bh].map(function (c) { return c.catalogId ? PR.find(c.catalogId) : null; });
    var q = comps.map(itemPrice);
    return { sum: PRC.sumPrices(q), comps: comps, q: q, names: [p.blade.nome, p.fh.nome, p.bh.nome] };
  }
  function packPass(p) {
    var i = packPriceInfo(p);
    if (i.sum.complete) return PRC.inRange(i.sum.total, ps.lo, ps.hi, ps.unknown);
    if (i.sum.known && i.sum.total > ps.hi) return false;          // o preço real é no mínimo a soma parcial
    return ps.unknown;
  }
  function priceLine(p) {
    var i = packPriceInfo(p), b = PRC.bandInfo(PRC.band(i.sum.total));
    if (!i.sum.known) return 'sem preço disponível';
    return (i.sum.complete ? '' : 'a partir de ') + (i.sum.estimated ? '≈ ' : '') + PRC.fmtBRL(i.sum.total) + (i.sum.complete && b ? ' (' + b.label + ')' : ' (' + i.sum.known + ' de ' + i.sum.count + ' itens com preço)');
  }
  function priceHtml(p) {
    var i = packPriceInfo(p), b = PRC.bandInfo(PRC.band(i.sum.total));
    var head = !i.sum.known ? '<span class="price-none">Preço indisponível nos dados</span>' :
      '<span class="price-val">' + (i.sum.complete ? '' : 'a partir de ') + (i.sum.estimated ? '≈ ' : '') + PRC.fmtBRL(i.sum.total) + '</span>' +
      (i.sum.complete && b ? ' <span class="band band-' + b.id + '">' + b.icon + ' ' + esc(b.label) + ' (' + esc(b.range) + ')</span>' : ' <span class="chip chip-warn">preço parcial: ' + i.sum.known + ' de ' + i.sum.count + ' itens</span>');
    var rows = i.q.map(function (q, k) {
      var src = !q ? 'sem preço nos dados' : q.source === 'brl' ? 'R$ da loja' : 'US$ ' + Math.round(i.comps[k].usd) + ' × ' + fxFmt(ps.fx);
      return '<li>' + esc(i.names[k]) + ': ' + (q ? (q.estimated ? '≈ ' : '') + PRC.fmtBRL(q.mid) : '–') + ' <span class="note">(' + esc(src) + ')</span></li>';
    }).join('');
    return '<div class="price-line"><span class="price-lbl">Investimento estimado</span> ' + head + '</div>' +
      '<details class="verif"><summary>Como o preço foi estimado</summary><ul>' + rows + '</ul><p class="note">Sem serviços de montagem, frete ou impostos. Itens só com US$ usam o fator ' + fxFmt(ps.fx) + ' R$/US$ (ajustável no filtro).</p></details>';
  }
  window.MW_PRICE = { state: ps, pass: itemPass, text: itemText };

  function packCard(ev, o) {
    o = o || {}; var p = ev.pack, g = o.grip || state.grip;
    var cmp = o.compare ? '<label class="cmp"><input type="checkbox" data-cmp="' + p.id + '"' + (state.compare.indexOf(p.id) >= 0 ? ' checked' : '') + '> Comparar</label>' : '';
    return '<article class="card pack' + (o.main ? ' pack-main' : '') + '" data-pack="' + p.id + '"><div class="pack-head"><div><h3>' + esc((o.badge ? o.badge + ' · ' : 'Pack 0' + p.num + ': ') + p.nome) + (p.estilo ? ' <span class="estilo">(' + esc(p.estilo) + ')</span>' : '') + '</h3>' + (p.selo ? '<span class="selo">' + esc(p.selo) + '</span>' : '') + '<p class="note">' + esc(p.perfil) + '</p></div>' +
      (o.match ? '<div class="match" aria-label="Compatibilidade ' + ev.match + '%"><b>' + ev.match + '%</b><span>match</span></div>' : '') + '</div>' +
      '<table><tr><th>Lâmina</th><td>' + esc(p.blade.nome) + ' · ' + esc(p.blade.construcao) + ' · ' + p.blade.weight + ' g (est.)' +
      (p.blade.noCatalogo ? ' <span class="chip chip-warn">fora do catálogo</span>' : '') + '</td></tr>' + rubRow('Forehand', p.fh) +
      (g === 'penhold_classic' ? '<tr><th>Backhand</th><td>Folha de cortiça (caneta de 1 lado, +2 g)</td></tr>' : rubRow(g === 'penhold_rpb' ? 'Backhand (RPB)' : 'Backhand', p.bh)) + '</table>' +
      priceHtml(p) + physicsHtml(ev, g) + variantHtml(p, g, o.ctx || 'x') + vizHtml(p) + bars(p.metrics) + diagHtml(ev.diagnostics) +
      '<p class="leigo">💡 <b>Em português claro:</b> ' + esc(p.leigo) + '</p>' + (p.alternativas ? '<p class="note">' + esc(p.alternativas) + '</p>' : '') +
      (p.bh.corticaNota ? '<p class="note">' + esc(p.bh.corticaNota) + '</p>' : '') + verifyHtml(p) +
      (o.checklist ? checklistHtml(o.grip) : '') + cmp + '</article>';
  }
  function checklistItems(grip) {
    var items = [
      ['Selagem da madeira', 'Impermeabilize as bordas da lâmina antes de colar, para a umidade da cola não empenar a madeira.'],
      ['Colagem isenta de VOC', 'Use cola à base d\'água: o regulamento ITTF (3.2.4.1) exige adesivos sem solventes voláteis nocivos.'],
      ['Edge Tape', 'Aplique fita de borda de 10 ou 12 mm para proteger a lateral da lâmina.'],
      ['Cores ITTF', 'Um lado deve ser preto; o outro pode ser vermelho, rosa, violeta, verde ou azul.'],
      ['LARC', 'Confirme cada borracha na lista LARC vigente (a lista de 2026 vale até 31/12/2026).']
    ];
    if (grip === 'penhold_rpb') items.push(['Recorte para os dedos (RPB)', 'Deixe cerca de 1,5 a 2,0 cm livres na base do backhand para apoiar os dedos.']);
    if (grip === 'penhold_classic') items.push(['Verso em cortiça', 'Na caneta de 1 lado, o verso leva apenas folha de cortiça (+2 g).']);
    items.push(['Pese o conjunto', 'Os pesos mostrados são estimativas: confira na balança antes de comprar a lâmina definitiva.']);
    return items;
  }
  function checklistHtml(grip) {
    return '<div class="checklist"><h4>Checklist de montagem e conformidade</h4><ul>' + checklistItems(grip).map(function (i) { return '<li><b>' + esc(i[0]) + ':</b> ' + esc(i[1]) + '</li>'; }).join('') + '</ul></div>';
  }
  function animateBars(root) {
    $$('.bar .track i', root).forEach(function (i) { i.style.animation = 'none'; void i.offsetWidth; i.style.animation = ''; });
  }

  /* ---------- Wizard ---------- */
  function renderWizard() {
    var box = $('#wizardBox'), pct = Math.round((state.step / STEPS.length) * 100);
    $('#wizProgress').style.width = (state.step >= STEPS.length ? 100 : pct) + '%';
    $('#wizProgress').parentElement.setAttribute('aria-valuenow', state.step >= STEPS.length ? 100 : pct);
    if (state.step >= STEPS.length) { renderResult(); return; }
    var s = STEPS[state.step], cur = state.answers[s.key];
    box.innerHTML = '<div class="wiz-step" role="group" aria-labelledby="wizQ"><p class="wiz-title font-tech">' + s.title + '</p><h3 id="wizQ">' + esc(s.q) + '</h3><div class="opts" role="radiogroup" aria-labelledby="wizQ">' +
      s.opts.map(function (o) { return '<label class="opt"><input type="radio" name="wiz" value="' + o[0] + '"' + (cur === o[0] ? ' checked' : '') + '><span><b>' + esc(o[1]) + '</b><em>' + esc(o[2]) + '</em></span></label>'; }).join('') +
      '</div><div class="wiz-nav">' + (state.step > 0 ? '<button type="button" class="btn-ghost" id="wizBack">← Voltar</button>' : '<span></span>') +
      '<button type="button" id="wizNext"' + (cur ? '' : ' disabled') + '>' + (state.step === STEPS.length - 1 ? 'Ver meu laudo' : 'Continuar →') + '</button></div></div>';
    $$('input[name="wiz"]', box).forEach(function (r) { r.addEventListener('change', function () { state.answers[s.key] = r.value; $('#wizNext').disabled = false; play('tick'); }); });
    $('#wizNext').addEventListener('click', function () { if (!state.answers[s.key]) return; state.step++; renderWizard(); focusWizard(); });
    var back = $('#wizBack'); if (back) back.addEventListener('click', function () { state.step--; renderWizard(); focusWizard(); });
  }
  function focusWizard() { var h = $('#wizQ') || $('#laudoTitle'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }

  function recipeText(ev, answers) {
    var p = ev.pack, ph = ev.physics, g = answers.grip;
    var rub = function (r) { return r.nome + ' ' + r.espessura + (r.hardnessESN != null ? ' (' + r.hardnessESN + '° ESN)' : ''); };
    return ['RECEITA DE SETUP · Guia da Raquete (Mestre Wang)', 'Pack: ' + p.nome + ' · compatibilidade ' + ev.match + '%',
      'Empunhadura: ' + GRIP[g], 'Frequência de treino: ' + FREQ_TXT[answers.freq], 'Lâmina: ' + p.blade.nome + ' (' + p.blade.weight + ' g estimados)',
      'Forehand: ' + rub(p.fh), (g === 'penhold_classic' ? 'Backhand: folha de cortiça (+2 g)' : 'Backhand: ' + rub(p.bh)),
      'Peso total estimado: ' + ph.totalWeight + ' g (pese a sua raquete) · ' + ph.balance, 'Selo articular: ' + ev.seal.label, 'Investimento: ' + priceLine(ev.pack),
      'Serviços: colagem sem VOC (cola à base d\'água), edge tape, selagem da madeira.',
      'Conferir: LARC vigente e cores ITTF (um lado preto).', 'Dados a verificar: ' + p.verificar.join(' | ')].join('\n');
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); } catch (e) { reject(e); } finally { document.body.removeChild(ta); }
    });
  }

  function plainSummary(a) {
    return 'Empunhadura: ' + GRIP[a.grip] + '. Objetivo: ' + GOAL_TXT[a.goal] + '. Sensação: ' + TOUCH_TXT[a.touch] + '. Limite de peso: ' + (a.body === 'light_safe' ? 'até 175 g' : '178–185 g') + '. Treino: ' + FREQ_TXT[a.freq] + '.';
  }
  function shareData(ev, grip) {
    var p = ev.pack, r = function (x) { return x.nome + ' ' + x.espessura + (x.hardnessESN != null ? ' (' + x.hardnessESN + '° ESN)' : ''); };
    return { name: p.nome, match: ev.match, blade: p.blade.nome + ' (' + p.blade.weight + ' g est.)', fh: r(p.fh),
      bh: grip === 'penhold_classic' ? 'folha de cortiça (+2 g)' : r(p.bh), weight: ev.physics.totalWeight, balance: ev.physics.balance.split(' (')[0],
      seal: ev.seal.label, price: priceLine(p), alerts: ev.diagnostics.filter(function (d) { return d.severity !== 'OPTIMAL'; }).map(function (d) { return d.title; }) };
  }
  function whatsappUrl(rec, a) {
    var text = SH.fit({ summary: plainSummary(a), primary: shareData(rec.primary, a.grip), alternative: rec.alternative ? shareData(rec.alternative, a.grip) : null, url: location.href.split('#')[0] });
    return SH.buildWhatsAppUrl(text);
  }

  function renderResult() {
    var a = state.answers, rec = M.recommendPack(a, PK, state.variant), box = $('#wizardBox');
    state.last = rec; state.grip = a.grip; store.set('mw-grip', a.grip); syncGripSwitch(); renderShowcase();
    var w = a.body === 'light_safe' ? 'até 175 g' : '178–185 g', pr = rec.primary;
    var summary = 'Você segura a raquete no estilo <b>' + esc(GRIP[a.grip]) + '</b> e quer <b>' + esc(GOAL_TXT[a.goal]) + '</b>. Isso pede ' + esc(GOAL_NEED[a.goal]) +
      ', com sensação <b>' + esc(TOUCH_TXT[a.touch]) + '</b>, ' + esc(BODY_TXT[a.body]) + ' e treino de <b>' + esc(FREQ_TXT[a.freq]) + '</b>. ' +
      (pr ? 'O pack prescrito pesa cerca de <b>' + pr.physics.totalWeight + ' g</b> montado (alvo: ' + w + ').' : '');
    if (!pr) { box.innerHTML = '<div class="alert warn">Nenhum pack compatível com esta empunhadura.</div>'; return; }
    box.innerHTML = '<div class="laudo"><p class="wiz-title font-tech">Laudo técnico do Mestre Wang</p><h3 id="laudoTitle">Diagnóstico biomecânico</h3><p class="laudo-sum">' + summary + '</p>' +
      packCard(pr, { main: true, match: true, badge: 'Pack principal', checklist: true, grip: a.grip, ctx: 'main' }) +
      (rec.alternative ? packCard(rec.alternative, { match: true, badge: 'Pack alternativo', grip: a.grip, ctx: 'alt' }) :
        '<div class="alert info"><b>Sem pack alternativo</b>Nenhum outro pack homologado do catálogo atual tem lâmina compatível com esta empunhadura. Explore o Pro Lab para montar uma variação.</div>') +
      '<div class="laudo-actions"><button type="button" id="copyBtn">📋 Copiar Receita Completa do Setup</button><a class="btn-wa" id="waBtn" target="_blank" rel="noopener noreferrer" href="' + whatsappUrl(rec, a) + '">📲 Compartilhar Meu Diagnóstico no WhatsApp</a><button type="button" class="btn-cyan" id="cmpBtn">🔄 Comparar com Outros Packs</button><button type="button" class="btn-ghost" id="redoBtn">↺ Refazer diagnóstico</button></div></div>';
    $('#copyBtn').addEventListener('click', function () {
      copyText(recipeText(pr, a)).then(function () { toast('Receita copiada para a área de transferência.'); play('ok'); }, function () { toast('Não foi possível copiar automaticamente. Selecione e copie o texto manualmente.'); });
    });
    $('#cmpBtn').addEventListener('click', function () { openVersus(pr.pack.id, rec.alternative ? rec.alternative.pack.id : PK.filter(function (p) { return p.id !== pr.pack.id; })[0].id, a.grip); });
    $('#redoBtn').addEventListener('click', function () { state.step = 0; state.answers = {}; renderWizard(); focusWizard(); $('#wizard').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    animateBars(box); play('ok'); focusWizard();
  }

  document.addEventListener('change', function (e) {
    var r = e.target.closest && e.target.closest('input[data-variant]'); if (!r) return;
    var name = r.name, val = r.value; state.variant[r.getAttribute('data-variant')] = val;
    renderShowcase(); if (state.step >= STEPS.length) renderResult();
    var again = document.querySelector('input[name="' + name + '"][value="' + val + '"]'); if (again) again.focus({ preventScroll: true });
    if ($('#versus').open) renderVersus(); play('tick');
  });

  /* ---------- Filtro de preço (estilo imobiliário) ---------- */
  function pfHtml() {
    var sl = function (k, lbl) { return '<label>' + lbl + '<input type="range" min="0" max="' + PRICE_MAX + '" step="' + PRICE_STEP + '" data-pf="' + k + '"></label>'; };
    return '<div class="pf"><div class="pf-head"><b>Faixa de investimento</b> <output class="pf-out" aria-live="polite"></output></div>' +
      '<div class="pf-sliders">' + sl('lo', 'R$ mínimo') + sl('hi', 'R$ máximo') + '</div>' +
      '<div class="pf-chips" role="group" aria-label="Categorias de investimento">' + PRC.BANDS.map(function (b) {
        return '<button type="button" class="band band-' + b.id + '" data-band="' + b.id + '" aria-pressed="false"><span class="band-t">' + b.icon + ' ' + b.label + ' (' + b.range + ')</span><span class="band-n"></span></button>';
      }).join('') + '</div>' +
      '<div class="pf-opts"><label class="pf-unk"><input type="checkbox" data-pf="unk"> Incluir itens sem preço completo</label>' +
      '<label class="pf-fx">Fator R$/US$<input type="number" min="1" max="30" step="0.05" data-pf="fx"></label><button type="button" class="btn-ghost" data-pf="fxreset">Padrão (' + fxFmt(FX_DEFAULT) + ')</button></div>' +
      '<p class="note pf-note">Usa o R$ da loja quando existe; senão, US$ de referência × fator (mediana dos itens com preço nos dois formatos). Estimativa, sem frete, impostos ou montagem.</p></div>';
  }
  function pfCounts() {
    var c = {}; PRC.BANDS.forEach(function (b) { c[b.id] = { p: 0, l: 0, r: 0 }; });
    var add = function (list, key) { list.forEach(function (it) { var q = itemPrice(it); if (q && q.mid >= ps.lo && q.mid <= ps.hi) c[PRC.band(q.mid)][key]++; }); };
    add(PR.blades, 'l'); add(PR.rubbers, 'r'); add(PR.pips, 'r');
    PK.forEach(function (p) { var i = packPriceInfo(M.resolveVariant(p, state.variant[p.id])); if (i.sum.complete && i.sum.total >= ps.lo && i.sum.total <= ps.hi) c[PRC.band(i.sum.total)].p++; });
    return c;
  }
  function pfSync() {
    var c = pfCounts(), full = ps.lo === 0 && ps.hi === PRICE_MAX;
    ['#priceFilterShow', '#priceFilterCat'].forEach(function (sel) {
      var h = $(sel); if (!h) return;
      var set = function (k, v) { var el = $('[data-pf="' + k + '"]', h); if (el && document.activeElement !== el) el.value = v; };
      set('lo', ps.lo); set('hi', ps.hi); set('fx', ps.fx); $('[data-pf="unk"]', h).checked = ps.unknown;
      $('.pf-out', h).textContent = PRC.fmtBRL(ps.lo) + ' – ' + (ps.hi >= PRICE_MAX ? PRC.fmtBRL(PRICE_MAX) + '+' : PRC.fmtBRL(ps.hi)) + (full ? ' (todos)' : '');
      $$('[data-band]', h).forEach(function (b) {
        var band = PRC.bandInfo(b.getAttribute('data-band')), n = c[band.id];
        b.setAttribute('aria-pressed', (ps.lo === band.min && ps.hi === Math.min(band.max, PRICE_MAX)) ? 'true' : 'false');
        $('.band-n', b).textContent = n.p + (n.p === 1 ? ' pack' : ' packs') + ' · ' + n.l + (n.l === 1 ? ' lâmina' : ' lâminas') + ' · ' + n.r + (n.r === 1 ? ' borracha' : ' borrachas');
      });
    });
  }
  function pfChanged(structural) {
    store.set('mw-price', JSON.stringify({ lo: ps.lo, hi: ps.hi, unknown: ps.unknown, fx: ps.fx }));
    pfSync();
    if (structural) { renderShowcase(); if (state.step >= STEPS.length) renderResult(); } else applyShowcaseFilter();
    window.dispatchEvent(new Event('mw-price'));
  }
  function pfBind(h) {
    h.innerHTML = pfHtml();
    h.addEventListener('input', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-pf');
      if (k === 'lo') { ps.lo = +e.target.value; if (ps.lo > ps.hi) ps.hi = ps.lo; } else if (k === 'hi') { ps.hi = +e.target.value; if (ps.hi < ps.lo) ps.lo = ps.hi; } else return;
      pfChanged(false);
    });
    h.addEventListener('change', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-pf');
      if (k === 'unk') { ps.unknown = e.target.checked; pfChanged(false); play('tick'); }
      else if (k === 'fx') { var v = parseFloat(e.target.value); if (v >= 1 && v <= 30) { ps.fx = v; pfChanged(true); } }
    });
    h.addEventListener('click', function (e) {
      var b = e.target.closest('[data-band]'), r = e.target.closest('[data-pf="fxreset"]');
      if (b) {
        var band = PRC.bandInfo(b.getAttribute('data-band')), on = b.getAttribute('aria-pressed') === 'true';
        ps.lo = on ? 0 : band.min; ps.hi = on ? PRICE_MAX : Math.min(band.max, PRICE_MAX); pfChanged(false); play('tick');
      } else if (r) { ps.fx = FX_DEFAULT; pfChanged(true); play('tick'); }
    });
  }

  /* ---------- Vitrine ---------- */
  function syncGripSwitch() { $$('input[name="showGrip"]').forEach(function (r) { r.checked = r.value === state.grip; }); }
  function renderShowcase() {
    var profile = { grip: state.grip, goal: 'learn_control', touch: 'balanced', body: 'standard_athletic', level: 'intermediario' };
    var cards = PK.map(function (p) { var ev = M.evaluatePack(p, profile, state.variant[p.id]); return packCard(ev, { compare: true, grip: state.grip, ctx: 'show' }); });
    $('#packGrid').innerHTML = cards.join(''); applyShowcaseFilter();
    $$('[data-cmp]').forEach(function (c) { c.addEventListener('change', function () {
      var id = c.getAttribute('data-cmp'), i = state.compare.indexOf(id);
      if (c.checked) { if (state.compare.length >= 2) { c.checked = false; toast('Selecione no máximo 2 packs.'); return; } state.compare.push(id); } else if (i >= 0) state.compare.splice(i, 1);
      updateCmpBar(); play('tick');
    }); });
    updateCmpBar();
  }
  function applyShowcaseFilter() {
    var shown = 0;
    $$('#packGrid [data-pack]').forEach(function (el) {
      var p = PK.filter(function (x) { return x.id === el.getAttribute('data-pack'); })[0];
      var ok = packPass(M.resolveVariant(p, state.variant[p.id])); el.hidden = !ok; if (ok) shown++;
    });
    var c = $('#packCount'); if (c) c.textContent = shown + ' de ' + PK.length + ' packs na faixa de investimento escolhida';
    var e = $('#packEmpty'); if (e) e.hidden = shown > 0;
  }
  function updateCmpBar() {
    var b = $('#cmpSel'); b.textContent = 'Comparar selecionados (' + state.compare.length + '/2)'; b.disabled = state.compare.length !== 2;
  }
  $$('input[name="showGrip"]').forEach(function (r) { r.addEventListener('change', function () { state.grip = r.value; store.set('mw-grip', r.value); renderShowcase(); play('tick'); }); });
  $('#cmpSel').addEventListener('click', function () { openVersus(state.compare[0], state.compare[1], state.grip); });

  /* ---------- Comparador ---------- */
  var dlg = $('#versus'), lastFocus = null;
  function openVersus(aId, bId, grip) {
    lastFocus = document.activeElement;
    var opt = PK.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('');
    $('#vsA').innerHTML = opt; $('#vsB').innerHTML = opt; $('#vsA').value = aId; $('#vsB').value = bId;
    $('#vsGrip').value = grip || state.grip; renderVersus();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    $('#vsClose').focus();
  }
  function renderVersus() {
    var g = $('#vsGrip').value, prof = { grip: g, goal: 'learn_control', touch: 'balanced', body: 'standard_athletic', level: 'intermediario' };
    var pa = PK.filter(function (p) { return p.id === $('#vsA').value; })[0], pb = PK.filter(function (p) { return p.id === $('#vsB').value; })[0];
    var A = M.evaluatePack(pa, prof, state.variant[pa.id]), B = M.evaluatePack(pb, prof, state.variant[pb.id]);
    var rows = [['speed', 'Velocidade (Speed)', 1], ['spin', 'Efeito (Spin)', 1], ['control', 'Controle (Control)', 1], ['throwAngleBar', 'Arco (Throw Angle)', 1], ['dwell', 'Retenção (Dwell Time)', 1]];
    var html = rows.map(function (r) {
      var a = A.pack.metrics[r[0]], b = B.pack.metrics[r[0]], win = a === b ? '' : a > b ? 'A' : 'B';
      return '<div class="vs-row' + (r[0] === 'control' ? ' ctrl' : '') + '"><span class="vs-l">' + r[1] + '</span><div class="vs-bars"><div class="vs-bar a' + (win === 'A' ? ' vs-win' : '') + '"><i style="--w:' + a + '%"></i><b>' + a + '</b></div><div class="vs-bar b' + (win === 'B' ? ' vs-win' : '') + '"><i style="--w:' + b + '%"></i><b>' + b + '</b></div></div></div>';
    }).join('');
    var wa = A.physics.totalWeight, wb = B.physics.totalWeight, max = Math.max(wa, wb, 1);
    html += '<div class="vs-row"><span class="vs-l">Peso montado (g)</span><div class="vs-bars"><div class="vs-bar a' + (wa < wb ? ' vs-win' : '') + '"><i style="--w:' + Math.round(wa / max * 100) + '%"></i><b>' + wa + '</b></div><div class="vs-bar b' + (wb < wa ? ' vs-win' : '') + '"><i style="--w:' + Math.round(wb / max * 100) + '%"></i><b>' + wb + '</b></div></div></div>';
    var ia = packPriceInfo(A.pack).sum, ib = packPriceInfo(B.pack).sum, priceSum = '';
    if (ia.known || ib.known) {
      var mx = Math.max(ia.total, ib.total, 1), both = ia.complete && ib.complete, lbl = function (x) { return (x.complete ? '' : '≥ ') + x.total; };
      html += '<div class="vs-row"><span class="vs-l">Preço estimado (R$)</span><div class="vs-bars"><div class="vs-bar a' + (both && ia.total < ib.total ? ' vs-win' : '') + '"><i style="--w:' + Math.round(ia.total / mx * 100) + '%"></i><b>' + lbl(ia) + '</b></div><div class="vs-bar b' + (both && ib.total < ia.total ? ' vs-win' : '') + '"><i style="--w:' + Math.round(ib.total / mx * 100) + '%"></i><b>' + lbl(ib) + '</b></div></div></div>';
      priceSum = both ? (ia.total === ib.total ? 'Preços estimados equivalentes.' : '<span class="v-easy">💰 Mais acessível:</span> ' + esc((ia.total < ib.total ? A : B).pack.nome) + ' (≈ ' + PRC.fmtBRL(Math.min(ia.total, ib.total)) + ' contra ' + PRC.fmtBRL(Math.max(ia.total, ib.total)) + ', diferença de ' + PRC.fmtBRL(Math.abs(ia.total - ib.total)) + ').')
        : '<span class="v-hard">💰 Comparação de preço parcial:</span> há itens sem preço nos dados (valores com "≥" são só a soma dos itens com preço).';
    }
    var ca = A.pack.metrics.control, cb = B.pack.metrics.control, easy, hard;
    if (ca === cb) { easy = 'Empate em controle: ambos têm a mesma margem de erro.'; hard = ''; }
    else { var e = ca > cb ? A : B, h = ca > cb ? B : A; easy = '<span class="v-easy">✔ Mais fácil de controlar:</span> ' + esc(e.pack.nome) + ' (Control ' + e.pack.metrics.control + ').'; hard = '<span class="v-hard">⚠ Exige mais técnica:</span> ' + esc(h.pack.nome) + ' (Control ' + h.pack.metrics.control + ').'; }
    $('#vsBody').innerHTML = '<div class="vs-legend"><span class="la">A · ' + esc(A.pack.nome) + '</span><span class="lb">B · ' + esc(B.pack.nome) + '</span></div>' +
      '<div class="vs-radar">' + V.radarSvg([{ name: 'A ' + A.pack.nome, color: '#00E5FF', values: V.packValues(A.pack.metrics) }, { name: 'B ' + B.pack.nome, color: '#FF2A5F', values: V.packValues(B.pack.metrics) }], { className: 'rd-svg rd-versus' }) + '</div>' + html +
      '<p class="vs-sum">' + easy + '</p>' + (hard ? '<p class="vs-sum">' + hard + '</p>' : '') + (priceSum ? '<p class="vs-sum">' + priceSum + '</p>' : '') +
      '<p class="note">Pesos calculados para ' + esc(GRIP[g]) + ' (estimativa). Métricas são o perfil editorial de cada pack.' + (A.handleOk && B.handleOk ? '' : ' Um dos packs usa lâmina de cabo diferente da empunhadura escolhida.') + '</p>';
    animateBars($('#vsBody'));
  }
  ['#vsA', '#vsB', '#vsGrip'].forEach(function (s) { $(s).addEventListener('change', function () { renderVersus(); play('tick'); }); });
  $('#vsClose').addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
  dlg.addEventListener('close', function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- Glossário ---------- */
  var GLOSS = [
    ['Dwell Time', 'Tempo de Abraço da Bola', 'É o tempo em que a bola fica em contato com a borracha. Esponja macia e madeira flexível seguram a bola por mais tempo: você sente "abraçar" e direciona melhor.'],
    ['Throw Angle', 'Altura da Janela sobre a Rede', 'Ângulo com que a bola deixa a raquete. Arco alto cria uma janela folgada acima da rede; arco baixo sai mais reto, rápido e exige mais precisão.'],
    ['Sweet Spot', 'Zona que Perdoa Erros', 'Região da raquete onde o impacto rende bem mesmo fora do centro. Lâminas de madeira costumam ter uma zona maior e mais tolerante.'],
    ['All-Wood vs. Inner/Outer Carbon', 'Sensação Pura vs. Explosão', 'All-Wood: toque puro, mais controle. Carbono interno: toque próximo ao da madeira com mais potência. Carbono externo: resposta mais direta, rápida e dura, com menor margem de erro.'],
    ['Guia de Cuidados', 'Como conservar o seu setup', 'Limpe a borracha sem álcool (pano levemente úmido ou limpador específico). Guarde com a película protetora. Mantenha a fita de borda (edge tape) íntegra e selada a madeira. Evite calor e porta-malas de carro.']
  ];
  $('#glossList').innerHTML = GLOSS.map(function (g, i) {
    return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(g[0]) + ' <span class="gl-as">→ ' + esc(g[1]) + '</span></summary><p>' + esc(g[2]) + '</p></details>';
  }).join('');

  /* ---------- Geometria do sweet spot (oval × hexágono estilo Cybershape) ---------- */
  var pct1 = function (x) { return Math.abs(x) < 0.05 ? '≈ 0%' : (x > 0 ? '+' : '−') + Math.abs(x).toFixed(1).replace('.', ',') + '%'; };
  function renderGeometry() {
    var r = $('input[name="geoMode"]:checked'), mode = r ? r.value : 'overlay', a = GEO.areas();
    $('#geoFig').innerHTML = GEO.geometrySvg(mode);
    $('#geoStats').innerHTML =
      '<div class="geo-stat geo-up"><b>' + pct1(a.upperGainPct) + '</b><span>área útil na metade superior</span><em class="chip chip-warn">valor informado, não verificado</em></div>' +
      '<div class="geo-stat"><b>' + pct1(a.lowerGainPct) + '</b><span>na metade inferior (aparada), só no desenho</span></div>' +
      '<div class="geo-stat"><b>' + pct1((a.totalRatio - 1) * 100) + '</b><span>na área total, no desenho</span></div>';
  }
  $$('input[name="geoMode"]').forEach(function (r) { r.addEventListener('change', function () { renderGeometry(); play('tick'); }); });

  /* ---------- Auditoria de sinergia no Pro Lab (pack real) ---------- */
  function auditComp(p) {
    if (!p) return null; var d = p.dureza;
    return { id: p.id, nome: p.marca + ' ' + p.modelo, classe: p.classe || null, construcao: p.construcao || '', rigidez: p.stiffness || null, hardnessESN: d && d.escala === 'ESN' ? (d.min + d.max) / 2 : null };
  }
  function renderAudit() {
    var host = $('#rOut'); if (!host) return;
    $$('.mw-audit', host).forEach(function (n) { n.remove(); });
    var b = PR.find($('#rBlade').value), f = PR.find($('#rFh').value), k = PR.find($('#rBh').value); if (!b || !f || !k) return;
    var level = $('#rLevel').value === 'beginner' ? 'iniciante' : 'intermediario';
    var d = M.auditMechanicalSynergy({ blade: auditComp(b), fh: auditComp(f), bh: auditComp(k), profile: { level: level, grip: 'shakehand' }, physics: null });
    var div = document.createElement('div'); div.className = 'mw-audit';
    div.innerHTML = '<h4>🧠 Auditoria do Mestre Wang</h4>' + (d.length ? diagHtml(d) : '<p class="note">Nenhum erro mecânico detectado. Regras sem dado (por exemplo, dureza ESN ou classe da lâmina ausentes) ficam desligadas, e não presumidas.</p>');
    host.appendChild(div);
  }
  $('#packreal').addEventListener('change', renderAudit);

  /* ---------- Altura do cabeçalho fixo (âncoras não ficam escondidas) ---------- */
  function syncHeaderHeight() { var h = $('.top'); if (h) document.documentElement.style.setProperty('--hh', h.offsetHeight + 'px'); }
  window.addEventListener('resize', syncHeaderHeight); window.addEventListener('load', syncHeaderHeight);

  /* ---------- Inicialização ---------- */
  syncHeaderHeight();
  T.init($('main'));
  applyMode(state.mode, false);
  setTranslator(state.tw, false);
  ['#priceFilterShow', '#priceFilterCat'].forEach(function (sel) { var h = $(sel); if (h) pfBind(h); });
  syncGripSwitch(); renderWizard(); renderShowcase(); pfSync(); renderGeometry(); renderAudit(); window.dispatchEvent(new Event('mw-price'));
  if (location.hash) { ensureModeFor(location.hash); var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) setTimeout(function () { t.scrollIntoView(); }, 0); }
})();
