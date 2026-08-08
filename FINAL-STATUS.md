# ONNAFIT LP — STATUS FINAL DA BUILD DE TESTE

## URL canônica de teste
https://danielduartefilho.github.io/onnafit-lp-teste/

A raiz redireciona para a build consolidada em `/clean-preview/`.

## Estratégia implementada
- ICP: clínicas/centros de estética, medspas e profissionais com operação e carteira ativa.
- Posicionamento: Onnafit como camada complementar de estímulo muscular, não substituto de outras tecnologias.
- Narrativa: nova camada estética + nova frequência de relacionamento + maior aproveitamento da carteira existente.
- Recorrência: programas de sessões como mecanismo de frequência e relacionamento.
- Economia: simulação ilustrativa, sem promessas de lucro/ROI/payback.

## Calculadora
Defaults atuais:
- R$ 150 por sessão
- 10 sessões por programa
- 15 programas/mês
- R$ 22.500 de receita bruta mensal simulada
- R$ 2.700 de parcela de referência
- aproximadamente 2 programas/mês para gerar receita bruta superior à parcela considerada

## Conversão
O formulário final:
1. coleta nome, WhatsApp, cidade/UF e e-mail opcional;
2. qualifica tipo de operação, carteira ativa e momento;
3. carrega o cenário atual da calculadora;
4. abre o WhatsApp oficial da WiemsPro Brasil com mensagem pré-preenchida contendo contexto comercial e cenário simulado.

WhatsApp configurado: +55 (11) 91222-8205.

## Tracking preparado
`dataLayer` recebe:
- cta_click
- calculator_start
- calculator_scenario
- lead_form_step
- generate_lead
- whatsapp_click

Também são persistidos `first_campaign_touch` e `last_campaign_touch` quando há UTM/gclid/fbclid.

## Mídia
A build tenta usar os vídeos em português da V1 e possui fallback para mídia oficial quando aplicável.

### Para produção definitiva
Internalizar no próprio domínio/CDN, mediante validação de uso:
- vídeo institucional em português;
- depoimento 1;
- depoimento 2;
- depoimento 3;
- imagens oficiais escolhidas para hero, produto, app e aplicação.

## Itens externos que ainda dependem de homologação real
Estes pontos não devem ser inventados no código:
- número/documento específico de regularização ANVISA do produto ofertado no Brasil;
- condição comercial/parcela de R$ 2.700 confirmada para a configuração a ser anunciada;
- política de privacidade final e controlador dos dados;
- GTM/GA4/Meta IDs reais, se a equipe decidir instalar as tags;
- CRM/webhook, caso a equipe queira duplicar o lead no CRM além do WhatsApp.

## Regra de publicação
A build de teste permanece `noindex`. Remover `noindex` somente após homologação comercial, jurídica/regulatória e de mídia.
