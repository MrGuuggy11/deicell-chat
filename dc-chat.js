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

    // --- Google Forms integration ---
    const GOOGLE_FORM = {
      action: "https://docs.google.com/forms/d/e/1FAIpQLSd-pxa0n6C1rZC0AExP8bc5VK-O6qDZWOyhHdqmy1ODVGUnNQ/formResponse",
      fields: {
        name:    "entry.511200028",   // Name
        email:   "entry.1678436901",  // Email
        phone:   "entry.1195889528",  // Phone Number
        subject: "entry.205543377",   // Subject
        message: "entry.1595874015"   // Message
      }
    };
    // --------------------------------

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
                      style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5"></textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button type="submit" class="dc-btn">Submit Info</button>
            <a href="mailto:${COMPANY_EMAIL}" class="dc-btn secondary">Email Us</a>
          </div>
        </form>
      `);
      addHTML(html);

      // Wire up submit
      setTimeout(()=>{
        const f=document.getElementById(id);
        if(!f) return;

        f.addEventListener("submit", async (e)=>{
          e.preventDefault();

          const fd = new FormData(f);
          const name    = (fd.get("name")    || "").toString().trim();
          const email   = (fd.get("email")   || "").toString().trim();
          const phone   = (fd.get("phone")   || "").toString().trim();
          const subject = (fd.get("subject") || "").toString().trim();
          const note    = (fd.get("note")    || "").toString().trim();

          let sent = false;

          // --- send to Google Forms ---
          if (GOOGLE_FORM.action){
            try{
              const params = new URLSearchParams();
              params.append(GOOGLE_FORM.fields.name,    name);
              params.append(GOOGLE_FORM.fields.email,   email);
              params.append(GOOGLE_FORM.fields.phone,   phone);
              params.append(GOOGLE_FORM.fields.subject, subject);
              params.append(GOOGLE_FORM.fields.message, note);

              // harmless extras some forms include
              params.append("fvv","1");
              params.append("pageHistory","0");
              params.append("fbzx", String(Date.now()));

              await fetch(GOOGLE_FORM.action, {
                method: "POST",
                mode: "no-cors", // can't read response, but Google records it
                body: params
              });
              sent = true;
            } catch(_) {}
          }
          // --------------------------------

          // Fallback: stash locally if not sent
          if(!sent){
            try{
              const stash = JSON.parse(localStorage.getItem("dc_leads") || "[]");
              stash.push({ ts:Date.now(), name, email, phone, subject, note, page: location.href });
              localStorage.setItem("dc_leads", JSON.stringify(stash));
            }catch(_){}
          }

          add("assistant", sent
            ? "Thanks — submitted! We’ll be in touch soon."
            : "Thanks — saved locally. We’ll reach out soon.");
          showToast(sent ? "Submitted" : "Saved");
          f.reset();
        });
      },0);
    }

    function addCTA(){
      const html = bubble("assistant", `
        <div class="dc-actions">
          <a class="dc-btn" href="${CONSULT_URL}" target="_blank" rel="noopener">Book a consult</a>
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

    // Knowledge and routing
    let lastTopic=null, regCtx={cls:null,region:null};
    const KB={
      nathan:`Nathan Jones is a regulatory and quality systems consultant and the Founder of DeiCell Systems. He helps biotech and medtech teams build inspection ready operations across GMP, ISO 13485, and ICH, bridging bench biology with scalable compliance from development through postmarket. Hands on with batch review, CAPA, labeling compliance, and USP <61>/<62>/<71> microbiology. Completing an MBA at Xavier and pursuing RAC through RAPS.`,
      deicell:`DeiCell Systems helps biotech and medtech innovators scale with precision. We provide regulatory, quality, and strategic consulting grounded in systems thinking and scientific rigor, from GxP compliant frameworks to microbiology informed compliance strategies, for early and growth stage teams.`,
      value:`Why DeiCell: risk based, right sized systems; traceable, audit ready documentation; microbiology aware controls; and pragmatic coaching so teams stay fast without breaking compliance.`,
      qms_intro:`QMS: right sized ISO 13485 architecture, doc control, training, CAPA, risk, change control, plus audit prep and stage appropriate SOPs.`,
      qms_startup:`For startups: lean, tiered QMS that scales with funding and maturity. We emphasize essentials like risk, doc control, and training, and deepen as you approach clinical or market milestones.`,
      reg_intro:`Regulatory: pathway and testing strategy, Pre Sub planning, submission authoring such as 510(k), De Novo, PMA, and labeling reviews aligned to FDA, ISO, and MDR.`,
      reg_class3_us:`US Class III: PMA strategy, Pre Sub questions, clinical evidence planning, design dossier structure, biocompatibility and statistics pointers, labeling checks, plus inspection readiness and traceability.`,
      ai_intro:`AI and ML: data governance, validation planning, model risk checks, and evidence packages. We pair regulatory insight with NLP assisted review for literature, PMS, and training datasets.`
    };

    function reply(qRaw){
      const q=(qRaw||"").toLowerCase().trim();
      const has=(s,arr)=>arr.some(k=>s.includes(k));
      const emailMatch = qRaw && qRaw.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);

      const isHelp    = has(q,["help","support","connect","agent","human","talk","speak","contact","reach"]);
      const askWhoNJ  = has(q,["who is nathan","nathan jones","founder"]) || q==="nathan";
      const askDei    = has(q,["what is deicell","about deicell","the company","tell me more about deicell","what is your company","more about deicell"]);
      const askWhy    = has(q,["why choose","why deicell","why should i choose"]);
      const askEmail  = has(q,["email","where do i add my email","submit my email","add my email"]);
      const askLinked = has(q,["linkedin"]);

      const qms       = has(q,["qms","iso","quality","document","sop","capa","risk","training"]);
      const reg       = has(q,["regulatory","fda","510k","510(k)","de novo","denovo","pma","submission","label"]);
      const ai        = has(q,["ai","ml","validation","bias","dataset","governance"]);
      const startup   = has(q,["startup","start up","early stage"]);
      const cls2      = has(q,["class 2","class ii"]);
      const cls3      = has(q,["class 3","class iii"]);
      const inUS      = has(q,[" us"," u.s"," usa"," united states"," fda"]) || q==="us";
      const inEU      = has(q,[" eu"," europe"," european union"," mdr"]);

      if (emailMatch){
        if (!document.getElementById("dc-capture")) addCapture();
        return { text:`Thanks, noted ${emailMatch[0]}. Add a note and hit Submit Info if you like.`, showCTA:true, showContact:true };
      }
      if (askWhoNJ){ lastTopic="nathan"; return { text:KB.nathan, showContact:true }; }
      if (askDei || has(q,["what do you do","tell me more about your company"])){
        lastTopic="deicell"; return { text:`${KB.deicell}\n\n${KB.value}`, showCTA:true, showContact:true };
      }
      if (askWhy){ lastTopic="deicell"; return { text:KB.value, showCTA:true, showContact:true }; }
      if (askEmail){
        if (!document.getElementById("dc-capture")) addCapture();
        return { html:`Use the form above or email <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a>.`, showCTA:true };
      }
      if (askLinked){
        return { html:`Company: <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a><br>${FOUNDER_NAME.split(",")[0]}: <a href="${FOUNDER_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a>` };
      }
      if (qms){ lastTopic="qms"; return { text:`${KB.qms_intro}\n\nWhat is your stage and target standard?` }; }
      if (reg){ lastTopic="regulatory"; regCtx={cls:null,region:null}; return { text:`${KB.reg_intro}\n\nWhat device class and region?` }; }
      if (ai){  lastTopic="ai"; return { text:`${KB.ai_intro}\n\nWhat model or use case are you qualifying?` }; }
      if (startup){
        if (lastTopic==="qms" || lastTopic===null){ lastTopic="qms"; return { text:KB.qms_startup, capture:true, showCTA:true }; }
        if (lastTopic==="regulatory"){ return { text:`For early teams, clarify intended use and claims, line up biocomp and bench testing, and plan a Pre Sub. We can draft questions and outline evidence so you do not over or under test.`, capture:true, showCTA:true }; }
        if (lastTopic==="ai"){ return { text:`For AI startups, define data lineage, validation acceptance criteria, and risk controls up front. We can help assemble an evidence package you can reuse for audits.`, capture:true, showCTA:true }; }
      }
      if (lastTopic==="regulatory"){
        if (cls2) regCtx.cls="Class II";
        if (cls3) regCtx.cls="Class III";
        if (inUS) regCtx.region="US";
        if (inEU) regCtx.region="EU";

        if (regCtx.cls && regCtx.region){
          const both = regCtx.cls + " • " + regCtx.region;
          if (regCtx.cls==="Class III" && regCtx.region==="US"){
            return { text:`${both}: ${KB.reg_class3_us}`, capture:true, showCTA:true, showContact:true };
          }
          if (regCtx.cls==="Class II" && regCtx.region==="US"){
            return { text:`${both}: Likely 510(k). We will align intended use and claims, evaluate predicate strategy, scope bench and biocomp testing, and prep labeling for submission. We can also draft a focused Pre Sub if novel.`, capture:true, showCTA:true, showContact:true };
          }
          if (regCtx.region==="EU"){
            return { text:`${both}: Plan MDR conformity with the right GSPRs, clinical evaluation strategy, and PMS or PMCF. We can outline technical documentation and gap check labeling.`, capture:true, showCTA:true, showContact:true };
          }
        }
        if (regCtx.cls && !regCtx.region) return { text:`Got it (${regCtx.cls}). Which region, US or EU?` };
        if (!regCtx.cls && (inUS||inEU)) return { text:`Region set to ${regCtx.region||"US or EU"}. What device class, II or III?` };
      }
      if (has(q,["tell me more","more info","details","elaborate","expand"])){
        if (lastTopic==="nathan")    return { text:KB.nathan, showContact:true };
        if (lastTopic==="deicell")   return { text:`${KB.deicell}\n\n${KB.value}`, showCTA:true, showContact:true };
        if (lastTopic==="qms")       return { text:`${KB.qms_intro}\n\n${KB.qms_startup}`, capture:true, showCTA:true };
        if (lastTopic==="regulatory")return { text:KB.reg_intro, capture:true, showCTA:true };
        if (lastTopic==="ai")        return { text:KB.ai_intro, capture:true, showCTA:true };
      }
      if (isHelp){
        if (!document.getElementById("dc-capture")) addCapture();
        return { html:`I can connect you now. Use the inquiry form or email <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a>.`, capture:true, showCTA:true, showContact:true };
      }
      return { text:"Happy to help. Is this about QMS, Regulatory, or AI? I can also connect you to a consultant.", capture:true };
    }

    // Initial prompt
    if (history.length){ render(); }
    else { add("assistant","Hi. Ask a quick question or say contact if you want to reach a consultant."); }

    function hasUserInput(hist){ return (hist||[]).some(m=>m.role==="user"); }
    function showWelcomePrompt(){
      const old=document.getElementById("dc-welcome"); if(old) old.remove();
      const hasUser=hasUserInput(history);
      const wrap=document.createElement("div"); wrap.id="dc-welcome";

      const msg = hasUser ? "Continue where we left off?" : "Are you looking for any help? I may be able to assist.";
      const actions = hasUser
        ? `<div class="dc-actions">
             <button class="dc-btn" data-act="continue">Continue</button>
             <button class="dc-btn secondary" data-act="clear">Clear</button>
             <button class="dc-btn secondary" data-act="close">No</button>
           </div>`
        : `<div class="dc-actions">
             <button class="dc-btn" data-act="yes">Yes</button>
             <button class="dc-btn secondary" data-act="clear">Clear</button>
             <button class="dc-btn secondary" data-act="close">No</button>
           </div>`;

      wrap.innerHTML = bubble("assistant", `<div>${msg}</div>${actions}`);
      log.appendChild(wrap.firstChild); log.scrollTop=log.scrollHeight;

      log.querySelectorAll('[data-act]').forEach(b=>{
        b.addEventListener('click', (e)=>{
          const act=e.currentTarget.getAttribute('data-act');
          if (act==="continue"){
            const p=document.getElementById("dc-welcome"); if(p) p.remove();
          } else if (act==="clear"){
            history=[]; save(); render();
            add("assistant","Great. Starting fresh. Ask a quick question or say contact if you want to reach a consultant.");
            showWelcomePrompt();
          } else if (act==="yes"){
            const p=document.getElementById("dc-welcome"); if(p) p.remove();
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
