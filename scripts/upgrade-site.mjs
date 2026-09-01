import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const languageDirs = ["fr", "en", "mg"];
const htmlFiles = languageDirs.flatMap((dir) =>
  readdirSync(join(root, dir))
    .filter((file) => file.endsWith(".html"))
    .map((file) => `${dir}/${file}`)
);

const equivalents = {
  "index": { fr: "index.html", en: "index.html", mg: "index.html" },
  "programs": { fr: "programmes.html", en: "programs.html", mg: "programa.html" },
  "pricing": { fr: "tarifs.html", en: "pricing.html", mg: "saram-piofanana.html" },
  "mission": { fr: "mission.html", en: "mission.html", mg: "iraka.html" },
  "impact": { fr: "impact.html", en: "impact.html", mg: "fiantraikany.html" },
  "volunteer": { fr: "benevolat.html", en: "volunteer.html", mg: "asa-an-tsitrapo.html" },
  "registration": { fr: "inscription.html", en: "registration.html", mg: "fisoratana.html" },
  "contact": { fr: "contact.html", en: "contact.html", mg: "fifandraisana.html" },
  "thank-you": { fr: "merci.html", en: "thank-you.html", mg: "misaotra.html" },
  "privacy": { fr: "confidentialite.html", en: "privacy.html", mg: "tsiambaratelo.html" },
  "terms": { fr: "conditions.html", en: "terms.html", mg: "fepetra.html" }
};

const fileToPage = new Map();
for (const [page, versions] of Object.entries(equivalents)) {
  for (const [language, file] of Object.entries(versions)) {
    fileToPage.set(`${language}/${file}`, page);
  }
}

const heroForPage = {
  index: "hero-home-v2.webp",
  programs: "hero-programs-v1.webp",
  pricing: "hero-options-v1.webp",
  mission: "hero-mission-v1.webp",
  impact: "hero-impact-v1.webp",
  volunteer: "hero-volunteer-v1.webp",
  registration: "hero-registration-v1.webp",
  contact: "hero-contact-v1.webp",
  "thank-you": "hero-thankyou-v1.webp",
  privacy: "hero-contact-v1.webp",
  terms: "hero-contact-v1.webp"
};

const socialForPage = {
  index: "social-preview-home-v2.jpg",
  programs: "social-preview-programs-v1.jpg",
  pricing: "social-preview-options-v1.jpg",
  mission: "social-preview-mission-v1.jpg",
  impact: "social-preview-impact-v1.jpg",
  volunteer: "social-preview-volunteer-v1.jpg",
  registration: "social-preview-registration-v1.jpg",
  contact: "social-preview-contact-v1.jpg",
  "thank-you": "social-preview-thankyou-v1.jpg",
  privacy: "social-preview-contact-v1.jpg",
  terms: "social-preview-contact-v1.jpg"
};

const scheduleFooter = {
  fr: "Demandes jusqu’au 3 septembre — essai gratuit du 7 au 12 septembre 2026.",
  en: "Requests through 3 September — free trial from 7 to 12 September 2026.",
  mg: "Fangatahana hatramin’ny 3 Septambra — essai maimaim-poana ny 7–12 Septambra 2026."
};

const footerLabels = {
  fr: { privacy: "Confidentialité", terms: "Paiement et conditions", contact: "Contact", facebook: "Facebook — Alliance Anglophone" },
  en: { privacy: "Privacy", terms: "Payment and terms", contact: "Contact", facebook: "Facebook — Alliance Anglophone" },
  mg: { privacy: "Tsiambaratelo", terms: "Fandoavam-bola sy fepetra", contact: "Fifandraisana", facebook: "Facebook — Alliance Anglophone" }
};

const navLabels = {
  fr: { index: "Accueil", programs: "Programmes", pricing: "Tarifs", mission: "Mission", impact: "Impact", volunteer: "Bénévolat", registration: "Inscription", contact: "Contact" },
  en: { index: "Home", programs: "Programs", pricing: "Pricing", mission: "Mission", impact: "Impact", volunteer: "Volunteer", registration: "Registration", contact: "Contact" },
  mg: { index: "Fandraisana", programs: "Programa", pricing: "Saram-piofanana", mission: "Iraka", impact: "Fiantraikany", volunteer: "Asa an-tsitrapo", registration: "Fisoratana", contact: "Fifandraisana" }
};

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function getMeta(content, name) {
  const match = content.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, "i"));
  return match?.[1] || "";
}

