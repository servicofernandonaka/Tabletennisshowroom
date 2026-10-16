/* Oficina de Bancada: manuais práticos de montagem e manutenção (UMD).
   Dados + ilustrações SVG puras (sem DOM, sem dependências); a interface é montada só quando há `window`.
   Conteúdo educativo: tempos de secagem e cura dependem do produto, então o texto manda seguir a bula do fabricante. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.MasterWangOficina = factory(root);
})(typeof self !== 'undefined' ? self : this, function (win) {
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- Ilustrações (paleta do design system; todo texto SVG tem fill explícito) ---------- */
  var COL = { cyan: '#00E5FF', green: '#00FF88', red: '#FF2A5F', amber: '#FFB020', muted: '#9AA8C2', fg: '#E8EEF8', wood: '#C99A63', woodD: '#8A6335', sponge: '#FFD27A', rubber: '#FF2A5F', line: 'rgba(255,255,255,.18)' };
  var T = function (x, y, txt, o) {
    o = o || {};
    return '<text class="viz-t' + (o.small ? ' viz-s' : '') + '" x="' + x + '" y="' + y + '" text-anchor="' + (o.anchor || 'middle') + '" fill="' + (o.fill || COL.fg) + '">' + esc(txt) + '</text>';
  };
  var panel = function (x, w, h) { return '<rect x="' + x + '" y="4" width="' + w + '" height="' + h + '" rx="12" fill="rgba(255,255,255,.04)" stroke="' + COL.line + '"/>'; };
  var badge = function (x, n) { return '<circle cx="' + (x + 16) + '" cy="22" r="11" fill="' + COL.cyan + '"/>' + '<text class="viz-t" x="' + (x + 16) + '" y="26.5" text-anchor="middle" fill="#0B0F19">' + n + '</text>'; };
  // lâmina em vista de topo: cabeça oval + cabo (horizontal, cabo à direita)
  var blade = function (cx, cy, coat) {
    return '<rect x="' + (cx + 30) + '" y="' + (cy - 9) + '" width="46" height="18" rx="6" fill="' + COL.woodD + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="40" ry="38" fill="' + COL.wood + '" stroke="' + COL.woodD + '" stroke-width="2"/>' +
      [-18, -9, 0, 9, 18].map(function (d) { return '<line x1="' + (cx - 34) + '" y1="' + (cy + d) + '" x2="' + (cx + 34) + '" y2="' + (cy + d) + '" stroke="' + COL.woodD + '" stroke-opacity=".35"/>'; }).join('') +
      (coat ? '<ellipse cx="' + cx + '" cy="' + cy + '" rx="38" ry="36" fill="' + COL.cyan + '" fill-opacity=".22" stroke="' + COL.cyan + '" stroke-opacity=".7"/>' : '');
  };
  var svg = function (w, h, aria, inner) {
    return '<svg class="of-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(aria) + '" xmlns="http://www.w3.org/2000/svg"><title>' + esc(aria) + '</title>' + inner + '</svg>';
  };

  function svgSealing() {
    var p1 = panel(4, 150, 160) + badge(4, 1) + blade(66, 84, false) +
      '<g transform="rotate(-18 66 78)"><rect x="40" y="58" width="52" height="22" rx="4" fill="#fff" fill-opacity=".85"/><rect x="40" y="58" width="52" height="22" rx="4" fill="url(#ofGrit)"/></g>' +
      '<path d="M30 112 L102 112" stroke="' + COL.amber + '" stroke-width="2.5" marker-start="url(#ofArr)" marker-end="url(#ofArr)"/>' +
      T(79, 138, 'Lixar levíssimo') + T(79, 153, 'lixa 400 → 600', { small: true, fill: COL.muted });
    var p2 = panel(165, 150, 160) + badge(165, 2) + blade(227, 84, true) +
      '<g transform="rotate(35 247 54)"><rect x="244" y="26" width="9" height="46" rx="3" fill="' + COL.muted + '"/><rect x="241" y="68" width="15" height="14" rx="3" fill="' + COL.amber + '"/></g>' +
      '<path d="M268 110 q5 8 0 14 q-5 -6 0 -14z" fill="' + COL.cyan + '"/>' +
      T(240, 138, 'Demão ultrafina') + T(240, 153, 'verniz acrílico base d\'água', { small: true, fill: COL.muted });
    var p3 = panel(326, 150, 160) + badge(326, 3) + blade(388, 84, true) +
      '<circle cx="436" cy="42" r="15" fill="none" stroke="' + COL.green + '" stroke-width="2.5"/><path d="M436 42 V32 M436 42 L443 46" stroke="' + COL.green + '" stroke-width="2.5" stroke-linecap="round"/>' +
      T(401, 138, 'Secar entre demãos') + T(401, 153, 'repita só se precisar', { small: true, fill: COL.muted });
    var defs = '<defs><pattern id="ofGrit" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#6b7280"/><circle cx="5" cy="5" r="1" fill="#9ca3af"/></pattern>' +
      '<marker id="ofArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + COL.amber + '"/></marker></defs>';
    return svg(480, 172, 'Três etapas da selagem da lâmina: lixar levemente, aplicar uma demão ultrafina de verniz e deixar secar entre as demãos', defs + p1 + p2 + p3);
  }

  function svgGlue() {
    // A: corte transversal das camadas e a cola translúcida; B: vista de topo com o rolo indo do cabo para a ponta
    var stack = function (x, y, label, swatch) {
      return '<rect x="' + x + '" y="' + y + '" width="120" height="10" rx="2" fill="' + swatch + '"/>' + T(x + 128, y + 9, label, { anchor: 'start', small: true, fill: COL.muted });
    };
    var A = panel(4, 236, 160) + T(122, 26, 'Camadas (corte lateral)', { fill: COL.cyan }) +
      '<rect x="22" y="38" width="120" height="12" rx="3" fill="' + COL.rubber + '"/>' + T(150, 47, 'topsheet', { anchor: 'start', small: true, fill: COL.muted }) +
      '<rect x="22" y="50" width="120" height="26" fill="' + COL.sponge + '"/>' + T(150, 66, 'esponja', { anchor: 'start', small: true, fill: COL.muted }) +
      '<rect x="22" y="76" width="120" height="5" fill="' + COL.cyan + '" fill-opacity=".55"/>' + T(150, 82, 'cola (fina)', { anchor: 'start', small: true, fill: COL.cyan }) +
      '<rect x="22" y="81" width="120" height="30" fill="' + COL.wood + '"/>' + T(150, 100, 'madeira', { anchor: 'start', small: true, fill: COL.muted }) +
      '<rect x="22" y="124" width="26" height="14" rx="3" fill="#fff" fill-opacity=".8"/><path d="M52 131 H84" stroke="' + COL.amber + '" stroke-width="2.5" marker-end="url(#ofArr2)"/><rect x="88" y="124" width="26" height="14" rx="3" fill="none" stroke="' + COL.cyan + '" stroke-width="2" stroke-dasharray="3 2"/>' +
      T(35, 152, 'leitosa', { small: true, fill: COL.muted }) + T(101, 152, 'incolor = pronta', { small: true, fill: COL.green });
    var B = panel(250, 226, 160) + T(363, 26, 'Junção (vista de topo)', { fill: COL.cyan }) +
      '<rect x="420" y="76" width="46" height="18" rx="6" fill="' + COL.woodD + '"/><ellipse cx="350" cy="85" rx="64" ry="48" fill="' + COL.rubber + '" fill-opacity=".85" stroke="' + COL.woodD + '" stroke-width="2"/>' +
      '<path d="M410 85 H300" stroke="' + COL.green + '" stroke-width="3" stroke-linecap="round" marker-end="url(#ofArr3)" stroke-dasharray="1 8"/>' +
      '<rect x="352" y="70" width="12" height="30" rx="5" fill="' + COL.fg + '" fill-opacity=".9"/><circle cx="358" cy="85" r="3" fill="#0B0F19"/>' +
      T(437, 70, 'cabo', { small: true, fill: COL.muted }) + T(363, 140, 'do cabo para a ponta,', { small: true, fill: COL.green }) + T(363, 155, 'rolando para tirar o ar', { small: true, fill: COL.green });
    var defs = '<defs><marker id="ofArr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + COL.amber + '"/></marker>' +
      '<marker id="ofArr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + COL.green + '"/></marker></defs>';
    return svg(480, 172, 'Colagem com cola à base d\'água: camadas da borracha e da lâmina, cola que passa de leitosa a incolor, e junção do cabo para a ponta com rolo', defs + A + B);
  }

  function svgCut() {
    var A = panel(4, 236, 160) + T(122, 26, 'Corte em bisel (lateral)', { fill: COL.cyan }) +
      '<rect x="40" y="76" width="90" height="34" fill="' + COL.wood + '"/><rect x="40" y="62" width="104" height="14" fill="' + COL.sponge + '"/><rect x="40" y="52" width="104" height="10" fill="' + COL.rubber + '"/>' +
      '<line x1="130" y1="44" x2="130" y2="116" stroke="' + COL.green + '" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<path d="M150 40 L176 40 L136 92 Z" fill="' + COL.fg + '" fill-opacity=".9" stroke="' + COL.muted + '"/>' +
      '<path d="M130 100 A22 22 0 0 1 148 94" fill="none" stroke="' + COL.amber + '" stroke-width="2.5"/>' + T(168, 108, 'inclinar', { small: true, fill: COL.amber, anchor: 'start' }) +
      T(122, 134, 'lâmina nova e inclinada para fora', { small: true, fill: COL.muted }) + T(122, 150, 'sem passar do limite da madeira', { small: true, fill: COL.green });
    var B = panel(250, 226, 160) + T(363, 26, 'Siga a borda (vista de topo)', { fill: COL.cyan }) +
      '<rect x="420" y="76" width="46" height="18" rx="6" fill="' + COL.woodD + '"/><ellipse cx="350" cy="85" rx="64" ry="48" fill="' + COL.rubber + '" fill-opacity=".45"/>' +
      '<ellipse cx="350" cy="85" rx="64" ry="48" fill="none" stroke="' + COL.green + '" stroke-width="3" stroke-dasharray="7 5"/>' +
      '<path d="M296 58 l18 -14 l7 9 z" fill="' + COL.fg + '"/><path d="M314 44 L330 30" stroke="' + COL.muted + '" stroke-width="5" stroke-linecap="round"/>' +
      T(363, 146, 'cortes curtos e contínuos,', { small: true, fill: COL.muted }) + T(363, 158, 'sempre para longe dos dedos', { small: true, fill: COL.amber });
    return svg(480, 172, 'Corte da borracha: estilete de lâmina nova inclinado para fora fazendo um bisel que segue o limite da madeira, em cortes curtos e contínuos', A + B);
  }

  function svgCare() {
    var p1 = panel(4, 150, 160) + badge(4, 1) +
      '<rect x="28" y="52" width="102" height="46" rx="8" fill="' + COL.rubber + '"/><rect x="40" y="64" width="50" height="20" rx="10" fill="#fff" fill-opacity=".85"/><path d="M96 70 q8 14 0 22" stroke="' + COL.cyan + '" stroke-width="3" fill="none"/><path d="M112 40 q4 8 0 12 q-4 -4 0 -12z" fill="' + COL.cyan + '"/>' +
      T(79, 126, 'Limpar o topsheet') + T(79, 141, 'água pura ou limpador', { small: true, fill: COL.muted }) + T(79, 154, 'sem álcool, com microfibra', { small: true, fill: COL.muted });
    var p2 = panel(165, 150, 160) + badge(165, 2) +
      '<rect x="189" y="52" width="102" height="46" rx="8" fill="' + COL.rubber + '"/><rect x="185" y="48" width="110" height="54" rx="10" fill="' + COL.cyan + '" fill-opacity=".18" stroke="' + COL.cyan + '" stroke-dasharray="4 3"/>' +
      '<path d="M185 48 l14 0 l-14 14z" fill="' + COL.cyan + '" fill-opacity=".6"/>' +
      T(240, 126, 'Película protetora') + T(240, 141, 'sempre que guardar', { small: true, fill: COL.muted }) + T(240, 154, 'contra poeira e oxidação', { small: true, fill: COL.muted });
    var p3 = panel(326, 150, 160) + badge(326, 3) +
      '<ellipse cx="388" cy="70" rx="38" ry="36" fill="' + COL.rubber + '" stroke="' + COL.amber + '" stroke-width="7"/><rect x="418" y="61" width="46" height="18" rx="6" fill="' + COL.woodD + '"/>' +
      T(401, 138, 'Edge tape 10/12 mm') + T(401, 153, 'protege a borda de batidas', { small: true, fill: COL.muted });
    return svg(480, 172, 'Manutenção diária: limpar o topsheet com água ou limpador sem álcool, guardar com película protetora e proteger a borda com fita de borda de 10 ou 12 milímetros', p1 + p2 + p3);
  }

  /* ---------- Conteúdo ---------- */
  var MANUALS = [
    { id: 'selagem', num: '01', title: 'Selagem da Lâmina', en: 'Blade Sealing', svg: svgSealing,
      why: 'Proteger as fibras externas (especialmente Limba ou Ayous) contra umidade e lascamentos quando as borrachas coladas forem removidas.',
      tools: ['Lixa d\'água 400 e 600', 'Pano limpo e seco para tirar o pó', 'Pincel macio ou esponja', 'Verniz acrílico à base d\'água (ou selador específico)', 'Fita de pintura para proteger o cabo (opcional)'],
      steps: [
        ['Prepare a face', 'Limpe o pó com um pano seco e, se quiser, proteja o cabo com fita de pintura. Trabalhe em uma bancada plana, limpa e ventilada.'],
        ['Lixe levíssimo', 'Passe a lixa 400 (e depois a 600) com movimentos curtos a favor da fibra. A ideia é só tirar o brilho e os fiapos, não desbastar a madeira. Remova todo o pó.'],
        ['Primeira demão ultrafina', 'Com o pincel macio ou a esponja, aplique uma camada fina e uniforme de verniz acrílico à base d\'água (ou selador específico). Não deixe poças nas bordas.'],
        ['Deixe secar por completo', 'Espere secar bem, longe de poeira e umidade, respeitando o intervalo indicado pelo fabricante do produto.'],
        ['Repita só se precisar', 'Se a madeira ainda parecer "beber" o produto ou ficar áspera, lixe de leve com a 600 e dê outra demão ultrafina, de novo com a secagem completa.'],
        ['Confira o resultado', 'A superfície deve ficar lisa, sem bolhas nem escorrimento. Só depois disso siga para a colagem das borrachas (Passo 2).']],
      mistakes: ['Camada grossa: forma uma película que pode descascar e trincar.', 'Lixar fundo demais: tira madeira e pode alterar o peso e o toque da lâmina.', 'Passar a próxima demão antes de secar.'],
      safety: ['Selar é uma prática de manutenção opcional, não uma exigência das regras. Teste antes em uma lâmina de treino.', 'Prefira produtos à base d\'água, mantendo a bancada sem solventes.', 'Trabalhe em local ventilado.'] },
    { id: 'cola', num: '02', title: 'Aplicação de Cola à Base d\'Água', en: 'VOC-Free Assembly', svg: svgGlue,
      why: 'É uma exigência regulamentar da ITTF (adesivos sem solventes voláteis nocivos) e preserva a elasticidade da esponja.',
      tools: ['Cola à base d\'água', 'Esponja aplicadora', 'Rolinho de borracha ou madeira', 'Borracha já cortada um pouco maior que a lâmina', 'Papel para proteger a bancada e pano úmido para excessos'],
      steps: [
        ['Prepare a bancada', 'Proteja a superfície com papel, trabalhe em local ventilado e confirme que a lâmina está limpa, seca e (se foi selada) completamente curada.'],
        ['Camada na lâmina', 'Com a esponja aplicadora, espalhe uma camada uniforme e translúcida de cola em toda a face da lâmina, até as bordas. Fina é melhor que grossa.'],
        ['Camada na esponja da borracha', 'Faça o mesmo na face da esponja da borracha (nunca no topsheet), com a mesma camada fina e uniforme.'],
        ['Espere a cola ficar transparente', 'Aguarde a secagem completa, até a cola passar de leitosa a incolor nas duas superfícies. O tempo varia com o clima e a espessura da camada: siga a bula da cola.'],
        ['Una a partir do cabo', 'Alinhe a borracha pela base do cabo e vá baixando em direção à ponta, sem prender ar entre as superfícies.'],
        ['Role para eliminar o ar', 'Com o rolinho de borracha ou madeira, passe com pressão firme e uniforme do cabo para a ponta, sem esticar a borracha.'],
        ['Confira e deixe curar', 'Procure bolhas ou pontos soltos e deixe curar pelo tempo indicado pelo fabricante antes de cortar o excesso (Passo 3). Repita no verso.']],
      mistakes: ['Unir com a cola ainda leitosa: prende umidade entre as superfícies e enfraquece a união.', 'Camada grossa: demora a secar e forma grumos.', 'Esticar a borracha ao colar: deforma a esponja e o topsheet.', 'Ar preso: refaça o rolamento antes de a cola curar.'],
      safety: ['Não aplique nenhum tratamento na borracha (os chamados boosters): é proibido pela Lei 2.4.7 das regras da ITTF. Confira o texto vigente.', 'Limpe excessos de cola logo, com pano úmido.', 'Mantenha a cola longe de crianças e de roupas.'] },
    { id: 'corte', num: '03', title: 'O Corte Cirúrgico da Borracha', en: 'Precision Edge Cutting', svg: svgCut,
      why: 'Garante acabamento profissional, sem mastigar a esponja nem deformar o topsheet.',
      tools: ['Estilete profissional com lâmina nova (ou tesoura curva de precisão)', 'Base firme e antiderrapante (tapete de corte)', 'Lixa fina', 'Pano para limpar o pó'],
      steps: [
        ['Apoie a raquete numa base firme', 'Use uma superfície plana e estável, de preferência sobre um tapete de corte, com a cola já curada.'],
        ['Troque a lâmina', 'Comece com uma lâmina de estilete nova: lâmina cega rasga e "mastiga" a esponja.'],
        ['Posicione e segure firme', 'Segure a raquete com a mão livre fora da linha de corte e faça cortes curtos e contínuos, sempre para longe do corpo.'],
        ['Corte em bisel', 'Incline levemente a lâmina do estilete para fora, formando um bisel que segue o contorno exato da borda da madeira, sem ultrapassar o limite da lâmina.'],
        ['Curvas fechadas', 'Se preferir a tesoura curva de precisão, faça cortes curtos e deixe a ponta da tesoura sempre alinhada com a borda.'],
        ['Acabamento da quina', 'Passe a lixa fina suavemente na quina da borracha, em ângulo, para remover rebarbas. Não toque o topsheet.'],
        ['Limpe e proteja a borda', 'Tire o pó e siga para a fita de borda (guia bônus).']],
      mistakes: ['Lâmina cega ou pressão excessiva: o estilete escorrega e pode riscar a madeira.', 'Deixar sobra de borracha além da borda: a regra da ITTF pede que o revestimento vá até o limite da lâmina, sem ultrapassá-lo (confira o texto vigente).', 'Lixar o topsheet: tira a aderência da superfície.'],
      safety: ['Corte sempre para longe do corpo e dos dedos.', 'Use base antiderrapante e troque a lâmina quando perder o fio.', 'Guarde o estilete com a lâmina recolhida.'] }
  ];
  var BONUS = { id: 'manutencao', num: '+', title: 'Manutenção Diária e Longevidade do Material', en: 'Daily care', svg: svgCare,
    why: 'Pequenos hábitos mantêm a aderência da borracha e protegem a lâmina por muito mais tempo.',
    tools: ['Água pura ou limpador específico sem álcool', 'Esponja de microfibra', 'Película protetora (protection sheet)', 'Fita de borda (edge tape) de 10 mm ou 12 mm'],
    steps: [
      ['Limpe o topsheet', 'Use água pura ou um limpador específico sem álcool, com uma esponja de microfibra, em movimentos suaves. Deixe secar ao ar.'],
      ['Guarde com a película protetora', 'Cubra a borracha com a película protetora sempre que guardar a raquete: ela protege da poeira e ajuda a evitar a oxidação pelo oxigênio do ar.'],
      ['Aplique a fita de borda', 'Cole a fita de 10 mm ou 12 mm ao redor da lâmina, dobrando-a sobre as duas faces e alisando sem esticar, para absorver batidas acidentais na mesa.']],
    mistakes: ['Esfregar com força ou usar álcool: resseca e prejudica a aderência.', 'Guardar a borracha exposta, no sol ou em porta-malas quente.', 'Deixar a fita de borda soltar: reaplique assim que descolar.'],
    safety: ['Remova a película puxando devagar, a partir de um canto, para não arrancar o topsheet.', 'Evite calor e umidade ao guardar o material.'] };

  var api = { MANUALS: MANUALS, BONUS: BONUS, all: function () { return MANUALS.concat([BONUS]); },
    illustrations: { selagem: svgSealing, cola: svgGlue, corte: svgCut, manutencao: svgCare } };
  if (!win) return api;

  /* ---------- Interface ---------- */
  var doc = win.document, KEY = 'mw-oficina';
  function load() { try { return JSON.parse(win.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(o) { try { win.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* sem armazenamento: segue sem salvar */ } }

  function card(m, done) {
    var checked = done[m.id] || [];
    return '<article class="card of-card" id="of-' + m.id + '" aria-labelledby="of-h-' + m.id + '" data-of-card="' + m.id + '">' +
      '<header class="of-head"><span class="of-num font-tech" aria-hidden="true">' + m.num + '</span>' +
      '<div class="of-title"><h3 id="of-h-' + m.id + '">' + esc(m.title) + ' <span class="estilo">(' + esc(m.en) + ')</span></h3><p class="of-why"><b>' + (m.id === 'manutencao' ? 'Por que importa' : 'Por que fazer') + ':</b> ' + esc(m.why) + '</p></div>' +
      '<div class="of-prog"><span class="of-pct" aria-live="polite"></span><div class="progress" role="progressbar" aria-label="Progresso: ' + esc(m.title) + '" aria-valuemin="0" aria-valuemax="' + m.steps.length + '" aria-valuenow="0"><i></i></div></div></header>' +
      '<div class="of-body"><figure class="viz-fig of-fig">' + m.svg() + '<figcaption>Ilustração esquemática da bancada</figcaption></figure>' +
      '<div class="of-text"><h4>Materiais</h4><ul class="of-tools">' + m.tools.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<h4>Como fazer</h4><ol class="of-steps">' + m.steps.map(function (s, i) {
        return '<li><label><input type="checkbox" data-of="' + m.id + ':' + i + '"' + (checked.indexOf(i) >= 0 ? ' checked' : '') + '><span><b>' + esc(s[0]) + '</b><em>' + esc(s[1]) + '</em></span></label></li>';
      }).join('') + '</ol></div></div>' +
      '<div class="of-notes"><div class="of-err"><h4>Erros comuns</h4><ul>' + m.mistakes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="of-safe"><h4>Segurança e cuidados</h4><ul>' + m.safety.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div></div></article>';
  }
  function refresh(box) {
    [].forEach.call(box.querySelectorAll('[data-of-card]'), function (c) {
      var boxes = c.querySelectorAll('input[data-of]'), n = [].filter.call(boxes, function (b) { return b.checked; }).length, tot = boxes.length;
      c.querySelector('.of-pct').textContent = n === tot ? '✔ Concluído' : n + ' de ' + tot + ' passos';
      c.querySelector('.progress i').style.width = Math.round(n / tot * 100) + '%';
      c.querySelector('.progress').setAttribute('aria-valuenow', n); c.classList.toggle('of-done', n === tot);
    });
  }
  api.init = function (box, onTick) {
    var done = load();
    box.innerHTML = '<div class="of-intro"><div class="alert warn"><b>Antes de começar</b>Este é um guia educativo. Siga sempre a bula dos produtos, teste em material de treino e tenha cuidado com o estilete. Tempos de secagem e cura dependem da cola e do clima.</div>' +
      '<nav class="of-toc" aria-label="Manuais da oficina">' + api.all().map(function (m) { return '<a href="#of-' + m.id + '"><b>' + m.num + '</b> ' + esc(m.title) + '</a>'; }).join('') + '</nav></div>' +
      MANUALS.map(function (m) { return card(m, done); }).join('') +
      '<h3 class="of-bonus-title font-tech">Guia bônus</h3>' + card(BONUS, done) +
      '<div class="of-foot"><button type="button" class="btn-ghost" id="ofReset">↺ Zerar o progresso da oficina</button></div>';
    refresh(box);
    box.addEventListener('change', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-of'); if (!k) return;
      var p = k.split(':'), id = p[0], i = +p[1], list = done[id] || []; var at = list.indexOf(i);
      if (e.target.checked && at < 0) list.push(i); else if (!e.target.checked && at >= 0) list.splice(at, 1);
      done[id] = list; save(done); refresh(box); if (onTick) onTick();
    });
    box.querySelector('#ofReset').addEventListener('click', function () {
      done = {}; save(done); [].forEach.call(box.querySelectorAll('input[data-of]'), function (b) { b.checked = false; }); refresh(box); if (onTick) onTick();
    });
  };
  return api;
});
