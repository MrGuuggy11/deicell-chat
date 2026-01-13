(function(){
  "use strict";

  // Prevent double-init if Carrd injects twice
  if (window.__DC_CHAT_INIT__) return;
  window.__DC_CHAT_INIT__ = true;

  function start(){
    // Block on coarse pointers (your original behavior)
    try {
      if (window.matchMedia && window.matchMedia("(hover:none) and (pointer:coarse)").matches) return;
    } catch(e){}

    // ------------------------------
    // Config
    // ------------------------------
    const ASSISTANT_NAME   = "Mendel AI";
    const LOGO_URL         = "https://deicell.com/assets/images/image02.png?v=66696e40";
    const CONSULT_URL      = "https://deicell.com/#contact";
    const COMPANY_EMAIL    = "NJONES@DEICELL.COM";
    const COMPANY_LINKEDIN = "https://www.linkedin.com/company/deicell/";
    const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/ncjbio/";
    const FOUNDER_NAME     = "Nathan Jones, Founder & Principal Consultant";

    const LS = { hist: "dc_chat_hist_v15" }; // bump version

    // Google Forms integration
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

    // ------------------------------
    // Ensure root exists
    // ------------------------------
    let root = document.getElementById("dc-chat-root");
    if(!root){
      root = document.createElement("div");
      root.id = "dc-chat-root";
      root.setAttribute("aria-hidden","true");
      document.body.appendChild(root);
    }

    // If a previous version left markup behind, don't duplicate UI
    if (document.getElementById("dc-chat-toggle") || document.getElementById("dc-chat-panel")) {
      return;
    }

    // ------------------------------
    // Helpers
    // ------------------------------
    const esc = (s)=> String(s)
      .replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))
      .replace(/\n/g,"<br>");

    const showToast = (msg)=>{
      const t = document.getElementById("dc-toast");
      if(!t) return;
      t.textContent = msg || "Saved";
      t.classList.add("show");
      setTimeout(()=>t.classList.remove("show"), 1400);
    };

    // ------------------------------
    // Launcher button
    // ------------------------------
    const btn = document.createElement("button");
    btn.id = "dc-chat-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label","Open chat");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 15.5c1.1-1 2-2.6 2-4.5C22 7 18.4 4 13.9 4 9.5 4 6 7 6 11c0 .7.1 1.3.3 1.9-1.5 1.2-3.1 2.1-4.3 2.4 1.5 0 3.6-.4 5.2-1.1 1.5 1.2 3.6 1.8 5.7 1.8.6 0 1.1-.1 1.7-.2.9.6 2.9 1.5 5.4 1.2-.8-.5-1.7-1.2-2-1.8z" fill="currentColor" opacity=".95"/>
      </svg>`;
    root.appendChild(btn);

    // ------------------------------
    // Panel
    // ------------------------------
    const panel = document.createElement("div");
    panel.id = "dc-chat-panel";
    panel.innerHTML = `
      <div id="dc-header">
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${LOGO_URL}" alt="DeiCell"><span>${ASSISTANT_NAME}</span>
        </div>
        <button id="dc-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div id="dc-log" class="dc-watermark"></div>
      <form id="dc-form" autocomplete="off">
        <input id="dc-input" type="text" placeholder="Ask about QMS, Regulatory, or AI..." autocomplete="off">
        <button id="dc-send" type="submit">Send</button>
      </form>
      <div id="dc-toast">Saved</div>
    `;
    root.appendChild(panel);

    const log      = document.getElementById("dc-log");
    const closeBtn = document.getElementById("dc-close");
    const form     = document.getElementById("dc-form");
    const input    = document.getElementById("dc-input");

    if (log) log.style.setProperty("--dc-watermark-url", `url('${LOGO_URL}')`);

    // ------------------------------
    // Open / close
    // ------------------------------
    const setOpen = (open)=>{
      panel.style.display = open ? "flex" : "none";
      try { root.setAttribute("aria-hidden", open ? "false" : "true"); } catch(e){}
      if (open) setTimeout(()=>{ try{ input && input.focus(); }catch(e){} }, 0);
    };

    const toggle = ()=> setOpen(panel.style.display !== "flex");
    const close  = ()=> setOpen(false);

    btn.addEventListener("click", toggle);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", e=>{ if(e.key === "Escape") close(); });

    // ------------------------------
    // Chat history
    // ------------------------------
    let history = [];
    try { history = JSON.parse(localStorage.getItem(LS.hist) || "[]") || []; } catch(e){ history = []; }

    const bubble = (role, html) =>
      `<div class="dc-msg ${role === 'user' ? 'user' : 'assistant'}"><div class="bubble">${html}</div></div>`;

    const render = ()=>{
      try{
        log.innerHTML = history.map(m => bubble(m.role, m.html)).join("");
        log.scrollTop = log.scrollHeight;
      }catch(e){}
    };

    const save = ()=>{ try{ localStorage.setItem(LS.hist, JSON.stringify(history)); }catch(e){} };

    const add = (role, text)=>{
      history.push({ role, html: esc(text) });
      save(); render();
    };

    const addHTML = (html)=>{
      history.push({ role: "assistant", html });
      save(); render();
    };

    // ------------------------------
    // Components
    // ------------------------------
    function addCapture(){
      if (document.getElementById("dc-capture")) return;

      const id = "dc-capture";
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
        const f = document.getElementById(id);
        if(!f) return;

        f.addEventListener("submit", (e)=>{
          e.preventDefault();

          const fd = new FormData(f);
          const name    = (fd.get("name")    || "").toString().trim();
          const email   = (fd.get("email")   || "").toString().trim();
          const phone   = (fd.get("phone")   || "").toString().trim();
          const subject = (fd.get("subject") || "").toString().trim();
          const note    = (fd.get("note")    || "").toString().trim();

          // Simple validity check: respect browser validation too
          if (!f.checkValidity()) {
            try { f.reportValidity(); } catch(e){}
            showToast("Check fields");
            return;
          }

          let sent = false;
          try{
            const targetName = "dc-gform-target";
            let iframe = document.getElementById(targetName);
            if(!iframe){
              iframe = document.createElement("iframe");
              iframe.id = targetName;
              iframe.name = targetName;
              iframe.style.display = "none";
              document.body.appendChild(iframe);
            }

            const gf = document.createElement("form");
            gf.action = GOOGLE_FORM.action;
            gf.method = "POST";
            gf.target = targetName;
            gf.style.display = "none";

            const set = (n,v)=>{
              const i = document.createElement("input");
              i.type = "hidden"; i.name = n; i.value = v;
              gf.appendChild(i);
            };

            set(GOOGLE_FORM.fields.name, name);
            set(GOOGLE_FORM.fields.email, email);
            set(GOOGLE_FORM.fields.phone, phone);
            set(GOOGLE_FORM.fields.subject, subject);
            set(GOOGLE_FORM.fields.message, note);
            set("fvv","1"); set("pageHistory","0"); set("fbzx", String(Date.now()));

            document.body.appendChild(gf);
            gf.submit();
            sent = true;

            setTimeout(()=>{ try{ gf.remove(); }catch(e){} }, 1500);
          }catch(e){}

          if(!sent){
            try{
              const stash = JSON.parse(localStorage.getItem("dc_leads") || "[]");
              stash.push({ ts: Date.now(), name, email, phone, subject, note, page: location.href });
              localStorage.setItem("dc_leads", JSON.stringify(stash));
            }catch(e){}
          }

          add("assistant", sent ? "Thanks, submitted. We will be in touch soon." : "Thanks, saved locally. We will reach out soon.");
          showToast(sent ? "Submitted" : "Saved");
          try { f.reset(); } catch(e){}
        });
      }, 0);
    }

    function addCTA(){
      const html = bubble("assistant", `
        <div class="dc-actions">
          <a class="dc-btn"
             href="${CONSULT_URL}"
             target="_blank"
             rel="noopener"
             style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:40px;padding:0 14px;max-width:100%;text-decoration:none;white-space:nowrap;line-height:1;overflow:hidden;text-overflow:ellipsis;">
            Book a consult
          </a>
        </div>
      `);
      addHTML(html);
    }

    function addContact(){
      const html = bubble("assistant", `
        <div>
          <div style="margin-bottom:6px"><strong>Contact</strong></div>
          <div>Email: <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a></div>
          <div>Company: <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
          <div>${FOUNDER_NAME}: <a href="${FOUNDER_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
        </div>
      `);
      addHTML(html);
    }

    // ------------------------------
// Knowledge + smart routing (safe)
// ------------------------------
// Failsafe: if routing breaks, widget still works
let reply = function(){
  return { text: "Chat is loading. Please try again." };
};

try {
  const SS = { state: "dc_chat_state_v2" };
  let state = { flow: null, step: 0, topic: null, reg: { cls: null, region: null, modality: null }, stage: null, goal: null, intendedUse: null };
  try { state = Object.assign(state, JSON.parse(sessionStorage.getItem(SS.state) || "{}")); } catch(e){}
  const saveState = ()=>{ try{ sessionStorage.setItem(SS.state, JSON.stringify(state)); }catch(e){} };

  const KB2 = {
    identity:
      "DeiCell Systems helps biotech and medtech teams build inspection-ready operations with right-sized, traceable quality systems and regulatory execution.",
    founder:
      "Nathan Jones is the Founder & Principal Consultant of DeiCell Systems. He focuses on inspection readiness, ISO 13485-aligned QMS architecture, CAPA discipline, labeling/submission support, and microbiology-aware controls (including USP <61>/<62>/<71> contexts) for early and growth-stage teams.",
    promise:
      "The goal is to keep teams fast without creating audit debt: pragmatic systems, defensible decisions, and evidence that holds up under scrutiny."
  };

  const KW = {
    contact: ["contact","reach","email","call","talk","human","agent","consult","book","meeting"],
    about: ["about","who are you","what is deicell","what do you do","deicell"],
    founder: ["nathan","founder","who is nathan","your background","experience"],
    why: ["why","why choose","why deicell","different","value","advantage"],
    qms: ["qms","iso","13485","quality system","sop","doc control","document control","training","capa","deviation","change control","risk","audit","inspection"],
    reg: ["regulatory","fda","510k","510(k)","de novo","denovo","pma","submission","label","labeling","mdr","notified body","claims","intended use","pre-sub","presub","pre sub"],
    ai: ["ai","ml","machine learning","samd","software as a medical device","embedded ai","model","dataset","bias","validation","governance","samd"],
    more: ["more","details","elaborate","expand","tell me more"]
  };

  const norm = (s)=> (s || "").toLowerCase().replace(/\s+/g," ").trim();
  const hasAny = (s, list)=> list.some(k => s.includes(k));

  function extract(qRaw){
    const q = norm(qRaw);

    const region =
      hasAny(q, [" eu"," europe"," mdr"," european"]) ? "EU" :
      hasAny(q, [" us"," u.s"," usa"," united states"," fda"]) ? "US" : null;

    const cls =
      hasAny(q, ["class iii","class 3"," class iii"," class 3"]) ? "Class III" :
      hasAny(q, ["class ii","class 2"," class ii"," class 2"]) ? "Class II" : null;

    const stage =
      hasAny(q, ["postmarket","commercial","launched"]) ? "postmarket" :
      hasAny(q, ["clinical","trial","ide","pivotal"]) ? "clinical" :
      hasAny(q, ["preclinical","r&d","prototype","bench"]) ? "preclinical" :
      hasAny(q, ["seed","series a","startup","early stage","early"]) ? "early" : null;

    const modality =
      hasAny(q, ["ivd","in vitro","diagnostic"]) ? "IVD" :
      hasAny(q, ["implant"]) ? "implant" :
      hasAny(q, ["samd","software as a medical device","software"]) ? "SaMD" :
      hasAny(q, ["embedded","embedded ai","on device","edge","firmware"]) ? "Embedded" :
      hasAny(q, ["ai","ml","machine learning","model"]) ? "AI/ML" : null;

    const goal =
      hasAny(q, ["audit","inspection","inspection ready","audit ready"]) ? "audit readiness" :
      hasAny(q, ["submission","510k","pma","de novo","presub","pre-sub","pre sub"]) ? "submission" :
      hasAny(q, ["qms","iso","13485","sop","capa","doc control","document control"]) ? "qms build" :
      null;

    return { q, region, cls, stage, modality, goal };
  }

  function scoreIntent(q){
    const scores = { contact:0, about:0, founder:0, why:0, qms:0, reg:0, ai:0, more:0, unknown:0 };

    if (hasAny(q, KW.contact)) scores.contact += 4;
    if (hasAny(q, KW.about))   scores.about   += 3;
    if (hasAny(q, KW.founder)) scores.founder += 3;
    if (hasAny(q, KW.why))     scores.why     += 2;

    if (hasAny(q, KW.qms))     scores.qms     += 4;
    if (hasAny(q, KW.reg))     scores.reg     += 4;
    if (hasAny(q, KW.ai))      scores.ai      += 4;

    if (hasAny(q, KW.more))    scores.more    += 1;

    if (state.topic === "qms") scores.qms += 1;
    if (state.topic === "reg") scores.reg += 1;
    if (state.topic === "ai")  scores.ai  += 1;

    let best = "unknown", bestV = -1;
    Object.keys(scores).forEach(k => { if (scores[k] > bestV){ bestV = scores[k]; best = k; } });
    return best;
  }

  function nextQuestionFor(topic){
    if (topic === "qms") return "What stage are you in (early, preclinical, clinical, postmarket) and what standard or pressure is driving this (ISO 13485, FDA QSR, investor diligence, upcoming audit)?";
    if (topic === "reg") return "What region (US or EU) and device class (II or III)? If you know the modality (IVD, implant, SaMD), include that too.";
    if (topic === "ai")  return "Is this SaMD or embedded AI, and what’s the intended use in one sentence? Also, what’s your main validation constraint (data volume, labeling, drift, bias risk, timeline)?";
    return "What are you building, and what deadline or pressure is forcing the decision right now?";
  }

  function handleRegFlow(info){
    if (state.flow !== "reg_triage"){
      state.flow = "reg_triage";
      state.step = 0;
      state.topic = "reg";
    }

    if (info.region) state.reg.region = info.region;
    if (info.cls) state.reg.cls = info.cls;
    if (info.modality) state.reg.modality = info.modality;
    if (info.stage) state.stage = info.stage;
    if (info.goal) state.goal = info.goal;

    if (!state.reg.region || !state.reg.cls){
      saveState();
      return { text: "To route correctly, I need two inputs: region (US or EU) and device class (II or III).", capture: false };
    }

    if (state.step < 1){
      state.step = 1; saveState();
      return { text: `Got it: ${state.reg.cls} • ${state.reg.region}. What’s the modality (IVD, implant, SaMD) and intended use in one sentence?`, capture: false };
    }

    const both = `${state.reg.cls} • ${state.reg.region}`;
    let plan = "";

    if (state.reg.region === "US" && state.reg.cls === "Class II"){
      plan = `${both}: likely 510(k) unless claims are novel. Next sequence: intended use/claims discipline, predicate strategy, bench/biocomp/software test plan, labeling consistency, and a short Pre-Sub if novelty or clinical questions exist.`;
    } else if (state.reg.region === "US" && state.reg.cls === "Class III"){
      plan = `${both}: PMA-style evidence planning. Emphasis: clinical strategy, traceability, and inspection-ready documentation long before submission.`;
    } else if (state.reg.region === "EU"){
      plan = `${both}: MDR route. Start with GSPR mapping, clinical evaluation strategy, PMS/PMCF planning, and technical documentation structure aligned to claims.`;
    } else {
      plan = `${both}: I can outline a stage-appropriate evidence path once I know modality and intended use.`;
    }

    state.step = 2; saveState();
    return { text: `${plan}\n\nIf you tell me your stage (early, preclinical, clinical, postmarket), I’ll narrow it to a minimum viable evidence package.`, showCTA: true, showContact: true, capture: true };
  }

  function handleQmsFlow(info){
    state.flow = "qms_triage";
    state.topic = "qms";
    if (info.stage) state.stage = info.stage;
    if (info.goal) state.goal = info.goal;
    saveState();

    const stage = state.stage || "your current stage";
    const msg =
      `QMS, right-sized: control without bureaucracy.\n\nAt ${stage}, the highest-leverage core is typically: document control, training, deviation/nonconformance handling, CAPA, change control, and risk management. Then scale design controls, supplier controls, validation, and internal audits as milestones demand.\n\nWhat milestone is driving this (investor diligence, audit, submission, scale-up, postmarket complaints)?`;

    return { text: msg, showCTA: true };
  }

  // ------------------------------
  // AI flow (loop-proof)
  // ------------------------------
  function parseAiKind(q){
    const s = norm(q);
    if (hasAny(s, ["samd","sa md","software as a medical device"])) return "SaMD";
    if (hasAny(s, ["embedded","embedded ai","on device","edge","firmware"])) return "Embedded";
    return null;
  }

  function parseIntendedUse(qRaw){
    const s = (qRaw || "").trim();
    const w = s.split(/\s+/).filter(Boolean).length;
    if (w >= 7) return s;
    if (/\b(to|for|so that|in order to)\b/i.test(s) && w >= 5) return s;
    return null;
  }

  function handleAiFlow(info, qRaw){
    if (state.flow !== "ai_triage"){
      state.flow = "ai_triage";
      state.step = 0;
      state.topic = "ai";
    }

    if (info.stage) state.stage = info.stage;
    if (info.goal) state.goal = info.goal;

    // STEP 0: determine kind (SaMD vs Embedded)
    if (state.step === 0){
      const kind = parseAiKind(qRaw) || (info.modality === "SaMD" ? "SaMD" : (info.modality === "Embedded" ? "Embedded" : null));
      if (kind){
        state.reg.modality = kind;
        state.step = 1;
        saveState();
        return {
          text: `Got it: ${kind}. What’s the intended use in one sentence (who it helps, what decision/action it supports, and the setting)?`,
          showCTA: true
        };
      }

      saveState();
      return {
        text:
          "AI/ML: the fastest wins come from disciplined evidence.\n\n" +
          "Start with data lineage, acceptance criteria tied to intended use, validation design (splits, drift, edge cases), and risk controls (bias, failure modes, human factors if relevant).\n\n" +
          "First: is this SaMD (software is the product) or embedded AI (model inside a device/system)?",
        showCTA: true
      };
    }

    // STEP 1: capture intended use
    if (state.step === 1){
      const intended = parseIntendedUse(qRaw);
      if (!intended){
        saveState();
        return {
          text:
            "One sentence is enough. Use this format:\n" +
            "“Helps [user] do [decision/action] for [condition/workflow] in [setting].”\n\n" +
            "What’s yours?",
          showCTA: true
        };
      }

      state.intendedUse = intended;
      state.step = 2;
      saveState();

      const kind = state.reg.modality || "AI/ML";
      return {
        text:
          `Thanks. Based on ${kind} and your intended use:\n\n` +
          "Next best step is to lock three things before anyone writes code:\n" +
          "1) Decision + risk framing (what harm occurs if it’s wrong, and what’s the fallback)\n" +
          "2) Data plan (source, labeling method, inclusion/exclusion, leakage controls)\n" +
          "3) Validation plan (targets, subgroup checks, drift monitoring, change-control triggers)\n\n" +
          "What’s your biggest constraint: data volume, labeling quality, bias exposure, drift risk, or timeline?",
        showCTA: true,
        showContact: true,
        capture: true
      };
    }

    // STEP 2+: constraint-driven guidance
    const q = norm(qRaw);
    const constraint =
      hasAny(q, ["data","dataset","volume","small data"]) ? "data" :
      hasAny(q, ["label","labeling","annotation"]) ? "labeling" :
      hasAny(q, ["bias","subgroup","fairness"]) ? "bias" :
      hasAny(q, ["drift","monitor","performance decay"]) ? "drift" :
      hasAny(q, ["timeline","deadline","fast","quick"]) ? "timeline" :
      null;

    if (!constraint){
      saveState();
      return { text: "What’s the biggest constraint: data volume, labeling quality, bias exposure, drift risk, or timeline?", showCTA: true };
    }

    const kind = state.reg.modality || "AI/ML";
    const iu = state.intendedUse ? `Intended use: ${state.intendedUse}\n\n` : "";

    const guidance = {
      data:
        "Data volume: prioritize a defensible sampling plan, leakage checks, and confidence intervals. If N is small, tighten claims and define a human-in-the-loop fallback.",
      labeling:
        "Labeling: write a labeling SOP, set inter-rater agreement targets, define adjudication rules, and maintain a gold-standard subset. This is where most AI efforts quietly fail.",
      bias:
        "Bias/subgroup: predefine subgroups, minimum subgroup N targets, acceptable performance gaps, and mitigation steps. Decide this before model selection.",
      drift:
        "Drift: define monitoring metrics, alert thresholds, revalidation cadence, and what changes trigger regression testing under change control.",
      timeline:
        "Timeline: cut scope by tightening intended use and claims. Then build a smallest defensible evidence package: dataset provenance, one locked validation protocol, and a change-control plan."
    }[constraint];

    saveState();
    return {
      text:
        `${iu}${kind} focus: ${guidance}\n\n` +
        "If you want, say “template” and I’ll show a one-page AI validation plan outline you can reuse for customers and auditors.",
      showCTA: true,
      showContact: true,
      capture: true
    };
  }

  reply = function reply(qRaw){
    const info = extract(qRaw);
    const q = info.q;

    const emailMatch = qRaw && qRaw.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    if (emailMatch){
      if (!document.getElementById("dc-capture")) addCapture();
      return { text: `Noted ${emailMatch[0]}. Add a short message and hit Submit Info so I can route it correctly.`, showCTA: true, showContact: true };
    }

    const intent = scoreIntent(q);

    // Keep flows “sticky” unless clear pivot
    const inRegFlow = (state.flow === "reg_triage");
    const inAiFlow  = (state.flow === "ai_triage");
    const allowStay = (intent === "more" || intent === "contact");

    if (inRegFlow && (intent === "reg" || allowStay)) return handleRegFlow(info);
    if (inAiFlow  && (intent === "ai"  || allowStay)) return handleAiFlow(info, qRaw);

    if (intent === "contact"){
      if (!document.getElementById("dc-capture")) addCapture();
      return {
        html: `
          <div>
            If you want to talk with a consultant, the fastest path is booking directly or emailing.
            <div class="dc-actions" style="margin-top:8px">
              <a class="dc-btn" href="${CONSULT_URL}" target="_blank" rel="noopener"
                 style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;white-space:nowrap;line-height:1;min-height:40px;padding:8px 14px;">
                Book a consult
              </a>
            </div>
            <div style="margin-top:8px">
              Email: <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a>
            </div>
          </div>
        `,
        capture: true,
        showContact: true
      };
    }

    if (intent === "about"){
      state.flow = null; state.topic = "about"; state.step = 0; saveState();
      return { text: `${KB2.identity}\n\n${KB2.promise}`, showCTA: true, showContact: true };
    }

    if (intent === "founder"){
      state.flow = null; state.topic = "founder"; state.step = 0; saveState();
      return { text: KB2.founder, showContact: true };
    }

    if (intent === "why"){
      state.flow = null; state.topic = "why"; state.step = 0; saveState();
      return { text: `${KB2.promise}\n\nTell me your stage and milestone pressure, and I’ll describe minimum viable compliance for your situation.`, showCTA: true };
    }

    if (intent === "qms") return handleQmsFlow(info);
    if (intent === "ai")  return handleAiFlow(info, qRaw);
    if (intent === "reg") return handleRegFlow(info);

    if (intent === "more"){
      if (state.topic === "qms") return { text: "I can outline a 30-day implementation map. What milestone and timeline are you working against?", showCTA: true };
      if (state.topic === "reg") return { text: "I can outline a focused evidence package and Pre-Sub question framework. Region and class first: US/EU and II/III.", showCTA: true };
      if (state.topic === "ai")  return { text: "I can outline a validation plan template. What’s the intended use in one sentence?", showCTA: true };
      return { text: "Tell me what you’re building and what deadline is forcing the decision, and I’ll give a specific path rather than generic advice." };
    }

    state.flow = null; state.topic = null; state.step = 0; saveState();
    return { text: `I can help best if I know the domain. ${nextQuestionFor(null)}`, capture: false };
  };

} catch (e) {
  console.error("dc-chat routing failed:", e);
  reply = function(){
    return { text: "Chat is temporarily unavailable. Please use Contact to reach us.", showCTA: true, showContact: true, capture: true };
  };
}

// ------------------------------
// Initial prompt
// ------------------------------
if (history.length) render();
else add("assistant",`Hi, I'm ${ASSISTANT_NAME}. What can I help with today? Ask about QMS, Regulatory, or AI. You can also say contact to reach a consultant.`);

