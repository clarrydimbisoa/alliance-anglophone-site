import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const groups = {
  home: { fr: "fr/index.html", en: "en/index.html", mg: "mg/index.html" },
  programs: { fr: "fr/programmes.html", en: "en/programs.html", mg: "mg/programa.html" },
  pricing: { fr: "fr/tarifs.html", en: "en/pricing.html", mg: "mg/saram-piofanana.html" },
  mission: { fr: "fr/mission.html", en: "en/mission.html", mg: "mg/iraka.html" },
  impact: { fr: "fr/impact.html", en: "en/impact.html", mg: "mg/fiantraikany.html" },
  volunteer: { fr: "fr/benevolat.html", en: "en/volunteer.html", mg: "mg/asa-an-tsitrapo.html" },
  registration: { fr: "fr/inscription.html", en: "en/registration.html", mg: "mg/fisoratana.html" },
  contact: { fr: "fr/contact.html", en: "en/contact.html", mg: "mg/fifandraisana.html" },
  privacy: { fr: "fr/confidentialite.html", en: "en/privacy.html", mg: "mg/tsiambaratelo.html" },
  terms: { fr: "fr/conditions.html", en: "en/terms.html", mg: "mg/fepetra.html" }
};

const base = "https://allianceanglophone.mg/";
const alternateTags = (versions) => Object.entries(versions).map(([lang, path]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${base}${path}"/>`).join("\n");
const entries = [`  <url>\n    <loc>${base}</loc>\n    <lastmod>2026-08-13</lastmod>\n${alternateTags(groups.home)}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${groups.home.fr}"/>\n  </url>`];

for (const versions of Object.values(groups)) {
  for (const path of Object.values(versions)) {
    entries.push(`  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>2026-08-13</lastmod>\n${alternateTags(versions)}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${versions.fr}"/>\n  </url>`);
  }
}

writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`);

const programFiles = [groups.programs.fr, groups.programs.en, groups.programs.mg];
for (const file of programFiles) {
  const path = join(root, file);
  let content = readFileSync(path, "utf8");
  const courses = Array.from(content.matchAll(/<article class="program-card">[\s\S]*?<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)).map((match, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Course",
      name: match[1].replace(/<[^>]+>/g, ""),
      description: match[2].replace(/<[^>]+>/g, ""),
      provider: {
        "@type": "EducationalOrganization",
        name: "Alliance Anglophone",
        url: "https://allianceanglophone.mg/"
      }
    }
  }));
  const schema = { "@context": "https://schema.org", "@type": "ItemList", itemListElement: courses };
  content = content.replace(/\s*<script id="course-schema"[\s\S]*?<\/script>/, "");
  content = content.replace("</head>", `  <script id="course-schema" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>\n</head>`);
  writeFileSync(path, content);
}

for (const file of ["fr/merci.html", "en/thank-you.html", "mg/misaotra.html"]) {
  const path = join(root, file);
  let content = readFileSync(path, "utf8");
  if (!content.includes('name="robots"')) content = content.replace("</head>", '  <meta name="robots" content="noindex,follow">\n</head>');
  writeFileSync(path, content);
}

writeFileSync(join(root, "404.html"), `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex,follow">
  <title>Page introuvable | Alliance Anglophone</title>
  <meta name="description" content="Page introuvable. Continuez vers Alliance Anglophone en français, anglais ou malagasy.">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
  <link rel="stylesheet" href="/assets/style-v2.css">
  <style>
    .error-page{min-height:100vh;display:grid;place-items:center;padding:28px;background:#f4f7fb}.error-card{width:min(920px,100%);padding:36px;border-radius:18px;background:#fff;box-shadow:0 12px 32px rgba(0,0,0,.1);text-align:center}.error-card img{width:96px;height:96px;border-radius:50%}.error-card h1{color:#062b63;font-size:clamp(2rem,6vw,4rem);margin:18px 0 8px}.error-languages{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:28px}.error-languages a{display:block;padding:18px;border:2px solid #0f4fbf;border-radius:12px;color:#062b63;text-decoration:none;font-weight:700}.error-languages a:hover{background:#0f4fbf;color:#fff}
  </style>
</head>
<body><main id="main-content" class="error-page"><section class="error-card"><img src="/assets/logo-v2.webp" alt="Alliance Anglophone"><h1>404</h1><p>Cette page n’existe pas ou a été déplacée. / This page does not exist or has moved. / Tsy misy na nafindra ity pejy ity.</p><nav class="error-languages" aria-label="Choisir une langue"><a href="/fr/index.html">Continuer en français</a><a href="/en/index.html">Continue in English</a><a href="/mg/index.html">Hanohy amin’ny teny malagasy</a></nav></section></main><script src="/assets/site-v2.js"></script></body>
</html>\n`);

const legacyRedirects = {
  "programmes.html": "/fr/programmes.html",
  "mission.html": "/fr/mission.html",
  "inscription.html": "/fr/inscription.html",
  "contact.html": "/fr/contact.html"
};

for (const [file, target] of Object.entries(legacyRedirects)) {
  writeFileSync(join(root, file), `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="https://allianceanglophone.mg${target}">
  <title>Redirection | Alliance Anglophone</title>
</head>
<body><main><h1>Alliance Anglophone</h1><p>Cette page a été déplacée. <a href="${target}">Continuer vers la page mise à jour</a>.</p></main><script>window.location.replace(${JSON.stringify(target)});</script></body>
</html>\n`);
}

const labPath = join(root, "lab/index.html");
let lab = readFileSync(labPath, "utf8").replace("../assets/logo.JPG", "../assets/logo-v2.webp");
writeFileSync(labPath, lab);

console.log("Generated sitemap, structured data, noindex metadata, multilingual 404, and legacy redirects.");
