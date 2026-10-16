/* MasterWangEngine: física de massa cortada, sinergia mecânica e recomendação de packs (UMD, sem DOM).
   Tudo determinístico. Limiares marcados como SPEC vêm da especificação do dono do site (sem fonte clínica/fabricante citada). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var round = Math.round;

  /* ---------- Constantes SPEC ---------- */
  var AREA = { standard: 0.685, defensive: 0.71, penhold_japanese: 0.66, rpb_backhand: 0.61 };
  var CORK_G = 2;          // folha de cortiça traseira (caneta 1 lado)
  var ASSEMBLY_G = 3;      // cola à base d'água + edge tape
  var BALANCE = { heavy: 1.15, light: 1.02 };
  var JOINT = { shakehand: 188, penhold_rpb: 180, sensitive: 178 };
  var ESN = { soft: 42.5, sweetMin: 40, sweetMax: 47.5 };
  var GRIPS = ['shakehand', 'penhold_rpb', 'penhold_classic'];
  var PRO_RUBBER_IDS = ['butterfly-tenergy-05', 'butterfly-dignics-05', 'butterfly-dignics-09c', 'dhs-h3-national-blue-sponge'];
  var BALANCE_LABEL = {
    heavy: 'Head-Heavy (Peso na Cabeça - Maior Potência de Loop)',
    light: 'Head-Light (Peso no Cabo - Transição Rápida e Proteção Articular)',
    neutral: 'Balanced (Equilíbrio Central Neutro)'
  };

  /** Massa real cortada e balanço. Entradas: pesos (g) já resolvidos; sem DOM. */
  function calculateAssembledPhysics(o) {
    var grip = o.grip || 'shakehand';
    if (GRIPS.indexOf(grip) < 0) throw new Error('grip inválido: ' + grip);
    var head = o.bladeHead || (grip === 'penhold_classic' ? 'penhold_japanese' : 'standard');
    if (AREA[head] == null) throw new Error('bladeHead inválido: ' + head);
    var bladeWeight = o.bladeWeight, rawFH = o.rawSheetWeightFH, rawBH = o.rawSheetWeightBH;
    if (![bladeWeight, rawFH].every(isFinite) || (grip !== 'penhold_classic' && !isFinite(rawBH)))
      throw new Error('pesos obrigatórios ausentes');
    var cutFH = round(rawFH * AREA[head]), cutBH;
    if (grip === 'penhold_classic') cutBH = CORK_G;
    else if (grip === 'penhold_rpb') cutBH = round(rawBH * AREA.rpb_backhand);
    else cutBH = round(rawBH * AREA[head]);
    var total = bladeWeight + cutFH + cutBH + ASSEMBLY_G;
    var rubbers = cutFH + cutBH, code = rubbers > bladeWeight * BALANCE.heavy ? 'heavy' : rubbers < bladeWeight * BALANCE.light ? 'light' : 'neutral';
    return { cutWeightFH: cutFH, cutWeightBH: cutBH, assemblyOverhead: ASSEMBLY_G, totalWeight: total,
      balanceCode: code, balance: BALANCE_LABEL[code], areaFactorFH: AREA[head],
      areaFactorBH: grip === 'penhold_classic' ? 0 : grip === 'penhold_rpb' ? AREA.rpb_backhand : AREA[head] };
  }

  function isStiffBlade(b) {
    return !!b && (b.classe === 'OFF+' || /externo|outer/i.test(b.construcao || '') || /ZLC/i.test(b.nome || '') ||
      (/7/.test(b.construcao || '') && b.rigidez === 'stiff'));
  }
  function jointLimit(profile) {
    var lim = Infinity;
    if (profile.grip === 'shakehand') lim = Math.min(lim, JOINT.shakehand);
    if (profile.grip === 'penhold_rpb') lim = Math.min(lim, JOINT.penhold_rpb);
    if (profile.jointSensitivity === true) lim = Math.min(lim, JOINT.sensitive);
    return lim;
  }
  var TITLES = { BOTTOM_OUT: 'Risco de bottom-out', SPEED_TRAP: 'Equipamento arisco para o seu nível', JOINT_OVERLOAD: 'Peso acima do limite articular',
    SWEET_SYNERGY: 'Sinergia mecânica ótima', HANDLE: 'Cabo da lâmina x empunhadura' };
  function D(severity, code, message) { return { severity: severity, code: code, title: TITLES[code] || code, message: message }; }

  /** Cruza [lâmina, FH, BH, perfil]. severity: CRITICAL | WARNING | OPTIMAL. */
  function validateMechanicalSynergy(o) {
    var out = [], b = o.blade, fh = o.fh, bh = o.bh, p = o.profile || {}, ph = o.physics;
    var rubs = [fh, bh].filter(Boolean);
    var beginner = p.level === 'iniciante' || p.level === 'recreativo' || p.level === 'beginner';

    // Regra 1: bottom-out (só com dureza ESN numérica; BF/DHS não são convertíveis → regra desligada)
    if (isStiffBlade(b) && rubs.some(function (r) { return r.hardnessESN != null && r.hardnessESN < ESN.soft; }))
      out.push(D('WARNING', 'BOTTOM_OUT', '⚠️ Risco de Bottom-Out: Em batidas fortes, a bola atravessará a esponja macia direto na madeira rígida, gerando perda súbita de arco e controle.'));

    // Regra 2: armadilha de velocidade
    var speedGear = (b && (b.classe === 'OFF+' || /externo|outer/i.test(b.construcao || '') || /ZLC/i.test(b.nome || ''))) ||
      rubs.some(function (r) { return PRO_RUBBER_IDS.indexOf(r.id) >= 0; });
    if (beginner && speedGear)
      out.push(D('CRITICAL', 'SPEED_TRAP', "🛑 Alerta do Mestre Wang: Equipamento arisco demais para a fase de consolidação técnica. Isso forçará você a 'frear' e encurtar o golpe por medo de jogar para fora, viciando sua biomecânica."));

    // Regra 3: sobrecarga tendínea
    var heavy = ph && ph.totalWeight > jointLimit(p);
    if (heavy)
      out.push(D('WARNING', 'JOINT_OVERLOAD', '⚕️ Alerta Ergonômico (Saúde do Ombro/Cotovelo): Este conjunto ultrapassa o limite seguro de massa inercial para o seu perfil, elevando o risco de fadiga no antebraço e epicondilite lateral.'));

    // Regra 4: casamento harmônico (ALL / ALL+ / OFF- ou inner carbon + 40–47,5° ESN, peso controlado)
    var sweetBlade = b && (['ALL', 'ALL+', 'OFF-'].indexOf(b.classe) >= 0 || /interno|inner/i.test(b.construcao || ''));
    var sweetRubs = rubs.length === 2 && rubs.every(function (r) { return r.hardnessESN != null && r.hardnessESN >= ESN.sweetMin && r.hardnessESN <= ESN.sweetMax; });
    if (sweetBlade && sweetRubs && !isStiffBlade(b) && !heavy)
      out.push(D('OPTIMAL', 'SWEET_SYNERGY', '✅ Sinergia Mecânica Perfeita: O tempo de retenção (Dwell Time) da lâmina trabalha em fase com a esponja, garantindo janela alta sobre a rede e segurança nos bloqueios.'));
    return out;
  }

  /* ---------- Perfil e recomendação ---------- */
  var LEVEL_BY_GOAL = { learn_control: 'iniciante', spin_attacker: 'intermediario', close_blocker: 'intermediario', competitive_step: 'intermediario' };
  var WEIGHT_RULE = { light_safe: { max: 175 }, standard_athletic: { lo: 178, hi: 185 } };
  var TOUCH_ORDER = ['soft', 'balanced', 'crisp'];

  function mapAnswersToProfile(a) {
    return { grip: a.grip, goal: a.goal, touch: a.touch, level: LEVEL_BY_GOAL[a.goal] || 'intermediario',
      jointSensitivity: a.body === 'light_safe', body: a.body };
  }
  function weightFit(total, body) {
    var r = WEIGHT_RULE[body]; if (!r) return 1;
    if (r.max != null) return total <= r.max ? 1 : Math.max(0, 1 - (total - r.max) / 15);
    if (total >= r.lo && total <= r.hi) return 1;
    var d = total < r.lo ? r.lo - total : total - r.hi; return Math.max(0, 1 - d / 10);
  }
  function touchFit(want, have) {
    var d = Math.abs(TOUCH_ORDER.indexOf(want) - TOUCH_ORDER.indexOf(have));
    return d === 0 ? 1 : d === 1 ? 0.5 : 0;
  }
  function jointSeal(total, profile) {
    var lim = jointLimit(profile);
    if (total > lim) return { code: 'red', label: 'Atenção: acima do limite de massa para o seu perfil' };
    if (lim !== Infinity && total > lim - 5) return { code: 'amber', label: 'No limite: monitore fadiga e dores' };
    return { code: 'green', label: 'Dentro do limite de massa para o seu perfil' };
  }

  /** Packs com `bhOptions` (ex.: BH liso ou pino curto) viram uma cópia com o BH da variante escolhida (padrão: a primeira). */
  function resolveVariant(pack, variantId) {
    if (!pack.bhOptions) return pack;
    var opt = pack.bhOptions.filter(function (o) { return o.id === variantId; })[0] || pack.bhOptions[0];
    var copy = {}; for (var k in pack) copy[k] = pack[k];
    copy.bh = opt.bh; copy.variantId = opt.id; copy.variantLabel = opt.label; return copy;
  }

  /** Avalia um pack para uma empunhadura/perfil: física + diagnósticos + selo + match 0–100. */
  function evaluatePack(basePack, profile, variantId) {
    var pack = resolveVariant(basePack, variantId), grip = profile.grip;
    var physics = calculateAssembledPhysics({ grip: grip, bladeWeight: pack.blade.weight,
      rawSheetWeightFH: pack.fh.rawSheetWeight, rawSheetWeightBH: pack.bh.rawSheetWeight });
    var diag = validateMechanicalSynergy({ blade: pack.blade, fh: pack.fh, bh: pack.bh, profile: profile, physics: physics });
    var handleOk = (grip === 'shakehand') === (pack.handle === 'shakehand');
    if (!handleOk) diag.unshift(D('WARNING', 'HANDLE', '🔧 Cabo da lâmina: este pack usa lâmina de cabo ' + (pack.handle === 'shakehand' ? 'shakehand' : 'caneta') + '. Para a empunhadura escolhida, confirme se existe versão compatível da lâmina.'));
    var goal = pack.goals[profile.goal] != null ? pack.goals[profile.goal] : 0.5;
    var penalty = diag.reduce(function (s, d) { return s + (d.severity === 'CRITICAL' ? 15 : d.severity === 'WARNING' ? 6 : 0); }, 0);
    var match = 35 * goal + 25 * touchFit(profile.touch || 'balanced', pack.touch) + 25 * weightFit(physics.totalWeight, profile.body) + Math.max(0, 15 - penalty);
    return { pack: pack, physics: physics, diagnostics: diag, seal: jointSeal(physics.totalWeight, profile), handleOk: handleOk,
      match: Math.max(0, Math.min(100, round(match))) };
  }

  /** Ranking: só packs com cabo compatível entram; principal + alternativo (pode não existir). */
  function recommendPack(answers, packs, variants) {
    var profile = mapAnswersToProfile(answers), vs = variants || {};
    var all = packs.map(function (p) { return evaluatePack(p, profile, vs[p.id]); });
    var eligible = all.filter(function (r) { return r.handleOk; });
    eligible.sort(function (a, b) { return b.match - a.match || a.pack.id.localeCompare(b.pack.id); });
    return { profile: profile, primary: eligible[0] || null, alternative: eligible[1] || null, all: all };
  }

  function summarize(result, answers, text) {
    var p = result.profile, w = WEIGHT_RULE[p.body];
    return 'Empunhadura ' + text.grip[p.grip] + '; objetivo: ' + text.goal[p.goal] + '; toque ' + text.touch[p.touch] +
      '; limite de peso ' + (w.max != null ? 'até ' + w.max + ' g' : w.lo + '–' + w.hi + ' g') + '.';
  }

  return { AREA: AREA, JOINT: JOINT, ESN: ESN, GRIPS: GRIPS, calculateAssembledPhysics: calculateAssembledPhysics,
    validateMechanicalSynergy: validateMechanicalSynergy, isStiffBlade: isStiffBlade, mapAnswersToProfile: mapAnswersToProfile,
    evaluatePack: evaluatePack, resolveVariant: resolveVariant, recommendPack: recommendPack, weightFit: weightFit, touchFit: touchFit, jointLimit: jointLimit, summarize: summarize };
});
