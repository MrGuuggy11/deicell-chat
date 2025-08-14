/* === Config === */
window.DC_NAV_CONFIG = {
  logoUrl: "https://adada.crd.co/assets/images/image07.png?v=75b90b40",
  brandHref: "#top",
  menu: [
    {
      label: "Solutions",
      items: [
        {label:"eQMS Xpress", href:"#eqms"},
        {label:"Compliance Xpand", href:"#compliance"},
        {label:"Enterprise Xact", href:"#enterprise"},
        {label:"AI Xpert", href:"#ai"},
      ]
    },
    {
      label: "About",
      items: [
        {label:"Mission", href:"#mission"},
        {label:"Team", href:"#team"},
        {label:"Portfolio", href:"#portfolio"},
      ]
    },
    { label: "Contact", href: "#contact" }
  ],
  activePathAuto: true  // highlight last-tapped link (and same-page anchors)
};

/* === Inject markup === */
(function(){
  const C = window.DC_NAV_CONFIG || {};
  const shell = document.createElement("div"); shell.id = "dc-shell";
  const bar = document.createElement("div"); bar.id = "dc-bar"; shell.appendChild(bar);

  // brand
  const brand = document.createElement("a");
  brand.className = "dc-brand"; brand.href = C.brandHref || "#top"; brand.setAttribute("aria-label","DeiCell Systems home");
  const img = document.createElement("img"); img.src = C.logoUrl; img.alt = "DeiCell Systems"; img.style.height = "36px"; img.style.width = "auto";
  brand.appendChild(img); bar.appendChild(brand);

  // hamburger
  const burger = document.createElement("button");
  burger.className = "dc-burger"; burger.setAttribute("aria-label","Toggle menu"); burger.setAttribute("aria-expanded","false");
  burger.innerHTML = "<span></span>"; bar.appendChild(burger);

  // menu
  const ul = document.createElement("ul"); ul.className = "dc-menu"; ul.id = "dcMenu";
  (C.menu||[]).forEach(group=>{
    const li = document.createElement("li");
    if (group.items && group.items.length){
      const a = document.createElement("a"); a.className = "dc-link"; a.href = "#"; a.innerHTML = `<span>${group.label}</span><span class="caret">▾</span>`;
      li.appendChild(a);
      const drop = document.createElement("div"); drop.className = "dc-drop"; drop.setAttribute("role","menu");
      group.items.forEach(it=>{
        const aa = document.createElement("a"); aa.href = it.href; aa.textContent = it.label; drop.appendChild(aa);
      });
      li.appendChild(drop);
    }else{
      const a = document.createElement("a"); a.className = "dc-link"; a.href = group.href || "#"; a.textContent = group.label; li.appendChild(a);
    }
    ul.appendChild(li);
  });
  bar.appendChild(ul);
  document.body.prepend(shell);
  document.getElementById("dc-shell").appendChild(bar);

  /* === Behavior === */
  const menu = ul;

  function toggleMenu(){
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function toggleSub(e){
    if (window.matchMedia("(max-width: 820px)").matches){
      e.preventDefault();
      const li = e.currentTarget.closest("li");
      document.querySelectorAll("#dcMenu > li").forEach(n=>{ if(n!==li) n.classList.remove("open"); });
      li.classList.toggle("open");
    }
  }

  burger.addEventListener("click", toggleMenu);
  ul.querySelectorAll("> li > a.dc-link").forEach(a=>{
    a.addEventListener("click", toggleSub);
  });

  // click outside to close (mobile)
  document.addEventListener("click", function(e){
    if (window.matchMedia("(max-width: 820px)").matches){
      if (!document.getElementById("dc-shell").contains(e.target)) menu.classList.remove("open");
    }
  });

  // Active-link highlight on click
  if (C.activePathAuto){
    ul.querySelectorAll(".dc-link[href]").forEach(a=>{
      a.addEventListener("click", ()=> {
        ul.querySelectorAll(".dc-link").forEach(x=>x.classList.remove("is-active"));
        a.classList.add("is-active");
      });
    });
  }
})();
