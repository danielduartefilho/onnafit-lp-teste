(() => {
  'use strict';

  const WHATSAPP_NUMBER = '5511912228205';
  const SESSION_COUNT = 10;
  const $ = (id) => document.getElementById(id);
  window.dataLayer = window.dataLayer || [];
  const track = (event, data = {}) => window.dataLayer.push({ event, ...data });

  // ---------- Attribution ----------
  const attributionKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
  const params = new URLSearchParams(location.search);
  const currentTouch = {};
  attributionKeys.forEach(k => { if (params.get(k)) currentTouch[k] = params.get(k); });
  const hasCampaignTouch = Object.keys(currentTouch).length > 0;
  const now = Date.now();
  const ttl = 90 * 24 * 60 * 60 * 1000;
  const readStored = (key) => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || 'null');
      if (!v || !v.ts || now - v.ts > ttl) { localStorage.removeItem(key); return null; }
      return v;
    } catch { return null; }
  };
  if (hasCampaignTouch) {
    if (!readStored('onnafit_first_campaign_touch')) localStorage.setItem('onnafit_first_campaign_touch', JSON.stringify({ ts: now, ...currentTouch }));
    localStorage.setItem('onnafit_last_campaign_touch', JSON.stringify({ ts: now, ...currentTouch }));
  }

  // ---------- Calculator ----------
  const priceRange = $('priceRange');
  const priceInput = $('priceInput');
  const programRange = $('programRange');
  const programInput = $('programInput');
  const installmentInput = $('installmentInput');
  const priceLabel = $('priceLabel');
  const programLabel = $('programLabel');
  const monthlyRevenue = $('monthlyRevenue');
  const scenarioText = $('scenarioText');
  const equivalentPrograms = $('equivalentPrograms');
  let calculatorStarted = false;
  let scenarioTimer;
  let lastScenario = '';

  const brl = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));
  const getScenario = () => {
    const price = clamp(priceInput?.value || 150, 120, 250);
    const programs = clamp(programInput?.value || 15, 1, 30);
    const installment = clamp(installmentInput?.value || 2700, 500, 20000);
    const revenuePerProgram = price * SESSION_COUNT;
    const sessions = programs * SESSION_COUNT;
    const revenue = revenuePerProgram * programs;
    const equivalent = Math.max(1, Math.ceil(installment / revenuePerProgram));
    return { price, programs, installment, revenuePerProgram, sessions, revenue, equivalent };
  };
  const emitScenario = () => {
    const s = getScenario();
    const key = [s.price,s.programs,s.installment].join('|');
    if (key === lastScenario) return;
    lastScenario = key;
    track('calculator_scenario', {
      calc_session_price: s.price,
      calc_sessions_per_program: SESSION_COUNT,
      calc_programs_per_month: s.programs,
      calc_monthly_revenue: s.revenue,
      calc_installment: s.installment,
      calc_equivalent_programs: s.equivalent
    });
  };
  const renderCalculator = (isInteraction = false) => {
    if (!priceInput || !programInput || !installmentInput) return;
    const s = getScenario();
    priceInput.value = s.price; priceRange.value = s.price;
    programInput.value = s.programs; programRange.value = s.programs;
    installmentInput.value = s.installment;
    priceLabel.textContent = brl(s.price);
    programLabel.textContent = s.programs;
    monthlyRevenue.textContent = brl(s.revenue);
    scenarioText.textContent = `${s.programs} ${s.programs === 1 ? 'programa' : 'programas'} · ${s.sessions} sessões/mês · ${brl(s.revenuePerProgram)}/programa`;
    equivalentPrograms.textContent = `≈ ${s.equivalent} ${s.equivalent === 1 ? 'programa/mês' : 'programas/mês'}`;
    if (isInteraction) {
      if (!calculatorStarted) { calculatorStarted = true; track('calculator_start'); }
      clearTimeout(scenarioTimer);
      scenarioTimer = setTimeout(emitScenario, 700);
    }
  };
  const bindPair = (range, input) => {
    if (!range || !input) return;
    range.addEventListener('input', () => { input.value = range.value; renderCalculator(true); });
    input.addEventListener('input', () => renderCalculator(true));
    input.addEventListener('blur', () => renderCalculator(false));
  };
  bindPair(priceRange, priceInput);
  bindPair(programRange, programInput);
  if (installmentInput) {
    installmentInput.addEventListener('input', () => renderCalculator(true));
    installmentInput.addEventListener('blur', () => renderCalculator(false));
  }
  renderCalculator(false);

  // ---------- Media reliability ----------
  const institutionalVideo = $('institutionalVideo');
  const institutionalFallback = $('institutionalFallback');
  if (institutionalVideo && institutionalFallback) {
    institutionalVideo.addEventListener('error', () => {
      institutionalVideo.hidden = true;
      institutionalFallback.hidden = false;
    }, { once: true });
  }
  const proofTrack = $('proofTrack');
  const proofFallback = $('proofFallback');
  if (proofTrack) {
    const cards = [...proofTrack.querySelectorAll('.proof-card')];
    const updateProofState = () => {
      const visible = cards.filter(c => !c.hidden).length;
      if (proofFallback) proofFallback.hidden = visible > 0;
    };
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;
      video.addEventListener('error', () => { card.hidden = true; updateProofState(); }, { once: true });
    });
  }
  const proofIntro = document.querySelector('.proof-heading > p');
  if (proofIntro) proofIntro.textContent = 'Depoimentos em português de profissionais que já conheceram a aplicação Onnafit.';

  // ---------- Conversion styles ----------
  if (![...document.styleSheets].some(s => (s.href || '').includes('conversion.css'))) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'conversion.css'; document.head.appendChild(css);
  }

  // ---------- Second half ----------
  const main = document.querySelector('main');
  if (main && !$('lead-form-section')) {
    main.insertAdjacentHTML('beforeend', `
      <section class="section fit-section" id="para-quem">
        <div class="wrap fit-layout">
          <div class="fit-copy">
            <p class="eyebrow ink">Para quem faz mais sentido</p>
            <h2>Você já construiu o ativo mais difícil: clientes.</h2>
            <p>Onnafit foi pensado para negócios que já possuem relacionamento, portfólio e uma operação capaz de transformar uma nova tecnologia em uma nova oferta.</p>
          </div>
          <div class="fit-cards">
            <article class="fit-card"><b>Clínicas de estética</b><p>Com carteira ativa e procedimentos corporais já consolidados.</p></article>
            <article class="fit-card"><b>Medspas e espaços premium</b><p>Que desejam adicionar tecnologia sem ampliar demasiadamente a estrutura física.</p></article>
            <article class="fit-card"><b>Profissionais estabelecidos</b><p>Com relacionamento recorrente e capacidade comercial.</p></article>
            <article class="fit-card"><b>Operações replicáveis</b><p>Que valorizam padronização e possibilidade de expansão.</p></article>
            <article class="fit-card fit-note"><b>O melhor cenário começa com uma base existente.</b><p>Onnafit não substitui aquisição de clientes, posicionamento ou execução comercial. Ele amplia um ecossistema que já funciona.</p></article>
          </div>
        </div>
      </section>

      <section class="section implementation" id="implementacao">
        <div class="wrap implementation-head">
          <div><p class="eyebrow">Entrada em operação</p><h2>Você não recebe apenas um equipamento.</h2></div>
          <p>O objetivo é integrar a tecnologia à rotina da clínica com treinamento, configuração e suporte, sem transformar a implantação em um projeto complexo.</p>
        </div>
        <div class="wrap implementation-steps">
          <article class="impl-step"><span>01</span><b>Ativação</b><p>Configuração do sistema e recursos contratados.</p></article>
          <article class="impl-step"><span>02</span><b>Capacitação</b><p>Treinamento para utilização correta da tecnologia.</p></article>
          <article class="impl-step"><span>03</span><b>Entrada em operação</b><p>Orientação para estruturar os primeiros atendimentos.</p></article>
          <article class="impl-step"><span>04</span><b>Suporte</b><p>Acompanhamento conforme a estrutura comercial vigente.</p></article>
        </div>
      </section>

      <section class="section faq-section" id="faq">
        <div class="wrap faq-layout">
          <div class="faq-intro"><p class="eyebrow ink">Antes de conversar</p><h2>Dúvidas importantes.</h2><p>O objetivo é chegar à conversa comercial entendendo o papel do Onnafit — e não apenas perguntando o preço de um equipamento.</p></div>
          <div class="faq-list">
            <details class="faq-item"><summary>O Onnafit substitui outros equipamentos estéticos?</summary><p>Não. A proposta é adicionar o estímulo muscular à jornada corporal e coexistir com outros serviços da clínica, respeitando indicação, protocolo e compatibilidade profissional.</p></details>
            <details class="faq-item"><summary>Preciso de uma grande estrutura física?</summary><p>Onnafit é compacto, portátil e wireless, o que facilita a integração à operação existente sem exigir a presença física de um equipamento de grande porte.</p></details>
            <details class="faq-item"><summary>Posso estruturar a oferta em programas de sessões?</summary><p>Sim. Nesta página usamos um programa de 10 sessões apenas como referência econômica. A oferta final deve ser definida de acordo com estratégia, protocolos aplicáveis e condições comerciais.</p></details>
            <details class="faq-item"><summary>Quanto custa?</summary><p>A condição final depende da configuração e da proposta comercial. A calculadora utiliza R$ 2.700/mês como referência para colocar a ordem de grandeza do compromisso mensal em perspectiva.</p></details>
            <details class="faq-item"><summary>Quem pode aplicar e quais documentos devo avaliar?</summary><p>A aplicação deve respeitar habilitação profissional, legislação, instruções de uso e documentação regulatória correspondente ao produto comercializado no Brasil. A equipe comercial apresenta a documentação aplicável à configuração oferecida.</p></details>
          </div>
        </div>
      </section>

      <section class="final-strip"><div class="wrap"><h2>Você já tem os clientes. Agora avalie se Onnafit faz sentido dentro da sua operação.</h2><a href="#lead-form-section" class="btn" data-cta="final_strip">Quero avaliar o Onnafit</a></div></section>

      <section class="section lead-section" id="lead-form-section">
        <div class="wrap lead-layout">
          <div class="lead-copy">
            <p class="eyebrow">Próximo passo</p>
            <h2>Vamos olhar o seu cenário.</h2>
            <p>Conte um pouco sobre sua operação. Ao concluir, abriremos o canal oficial de atendimento com seu contexto e o cenário que você simulou.</p>
            <div class="lead-reassurance"><span>Conversa direcionada ao seu negócio</span><span>Cenário da calculadora segue junto</span><span>Atendimento pelo WhatsApp oficial</span></div>
          </div>
          <form class="lead-form" id="leadForm" novalidate>
            <div class="form-progress" aria-hidden="true"><span class="active"></span><span></span></div>
            <fieldset class="form-step active" data-step="0">
              <legend>Seus dados</legend>
              <div class="fields-2"><div class="field"><label for="leadName">Nome</label><input id="leadName" name="nome" autocomplete="name" required></div><div class="field"><label for="leadWhatsapp">WhatsApp</label><input id="leadWhatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999" required></div></div>
              <div class="fields-2"><div class="field"><label for="leadEmail">E-mail <small>(opcional)</small></label><input id="leadEmail" name="email" type="email" autocomplete="email"></div><div class="field"><label for="leadCity">Cidade / UF</label><input id="leadCity" name="cidade" autocomplete="address-level2" required></div></div>
            </fieldset>
            <fieldset class="form-step" data-step="1">
              <legend>Sua operação</legend>
              <span class="choice-label">Qual descreve melhor seu negócio?</span>
              <div class="choice-grid"><label class="choice"><input type="radio" name="operacao" value="Clínica de estética" required>Clínica de estética</label><label class="choice"><input type="radio" name="operacao" value="Medspa / espaço premium">Medspa / espaço premium</label><label class="choice"><input type="radio" name="operacao" value="Profissional independente">Profissional independente</label><label class="choice"><input type="radio" name="operacao" value="Outro">Outro</label></div>
              <span class="choice-label">Você já possui carteira ativa de clientes?</span>
              <div class="choice-grid"><label class="choice"><input type="radio" name="carteira" value="Sim" required>Sim</label><label class="choice"><input type="radio" name="carteira" value="Estou construindo">Estou construindo</label><label class="choice"><input type="radio" name="carteira" value="Ainda não">Ainda não</label></div>
              <span class="choice-label">Quando pretende avaliar a implementação?</span>
              <div class="choice-grid"><label class="choice"><input type="radio" name="momento" value="Agora / curto prazo" required>Agora / curto prazo</label><label class="choice"><input type="radio" name="momento" value="Próximos 3 meses">Próximos 3 meses</label><label class="choice"><input type="radio" name="momento" value="Estou pesquisando">Estou pesquisando</label></div>
              <label class="choice consent"><input type="checkbox" name="consentimento" required>Autorizo o contato comercial da equipe Onnafit/WiemsPro sobre esta solicitação.</label>
            </fieldset>
            <div class="form-nav"><button type="button" class="btn btn-muted" id="formPrev" hidden>Voltar</button><button type="button" class="btn btn-gold" id="formNext">Continuar</button><button type="submit" class="btn btn-gold" id="formSubmit" hidden>Falar com a equipe Onnafit →</button></div>
            <p class="form-note">Os dados preenchidos serão usados para iniciar o atendimento comercial solicitado por você.</p>
            <div id="leadSuccess" class="preview-submit-note" hidden><strong>Dados conferidos.</strong> Estamos abrindo o WhatsApp oficial para continuar a conversa.</div>
          </form>
        </div>
      </section>
    `);
  }

  // All commercial CTAs point to final conversion now.
  document.querySelectorAll('a[href="#contato"], a[data-cta="header"], a[data-cta="hero_primary"]').forEach(a => a.setAttribute('href', '#lead-form-section'));

  // ---------- Form ----------
  const form = $('leadForm');
  if (form) {
    const steps = [...form.querySelectorAll('.form-step')];
    const bars = [...form.querySelectorAll('.form-progress span')];
    const prev = $('formPrev');
    const next = $('formNext');
    const submit = $('formSubmit');
    let current = 0;
    const showStep = () => {
      steps.forEach((step, i) => step.classList.toggle('active', i === current));
      bars.forEach((bar, i) => bar.classList.toggle('active', i <= current));
      prev.hidden = current === 0;
      next.hidden = current === steps.length - 1;
      submit.hidden = current !== steps.length - 1;
    };
    const validStep = () => {
      const els = [...steps[current].querySelectorAll('[required]')];
      const radioNames = [...new Set(els.filter(e => e.type === 'radio').map(e => e.name))];
      for (const el of els.filter(e => e.type !== 'radio')) {
        if (!el.checkValidity()) { el.reportValidity(); return false; }
      }
      for (const name of radioNames) {
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
          const first = form.querySelector(`input[name="${name}"]`); if (first) first.focus(); return false;
        }
      }
      return true;
    };
    next.addEventListener('click', () => { if (validStep()) { current++; showStep(); track('lead_form_step', { step: current + 1 }); } });
    prev.addEventListener('click', () => { current = Math.max(0,current-1); showStep(); });
    const whatsappInput = $('leadWhatsapp');
    if (whatsappInput) whatsappInput.addEventListener('input', () => {
      let v = whatsappInput.value.replace(/\D/g,'').slice(0,11);
      if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      whatsappInput.value = v;
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validStep()) return;
      const fd = new FormData(form);
      const s = getScenario();
      const firstTouch = readStored('onnafit_first_campaign_touch');
      const lastTouch = readStored('onnafit_last_campaign_touch');
      track('generate_lead', {
        lead_operation: fd.get('operacao'),
        lead_active_client_base: fd.get('carteira'),
        lead_timing: fd.get('momento'),
        calc_session_price: s.price,
        calc_programs_per_month: s.programs,
        calc_monthly_revenue: s.revenue,
        calc_installment: s.installment,
        first_campaign_touch: firstTouch || undefined,
        last_campaign_touch: lastTouch || undefined
      });
      const msg = [
        'Olá! Quero avaliar o Onnafit para minha operação.',
        '',
        `Nome: ${fd.get('nome')}`,
        `Cidade/UF: ${fd.get('cidade')}`,
        `Negócio: ${fd.get('operacao')}`,
        `Carteira ativa: ${fd.get('carteira')}`,
        `Momento: ${fd.get('momento')}`,
        fd.get('email') ? `E-mail: ${fd.get('email')}` : '',
        '',
        'Cenário que simulei na landing page:',
        `Sessão: ${brl(s.price)}`,
        `Programas/mês: ${s.programs}`,
        `Receita bruta simulada: ${brl(s.revenue)}/mês`,
        `Parcela de referência: ${brl(s.installment)}`,
        `Equivalência aproximada: ${s.equivalent} programa(s)/mês`,
        '',
        `Origem: ${location.href}`
      ].filter(Boolean).join('\n');
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      const success = $('leadSuccess'); if (success) success.hidden = false;
      track('whatsapp_click', { source: 'lead_form', whatsapp_number: WHATSAPP_NUMBER });
      const win = window.open(url, '_blank', 'noopener');
      if (!win) location.href = url;
    });
    showStep();
  }

  // ---------- CTA tracking ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-cta]');
    if (a) track('cta_click', { cta_id: a.dataset.cta, href: a.getAttribute('href') });
  });

  // ---------- Mobile sticky CTA ----------
  const sticky = document.createElement('div');
  sticky.className = 'final-sticky';
  sticky.innerHTML = '<a href="#lead-form-section" class="btn btn-gold" data-cta="sticky_mobile">Quero avaliar o Onnafit</a>';
  document.body.appendChild(sticky);
  const updateSticky = () => sticky.classList.toggle('show', innerWidth <= 760 && scrollY > 700);
  addEventListener('scroll', updateSticky, { passive: true }); addEventListener('resize', updateSticky); updateSticky();
  const formSection = $('lead-form-section');
  if (formSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => sticky.classList.toggle('at-form', entry.isIntersecting), { threshold: .05 }).observe(formSection);
  }
})();