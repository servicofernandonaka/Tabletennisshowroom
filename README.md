# Guia da Raquete (projeto separado do CalcMed)

Site estático (HTML/CSS/JS puro, abre direto por `guia-raquete/index.html`).

- `js/catalog.js`: catálogo por **arquétipos** (estimativas, `verified:false`). Sem produtos reais até haver fonte oficial.
- `js/engine.js`: motor determinístico (UMD, sem DOM): filtro por perfil, recomendação, validação de sinergia (bottom-out, pino longo + lâmina rígida, cores ITTF, empunhadura), peso, balance point, radar 0–10.
- `js/app.js` + `index.html`: Quiz, ficha técnica com radar, "Monte o Seu Pack" e guias.
- Testes: `node --test guia-raquete/tests/*.test.js`

Pendente: preencher `products` com dados oficiais (ESN/DHS, camadas, pesos) e ITTF/LARC.

## Catálogo real (Guia Mestre Wang)
- `js/rating.js`: fórmulas de normalização (Revspin → 0–10), confiança por nº de avaliações e radar combinado do pack.
- `js/products.js`: 62 lâminas, 63 borrachas invertidas e 22 pinos/anti transcritos do guia (coleta out/2026). **Não verificados de forma independente.** Specs oficiais ficam em `spec`, fora do radar.
- Pendente: código LARC por borracha, preços em R$ por feed, lâminas caneta japonesas, peso cortado real.

## Estrutura para sinergia (produtos reais)
- Lâminas: `classe` (só quando o spec cita; `classeConfirmada=false` se marcado "verificar"), `construcao`, `carbon`, `stiffness` (derivada da rigidez Revspin, n≥10).
- Borrachas: `type` (tensor/tacky/inverted), `dureza {escala,min,max}` só onde há spec, `sponge` (faixa heurística por escala; ver `BANDS` em `products.js`) e `minLevel`. Pinos: `long-pips`/`short-pips`/`anti`.
- `GREngine.validateProducts` roda as mesmas regras do simulador de arquétipos; atributo `null` desliga a regra correspondente.

## Visual e som
- Tema cyber-sport (grafite `#0B0F19`, vermelho `#FF2A5F`, verde `#00FF88`, azul `#00E5FF`), cards glassmorphism e radar animado (`prefers-reduced-motion` desliga animações e a trilha).
- `js/sound.js`: efeitos e trilha synthwave gerados em WebAudio, sem arquivos. Tudo começa desligado e só liga com clique nos botões "Efeitos" e "Música".
- Recomendações trazem "Por que este kit?" (`reasons` do motor); o simulador lista os serviços de montagem escolhidos.

## Hero e pilares
Layout inspirado em protótipo do Gemini, portado para CSS puro (sem Tailwind CDN): hero com título em gradiente, selo, CTAs que levam ao quiz e ao simulador, contadores do catálogo (calculados dos dados) e os 4 pilares como atalhos. Fontes Outfit/Rajdhani via Google Fonts, com fallback de sistema.

## Plataforma Dual-Experience
- **Modo Guiado** (padrão): Diagnóstico do Mestre Wang (wizard de 4 passos), laudo com pack principal + alternativo, vitrine de 5 packs prontos, comparador A vs. B e glossário.
- **Pro Lab**: tudo o que já existia (quiz Pro, simulador de arquétipos, catálogo, pack real). Links de âncora (`#catalogo`, `#quiz`...) trocam o modo sozinhos. Modo, empunhadura e tradutor ficam em `localStorage`.
- **Tradutor do Mestre Wang** (`js/translator.js`): badges e tooltips em linguagem cotidiana, também sobre conteúdo dinâmico.
- **Motor** `MasterWangEngine` (`js/masterwang.js`, UMD, sem DOM): massa cortada por empunhadura, balanço, 4 regras de sinergia (CRITICAL/WARNING/OPTIMAL) e ranking de packs com match 0–100.
- **Dados**: `js/packs.js` (5 packs). Pesos de lâmina/folha e métricas 0–100 são estimativas editoriais; componentes fora do catálogo ficam marcados `noCatalogo`. Limiares de peso articular (188/180/178 g) vêm da especificação do dono, sem fonte clínica citada.
- Testes: `node --test tests/*.test.js` (31). Fluxo no navegador verificado com Playwright (64 checagens, incluindo 360/390/768 px).

## Visualizações SVG, Pack 06 e compartilhamento
- `js/viz.js` (UMD, SVG puro, sem dependências): arco da bola em perfil lateral (mesa, rede, Bézier `Q`; o ponto de controle sobe com o Throw Angle) e radar de 5 eixos (Velocidade, Efeito, Controle, Retenção, Segurança de Arco). No comparador, os dois radares ficam sobrepostos com `fill-opacity="0.35"`. São ilustrações esquemáticas, não simulação física.
- `pack-tactical-block` (Pack 06): BH com duas variantes (`bhOptions`): liso (Vega Intro 1.8 mm) ou pino curto (Victas Spectol S1). A escolha recalcula peso, radar, alertas, ranking e o link do WhatsApp.
- `js/share.js`: texto do laudo e link `https://wa.me/?text=` (limite de ~1900 caracteres codificados). Nada é enviado sem o clique do usuário.
- Testes: `node --test tests/*.test.js` (39).

## Preço, geometria do sweet spot e wizard de 5 dimensões
- **Filtro de preço** (`js/pricing.js`, UMD): faixa em R$ com slider na vitrine e no catálogo (estado sincronizado e salvo), badges 🟢 Entrada (até R$ 400) · 🔵 Intermediário (R$ 400–900) · 🟣 Pro (acima de R$ 900) com contagem em tempo real. Usa o R$ da loja quando existe; senão, US$ × fator editável (padrão = mediana dos itens com preço nos dois formatos, ≈ 6,86). Packs com itens sem preço mostram "preço parcial" e nunca um total inventado. Estimativa: sem frete, impostos ou montagem.
- **Geometria do sweet spot** (`js/geometry.js`, SVG puro): oval × hexágono estilo Cybershape, com a área extra destacada por máscara. O hexágono é construído para ter +11% na metade superior (valor **informado**, não verificado: a pesquisa só confirmou a descrição do fabricante) e a mesma área total do oval; os números do desenho são calculados e testados.
- **Wizard de 5 dimensões**: empunhadura, estilo/distância, sensação, saúde articular/peso e frequência de treino. Match = 30 estilo + 20 toque + 20 peso + 15 frequência + 15 sem alertas.
- **Auditoria de sinergia**: `MasterWangEngine.auditMechanicalSynergy` (alias de `validateMechanicalSynergy`) também roda no Pro Lab sobre o pack real.
- Testes: `node --test tests/*.test.js` (51).

## Oficina de Bancada (`#oficina`)
- `js/oficina.js` (UMD): 3 manuais práticos (Selagem da Lâmina, Cola à Base d'Água, Corte da Borracha) + guia bônus de manutenção. Cada um traz por que fazer, materiais, passo a passo marcável (progresso salvo em `localStorage`), erros comuns, segurança e uma ilustração SVG pura.
- Acessível pelo menu principal nos dois modos (Guiado e Pro Lab). Conteúdo educativo: tempos de secagem e cura remetem à bula do produto; regras da ITTF citadas com aviso para conferir o texto vigente.
- O tradutor explica termos como *topsheet*, *VOC* e *edge tape* no conteúdo (e ignora SVG e títulos).
- Testes: `node --test tests/*.test.js` (58).
