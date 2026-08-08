/* RC patch — media fallbacks + compact calculator UX */
(() => {
  'use strict';

  const FALLBACK_IMG = 'assets/hero-product.webp';

  function protectMedia() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', () => {
        if (img.src.endsWith(FALLBACK_IMG)) return;
        img.src = FALLBACK_IMG;
        img.classList.add('media-fallback');
      }, { once: true });
    });

    document.querySelectorAll('video').forEach((video) => {
      if (video.dataset.fallbackBound) return;
      video.dataset.fallbackBound = '1';
      const fail = () => {
        const card = video.closest('.proof-card');
        if (card) {
          card.hidden = true;
          const track = card.closest('.proof-track');
          if (track && !Array.from(track.children).some((el) => !el.hidden)) {
            const section = track.closest('.proof-section');
            if (section) section.hidden = true;
          }
        } else {
          const block = video.closest('.video-section, .video-block, .video-frame-native');
          if (block) block.classList.add('media-unavailable');
        }
      };
      video.addEventListener('error', fail);
      const source = video.querySelector('source');
      if (source) source.addEventListener('error', fail);
    });
  }

  function initCompactCalculator() {
    const calc = document.querySelector('#calc');
    const price = document.querySelector('#calc-price');
    const programs = document.querySelector('#calc-programs');
    const installment = document.querySelector('#calc-installment');
    const month = document.querySelector('#r-month');
    if (!calc || !price || !programs || !installment || !month) return;

    calc.classList.add('calc-compact');

    // Hide the duplicated explanatory/result blocks but keep their DOM/IDs alive for main.js tracking/calculation.
    const oldScenarioLabel = Array.from(calc.querySelectorAll('.calc-group-label')).find((el) => el.textContent.trim().toLowerCase() === 'seu cenário');
    if (oldScenarioLabel) oldScenarioLabel.classList.add('rc-hide');
    const oldResults = calc.querySelector('.calc-results');
    if (oldResults) oldResults.classList.add('rc-hide');
    const annualized = document.querySelector('#r-year')?.closest('.calc-hint');
    if (annualized) annualized.classList.add('rc-hide');
    const divider = calc.querySelector('.calc-divider');
    if (divider) divider.classList.add('rc-hide');
    const perspective = calc.querySelector('.calc-perspective');
    if (perspective) perspective.classList.add('rc-hide');

    const summary = document.createElement('div');
    summary.className = 'rc-economy-summary';
    summary.innerHTML = `
      <div class="rc-revenue-card">
        <span>Receita bruta mensal simulada</span>
        <strong id="rc-month">R$ 22.500</strong>
        <small id="rc-context">15 programas · 150 sessões/mês</small>
      </div>
      <div class="rc-invest-card">
        <label for="rc-installment">Parcela mensal de referência</label>
        <div class="rc-install-input"><span>R$</span><input id="rc-installment" type="number" min="500" max="20000" step="50" inputmode="numeric" value="2700"></div>
        <div class="rc-equivalence"><strong id="rc-programs">≈ 2 programas/mês</strong><span>geram receita bruta superior à parcela considerada</span></div>
      </div>`;

    const inputs = calc.querySelector('.calc-inputs');
    if (inputs) inputs.insertAdjacentElement('afterend', summary);

    const rcInstallment = summary.querySelector('#rc-installment');
    const rcMonth = summary.querySelector('#rc-month');
    const rcContext = summary.querySelector('#rc-context');
    const rcPrograms = summary.querySelector('#rc-programs');

    function refresh() {
      const p = Math.max(1, Number(price.value) || 150);
      const n = Math.max(1, Number(programs.value) || 15);
      const inst = Math.max(0, Number(installment.value) || 2700);
      const revenueProgram = p * 10;
      const revenueMonth = revenueProgram * n;
      const eqPrograms = Math.max(1, Math.ceil(inst / revenueProgram));
      rcMonth.textContent = revenueMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
      rcContext.textContent = `${n} ${n === 1 ? 'programa' : 'programas'} · ${n * 10} sessões/mês`;
      rcPrograms.textContent = `≈ ${eqPrograms} ${eqPrograms === 1 ? 'programa/mês' : 'programas/mês'}`;
      if (Number(rcInstallment.value) !== inst) rcInstallment.value = inst;
    }

    rcInstallment.addEventListener('input', () => {
      installment.value = rcInstallment.value;
      installment.dispatchEvent(new Event('input', { bubbles: true }));
      refresh();
    });

    [price, programs, installment, document.querySelector('#calc-price-range'), document.querySelector('#calc-programs-range')]
      .filter(Boolean)
      .forEach((el) => el.addEventListener('input', () => requestAnimationFrame(refresh)));

    refresh();
  }

  function compactCopy() {
    const calcIntro = document.querySelector('#calculadora > .container > .narrow-p');
    if (calcIntro) calcIntro.textContent = 'Ajuste ticket e volume mensal. Veja a receita bruta simulada e coloque a parcela de aquisição em perspectiva.';
    const postTitle = document.querySelector('.post-calc h3');
    if (postTitle) postTitle.textContent = 'Quer avaliar este cenário na sua clínica?';
    const postText = document.querySelector('.post-calc .narrow-p');
    if (postText) postText.textContent = 'Conheça configurações e condições comerciais aplicáveis à sua operação.';
  }

  document.addEventListener('DOMContentLoaded', () => {
    protectMedia();
    initCompactCalculator();
    compactCopy();
  });
})();
