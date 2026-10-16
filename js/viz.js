/* Visualizações em SVG puro (UMD, sem DOM, sem dependências): arco da bola sobre a rede e radar de 5 eixos.
   Ilustrações ESQUEMÁTICAS a partir das métricas editoriais dos packs; não são simulação física. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangViz = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var r1 = function (x) { return Math.round(x * 10) / 10; };

  /* ---------- Arco da bola ---------- */
  // Perfil lateral: mesa y=110, rede com 18 u de altura (topo y=92), batida em (30,98), quique no campo adversário em (352,110).
  var G = { x0: 30, y0: 98, x1: 352, y1: 110, netX: 200, netTop: 92, cx: 196, tableY: 110 };
  var CY_A = 100, CY_B = 0.9;     // ponto de controle: cy = 100 - 0,9 × (barra 0–100)

  /** Geometria do arco para uma barra de Throw Angle (0–100). Curva Bézier quadrática. */
  function arcGeometry(bar) {
    var b = Math.max(0, Math.min(100, +bar || 0)), cy = CY_A - CY_B * b;
    var lo = 0, hi = 1, t, i;
    for (i = 0; i < 50; i++) { t = (lo + hi) / 2; var X = Math.pow(1 - t, 2) * G.x0 + 2 * t * (1 - t) * G.cx + t * t * G.x1; if (X < G.netX) lo = t; else hi = t; }
    t = (lo + hi) / 2;
    var yNet = Math.pow(1 - t, 2) * G.y0 + 2 * t * (1 - t) * cy + t * t * G.y1;
    var dx = G.x1 - G.cx, dy = G.y1 - cy, len = Math.sqrt(dx * dx + dy * dy);
    return { bar: b, cx: G.cx, cy: r1(cy), netY: r1(yNet), clearance: r1(G.netTop - yNet),
      dive: Math.round(Math.atan2(dy, dx) * 180 / Math.PI), tangent: { x: dx / len, y: dy / len },
      path: 'M' + G.x0 + ' ' + G.y0 + ' Q' + G.cx + ' ' + r1(cy) + ' ' + G.x1 + ' ' + G.y1 };
  }
  function clearanceWord(c) { return c < 4 ? 'rasante' : c < 15 ? 'moderada' : 'ampla'; }

  var uid = 0;
  function arcSvg(bar, label) {
    var g = arcGeometry(bar), w = clearanceWord(g.clearance), gid = 'arcGrad' + (++uid), hid = 'arcHead' + uid;
    var ax = G.x1 - g.tangent.x * 34, ay = G.y1 - g.tangent.y * 34;   // seta no sentido do mergulho
    var aria = 'Trajetória esquemática da bola com arco ' + (label || '') + ': folga ' + w + ' sobre a rede e mergulho de cerca de ' + g.dive + ' graus no fundo da mesa adversária';
    return '<svg class="arc-svg" viewBox="0 0 400 170" role="img" aria-label="' + esc(aria) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<title>' + esc(aria) + '</title>' +
      '<defs><linearGradient id="' + gid + '" x1="0" x2="1"><stop offset="0" stop-color="#00FF88"/><stop offset="1" stop-color="#00E5FF"/></linearGradient>' +
      '<marker id="' + hid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#FF2A5F"/></marker></defs>' +
      // mesa (perfil), pernas e rede
      '<rect x="20" y="' + G.tableY + '" width="360" height="7" rx="2" fill="rgba(0,229,255,.35)" stroke="#00E5FF" stroke-width="1.5"/>' +
      '<line x1="60" y1="' + (G.tableY + 7) + '" x2="60" y2="152" stroke="rgba(255,255,255,.25)" stroke-width="4"/><line x1="340" y1="' + (G.tableY + 7) + '" x2="340" y2="152" stroke="rgba(255,255,255,.25)" stroke-width="4"/>' +
      '<line x1="' + G.netX + '" y1="' + G.tableY + '" x2="' + G.netX + '" y2="' + G.netTop + '" stroke="#fff" stroke-width="2.5"/><rect x="' + (G.netX - 4) + '" y="' + (G.netTop - 2) + '" width="8" height="3" fill="#fff"/>' +
      // folga sobre a rede: tracejado do topo da rede até a curva
      '<line class="arc-gap" x1="' + G.netX + '" y1="' + G.netTop + '" x2="' + G.netX + '" y2="' + g.netY + '" stroke="#FFB020" stroke-width="2" stroke-dasharray="3 3"/>' +
      '<line x1="' + G.netX + '" y1="' + Math.min(g.netY, G.netTop) + '" x2="' + G.netX + '" y2="22" stroke="rgba(255,176,32,.45)" stroke-width="1" stroke-dasharray="2 4"/>' +
      '<text class="viz-t" x="' + G.netX + '" y="16" text-anchor="middle" fill="#FFB020">Folga sobre a Rede (Segurança)</text>' +
      // trajetória
      '<path class="arc-path" d="' + g.path + '" fill="none" stroke="url(#' + gid + ')" stroke-width="3.5" stroke-linecap="round" pathLength="1"/>' +
      '<circle cx="' + G.x0 + '" cy="' + G.y0 + '" r="5" fill="#fff"/><ellipse cx="' + G.x1 + '" cy="' + G.y1 + '" rx="7" ry="2.5" fill="#FF2A5F"/>' +
      // mergulho do topspin
      '<line x1="' + r1(ax) + '" y1="' + r1(ay) + '" x2="' + (G.x1 - 3) + '" y2="' + (G.y1 - 2) + '" stroke="#FF2A5F" stroke-width="2.5" marker-end="url(#' + hid + ')"/>' +
      '<text class="viz-t" x="392" y="52" text-anchor="end" fill="#FF6B8F">Mergulho do Topspin</text>' +
      '<text class="viz-t viz-s" x="30" y="132" fill="#9AA8C2">Sua mesa</text><text class="viz-t viz-s" x="370" y="132" text-anchor="end" fill="#9AA8C2">Mesa adversária</text>' +
      '</svg>';
  }

  /* ---------- Radar de 5 eixos ---------- */
  var AXES = [
    { key: 'speed', l1: 'Velocidade', l2: '(Speed)' }, { key: 'spin', l1: 'Efeito', l2: '(Spin)' }, { key: 'control', l1: 'Controle', l2: '(Control)' },
    { key: 'dwell', l1: 'Retenção', l2: '(Dwell Time)' }, { key: 'throwAngleBar', l1: 'Segurança de Arco', l2: '(Throw)' }];
  var RD = { cx: 220, cy: 160, R: 100 };

  function radarPoint(i, v) {
    var a = -Math.PI / 2 + i * 2 * Math.PI / AXES.length, k = Math.max(0, Math.min(100, v)) / 100;
    return [r1(RD.cx + RD.R * k * Math.cos(a)), r1(RD.cy + RD.R * k * Math.sin(a))];
  }
  /** series: [{name, color, values:{speed,spin,control,dwell,throwAngleBar}}] com valores 0–100. */
  function radarSvg(series, opts) {
    var o = opts || {}, cls = o.className || 'rd-svg';
    var rings = [25, 50, 75, 100].map(function (lv) { return '<polygon class="rd-grid" points="' + AXES.map(function (_, i) { return radarPoint(i, lv).join(','); }).join(' ') + '" fill="none" stroke="rgba(0,229,255,.28)"/>'; }).join('');
    var spokes = AXES.map(function (_, i) { var p = radarPoint(i, 100); return '<line x1="' + RD.cx + '" y1="' + RD.cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="rgba(0,229,255,.18)"/>'; }).join('');
    var labels = AXES.map(function (ax, i) {
      var p = radarPoint(i, 100), dx = p[0] - RD.cx, dy = p[1] - RD.cy, lx = RD.cx + dx * 1.2, ly = RD.cy + dy * 1.2;
      var anchor = Math.abs(dx) < 4 ? 'middle' : dx > 0 ? 'start' : 'end', off = dy < -20 ? -12 : dy > 20 ? 6 : -2;
      return '<text class="viz-t" fill="#E8EEF8" x="' + r1(lx) + '" y="' + r1(ly + off) + '" text-anchor="' + anchor + '"><tspan x="' + r1(lx) + '">' + esc(ax.l1) + '</tspan><tspan class="viz-s" x="' + r1(lx) + '" dy="13" fill="#9AA8C2">' + esc(ax.l2) + '</tspan></text>';
    }).join('');
    var shapes = series.map(function (s) {
      var pts = AXES.map(function (ax, i) { return radarPoint(i, s.values[ax.key]).join(','); }).join(' ');
      var dots = AXES.map(function (ax, i) { var p = radarPoint(i, s.values[ax.key]); return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + s.color + '"/>'; }).join('');
      return '<g class="rd-shape"><polygon points="' + pts + '" fill="' + s.color + '" fill-opacity="0.35" stroke="' + s.color + '" stroke-width="2"/>' + dots + '</g>';
    }).join('');
    var aria = 'Radar de 5 eixos. ' + series.map(function (s) { return s.name + ': ' + AXES.map(function (ax) { return ax.l1 + ' ' + s.values[ax.key]; }).join(', '); }).join('. ');
    return '<svg class="' + cls + '" viewBox="0 0 440 330" role="img" aria-label="' + esc(aria) + '" xmlns="http://www.w3.org/2000/svg"><title>' + esc(aria) + '</title>' +
      rings + spokes + shapes + labels + '</svg>';
  }
  /** Valores 0–100 de um pack para o radar. */
  function packValues(m) { return { speed: m.speed, spin: m.spin, control: m.control, dwell: m.dwell, throwAngleBar: m.throwAngleBar }; }

  return { G: G, AXES: AXES, arcGeometry: arcGeometry, arcSvg: arcSvg, radarSvg: radarSvg, radarPoint: radarPoint, packValues: packValues, clearanceWord: clearanceWord };
});
