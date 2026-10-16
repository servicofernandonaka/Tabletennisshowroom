/* Laudo Técnico em PDF (UMD). `buildReport` monta o documento (puro, testável no Node);
   `generatePDFLaudo` injeta o documento em #printDoc, aplica a classe `print-laudo` e abre o diálogo de impressão do navegador
   (window.print), de onde o usuário salva em PDF. Sem bibliotecas externas. Folha de estilos dedicada: css/print.css. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null, require('./viz.js'));
  else root.MasterWangLaudo = factory(root, root.MasterWangViz);
})(typeof self !== 'undefined' ? self : this, function (win, V) {
  var BRAND = 'Table Tennis Showroom • Consultoria Técnica Mestre Wang';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var asDate = function (d) { var x = d instanceof Date ? d : new Date(d); return isNaN(x) ? new Date() : x; };
  function fmtDate(d) { d = asDate(d); return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function isoDate(d) { d = asDate(d); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function slug(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  /** Título do documento = nome sugerido do arquivo ao salvar em PDF. */
  function fileTitle(ctx) {
    return ['Laudo-Tecnico-Mestre-Wang', slug(ctx.player && ctx.player.name), slug(ctx.primary && ctx.primary.name), isoDate(ctx.date)].filter(Boolean).join('_');
  }
  var SEV = { CRITICAL: ['CRÍTICO', 'crit'], WARNING: ['ATENÇÃO', 'warn'], OPTIMAL: ['ÓTIMO', 'ok'] };
  var METRICS = [['speed', 'Velocidade (Speed)'], ['spin', 'Efeito (Spin)'], ['control', 'Controle (Control)'], ['throwAngleBar', 'Arco (Throw Angle)'], ['dwell', 'Retenção (Dwell Time)']];

  /** Barras em SVG (preto e cinza: legíveis em P&B; SVG imprime mesmo sem "gráficos de fundo"). */
  function barsSvg(m) {
    var rows = METRICS.map(function (r, i) {
      var y = 8 + i * 26, v = Math.max(0, Math.min(100, +m[r[0]] || 0)), w = Math.round(v * 2.2), lab = r[0] === 'throwAngleBar' && m.throwAngle ? r[1] + ' · ' + m.throwAngle : r[1];
      return '<text x="0" y="' + (y + 11) + '" font-size="12" fill="#111">' + esc(lab) + '</text>' +
        '<rect x="170" y="' + y + '" width="220" height="14" fill="#fff" stroke="#555" stroke-width="1"/><rect x="170" y="' + y + '" width="' + w + '" height="14" fill="#222"/>' +
        '<text x="398" y="' + (y + 11) + '" font-size="12" font-weight="700" fill="#111">' + v + '</text>';
    }).join('');
    return '<svg class="pd-bars" viewBox="0 0 430 140" role="img" aria-label="Métricas de desempenho de 0 a 100" xmlns="http://www.w3.org/2000/svg">' + rows + '</svg>';
  }
  var table = function (rows, cls) {
    return '<table class="pd-table' + (cls ? ' ' + cls : '') + '">' + rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>';
  };
  var section = function (n, title, body) { return '<section class="pd-sec"><h2><span>' + n + '</span> ' + esc(title) + '</h2>' + body + '</section>'; };

  /** ctx: {date, kind:'wizard'|'pack', player:{name?, title, lines:[[rótulo, valor]]}, primary, alternative?, checklist:[[título, texto]], note?}
      primary: {name, num?, match?, perfil?, variantLabel?, components:[[papel, texto]], physics:{rows:[[rótulo, valor]], total, balance}, seal:{code,label},
                metrics, diagnostics:[{severity,title,message}], price, verificar:[...] } */
  function buildReport(ctx) {
    var p = ctx.primary, d = ctx.date, who = ctx.player || { lines: [] };
    var ref = 'LT-' + isoDate(d).replace(/-/g, '') + '-' + (p.num ? 'P0' + p.num : slug(p.name).slice(0, 10).toUpperCase());
    var head = '<header class="pd-head"><div class="pd-top"><p class="pd-brand">' + esc(BRAND) + '</p><p class="pd-stamp" aria-label="Carimbo ITTF"><b>ITTF</b> · conferir LARC vigente</p></div><div class="pd-titlebar"><h1>Laudo Técnico de Setup</h1><dl class="pd-meta"><div><dt>Emitido em</dt><dd>' + fmtDate(d) + '</dd></div><div><dt>Referência</dt><dd>' + esc(ref) + '</dd></div></dl></div>' +
      '<p class="pd-sub">' + (ctx.kind === 'wizard' ? 'Diagnóstico Biomecânico personalizado' : 'Ficha técnica do pack') + (who.name ? ' · <b>' + esc(who.name) + '</b>' : '') + '</p></header>';

    var perfil = section('1', who.title || 'Identificação do perfil do jogador', table((who.name ? [['Jogador', esc(who.name)]] : []).concat(who.lines.map(function (l) { return [l[0], esc(l[1])]; }))) + (ctx.note ? '<p class="pd-note">' + esc(ctx.note) + '</p>' : ''));

    var setup = section('2', 'Setup prescrito',
      '<p class="pd-pack"><b>' + esc((p.num ? 'Pack 0' + p.num + ': ' : '') + p.name) + '</b>' + (p.match != null ? ' <span class="pd-match">compatibilidade ' + p.match + '%</span>' : '') + '</p>' +
      (p.perfil ? '<p class="pd-note">' + esc(p.perfil) + '</p>' : '') + table(p.components.map(function (c) { return [c[0], esc(c[1])]; })) +
      (p.variantLabel ? '<p class="pd-note">Variante de backhand: ' + esc(p.variantLabel) + '</p>' : ''));

    var alt = ctx.alternative ? section('2b', 'Pack alternativo (resumo)', table([['Pack', esc(ctx.alternative.name)], ['Compatibilidade', esc(ctx.alternative.match != null ? ctx.alternative.match + '%' : '–')],
      ['Peso total estimado', esc(ctx.alternative.weight + ' g')], ['Balanço', esc(ctx.alternative.balance)], ['Investimento estimado', esc(ctx.alternative.price)]])) : '';

    var phys = section('3', 'Especificações de massa cortada',
      table(p.physics.rows.map(function (r) { return [r[0], esc(r[1])]; }).concat([['Peso total estimado', '<b>' + esc(p.physics.total) + ' g</b>']]), 'pd-phys') +
      '<p class="pd-note">As borrachas vêm em folhas quadradas (cerca de 170 × 170 mm) e são cortadas no formato da lâmina; o peso cortado usa fator de área por empunhadura. Valores estimados: pese a raquete montada.</p>');

    var bal = section('4', 'Balanço (Balance Point) e saúde articular',
      '<p class="pd-balance">' + esc(p.physics.balance) + '</p><p class="pd-seal pd-seal-' + esc(p.seal.code) + '"><b>Saúde articular:</b> ' + esc(p.seal.label) + '</p>');

    var chart = section('5', 'Gráfico resumo de desempenho',
      '<div class="pd-chart"><div class="pd-radar">' + (V ? V.radarSvg([{ name: p.name, color: '#222222', values: V.packValues(p.metrics) }], { theme: 'print', className: 'pd-radar-svg' }) : '') + '</div>' +
      '<div class="pd-barwrap">' + barsSvg(p.metrics) + '</div></div><p class="pd-note">Métricas de 0 a 100 são o perfil editorial do pack, não medições de laboratório.</p>');

    var diag = section('6', 'Diagnóstico de sinergia mecânica', p.diagnostics.length ? p.diagnostics.map(function (x) {
      var s = SEV[x.severity] || ['AVISO', 'warn'];
      return '<div class="pd-diag pd-diag-' + s[1] + '"><p><b>' + s[0] + ' · ' + esc(x.title || '') + '</b></p><p>' + esc(String(x.message).replace(/^[^\p{L}\p{N}(]+/u, '')) + '</p></div>';
    }).join('') : '<p class="pd-note">Nenhum alerta de sinergia para esta combinação.</p>');

    var check = section('7', 'Checklist de montagem (selagem e cola VOC-Free)',
      '<ul class="pd-check">' + ctx.checklist.map(function (c) { return '<li><span class="pd-box" aria-hidden="true"></span><div><b>' + esc(c[0]) + '</b><br>' + esc(c[1]) + '</div></li>'; }).join('') + '</ul>');

    var verif = section('8', 'Investimento estimado e dados a verificar',
      '<p><b>Investimento estimado:</b> ' + esc(p.price) + '</p><p class="pd-note">Estimativa sem frete, impostos ou serviços de montagem.</p>' +
      '<ul class="pd-list">' + p.verificar.concat(['Métricas 0–100 são perfil editorial.', 'Confirme cada borracha na lista LARC vigente da ITTF.']).map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') + '</ul>');

    var foot = '<footer class="pd-foot"><p>Laudo ' + esc(ref) + ' · emitido em ' + fmtDate(d) + ' · ' + esc(BRAND) + '</p><p>Laudo gerado por inteligência biomecânica e engenharia de materiais aplicada. Documento informativo; não substitui avaliação presencial.</p></footer>';
    return '<article class="pd" lang="pt-BR">' + head + perfil + setup + alt + phys + bal + chart + diag + check + verif + foot + '</article>';
  }

  var api = { BRAND: BRAND, buildReport: buildReport, fileTitle: fileTitle, fmtDate: fmtDate, isoDate: isoDate, barsSvg: barsSvg };
  if (!win) return api;

  /** Abre o diálogo de impressão com o laudo: o usuário escolhe "Salvar como PDF". */
  api.generatePDFLaudo = function (ctx) {
    var doc = win.document, host = doc.getElementById('printDoc');
    if (!host) throw new Error('#printDoc não encontrado');
    host.innerHTML = buildReport(ctx);
    var prevTitle = doc.title, done = false;
    doc.title = fileTitle(ctx);                                   // vira o nome sugerido do arquivo
    doc.body.classList.add('print-laudo');
    function cleanup() {
      if (done) return; done = true;
      win.removeEventListener('afterprint', cleanup);
      doc.body.classList.remove('print-laudo'); doc.title = prevTitle; host.innerHTML = '';
    }
    win.addEventListener('afterprint', cleanup);
    // dois quadros para o layout assentar (SVG, fontes) antes de abrir o diálogo
    win.requestAnimationFrame(function () { win.requestAnimationFrame(function () { try { win.print(); } catch (e) { cleanup(); throw e; } }); });
    return true;
  };
  api.exportLaudoPDF = api.generatePDFLaudo;
  win.exportLaudoPDF = function (ctx) { return api.generatePDFLaudo(ctx); };
  return api;
});
