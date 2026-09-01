import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() && name !== ".git" ? walk(path) : [path];
  });
}

const allFiles = walk(root);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const primary = htmlFiles.filter((file) => /\/(fr|en|mg)\//.test(file));
const pricingPages = new Set(["fr/tarifs.html", "en/pricing.html", "mg/saram-piofanana.html"]);
const tuitionAmount = /\b\d{2,3}(?:[ ,.\u00a0]|&nbsp;)*000\s*Ar\b/i;

for (const path of primary) {
  const file = path.slice(root.length);
  const html = readFileSync(path, "utf8");
  assert(/^<!DOCTYPE html>/i.test(html), `${file}: missing HTML5 doctype`);
  assert(/<html\s+lang="(fr|en|mg)"/i.test(html), `${file}: missing or invalid language`);
  assert((html.match(/<h1\b/gi) || []).length === 1, `${file}: expected exactly one h1`);
  assert(/<title>[^<]+<\/title>/i.test(html), `${file}: missing title`);
  assert(/<meta\s+name="description"\s+content="[^"]+"\s*\/?\s*>/i.test(html), `${file}: missing or malformed description`);
  assert(!/>\s*\/>/.test(html), `${file}: stray self-closing fragment appears as visible text`);
  assert(/<link\s+rel="canonical"\s+href="https:\/\/allianceanglophone\.mg\//i.test(html), `${file}: missing canonical URL`);
  assert(!/<style>/i.test(html), `${file}: inline style block should be consolidated`);
  assert(html.includes("site-v2.js"), `${file}: missing shared navigation/accessibility script`);
  assert(html.includes("favicon-32.png"), `${file}: missing favicon`);
  assert(html.includes('property="og:image"'), `${file}: missing Open Graph image`);
  assert(!/EnglishSkillsBooster|logo\.JPG|flag-(?:fr|us|mg)\.png|assets\/style\.css|mobile-nav\.js/i.test(html), `${file}: stale branding or asset reference`);
  assert(!/opening soon|currently being prepared|next two months|kasaina hisokatra tsy ho ela|ho avy tsy ho ela/i.test(html), `${file}: stale launch timing`);
  assert(!/(?<!\d)50(?:[ ,.\u00a0]|&nbsp;)*000\s*Ar/i.test(html), `${file}: discontinued 50,000 Ar launch price remains`);
  assert(!/(?:15|22|29) (?:August|août|Aogositra) 2026/i.test(html), `${file}: obsolete August sample-lesson date remains`);
  assert(!html.includes("js-trial-cta"), `${file}: active free-trial registration link remains`);
  assert(!/(?:free[- ]trial|trial week|semaine d’essai|cours d’essai|herinandro fitsapana|fisoratana amin’ny essai)/i.test(html), `${file}: temporary trial campaign wording remains`);
  assert(!/(?:pilot 2026 price|tarif pilote 2026|vidiny pilote 2026)/i.test(html), `${file}: temporary pilot-price wording remains`);
  assert(!/(?:another September 2026 cohort|cohorte de novembre 2026|cohorte hafa amin’ny Septambra 2026|7 September 2026|7 septembre 2026|7 Septambra 2026)/i.test(html), `${file}: date-specific launch wording remains`);
  if (!pricingPages.has(file)) assert(!tuitionAmount.test(html), `${file}: numerical tuition must appear only on the pricing page`);

  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicateIds.length === 0, `${file}: duplicate IDs ${[...new Set(duplicateIds)].join(", ")}`);

  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/<(?:a|link|img|script)[^>]+(?:href|src)="([^"]+)"/gi)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(target)) continue;
    const clean = target.split(/[?#]/)[0];
    if (!clean) continue;
    const resolved = clean.startsWith("/") ? join(root, clean) : normalize(join(dirname(path), clean));
    assert(existsSync(resolved), `${file}: broken local reference ${target}`);
  }
}

for (const file of ["fr/programmes.html", "en/programs.html", "mg/programa.html"]) {
  const html = readFileSync(join(root, file), "utf8");
  assert((html.match(/<article class="program-card">/g) || []).length === 16, `${file}: expected 16 program cards`);
  assert((html.match(/"@type": "Course"/g) || []).length === 16, `${file}: expected 16 Course schema entries`);
  assert(html.includes('class="program-grid swipe-track"'), `${file}: missing touch-friendly programme track`);
}

for (const file of ["fr/tarifs.html", "en/pricing.html", "mg/saram-piofanana.html"]) {
  const html = readFileSync(join(root, file), "utf8");
  assert((html.match(/<article class="price-card(?: featured)?">/g) || []).length === 14, `${file}: expected 14 pricing cards`);
  assert((html.match(/<article class="price-card featured">/g) || []).length === 1, `${file}: General English should be featured once`);
  assert(html.includes('class="pricing-grid swipe-track"'), `${file}: missing touch-friendly pricing track`);
  assert(/90(?:[ ,.\u00a0]|&nbsp;)*000\s*Ar/i.test(html), `${file}: missing 90,000 Ar General English price`);
  assert(/125(?:[ ,.\u00a0]|&nbsp;)*000\s*Ar/i.test(html), `${file}: missing 125,000 Ar specialist price`);
}

