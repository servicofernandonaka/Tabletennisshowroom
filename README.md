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
