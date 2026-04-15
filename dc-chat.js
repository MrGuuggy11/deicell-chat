(function () {
  "use strict";

  // Prevent double-init if Carrd injects twice
  if (window.__DC_CHAT_INIT__) return;
  window.__DC_CHAT_INIT__ = true;

  function start() {
    // Preserve coarse-pointer block
    try {
      if (
        window.matchMedia &&
        window.matchMedia("(hover:none) and (pointer:coarse)").matches
      ) {
        return;
      }
    } catch (e) {}

    // ------------------------------
    // Config
    // ------------------------------
    const ASSISTANT_NAME = "Mendel AI";
    const LOGO_URL = "https://deicell.com/assets/images/image02.png?v=66696e40";
    const CONSULT_URL = "https://deicell.com/#contact";
    const COMPANY_EMAIL = "NJONES@DEICELL.COM";
    const COMPANY_LINKEDIN = "https://www.linkedin.com/company/deicell/";
    const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/ncjbio/";
    const FOUNDER_NAME = "Nathan Jones, Founder & Principal Consultant";

    const LS = {
      hist: "dc_chat_hist_v22"
    };

    const SS = {
      engine: "dc_chat_engine_v22"
    };

    const GOOGLE_FORM = {
      action:
        "https://docs.google.com/forms/d/e/1FAIpQLSd-pxa0n6C1rZC0AExP8bc5VK-O6qDZWOyhHdqmy1ODVGUnNQ/formResponse",
      fields: {
        name: "entry.511200028",
        email: "entry.1678436901",
        phone: "entry.1195889528",
        subject: "entry.205543377",
        message: "entry.1595874015"
      }
    };

    const WEBAPP_URL =
      "https://script.google.com/macros/s/AKfycbzsFDJWMft9PSHPyAGoFs5CljdxHkxlIZMBHm71rLIgQjNdWK9PKdLWEZNbX6A1dZt0/exec";

    // ------------------------------
    // Ensure root exists
    // ------------------------------
    let root = document.getElementById("dc-chat-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "dc-chat-root";
      root.setAttribute("aria-hidden", "true");
      document.body.appendChild(root);
    }

    if (
      document.getElementById("dc-chat-toggle") ||
      document.getElementById("dc-chat-panel")
    ) {
      return;
    }

    // ------------------------------
    // Helpers
    // ------------------------------
    const esc = (s) =>
      String(s)
        .replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))
        .replace(/\n/g, "<br>");

    const escAttr = (s) =>
      String(s).replace(/[&<>"]/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[c]));

    const escTextarea = (s) =>
      String(s).replace(/[&<>]/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
      }[c]));

    const stripHtml = (s) =>
      String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    const showToast = (msg) => {
      const t = document.getElementById("dc-toast");
      if (!t) return;
      t.textContent = msg || "Saved";
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 1400);
    };

    const norm = (s) =>
      String(s || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const includesAny = (text, list) => {
      const t = norm(text);
      return list.some((k) => t.includes(norm(k)));
    };

    const firstEmail = (s) => {
      const m = String(s || "").match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      return m ? m[0] : null;
    };

    const numberWordMap = {
      zero: "0",
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10"
    };

    const safeNumberWordToDigit = (s) => {
      const t = norm(s);
      return numberWordMap[t] || s;
    };

    const cleanSentence = (s) =>
      String(s || "")
        .replace(/\s+/g, " ")
        .trim();

    // ------------------------------
    // Launcher button
    // ------------------------------
    const btn = document.createElement("button");
    btn.id = "dc-chat-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Open chat");
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
        <input id="dc-input" type="text" placeholder="Describe your manufacturing, audit, diligence, or QMS pressure..." autocomplete="off">
        <button id="dc-send" type="submit">Send</button>
      </form>
      <div id="dc-toast" style="position:absolute;left:50%;transform:translateX(-50%);bottom:96px;z-index:9999;pointer-events:none;">Saved</div>
    `;
    root.appendChild(panel);

    try {
      if (window.getComputedStyle && window.getComputedStyle(panel).position === "static") {
        panel.style.position = "relative";
      }
    } catch (e) {}

    const log = document.getElementById("dc-log");
    const closeBtn = document.getElementById("dc-close");
    const form = document.getElementById("dc-form");
    const input = document.getElementById("dc-input");

    if (log) log.style.setProperty("--dc-watermark-url", `url('${LOGO_URL}')`);

    // ------------------------------
    // Open / close
    // ------------------------------
    const setOpen = (open) => {
      panel.style.display = open ? "flex" : "none";
      try {
        root.setAttribute("aria-hidden", open ? "false" : "true");
      } catch (e) {}
      if (open) {
        setTimeout(() => {
          try {
            input && input.focus();
          } catch (e) {}
        }, 0);
      }
    };

    const toggle = () => setOpen(panel.style.display !== "flex");
    const close = () => setOpen(false);

    btn.addEventListener("click", toggle);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // ------------------------------
    // Chat history
    // ------------------------------
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(LS.hist) || "[]") || [];
    } catch (e) {
      history = [];
    }

    const bubble = (role, html) =>
      `<div class="dc-msg ${role === "user" ? "user" : "assistant"}"><div class="bubble">${html}</div></div>`;

    const render = () => {
      try {
        log.innerHTML = history.map((m) => bubble(m.role, m.html)).join("");
        log.scrollTop = log.scrollHeight;
      } catch (e) {}
    };

    const save = () => {
      try {
        localStorage.setItem(LS.hist, JSON.stringify(history));
      } catch (e) {}
    };

    const add = (role, text) => {
      history.push({ role, html: esc(text) });
      save();
      render();
    };

    const addHTML = (html) => {
      history.push({ role: "assistant", html });
      save();
      render();
    };

    // ------------------------------
    // UI components
    // ------------------------------
    function addCTA() {
      if (document.getElementById("dc-inline-cta")) return;
      const html = bubble(
        "assistant",
        `
        <div id="dc-inline-cta" class="dc-actions">
          <a class="dc-btn"
             href="${CONSULT_URL}"
             target="_blank"
             rel="noopener"
             style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:40px;padding:0 14px;max-width:100%;text-decoration:none;white-space:nowrap;line-height:1;overflow:hidden;text-overflow:ellipsis;">
            Book a consult
          </a>
        </div>
      `
      );
      addHTML(html);
    }

    function addContact() {
      if (document.getElementById("dc-inline-contact")) return;
      const html = bubble(
        "assistant",
        `
        <div id="dc-inline-contact">
          <div style="margin-bottom:6px"><strong>Contact</strong></div>
          <div>Email: <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a></div>
          <div>Company: <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
          <div>${FOUNDER_NAME}: <a href="${FOUNDER_LINKEDIN}" target="_blank" rel="noopener" style="color:#0aa2ff">LinkedIn</a></div>
        </div>
      `
      );
      addHTML(html);
    }

    function addCapture(prefill) {
      if (document.getElementById("dc-capture")) return;

      const p = prefill || {};
      const html = bubble(
        "assistant",
        `
        <form id="dc-capture" style="display:grid;gap:6px;margin-top:6px">
          <div style="display:grid;gap:6px">
            <input type="text" name="name" placeholder="Your name" required value="${escAttr(p.name || "")}"
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="email" name="email" placeholder="Email" required value="${escAttr(p.email || "")}"
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="tel" name="phone" placeholder="Phone (optional)" value="${escAttr(p.phone || "")}"
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <input type="text" name="subject" placeholder="Subject" value="${escAttr(p.subject || "DeiCell intake")}"
                   style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(12,17,19,.85);color:#EAF2F5">
            <textarea name="note" rows="3" placeholder="Message"
              style="padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);
                     background:rgba(12,17,19,.85);color:#EAF2F5;line-height:1.3;
                     height:110px;min-height:84px;max-height:220px;resize:vertical;">${escTextarea(
                       p.note || ""
                     )}</textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button type="submit" class="dc-btn">Submit Info</button>
            <a href="mailto:${COMPANY_EMAIL}" class="dc-btn secondary">Email Us</a>
          </div>
        </form>
      `
      );
      addHTML(html);
    }

    // ------------------------------
    // Lead capture submit
    // ------------------------------
    function submitLeadCapture(f) {
      if (!f || f.id !== "dc-capture") return false;

      if (!f.checkValidity()) {
        try {
          f.reportValidity();
        } catch (e) {}
        showToast("Check fields");
        return false;
      }

      try {
        if (f.dataset && f.dataset.submitting === "1") return false;
        if (f.dataset) f.dataset.submitting = "1";
      } catch (e) {}

      const fd = new FormData(f);
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const phone = (fd.get("phone") || "").toString().trim();
      const subject = (fd.get("subject") || "").toString().trim();
      const note = (fd.get("note") || "").toString().trim();

      let sent = false;

      try {
        const body = new URLSearchParams();
        body.set("name", name);
        body.set("email", email);
        body.set("phone", phone);
        body.set("subject", subject);
        body.set("message", note);

        if (navigator.sendBeacon) {
          sent = navigator.sendBeacon(WEBAPP_URL, body);
        } else {
          fetch(WEBAPP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: body.toString()
          });
          sent = true;
        }
      } catch (e) {
        sent = false;
      }

      if (!sent) {
        try {
          const targetName = "dc-gform-target";
          let iframe = document.getElementById(targetName);
          if (!iframe) {
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

          const setHidden = (n, v) => {
            const i = document.createElement("input");
            i.type = "hidden";
            i.name = n;
            i.value = v == null ? "" : String(v);
            gf.appendChild(i);
          };

          setHidden(GOOGLE_FORM.fields.name, name);
          setHidden(GOOGLE_FORM.fields.email, email);
          setHidden(GOOGLE_FORM.fields.phone, phone);
          setHidden(GOOGLE_FORM.fields.subject, subject);
          setHidden(GOOGLE_FORM.fields.message, note);
          setHidden("submit", "Submit");

          document.body.appendChild(gf);
          gf.submit();
          sent = true;

          setTimeout(() => {
            try {
              gf.remove();
            } catch (e) {}
          }, 1500);
        } catch (e) {
          sent = false;
        }

        if (!sent) {
          try {
            const body = new URLSearchParams();
            body.set(GOOGLE_FORM.fields.name, name);
            body.set(GOOGLE_FORM.fields.email, email);
            body.set(GOOGLE_FORM.fields.phone, phone);
            body.set(GOOGLE_FORM.fields.subject, subject);
            body.set(GOOGLE_FORM.fields.message, note);
            body.set("submit", "Submit");

            fetch(GOOGLE_FORM.action, {
              method: "POST",
              mode: "no-cors",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
              },
              body: body.toString()
            });
            sent = true;
          } catch (e) {
            sent = false;
          }
        }
      }

      if (!sent) {
        try {
          const stash = JSON.parse(localStorage.getItem("dc_leads") || "[]");
          stash.push({
            ts: Date.now(),
            name,
            email,
            phone,
            subject,
            note,
            page: location.href
          });
          localStorage.setItem("dc_leads", JSON.stringify(stash));
        } catch (e) {}
      }

      add(
        "assistant",
        sent
          ? "Thanks, submitted. We will be in touch soon."
          : "Thanks, saved locally. We will reach out soon."
      );
      showToast(sent ? "Submitted" : "Saved");
      try {
        f.reset();
      } catch (e) {}
      try {
        if (f.dataset) f.dataset.submitting = "0";
      } catch (e) {}

      return sent;
    }

    if (log) {
      log.addEventListener("submit", (e) => {
        const f = e.target;
        if (!f || f.id !== "dc-capture") return;
        e.preventDefault();
        submitLeadCapture(f);
      });
    }

    // ------------------------------
    // Conversation Engine
    // ------------------------------
    const KB = {
      mission:
        "DeiCell Systems helps pre-commercial and early-clinical biotech and medtech teams stabilize manufacturing-facing quality work with phase-appropriate, minimum-necessary GMP and QMS structure.",
      promise:
        "The goal is not generic compliance theater. The goal is a bounded next step that fits stage, risk, manufacturing model, and regulatory exposure.",
      scope:
        "Typical work centers on Blueprint, Gap Repair Sprint, Audit Readiness Sprint, or Partner Insert support.",
      exclusions:
        "DeiCell is not positioned as enterprise-scale QMS transformation, certification-only optics, long-term staff augmentation, or paper-only compliance."
    };

    const FIELD_ORDER = [
      "forcingFunction",
      "deadline",
      "consequence",
      "productType",
      "stage",
      "regulatoryExposure",
      "manufacturingModel",
      "plannedManufacturingChange",
      "externalInterfaces",
      "decisionMaker",
      "activeFailureModes",
      "currentReality",
      "toolsConstraints",
      "phase1Done",
      "explicitDeferrals",
      "misalignment",
      "availableArtifacts"
    ];

    const REQUIRED_MIN_FIELDS = [
      "forcingFunction",
      "manufacturingModel",
      "decisionMaker",
      "activeFailureModes"
    ];

    const FIELD_LABELS = {
      forcingFunction: "forcing function",
      deadline: "deadline",
      consequence: "consequence of delay",
      productType: "product or program",
      stage: "stage",
      regulatoryExposure: "regulatory / audit exposure",
      manufacturingModel: "manufacturing model",
      plannedManufacturingChange: "next 6-month manufacturing change",
      externalInterfaces: "external interfaces",
      decisionMaker: "decision-maker",
      activeFailureModes: "active failure modes",
      currentReality: "current system reality",
      toolsConstraints: "tools and constraints",
      phase1Done: "Phase 1 definition",
      explicitDeferrals: "explicit deferrals",
      misalignment: "stakeholder misalignment",
      availableArtifacts: "available artifacts"
    };

    const stateDefault = {
      mode: "triage",
      entryMode: null,
      askedField: null,
      repeatCount: 0,
      profile: {
        forcingFunction: "",
        deadline: "",
        consequence: "",
        productType: "",
        stage: "",
        regulatoryExposure: "",
        manufacturingModel: "",
        plannedManufacturingChange: "",
        externalInterfaces: "",
        decisionMaker: "",
        activeFailureModes: "",
        currentReality: "",
        toolsConstraints: "",
        phase1Done: "",
        explicitDeferrals: "",
        misalignment: "",
        availableArtifacts: "",
        email: ""
      },
      notes: {
        fit: null,
        offer: null,
        bandHint: null,
        evidenceTierHint: null,
        declineReason: null
      }
    };

    let engine = {};
    try {
      engine = Object.assign({}, stateDefault, JSON.parse(sessionStorage.getItem(SS.engine) || "{}"));
      engine.profile = Object.assign({}, stateDefault.profile, engine.profile || {});
      engine.notes = Object.assign({}, stateDefault.notes, engine.notes || {});
    } catch (e) {
      engine = JSON.parse(JSON.stringify(stateDefault));
    }

    const saveEngine = () => {
      try {
        sessionStorage.setItem(SS.engine, JSON.stringify(engine));
      } catch (e) {}
    };

    const resetEngine = () => {
      engine = JSON.parse(JSON.stringify(stateDefault));
      saveEngine();
    };

    const FIELD_PROMPTS = {
      forcingFunction:
        "What is the forcing function right now, such as audit, investor diligence, tech transfer, recurring deviations, submission pressure, or scale-up?",
      deadline:
        "What is the deadline or target date?",
      consequence:
        "What happens if that date slips?",
      productType:
        "What is the actual product, platform, or program in scope? If this is an audit-readiness situation, describe the underlying device, diagnostic, therapy, software, or manufacturing program rather than the quality workstream.",
      stage:
        "What stage are you in right now, such as pre-seed, Series A, preclinical, early clinical, or commercializing?",
      regulatoryExposure:
        "What regulatory or customer scrutiny is in play, such as FDA, ISO 13485, MDR, diligence, customer audit, or internal inspection pressure?",
      manufacturingModel:
        "What is the current manufacturing model: outsourced, hybrid, or internal?",
      plannedManufacturingChange:
        "What changes are planned in the next 6 months, if any?",
      externalInterfaces:
        "How many CDMOs, CMOs, critical suppliers, or external labs are meaningfully in scope?",
      decisionMaker:
        "Who is the single accountable decision-maker for scope, approvals, and sign-off?",
      activeFailureModes:
        "What is actively threatening delivery now? You can list the top 1 to 3 items.",
      currentReality:
        "What exists today for document control, training, deviations/nonconformance, CAPA, change control, supplier oversight, complaints, and internal audit? A plain-language answer is enough.",
      toolsConstraints:
        "What tools or constraints matter here, such as shared drives, SharePoint, eQMS, Part 11 expectations, access limits, migration issues, or approval bottlenecks?",
      phase1Done:
        "In one sentence, what would Phase 1 done mean for this engagement?",
      explicitDeferrals:
        "What is clearly not part of Phase 1 right now?",
      misalignment:
        "Where are Quality, Manufacturing, Operations, leadership, or external partners misaligned, and what decisions are blocked?",
      availableArtifacts:
        "What can you provide now, such as product summary, manufacturing flow, SOP/process list, owner list, known issues list, audit date, or current templates?"
    };

    const EXAMPLES = {
      forcingFunction:
        'Example: "Investor diligence in 4 weeks, with recurring document-control failures creating concern."',
      manufacturingModel:
        'Example: "Hybrid. One CDMO for fill-finish, internal release coordination, and one external test lab."',
      decisionMaker:
        'Example: "VP Operations owns scope approval; QA manager and program lead execute."',
      activeFailureModes:
        'Example: "Change churn, ad hoc training records, weak CAPA investigations."',
      currentReality:
        'Example: "Document control and training are ad hoc; deviations and CAPA are inconsistent; supplier oversight exists on paper only."',
      phase1Done:
        'Example: "Core document control, training, deviations, CAPA, change control, and supplier oversight are defined, owned, and being executed consistently for the current manufacturing model."',
      availableArtifacts:
        'Example: "Product summary, SOP list, audit date, current templates, manufacturing flow, and issue tracker available now."',
      productType:
        'Example: "Class II IVD assay platform for oncology biomarker detection."'
    };

    const declineSignals = {
      falsification: [
        "backdate",
        "fabricate",
        "paper compliance",
        "paper only",
        "fake records",
        "make it look compliant",
        "appearance only"
      ],
      enterprise: [
        "enterprise-wide qms",
        "replace entire quality department",
        "global qms transformation",
        "full enterprise deployment",
        "company-wide qms overhaul"
      ],
      certificationOnly: [
        "certification only",
        "just need iso certificate",
        "just need audit optics",
        "pass audit without changing anything"
      ],
      staffing: [
        "full time qa resource",
        "staff augmentation",
        "fractional qa department forever",
        "replace qa head"
      ]
    };

    const fitHelpers = {
      deadlinePressure(text) {
        const t = norm(text);
        if (
          includesAny(t, [
            "2 weeks",
            "two weeks",
            "14 days",
            "10 days",
            "30 days",
            "next month",
            "45 days"
          ])
        ) {
          return "high";
        }
        if (
          includesAny(t, [
            "60 days",
            "90 days",
            "quarter",
            "two months",
            "3 months",
            "three months"
          ])
        ) {
          return "medium";
        }
        return null;
      }
    };

    function looksLikeShortAffirmation(text) {
      return includesAny(text, ["yes", "yeah", "yep", "correct", "right", "ok", "okay", "sure"]);
    }

    function looksLikeReset(text) {
      return includesAny(text, ["start over", "restart", "reset", "clear"]);
    }

    function looksLikeContact(text) {
      return includesAny(text, [
        "contact",
        "email you",
        "talk to someone",
        "talk to a human",
        "book a consult",
        "book consult",
        "consult",
        "reach out",
        "call me"
      ]);
    }

    function looksLikeAbout(text) {
      return includesAny(text, [
        "what is deicell",
        "what do you do",
        "who are you",
        "about deicell",
        "about you"
      ]);
    }

    function looksLikePricing(text) {
      return includesAny(text, ["price", "pricing", "cost", "budget", "quote", "estimate", "range"]);
    }

    function looksLikeExampleRequest(text) {
      return includesAny(text, ["example", "show me an example", "sample answer", "what do you mean"]);
    }

    function detectDecline(text) {
      if (includesAny(text, declineSignals.falsification)) {
        return "Requests to fabricate, backdate, or paper compliance are out of scope.";
      }
      if (includesAny(text, declineSignals.enterprise)) {
        return "Enterprise-scale transformation is outside the normal DeiCell operating scope.";
      }
      if (includesAny(text, declineSignals.certificationOnly)) {
        return "Certification-only or optics-only work is not the intended fit.";
      }
      if (includesAny(text, declineSignals.staffing)) {
        return "Long-term staff augmentation is outside the intended DeiCell model.";
      }
      return null;
    }

    function inferStage(text) {
      const t = norm(text);
      if (includesAny(t, ["pre-seed", "pre seed"])) return "Pre-Seed";
      if (includesAny(t, ["seed"])) return "Seed";
      if (includesAny(t, ["series a"])) return "Series A";
      if (includesAny(t, ["series b"])) return "Series B";
      if (includesAny(t, ["preclinical", "r&d", "prototype", "bench"])) return "preclinical";
      if (includesAny(t, ["clinical", "early clinical", "ide", "trial"])) return "clinical";
      if (includesAny(t, ["commercial", "postmarket", "launched"])) return "commercial/postmarket";
      return "";
    }

    function inferManufacturingModel(text) {
      const t = norm(text);
      if (includesAny(t, ["outsourced", "all outsourced", "cdmo only", "cmo only"])) return "outsourced";
      if (includesAny(t, ["hybrid"])) return "hybrid";
      if (includesAny(t, ["internal", "in-house", "in house"])) return "internal";
      return "";
    }

    function inferEntryMode(text) {
      const t = norm(text);

      if (looksLikeContact(t)) return "contact";

      if (
        includesAny(t, [
          "audit",
          "inspection",
          "diligence",
          "investor diligence",
          "customer audit",
          "site audit",
          "mock audit",
          "readiness"
        ])
      ) {
        return "audit_readiness";
      }

      if (
        includesAny(t, [
          "deviation",
          "capa",
          "doc control",
          "document control",
          "training gaps",
          "change control",
          "supplier oversight",
          "gap",
          "fix",
          "repair",
          "unstable",
          "breakdown",
          "complaints"
        ])
      ) {
        return "gap_repair";
      }

      if (
        includesAny(t, [
          "blueprint",
          "phase 1",
          "minimum compliant",
          "minimum necessary",
          "qms build",
          "qms architecture",
          "build qms",
          "what should exist",
          "what belongs now"
        ])
      ) {
        return "blueprint";
      }

      if (
        includesAny(t, [
          "partner insert",
          "specialist support",
          "subcontract",
          "prime consultant",
          "workstream support",
          "bounded workstream"
        ])
      ) {
        return "partner_insert";
      }

      if (
        includesAny(t, [
          "we need help",
          "not sure",
          "figuring out scope",
          "qms",
          "regulatory",
          "manufacturing pressure",
          "quality pressure",
          "systems are breaking"
        ])
      ) {
        return "general";
      }

      return null;
    }

    function sanitizeProductType(value) {
      const v = cleanSentence(value);
      const n = norm(v);

      if (
        includesAny(n, [
          "audit system",
          "qms",
          "quality system",
          "audit readiness",
          "compliance program",
          "paper trail",
          "documentation system",
          "quality framework"
        ])
      ) {
        return "";
      }

      return v;
    }

    function weakProductSignal() {
      const p = norm(engine.profile.productType);
      if (!p) return true;

      if (
        includesAny(p, [
          "device that helps people",
          "device",
          "system",
          "platform",
          "program"
        ]) &&
        p.split(" ").length < 5
      ) {
        return true;
      }

      return false;
    }

    function missingMinimumPackageSignal() {
      return !engine.profile.availableArtifacts || !engine.profile.currentReality;
    }

    function hasCoreControlCollapse() {
      const combined = norm(
        [
          engine.profile.activeFailureModes,
          engine.profile.currentReality,
          engine.profile.regulatoryExposure
        ].join(" ")
      );
    
      return includesAny(combined, [
        "no quality system",
        "no qms",
        "no document control",
        "no training",
        "no capa",
        "no change control",
        "no deviation process",
        "no nonconformance process",
        "no supplier oversight",
        "paper only",
        "uncontrolled",
        "not controlled",
        "nothing in place"
      ]);
    }
    
    function hasReadinessFacingDefects() {
      const combined = norm(
        [
          engine.profile.activeFailureModes,
          engine.profile.currentReality,
          engine.profile.regulatoryExposure
        ].join(" ")
      );
    
      return includesAny(combined, [
        "training records",
        "training gaps",
        "weak capa",
        "capa investigations",
        "weak investigations",
        "paper trail",
        "document retrieval",
        "evidence gaps",
        "record gaps",
        "retrievability",
        "ad hoc",
        "inconsistent",
        "recurring deviations",
        "deviations"
      ]);
    }
    
    function inferOfferFromProfile() {
      const ff = norm(engine.profile.forcingFunction);
      const rx = norm(engine.profile.regulatoryExposure);
      const mm = norm(engine.profile.manufacturingModel);
      const ext = norm(engine.profile.externalInterfaces);
    
      const collapse = hasCoreControlCollapse();
      const readinessDefects = hasReadinessFacingDefects();
      const readinessEvent = includesAny(ff + " " + rx, [
        "audit",
        "inspection",
        "diligence",
        "investor diligence",
        "customer audit"
      ]);
    
      const outsourcedPressure =
        mm === "outsourced" ||
        mm === "hybrid" ||
        includesAny(ext, ["cdmo", "cmo", "supplier", "external lab"]);
    
      if (engine.entryMode === "partner_insert") return "Partner Insert";
      if (engine.entryMode === "blueprint") return "Right-Sized GMP/QMS Blueprint";
    
      // True system-floor collapse beats readiness packaging
      if (collapse) {
        return "Gap Repair Sprint";
      }
    
      // External scrutiny + named readiness-facing defects = readiness sprint
      if (readinessEvent && readinessDefects) {
        return "Audit Readiness Sprint";
      }
    
      // External scrutiny by itself still leans readiness unless collapse is present
      if (readinessEvent) {
        return "Audit Readiness Sprint";
      }
    
      if (outsourcedPressure && !engine.profile.phase1Done) {
        return "Right-Sized GMP/QMS Blueprint";
      }
    
      return "Right-Sized GMP/QMS Blueprint";
    }
    
    function inferBandHint() {
      const mm = norm(engine.profile.manufacturingModel);
      const ext = norm(engine.profile.externalInterfaces);
      const dl = fitHelpers.deadlinePressure(
        engine.profile.deadline + " " + engine.profile.forcingFunction
      );
      const mis = norm(engine.profile.misalignment);
      const reality = norm(engine.profile.currentReality);
      const active = norm(engine.profile.activeFailureModes);
      const tools = norm(engine.profile.toolsConstraints);
    
      let score = 0;
    
      const multipleExternalInterfaces = includesAny(ext, [
        "2", "two", "3", "three", "4", "four", "5", "five",
        "6", "six", "7", "seven", "8", "eight", "9", "nine",
        "10", "ten", "multiple", "several"
      ]);
    
      const veryHighInterfaceCount = includesAny(ext, [
        "6", "six", "7", "seven", "8", "eight", "9", "nine", "10", "ten"
      ]);
    
      if (mm === "outsourced" || mm === "hybrid" || mm === "internal") score += 1;
      if (multipleExternalInterfaces) score += 2;
      if (veryHighInterfaceCount) score += 1;
      if (dl === "high") score += 2;
      if (dl === "medium") score += 1;
    
      if (
        includesAny(reality + " " + active, [
          "training records",
          "training gaps",
          "weak capa",
          "capa investigations",
          "weak investigations",
          "evidence gaps",
          "retrieval",
          "record gaps",
          "ad hoc",
          "inconsistent",
          "recurring deviations",
          "deviations"
        ])
      ) {
        score += 1;
      }
    
      if (includesAny(mis, ["blocked", "misaligned", "disagreement", "contested"])) score += 1;
      if (includesAny(tools, ["part 11", "validated", "migration", "access"])) score += 1;
    
      if (veryHighInterfaceCount && dl === "high") return "High";
      if (multipleExternalInterfaces && score < 2) return "Medium";
      if (score >= 5) return "High";
      if (score >= 2) return "Medium";
      return "Low";
    }
    
    function inferEvidenceTierHint() {
      const ff = norm(engine.profile.forcingFunction);
      const deadline = norm(engine.profile.deadline);
      const cr = norm(engine.profile.currentReality);
      const active = norm(engine.profile.activeFailureModes);
      const p1 = norm(engine.profile.phase1Done);
    
      const shortWindow = includesAny(deadline + " " + ff, [
        "2 weeks",
        "two weeks",
        "14 days",
        "10 days",
        "30 days"
      ]);
    
      if (hasCoreControlCollapse()) {
        return "Tier 2";
      }
    
      if (shortWindow) {
        return "Tier 2";
      }
    
      if (
        includesAny(p1 + " " + cr + " " + active, [
          "prove execution over time",
          "show execution over time",
          "controlled",
          "executed consistently",
          "live process"
        ])
      ) {
        return "Tier 2-3";
      }
    
      return "Tier 2";
    }

    function classifyFit() {
      const decline = detectDecline(
        [
          engine.profile.forcingFunction,
          engine.profile.consequence,
          engine.profile.currentReality,
          engine.profile.toolsConstraints,
          engine.profile.misalignment
        ].join(" ")
      );

      if (decline) {
        engine.notes.declineReason = decline;
        return "Out-of-Scope";
      }

      const missingRequired = REQUIRED_MIN_FIELDS.filter(
        (k) => !String(engine.profile[k] || "").trim()
      );

      if (missingRequired.length > 2) return null;

      if (
        missingRequired.length > 0 ||
        weakProductSignal() ||
        missingMinimumPackageSignal()
      ) {
        return "Conditional";
      }

      return "Good-Fit";
    }

    function nextMissingField() {
      for (let i = 0; i < FIELD_ORDER.length; i++) {
        const k = FIELD_ORDER[i];
        if (!String(engine.profile[k] || "").trim()) return k;
      }
      return null;
    }

    function minimalIntakeReached() {
      return REQUIRED_MIN_FIELDS.every((k) => String(engine.profile[k] || "").trim());
    }

    function canProduceSummary() {
      return minimalIntakeReached() && !!engine.profile.productType;
    }

    function setProfileIfEmpty(key, value) {
      if (!engine.profile[key] && value) engine.profile[key] = value;
    }

    function harvestFromText(text) {
      const t = String(text || "");
      const n = norm(t);

      const email = firstEmail(t);
      if (email) engine.profile.email = email;

      const stage = inferStage(t);
      if (stage) setProfileIfEmpty("stage", stage);

      const mm = inferManufacturingModel(t);
      if (mm) setProfileIfEmpty("manufacturingModel", mm);

      if (
        includesAny(n, [
          "audit",
          "inspection",
          "diligence",
          "investor",
          "customer quality",
          "iso 13485",
          "fda",
          "mdr",
          "ivdr",
          "510k",
          "510(k)",
          "pma",
          "pre-sub",
          "presub"
        ])
      ) {
        setProfileIfEmpty("regulatoryExposure", cleanSentence(t));
      }

      if (
        includesAny(n, [
          "deviation",
          "capa",
          "change control",
          "training",
          "doc control",
          "document control",
          "supplier oversight",
          "complaint",
          "paper trail",
          "no quality system"
        ])
      ) {
        setProfileIfEmpty("activeFailureModes", cleanSentence(t));
      }

      if (
        includesAny(n, [
          "shared drive",
          "sharepoint",
          "eqms",
          "edms",
          "part 11",
          "lims",
          "mes",
          "migration",
          "validated",
          "access"
        ])
      ) {
        setProfileIfEmpty("toolsConstraints", cleanSentence(t));
      }

      if (
        includesAny(n, [
          "device",
          "diagnostic",
          "ivd",
          "software",
          "samd",
          "implant",
          "assay",
          "therapeutic",
          "biologic",
          "drug product",
          "drug substance",
          "platform"
        ])
      ) {
        const product = sanitizeProductType(t);
        if (product) setProfileIfEmpty("productType", product);
      }

      if (
        includesAny(n, [
          "phase 1",
          "done means",
          "phase one",
          "explicitly deferred",
          "deferred",
          "not included"
        ])
      ) {
        setProfileIfEmpty("phase1Done", cleanSentence(t));
      }

      if (
        includesAny(n, ["ceo", "founder", "vp", "director", "head of quality", "operations lead", "decision maker"])
      ) {
        setProfileIfEmpty("decisionMaker", cleanSentence(t));
      }

      if (
        includesAny(n, [
          "cdmo",
          "cmo",
          "supplier",
          "external lab",
          "testing lab",
          "fill finish",
          "fill-finish"
        ])
      ) {
        setProfileIfEmpty("externalInterfaces", cleanSentence(t));
      }

      if (
        includesAny(n, [
          "deadline",
          "by ",
          "in 2 weeks",
          "in two weeks",
          "in 30 days",
          "in 45 days",
          "next month",
          "this quarter",
          "two months",
          "3 months",
          "three months"
        ])
      ) {
        setProfileIfEmpty("deadline", cleanSentence(t));
      }

      if (
        includesAny(n, [
          "if we miss",
          "miss it",
          "delay means",
          "consequence",
          "slip",
          "lose",
          "investor concern",
          "submission risk",
          "shutdown",
          "warning letter"
        ])
      ) {
        setProfileIfEmpty("consequence", cleanSentence(t));
      }
    }

    function writeAnswerToAskedField(text) {
      const field = engine.askedField;
      if (!field) return false;

      const value = cleanSentence(text);
      if (!value) return false;

      const tooThin =
        value.length < 2 ||
        (looksLikeShortAffirmation(value) &&
          !["manufacturingModel", "plannedManufacturingChange"].includes(field));

      if (tooThin) return false;

      if (field === "manufacturingModel") {
        const inferred = inferManufacturingModel(value);
        engine.profile[field] = inferred || value;
        return true;
      }

      if (field === "externalInterfaces") {
        engine.profile[field] = safeNumberWordToDigit(value);
        return true;
      }

      if (field === "productType") {
        const cleaned = sanitizeProductType(value);
        if (!cleaned) return false;
        engine.profile[field] = cleaned;
        return true;
      }

      engine.profile[field] = value;
      return true;
    }

    function buildCompactSummaryHTML() {
      const p = engine.profile;
      const fit = engine.notes.fit || classifyFit() || "Conditional";
      const offer = engine.notes.offer || inferOfferFromProfile();
      const band = engine.notes.bandHint || inferBandHint();
      const tier = engine.notes.evidenceTierHint || inferEvidenceTierHint();

      const rows = [
        p.forcingFunction ? `<div><strong>Forcing function:</strong> ${esc(p.forcingFunction)}</div>` : "",
        p.deadline ? `<div><strong>Deadline:</strong> ${esc(p.deadline)}</div>` : "",
        p.consequence ? `<div><strong>Consequence of delay:</strong> ${esc(p.consequence)}</div>` : "",
        p.productType ? `<div><strong>Product / program:</strong> ${esc(p.productType)}</div>` : "",
        p.stage ? `<div><strong>Stage:</strong> ${esc(p.stage)}</div>` : "",
        p.regulatoryExposure
          ? `<div><strong>Regulatory / scrutiny:</strong> ${esc(p.regulatoryExposure)}</div>`
          : "",
        p.manufacturingModel
          ? `<div><strong>Manufacturing model:</strong> ${esc(p.manufacturingModel)}</div>`
          : "",
        p.plannedManufacturingChange
          ? `<div><strong>Planned manufacturing change:</strong> ${esc(p.plannedManufacturingChange)}</div>`
          : "",
        p.externalInterfaces
          ? `<div><strong>External interfaces:</strong> ${esc(p.externalInterfaces)}</div>`
          : "",
        p.decisionMaker
          ? `<div><strong>Decision-maker:</strong> ${esc(p.decisionMaker)}</div>`
          : "",
        p.activeFailureModes
          ? `<div><strong>Active failure modes:</strong> ${esc(p.activeFailureModes)}</div>`
          : "",
        p.currentReality
          ? `<div><strong>Current system reality:</strong> ${esc(p.currentReality)}</div>`
          : "",
        p.toolsConstraints
          ? `<div><strong>Tools / constraints:</strong> ${esc(p.toolsConstraints)}</div>`
          : ""
      ]
        .filter(Boolean)
        .join("");

      return `
        <div>
          <div style="margin-bottom:8px"><strong>DeiCell intake summary</strong></div>
          <div><strong>Fit classification:</strong> ${esc(fit)}</div>
          <div><strong>Likely engagement path:</strong> ${esc(offer)}</div>
          <div><strong>Probable effort band:</strong> ${esc(band)}</div>
          <div><strong>Probable evidence tier:</strong> ${esc(tier)}</div>
          <div style="margin-top:8px;display:grid;gap:5px">${rows}</div>
        </div>
      `;
    }

    function buildMissingInputsText() {
      const missing = FIELD_ORDER.filter((k) => !String(engine.profile[k] || "").trim());
      if (!missing.length) return "I have enough for a bounded first-pass conversation.";
      return "Still missing or thin: " + missing.slice(0, 4).map((k) => FIELD_LABELS[k] || k).join(", ") + ".";
    }

    function explainOffer(offer) {
      if (offer === "Right-Sized GMP/QMS Blueprint") {
        return "This looks more like a bounded architecture and Phase 1 definition problem than a narrow remediation problem.";
      }
      if (offer === "Gap Repair Sprint") {
        return "This looks like a specific control breakdown that is threatening delivery, audit continuity, or manufacturing continuity and needs a time-boxed repair.";
      }
      if (offer === "Audit Readiness Sprint") {
        return "This looks deadline-driven, with audit, inspection, or diligence pressure shaping the work.";
      }
      if (offer === "Partner Insert") {
        return "This looks like a bounded specialist workstream that supports a prime lead rather than a stand-alone full engagement.";
      }
      return "";
    }

    function buildCaptureNote() {
      const p = engine.profile;
      const lines = [
        p.forcingFunction ? `Forcing function: ${p.forcingFunction}` : "",
        p.deadline ? `Deadline: ${p.deadline}` : "",
        p.consequence ? `Consequence of delay: ${p.consequence}` : "",
        p.productType ? `Product / program: ${p.productType}` : "",
        p.stage ? `Stage: ${p.stage}` : "",
        p.regulatoryExposure ? `Regulatory / scrutiny: ${p.regulatoryExposure}` : "",
        p.manufacturingModel ? `Manufacturing model: ${p.manufacturingModel}` : "",
        p.plannedManufacturingChange
          ? `Planned manufacturing change: ${p.plannedManufacturingChange}`
          : "",
        p.externalInterfaces ? `External interfaces: ${p.externalInterfaces}` : "",
        p.decisionMaker ? `Decision-maker: ${p.decisionMaker}` : "",
        p.activeFailureModes ? `Active failure modes: ${p.activeFailureModes}` : "",
        p.currentReality ? `Current system reality: ${p.currentReality}` : "",
        p.toolsConstraints ? `Tools / constraints: ${p.toolsConstraints}` : "",
        p.phase1Done ? `Phase 1 done: ${p.phase1Done}` : "",
        p.explicitDeferrals ? `Explicit deferrals: ${p.explicitDeferrals}` : "",
        p.misalignment ? `Stakeholder misalignment: ${p.misalignment}` : "",
        p.availableArtifacts ? `Available artifacts: ${p.availableArtifacts}` : "",
        engine.notes.fit ? `Fit classification: ${engine.notes.fit}` : "",
        engine.notes.offer ? `Likely engagement path: ${engine.notes.offer}` : "",
        engine.notes.bandHint ? `Probable effort band: ${engine.notes.bandHint}` : "",
        engine.notes.evidenceTierHint
          ? `Probable evidence tier: ${engine.notes.evidenceTierHint}`
          : ""
      ];

      return lines.filter(Boolean).join("\n");
    }

    function produceBoundedNextStep() {
      engine.notes.fit = classifyFit();
      engine.notes.offer = inferOfferFromProfile();
      engine.notes.bandHint = inferBandHint();
      engine.notes.evidenceTierHint = inferEvidenceTierHint();
      saveEngine();

      const fit = engine.notes.fit;
      const offer = engine.notes.offer;

      if (fit === "Out-of-Scope") {
        engine.mode = "declined";
        saveEngine();
        return {
          text:
            `${engine.notes.declineReason} If the situation can be reframed into a bounded, phase-appropriate workstream with a clear decision-maker and truthful evidence expectations, it may be revisited.`,
          showContact: true
        };
      }

      return {
        html: buildCompactSummaryHTML(),
        text:
          `${explainOffer(offer)} ${buildMissingInputsText()} Based on what you have shared, the next best step is one bounded DeiCell diagnostic path rather than a broad multi-track scope.`,
        showCTA: true,
        showContact: true,
        capture: true
      };
    }

    function maybeAdvanceToSummary() {
      if (canProduceSummary()) {
        return produceBoundedNextStep();
      }
      return null;
    }

    function askField(field, opts) {
      engine.mode = "collecting";
      engine.askedField = field;
      saveEngine();

      const prompt = FIELD_PROMPTS[field] || "Tell me a bit more.";
      const example = EXAMPLES[field] ? `\n\n${EXAMPLES[field]}` : "";

      return {
        text: `${prompt}${example}`,
        showCTA: opts && opts.showCTA
      };
    }

    function openingMessage() {
      return (
        `Hi, I'm ${ASSISTANT_NAME}. DeiCell is built for early-stage biotech and medtech teams facing manufacturing, audit, diligence, or QMS pressure.\n\n` +
        `Describe what you're building, what is forcing action, and what feels unstable. I will help determine whether this looks like a bounded DeiCell fit and what the next step should be.\n\n` +
        `You can also say contact if you want to reach a consultant directly.`
      );
    }

    function handleAbout() {
      return {
        text:
          `${KB.mission}\n\n${KB.promise}\n\n${KB.scope}\n\n${KB.exclusions}`,
        showCTA: true,
        showContact: true
      };
    }

    function handleContact() {
      engine.entryMode = "contact";
      saveEngine();

      const note = canProduceSummary()
        ? "I can also attach the intake context we already have."
        : "If you want, you can submit a short note and I will route it as a DeiCell intake.";

      return {
        html: `
          <div>
            The fastest path is a direct consult or a short intake handoff.
            <div class="dc-actions" style="margin-top:8px">
              <a class="dc-btn" href="${CONSULT_URL}" target="_blank" rel="noopener"
                 style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;white-space:nowrap;line-height:1;min-height:40px;padding:8px 14px;">
                Book a consult
              </a>
            </div>
            <div style="margin-top:8px">${esc(note)}</div>
            <div style="margin-top:8px">
              Email: <a href="mailto:${COMPANY_EMAIL}" style="color:var(--dc-link)">${COMPANY_EMAIL}</a>
            </div>
          </div>
        `,
        capture: true,
        showContact: true
      };
    }

    function handlePricing() {
      engine.notes.fit = classifyFit() || "Conditional";
      engine.notes.offer = inferOfferFromProfile();
      engine.notes.bandHint = inferBandHint();
      engine.notes.evidenceTierHint = inferEvidenceTierHint();
      saveEngine();

      return {
        text:
          `DeiCell pricing is packaged around bounded work types and effort bands, not open-ended hourly drift. Based on what I have so far, this points most toward ${engine.notes.offer || "a bounded engagement"} with a probable ${engine.notes.bandHint || "TBD"} band and ${engine.notes.evidenceTierHint || "TBD"} evidence expectation. To make that more defensible, I need the forcing function, manufacturing model, decision-maker, active failure modes, and current system reality.`,
        showCTA: true,
        capture: true
      };
    }

    function handleReset() {
      history = [];
      save();
      resetEngine();
      render();
      add("assistant", openingMessage());
      return { silent: true };
    }

    function handleFreeformEntry(text) {
      harvestFromText(text);

      if (!engine.entryMode) {
        engine.entryMode = inferEntryMode(text) || "general";
      }

      const fitDecline = detectDecline(text);
      if (fitDecline) {
        engine.notes.declineReason = fitDecline;
        engine.mode = "declined";
        saveEngine();
        return {
          text:
            `${fitDecline} DeiCell works best when the scope can be bounded, truthful, and phase-appropriate.`,
          showContact: true
        };
      }

      const summary = maybeAdvanceToSummary();
      if (summary) return summary;

      let firstAsk = null;

      if (!engine.profile.forcingFunction) firstAsk = "forcingFunction";
      else if (!engine.profile.productType) firstAsk = "productType";
      else if (!engine.profile.stage) firstAsk = "stage";
      else if (!engine.profile.regulatoryExposure) firstAsk = "regulatoryExposure";
      else if (!engine.profile.manufacturingModel) firstAsk = "manufacturingModel";
      else if (!engine.profile.decisionMaker) firstAsk = "decisionMaker";
      else if (!engine.profile.activeFailureModes) firstAsk = "activeFailureModes";
      else if (!engine.profile.currentReality) firstAsk = "currentReality";
      else firstAsk = nextMissingField();

      return askField(firstAsk, { showCTA: engine.entryMode !== "general" });
    }

    function handleAskedFieldResponse(text) {
      const wrote = writeAnswerToAskedField(text);
      harvestFromText(text);

      if (!wrote) {
        engine.repeatCount += 1;
        saveEngine();

        if (looksLikeExampleRequest(text)) {
          const ex = EXAMPLES[engine.askedField] || "A plain-language answer is fine.";
          return {
            text: ex
          };
        }

        if (engine.repeatCount >= 2) {
          const current = engine.askedField;
          const next = nextMissingField();
          engine.repeatCount = 0;

          if (current && EXAMPLES[current]) {
            return {
              text:
                `That looks a bit thin for ${FIELD_LABELS[current] || "that field"}. ${EXAMPLES[current]} If you are not sure, say not sure and I will keep moving.`
            };
          }

          if (next && next !== current) {
            return askField(next, {});
          }
        }

        return {
          text: FIELD_PROMPTS[engine.askedField]
        };
      }

      engine.repeatCount = 0;
      saveEngine();

      const summary = maybeAdvanceToSummary();
      if (summary) return summary;

      const next = nextMissingField();
      if (next) return askField(next, {});
      return produceBoundedNextStep();
    }

    function generalElaboration(text) {
      const t = norm(text);

      if (includesAny(t, ["what do you need", "what info do you need", "what should i send"])) {
        return {
          text:
            "The quickest path is: forcing function and deadline, product and stage, manufacturing model, decision-maker, top active failure modes, current system reality, tools and constraints, and what baseline artifacts are available now.",
          showCTA: true
        };
      }

      if (includesAny(t, ["what do you help with", "what can you help with"])) {
        return {
          text:
            "DeiCell is strongest where manufacturing and quality pressure are rising faster than internal structure: Phase 1 QMS boundaries, document control, training, CAPA, change control, supplier oversight, audit readiness, and bounded remediation of failing core controls.",
          showCTA: true
        };
      }

      if (includesAny(t, ["what offer", "what engagement", "which path"])) {
        return produceBoundedNextStep();
      }

      return null;
    }

    function reply(qRaw) {
      const text = cleanSentence(qRaw);
      const t = norm(text);

      if (!text) return { text: "Please enter a message." };

      if (looksLikeReset(t)) return handleReset();

      const email = firstEmail(text);
      if (email) {
        engine.profile.email = email;
        saveEngine();
      }

      if (looksLikeAbout(t)) return handleAbout();
      if (looksLikeContact(t)) return handleContact();
      if (looksLikePricing(t)) return handlePricing();

      const decline = detectDecline(text);
      if (decline) {
        engine.notes.declineReason = decline;
        engine.mode = "declined";
        saveEngine();
        return {
          text:
            `${decline} If this can be reframed into a bounded, truthful, phase-appropriate scope, I can still help determine the next step.`,
          showContact: true
        };
      }

      const elaboration = generalElaboration(text);
      if (elaboration) return elaboration;

      if (engine.mode === "collecting" && engine.askedField) {
        return handleAskedFieldResponse(text);
      }

      if (looksLikeShortAffirmation(t) && engine.askedField) {
        return {
          text: FIELD_PROMPTS[engine.askedField]
        };
      }

      return handleFreeformEntry(text);
    }

    // ------------------------------
    // Initial prompt
    // ------------------------------
    if (history.length) render();
    else add("assistant", openingMessage());

    // ------------------------------
    // Submit handler
    // ------------------------------
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = cleanSentence(input.value || "");
        if (!q) return;

        add("user", q);
        input.value = "";

        let r = {};
        try {
          r = reply(q) || {};
        } catch (err) {
          console.error("dc-chat reply error:", err);
          r = {
            text:
              "Something went wrong. Please try again, or say contact to reach a consultant directly."
          };
        }

        if (r.silent) return;
        if (r.text) add("assistant", r.text);
        if (r.html) addHTML(r.html);

        if (r.capture) {
          const prefill = {
            email: engine.profile.email || "",
            subject:
              engine.notes.offer
                ? `${engine.notes.offer} intake`
                : "DeiCell intake",
            note: buildCaptureNote()
          };
          addCapture(prefill);
        }

        if (r.showCTA) addCTA();
        if (r.showContact) addContact();
      });
    }

    function showWelcomePrompt() {
      const existing = document.getElementById("dc-welcome");
      if (existing) existing.remove();

      const hasUser = (history || []).some((m) => m.role === "user");
      const msg = hasUser
        ? "Want to continue this DeiCell intake?"
        : "Need help scoping a bounded quality or regulatory workstream?";

      const actions = hasUser
        ? `<div class="dc-actions">
             <button class="dc-btn" type="button" data-act="continue">Continue</button>
             <button class="dc-btn secondary" type="button" data-act="clear">Clear</button>
             <button class="dc-btn secondary" type="button" data-act="close">Close</button>
           </div>`
        : `<div class="dc-actions">
             <button class="dc-btn" type="button" data-act="yes">Yes</button>
             <button class="dc-btn secondary" type="button" data-act="about">About</button>
             <button class="dc-btn secondary" type="button" data-act="close">Close</button>
           </div>`;

      const tmp = document.createElement("div");
      tmp.innerHTML = bubble("assistant", `<div>${msg}</div>${actions}`);
      const node = tmp.firstElementChild;
      node.id = "dc-welcome";
      log.appendChild(node);
      log.scrollTop = log.scrollHeight;

      node.querySelectorAll("[data-act]").forEach((b) => {
        b.addEventListener("click", (e) => {
          const act = e.currentTarget.getAttribute("data-act");
          if (act === "continue") {
            node.remove();
          } else if (act === "clear") {
            history = [];
            save();
            resetEngine();
            render();
            add("assistant", openingMessage());
            showWelcomePrompt();
          } else if (act === "yes") {
            node.remove();
            add(
              "assistant",
              "Great. Tell me what you are building, what is forcing action, and what feels unstable right now."
            );
          } else if (act === "about") {
            node.remove();
            add(
              "assistant",
              `${KB.mission}\n\n${KB.promise}\n\nTell me the forcing function and I will help narrow the next step.`
            );
          } else if (act === "close") {
            close();
          }
        });
      });
    }

    // Open chat on startup and show welcome prompt
    setOpen(true);
    setTimeout(showWelcomePrompt, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
