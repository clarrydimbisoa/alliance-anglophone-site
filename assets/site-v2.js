document.addEventListener("DOMContentLoaded", function () {
  const language = document.documentElement.lang || "fr";
  const labels = {
    fr: {
      menu: "Menu",
      open: "Ouvrir le menu",
      close: "Fermer",
      skip: "Aller au contenu principal",
      whatsapp: "Contacter Alliance Anglophone sur WhatsApp",
      stickyLabel: "Anglais général · 90 000 Ar/mois · demande avant le 3 septembre",
      stickyCta: "Demander l’inscription",
      futureLabel: "Les demandes pour la cohorte de septembre sont closes",
      futureCta: "Demander la prochaine cohorte",
      futureMessage: "Bonjour Alliance Anglophone,\n\nJe souhaite recevoir des informations sur votre prochaine cohorte d’anglais général. Merci."
    },
    en: {
      menu: "Menu",
      open: "Open menu",
      close: "Close",
      skip: "Skip to main content",
      whatsapp: "Contact Alliance Anglophone on WhatsApp",
      stickyLabel: "General English · 90,000 Ar/month · request by 3 September",
      stickyCta: "Request registration",
      futureLabel: "Requests for the September cohort are closed",
      futureCta: "Ask about the next cohort",
      futureMessage: "Hello Alliance Anglophone,\n\nI would like information about your next General English cohort. Thank you."
    },
    mg: {
      menu: "Menu",
      open: "Sokafy ny menu",
      close: "Akatona",
      skip: "Mandehana any amin’ny votoaty lehibe",
      whatsapp: "Hifandray amin’ny Alliance Anglophone amin’ny WhatsApp",
      stickyLabel: "Anglisy ankapobeny · 90 000 Ar/volana · fangatahana alohan’ny 3 Septambra",
      stickyCta: "Hangataka fisoratana",
      futureLabel: "Nikatona ny fangatahana ho an’ny cohorte Septambra",
      futureCta: "Hanontany ny cohorte manaraka",
      futureMessage: "Salama Alliance Anglophone,\n\nTe hahazo fanazavana momba ny cohorte Anglisy ankapobeny manaraka aho. Misaotra."
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

  const deadlinePassed = Date.now() > Date.parse("2026-09-03T23:59:59+03:00");
  const futureHref = "https://wa.me/261349201200?text=" + encodeURIComponent(copy.futureMessage);

  if (deadlinePassed) {
    document.querySelectorAll(".js-intake-cta").forEach(function (link) {
      link.href = futureHref;
      link.textContent = copy.futureCta;
    });
  }

  if (!document.body.matches(".policy-page, .thank-you-page") && !document.querySelector(".sticky-enrollment")) {
    const sticky = document.createElement("aside");
    sticky.className = "sticky-enrollment";
    sticky.setAttribute("aria-label", copy.whatsapp);

    const label = document.createElement("span");
    label.className = "sticky-enrollment-label";
    label.textContent = deadlinePassed ? copy.futureLabel : copy.stickyLabel;

    const link = document.createElement("a");
    link.className = "btn btn-whatsapp";
    link.href = deadlinePassed
      ? futureHref
      : document.querySelector(".js-intake-cta")?.href || "https://wa.me/261349201200";
    link.textContent = deadlinePassed ? copy.futureCta : copy.stickyCta;

    sticky.append(label, link);
    document.body.appendChild(sticky);
    document.body.classList.add("has-sticky-enrollment");
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    const revealItems = document.querySelectorAll(
      "main > section:not(.hero):not(.page-hero), .program-card, .price-card, .quick-path-card, .faq-item, .transparency-section"
    );
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    revealItems.forEach(function (item, index) {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", `${(index % 4) * 55}ms`);
      revealObserver.observe(item);
    });
  }

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
