(function(){
  "use strict";

  // Run when DOM is ready
  function start(){
    try {
      if (window.matchMedia && window.matchMedia("(hover:none) and (pointer:coarse)").matches) return;
    } catch(e){}

    // Config
    const LOGO_URL="https://deicell.com/assets/images/image02.png?v=66696e40";
    const CONSULT_URL="https://deicell.com/#contact";
    const COMPANY_EMAIL="NJONES@DEICELL.COM";
    const COMPANY_LINKEDIN="https://www.linkedin.com/company/deicell/";
    const FOUNDER_LINKEDIN="https://www.linkedin.com/in/ncjbio/";
    const FOUNDER_NAME="Nathan Jones, Founder & Principal Consultant";
    const LS={hist:"dc_chat_hist_v14"};

    // Ensure root exists (so Carrd embed can be tiny)
    let root=document.getElementById("dc-chat-root");
    if(!root){
      root=document.createElement("div");
      root.id="dc-chat-root";
      root.setAttribute("aria-hidden","true");
      document.body.appendChild(root);
    }

    const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(/\n/g,"<br>");
    const showToast=(msg)=>{
      const t=document.getElementById("dc-toast");
      if(!t) return;
      t.textContent=msg||"Saved";
      t.classList.add("show");
      setTimeout(()=>t.classList.remove("show"),1400);
    };

    // Launcher
    const btn=document.createElement("button");
    btn.id="dc-chat-toggle";
    btn.innerHTML=`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 15.5c1.1-1 2-2.6 2-4.5C22 7 18.4 4 13.9 4 9.5 4 6 7 6 11c0 .7.1 1.3.3 1.9-1.5 1.2-3.1 2.1-4.3 2.4 1.5 0 3.6-.4 5.2-1.1 1.5 1.2 3.6 1.8 5.7 1.8.6 0 1.1-.1 1.7-.2.9.6 2.9 1.5 5.4 1.2-.8-.5-1.7-1.2-2-1.8z" fill="currentColor" opacity=".95"/>
    </svg>`;
    root.appendChild(btn);

    // Panel
    const panel=document.createElement("div");
    panel.id="dc-chat-panel";
    panel.innerHTML=`
      <div id="dc-header">
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${LOGO_URL}" alt="DeiCell"><span>DeiCell Assistant</span>
        </div>
        <button id="dc-close" aria-label="Close">&times;</button>
      </div>
      <div id="dc-log" class="dc-watermark"></div>
      <form id="dc-form" autocomplete="off">
        <input id="dc-input" type="text" placeholder="Ask about QMS, regulatory, or AI..." autocomplete="off">
        <button id="dc-send" type="submit">Send</button>
      </form>
      <div id="dc-toast">Copied!</div>
    `;
    root.appendChild(panel);

    const log=document.getElementById("dc-log");
    if(log) log.style.setProperty("--dc-watermark-url",`url("${LOGO_URL}")`);
    const closeBtn=document.getElementById("dc-close");
    const form=document.getElementById("dc-form");
    const input=document.getElementById("dc-input");

    // Open/close
    const setOpen=(open)=>{
      panel.style.display=open?"flex":"none";
      if(open) setTimeout(()=>{ try{ input && input.focus(); }catch(e){} },0);
    };
    const toggle=()=> setOpen(panel.style.display!=="flex");
    const close =()=> setOpen(false);

    btn.addEventListener("click",toggle);
    closeBtn.addEventListener("click",close);
    document.addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });

    // State and render
    let history=[];
    try{ history=JSON.parse(localStorage.getItem(LS.hist)||"[]") || []; }catch(e){ history=[]; }
    const bubble=(role,html)=>`<div class="dc-msg ${role==='user'?'user':'assistant'}"><div class="bubble">${html}</div></div>`;
    const render=()=>{ try{ log.innerHTML=history.map(m=>bubble(m.role,m.html)).join(""); log.scrollTop=log.scrollHeight; }catch(e){} };
    const save=()=>{ try{ localStorage.setItem(LS.hist,JSON.stringify(history)); }catch(e){} };
    const add=(role,text)=>{ history.push({role,html:esc(text)}); save(); render(); };
    const addHTML=(html)=>{ history.push({role:"assistant",html}); save(); render(); };

    // Components
    function addCapture(){
      if (document.getElementById("dc-capture")) return;
      const id="dc-capture";
      const html=bubble("assistant", `
        <form id="${id}" style="display:grid;gap:6px;margin-top:6px">
          <div style="display:grid;gap:6px">
            <input type="text" name="name" placeholder="Your name" style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="email" name="email" placeholder="Email" value="" style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <textarea name="note" rows="2" placeholder="Brief note" style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5"></textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button type="submit" class="dc-btn">Submit Info</button>
            <a href="mailto:${COMPANY_EMAIL}" class="dc-btn secondary">Email Us</a>
          </div>
        </form>
      `;
      );
      addHTML(html);
      setTimeout(()=>{
        const f=document.getElementById(id);
        if(!f) return;
        f.addEventListener("submit", (e)=>{
          e.preventDefault();
          const fd=new FormData(f);
          const payload={
            ts:Date.now(),
            name:(fd.get("name")||"").toString().trim(),
            email:(fd.get("email")||"").toString().trim(),
            note:(fd.get("note")||"").toString().trim()
          };
          try {
            const prev=JSON.parse(localStorage.getItem("dc_leads")||"[]");
            prev.push(payload);
            localStorage.setItem("dc_leads", JSON.stringify(prev));
          } catch(e){}
          add("assistant","Thanks. We saved your info. We will reach out soon.");
          showToast("Saved");
        });
      },0);
    }

    function addCTA(){
      const html=bubble("assistant", `
        <div class="dc-actions">
          <a class="dc-btn" href="${CONSULT_URL}" target="_blank" rel="noopener">Book a consult</a>
          <button class="dc-btn secondary" type="button" id="dc-copy-email">Copy email</button>
        </div>
      `);
      addHTML(html);
      setTimeout(()=>{
        const copy=document.getElementById("dc-copy-email");
        if(copy) copy.addEventListener("click", async ()=>{
          try{ await navigator.clipboard.writeText("${COMPANY_EMAIL}"); showToast("Email copied"); }catch(e){ showToast("Copy failed"); }
        });
      },0);
    }

    function addContact(){
      const html=bubble("assistant", `
        <div>
          <div style="margin-bottom:6px"><strong>Contact</strong></div>
          <div>Email: <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a></div>
          <div>Company: <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
          <di