function getTitle(content) {
  return content.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() || "Alliance Anglophone";
}

function addOrReplaceSocialMeta(content, file, page, language) {
  const title = escapeAttribute(getTitle(content));
  const description = escapeAttribute(getMeta(content, "description"));
  const canonical = `https://allianceanglophone.mg/${file}`;
  const image = `https://allianceanglophone.mg/assets/${socialForPage[page]}`;
  const locale = { fr: "fr_FR", en: "en_US", mg: "mg_MG" }[language];
  const block = `\n  <!-- Social sharing metadata -->\n  <meta property="og:title" content="${title}">\n  <meta property="og:description" content="${description}">\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="${image}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="${title}">\n  <meta property="og:site_name" content="Alliance Anglophone">\n  <meta property="og:locale" content="${locale}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="${title}">\n  <meta name="twitter:description" content="${description}">\n  <meta name="twitter:image" content="${image}">\n`;

  content = content.replace(/\s*<!-- Open Graph:[\s\S]*?<meta name="twitter:image:alt"[\s\S]*?>\s*/i, "\n");
  content = content.replace(/\s*<!-- Social sharing metadata -->[\s\S]*?<meta name="twitter:image"[^>]*>\s*/i, "\n");
  return content.replace("</head>", `${block}</head>`);
}

function addHeadAssets(content, page) {
  const hero = heroForPage[page];
  const tags = `\n  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">\n  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">\n  <link rel="preload" as="image" href="../assets/${hero}" fetchpriority="high">\n`;
  if (!content.includes("favicon-32.png")) content = content.replace("</head>", `${tags}</head>`);
  return content;
}

function addCanonicalAndAlternates(content, file, page) {
  const canonical = `https://allianceanglophone.mg/${file}`;
  if (!/<link\s+rel="canonical"/i.test(content)) {
    content = content.replace("</head>", `  <link rel="canonical" href="${canonical}">\n</head>`);
  }
  if (!/<link\s+rel="alternate"\s+hreflang=/i.test(content)) {
    const versions = equivalents[page];
    const block = ["fr", "en", "mg"].map((lang) => `  <link rel="alternate" hreflang="${lang}" href="https://allianceanglophone.mg/${lang}/${versions[lang]}">`).join("\n");
    content = content.replace("</head>", `${block}\n  <link rel="alternate" hreflang="x-default" href="https://allianceanglophone.mg/fr/${versions.fr}">\n</head>`);
  }
  return content;
}

function updateLanguageLinks(content, language, page) {
  const versions = equivalents[page];
  if (!versions) return content;
  const hrefFor = (target) => target === language ? versions[target] : `../${target}/${versions[target]}`;
  for (const [target, flag] of [["fr", "fr"], ["en", "us"], ["mg", "mg"]]) {
    const pattern = new RegExp(`<a\\s+href="[^"]*"([^>]*)><img\\s+src="\\.\\.\/assets\/flag-${flag}-v2\\.svg"`, "g");
    content = content.replace(pattern, `<a href="${hrefFor(target)}"$1><img src="../assets/flag-${flag}-v2.svg"`);
  }
  return content;
}

function standardizePrimaryNavigation(content, language, page) {
  const labels = navLabels[language];
  const pages = ["index", "programs", "pricing", "mission", "impact", "volunteer", "registration", "contact"];
  const links = pages.map((target) => {
    const active = page === target ? ' class="active" aria-current="page"' : "";
    return `<a${active} href="${equivalents[target][language]}">${labels[target]}</a>`;
  });
  const languageNames = {
    fr: { fr: "Français", en: "French", mg: "Frantsay" },
    en: { fr: "Anglais", en: "English", mg: "Anglisy" },
    mg: { fr: "Malgache", en: "Malagasy", mg: "Malagasy" }
  };
  const languageSwitcherLabels = {
    fr: "Choisir une autre langue",
    en: "Choose another language",
    mg: "Misafidiana fiteny hafa"
  };
  const flags = { fr: "fr", en: "us", mg: "mg" };
  const alternativeLanguages = ["fr", "en", "mg"].filter((target) => target !== language);
  const languageLinks = alternativeLanguages.map((target) => {
    const href = `../${target}/${equivalents[page][target]}`;
    const name = languageNames[target][language];
    return `<a href="${href}" lang="${target}" hreflang="${target}" aria-label="${name}" title="${name}"><img src="../assets/flag-${flags[target]}-v2.svg" alt="" class="flag-icon" width="24" height="16"></a>`;
  });
  const languageSwitcher = `<div class="language-switcher" aria-label="${languageSwitcherLabels[language]}">\n        ${languageLinks.join("\n        ")}\n      </div>`;
  const label = { fr: "Navigation principale", en: "Primary navigation", mg: "Fitetezana lehibe" }[language];
  const nav = `<nav aria-label="${label}">\n      ${[languageSwitcher, ...links].join("\n      ")}\n    </nav>`;
  return content.replace(/(<header\s+class="topbar"[\s\S]*?)<nav[^>]*>[\s\S]*?<\/nav>([\s\S]*?<\/header>)/i, `$1${nav}$2`);
}

