document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  const language = document.documentElement.lang || "fr";
  const program = document.getElementById("program");
  const careerField = document.getElementById("careerModuleField");
  const careerModule = document.getElementById("careerModule");
  const personalField = document.getElementById("personalDevelopmentModuleField");
  const personalModule = document.getElementById("personalDevelopmentModule");

  const copy = {
    fr: {
      greeting: "Bonjour Alliance Anglophone,",
      request: "Je souhaite m’inscrire ou recevoir des informations sur vos programmes.",
      labels: ["Nom complet", "Âge", "Numéro WhatsApp", "Email", "Ville / Localisation", "Niveau actuel en anglais", "Programme souhaité", "Module de développement de carrière", "Module de développement personnel", "Cohorte ou mois de début souhaité", "Durée souhaitée", "Format souhaité", "Objectif principal", "Message complémentaire"],
      missing: "Non renseigné",
      thanks: "Merci.",
      thankYou: "merci.html"
    },
    en: {
      greeting: "Hello Alliance Anglophone,",
      request: "I would like to register or receive information about your programs.",
      labels: ["Full name", "Age", "WhatsApp number", "Email", "City / Location", "Current English level", "Program of interest", "Career development module", "Personal development module", "Preferred cohort or starting month", "Preferred duration", "Preferred format", "Main goal", "Additional message"],
      missing: "Not provided",
      thanks: "Thank you.",
      thankYou: "thank-you.html"
    },
    mg: {
      greeting: "Salama Alliance Anglophone,",
      request: "Te hisoratra anarana na hahazo fanazavana momba ny programa aho.",
      labels: ["Anarana feno", "Taona", "Laharana WhatsApp", "Email", "Tanàna / Toerana", "Haavo amin’ny teny anglisy", "Programa tiana", "Module fampandrosoana ny asa", "Module fampandrosoana manokana", "Cohorte na volana hanombohana tiana", "Faharetana tiana", "Format tiana", "Tanjona lehibe", "Hafatra fanampiny"],
      missing: "Tsy voalaza",
      thanks: "Misaotra.",
      thankYou: "misaotra.html"
    }
  }[language];

  function selectedCategory() {
    return program.options[program.selectedIndex]?.dataset.category || "";
  }

  function updateConditionalFields() {
    const category = selectedCategory();
    const careerVisible = category === "career";
    const personalVisible = category === "personal";
    careerField.hidden = !careerVisible;
    personalField.hidden = !personalVisible;
    careerModule.required = careerVisible;
    personalModule.required = personalVisible;
    if (!careerVisible) careerModule.value = "";
    if (!personalVisible) personalModule.value = "";
  }

  const requestedProgram = new URLSearchParams(window.location.search).get("programme");
  if (requestedProgram) {
    const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const requested = normalize(requestedProgram);
    const option = Array.from(program.options).find((candidate) => {
      const label = normalize(candidate.value || candidate.textContent);
      return label === requested || label.includes(requested) || requested.includes(label);
    });
    if (option) program.value = option.value;
  }

  program.addEventListener("change", updateConditionalFields);
  updateConditionalFields();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = [
      document.getElementById("fullName").value.trim(),
      document.getElementById("age").value.trim(),
      document.getElementById("whatsapp").value.trim(),
      document.getElementById("email").value.trim(),
      document.getElementById("city").value.trim(),
      document.getElementById("level").value,
      program.value,
      careerModule.value,
      personalModule.value,
      document.getElementById("cohort").value,
      document.getElementById("duration").value,
      document.getElementById("format").value,
      document.getElementById("goal").value,
      document.getElementById("message").value.trim()
    ];

    const details = copy.labels.map((label, index) => `${label}: ${values[index] || copy.missing}`).join("\n");
    const message = `${copy.greeting}\n\n${copy.request}\n\n${details}\n\n${copy.thanks}`;
    const whatsappUrl = `https://wa.me/261349201200?text=${encodeURIComponent(message)}`;
    const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (opened) window.location.assign(copy.thankYou);
    else window.location.assign(whatsappUrl);
  });
});
