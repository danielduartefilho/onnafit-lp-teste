# ONNAFIT LP — Rodada Final de Refinamento (Relatório)

Refinamento de copy, narrativa, UX e calculadora sobre a base v2.1 aprovada. Sem reconstrução, sem novas teses, posicionamento intacto.

## O que mudou nesta rodada

**Hero.** Corpo enxugado para as duas frases aprovadas ("...tecnologia EMS Body Sculpt wireless, portátil e guiada por aplicativo" / "Amplie o que você já vende. Crie programas recorrentes. Extraia mais valor..."). CTA unificado: "Quero avaliar o Onnafit na minha clínica" (hero e pós-calculadora).

**Nova dimensão + complementaridade.** Reescrita como sequência única: tese → "a musculatura" → "Você não precisa substituir aquilo que já funciona" + citação "Justamente..." → visual das três dimensões → "Tecnologias diferentes. Objetivos diferentes. Uma jornada de cuidado mais completa." → fechamento com a frase do ecossistema. Os três cards redundantes (carteira/portfólio/estrutura) saíram — o argumento já está na citação e no fechamento.

**Recorrência.** Jargão eliminado (Motor 1–4, cross-sell, footprint — também removido de "Para quem é" e FAQ). Nova abertura "Um procedimento termina. Um relacionamento pode continuar.", copy aprovada sobre o programa de 10 sessões, três benefícios em linguagem natural (Venda em programas / Traga o cliente de volta / Amplie o valor da relação), visual de jornada mantido com a frase "Amplie a jornada estética..." como legenda, fechamento com a tese-mãe.

**Produto e Como funciona.** Features encurtadas ("Programas guiados"); passos renomeados para ação concreta: Entenda o objetivo → Prepare o sistema → Configure pelo aplicativo → Acompanhe a sessão.

**Calculadora — nova experiência.** Hierarquia potencial → compromisso → proporção em quatro blocos rotulados: SEU NEGÓCIO (slider sempre visível R$120–250, default 150 + slider 1–30 programas, default 15; campos numéricos sincronizados; 10 sessões/programa como premissa fixa, sem terceiro controle) → SEU CENÁRIO (R$1.500/programa, 150 sessões, R$22.500/mês em destaque; anualizada R$270.000 apenas como linha secundária) → SEU INVESTIMENTO (divisor "E como isso se compara ao investimento?", parcela em campo editável default R$2.700, sem slider, com texto de apoio) → PERSPECTIVA (sessões e programas equivalentes calculados dinamicamente, arredondamento para cima, "≈ 2 programas = R$3.000" vs "18 sessões = R$2.700", texto dinâmico sem ROI/payback/break-even/lucro). Recálculo instantâneo, sem botão, controles HTML nativos com labels acessíveis. Disclaimer integral mantido.

**Tracking.** `calculator_scenario` agora inclui `calc_installment` e `calc_equivalent_programs` (mudança de parcela também gera cenário); tudo anexado ao `generate_lead`.

**Formulário.** Correções da v2.1 preservadas (sucesso só com HTTP 2xx, dados nunca perdidos, sem PII no console). Removido o descarte silencioso de leads rápidos — `fill_time_seconds` vai no payload como sinal para o backend. Comentário de arquitetura atualizado: LP → endpoint próprio/serverless (validação + rate-limit) → CRM; não expor webhook de terceiro no frontend.

**Cases.** Sem placeholders; apenas os 3 depoimentos reais (posters a produzir).

## Testes (Playwright, mobile 390px, endpoint mock)

Cenário default: R$1.500 / 150 sessões / R$22.500 / anual R$270.000 / 18 sessões / ≈2 programas = R$3.000 ✓. Cenário custom (R$200 + parcela R$5.400): R$30.000/mês, 27 sessões, ≈3 programas = R$6.000, slider↔campo sincronizados, texto dinâmico correto ✓. `calculator_scenario` com os 6 campos ✓. Lead preenchido em 9s aceito, sucesso após 2xx, `generate_lead` com score 90 + cenário completo, `fill_time_seconds: 9` no payload ✓. Varredura de termos banidos no texto renderizado: só "lucro" aparece — dentro do disclaimer obrigatório ("não lucro, margem ou garantia") ✓. Sem erros de JS ✓.

## Critério de aceite (item 20)

Por que é diferente → hero + dimensões ✓ · Complementaridade → "Você não precisa substituir..." ✓ · Recorrência → programa de 10 sessões como sequência de encontros ✓ · Como funciona → 4 passos concretos ✓ · Quanto representa → SEU CENÁRIO ✓ · Ordem de grandeza do compromisso → SEU INVESTIMENTO ✓ · Programas equivalentes → PERSPECTIVA ✓ · Próximo passo → "Faz sentido para a sua operação?" ✓. Equilíbrio premium/tecnologia/relacionamento/economia mantido; página mais curta que a v2.1.

## Bloqueadores de produção (inalterados)

1. `leadWebhookUrl` (endpoint próprio/serverless com validação e rate-limit) — sem ele nenhum lead é recebido.
2. WhatsApp comercial (`whatsappNumber`).
3. GTM não instalado.
4. Política de privacidade (URL + revisão LGPD) e gestão de cookies.
5. Parcela de R$2.700 e condições não homologadas.
6. Regularização Anvisa não confirmada (FAQ incompleto por design).
7. Assets reais (copiar `/assets` do site atual) + posters dos depoimentos + packshot do ecossistema.
8. Remover `dev-marker` e `noindex` após aprovações; CNPJ/razão social no rodapé.

Dependentes de entrega comercial: protocolos homologados (reinserir Versatilidade), cases quantitativos (reinserir cards estruturados), pesos/threshold do score validados com vendas.
