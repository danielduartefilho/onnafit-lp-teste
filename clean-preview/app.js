(() => {
  const sessionCount = 10;
  const $ = (id) => document.getElementById(id);
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

  const brl = (value) => value.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0
  });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

  function render() {
    const price = clamp(priceInput.value, 120, 250);
    const programs = clamp(programInput.value, 1, 30);
    const installment = clamp(installmentInput.value, 500, 20000);
    const revenuePerProgram = price * sessionCount;
    const sessions = programs * sessionCount;
    const revenue = revenuePerProgram * programs;
    const eq = Math.max(1, Math.ceil(installment / revenuePerProgram));

    priceInput.value = price;
    priceRange.value = price;
    programInput.value = programs;
    programRange.value = programs;
    installmentInput.value = installment;

    priceLabel.textContent = brl(price);
    programLabel.textContent = programs;
    monthlyRevenue.textContent = brl(revenue);
    scenarioText.textContent = `${programs} ${programs === 1 ? 'programa' : 'programas'} · ${sessions} sessões/mês · ${brl(revenuePerProgram)}/programa`;
    equivalentPrograms.textContent = `≈ ${eq} ${eq === 1 ? 'programa/mês' : 'programas/mês'}`;
  }

  function bindPair(range, input) {
    range.addEventListener('input', () => { input.value = range.value; render(); });
    input.addEventListener('input', render);
    input.addEventListener('blur', render);
  }

  bindPair(priceRange, priceInput);
  bindPair(programRange, programInput);
  installmentInput.addEventListener('input', render);
  installmentInput.addEventListener('blur', render);
  render();

  const institutionalVideo = $('institutionalVideo');
  const institutionalFallback = $('institutionalFallback');
  if (institutionalVideo && institutionalFallback) {
    const swapInstitutional = () => {
      institutionalVideo.hidden = true;
      institutionalFallback.hidden = false;
    };
    institutionalVideo.addEventListener('error', swapInstitutional, { once: true });
    setTimeout(() => {
      if (institutionalVideo.readyState === 0) swapInstitutional();
    }, 4000);
  }

  const proofTrack = $('proofTrack');
  const proofFallback = $('proofFallback');
  if (proofTrack) {
    const cards = [...proofTrack.querySelectorAll('.proof-card')];
    let unavailable = 0;
    cards.forEach((card) => {
      const video = card.querySelector('video');
      if (!video) return;
      const fallbackUrl = card.dataset.fallback;
      const replaceCard = () => {
        if (fallbackUrl) {
          const iframe = document.createElement('iframe');
          iframe.src = fallbackUrl;
          iframe.title = 'Conteúdo oficial Onnafit';
          iframe.loading = 'lazy';
          iframe.allow = 'autoplay; fullscreen; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.className = 'proof-iframe';
          card.replaceChildren(iframe);
        } else {
          card.hidden = true;
          unavailable += 1;
          if (unavailable === cards.length && proofFallback) proofFallback.hidden = false;
        }
      };
      video.addEventListener('error', replaceCard, { once: true });
      setTimeout(() => {
        if (!card.hidden && card.querySelector('video') === video && video.readyState === 0) replaceCard();
      }, 4500);
    });
  }

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'conversion.css';
  document.head.appendChild(css);

  const main = document.querySelector('main');
  if (main) {
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
            <article class="fit-card"><b>Operações multiunidade</b><p>Que valorizam padronização e possibilidade de replicação.</p></article>
            <article class="fit-card fit-note"><b>Não é renda passiva.</b><p>O equipamento não substitui aquisição de clientes, posicionamento ou execução comercial. O melhor cenário é ampliar um ecossistema que já existe.</p></article>
          </div>
        </div>
      </section>

      <section class="section implementation" id="implementacao">
        <div class="wrap implementation-head">
          <div><p class="eyebrow">Entrada em operação</p><h2>Você não recebe apenas um equipamento.</h2></div>
          <p>A implantação precisa ser simples o suficiente para não criar uma nova operação dentro da sua operação.</p>
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
            <details class="faq-item"><summary>Preciso de uma grande estrutura física?</summary><p>Onnafit é compacto, portátil e wireless. A implementação tende a exigir menos espaço físico do que equipamentos de grande porte.</p></details>
            <details class="faq-item"><summary>Posso estruturar a oferta em programas de sessões?</summary><p>Sim. A lógica comercial apresentada nesta página utiliza programas de 10 sessões apenas como cenário ilustrativo; a estrutura final depende da estratégia e das condições comerciais vigentes.</p></details>
            <details class="faq-item"><summary>Quanto custa?</summary><p>Existem diferentes configurações e condições comerciais. Nesta simulação utilizamos R$ 2.700 por mês como referência, sujeita à homologação e à proposta comercial vigente.</p></details>
            <details class="faq-item"><summary>Quem pode aplicar o Onnafit?</summary><p>O uso deve respeitar habilitação profissional, legislação aplicável, instruções de uso e requisitos do produto. A comunicação final será ajustada à documentação regulatória brasileira homologada.</p></details>
          </div>
        </div>
      </section>

      <section class="final-strip"><div class="wrap"><h2>Você já tem os clientes. Agora avalie se Onnafit faz sentido dentro da sua operação.</h2><a href="#lead-form-section" class="btn">Quero avaliar o Onnafit</a></div></section>

      <section class="section lead-section" id="lead-form-section">
        <div class="wrap lead-layout">
          <div class="lead-copy">
            <p class="eyebrow">Próximo passo</p>
            <h2>Vamos olhar o seu cenário.</h2>
            <p>Conte um pouco sobre sua operação. A ideia é chegar à conversa comercial com contexto suficiente para discutir configuração, condições e aderência ao seu negócio.</p>
            <div class="lead-reassurance"><span>Sem promessa de rentabilidade</span><span>Conversa orientada ao seu cenário</span><span>Condições comerciais apresentadas pela equipe</span></div>
          </div>
          <form class="lead-form" id="leadForm" novalidate>
            <div class="form-progress" aria-hidden="true"><span class="active"></span><span></span><span></span></div>
            <fieldset class="form-step active" data-step="0">
              <legend>Seus dados</legend>
              <div class="fields-2"><div class="field"><label for="leadName">Nome</label><input id="leadName" name="nome" autocomplete="name" required></div><div class="field"><label for="leadWhatsapp">WhatsApp</label><input id="leadWhatsapp" name="whatsapp" type="tel" autocomplete="tel" required></div></div>
              <div class="fields-2"><div class="field"><label for="leadEmail">E-mail</label><input id="leadEmail" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="leadCity">Cidade / UF</label><input id="leadCity" name="cidade" autocomplete="address-level2" required></div></div>
            </fieldset>
            <fieldset class="form-step" data-step="1">
              <legend>Sua operação</legend>
              <span class="choice-label">Qual descreve melhor seu negócio?</span>
              <div class="choice-grid"><label class="choice"><input type="radio" name="operacao" value="Clínica de estética" required>Clínica de estética</label><label class="choice"><input type="radio" name="operacao" value="Medspa / espaço premium">Medspa / espaço premium</label><label class="choice"><input type="radio" name="operacao" value="Profissional independente">Profissional independente</label><label class="choice"><input type="radio" name="operacao" value="Outro">Outro</label></div>
              <span class="choice-label">Você já possui carteira ativa de clientes?</span>
              <div class="choice-grid"><label class="choice"><input type="radio" name="carteira" value="Sim" required>Sim</label><label class="choice"><input type="radio" name="carteira" value="Estou construindo">Estou construindo</label><label class="choice"><input type="radio" name="carteira" value="Ainda não">Ainda não</label></div>
            </fieldset>
            <fieldset class="form-step" data-step="2">
              <legend>Seu momento</legend>
              <span class="choice-label">Quando pretende avaliar uma nova tecnologia?</span>
              <div class="choice-grid"><label class="choice"><input type="radio" name="momento" value="Agora / curto prazo" required>Agora / curto prazo</label><label class="choice"><input type="radio" name="momento" value="Próximos 3 meses">Próximos 3 meses</label><label class="choice"><input type="radio" name="momento" value="Estou pesquisando">Estou pesquisando</label></div>
              <div class="preview-submit-note">Esta é uma página de teste. O envio ao CRM ainda não está habilitado; seus dados não serão enviados nesta preview.</div>
            </fieldset>
            <div class="form-nav"><button type="button" class="btn btn-muted" id="formPrev" hidden>Voltar</button><button type="button" class="btn btn-gold" id="formNext">Continuar</button><button type="submit" class="btn btn-gold" id="formSubmit" hidden>Quero conversar</button></div>
            <p class="form-note">Na versão de produção, o formulário será conectado ao endpoint/CRM homologado e à política de privacidade vigente.</p>
          </form>
        </div>
      </section>
    `);
  }

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
      const required = [...steps[current].querySelectorAll('[required]')];
      const radioNames = new Set(required.filter(el => el.type === 'radio').map(el => el.name));
      for (const el of required.filter(el => el.type !== 'radio')) {
        if (!el.checkValidity()) { el.reportValidity(); return false; }
      }
      for (const name of radioNames) {
        if (!form.querySelector(`input[name="${name}"]:checked`)) return false;
      }
      return true;
    };

    next.addEventListener('click', () => { if (validStep()) { current += 1; showStep(); } });
    prev.addEventListener('click', () => { current -= 1; showStep(); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validStep()) return;
      const note = form.querySelector('.preview-submit-note');
      note.textContent = 'Preview concluída. O formulário está validando corretamente, mas o envio permanece desativado até a integração com o CRM.';
      note.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    showStep();
  }
})();