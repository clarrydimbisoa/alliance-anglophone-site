import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const extensions = new Set([".html", ".css", ".js", ".mjs", ".json", ".xml"]);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (extensions.has(extname(path))) {
      const content = readFileSync(path, "utf8");
      writeFileSync(path, `${content.replace(/[ \t]+$/gm, "").trimEnd()}\n`);
    }
  }
}

walk(root);
console.log("Normalized generated text files.");
