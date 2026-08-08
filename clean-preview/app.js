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
    institutionalVideo.addEventListener('error', () => {
      institutionalVideo.hidden = true;
      institutionalFallback.hidden = false;
    }, { once: true });
  }

  const proofTrack = $('proofTrack');
  const proofFallback = $('proofFallback');
  if (proofTrack) {
    const cards = [...proofTrack.querySelectorAll('.proof-card')];
    let failed = 0;
    cards.forEach((card) => {
      const video = card.querySelector('video');
      if (!video) return;
      video.addEventListener('error', () => {
        card.hidden = true;
        failed += 1;
        if (failed === cards.length && proofFallback) proofFallback.hidden = false;
      }, { once: true });
    });
  }
})();