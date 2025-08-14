/* === Config === */
window.DC_NAV_CONFIG = {
  logoUrl: "https://adada.crd.co/assets/images/image07.png?v=75b90b40",
  brandHref: "#top",
  menu: [
    {
      label: "Solutions",
      items: [
        { label: "eQMS Xpress", href: "#eqms" },
        { label: "Compliance Xpand", href: "#compliance" },
        { label: "Enterprise Xact", href: "#enterprise" },
        { label: "AI Xpert", href: "#ai" }
      ]
    },
    {
      label: "About",
      items: [
        { label: "Mission", href: "#mission" },
        { label: "Team", href: "#team" },
        { label: "Portfolio", href: "#portfolio" }
      ]
    },
    { label: "Contact", href: "#contact" }
  ],
  activePathAuto: true
};

/* === Inject markup === */
(function () {
  const C = window.DC_NAV_CONFIG || {};

  const shell = document.createElement("div");
  shell.id = "dc-shell";
  const bar = document.createElement("div");
  bar.id = "dc-bar";
  shell.appendChild(bar);

  // Brand
  const brand = document.createElement("a");
  brand.className = "dc-brand";
  brand.href = C.brandHref || "#top";
  brand.setAttribute("aria-label", "DeiCell Systems home");
  const img = document.createElement("img");
  img.src = C.logoUrl;
  img.alt = "DeiCell Systems";
  img.style.height = "36px";
  img.style.width = "auto";
  brand.appendChild(img);
  bar.appendChild(brand);

  // Hamburger
  const burger = document.createElement("button");
  burger.className = "dc-burger";
  burger.setAttribute("aria-label", "Toggle menu");
  burger.setAttribute("aria-expanded", "false");
  burger.innerHTML = "<span></span>";
  bar.appendChild(burger);

  // Menu
  const ul = document.createElement("ul");
  ul.className = "dc-menu";
  ul.id = "dcMenu";

  (C.menu || []).forEach((group) => {
    const li = document.createElement("li");

    if (group.items && group.items.length) {
      const a = document.createElement("a");
      a.className = "dc-link";
      a.href = "#";
      a.innerHTML = `<span>${group.label}</span><span class="caret">▾</span>`;
      li.appendChild(a);

      const drop = document.createElement("div");
      drop.className = "dc-drop";
      drop.setAttribute("role", "menu");

      group.items.forEach((it) => {
        const aa = document.createElement("a");
        aa.href = it.href;
        aa.textContent = it.label;
        drop.appendChild(aa);
      });

      li.appendChild(drop);
    } else {
      const a = document.createElement("a");
      a.className = "dc-link";
      a.href = group.href || "#";
      a.textContent = group.label;
      li.appendChild(a);
    }

    ul.appendChild(li);
  });

  bar.appendChild(ul);
  document.body.prepend(shell);
  document.getElementById("dc-shell").appendChild(bar);

  /* === Behavior === */
  const menu = ul;

  function toggleMenu() {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  burger.addEventListener("click", toggleMenu, { passive: true });

  // One listener that:
  // - toggles submenu on mobile IF it has a dropdown
  // - otherwise navigates and closes the menu
  ul.querySelectorAll(":scope > li > a.dc-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      const hasDrop =
        a.nextElementSibling && a.nextElementSibling.classList.contains("dc-drop");

      if (window.matchMedia("(max-width: 820px)").matches) {
        if (hasDrop) {
          e.preventDefault();
          const li = a.closest("li");
          document
            .querySelectorAll("#dcMenu > li")
            .forEach((n) => n !== li && n.classList.remove("open"));
          li.classList.toggle("open");
        } else {
          // plain link on mobile: close sheet, allow navigation
          menu.classList.remove("open");
          document.querySelectorAll("#dcMenu > li").forEach((n) => n.classList.remove("open"));
        }
      }
    });
  });

  // Click outside closes sheet (mobile)
  document.addEventListener("click", (e) => {
    if (window.matchMedia("(max-width: 820px)").matches) {
      if (!document.getElementById("dc-shell").contains(e.target)) {
        menu.classList.remove("open");
        document.querySelectorAll("#dcMenu > li").forEach((n) => n.classList.remove("open"));
      }
    }
  });

  // Active-link highlight on click
  if (C.activePathAuto) {
    ul.querySelectorAll(".dc-link[href]").forEach((a) => {
      a.addEventListener("click", () => {
        ul.querySelectorAll(".dc-link").forEach((x) => x.classList.remove("is-active"));
        a.classList.add("is-active");
      });
    });
  }
})();

/* === Safe-area watcher for iOS dynamic toolbars === */
(function () {
  function updateSafeTop() {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:-9999px;height:0;padding-top:env(safe-area-inset-top);";
    document.body.appendChild(probe);
    const pt = window.getComputedStyle(probe).paddingTop;
    document.body.removeChild(probe);
    document.documentElement.style.setProperty("--safe-top", pt || "0px");
  }
  const run = () => requestAnimationFrame(updateSafeTop);

  window.addEventListener("load", run, { once: true });
  window.addEventListener("resize", run);
  window.addEventListener("orientationchange", run);

  // Update when menu opens/closes too
  document.addEventListener("click", (e) => {
    if (e.target.closest(".dc-burger") || e.target.closest("#dcMenu")) run();
  });
})();
