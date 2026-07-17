document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".topbar");
  const nav = header ? header.querySelector("nav") : null;

  if (!header || !nav) return;

  if (!nav.id) nav.id = "site-navigation";

  const language = document.documentElement.lang || "fr";
  const labels = {
    fr: { menu: "Menu", open: "Ouvrir le menu", close: "Fermer" },
    en: { menu: "Menu", open: "Open menu", close: "Close" },
    mg: { menu: "Menu", open: "Sokafy ny menu", close: "Akatona" }
  };
  const copy = labels[language] || labels.fr;

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

  function setMenu(open) {
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
  }

  button.addEventListener("click", function () {
    setMenu(!header.classList.contains("nav-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setMenu(false);
  });
});
