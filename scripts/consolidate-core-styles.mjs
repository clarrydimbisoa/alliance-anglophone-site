import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const cssPath = join(root, "assets/core-pages-v2.css");
const sources = ["fr/index.html", "fr/programmes.html", "fr/tarifs.html", "fr/inscription.html"];

if (!existsSync(cssPath)) {
  const blocks = sources.map((file) => {
    const content = readFileSync(join(root, file), "utf8");
    const css = content.match(/<style>([\s\S]*?)<\/style>/i)?.[1];
    if (!css) throw new Error(`No inline style block found in ${file}`);
    return `/* Consolidated from ${file} */\n${css.trim()}`;
  });

  const overrides = `
/* Page-specific hero assets */
.programs-page .page-hero {
  background: linear-gradient(rgba(6, 43, 99, 0.78), rgba(6, 43, 99, 0.78)), url("hero-programs-v1.webp") center/cover no-repeat;
}
.pricing-page .page-hero {
  background: linear-gradient(rgba(6, 43, 99, 0.78), rgba(6, 43, 99, 0.78)), url("hero-options-v1.webp") center/cover no-repeat;
}
.registration-page .page-hero {
  background: linear-gradient(rgba(6, 43, 99, 0.78), rgba(6, 43, 99, 0.78)), url("hero-registration-v1.webp") center/cover no-repeat;
}
`;
  writeFileSync(cssPath, `${blocks.join("\n\n")}\n${overrides}`);
}

const groups = {
  "home-page": ["fr/index.html", "en/index.html", "mg/index.html"],
  "programs-page": ["fr/programmes.html", "en/programs.html", "mg/programa.html"],
  "pricing-page": ["fr/tarifs.html", "en/pricing.html", "mg/saram-piofanana.html"],
  "registration-page": ["fr/inscription.html", "en/registration.html", "mg/fisoratana.html"]
};

for (const [bodyClass, files] of Object.entries(groups)) {
  for (const file of files) {
    const path = join(root, file);
    let content = readFileSync(path, "utf8");
    content = content.replace(/\s*<style>[\s\S]*?<\/style>\s*/i, "\n");
    if (/<body\s+class="[^"]*"/.test(content)) {
      content = content.replace(/<body\s+class="([^"]*)"/, (_, classes) => `<body class="${Array.from(new Set(`${classes} ${bodyClass}`.trim().split(/\s+/))).join(" ")}"`);
    } else {
      content = content.replace("<body>", `<body class="${bodyClass}">`);
    }
    if (!content.includes("core-pages-v2.css")) {
      content = content.replace('<link rel="stylesheet" href="../assets/style-v2.css" />', '<link rel="stylesheet" href="../assets/style-v2.css" />\n  <link rel="stylesheet" href="../assets/core-pages-v2.css">');
      content = content.replace('<link rel="stylesheet" href="../assets/style-v2.css">', '<link rel="stylesheet" href="../assets/style-v2.css">\n  <link rel="stylesheet" href="../assets/core-pages-v2.css">');
    }
    writeFileSync(path, content);
  }
}

console.log("Consolidated repeated styles for 12 core multilingual pages.");
