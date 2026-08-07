/* ============================================================
   ONNAFIT LP v2.1 — main.js
   Calculadora + formulário multi-step + atribuição + dataLayer
   Documentação dos eventos: TRACKING.md
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   CONFIGURAÇÃO CENTRAL
   ------------------------------------------------------------ */
const ONNAFIT_CONFIG = {
  calculator: {
    sessionPrice: 150,          // R$ por sessão (default; slider 120–250)
    sessionsPerProgram: 10,     // premissa FIXA nesta versão (sem controle na UI)
    programsPerMonth: 15,       // programas vendidos/mês (default; slider 1–30)
    referenceInstallment: 2700  // [PENDENTE HOMOLOGAÇÃO] parcela default do campo editável
  },
  // [PENDENTE] número oficial do WhatsApp comercial (formato internacional, ex.: '5511999999999')
  whatsappNumber: '',
  whatsappMessage: 'Olá! Estive na página do Onnafit e gostaria de falar com um especialista.',
  // [PENDENTE — BLOQUEADOR] endpoint de lead (POST JSON, deve responder 2xx).
  // Arquitetura recomendada: LP → endpoint PRÓPRIO/serverless (validação, honeypot,
  // rate limit) → CRM/integrador. Não expor webhook de terceiro diretamente aqui.
  // Sem endpoint, o formulário exibe o estado de falha com contingência — nunca sucesso.
  leadWebhookUrl: '',
  // Prazo de expiração da atribuição persistida (dias)
  attributionTtlDays: 90,
  // Score de pré-qualificação (sinal para mídia/CRM — a qualificação DEFINITIVA
  // é do CRM, que dispara qualify_lead e working_lead. Ver TRACKING.md.)
  leadScore: {
    version: 'v1',
    threshold: 70,
    rules: {
      operacao:  { 'Clínica de estética': 30, 'Medspa / espaço premium': 30, 'Profissional independente': 15, 'Outro': 5 },
      carteira:  { 'Sim': 30, 'Estou construindo': 10, 'Ainda não': 0 },
      corporais: { 'Sim': 20, 'Não': 5 },
      momento:   { 'Agora / curto prazo': 20, 'Próximos 3 meses': 10, 'Estou pesquisando': 5 }
    }
  }
};

/* ------------------------------------------------------------
   dataLayer — disparo com proteção anti-duplicação
   ------------------------------------------------------------ */
window.dataLayer = window.dataLayer || [];
const firedOnce = new Set();

function track(eventName, payload = {}, once = false) {
  if (once) {
    if (firedOnce.has(eventName)) return;
    firedOnce.add(eventName);
  }
  window.dataLayer.push({ event: eventName, ...payload });
}

/* ------------------------------------------------------------
   ATRIBUIÇÃO — first_touch / last_touch com expiração
   Regras:
   - first_touch: gravado uma única vez (primeira visita dentro do TTL).
   - last_touch: substituído INTEGRALMENTE sempre que uma nova origem de
     campanha é identificada (qualquer utm_*, gclid ou fbclid na URL).
   - Nunca mescla parâmetros de visitas/campanhas diferentes.
   - TTL: ONNAFIT_CONFIG.attributionTtlDays — expirado, tudo é descartado.
   ------------------------------------------------------------ */
const ATTR_KEY = 'onnafit_attr_v2';
const CAMPAIGN_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

function buildTouch(params) {
  const touch = {};
  CAMPAIGN_PARAMS.forEach((p) => { const v = params.get(p); if (v) touch[p] = v; });
  touch.landing_page = location.href.split('#')[0];
  if (document.referrer) touch.referrer = document.referrer;
  touch.captured_at = new Date().toISOString();
  return touch;
}

