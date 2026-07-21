document.addEventListener("DOMContentLoaded", function () {
  const language = document.documentElement.lang || "fr";
  const labels = {
    fr: {
      menu: "Menu",
      open: "Ouvrir le menu",
      close: "Fermer",
      skip: "Aller au contenu principal",
      whatsapp: "Contacter Alliance Anglophone sur WhatsApp"
    },
    en: {
      menu: "Menu",
      open: "Open menu",
      close: "Close",
      skip: "Skip to main content",
      whatsapp: "Contact Alliance Anglophone on WhatsApp"
    },
    mg: {
      menu: "Menu",
      open: "Sokafy ny menu",
      close: "Akatona",
      skip: "Mandehana any amin’ny votoaty lehibe",
      whatsapp: "Hifandray amin’ny Alliance Anglophone amin’ny WhatsApp"
    }
  };
  const copy = labels[language] || labels.fr;

  const main = document.querySelector("main");
  if (main) {
    if (!main.id) main.id = "main-content";
    if (!document.querySelector(".skip-link")) {
      const skipLink = document.createElement("a");
      skipLink.className = "skip-link";
      skipLink.href = "#" + main.id;
      skipLink.textContent = copy.skip;
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    link.setAttribute("rel", Array.from(rel).join(" "));
  });

  document.querySelectorAll(".whatsapp-float").forEach(function (link) {
    if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", copy.whatsapp);
  });

  document.querySelectorAll("nav a.active").forEach(function (link) {
    link.setAttribute("aria-current", "page");
  });

  const header = document.querySelector(".topbar");
  const nav = header ? header.querySelector("nav") : null;

  if (!header || !nav) return;

  if (!nav.id) nav.id = "site-navigation";

  const button = document.createElement("button");
  button.className = "menu-toggle";
  button.type = "button";
  button.setAttribute("aria-controls", nav.id);
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", copy.open);
  button.innerHTML =
    '<span class="menu-toggle-icon" aria-hidden="true">☰</span>' +
    '<span class="menu-toggle-label">' + copy.menu + "</span>";

  header.insertBefore(button, nav);

  function setMenu(open, restoreFocus) {
    header.classList.toggle("nav-open", open);
    document.body.classList.toggle("mobile-menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? copy.close : copy.open);
    button.innerHTML =
      '<span class="menu-toggle-icon" aria-hidden="true">' +
      (open ? "×" : "☰") +
      "</span>" +
      '<span class="menu-toggle-label">' +
      (open ? copy.close : copy.menu) +
      "</span>";

    if (open) {
      const firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    } else if (restoreFocus) {
      button.focus();
    }
  }

  button.addEventListener("click", function () {
    setMenu(!header.classList.contains("nav-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
      setMenu(false, true);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1400) setMenu(false);
  });
});
