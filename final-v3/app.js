document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("on");
    });
    document.querySelectorAll(".panel").forEach(function (p) {
      p.classList.remove("on");
    });
    tab.classList.add("on");
    document.getElementById("p-" + tab.dataset.t).classList.add("on");
  });
});
const io = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach(function (el) {
  io.observe(el);
});
const WHATSAPP_BR = "5511912228205";
window.dataLayer = window.dataLayer || [];
const track = (event, data = {}) => window.dataLayer.push({ event, ...data });
const form = document.getElementById("leadForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const d = new FormData(form);
    track("generate_lead", { carteira: d.get("carteira"), momento: d.get("momento") });
    const msg =
      "Olá! Quero avaliar o Onnafit para a minha clínica.\n\n" +
      "Nome: " + d.get("nome") + "\n" +
      "Clínica: " + d.get("clinica") + "\n" +
      "WhatsApp: " + d.get("whatsapp") + "\n" +
      "Carteira ativa: " + d.get("carteira") + "\n" +
      "Momento: " + d.get("momento") + "\n" +
      "Origem: " + window.location.href;
    track("whatsapp_click", { source: "lead_form" });
    window.open(
      "https://wa.me/" + WHATSAPP_BR + "?text=" + encodeURIComponent(msg),
      "_blank",
    );
    const status = document.getElementById("formStatus");
    if (status) status.hidden = false;
    document.body.classList.add("at-form");
    setTimeout(() => document.body.classList.remove("at-form"), 2200);
  });
}
// Prova social: se um vídeo não estiver disponível, exibe card visual elegante
document.querySelectorAll(".video-card video").forEach(function (v) {
  const swap = function () {
    const card = v.closest(".video-card");
    const title = card ? card.dataset.fb || "Experiência Onnafit" : "";
    const fb = document.createElement("div");
    fb.className = "video-fallback";
    fb.innerHTML = "<div><b>" + title + "</b><span>Depoimento em breve</span></div>";
    v.replaceWith(fb);
  };
  v.addEventListener("error", swap, true);
  const src = v.querySelector("source");
  if (src) src.addEventListener("error", swap);
});
document.querySelectorAll('a[href="#conversao"], a[href="#tecnologia"]').forEach(function (a) {
  a.addEventListener("click", function () {
    track("cta_click", { href: a.getAttribute("href"), label: a.textContent.trim() });
  });
});
const hero = document.querySelector(".hero");
const updateSticky = function () {
  if (!hero) return;
  const shouldShow = window.innerWidth <= 560 && window.scrollY > hero.offsetHeight * 0.75;
  document.body.classList.toggle("show-sticky", shouldShow);
};
window.addEventListener("scroll", updateSticky, { passive: true });
window.addEventListener("resize", updateSticky);
updateSticky();
const conv = document.getElementById("conversao");
if (conv && "IntersectionObserver" in window) {
  new IntersectionObserver(function ([entry]) {
    document.body.classList.toggle("at-form", entry.isIntersecting);
  }, { threshold: 0.05 }).observe(conv);
}