function captureAttribution() {
  const ttlMs = ONNAFIT_CONFIG.attributionTtlDays * 24 * 60 * 60 * 1000;
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(ATTR_KEY)); } catch (e) { /* noop */ }
  if (stored && stored.updated_at && (Date.now() - new Date(stored.updated_at).getTime() > ttlMs)) {
    stored = null; // expirado — descarta integralmente
  }
  stored = stored || {};

  const params = new URLSearchParams(location.search);
  const hasCampaign = CAMPAIGN_PARAMS.some((p) => params.get(p));
  const touch = buildTouch(params);

  if (!stored.first_touch) stored.first_touch = touch;
  if (hasCampaign || !stored.last_touch) stored.last_touch = touch; // substituição integral
  stored.updated_at = new Date().toISOString();

  try { localStorage.setItem(ATTR_KEY, JSON.stringify(stored)); } catch (e) { /* noop */ }
  return stored;
}

const attribution = captureAttribution();

/* ------------------------------------------------------------
   UTILITÁRIOS + ESTADO COMPARTILHADO
   ------------------------------------------------------------ */
const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const $ = (sel) => document.querySelector(sel);
const state = { calcScenario: null }; // último cenário estabilizado da calculadora

// Evento de visualização da oferta (equivalente a view_item)
track('view_offer', {
  offer: 'onnafit_system',
  lt_source: attribution.last_touch && attribution.last_touch.utm_source,
  lt_campaign: attribution.last_touch && attribution.last_touch.utm_campaign
}, true);

/* ------------------------------------------------------------
   CALCULADORA
   ------------------------------------------------------------ */
(function initCalculator() {
  const cfg = ONNAFIT_CONFIG.calculator;
  const pairs = [
    { num: $('#calc-price'), range: $('#calc-price-range'), def: cfg.sessionPrice },
    { num: $('#calc-programs'), range: $('#calc-programs-range'), def: cfg.programsPerMonth }
  ];
  const installmentInput = $('#calc-installment');
  if (pairs.some((p) => !p.num || !p.range) || !installmentInput) return;

  pairs.forEach((p) => { p.num.value = p.def; p.range.value = p.def; });
  installmentInput.value = cfg.referenceInstallment;

  let scenarioTimer = null;
  let lastScenarioKey = null;

  function clamp(input) {
    const min = Number(input.min), max = Number(input.max);
    let v = Number(input.value);
    if (Number.isNaN(v)) v = min;
    return Math.min(max, Math.max(min, v));
  }

  function values() {
    return {
      price: clamp(pairs[0].num),
      programs: clamp(pairs[1].num),
      sessions: cfg.sessionsPerProgram, // premissa fixa (10)
      installment: clamp(installmentInput)
    };
  }

  function render() {
    const { price, programs, sessions, installment } = values();
    const perProgram = sessions * price;                       // receita por programa
    const sessionsMonth = programs * sessions;                 // sessões/mês
    const revMonth = programs * perProgram;                    // receita bruta mensal
    const revYear = revMonth * 12;                             // dado secundário
    const equivSessions = Math.ceil(installment / price);      // sessões equivalentes
    const equivPrograms = Math.ceil(installment / perProgram); // programas (arredondar p/ cima)

    // SEU CENÁRIO
    $('#r-program').textContent = fmtBRL(perProgram);
    $('#r-sessions').textContent = String(sessionsMonth);
    $('#r-month').textContent = fmtBRL(revMonth);
    $('#r-year').textContent = fmtBRL(revYear);

    // PERSPECTIVA — receita bruta equivalente ao valor da parcela
    // (nunca apresentar como ROI, payback, break-even ou lucro)
    $('#p-text').innerHTML = 'No cenário acima, aproximadamente <strong class="accent-ink">' +
      equivPrograms + (equivPrograms === 1 ? ' programa mensal gera' : ' programas mensais geram') +
      '</strong> receita bruta superior ao valor da parcela considerada.';
    $('#p-sessions').textContent = equivSessions + ' sessões';
    $('#p-installment').textContent = fmtBRL(installment);
    $('#p-programs').textContent = '≈ ' + equivPrograms + (equivPrograms === 1 ? ' programa' : ' programas');
    $('#p-programs-rev').textContent = fmtBRL(equivPrograms * perProgram);

    return { price, programs, sessions, installment, revMonth, equivPrograms };
  }

  function scheduleScenario() {
    // calculator_scenario: 1,2s após estabilização, só para cenário distinto.
    // O cenário atual fica em state.calcScenario e enriquece o generate_lead.
    clearTimeout(scenarioTimer);
    scenarioTimer = setTimeout(() => {
      const r = render();
      const key = [r.price, r.programs, r.installment].join('|');
      state.calcScenario = {
        calc_session_price: r.price,
        calc_sessions_per_program: r.sessions,
        calc_programs_per_month: r.programs,
        calc_monthly_revenue: r.revMonth,
        calc_installment: r.installment,
        calc_equivalent_programs: r.equivPrograms
      };
      if (key !== lastScenarioKey) {
        lastScenarioKey = key;
        track('calculator_scenario', { ...state.calcScenario });
        track('calculator_complete', { ...state.calcScenario }, true); // 1º cenário estabilizado
      }
    }, 1200);
  }

  function onInteract(source) {
    return () => {
      pairs.forEach((p) => {
        if (source === 'range') p.num.value = p.range.value;
        else if (source === 'num') p.range.value = clamp(p.num);
      });
      render();
      track('calculator_start', {}, true);
      scheduleScenario();
    };
  }

  pairs.forEach((p) => {
    p.range.addEventListener('input', onInteract('range'));
    p.num.addEventListener('input', onInteract('num'));
    p.num.addEventListener('blur', () => { p.num.value = clamp(p.num); p.range.value = p.num.value; render(); });
  });

  installmentInput.addEventListener('input', () => {
    render();
    track('calculator_start', {}, true);
    scheduleScenario();
  });
  installmentInput.addEventListener('blur', () => { installmentInput.value = clamp(installmentInput); render(); });

  render();
})();