// ------------------------------
// Submit handler
// ------------------------------
if (form){
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = (input.value || "").trim();
    if(!q) return;

    add("user", q);
    input.value = "";

    let r = {};
    try { r = reply(q) || {}; }
    catch(err){ console.error("dc-chat reply error:", err); r = { text: "Something went wrong. Try again or say contact." }; }

    if (r.text) add("assistant", r.text);
    if (r.html) addHTML(r.html);
    if (r.capture) addCapture();
    if (r.showCTA) addCTA();
    if (r.showContact) addContact();
  });
}

function showWelcomePrompt(){
  const existing = document.getElementById("dc-welcome");
  if(existing) existing.remove();

  const hasUser = (history || []).some(m => m.role === "user");
  const msg = hasUser ? "Want to continue where we left off?" : "Looking for help with QMS, Regulatory, or AI?";

  const actions = hasUser
    ? `<div class="dc-actions">
         <button class="dc-btn" type="button" data-act="continue">Continue</button>
         <button class="dc-btn secondary" type="button" data-act="clear">Clear</button>
         <button class="dc-btn secondary" type="button" data-act="close">Close</button>
       </div>`
    : `<div class="dc-actions">
         <button class="dc-btn" type="button" data-act="yes">Yes</button>
         <button class="dc-btn secondary" type="button" data-act="clear">Clear</button>
         <button class="dc-btn secondary" type="button" data-act="close">Close</button>
       </div>`;

  const tmp = document.createElement("div");
  tmp.innerHTML = bubble("assistant", `<div>${msg}</div>${actions}`);
  const node = tmp.firstElementChild;
  node.id = "dc-welcome";
  log.appendChild(node);
  log.scrollTop = log.scrollHeight;

  node.querySelectorAll("[data-act]").forEach(b=>{
    b.addEventListener("click", (e)=>{
      const act = e.currentTarget.getAttribute("data-act");
      if (act === "continue"){
        node.remove();
      } else if (act === "clear"){
        history = []; save(); render();
        add("assistant",`Great. Starting fresh. I'm ${ASSISTANT_NAME}. Ask a quick question or say contact if you want to reach a consultant.`);
        showWelcomePrompt();
      } else if (act === "yes"){
        node.remove();
        add("assistant","Happy to help! Is this about QMS, Regulatory, or AI? I can also connect you with a consultant.");
      } else if (act === "close"){
        close();
      }
    });
  });
}

    // Open chat on startup and show welcome prompt
    setOpen(true);
    setTimeout(showWelcomePrompt, 0);
  }

  // Run when DOM is ready
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
