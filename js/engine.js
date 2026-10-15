/* Motor determinístico do Guia da Raquete (UMD, sem DOM). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./catalog.js'));
  else root.GREngine = factory(root.GRCatalog);
})(typeof self !== 'undefined' ? self : this, function (C) {
  var LV = C.LEVELS;
  var lvIdx = function (l) { return LV.indexOf(l); };
  var byId = function (list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; };
  var clamp = function (x) { return Math.max(0, Math.min(10, x)); };
  var round1 = function (x) { return Math.round(x * 10) / 10; };

  var STYLES = {
    looper: { blade: ['ALL+', 'OFF'], fh: ['tensor', 'tacky'], bh: ['tensor', 'inverted'] },
    counter: { blade: ['ALL+', 'OFF'], fh: ['tensor', 'inverted'], bh: ['tensor', 'inverted', 'short-pips'] },
    allround: { blade: ['ALL', 'ALL+'], fh: ['inverted', 'tensor'], bh: ['inverted'] },
    defender: { blade: ['DEF', 'ALL'], fh: ['inverted', 'tensor'], bh: ['long-pips', 'anti'] },
    pips: { blade: ['ALL+', 'OFF'], fh: ['short-pips'], bh: ['inverted', 'short-pips'] }
  };

  function thickness(rubber, id) { return byId(rubber.thicknesses, id) || rubber.thicknesses[0]; }
  function rubberWeight(sel) {
    var r = byId(C.rubbers, sel.rubberId); var t = thickness(r, sel.thicknessId);
    return r.weight[t.bucket];
  }

  /** Peso estimado do conjunto pronto (g): lâmina + 2 borrachas cortadas + cola/fita (estimativa). */
  function estimateWeight(setup) {
    var b = byId(C.blades, setup.bladeId);
    var fh = rubberWeight(setup.fh), bh = rubberWeight(setup.bh);
    var extra = [3, 6];
    return { min: b.weight[0] + fh[0] + bh[0] + extra[0], max: b.weight[1] + fh[1] + bh[1] + extra[1], estimated: true };
  }

  /** Balance point: heurística (lâmina + massa das borrachas). */
  function balancePoint(setup) {
    var b = byId(C.blades, setup.bladeId);
    var s = { light: -1, neutral: 0, heavy: 1 }[b.balance];
    var fh = rubberWeight(setup.fh), bh = rubberWeight(setup.bh);
    var rubberMax = fh[1] + bh[1];
    if (rubberMax >= 90) s += 1; else if (rubberMax <= 60) s -= 1;
    return s >= 1 ? 'head-heavy' : s <= -1 ? 'head-light' : 'neutral';
  }

  /** Radar 0-10: lâmina pesa 40% em speed/control; borrachas 60% (FH 60/BH 40 em speed/spin). */
  function radar(setup) {
    var b = byId(C.blades, setup.bladeId);
    var f = byId(C.rubbers, setup.fh.rubberId).m, k = byId(C.rubbers, setup.bh.rubberId).m;
    var mix = function (key) { return 0.6 * f[key] + 0.4 * k[key]; };
    var thk = function (sel) { return { thin: -0.5, std: 0, max: 0.5, ox: -1 }[thickness(byId(C.rubbers, sel.rubberId), sel.thicknessId).bucket]; };
    var boost = (thk(setup.fh) * 0.6 + thk(setup.bh) * 0.4);
    return {
      speed: round1(clamp(0.4 * b.speed + 0.6 * mix('speed') + boost)),
      spin: round1(clamp(mix('spin') + boost * 0.5)),
      control: round1(clamp(0.4 * b.control + 0.6 * mix('control') - boost)),
      throwAngle: round1(clamp(mix('throwAngle'))),
      dwell: round1(clamp(mix('dwell')))
    };
  }
  function throwLabel(v) { return v < 4 ? 'Baixo' : v < 7 ? 'Médio' : 'Alto'; }

  function A(severity, code, title, message) { return { severity: severity, code: code, title: title, message: message }; }

  /** Regras de sinergia sobre um contexto já resolvido. Campos nulos/desconhecidos desligam a regra.
      ctx: {b:{cls,stiffness,grips,weight,carbon}, fh, bh:{type,sponge,minLevel}, fhColor, bhColor, maxBoth, control, total} */
  function runRules(ctx, p) {
    var out = [], b = ctx.b, rubs = [ctx.fh, ctx.bh];
    var fast = b.cls === 'OFF+' || b.cls === 'OFF';
    var beginner = p.level === 'beginner';
    var cl = b.cls || 'rígida';

    if (p.grip && b.grips && b.grips.indexOf(p.grip) < 0)
      out.push(A('block', 'GRIP', 'Empunhadura incompatível', 'Esta lâmina não está disponível para a empunhadura escolhida.'));

    if (ctx.fhColor && ctx.bhColor && ctx.fhColor === ctx.bhColor)
      out.push(A('block', 'COLOR', 'Cores iguais', 'Pelas regras ITTF, os dois lados da raquete devem ter cores diferentes (vermelho e preto).'));

    var pipsLong = rubs.some(function (r) { return r.type === 'long-pips' || r.type === 'anti'; });
    if (pipsLong && b.stiffness === 'stiff') {
      out.push(beginner
        ? A('block', 'LONGPIPS_STIFF', 'Combinação inviável para iniciantes', 'Pino longo/anti-spin com lâmina ' + cl + ' ultra-rígida torna o retorno imprevisível e difícil de controlar para quem está começando.')
        : A('warn', 'LONGPIPS_STIFF', 'Pino longo em lâmina rígida', 'Lâmina ' + cl + ' rígida com pino longo/anti reduz o controle; a bola fica rápida e difícil de dosear.'));
    }

    var softTensor = rubs.some(function (r) { return r.type === 'tensor' && r.sponge === 'soft'; });
    if (b.cls === 'OFF+' && b.stiffness === 'stiff' && softTensor)
      out.push(A('critical', 'BOTTOM_OUT', 'Risco de bottom-out',
        'Lâmina de carbono extremamente rígida e rápida (OFF+) com borracha tensor de esponja macia: em impacto forte a esponja pode afundar até a lâmina (bottom-out), com perda de controle.'));
    else if (b.cls !== 'OFF+' && b.carbon && b.stiffness === 'stiff' && softTensor)
      out.push(A('warn', 'BOTTOM_OUT_RISK', 'Possível bottom-out',
        'Lâmina de carbono de rigidez alta (classe não confirmada, rigidez derivada de avaliações de jogadores) com tensor de esponja macia: em impacto forte a esponja pode afundar até a lâmina. Teste antes de comprar.'));

    if (beginner && b.cls === 'OFF+') out.push(A('block', 'BEGINNER_OFFPLUS', 'Lâmina OFF+ para iniciante', 'Lâmina OFF+ tem margem de erro muito baixa; prefira ALL, ALL+ ou DEF.'));
    else if (beginner && b.cls === 'OFF') out.push(A('warn', 'BEGINNER_OFF', 'Lâmina rápida para iniciante', 'Lâmina OFF reduz a margem de erro; considere ALL+ ou ALL.'));

    if (beginner && rubs.some(function (r) { return r.minLevel && r.minLevel !== 'beginner'; }))
      out.push(A('warn', 'BEGINNER_RUBBER', 'Borracha exigente', 'Tensores, tacky e pinos exigem técnica; para iniciantes a invertida clássica é mais indicada.'));

    if (beginner && ctx.maxBoth) out.push(A('warn', 'BEGINNER_MAX', 'Esponja Max', 'Esponja Max aumenta potência e peso; 1.8–2.0 mm facilita o controle.'));

    if (p.style === 'defender' && fast) out.push(A('warn', 'DEF_FAST', 'Lâmina rápida para defesa', 'Defesa de chop longe da mesa pede controle; lâmina ' + b.cls + ' tende a jogar a bola para fora.'));
    if (p.style === 'pips' && ctx.fh.type !== 'short-pips') out.push(A('info', 'PIPS_FH', 'Estilo pips-out', 'Este estilo costuma usar pino curto no forehand.'));

    if (ctx.control != null && ctx.control < 4) out.push(A('warn', 'LOW_CONTROL', 'Controle baixo', 'Controle estimado ' + ctx.control + '/10: pouca margem de erro.'));

    if (b.weight && b.weight[1] > 90) {
      var sensitive = beginner || p.weight === 'light';
      out.push(A(sensitive ? 'warn' : 'info', 'WEIGHT_HEAVY', 'Lâmina pesada',
        'Lâmina de ' + b.weight[0] + '–' + b.weight[1] + ' g' + (ctx.total ? ' (conjunto pronto ~' + ctx.total[0] + '–' + ctx.total[1] + ' g)' : '') + '. Acima de ~90 g há mais inércia de potência, porém maior carga em ombro e cotovelo (risco de epicondilite com uso intenso). Em caso de dor, procure um profissional de saúde.'));
    }
    if (b.weight && b.weight[0] < 85 && p.weight === 'heavy')
      out.push(A('info', 'WEIGHT_LIGHT', 'Mais leve que o preferido', 'Lâmina de ' + b.weight[0] + '–' + b.weight[1] + ' g; você prefere lâmina pesada (>90 g).'));
    return out;
  }

  /** Validação de sinergia (arquétipos). severity: block | critical | warn | info. */
  function validateSetup(setup, profile) {
    var b = byId(C.blades, setup.bladeId);
    var fh = byId(C.rubbers, setup.fh.rubberId), bh = byId(C.rubbers, setup.bh.rubberId);
    var w = estimateWeight(setup);
    var isMax = function (s) { return thickness(byId(C.rubbers, s.rubberId), s.thicknessId).bucket === 'max'; };
    return runRules({ b: b, fh: fh, bh: bh, fhColor: setup.fhColor, bhColor: setup.bhColor,
      maxBoth: isMax(setup.fh) || isMax(setup.bh), control: radar(setup).control, total: [w.min, w.max] }, profile || {});
  }

  /** Validação de sinergia para produtos reais (js/products.js já traz cls, stiffness, type, sponge).
      Atributos ausentes (null) desligam a regra correspondente: nunca se presume dado. */
  function validateProducts(sel, profile) {
    var b = sel.blade, f = sel.fh, k = sel.bh;
    return runRules({ b: { cls: b.classe, stiffness: b.stiffness, grips: b.grips, weight: null, carbon: b.carbon },
      fh: { type: f.type, sponge: f.sponge, minLevel: f.minLevel }, bh: { type: k.type, sponge: k.sponge, minLevel: k.minLevel },
      fhColor: sel.fhColor, bhColor: sel.bhColor, maxBoth: false, control: sel.control == null ? null : sel.control }, profile || {});
  }

  function hasBlock(alerts) { return alerts.some(function (a) { return a.severity === 'block'; }); }

  /** Itens do catálogo viáveis para o perfil (quiz → filtro antes de exibir catálogo). */
  function filterCatalog(profile) {
    var l = lvIdx(profile.level);
    return {
      blades: C.blades.filter(function (b) { return l >= lvIdx(b.minLevel) && b.grips.indexOf(profile.grip) >= 0 && !(profile.level === 'beginner' && (b.cls === 'OFF+')); }),
      rubbers: C.rubbers.filter(function (r) { return l >= lvIdx(r.minLevel); })
    };
  }


  function recommend(profile, n) {
    var st = STYLES[profile.style] || STYLES.allround, res = [];
    var f = filterCatalog(profile);
    f.blades.forEach(function (b) {
      f.rubbers.forEach(function (fh) {
        f.rubbers.forEach(function (bh) {
          var tf = fh.thicknesses[Math.min(2, fh.thicknesses.length - 1)], tb = bh.thicknesses[Math.min(2, bh.thicknesses.length - 1)];
          if (profile.level === 'beginner') { tf = fh.thicknesses[Math.min(1, fh.thicknesses.length - 1)]; tb = bh.thicknesses[Math.min(1, bh.thicknesses.length - 1)]; }
          var setup = { bladeId: b.id, fh: { rubberId: fh.id, thicknessId: tf.id }, bh: { rubberId: bh.id, thicknessId: tb.id } };
          var alerts = validateSetup(setup, profile);
          if (hasBlock(alerts)) return;
          var score = 0;
          if (st.blade.indexOf(b.cls) >= 0) score += 3;
          if (st.fh.indexOf(fh.type) >= 0) score += 3;
          if (st.bh.indexOf(bh.type) >= 0) score += 2;
          if (profile.touch === b.stiffness) score += 2;
          if (profile.weight === 'light' && b.weight[1] < 85) score += 2;
          if (profile.weight === 'heavy' && b.weight[0] > 85) score += 2;
          score -= alerts.filter(function (a) { return a.severity === 'warn'; }).length;
          score -= 3 * alerts.filter(function (a) { return a.severity === 'critical'; }).length;
          res.push({ setup: setup, score: score, alerts: alerts });
        });
      });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return res.slice(0, n || 3);
  }

  return { STYLES: STYLES, estimateWeight: estimateWeight, balancePoint: balancePoint, radar: radar,
    throwLabel: throwLabel, validateSetup: validateSetup, validateProducts: validateProducts, hasBlock: hasBlock, filterCatalog: filterCatalog,
    recommend: recommend, byId: byId };
});