for (const file of ["fr/inscription.html", "en/registration.html", "mg/fisoratana.html"]) {
  const html = readFileSync(join(root, file), "utf8");
  assert((html.match(/<option/g) || []).length === 85, `${file}: registration choices are not in parity`);
  assert((html.match(/class="quick-path-card/g) || []).length === 2, `${file}: expected General English and specialist quick paths`);
  assert(!html.includes("trial-closed-status"), `${file}: closed-trial status should not be public`);
  assert(/<details class="full-registration">/.test(html), `${file}: detailed registration form should remain available`);
  assert((html.match(/class="privacy-consent"/g) || []).length === 2, `${file}: missing privacy/terms acknowledgements`);
  for (const token of ['autocomplete="name"', 'autocomplete="tel"', 'autocomplete="email"', 'autocomplete="address-level2"', 'id="cohort"', "registration-v2.js"]) {
    assert(html.includes(token), `${file}: missing ${token}`);
  }
  assert(!/<a href="[^"]+">(?:privacy|terms|confidentialite|conditions|tsiambaratelo|fepetra)\.html<\/a>/i.test(html), `${file}: raw filename used as consent-link label`);
  assert(/<aside class="side-card">[\s\S]*?href="https:\/\/wa\.me\/261349201200"/i.test(html), `${file}: help CTA must open WhatsApp`);
  assert(/Next available cohort|Prochaine cohorte disponible|Cohorte manaraka misy toerana/i.test(html), `${file}: missing evergreen next-cohort choice`);
  assert(/A later cohort|Une cohorte ultérieure|Cohorte any aoriana/i.test(html), `${file}: missing later-cohort choice`);
  assert(/Flexible start|Date flexible|Daty malalaka/i.test(html), `${file}: missing flexible-start choice`);
  const pricingHref = file.startsWith("fr/") ? "tarifs.html" : file.startsWith("en/") ? "pricing.html" : "saram-piofanana.html";
  assert((html.match(new RegExp(`class="quick-path-price-link" href="${pricingHref}"`, "g")) || []).length === 2, `${file}: quick paths must link to the single pricing source`);
}

for (const file of ["fr/index.html", "en/index.html", "mg/index.html"]) {
  const html = readFileSync(join(root, file), "utf8");
  assert((html.match(/https:\/\/wa\.me\/261349201200\?text=/g) || []).length >= 2, `${file}: paid-course calls to action must use prepared WhatsApp messages`);
  assert(!html.includes("trial-closed-status"), `${file}: closed-trial status should not be public`);
  assert((html.match(/class="faq-item/g) || []).length === 5, `${file}: expected five concise FAQ items`);
  assert(/year-round|toute l’année|mandritra ny taona/i.test(html), `${file}: evergreen registration wording is not visible`);
  const approvedCta = file.startsWith("fr/")
    ? "N’attendez plus—commencez dès aujourd’hui à progresser en anglais."
    : file.startsWith("en/")
      ? "Don’t wait—start improving your English today."
      : "Aza miandry ela—atombohy anio ny fandrosoanao amin’ny teny anglisy.";
  assert(html.includes(approvedCta), `${file}: approved homepage CTA wording is missing`);
}

const sharedScript = readFileSync(join(root, "assets/site-v2.js"), "utf8");
assert(!/deadlinePassed|2026-09-03T23:59:59/.test(sharedScript), "assets/site-v2.js: obsolete paid-registration deadline switch remains");

for (const file of ["fr/merci.html", "en/thank-you.html", "mg/misaotra.html"]) {
  assert(/name="robots"\s+content="noindex,\s*follow"/i.test(readFileSync(join(root, file), "utf8")), `${file}: thank-you page should be noindex`);
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
assert((sitemap.match(/<url>/g) || []).length === 31, "sitemap.xml: expected 31 URLs");
assert(!/<priority>|<changefreq>|2026-06-05/.test(sitemap), "sitemap.xml: stale or ignored metadata remains");
assert(existsSync(join(root, "404.html")), "Missing multilingual 404 page");

const robots = readFileSync(join(root, "robots.txt"), "utf8");
assert(/^User-agent:\s*\*/m.test(robots), "robots.txt: missing universal crawler rule");
assert(/^Allow:\s*\/$/m.test(robots), "robots.txt: public crawling should be allowed");
assert(/^Sitemap:\s*https:\/\/allianceanglophone\.mg\/sitemap\.xml$/m.test(robots), "robots.txt: missing canonical sitemap URL");
assert(existsSync(join(root, "_headers")), "Missing production cache and security headers");

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed: ${primary.length} multilingual pages, local references, schemas, forms, sitemap, and 404 page.`);
