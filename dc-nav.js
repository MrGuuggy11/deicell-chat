/* === DeiCell Nav — JS (from scratch) === */

/* --- Config --- */
window.DC_NAV_CONFIG = Object.assign({
  logoUrl: "https://adada.crd.co/assets/images/image07.png?v=75b90b40",
  brandHref: "#top",
  menu: [
    {
      label: "Solutions",
      items: [
        { label: "eQMS Xpress",      href: "#eqms" },
        { label: "Compliance Xpand", href: "#compliance" },
        { label: "Enterprise Xact",  href: "#enterprise" },
        { label: "AI Xpert",         href: "#ai" }
      ]
    },
    {
      label: "About",
      items: [
        { label: "Mission",   href: "#mission" },
        { label: "Team",      href: "#team" },
        { label: "Portfolio", href: "#portfolio" }
      ]
    },
    { label: "Contact", href: "#contact" }
  ],
  activePathAuto: true
}, window.DC_NAV_CONFIG || {});

/* --- Build DOM --- */
(function(){
  const C = window.DC_NAV_CONFIG;

  const shell = document.createElement('div'); shell.id = 'dc-shell';
  const bar   = document.createElement('div');  bar.id = 'dc-bar';

  // Brand
  const brand = document.createElement('a');
  brand.className = 'dc-brand';
  brand.href = C.brandHref || '#top';
  brand.setAttribute('aria-label','DeiCell Systems home');
  const img = document.createElement('img');
  img.src = C.logoUrl; img.alt = 'DeiCell Systems';
  img.style.height = '36px'; img.style.width = 'auto';
  brand.appendChild(img);
  bar.appendChild(brand);

  // Burger (div to avoid iOS default button bubble)
  const burger = document.createElement('div');
  burger.className = 'dc-burger';
  burger.setAttribute('role','button');
  burger.setAttribute('aria-label','Toggle menu');
  burger.setAttribute('aria-expanded','false');
  burger.tabIndex = 0;
  burger.innerHTML = '<span></span>';
  bar.appendChild(burger);

  // Menu
  const ul = document.createElement('ul'); ul.className = 'dc-menu'; ul.id = 'dcMenu';

  (C.menu||[]).forEach(group=>{
    const li = document.createElement('li');

    if (group.items && group.items.length){
      // Non-link toggle header (Solutions/About)
      const top = document.createElement('span');
      top.className = 'dc-link dc-toggle';
      top.setAttribute('role','button');
      top.setAttribute('aria-haspopup','true');
      top.setAttribute('aria-expanded','false');
      top.tabIndex = 0;
      top.innerHTML = `<span>${group.label}</span><span class="caret">▾</span>`;
      li.appendChild(top);

      const drop = document.createElement('div');
      drop.className = 'dc-drop'; drop.setAttribute('role','menu');
      group.items.forEach(it=>{
        const a = document.createElement('a');
        a.href = it.href; a.textContent = it.label;
        drop.appendChild(a);
      });
      li.appendChild(drop);
    } else {
      // Real link (e.g., Contact)
      const a = document.createElement('a');
      a.className = 'dc-link';
      a.href = group.href || '#';
      a.textContent = group.label;
      li.appendChild(a);
    }

    ul.appendChild(li);
  });

  bar.appendChild(ul);
  document.body.prepend(shell);
  document.getElementById('dc-shell').appendChild(bar);

  /* --- Behavior --- */
  const menu = ul;

  function toggleMenu(){
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeMenu(){ menu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }

  // Top toggles: only toggle on touch/small screens. Desktop uses pure CSS hover.
  function onTopToggle(e){
    e.preventDefault();
    e.stopPropagation();
    const li = e.currentTarget.closest('li');
    const isTouchish = window.matchMedia('(hover: none)').matches ||
                       window.matchMedia('(max-width: 820px)').matches;
    if (isTouchish){
      document.querySelectorAll('#dcMenu > li').forEach(n=>{ if(n!==li) n.classList.remove('open'); });
      const open = li.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  burger.addEventListener('click', toggleMenu);
  burger.addEventListener('keydown', e=>{
    if (e.key==='Enter' || e.key===' ') { e.preventDefault(); toggleMenu(); }
  });

  // Bind toggles (span)
  ul.querySelectorAll('> li > .dc-toggle').forEach(el=>{
    el.addEventListener('click', onTopToggle);
    el.addEventListener('touchstart', onTopToggle, {passive:false});
    el.addEventListener('keydown', e=>{
      if (e.key==='Enter' || e.key===' ') onTopToggle(e);
    });
  });

  // Click outside closes menu (mobile)
  document.addEventListener('click', e=>{
    if (window.matchMedia('(max-width: 820px)').matches){
      if (!document.getElementById('dc-shell').contains(e.target)) closeMenu();
    }
  });
  // ESC closes menu
  document.addEventListener('keydown', e=>{ if (e.key==='Escape') closeMenu(); });

  /* Active state on real links only */
  if (C.activePathAuto){
    ul.querySelectorAll('.dc-link[href]').forEach(a=>{
      a.addEventListener('click', ()=>{
        ul.querySelectorAll('.dc-link').forEach(x=>x.classList.remove('is-active'));
        a.classList.add('is-active');
      });
    });
  }

  /* Smooth offset scroll for #hash links (prevents header overlap) */
  function headerOffsetPx(){
    const cs = getComputedStyle(document.documentElement);
    const px = v => parseFloat(v)||0;
    return px(cs.getPropertyValue('--nav-h')) +
           px(cs.getPropertyValue('--nav-m'))*2 +
           px(cs.getPropertyValue('--safe-top')) +
           px(cs.getPropertyValue('--safe-top-extra')) + 6;
  }
  function scrollToId(id){
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffsetPx();
    window.scrollTo({ top:y, behavior:'smooth' });
  }
  function interceptHashClicks(e){
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    // ignore clicks originating from toggle headers (which are spans)
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToId(id);
  }
  document.addEventListener('click', interceptHashClicks);
  window.addEventListener('hashchange', ()=>{ const id=location.hash.replace('#',''); if(id) scrollToId(id); });
  if (location.hash) setTimeout(()=>scrollToId(location.hash.slice(1)), 0);

  /* iOS dynamic safe-area watcher (handles URL bar show/hide) */
  function updateSafeTop(){
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:-9999px;height:0;padding-top:env(safe-area-inset-top)';
    document.body.appendChild(probe);
    const pt = getComputedStyle(probe).paddingTop || '0px';
    probe.remove();
    document.documentElement.style.setProperty('--safe-top', pt);
  }
  const nudge = () => requestAnimationFrame(updateSafeTop);
  window.addEventListener('load', nudge, {once:true});
  window.addEventListener('resize', nudge);
  window.addEventListener('orientationchange', nudge);
  let t; window.addEventListener('scroll', ()=>{ clearTimeout(t); t=setTimeout(nudge,120); }, {passive:true});
  document.addEventListener('click', e=>{ if (e.target.closest('.dc-burger') || e.target.closest('#dcMenu')) nudge(); });
})();
