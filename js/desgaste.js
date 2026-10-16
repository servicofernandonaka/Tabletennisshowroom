/* Calculadora de Desgaste e Vida Útil da Borracha ("Quando trocar?"): interface. A matemática vive em MasterWangEngine
   (calculateRubberLifespan, assessRubberWear, recommendReplacement). Isolado em IIFE. */
(function () {
  var M = window.MasterWangEngine, PR = window.GRProducts, S = window.GRSound, box = document.getElementById('desgasteBox');
  if (!M || !box) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var f1 = function (x) { return String(Math.round(x * 10) / 10).replace('.', ','); };
  var play = function (n) { if (S && S.play) S.play(n); };
  var KEY = 'mw-desgaste';
  var TYPES = ['tensor', 'tacky', 'short_pips', 'long_pips'];
  var BADGE = { alta: 'alta', 'média': 'média', baixa: 'baixa' };

  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && TYPES.indexOf(o.type) >= 0 ? o : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ type: st.type, hours: st.hours, used: st.used })); } catch (e) { /* sem armazenamento: segue sem salvar */ } }
  var saved = load() || {};
  var st = { type: saved.type || 'tensor', hours: Math.min(20, Math.max(1, +saved.hours || 6)), used: saved.used > 0 ? +saved.used : '', signals: [], picks: null };

  box.innerHTML =
    '<div class="lf">' +
    '<fieldset class="lf-types"><legend>Tipo de borracha</legend>' + TYPES.map(function (t) {
      var d = M.RUBBER_LIFE[t];
      return '<label class="lf-type"><input type="radio" name="lfType" value="' + t + '"><span><b>' + esc(d.label) + '</b><em>' + esc(d.models) + '</em></span></label>';
    }).join('') + '</fieldset>' +
    '<div class="lf-inputs"><label class="lf-hours">Horas de treino por semana <output id="lfHoursOut" class="lf-out"></output>' +
    '<input type="range" id="lfHours" min="1" max="20" step="1" aria-describedby="lfHoursOut"></label>' +
    '<label class="lf-used">Há quantos meses você usa esta borracha? <span class="note">(opcional)</span><input type="number" id="lfUsed" min="0" max="120" step="0.5" inputmode="decimal" placeholder="ex.: 4"></label></div>' +
    '<article class="card lf-result" aria-live="polite"><p class="lf-sentence" id="lfSentence" data-no-tw></p><div id="lfBar"></div><ul class="lf-legend" id="lfLegend"></ul><p class="lf-tip" id="lfTip"></p><p class="note" id="lfNote"></p></article>' +
    '<article class="card lf-check"><h3>Checklist de desgaste real</h3><p class="note">Marque o que você observa na sua borracha. Os sinais valem mais do que a contagem de horas.</p><div id="lfSigns" class="lf-signs"></div><div id="lfVerdict" class="lf-verdict" aria-live="polite"></div></article>' +
    '<div class="lf-actions"><button type="button" class="btn-cyan" id="lfRepl">🛒 Sugerir borracha para reposição</button></div><div id="lfPicks" aria-live="polite"></div></div>';

  function renderBar(life, used) {
    var seg = life.segments, tot = seg.total, pos = used > 0 ? Math.min(used / tot * 100, 100) : null;
    var over = used > 0 && used > tot;
    $('#lfBar').innerHTML = '<div class="lf-bar" role="img" aria-label="Linha do tempo da borracha: desempenho pleno até ' + f1(life.months.warn) + ' meses, atenção até ' + f1(life.months.min) + ' meses e janela de troca até ' + f1(life.months.max) + ' meses">' +
      '<i class="lf-seg lf-s-ok" style="flex-grow:' + seg.ok + '"></i><i class="lf-seg lf-s-att" style="flex-grow:' + seg.attention + '"></i><i class="lf-seg lf-s-rep" style="flex-grow:' + seg.replace + '"></i>' +
      (pos != null ? '<span class="lf-mark" style="left:' + pos + '%"><b>' + (over ? 'além da estimativa' : 'você: ' + f1(used) + ' m') + '</b></span>' : '') + '</div>';
  }
  function renderResult() {
    var life = M.calculateRubberLifespan({ type: st.type, hoursPerWeek: st.hours }), used = +st.used || 0;
    $('#lfSentence').innerHTML = esc(life.sentence).replace(life.text, '<b>' + esc(life.text) + '</b>');
    renderBar(life, used);
    $('#lfLegend').innerHTML =
      '<li><span class="lf-dot lf-d-ok"></span><b>Desempenho pleno:</b> até ~' + f1(life.months.warn) + ' meses (' + Math.round(M.RUBBER_LIFE[st.type].warnAt * 100) + '% da vida de referência, cerca de ' + Math.round(life.hours.warn) + ' h)</li>' +
      '<li><span class="lf-dot lf-d-att"></span><b>Atenção:</b> de ' + f1(life.months.warn) + ' a ' + f1(life.months.min) + ' meses</li>' +
      '<li><span class="lf-dot lf-d-rep"></span><b>Janela de troca:</b> de ' + f1(life.months.min) + ' a ' + f1(life.months.max) + ' meses (' + life.hours.min + ' a ' + life.hours.max + ' h de jogo)</li>';
    $('#lfTip').innerHTML = '💡 ' + esc(life.tip);
    $('#lfNote').innerHTML = 'Estimativa de referência (não é medição): depende de técnica, limpeza, umidade e poeira.' +
      (life.longLife ? ' <b>Com tão pouco uso, o envelhecimento pelo tempo tende a antecipar a troca: confie mais no checklist abaixo.</b>' : '');
    renderVerdict();
  }
  function renderSigns() {
    var sig = M.wearSignals(st.type); st.signals = st.signals.filter(function (id) { return sig.some(function (x) { return x.id === id; }); });
    $('#lfSigns').innerHTML = sig.map(function (x) {
      return '<label class="lf-sign"><input type="checkbox" data-sig="' + x.id + '"' + (st.signals.indexOf(x.id) >= 0 ? ' checked' : '') + '><span><b>' + x.icon + ' ' + esc(x.label) + '</b><em>' + esc(x.desc) + '</em></span></label>';
    }).join('');
  }
  function renderVerdict() {
    var a = M.assessRubberWear({ type: st.type, hoursPerWeek: st.hours, monthsInUse: st.used, signals: st.signals });
    var label = { ok: '✅ Em bom estado', attention: '⚠️ Planeje a troca', replace: '🛑 Troque agora' }[a.level];
    $('#lfVerdict').className = 'lf-verdict lf-v-' + a.level;
    $('#lfVerdict').innerHTML = '<p class="lf-v-title">' + label + '</p><p>' + esc(a.message) + '</p><ul>' + a.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>';
  }

  function priceActive() { var s = window.MW_PRICE && window.MW_PRICE.state; return !!(s && (s.lo > 0 || s.hi < 3500)); }
  function renderPicks() {
    var host = $('#lfPicks'), P = window.MW_PRICE;
    var r = M.recommendReplacement(PR.rubbers.concat(PR.pips), { type: st.type, hoursPerWeek: st.hours, pass: priceActive() ? P.pass : null });
    if (!r.picks.length) { host.innerHTML = '<div class="alert info"><b>Sem sugestão</b>Nenhum item deste tipo tem dados suficientes no catálogo. Consulte o Pro Lab.</div>'; return; }
    var def = M.RUBBER_LIFE[st.type];
    host.innerHTML = '<div class="lf-picks"><h3>Reposição sugerida para ' + esc(def.label) + '</h3>' +
      (priceActive() ? '<p class="note">' + (r.budgetIgnored ? 'Nenhum item cabe na faixa de investimento escolhida; mostrando sem filtro de preço.' : 'Respeitando a faixa de investimento escolhida (R$ ' + P.state.lo + ' a ' + P.state.hi + ').') + '</p>' : '') +
      '<ol class="lf-list">' + r.picks.map(function (p, i) {
        var it = PR.find(p.id), price = P ? P.text(it) : '–';
        return '<li class="card lf-pick"><span class="lf-rank">' + (i + 1) + '</span><div><h4>' + esc(p.name) + '</h4><p>' + esc(p.why) + '</p><p class="note">Preço estimado: ' + esc(price) + ' · <span class="badge ' + esc(BADGE[p.confidence] || 'sem') + '">confiança ' + esc(p.confidence) + '</span></p>' +
          '<button type="button" class="btn-ghost" data-cat="' + esc(p.search) + '" data-kind="' + r.kind + '">Ver no catálogo</button></div></li>';
      }).join('') + '</ol><p class="note">Sugestões vêm das notas de jogadores do catálogo (Revspin, coleta out/2026, não verificadas de forma independente). Confira o LARC vigente antes de comprar.</p></div>';
    st.picks = r;
  }

  function sync(controls) {
    $$('input[name="lfType"]').forEach(function (r) { r.checked = r.value === st.type; });
    $('#lfHours').value = st.hours; $('#lfHoursOut').textContent = st.hours + (st.hours === 1 ? ' hora' : ' horas') + ' por semana';
    if (controls !== false && document.activeElement !== $('#lfUsed')) $('#lfUsed').value = st.used === '' ? '' : st.used;
  }
  box.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'lfType') { st.type = t.value; st.signals = []; renderSigns(); $('#lfPicks').innerHTML = ''; sync(); renderResult(); save(); play('tick'); }
    else if (t.hasAttribute('data-sig')) { var id = t.getAttribute('data-sig'), i = st.signals.indexOf(id); if (t.checked && i < 0) st.signals.push(id); else if (!t.checked && i >= 0) st.signals.splice(i, 1); renderVerdict(); play('tick'); }
    else if (t.id === 'lfUsed') { var v = parseFloat(t.value); st.used = v > 0 ? Math.min(120, v) : ''; renderResult(); save(); }
  });
  box.addEventListener('input', function (e) {
    if (e.target.id === 'lfHours') { st.hours = +e.target.value; sync(false); renderResult(); save(); if ($('#lfPicks').innerHTML) renderPicks(); }
    else if (e.target.id === 'lfUsed') { var v = parseFloat(e.target.value); st.used = v > 0 ? Math.min(120, v) : ''; renderResult(); save(); }
  });
  box.addEventListener('click', function (e) {
    var b = e.target.closest('#lfRepl'), c = e.target.closest('[data-cat]');
    if (b) { renderPicks(); play('ok'); }
    else if (c) {
      var kind = c.getAttribute('data-kind'), type = $('#cType'), search = $('#cSearch'); if (!type || !search) return;
      var pro = document.querySelector('[data-set-mode="pro"]'); if (pro) pro.click();
      type.value = kind === 'pips' ? 'pips' : 'rubbers'; type.dispatchEvent(new Event('change', { bubbles: true }));
      search.value = c.getAttribute('data-cat'); search.dispatchEvent(new Event('input', { bubbles: true }));
      var cat = document.getElementById('catalogo'); if (cat) cat.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  renderSigns(); sync(); renderResult();
})();
