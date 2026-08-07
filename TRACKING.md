# ONNAFIT LP v2.1 — Documentação de Tracking

Eventos via `window.dataLayer.push({ event, ...payload })` (js/main.js). Container GTM ainda **não** instalado — inserir o snippet com ID real no `<head>` (marcador posicionado). Eventos únicos usam guarda `firedOnce` — sem disparos duplicados.

## Eventos do front

| Evento | Trigger | Disparo | Payload |
|---|---|---|---|
| `view_offer` | Carregamento da página | 1× por pageview | `offer`, `lt_source`, `lt_campaign` |
| `calculator_start` | Primeira interação (slider, campo numérico ou parcela) | 1× por pageview | — |
| `calculator_scenario` | 1,2 s após estabilização de cada **cenário distinto** (tupla preço × programas × parcela) | 1× por cenário distinto | `calc_session_price`, `calc_sessions_per_program` (fixo 10), `calc_programs_per_month`, `calc_monthly_revenue`, `calc_installment`, `calc_equivalent_programs` |
| `calculator_complete` | Primeiro cenário estabilizado | 1× por pageview | idem acima |
| `cta_click` | Clique em `[data-cta]` | a cada clique | `cta_id`, `cta_text` |
| `form_start` | Primeiro focus em campo do formulário | 1× por pageview | `form_id` |
| `form_step_complete` | Avanço válido de etapa | a cada avanço | `form_id`, `step` (1–3) |
| `form_submit_error` | Falha de envio (rede, HTTP ≠ 2xx ou endpoint ausente) | a cada falha | `form_id` |
| `generate_lead` | **Somente após confirmação HTTP 2xx do endpoint** | 1× por pageview | `form_id`, `lead_operacao`, `lead_momento`, `lead_score`, `lead_score_version` + **cenário simulado** (`calc_*`) |
| `qualify_lead_signal` | Após `generate_lead`, se `lead_score ≥ threshold` | 1× por pageview | `form_id`, `lead_score`, `lead_score_version` |

## Estágios downstream (CRM — não disparados pelo front)

`qualify_lead` **definitivo** — CRM, após aplicação da regra comercial sobre o lead recebido.
`working_lead` — CRM, quando um vendedor efetivamente inicia o atendimento.
`meeting_scheduled` — agendador/CRM. `proposal_sent`, `close_convert_lead` — CRM.
Enviar via GA4 Measurement Protocol + Meta Conversions API (otimizar campanhas para qualidade, com `event_id` compartilhado para deduplicação Pixel × CAPI).

## Score de pré-qualificação (configurável)

`ONNAFIT_CONFIG.leadScore` (v1, threshold 70/100):

| Campo | Pontos |
|---|---|
| Operação | Clínica 30 · Medspa 30 · Independente 15 · Outro 5 |
| Carteira ativa | Sim 30 · Construindo 10 · Ainda não 0 |
| Procedimentos corporais | Sim 20 · Não 5 |
| Momento | Agora 20 · 3 meses 10 · Pesquisando 5 |

O score vai no payload do lead (`lead_score`) — o CRM decide a qualificação definitiva. Ajustar pesos/threshold com o time comercial e versionar (`lead_score_version`).

## Atribuição — first_touch / last_touch

Persistida em `localStorage` (`onnafit_attr_v2`), TTL **90 dias** (`attributionTtlDays`).

- `first_touch`: gravado na primeira visita dentro do TTL; nunca sobrescrito.
- `last_touch`: **substituído integralmente** sempre que a URL traz nova origem (qualquer `utm_*`, `gclid` ou `fbclid`). Parâmetros de campanhas diferentes nunca são mesclados.
- Cada touch: `utm_*` presentes, `gclid`/`fbclid`, `landing_page`, `referrer`, `captured_at`.
- Ambos os objetos vão íntegros no payload do lead (`attribution.first_touch` / `attribution.last_touch`).

## Envio do lead (fluxo obrigatório)

submit → validação → honeypot → POST JSON em `ONNAFIT_CONFIG.leadWebhookUrl` → **HTTP 2xx** → tela de sucesso + `generate_lead`.

Leads rápidos **não** são descartados no cliente: `fill_time_seconds` vai no payload como sinal para o backend. Arquitetura recomendada: LP → **endpoint próprio/serverless** (validação, honeypot, rate-limit) → CRM/integrador — não expor webhook de terceiro no frontend.

Falha (rede, ≠2xx, endpoint ausente): dados preservados no formulário, mensagem de erro, retry habilitado, botão de contingência WhatsApp, evento `form_submit_error`. A tela "Recebemos suas informações" **nunca** aparece sem confirmação do endpoint. Nenhum dado pessoal é logado no console.
