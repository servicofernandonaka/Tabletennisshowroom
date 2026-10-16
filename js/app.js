(function () {
  var C = window.GRCatalog, E = window.GREngine, S = window.GRSound;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var LABEL = { speed: 'Speed', spin: 'Spin', control: 'Control', throwAngle: 'Throw Angle', dwell: 'Dwell Time' };
  var SEV = { block: 'Bloqueado', critical: 'Crítico', warn: 'Atenção', info: 'Informação' };
  var BAL = { 'head-heavy': 'Head-heavy (potência de loop)', 'head-light': 'Head-light (velocidade de transição)', neutral: 'Neutro' };

  function radarSvg(r, labels) {
    labels = labels || LABEL;
    var keys = Object.keys(labels), cx = 110, cy = 100, R = 70, pts = [], rings = '';
    var pt = function (i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / keys.length; return [cx + R * v / 10 * Math.cos(a), cy + R * v / 10 * Math.sin(a)]; };
    [2.5, 5, 7.5, 10].forEach(function (lv) { rings += '<polygon class="grid" points="' + keys.map(function (_, i) { return pt(i, lv).join(','); }).join(' ') + '"/>'; });
    var labels = keys.map(function (k, i) { var p = pt(i, 12.3); return '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle">' + labels[k] + ' ' + r[k] + '</text>'; }).join('');
    keys.forEach(function (k, i) { pts.push(pt(i, r[k]).join(',')); });
    return '<svg class="radar" viewBox="0 0 220 200" role="img" aria-label="Radar de desempenho">' + rings + '<polygon class="shape" points="' + pts.join(' ') + '"/>' + labels + '</svg>';
  }
  function alertsHtml(alerts) {
    if (!alerts.length) return '<div class="alert ok"><b>Sem alertas de sinergia.</b></div>';
    return alerts.map(function (a) { return '<div class="alert ' + a.severity + '"><span class="tag">' + SEV[a.severity] + '</span><b>' + esc(a.title) + '</b>' + esc(a.message) + '</div>'; }).join('');
  }
  function whyHtml(r) { return r && r.length ? '<ul class="why"><strong>Por que este kit?</strong>' + r.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function servicesHtml(sv) { return sv && sv.length ? '<ul class="why"><strong>Serviços incluídos</strong>' + sv.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function sideRow(side, sel) {
    var r = E.byId(C.rubbers, sel.rubberId), t = r.thicknesses.filter(function (x) { return x.id === sel.thicknessId; })[0] || r.thicknesses[0];
    return '<tr><th>' + side + '</th><td>' + esc(r.name) + ' · ' + esc(t.label) + ' · esponja ' + { soft: 'macia', medium: 'média', hard: 'dura' }[r.sponge] + '</td></tr>';
  }
  function specCard(setup, alerts, title, reasons, services) {
    var b = E.byId(C.blades, setup.bladeId), w = E.estimateWeight(setup), r = E.radar(setup);
    return '<article class="card"><h3>' + esc(title) + '</h3><div class="row"><div><table>' +
      '<tr><th>Lâmina</th><td>' + esc(b.name) + ' (' + b.cls + ') · ' + esc(b.layers) + '</td></tr>' + sideRow('Forehand', setup.fh) + sideRow('Backhand', setup.bh) +
      '<tr><th>Peso da lâmina</th><td>' + b.weight[0] + '–' + b.weight[1] + ' g (estimativa)</td></tr><tr><th>Conjunto pronto</th><td>~' + w.min + '–' + w.max + ' g (estimativa)</td></tr>' +
      '<tr><th>Balance point</th><td>' + BAL[E.balancePoint(setup)] + '</td></tr>' +
      '<tr><th>Throw angle</th><td>' + E.throwLabel(r.throwAngle) + '</td></tr></table></div><div>' + radarSvg(r) + '</div></div>' + whyHtml(reasons) + servicesHtml(services) + alertsHtml(alerts) + '</article>';
  }

  $('#quizForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var p = {}; new FormData(e.target).forEach(function (v, k) { p[k] = v; });
    var rec = E.recommend(p, 3);
    $('#results').innerHTML = rec.length ? rec.map(function (x, i) { return specCard(x.setup, x.alerts, 'Kit ' + (i + 1), x.reasons); }).join('') : '<div class="alert warn">Nenhuma combinação viável para este perfil.</div>';
  });

  function sel(id, label, opts) { return '<label>' + label + '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join('') + '</select></label>'; }
  function thOpts(rid) { return E.byId(C.rubbers, rid).thicknesses.map(function (t) { return [t.id, t.label]; }); }
  var rubOpts = C.rubbers.map(function (r) { return [r.id, r.name]; });
  $('#packForm').innerHTML = sel('pBlade', 'Lâmina', C.blades.map(function (b) { return [b.id, b.name + ' (' + b.cls + ')']; })) +
    sel('pFh', 'Borracha FH', rubOpts) + sel('pFhT', 'Espessura FH', thOpts(rubOpts[0][0])) +
    sel('pBh', 'Borracha BH', rubOpts) + sel('pBhT', 'Espessura BH', thOpts(rubOpts[0][0])) +
    sel('pLevel', 'Seu nível', [['intermediate', 'Intermediário'], ['beginner', 'Iniciante'], ['advanced', 'Avançado'], ['pro', 'Profissional']]);
  function refill(selId, rid) { $(selId).innerHTML = thOpts(rid).map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join(''); }
  function packUpdate() {
    var setup = { bladeId: $('#pBlade').value, fh: { rubberId: $('#pFh').value, thicknessId: $('#pFhT').value }, bh: { rubberId: $('#pBh').value, thicknessId: $('#pBhT').value } };
    $('#packOut').innerHTML = specCard(setup, E.validateSetup(setup, { level: $('#pLevel').value }), 'Seu pack', null, [].slice.call(document.querySelectorAll('#services input:checked')).map(function (i) { return i.value; }));
    var al = E.validateSetup(setup, { level: $('#pLevel').value }); S.play(al.some(function (a) { return a.severity === 'critical' || a.severity === 'block'; }) ? 'crit' : al.some(function (a) { return a.severity === 'warn'; }) ? 'warn' : 'ok');
  }
  $('#packForm').addEventListener('change', function (e) {
    if (e.target.id === 'pFh') refill('#pFhT', e.target.value);
    if (e.target.id === 'pBh') refill('#pBhT', e.target.value);
    $('#services').addEventListener('change', packUpdate);
  packUpdate();
  });
  packUpdate();


  /* ---------- Catálogo real (Revspin) ---------- */
  var PR = window.GRProducts, RT = window.GRRating;
  var f1 = function (v) { return v == null ? '–' : String(v).replace('.', ','); };
  var badge = function (c) { return '<span class="badge ' + c.replace(' de dados', '') + '">' + c + '</span>'; };
  var COLS = {
    blades: [['Modelo', function (x) { return x.marca + ' ' + x.modelo + (x.status !== 'ativo' ? ' (' + x.status + ')' : ''); }], ['Tipo', 'catLabel'], ['Classe', function (x) { return x.classe ? x.classe + (x.classeConfirmada ? '' : '?') : '–'; }], ['Vel', 'vel'], ['Ctrl', 'ctrl'], ['Rig', 'rig'], ['Dur', 'dur'], ['Cons', 'cons'], ['n', 'n'], ['Confiança', function (x) { return badge(x.confianca); }], ['Spec oficial', 'spec']],
    rubbers: [['Modelo', function (x) { return x.marca + ' ' + x.modelo; }], ['Tipo', 'catLabel'], ['Esponja', function (x) { return x.sponge ? { soft: 'macia', medium: 'média', hard: 'dura' }[x.sponge] + (x.dureza ? ' (' + x.dureza.min + (x.dureza.max !== x.dureza.min ? '–' + x.dureza.max : '') + ' ' + x.dureza.escala + ')' : '') : '–'; }], ['Vel', 'vel'], ['Spin', 'spin'], ['Ctrl', 'ctrl'], ['Arco', 'arco'], ['Dur', 'dur'], ['n', 'n'], ['Confiança', function (x) { return badge(x.confianca); }], ['Spec oficial', 'spec']],
    pips: [['Modelo', function (x) { return x.marca + ' ' + x.modelo + (x.status !== 'ativo' ? ' (' + x.status + ')' : ''); }], ['Tipo', 'cat'], ['Vel (cru)', 'vel'], ['Spin (cru)', 'spin'], ['Geral (cru)', 'geral'], ['n', 'n'], ['Confiança', function (x) { return badge(x.confianca); }], ['Spec oficial', 'spec']]
  };
  function catRender() {
    var type = $('#cType').value, q = $('#cSearch').value.toLowerCase(), cols = COLS[type];
    var rows = PR[type].filter(function (x) { return (x.marca + ' ' + x.modelo).toLowerCase().indexOf(q) >= 0; });
    var cell = function (x, c) { var v = typeof c[1] === 'function' ? c[1](x) : x[c[1]]; return typeof c[1] === 'function' && c[0] === 'Confiança' ? v : esc(typeof v === 'number' ? f1(v) : (v == null || v === '' ? '–' : v)); };
    $('#cTable').innerHTML = '<tr>' + cols.map(function (c) { return '<th>' + c[0] + '</th>'; }).join('') + '</tr>' +
      rows.map(function (x) { return '<tr>' + cols.map(function (c) { return '<td>' + cell(x, c) + '</td>'; }).join('') + '</tr>'; }).join('');
  }
  $('#cType').addEventListener('change', catRender); $('#cSearch').addEventListener('input', catRender); catRender();

  var RLAB = { velocidade: 'Velocidade', controle: 'Controle', spin: 'Spin', arco: 'Arco', durabilidade: 'Durabilidade' };
  var opt = function (list) { return list.map(function (x) { return '<option value="' + x.id + '">' + esc(x.marca + ' ' + x.modelo) + '</option>'; }).join(''); };
  $('#rBlade').innerHTML = opt(PR.blades); $('#rFh').innerHTML = opt(PR.rubbers); $('#rBh').innerHTML = opt(PR.rubbers) + opt(PR.pips);
  $('#rBlade').value = 'butterfly-viscaria'; $('#rFh').value = 'butterfly-dignics-09c'; $('#rBh').value = 'butterfly-dignics-05';
  function realUpdate() {
    var b = PR.find($('#rBlade').value), f = PR.find($('#rFh').value), k = PR.find($('#rBh').value);
    var c = RT.combine(b, f, k);
    var alerts = E.validateProducts({ blade: b, fh: f, bh: k, control: c ? c.controle : null }, { level: $('#rLevel').value });
    var conf = RT.minConfidence([b.confianca, f.confianca, k.confianca]);
    var warn = [b, f, k].filter(function (x) { return x.status !== 'ativo'; }).map(function (x) { return '<div class="alert warn"><b>' + esc(x.modelo) + ': ' + esc(x.status) + '</b>Produto fora de linha ou com disponibilidade incerta.</div>'; }).join('');
    $('#rOut').innerHTML = '<article class="card"><h3>' + esc(b.marca + ' ' + b.modelo + ' + ' + f.modelo + ' (FH) + ' + k.modelo + ' (BH)') + '</h3>' +
      (c ? '<div class="row"><div>' + radarSvg(c, RLAB) + '</div><div><p>Confiança do pack: ' + badge(conf) + '</p><p class="note">Velocidade e controle: lâmina 40% + FH 30% + BH 30% (heurística). Spin, arco e durabilidade: média das borrachas. Lâmina: rigidez ' + f1(b.rig) + ', durabilidade ' + f1(b.dur) + ', consistência ' + f1(b.cons) + '.</p></div></div>'
        : '<div class="alert info"><b>Radar indisponível</b>Falta nota para ao menos um produto (sem dados). Veja o spec oficial no catálogo.</div>') +
      '<table><tr><th>Lâmina</th><td>' + esc(b.spec || '–') + '</td></tr><tr><th>FH</th><td>' + esc(f.spec || '–') + '</td></tr><tr><th>BH</th><td>' + esc(k.spec || '–') + '</td></tr></table>' + warn +
      alertsHtml(alerts) + '<p class="note">Alertas usam apenas atributos conhecidos; classe, rigidez e dureza de esponja são derivadas/heurísticas quando marcadas, e regras sem dado ficam desligadas.</p><div class="alert info"><b>Conferir antes de usar em torneio</b>Cada borracha deve constar no LARC vigente (lista 2026 vale até 31/12/2026).</div></article>';
  }
  $('#packreal').addEventListener('change', realUpdate); realUpdate();


  /* ---------- Som: desligado por padrão; liga só com clique do usuário ---------- */
  function toggle(btn, label, on) { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.textContent = label + ': ' + (on ? 'on' : 'off'); }
  $('#fxBtn').addEventListener('click', function () { var on = S.setFx(!S.fxEnabled()); toggle($('#fxBtn'), 'Efeitos', on); });
  $('#musicBtn').addEventListener('click', function () { var on = S.setMusic(!S.musicEnabled()); toggle($('#musicBtn'), 'Música', on); if (!on && !S.musicEnabled() && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) $('#musicBtn').title = 'Música desativada: o sistema pede movimento reduzido'; });
  document.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') S.play('tick'); });
  document.addEventListener('click', function (e) { if ((e.target.tagName === 'BUTTON' && !e.target.closest('.sound')) || e.target.closest('.cta, .pillar')) S.play('hit'); });
  $('#heroStats').innerHTML = [[PR.blades.length, 'lâminas'], [PR.rubbers.length, 'borrachas'], [PR.pips.length, 'pinos e anti'], [5, 'eixos no radar']].map(function (x) { return '<li><b>' + x[0] + '</b>' + x[1] + '</li>'; }).join('');

  var GUIDES = [
    ['Carbono interno × externo', 'Em termos gerais, carbono mais próximo da superfície (externo) dá contato mais direto, lâmina mais rápida e dura, com menor dwell time. Carbono interno costuma dar toque mais macio, sweet spot maior e mais controle. É uma tendência geral: a resposta final depende da lâmina específica.'],
    ['Dureza da esponja e throw angle', 'Esponja macia afunda mais no impacto: aumenta o dwell time e o ângulo de lançamento (throw angle alto), facilitando o arco. Esponja dura afunda menos: ângulo mais baixo, bola mais tensa e direta, exigindo mais técnica.'],
    ['Espessura de esponja: 1.7, 2.0 ou Max', 'Mais fina = mais controle e menos peso. 2.0 é o equilíbrio mais comum. Max dá mais potência e efeito, porém mais peso e menos margem de erro; atenção ao peso total do conjunto para evitar sobrecarga em ombro e cotovelo.']
  ];
  $('#guideList').innerHTML = GUIDES.map(function (g) { return '<details><summary>' + esc(g[0]) + '</summary><p>' + esc(g[1]) + '</p></details>'; }).join('');
})();