function updateFooter(content, language) {
  const files = equivalents;
  const labels = footerLabels[language];
  const facebook = "https://www.facebook.com/AllianceAnglophoneMG";
  content = content.replace(/<p>© 2026 Alliance Anglophone\.[\s\S]*?<\/p>/, `<p>© 2026 Alliance Anglophone. ${scheduleFooter[language]}</p>`);
  content = content.replace(/\s*<p>\s*<a href="https:\/\/www\.facebook\.com\/[^\"]+"[\s\S]*?<\/p>/i, "");
  if (!content.includes('class="footer-links"')) {
    const contactFile = files.contact[language];
    const links = `\n    <nav class="footer-links" aria-label="${labels.contact}">\n      <a href="${files.privacy[language]}">${labels.privacy}</a>\n      <a href="${files.terms[language]}">${labels.terms}</a>\n      <a href="${contactFile}">${labels.contact}</a>\n      <a href="${facebook}" target="_blank" rel="noopener noreferrer">${labels.facebook}</a>\n    </nav>\n`;
    content = content.replace("</footer>", `${links}</footer>`);
  }
  return content;
}

function addTransparencySection(content, language, page) {
  if (page !== "mission" || content.includes("transparency-section")) return content;
  const copy = {
    fr: {
      title: "Équipe et transparence",
      body: "Alliance Anglophone ne publie un profil individuel qu’après vérification de l’expérience présentée et accord de la personne concernée. Avant toute inscription confirmée, l’apprenant peut demander l’identité et le rôle de son contact pédagogique, les objectifs du programme, le calendrier, le tarif et les conditions applicables.",
      points: ["Profils et qualifications vérifiés avant publication", "Responsable du programme identifié lors de la confirmation", "Aucun témoignage ni résultat chiffré publié sans élément vérifiable"]
    },
    en: {
      title: "Team and transparency",
      body: "Alliance Anglophone publishes an individual profile only after the stated experience has been verified and the person has agreed. Before a registration is confirmed, a learner may request the name and role of the learning contact, program objectives, timetable, price, and applicable terms.",
      points: ["Profiles and qualifications verified before publication", "Program contact identified in the confirmation", "No testimonial or numerical result published without verifiable evidence"]
    },
    mg: {
      title: "Ekipa sy mangarahara",
      body: "Ny Alliance Anglophone dia mamoaka profil olona iray rehefa voamarina ny traikefa voalaza ary nanaiky ilay olona. Alohan’ny hanamafisana ny fisoratana dia afaka mangataka ny anarana sy andraikitry ny mpifandray pedagogika, ny tanjon’ny programa, ora, vidiny ary fepetra ampiharina ny mpianatra.",
      points: ["Hamarininay ny profil sy qualification alohan’ny hamoahana azy", "Ho fantatra ao amin’ny fanamafisana ny tompon’andraikitry ny programa", "Tsy hamoaka témoignage na vokatra isa raha tsy misy porofo azo hamarinina"]
    }
  }[language];
  const section = `\n    <section class="section-white transparency-section">\n      <div class="section-title"><h2>${copy.title}</h2><p>${copy.body}</p></div>\n      <div class="trust-note"><ul>${copy.points.map((point) => `<li>${point}</li>`).join("")}</ul></div>\n    </section>\n`;
  return content.replace("</main>", `${section}</main>`);
}

