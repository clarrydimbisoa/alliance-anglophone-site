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
  assert(!/opening soon|next two months|kasaina hisokatra tsy ho ela|ho avy tsy ho ela/i.test(html), `${file}: stale launch timing`);

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
}

for (const file of ["fr/tarifs.html", "en/pricing.html", "mg/saram-piofanana.html"]) {
  const html = readFileSync(join(root, file), "utf8");
  assert((html.match(/<article class="price-card">/g) || []).length === 14, `${file}: expected 14 pricing cards`);
}

for (const file of ["fr/inscription.html", "en/registration.html", "mg/fisoratana.html"]) {
  const html = readFileSync(join(root, file), "utf8");
  assert((html.match(/<option/g) || []).length === 81, `${file}: registration choices are not in parity`);
  assert((html.match(/class="privacy-consent"/g) || []).length === 2, `${file}: missing privacy/terms acknowledgements`);
  for (const token of ['autocomplete="name"', 'autocomplete="tel"', 'autocomplete="email"', 'autocomplete="address-level2"', "registration-v2.js"]) {
    assert(html.includes(token), `${file}: missing ${token}`);
  }
  assert(!/<a href="[^"]+">(?:privacy|terms|confidentialite|conditions|tsiambaratelo|fepetra)\.html<\/a>/i.test(html), `${file}: raw filename used as consent-link label`);
  assert(/<aside class="side-card">[\s\S]*?href="https:\/\/wa\.me\/261349201200"/i.test(html), `${file}: help CTA must open WhatsApp`);
}

for (const file of ["fr/merci.html", "en/thank-you.html", "mg/misaotra.html"]) {
  assert(/name="robots"\s+content="noindex,\s*follow"/i.test(readFileSync(join(root, file), "utf8")), `${file}: thank-you page should be noindex`);
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
assert((sitemap.match(/<url>/g) || []).length === 31, "sitemap.xml: expected 31 URLs");
assert(!/<priority>|<changefreq>|2026-06-05/.test(sitemap), "sitemap.xml: stale or ignored metadata remains");
assert(existsSync(join(root, "404.html")), "Missing multilingual 404 page");

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed: ${primary.length} multilingual pages, local references, schemas, forms, sitemap, and 404 page.`);