/* ------------------------------------------------------------
   CTA CLICKS
   ------------------------------------------------------------ */
document.querySelectorAll('[data-cta]').forEach((el) => {
  el.addEventListener('click', () => {
    track('cta_click', { cta_id: el.dataset.cta, cta_text: el.textContent.trim().slice(0, 60) });
  });
});

/* ------------------------------------------------------------
   FORMULÁRIO MULTI-STEP
   Fluxo obrigatório: submit → POST endpoint → HTTP 2xx → tela de
   sucesso → generate_lead. Falha: dados preservados, retry +
   contingência WhatsApp. Sem PII no console.
   ------------------------------------------------------------ */
(function initForm() {
  const form = $('#lead-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  const dots = Array.from(form.querySelectorAll('.progress-dot'));
  const btnPrev = $('#form-prev');
  const btnNext = $('#form-next');
  const btnSubmit = $('#form-submit');
  const errorMsg = $('#form-error');
  const failBox = $('#form-fail');
  let current = 0;
  const formOpenedAt = Date.now();

  form.addEventListener('focusin', () => track('form_start', { form_id: 'lead-form' }, true), { once: true });

  function showStep(i) {
    current = i;
    steps.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx <= i));
    btnPrev.hidden = i === 0;
    btnNext.hidden = i === steps.length - 1;
    btnSubmit.hidden = i !== steps.length - 1;
    errorMsg.hidden = true;
  }

  function validateStep(i) {
    const step = steps[i];
    let ok = true;
    step.querySelectorAll('input[required]:not([type="radio"])').forEach((input) => {
      const valid = input.checkValidity() && input.value.trim().length > 1;
      input.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    const radioNames = new Set(Array.from(step.querySelectorAll('input[type="radio"][required]')).map((r) => r.name));
    radioNames.forEach((name) => {
      const checked = !!step.querySelector(`input[name="${name}"]:checked`);
      const group = step.querySelector(`input[name="${name}"]`).closest('.radio-cards');
      group.classList.toggle('invalid', !checked);
      if (!checked) ok = false;
    });
    return ok;
  }

  function computeScore(data) {
    const cfg = ONNAFIT_CONFIG.leadScore;
    let score = 0;
    Object.keys(cfg.rules).forEach((field) => {
      score += cfg.rules[field][data[field]] || 0;
    });
    return { score, threshold: cfg.threshold, version: cfg.version };
  }

  function setSubmitting(on) {
    btnSubmit.disabled = on;
    btnSubmit.textContent = on ? 'Enviando…' : 'Quero avaliar o Onnafit';
  }

  function showFail() {
    failBox.hidden = false;
    const wa = $('#whatsapp-fallback');
    if (ONNAFIT_CONFIG.whatsappNumber) {
      wa.href = 'https://wa.me/' + ONNAFIT_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(ONNAFIT_CONFIG.whatsappMessage);
      wa.hidden = false;
    }
    track('form_submit_error', { form_id: 'lead-form' });
  }

  btnNext.addEventListener('click', () => {
    if (!validateStep(current)) { errorMsg.hidden = false; return; }
    track('form_step_complete', { form_id: 'lead-form', step: current + 1 });
    showStep(current + 1);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  btnPrev.addEventListener('click', () => showStep(current - 1));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(current)) { errorMsg.hidden = false; return; }
    failBox.hidden = true;

    const data = Object.fromEntries(new FormData(form).entries());

    // Anti-spam no cliente: apenas honeypot. Leads rápidos NÃO são descartados —
    // o tempo de preenchimento vai como sinal para o backend decidir.
    if (data.website) return;
    delete data.website;

    const scoring = computeScore(data);
    const payload = {
      ...data,
      submitted_at: new Date().toISOString(),
      fill_time_seconds: Math.round((Date.now() - formOpenedAt) / 1000),
      lead_score: scoring.score,
      lead_score_version: scoring.version,
      calc_scenario: state.calcScenario, // cenário simulado antes da conversão (ou null)
      attribution: {
        first_touch: attribution.first_touch,
        last_touch: attribution.last_touch
      }
    };

    if (!ONNAFIT_CONFIG.leadWebhookUrl) {
      // Sem endpoint configurado NÃO existe confirmação de recebimento —
      // portanto nunca mostrar sucesso. (BLOQUEADOR de publicação.)
      console.warn('[onnafit] leadWebhookUrl não configurado — envio impossível.');
      showFail();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(ONNAFIT_CONFIG.leadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      // ---- Confirmação 2xx recebida: sucesso + generate_lead ----
      track('generate_lead', {
        form_id: 'lead-form',
        lead_operacao: data.operacao,
        lead_momento: data.momento,
        lead_score: scoring.score,
        lead_score_version: scoring.version,
        ...(state.calcScenario || {})
      }, true);

      if (scoring.score >= scoring.threshold) {
        // Sinal de pré-qualificação do front. O qualify_lead DEFINITIVO
        // é disparado pelo CRM após a regra comercial (ver TRACKING.md).
        track('qualify_lead_signal', {
          form_id: 'lead-form',
          lead_score: scoring.score,
          lead_score_version: scoring.version
        }, true);
      }

      form.hidden = true;
      const success = $('#form-success');
      success.hidden = false;
      const wa = $('#whatsapp-btn');
      if (ONNAFIT_CONFIG.whatsappNumber) {
        wa.href = 'https://wa.me/' + ONNAFIT_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(ONNAFIT_CONFIG.whatsappMessage);
        wa.hidden = false;
      }
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      // Sem PII no console — registra apenas o tipo de falha.
      console.warn('[onnafit] falha no envio do formulário:', err && err.message);
      showFail();
    } finally {
      setSubmitting(false);
    }
  });

  showStep(0);
})();

/* ------------------------------------------------------------
   STICKY CTA (mobile)
   ------------------------------------------------------------ */
(function initStickyCta() {
  const sticky = $('#sticky-cta');
  const hero = $('#hero');
  const formSection = $('#formulario');
  if (!sticky || !hero || !formSection) return;
  sticky.hidden = false;

  let pastHero = false, onForm = false;
  const update = () => sticky.classList.toggle('visible', pastHero && !onForm);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }, { threshold: 0 }).observe(hero);
  new IntersectionObserver(([e]) => { onForm = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(formSection);
})();

/* ------------------------------------------------------------
   ANIMAÇÃO DISCRETA — reveal on scroll
   ------------------------------------------------------------ */
(function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.card, .step, .engine, .impl, .feature, .dimension, .journey, .result');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  targets.forEach((t) => { t.classList.add('reveal'); io.observe(t); });
})();