for (const file of htmlFiles) {
  const language = file.slice(0, 2);
  const page = fileToPage.get(file);
  if (!page) continue;
  const path = join(root, file);
  let content = readFileSync(path, "utf8");

  content = content
    .replaceAll("../assets/style.css", "../assets/style-v2.css")
    .replaceAll("../assets/mobile-nav.js", "../assets/site-v2.js")
    .replaceAll("../assets/logo.JPG", "../assets/logo-v2.webp")
    .replaceAll("../assets/flag-fr.png", "../assets/flag-fr-v2.svg")
    .replaceAll("../assets/flag-us.png", "../assets/flag-us-v2.svg")
    .replaceAll("../assets/flag-mg.png", "../assets/flag-mg-v2.svg")
    .replaceAll("https://www.facebook.com/EnglishSkillsBooster", "https://www.facebook.com/AllianceAnglophoneMG")
    .replaceAll("Facebook - English Skills Booster", "Facebook — Alliance Anglophone");

  content = content
    .replaceAll("https://allianceanglophone.mg/assets/logo.JPG", "https://allianceanglophone.mg/assets/logo-v2.webp")
    .replaceAll("Online classes are currently being prepared and are expected to open soon.", "Online classes begin on 7 September 2026.")
    .replaceAll("Online classes are currently being prepared. You can continue exploring our programs", "The first online cohort starts on 7 September 2026. You can continue exploring our programs")
    .replaceAll("Online classes are being prepared and are expected to open soon.", "Online classes begin on 7 September 2026.")
    .replaceAll("Online classes are being prepared and may open soon.", "Online classes begin on 7 September 2026.")
    .replaceAll("Online classes:</strong> opening soon", "Online classes:</strong> begin on 7 September 2026")
    .replaceAll("Alliance Anglophone prépare actuellement ses programmes d’anglais en ligne.", "Alliance Anglophone lance sa première cohorte d’anglais général en ligne le 7 septembre 2026.")
    .replaceAll("Les cours en ligne sont actuellement en préparation et devraient ouvrir prochainement.", "La première cohorte de cours en ligne commence le 7 septembre 2026.")
    .replaceAll("Les cours en ligne sont actuellement en préparation. Vous pouvez continuer à consulter nos programmes", "La première cohorte en ligne commence le 7 septembre 2026. Vous pouvez continuer à consulter nos programmes")
    .replaceAll("Alliance Anglophone prépare actuellement son offre de formation en ligne.", "Alliance Anglophone lance sa première cohorte de formation en ligne le 7 septembre 2026.")
    .replaceAll("Les cours en ligne sont en préparation et devraient ouvrir prochainement.", "La première cohorte de cours en ligne commence le 7 septembre 2026.")
    .replaceAll("Mbola eo am-panomanana ny cours en ligne ary kasaina hisokatra tsy ho ela.", "Manomboka ny 7 Septambra 2026 ny cours en ligne.")
    .replaceAll("Cours en ligne :</strong> ho avy tsy ho ela", "Cours en ligne :</strong> manomboka ny 7 Septambra 2026")
    .replaceAll("Toetry ny fiofanana :</strong> mbola eo am-panomanana ny cours en ligne ary kasaina hisokatra tsy ho ela.", "Toetry ny fiofanana :</strong> misokatra ny fisoratana ary manomboka ny 7 Septambra 2026 ny cours en ligne.");

  content = content.replace(/<img src="\.\.\/assets\/logo-v2\.webp" alt="([^"]*)">/g, '<img src="../assets/logo-v2.webp" alt="$1" width="56" height="56" decoding="async">');
  content = content.replace(/<a([^>]*target="_blank"(?![^>]*\brel=)[^>]*)>/g, '<a$1 rel="noopener noreferrer">');
  content = updateLanguageLinks(content, language, page);
  content = standardizePrimaryNavigation(content, language, page);
  content = updateFooter(content, language);
  content = addTransparencySection(content, language, page);
  content = addHeadAssets(content, page);
  content = addCanonicalAndAlternates(content, file, page);
  content = addOrReplaceSocialMeta(content, file, page, language);

  writeFileSync(path, content);
}

console.log(`Updated ${htmlFiles.filter((file) => fileToPage.has(file)).length} multilingual pages.`);
