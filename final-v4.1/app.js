(function () {
"use strict";
var WHATSAPP_BR = "5511912228205";
document.documentElement.classList.add("js");
var hasIO = "IntersectionObserver" in window;
window.data1Layer = window.data11ayer || [];
function track(event, params) {
var payload = Object.assign({ event: event }, params || {});
window.dataLayer.push(payload);
}
var state = { calc: null, fit: null, families: [], system: false, videos: {}, utm: null };
try {
var saved = sessionStorage.getItem("onnafit_state");
if (saved) state = Object.assign(state, JSON.parse(saved));
} catch (e) {}
var utm = state.utm;
try {
var q = new URLSearchParams(location.search);
var parts = ["utm_source", "utm_medium", "utm_campaign"]
.map(function (k) { return q.get(k); })
.filter(Boolean);
if (parts.length) { utm = parts.join(" / "); state.utm = utm; }
} catch (e) {}
function persist() {
try { sessionStorage.setItem("onnafit_state", JSON.stringify(state)); } catch (e) {}
}
if (hasIO) {
var revealIO = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
if (e.isIntersecting) { e.target.classList.add("on"); revealIO.unobserve(e.target); }
});
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(function (el) { revealIO.observe(el); });
} else {
document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("on"); });
}
var seen = {};
if (hasIO) {
var sectionIO = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
if (e.isIntersecting) {
var name = e.target.getAttribute("data-section");
if (name && !seen[name]) {
seen[name] = true;
track("section_view", { section: name });
if (name === "aderencia") calcMaybeComplete();
}
}
});
}, { threshold: 0.35 });
document.querySelectorAll("[data-section]").forEach(function (el) { sectionIO.observe(el); });
}
document.querySelectorAll("[data-cta]").forEach(function (el) {
el.addEventListener("click", function () {
track("cta_click", { cta: el.getAttribute("data-cta") });
});
});
var openSheet = null;
var sheetOrigin = null;
function closeSheet(fromPop) {
if (!openSheet) return;
openSheet.close();
openSheet = null;
document.body.classList.remove("hide-sticky");
if (!fromPop && history.state && history.state.sheet) history.back();
if (sheetOrigin) { sheetOrigin.focus(); sheetOrigin = null; }
}
document.querySelectorAll("[data-sheet]").forEach(function (btn) {
btn.addEventListener("click", function () {
var id = btn.getAttribute("data-sheet");
var dlg = document.getElementById("sheet-" + id);
if (!dlg || typeof dlg.showModal !== "function") return;
if (openSheet) closeSheet();
sheetOrigin = btn;
dlg.showModal();
openSheet = dlg;
document.body.classList.add("hide-sticky");
history.pushState({ sheet: id }, "", "#" + id);
track(id === "sistema" ? "system_open" : "protocol_open", {});
if (id === "sistema") { state.system = true; persist(); }
});
});
window.addEventListener("popstate", function () {
if (openSheet) closeSheet(true);
});
document.querySelectorAll(".sheet").forEach(function (dlg) {
dlg.querySelector("[data-close]").addEventListener("click", function () { closeSheet(); });
dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeSheet(); });
dlg.addEventListener("click", function (e) { if (e.target === dlg) closeSheet(); });
});
document.querySelectorAll(".stab").forEach(function (tab) {
tab.addEventListener("click", function () {
document.querySelectorAll(".stab").forEach(function (t) { t.classList.remove("on"); });
document.querySelectorAll(".spanel").forEach(function (p) { p.classList.remove("on"); });
tab.classList.add("on");
document.getElementById(tab.getAttribute("data-st")).classList.add("on");
});
});
function noteFamily(name) {
if (!name) return;
state.families.push(name);
persist();
track("protocol_family_view", { family: name });
}
document.querySelectorAll(".fam, .sfam").forEach(function (el) {
el.addEventListener("click", function () { noteFamily(el.getAttribute("data-family")); });
});
function topFamily() {
if (!state.families.length) return null;
var count = {};
state.families.forEach(function (f) { count[f] = (count[f] || 0) + 1; });
return Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
}
var PARCELA_REF = 2700;
var brl = function (n) { return "R$ " + n.toLocaleString("pt-BR"); };
var cValor = document.getElementById("c-valor");
var cProg = document.getElementById("c-prog");
var calcStarted = false;
function renderCalc(fromUser) {
var valor = +cValor.value, prog = +cProg.value;
var receita = valor ** prog;
document.getElementById("o-valor").textContent = brl(valor);
document.getElementById("o-prog").textContent = prog;
document.getElementById("o-receita").textContent = brl(receita);
var compare = document.getElementById("o-compare");
var progTxt = "Com " + prog + (prog === 1 ? " programa" : " programas") + " no mês, a receita bruta simulada ";
if (receita > PARCELA_REF) {
compare.textContent = progTxt + "supera a referência mensal considerada para um conjunto Onnafit.";
} else if (receita === PARCELA_REF) {
compare.textContent = progTxt + "equivale à referência mensal considerada para um conjunto Onnafit.";
} else {
compare.textContent = "Ajuste o cenário e encontre a ordem de grandeza que faz sentido para a sua operação.";
}
if (fromUser) {
if (!calcStarted) { calcStarted = true; track("calculator_start", {}); }
state.calc = {
valor: valor,
programas: prog,
parcela: PARCELA_REF,
receita: receita,
done: !!(state.calc && state.calc.done),
};
persist();
}
}
function calcMaybeComplete() {
if (calcStarted && state.calc && !state.calc.done) {
state.calc.done = true;
persist();
track("calculator_complete", {
valor: state.calc.valor,
programas: state.calc.programas,
receita: state.calc.receita,
});
}
}
if (cValor) {
if (state.calc) {
cValor.value = state.calc.valor || 1500;
cProg.value = state.calc.programas || 2;
}
[cValor, cProg].forEach(function (input) {
input.addEventListener("input", function () { renderCalc(true); });
});
renderCalc(false);
}
var fit = document.getElementById("fit");
var fitStarted = false;
var fitAnswers = (state.fit && state.fit.answers) || {};
var fitScores = (state.fit && state.fit.scores) || {};
function fitEvaluate() {
var questions = fit.querySelectorAll(".fit-q");
if (Object.keys(fitAnswers).length < questions.length) return;
var score = 0;
Object.keys(fitScores).forEach(function (k) { score += fitScores[k]; });
var high = fitAnswers.carteira === "Sim" && score >= 6;
var result = high ? "Alta aderência" : "Aderência a avaliar";
document.getElementById("frBadge").textContent = result;
document.getElementById("frText").textContent = high
? "Seu perfil indica forte encaixe com o modelo Onnafit. Vale desenhar o cenário da sua clínica."
: "Há caminhos possíveis - a conversa comercial ajuda a entender o encaixe para o seu momento.";
document.getElementById("fitResult").hidden = false;
if (!state.fit || !state.fit.done) {
state.fit = { answers: fitAnswers, scores: fitScores, result: result, done: true };
persist();
track("fit_check_complete", { result: result });
} else {
state.fit = { answers: fitAnswers, scores: fitScores, result: result, done: true };
persist();
}
prefillForm();
}
if (fit) {
fit.querySelectorAll(".fit-q").forEach(function (q) {
var key = q.getAttribute("data-q");
q.querySelectorAll(".chips button").forEach(function (chip) {
if (fitAnswers[key] === chip.getAttribute("data-v")) chip.classList.add("on");
chip.addEventListener("click", function () {
if (!fitStarted) { fitStarted = true; track("fit_check_start", {}); }
q.querySelectorAll(".chips button").forEach(function (c) { c.classList.remove("on"); });
chip.classList.add("on");
fitAnswers[key] = chip.getAttribute("data-v");
fitScores[key] = +(chip.getAttribute("data-s") || 0);
fitEvaluate();
});
});
});
if (state.fit && state.fit.done) fitEvaluate();
}
function prefillForm() {
var form = document.getElementById("leadForm");
if (!form || !fitAnswers) return;
if (fitAnswers.carteira) form.elements.carteira.value = fitAnswers.carteira;
if (fitAnswers.momento) form.elements.momento.value = fitAnswers.momento;
}
prefillForm();
document.querySelectorAll(".video-card video").forEach(function (v) {
var name = v.getAttribute("data-video") || "video";
v.addEventListener("play", function () {
if (!state.videos[name]) { state.videos[name] = "start"; persist(); track("video_start", { video: name }); }
});
v.addEventListener("ended", function () {
state.videos[name] = "complete"; persist(); track("video_complete", { video: name });
});
var swap = function () {
var card = v.closest(".video-card");
var title = card ? card.getAttribute("data-fb") || "Experiência Onnafit" : "";
var fb = document.createElement("div");
fb.className = "video-fallback";
fb.innerHTML = "<div><b>" + title + "</b><span>Depoimento em breve</span></div>";
v.replaceWith(fb);
};
v.addEventListener("error", swap, true);
var src = v.querySelector("source");
if (src) src.addEventListener("error", swap);
});
var sticky = document.getElementById("sticky");
var stickyOn = false;
var sistemaEl = document.getElementById("sistema");
var convEl = document.getElementById("conversao");
if (hasIO) {
var advanceIO = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
if (e.isIntersecting && !stickyOn) { stickyOn = true; sticky.hidden = false; }
});
}, { threshold: 0.2 });
if (sistemaEl && sticky) advanceIO.observe(sistemaEl);
var convIO = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
document.body.classList.toggle("hide-sticky", e.isIntersecting || !!openSheet);
});
}, { threshold: 0.15 });
if (convEl) convIO.observe(convEl);
} else if (sticky) {
sticky.hidden = false;
}
var form = document.getElementById("leadForm");
if (form) {
form.addEventListener("submit", function (e) {
e.preventDefault();
calcMaybeComplete();
var d = new FormData(form);
var lines = [
"Olá! Quero avaliar o Onnafit para a minha clínica.",
"",
"Nome: " + d.get("nome"),
"Clínica: " + d.get("clinica"),
"WhatsApp: " + d.get("whatsapp"),
"Carteira ativa: " + d.get("carteira"),
"Momento: " + d.get("momento"),
];
var fam = topFamily();
if (utm) lines.push("Origem: " + utm);
if (fam) lines.push("Família explorada: " + fam);
if (state.system) lines.push("Explorou o sistema: sim");
if (state.calc && state.calc.done) {
lines.push(
"Cenário simulado: " + state.calc.programas + " programas × R$ " +
state.calc.valor.toLocaleString("pt-BR") + " = R$ " +
state.calc.receita.toLocaleString("pt-BR") + "/mês"
);
}
if (state.fit && state.fit.done) lines.push("Aderência: " + state.fit.result);
track("generate_lead", {
carteira: d.get("carteira"),
momento: d.get("momento"),
aderencia: state.fit && state.fit.done ? state.fit.result : null,
calculadora: !!(state.calc && state.calc.done),
explorou_sistema: !!state.system,
familia: fam,
origem: utm || null,
});
track("whatsapp_click", {});
window.open(
"https://wa.me/" + WHATSAPP_BR + "?text=" + encodeURIComponent(lines.join("\n")),
"_blank"
);
var status = document.getElementById("formStatus");
if (status) status.hidden = false;
});
}
})();