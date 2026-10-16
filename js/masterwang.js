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
  // Frequência de treino × perfil de uso do pack (editorial: light = lazer/uso eventual, regular = clube 2–3x, heavy = rotina intensa).
  var FREQ_ORDER = ['casual', 'regular', 'intense'], USE_ORDER = ['light', 'regular', 'heavy'];

  function mapAnswersToProfile(a) {
    return { grip: a.grip, goal: a.goal, touch: a.touch, level: LEVEL_BY_GOAL[a.goal] || 'intermediario',
      jointSensitivity: a.body === 'light_safe', body: a.body, freq: FREQ_ORDER.indexOf(a.freq) >= 0 ? a.freq : 'regular' };
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
  function freqFit(freq, use) {
    var d = Math.abs(FREQ_ORDER.indexOf(freq || 'regular') - USE_ORDER.indexOf(use || 'regular'));
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
    var match = 30 * goal + 20 * touchFit(profile.touch || 'balanced', pack.touch) + 20 * weightFit(physics.totalWeight, profile.body) + 15 * freqFit(profile.freq, pack.use) + Math.max(0, 15 - penalty);
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

  /* ---------- Vida útil e desgaste da borracha ---------- */
  // Horas de jogo de REFERÊNCIA informadas na especificação do site (estimativas, não medições). `warnAt`: fração da vida em que o
  // desgaste de desempenho começa (70% informado para tensores; aplicado como referência aos demais).
  var RUBBER_LIFE = {
    tensor: { label: 'Tensor europeia/japonesa de alta performance', short: 'Tensor', models: 'Tenergy, Rozena, Rakza, Vega, Evolution', minH: 200, maxH: 250, warnAt: 0.7,
      tip: 'A partir de ~70% das horas a borracha perde o efeito catapulta e o topsheet começa a oxidar microscopicamente.' },
    tacky: { label: 'Tacky chinesa tradicional', short: 'Tacky chinesa', models: 'Hurricane 3 Neo, Skyline', minH: 300, maxH: 400, warnAt: 0.7,
      tip: 'Esponja dura e durável, mas o topsheet viscoso exige limpeza rigorosa e perde aderência se exposto à poeira.' },
    short_pips: { label: 'Pino curto', short: 'Pino curto', models: 'pinos curtos', minH: 400, maxH: 500, warnAt: 0.7,
      tip: 'Maior durabilidade mecânica, desde que nenhum dente quebre: confira os pinos com frequência.' },
    long_pips: { label: 'Pino longo', short: 'Pino longo', models: 'pinos longos', minH: 400, maxH: 500, warnAt: 0.7,
      tip: 'Maior durabilidade mecânica, desde que nenhum dente quebre: confira os pinos com frequência.' }
  };
  var WEEKS_PER_MONTH = 52 / 12;
  var SIGNALS = {
    grip: { icon: '🔴', label: 'Perda de aderência', desc: 'A bola "escorrega" ao tentar puxar um topspin leve.', types: ['tensor', 'tacky', 'short_pips', 'long_pips'] },
    sponge: { icon: '🟡', label: 'Esponja cansada (bottom-out frequente)', desc: 'A borracha emite um som opaco e a bola afunda sem energia.', types: ['tensor', 'tacky'] },
    oxid: { icon: '🔵', label: 'Oxidação visual', desc: 'Mancha esbranquiçada ou opaca na zona de impacto principal (sweet spot).', types: ['tensor', 'tacky'] },
    teeth: { icon: '⚪', label: 'Pinos quebrados ou achatados', desc: 'Dentes quebrados, achatados ou deformados na zona de impacto.', types: ['short_pips', 'long_pips'] }
  };
  var r1 = function (x) { return Math.round(x * 10) / 10; };
  var fmt1 = function (x) { return String(r1(x)).replace('.', ','); };

  /** Estimativa de vida útil em meses para o tipo de borracha e as horas semanais de treino. */
  function calculateRubberLifespan(o) {
    var def = o && RUBBER_LIFE[o.type];
    if (!def) throw new Error('tipo de borracha inválido: ' + (o && o.type));
    var hpw = +o.hoursPerWeek;
    if (!isFinite(hpw) || hpw <= 0) throw new Error('horas semanais inválidas: ' + (o && o.hoursPerWeek));
    var toMonths = function (h) { return h / hpw / WEEKS_PER_MONTH; };
    var warnH = def.minH * def.warnAt, mMin = toMonths(def.minH), mMax = toMonths(def.maxH), mWarn = toMonths(warnH);
    var a = Math.max(1, Math.round(mMin)), b = Math.max(a, Math.round(mMax));
    var unit = function (n) { return n === 1 ? 'mês' : 'meses'; };
    var text = a === b ? 'cerca de ' + a + ' ' + unit(a) : a + ' a ' + b + ' meses';
    if (mMax >= 24) text += ' (cerca de ' + fmt1(mMin / 12) + ' a ' + fmt1(mMax / 12) + ' anos)';
    return { type: o.type, label: def.label, short: def.short, models: def.models, tip: def.tip, hoursPerWeek: hpw,
      hours: { min: def.minH, max: def.maxH, warn: warnH }, months: { min: r1(mMin), max: r1(mMax), warn: r1(mWarn) },
      text: text, sentence: 'Para ' + hpw + ' ' + (hpw === 1 ? 'hora semanal' : 'horas semanais') + ' de treino, sua borracha ' + def.short + ' durará aproximadamente ' + text + '.',
      longLife: mMax > 24,   // acima de ~2 anos, o envelhecimento pelo tempo tende a antecipar a troca (dica de interface, não é medição)
      segments: { ok: r1(mWarn), attention: r1(mMin - mWarn), replace: r1(mMax - mMin), total: r1(mMax) } };
  }

  /** Sinais de desgaste aplicáveis ao tipo. */
  function wearSignals(type) {
    var out = []; for (var k in SIGNALS) if (SIGNALS[k].types.indexOf(type) >= 0) out.push({ id: k, icon: SIGNALS[k].icon, label: SIGNALS[k].label, desc: SIGNALS[k].desc });
    return out;
  }

  /** Veredito combinando o tempo de uso (opcional) e os sinais marcados. level: ok | attention | replace. */
  function assessRubberWear(o) {
    var life = calculateRubberLifespan(o), valid = wearSignals(o.type).map(function (x) { return x.id; });
    var seen = (o.signals || []).filter(function (id, i, a) { return valid.indexOf(id) >= 0 && a.indexOf(id) === i; });
    var used = +o.monthsInUse, phase = null;
    if (isFinite(used) && used > 0) phase = used >= life.months.min ? 'replace' : used >= life.months.warn ? 'attention' : 'ok';
    var level = (phase === 'replace' || seen.length >= 2) ? 'replace' : (phase === 'attention' || seen.length === 1) ? 'attention' : 'ok';
    var reasons = [];
    if (phase === 'replace') reasons.push('O tempo de uso (' + fmt1(used) + ' meses) já passou da estimativa mínima de vida útil (' + fmt1(life.months.min) + ' meses).');
    if (phase === 'attention') reasons.push('O tempo de uso (' + fmt1(used) + ' meses) já passou do ponto de atenção (' + fmt1(life.months.warn) + ' meses).');
    if (seen.length) reasons.push(seen.length + (seen.length === 1 ? ' sinal de desgaste marcado' : ' sinais de desgaste marcados') + ': ' + seen.map(function (id) { return SIGNALS[id].label.toLowerCase(); }).join(', ') + '.');
    var message = level === 'replace' ? 'Troque agora: a borracha já está na janela de substituição.' : level === 'attention' ? 'Planeje a troca: a borracha entrou na faixa de atenção.' : 'Em bom estado: siga com a manutenção em dia.';
    if (!reasons.length) reasons.push(phase === 'ok' ? 'Dentro do período de desempenho pleno e sem sinais de desgaste.' : 'Sem sinais de desgaste marcados. Informe o tempo de uso para um veredito mais preciso.');
    return { level: level, phase: phase, signalCount: seen.length, signals: seen, message: message, reasons: reasons, life: life };
  }

  /** Sugestões de reposição do catálogo (items = GRProducts.rubbers/pips). Tensor e tacky: durabilidade pesa mais para quem treina muito.
      Pinos: sem nota de durabilidade, ordena pela nota geral dos jogadores. opts.pass(item) aplica o filtro de preço, se houver. */
  function recommendReplacement(items, o) {
    var def = RUBBER_LIFE[o.type]; if (!def) throw new Error('tipo de borracha inválido: ' + o.type);
    var pips = o.type === 'short_pips' || o.type === 'long_pips', hpw = +o.hoursPerWeek || 6;
    var inType = function (it) {
      if (o.type === 'tensor') return it.tipo === 'borracha' && it.cat === 't';
      if (o.type === 'tacky') return it.tipo === 'borracha' && it.cat === 'k' && ['DHS', '729', 'Yinhe'].indexOf(it.marca) >= 0;
      if (o.type === 'short_pips') return it.tipo === 'pino' && (it.cat === 'curto' || it.cat === 'enganoso');
      return it.tipo === 'pino' && it.cat === 'longo';
    };
    var usable = function (it) { return inType(it) && it.status === 'ativo' && it.n != null && it.n >= 10 && (pips ? it.geral != null : (it.dur != null && it.spin != null && it.ctrl != null)); };
    var all = items.filter(usable), budgetIgnored = false, pool = all;
    if (o.pass) { var f = all.filter(o.pass); if (f.length) pool = f; else if (all.length) budgetIgnored = true; }
    var wd = hpw >= 10 ? 0.6 : 0.3;
    var scored = pool.map(function (it) {
      var score = pips ? it.geral : wd * it.dur + (1 - wd) * ((it.spin + it.ctrl) / 2);
      var why = pips ? 'Nota geral ' + fmt1(it.geral) + ' dos jogadores (n=' + it.n + ', confiança ' + it.confianca + '). Pinos não têm nota de durabilidade: confira os dentes.'
        : 'Durabilidade ' + fmt1(it.dur) + ', spin ' + fmt1(it.spin) + ', controle ' + fmt1(it.ctrl) + ' (n=' + it.n + ', confiança ' + it.confianca + ')' + (hpw >= 10 ? '; durabilidade com peso maior por causa do treino intenso.' : '.');
      return { id: it.id, name: it.marca + ' ' + it.modelo, brand: it.marca, model: it.modelo, score: r1(score), n: it.n, confidence: it.confianca, dur: it.dur, why: why, search: it.modelo };
    });
    scored.sort(function (a, b) { return b.score - a.score || b.n - a.n || a.name.localeCompare(b.name); });
    return { picks: scored.slice(0, 3), candidates: all.length, budgetIgnored: budgetIgnored, kind: pips ? 'pips' : 'rubbers' };
  }

  return { AREA: AREA, JOINT: JOINT, ESN: ESN, GRIPS: GRIPS, calculateAssembledPhysics: calculateAssembledPhysics,
    validateMechanicalSynergy: validateMechanicalSynergy, auditMechanicalSynergy: validateMechanicalSynergy, FREQ_ORDER: FREQ_ORDER, freqFit: freqFit, isStiffBlade: isStiffBlade, mapAnswersToProfile: mapAnswersToProfile,
    evaluatePack: evaluatePack, resolveVariant: resolveVariant, recommendPack: recommendPack, calculateRubberLifespan: calculateRubberLifespan, assessRubberWear: assessRubberWear, wearSignals: wearSignals, recommendReplacement: recommendReplacement, RUBBER_LIFE: RUBBER_LIFE, weightFit: weightFit, touchFit: touchFit, jointLimit: jointLimit, summarize: summarize };
});
