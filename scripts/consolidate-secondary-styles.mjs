import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const cssPath = join(root, "assets/secondary-pages-v2.css");
const sources = ["fr/mission.html", "fr/impact.html", "fr/benevolat.html", "fr/contact.html", "fr/merci.html"];

if (!existsSync(cssPath)) {
  const blocks = sources.map((file) => {
    const content = readFileSync(join(root, file), "utf8");
    const css = content.match(/<style>([\s\S]*?)<\/style>/i)?.[1];
    if (!css) throw new Error(`No inline style block found in ${file}`);
    return `/* Consolidated from ${file} */\n${css.trim()}`;
  });
  const overrides = `
.mission-page .page-hero{background:linear-gradient(rgba(6,43,99,.78),rgba(6,43,99,.78)),url("hero-mission-v1.webp") center/cover no-repeat}
.impact-page .page-hero{background:linear-gradient(rgba(6,43,99,.78),rgba(6,43,99,.78)),url("hero-impact-v1.webp") center/cover no-repeat}
.volunteer-page .page-hero{background:linear-gradient(rgba(6,43,99,.78),rgba(6,43,99,.78)),url("hero-volunteer-v1.webp") center/cover no-repeat}
.contact-page .page-hero{background:linear-gradient(rgba(6,43,99,.78),rgba(6,43,99,.78)),url("hero-contact-v1.webp") center/cover no-repeat}
.thank-you-page .hero{background:linear-gradient(rgba(6,43,99,.7),rgba(6,43,99,.7)),url("hero-thankyou-v1.webp") center/cover no-repeat}
`;
  writeFileSync(cssPath, `${blocks.join("\n\n")}\n${overrides}`);
}

const groups = {
  "mission-page": ["fr/mission.html", "en/mission.html", "mg/iraka.html"],
  "impact-page": ["fr/impact.html", "en/impact.html", "mg/fiantraikany.html"],
  "volunteer-page": ["fr/benevolat.html", "en/volunteer.html", "mg/asa-an-tsitrapo.html"],
  "contact-page": ["fr/contact.html", "en/contact.html", "mg/fifandraisana.html"],
  "thank-you-page": ["fr/merci.html", "en/thank-you.html", "mg/misaotra.html"]
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
    if (!content.includes("secondary-pages-v2.css")) {
      if (content.includes("style-v2.css")) {
        content = content.replace('<link rel="stylesheet" href="../assets/style-v2.css" />', '<link rel="stylesheet" href="../assets/style-v2.css" />\n  <link rel="stylesheet" href="../assets/secondary-pages-v2.css">');
        content = content.replace('<link rel="stylesheet" href="../assets/style-v2.css">', '<link rel="stylesheet" href="../assets/style-v2.css">\n  <link rel="stylesheet" href="../assets/secondary-pages-v2.css">');
      } else {
        content = content.replace("</head>", '  <link rel="stylesheet" href="../assets/style-v2.css">\n  <link rel="stylesheet" href="../assets/secondary-pages-v2.css">\n</head>');
      }
    }
    writeFileSync(path, content);
  }
}

console.log("Consolidated repeated styles for 15 secondary multilingual pages.");
