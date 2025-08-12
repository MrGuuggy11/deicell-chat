<script>
(function(){
  "use strict";

  function start(){
    // (no hard exit on touch; we allow mobile to load too)
    try { /* keep guard but don't return */ 
      window.matchMedia && window.matchMedia("(hover:none) and (pointer:coarse)").matches;
    } catch(e){}

    // Config
    const LOGO_URL="https://deicell.com/assets/images/image02.png?v=66696e40";
    const CONSULT_URL="https://deicell.com/#contact";
    const COMPANY_EMAIL="NJONES@DEICELL.COM";
    const COMPANY_LINKEDIN="https://www.linkedin.com/company/deicell/";
    const FOUNDER_LINKEDIN="https://www.linkedin.com/in/ncjbio/";
    const FOUNDER_NAME="Nathan Jones, Founder & Principal Consultant";
    const LS={hist:"dc_chat_hist_v14"};
    const BOT_NAME="Mendel AI";                  // <-- added

    // Google Forms
    const GOOGLE_FORM = {
      action: "https://docs.google.com/forms/d/e/1FAIpQLSd-pxa0n6C1rZC0AExP8bc5VK-O6qDZWOyhHdqmy1ODVGUnNQ/formResponse",
      fields: {
        name:    "entry.511200028",
        email:   "entry.1678436901",
        phone:   "entry.1195889528",
        subject: "entry.205543377",
        message: "entry.1595874015"
      }
    };

    // Ensure root exists
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
    btn.setAttribute("aria-label", `Open ${BOT_NAME} chat`);   // <-- added
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
          <img src="${LOGO_URL}" alt="DeiCell"><span>${BOT_NAME}</span>
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

    // --- Components (unchanged except compact textarea) ---
    function addCapture(){
      if (document.getElementById("dc-capture")) return;
      const id="dc-capture";
      const html = bubble("assistant", `
        <form id="${id}" style="display:grid;gap:6px;margin-top:6px">
          <div style="display:grid;gap:6px">
            <input type="text"  name="name"    placeholder="Your name" required
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="email" name="email"   placeholder="Email" required
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="tel"   name="phone"   placeholder="Phone (optional)"
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="text"  name="subject" placeholder="Subject"
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <textarea name="note" rows="2" placeholder="Message"
              style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);
                     background:rgba(12,17,19,.85);color:#EAF2F5;line-height:1.3;
                     height:84px;min-height:64px;max-height:160px;resize:vertical;"></textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button type="submit" class="dc-btn">Submit Info</button>
            <a href="mailto:${COMPANY_EMAIL}" class="dc-btn secondary">Email Us</a>
          </div>
        </form>
      `);
      addHTML(html);

      setTimeout(()=>{
        const f=document.getElementById(id);
        if(!f) return;

        f.addEventListener("submit", (e)=>{
          e.preventDefault();
          const fd = new FormData(f);
          const name    = (fd.get("name")    || "").toString().trim();
          const email   = (fd.get("email")   || "").toString().trim();
          const phone   = (fd.get("phone")   || "").toString().trim();
          const subject = (fd.get("subject") || "").toString().trim();
          const note    = (fd.get("note")    || "").toString().trim();

          let sent=false;
          try{
            const targetName="dc-gform-target";
            let iframe=document.getElementById(targetName);
            if(!iframe){
              iframe=document.createElement("iframe");
              iframe.id=targetName; iframe.name=targetName; iframe.style.display="none";
              document.body.appendChild(iframe);
            }
            const gf=document.createElement("form");
            gf.action=GOOGLE_FORM.action; gf.method="POST"; gf.target=targetName; gf.style.display="none";
            const set=(n,v)=>{ const i=document.createElement("input"); i.type="hidden"; i.name=n; i.value=v; gf.appendChild(i); };
            set(GOOGLE_FORM.fields.name, name);
            set(GOOGLE_FORM.fields.email, email);
            set(GOOGLE_FORM.fields.phone, phone);
            set(GOOGLE_FORM.fields.subject, subject);
            set(GOOGLE_FORM.fields.message, note);
            set("fvv","1"); set("pageHistory","0"); set("fbzx", String(Date.now()));
            document.body.appendChild(gf); gf.submit(); sent=true;
            setTimeout(()=>{ try{ gf.remove(); }catch{} },1500);
          }catch{}

          if(!sent){
            try{
              const stash=JSON.parse(localStorage.getItem("dc_leads")||"[]");
              stash.push({ts:Date.now(),name,email,phone,subject,note,page:location.href});
              localStorage.setItem("dc_leads", JSON.stringify(stash));
            }catch{}
          }

          add("assistant", sent ? "Thanks — submitted! We’ll be in touch soon." : "Thanks — saved locally. We’ll reach out soon.");
          showToast(sent ? "Submitted" : "Saved");
          f.reset();
        });
      },0);
    }

    function addCTA(){
      const html = bubble("assistant", `
        <div class="dc-actions">
          <a class="dc-btn" href="${CONSULT_URL}" target="_blank" rel="noopener"
             style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;white-space:nowrap;line-height:1;min-height:40px;padding:8px 14px;">
            Book a consult
          </a>
        </div>
      `);
      addHTML(html);
    }

    function addContact(){
      const html=bubble("assistant", `
        <div>
          <div style="margin-bottom:6px"><strong>Contact</strong></div>
          <div>Email: <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a></div>
          <div>Company: <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
          <div>${FOUNDER_NAME}: <a href="${FOUNDER_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
        </div>
      `);
      addHTML(html);
    }

    // Knowledge & reply (unchanged except integrated CTA in “isHelp”)
    let lastTopic=null, regCtx={cls:null,region:null};
    const KB={/* ... your KB object exactly as before ... */};

    function reply(qRaw){
      const q=(qRaw||"").toLowerCase().trim();
      const has=(s,arr)=>arr.some(k=>s.includes(k));
      const emailMatch = qRaw && qRaw.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);

      const isHelp    = has(q,["help","support","connect","agent","human","talk","speak","contact","reach"]);
      // ... rest of your reply() logic exactly as in your last message ...

      // Integrated CTA branch:
      if (isHelp){
        if (!document.getElementById("dc-capture")) addCapture();
        return {
          html: `
            <div>
              I can connect you now. <strong>Book below</strong> or email
              <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a>.
              <div class="dc-actions" style="margin-top:8px">
                <a class="dc-btn" href="${CONSULT_URL}" target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;white-space:nowrap;line-height:1;min-height:40px;padding:8px 14px;">
                  Book a consult
                </a>
              </div>
            </div>
          `,
          capture:true,
          showContact:true
        };
      }

      // ... end of reply()
      return { text:"Happy to help. Is this about QMS, Regulatory, or AI? I can also connect you to a consultant.", capture:true };
    }

    // Initial prompt
    if (history.length){ render(); }
    else { add("assistant", `Hi — I'm ${BOT_NAME}. Ask a quick question or say contact if you want to reach a consultant.`); }

    // Welcome prompt (fixed continue)
    function showWelcomePrompt(){
      const existing=document.getElementById("dc-welcome"); if(existing) existing.remove();
      const hasUser=(history||[]).some(m=>m.role==="user");
      const msg = hasUser ? "Continue where we left off?" : "Are you looking for any help? I may be able to assist.";

      const actions = hasUser
        ? `<div class="dc-actions">
             <button class="dc-btn" type="button" data-act="continue">Continue</button>
             <button class="dc-btn secondary" type="button" data-act="clear">Clear</button>
             <button class="dc-btn secondary" type="button" data-act="close">No</button>
           </div>`
        : `<div class="dc-actions">
             <button class="dc-btn" type="button" data-act="yes">Yes</button>
             <button class="dc-btn secondary" type="button" data-act="clear">Clear</button>
             <button class="dc-btn secondary" type="button" data-act="close">No</button>
           </div>`;

      const tmp=document.createElement("div");
      tmp.innerHTML = bubble("assistant", `<div>${msg}</div>${actions}`);
      const node = tmp.firstElementChild;
      node.id = "dc-welcome";
      log.appendChild(node);
      log.scrollTop = log.scrollHeight;

      node.querySelectorAll("[data-act]").forEach(b=>{
        b.addEventListener("click", (e)=>{
          const act=e.currentTarget.getAttribute("data-act");
          if (act==="continue"){
            node.remove();
          } else if (act==="clear"){
            history=[]; save(); render();
            add("assistant","Great. Starting fresh. Ask a quick question or say contact if you want to reach a consultant.");
            showWelcomePrompt();
          } else if (act==="yes"){
            node.remove();
            add("assistant","Happy to help. Is this about QMS, Regulatory, or AI? I can also connect you to a consultant.");
          } else if (act==="close"){
            close();
          }
        });
      });
    }

    // Form submit
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const q=(input && input.value || "").trim();
      if(!q) return;
      add("user", q);
      if (input) input.value="";
      let r={};
      try { r = reply(q); } catch(err){
        console.error("dc-chat reply error", err);
        r = { text:"Sorry. I had trouble with that. Try again.", capture:false };
      }
      if (r.html) addHTML(r.html); else if (r.text) add("assistant", r.text);
      if (r.capture) addCapture();
      if (r.showCTA) addCTA();
      if (r.showContact) addContact();
    });

    // Open and show prompt
    setOpen(true);
    showWelcomePrompt();
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
</script>
