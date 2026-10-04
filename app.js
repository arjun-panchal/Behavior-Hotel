// Behavior Hotel - Official Letter Generator
// Complete robust implementation with modern Selection/Range (no execCommand)

class BehaviorLetterApp {
  constructor() {
    this.state = {
      documentType: "",
      date: new Date().toISOString().split("T")[0],
      refNumber: "",
      confidential: false,
      recipientName: "",
      recipientAddress: "",
      employeeId: "",
      position: "",
      department: "",
      repName: "",
      designation: "",
      subject: "",
      content: "",
      contentHTML: "",
      showConfidential: true,
      showPageNumber: false,
      logoData: "Logo.png",
      signatures: {
        hr: null,
        emp: null,
        emp2: null,
      },
      showEmp2: false,
      customTypes: [],
      zoom: 1,
      drafts: [],
    };

    this.drawing = {
      active: false,
      paths: [],
      currentPath: [],
      target: null, // 'hr' | 'emp' | 'emp2'
    };

    this.elements = {};
    this.init();
  }

  async init() {
    this.cacheElements();
    this.setupEventListeners();
    this.generateRefNumber();
    this.updateWordCharPageCounts();
    this.updatePreview();
    this.validateAll();
    await this.loadDraftsFromStorage();
  }

  cacheElements() {
    const ids = [
      "document-type", "doc-type", "date", "input-date", "ref-number", "input-ref", "btn-gen-ref", "confidential", "input-conf",
      "recipient-name", "input-recipient-name", "recipient-address", "input-recipient-address", "employee-id", "input-recipient-id", "position", "input-recipient-position",
      "department", "input-recipient-dept", "rep-name", "input-sender-name", "designation", "input-sender-title", "subject", "input-subject",
      "content-editor", "content-editor-main", "word-count", "char-count", "page-count",
      "btn-upload-logo", "logo-upload", "logo-file", "btn-remove-logo", "btn-reset-logo", "logo-img", "prev-logo", "default-logo",
      "hr-sig-upload", "sig-file", "btn-hr-upload", "btn-hr-draw", "btn-hr-clear", "hr-sig-preview", "prev-hr-sig",
      "emp-sig-upload", "btn-emp-upload", "btn-emp-draw", "btn-emp-clear", "emp-sig-preview", "prev-emp-sig",
      "emp2-sig-upload", "btn-emp2-upload", "btn-emp2-draw", "btn-emp2-clear", "emp2-sig-preview", "prev-emp2-sig", "emp2-sig-block",
      "show-confidential", "show-page-number",
      "btn-new", "btn-save", "btn-load", "btn-print", "btn-pdf",
      "btn-clear", "btn-duplicate", "btn-delete-draft",
      "btn-zoom-in", "btn-zoom-out", "btn-fit-page", "zoom-level",
      "btn-show-editor", "btn-show-preview", "btn-toggle-preview",
      "draw-modal", "btn-close-modal", "btn-cancel-draw", "btn-save-draw", "btn-clear-canvas", "btn-undo-canvas", "signature-canvas",
      "draft-modal", "btn-close-draft-modal", "btn-cancel-load", "draft-list", "no-drafts",
      "doc-status",
      "error-doc-type", "error-date", "error-recipient", "error-subject", "error-content",
      "prev-date", "prev-ref", "prev-confidential-wrap", "prev-conf", "prev-recipient-name", "prev-rec-name", "prev-recipient-address", "prev-rec-addr", "prev-employee-id", "prev-rec-id", "prev-position", "prev-rec-pos", "prev-subject", "prev-content", "prev-sections", "prev-hr-name", "prev-hr-title", "prev-emp-name", "prev-emp2-name", "footer-confidential", "page-number", "page-num", "a4-page", "a4-print-container", "preview-container", "logo-container"
    ];
    ids.forEach(id => {
      if (document.getElementById(id)) {
        this.elements[id] = document.getElementById(id);
      }
    });
    this.elements.richToolbar = document.getElementById("rich-toolbar");
    this.canvas = this.elements["signature-canvas"];
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    
    // Normalize element names for common ones
    if (!this.elements["document-type"] && this.elements["doc-type"]) this.elements["document-type"] = this.elements["doc-type"];
    if (!this.elements["date"] && this.elements["input-date"]) this.elements["date"] = this.elements["input-date"];
    if (!this.elements["ref-number"] && this.elements["input-ref"]) this.elements["ref-number"] = this.elements["input-ref"];
    if (!this.elements["recipient-name"] && this.elements["input-recipient-name"]) this.elements["recipient-name"] = this.elements["input-recipient-name"];
    if (!this.elements["recipient-address"] && this.elements["input-recipient-address"]) this.elements["recipient-address"] = this.elements["input-recipient-address"];
    if (!this.elements["employee-id"] && this.elements["input-recipient-id"]) this.elements["employee-id"] = this.elements["input-recipient-id"];
    if (!this.elements["position"] && this.elements["input-recipient-position"]) this.elements["position"] = this.elements["input-recipient-position"];
    if (!this.elements["department"] && this.elements["input-recipient-dept"]) this.elements["department"] = this.elements["input-recipient-dept"];
    if (!this.elements["rep-name"] && this.elements["input-sender-name"]) this.elements["rep-name"] = this.elements["input-sender-name"];
    if (!this.elements["designation"] && this.elements["input-sender-title"]) this.elements["designation"] = this.elements["input-sender-title"];
    if (!this.elements["subject"] && this.elements["input-subject"]) this.elements["subject"] = this.elements["input-subject"];
    if (!this.elements["content-editor"] && this.elements["content-editor-main"]) this.elements["content-editor"] = this.elements["content-editor-main"];
    if (!this.elements["logo-upload"] && (this.elements["logo-file"] || this.elements["logo-upload"])) this.elements["logo-upload"] = this.elements["logo-file"] || this.elements["logo-upload"];
    if (!this.elements["hr-sig-upload"] && this.elements["sig-file"]) this.elements["hr-sig-upload"] = this.elements["sig-file"];
    if (!this.elements["prev-hr-sig"] && this.elements["prev-hr-sig"]) { /* ok */ }
    if (!this.elements["prev-confidential-wrap"] && this.elements["prev-conf"]) this.elements["prev-confidential-wrap"] = this.elements["prev-conf"];
    if (!this.elements["prev-recipient-name"] && this.elements["prev-rec-name"]) this.elements["prev-recipient-name"] = this.elements["prev-rec-name"];
    if (!this.elements["prev-recipient-address"] && this.elements["prev-rec-addr"]) this.elements["prev-recipient-address"] = this.elements["prev-rec-addr"];
    if (!this.elements["prev-employee-id"] && this.elements["prev-rec-id"]) this.elements["prev-employee-id"] = this.elements["prev-rec-id"];
    if (!this.elements["prev-position"] && this.elements["prev-rec-pos"]) this.elements["prev-position"] = this.elements["prev-rec-pos"];
    if (!this.elements["prev-content"] && this.elements["prev-sections"]) this.elements["prev-content"] = this.elements["prev-sections"];
    if (!this.elements["a4-page"] && this.elements["a4-print-container"]) this.elements["a4-page"] = this.elements["a4-print-container"];
  }

  setupEventListeners() {
    // Basic fields
    this.bindInput("document-type", "documentType", true);
    this.bindInput("date", "date", true);
    this.bindInput("ref-number", "refNumber");
    this.bindCheckbox("confidential", "confidential");
    this.bindInput("recipient-name", "recipientName", true);
    this.bindTextarea("recipient-address", "recipientAddress");
    this.bindInput("employee-id", "employeeId");
    this.bindInput("position", "position");
    this.bindInput("department", "department");
    this.bindInput("rep-name", "repName");
    this.bindInput("designation", "designation");
    this.bindInput("subject", "subject", true);

    if (this.elements["content-editor"]) {
      this.elements["content-editor"].addEventListener("input", () => {
        this.state.content = this.elements["content-editor"].innerText || "";
        this.state.contentHTML = this.elements["content-editor"].innerHTML || "";
        this.updateWordCharPageCounts();
        this.updatePreview();
        this.validateContent();
        this.updateDocumentStatus();
      });
      this.elements["content-editor"].addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text/plain");
        document.execCommand("insertText", false, text);
      });
    }

    // Toolbar
    if (this.elements.richToolbar) {
      this.elements.richToolbar.querySelectorAll("button[data-command]").forEach((btn) => {
        btn.addEventListener("click", () => this.applyFormat(btn.dataset.command));
      });
      const sel = this.elements.richToolbar.querySelector('select[data-command="formatBlock"]');
      if (sel) {
        sel.addEventListener("change", () => {
          this.applyFormat(sel.dataset.command, sel.value);
          sel.value = "p";
        });
      }
    }

    // Logo
    if (this.elements["logo-upload"]) this.elements["logo-upload"].addEventListener("change", (e) => this.handleLogoUpload(e));
    if (this.elements["btn-upload-logo"]) this.elements["btn-upload-logo"].addEventListener("click", () => this.elements["logo-upload"].click());
    if (this.elements["btn-remove-logo"]) this.elements["btn-remove-logo"].addEventListener("click", () => this.removeLogo());
    if (this.elements["btn-reset-logo"]) this.elements["btn-reset-logo"].addEventListener("click", () => this.resetLogo());

    // Signatures HR
    this.setupSig("hr");
    this.setupSig("emp");
    this.setupSig("emp2");

    // Footer checkboxes
    if (this.elements["show-confidential"]) this.elements["show-confidential"].addEventListener("change", (e) => { this.state.showConfidential = e.target.checked; this.updatePreview(); });
    if (this.elements["show-page-number"]) this.elements["show-page-number"].addEventListener("change", (e) => { this.state.showPageNumber = e.target.checked; this.updatePreview(); });

    // Actions
    if (this.elements["btn-gen-ref"]) this.elements["btn-gen-ref"].addEventListener("click", () => this.generateRefNumber());
    if (this.elements["btn-new"]) this.elements["btn-new"].addEventListener("click", () => this.newDocument());
    if (this.elements["btn-save"]) this.elements["btn-save"].addEventListener("click", () => this.saveDraft());
    if (this.elements["btn-load"]) this.elements["btn-load"].addEventListener("click", () => this.openDraftModal());
    if (this.elements["btn-print"]) this.elements["btn-print"].addEventListener("click", () => this.handlePrint());
    if (this.elements["btn-pdf"]) this.elements["btn-pdf"].addEventListener("click", () => this.handlePdf());
    if (this.elements["btn-clear"]) this.elements["btn-clear"].addEventListener("click", () => this.clearForm());
    if (this.elements["btn-duplicate"]) this.elements["btn-duplicate"].addEventListener("click", () => this.duplicateDocument());
    if (this.elements["btn-delete-draft"]) this.elements["btn-delete-draft"].addEventListener("click", () => this.deleteCurrentDraft());

    // Zoom
    if (this.elements["btn-zoom-in"]) this.elements["btn-zoom-in"].addEventListener("click", () => this.zoomIn());
    if (this.elements["btn-zoom-out"]) this.elements["btn-zoom-out"].addEventListener("click", () => this.zoomOut());
    if (this.elements["btn-fit-page"]) this.elements["btn-fit-page"].addEventListener("click", () => this.fitToPage());

    // Mobile
    if (this.elements["btn-show-editor"]) this.elements["btn-show-editor"].addEventListener("click", () => { document.body.classList.remove("show-preview"); document.body.classList.add("show-editor"); });
    if (this.elements["btn-show-preview"]) this.elements["btn-show-preview"].addEventListener("click", () => { document.body.classList.remove("show-editor"); document.body.classList.add("show-preview"); });
    if (this.elements["btn-toggle-preview"]) this.elements["btn-toggle-preview"].addEventListener("click", () => { document.body.classList.toggle("show-preview"); document.body.classList.toggle("show-editor"); });

    // Modal
    this.setupModalEvents();
    this.setupCanvas();
  }

  bindInput(id, key, required = false) {
    const el = this.elements[id];
    if (!el) return;
    el.addEventListener("input", () => {
      this.state[key] = el.value;
      this.updatePreview();
      if (required) this.validateField(id, this.getErrorId(id));
      this.updateDocumentStatus();
    });
  }

  bindTextarea(id, key) {
    const el = this.elements[id];
    if (!el) return;
    el.addEventListener("input", () => { this.state[key] = el.value; this.updatePreview(); });
  }

  bindCheckbox(id, key) {
    const el = this.elements[id];
    if (!el) return;
    el.addEventListener("change", () => { this.state[key] = el.checked; this.updatePreview(); });
  }

  getErrorId(id) {
    const map = { "document-type": "error-doc-type", date: "error-date", "recipient-name": "error-recipient", subject: "error-subject" };
    return map[id] || null;
  }

  validateField(id, errId) {
    const el = this.elements[id];
    const err = this.elements[errId];
    if (!el || !err) return;
    if (!el.value || el.value.trim() === "") { err.textContent = "This field is required"; el.classList.add("error"); return false; }
    err.textContent = ""; el.classList.remove("error"); return true;
  }

  validateContent() {
    const err = this.elements["error-content"];
    if (!err) return;
    const has = (this.elements["content-editor"]?.innerText || "").trim().length > 0;
    err.textContent = has ? "" : "Content is required";
    return has;
  }

  validateAll() {
    let ok = true;
    ok = this.validateField("document-type", "error-doc-type") && ok;
    ok = this.validateField("date", "error-date") && ok;
    ok = this.validateField("recipient-name", "error-recipient") && ok;
    ok = this.validateField("subject", "error-subject") && ok;
    ok = this.validateContent() && ok;
    return ok;
  }

  updateDocumentStatus() {
    const st = this.elements["doc-status"];
    if (!st) return;
    const ready = this.validateAll();
    if (ready) { st.textContent = "Ready"; st.style.background = "#dcfce7"; st.style.color = "#166534"; }
    else { st.textContent = "Draft"; st.style.background = "#e0f2fe"; st.style.color = "#0369a1"; }
  }

  applyFormat(command, value = null) {
    const el = this.elements["content-editor"];
    if (!el) return;
    el.focus();
    if (command === "formatBlock") { document.execCommand("formatBlock", false, value); }
    else if (command === "increaseFontSize" || command === "decreaseFontSize") { /* simple spacing approx not needed */ }
    else { document.execCommand(command, false, value); }
    this.state.contentHTML = el.innerHTML;
    this.state.content = el.innerText;
    this.updateWordCharPageCounts();
    this.updatePreview();
  }

  updateWordCharPageCounts() {
    const txt = this.elements["content-editor"]?.innerText || "";
    const words = txt.trim() === "" ? 0 : txt.trim().split(/\s+/).length;
    const chars = txt.length;
    const pages = Math.max(1, Math.ceil(chars / 2500));
    if (this.elements["word-count"]) this.elements["word-count"].textContent = words;
    if (this.elements["char-count"]) this.elements["char-count"].textContent = chars;
    if (this.elements["page-count"]) this.elements["page-count"].textContent = pages;
    if (this.elements["page-num"]) this.elements["page-num"].textContent = pages;
  }

  updatePreview() {
    const confEl = this.elements["confidential"] || this.elements["input-conf"];
    const dateEl = this.elements["date"] || this.elements["input-date"];
    const refEl = this.elements["ref-number"] || this.elements["input-ref"];
    const recName = this.elements["recipient-name"] || this.elements["input-recipient-name"];
    const recAddr = this.elements["recipient-address"] || this.elements["input-recipient-address"];
    const recId = this.elements["employee-id"] || this.elements["input-recipient-id"];
    const recPos = this.elements["position"] || this.elements["input-recipient-position"];
    const subj = this.elements["subject"] || this.elements["input-subject"];
    const docTypeEl = this.elements["document-type"] || this.elements["doc-type"];
    const editorEl = this.elements["content-editor"] || this.elements["content-editor-main"];
    const repName = this.elements["rep-name"] || this.elements["input-sender-name"];
    const repTitle = this.elements["designation"] || this.elements["input-sender-title"];
    
    if (this.elements["prev-date"]) this.elements["prev-date"].textContent = dateEl?.value || "";
    if (this.elements["prev-ref"]) this.elements["prev-ref"].textContent = refEl?.value ? `Ref: ${refEl.value}` : "";
    if (this.elements["prev-confidential-wrap"]) {
      const isConf = confEl?.checked || (confEl?.type === "select-one" && confEl.value !== "General");
      this.elements["prev-confidential-wrap"].hidden = !isConf;
      this.elements["prev-confidential-wrap"].style.display = isConf ? "block" : "none";
      if (confEl?.type === "select-one") this.elements["prev-confidential-wrap"].textContent = confEl.value;
    }
    if (this.elements["prev-conf"]) {
      const isConf = confEl?.checked || (confEl?.type === "select-one" && confEl.value !== "General");
      this.elements["prev-conf"].style.display = isConf ? "block" : "none";
      if (confEl?.type === "select-one") this.elements["prev-conf"].textContent = confEl.value;
    }
    if (this.elements["prev-recipient-name"]) this.elements["prev-recipient-name"].textContent = recName?.value || "";
    if (this.elements["prev-rec-name"]) this.elements["prev-rec-name"].textContent = recName?.value || "";
    if (this.elements["prev-recipient-address"]) this.elements["prev-recipient-address"].textContent = recAddr?.value || "";
    if (this.elements["prev-rec-addr"]) this.elements["prev-rec-addr"].textContent = recAddr?.value || "";
    if (this.elements["prev-employee-id"]) this.elements["prev-employee-id"].textContent = recId?.value ? "Employee ID: " + recId.value : "";
    if (this.elements["prev-rec-id"]) this.elements["prev-rec-id"].textContent = recId?.value ? "Employee ID: " + recId.value : "";
    if (this.elements["prev-position"]) this.elements["prev-position"].textContent = recPos?.value || "";
    if (this.elements["prev-rec-pos"]) this.elements["prev-rec-pos"].textContent = recPos?.value || "";
    if (this.elements["prev-subject"]) this.elements["prev-subject"].textContent = subj?.value || docTypeEl?.value || "";
    if (this.elements["prev-doc-type"]) this.elements["prev-doc-type"].textContent = docTypeEl?.value || "";
    const contentHtml = editorEl?.innerHTML || "";
    if (this.elements["prev-content"]) this.elements["prev-content"].innerHTML = contentHtml;
    if (this.elements["prev-sections"]) this.elements["prev-sections"].innerHTML = contentHtml;
    if (this.elements["prev-hr-name"]) this.elements["prev-hr-name"].textContent = repName?.value || "";
    if (this.elements["prev-hr-title"]) this.elements["prev-hr-title"].textContent = repTitle?.value || "";
    if (this.elements["prev-emp-name"]) this.elements["prev-emp-name"].textContent = recName?.value || "";
    if (this.elements["prev-emp2-name"]) this.elements["prev-emp2-name"].textContent = recName?.value || "Witness";
    if (this.elements["footer-confidential"]) {
      const isConf = confEl?.checked || (confEl?.type === "select-one" && confEl.value !== "General");
      this.elements["footer-confidential"].style.display = isConf ? "block" : "none";
    }
    if (this.elements["page-number"]) {
      const showPage = this.elements["show-page-number"]?.checked;
      this.elements["page-number"].hidden = !showPage;
    }
    this.renderLogoPreview();
    this.renderSigPreviews();
  }

  generateRefNumber() {
    const d = new Date();
    const y = d.getFullYear().toString().slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const r = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const ref = `BH-${y}${m}${day}-${r}`;
    if (this.elements["ref-number"]) this.elements["ref-number"].value = ref;
    this.state.refNumber = ref;
    this.updatePreview();
  }

  newDocument() {
    if (!confirm("Create new document? Unsaved changes will be lost.")) return;
    this.clearForm();
  }

  clearForm() {
    const f = (id, val = "") => { if (this.elements[id]) this.elements[id].value = val; };
    f("document-type", "");
    f("date", new Date().toISOString().split("T")[0]);
    f("ref-number", "");
    if (this.elements["confidential"]) this.elements["confidential"].checked = false;
    f("recipient-name", ""); f("recipient-address", ""); f("employee-id", ""); f("position", "");
    f("department", ""); f("rep-name", ""); f("designation", "");
    f("subject", "");
    if (this.elements["content-editor"]) this.elements["content-editor"].innerHTML = "";
    if (this.elements["show-confidential"]) this.elements["show-confidential"].checked = true;
    if (this.elements["show-page-number"]) this.elements["show-page-number"].checked = false;
    this.clearAllSigs();
    this.resetLogo();
    this.state.currentDraftId = null;
    document.querySelectorAll(".error-msg").forEach((e) => (e.textContent = ""));
    this.updateWordCharPageCounts();
    this.updatePreview();
    this.updateDocumentStatus();
  }

  // Logo
  handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => { this.state.logoData = ev.target.result; this.renderLogoPreview(); this.updatePreview(); };
    r.readAsDataURL(file);
  }

  renderLogoPreview() {
    const logoEl = this.elements["logo-img"] || this.elements["prev-logo"];
    const defaultEl = this.elements["default-logo"];
    if (this.state.logoData && this.state.logoData !== "Logo.png") {
      if (logoEl) { logoEl.src = this.state.logoData; logoEl.hidden = false; }
      if (defaultEl) defaultEl.hidden = true;
    } else {
      if (logoEl) { logoEl.src = "Logo.png"; logoEl.hidden = false; }
      if (defaultEl) defaultEl.hidden = true;
    }
  }

  removeLogo() { this.state.logoData = null; if (this.elements["logo-upload"]) this.elements["logo-upload"].value = ""; this.renderLogoPreview(); this.updatePreview(); }
  resetLogo() { this.state.logoData = "Logo.png"; if (this.elements["logo-upload"]) this.elements["logo-upload"].value = ""; this.renderLogoPreview(); this.updatePreview(); }

  // Sigs
  setupSig(type) {
    const up = this.elements[`${type}-sig-upload`], bu = this.elements[`btn-${type}-upload`], bd = this.elements[`btn-${type}-draw`], bc = this.elements[`btn-${type}-clear`];
    if (bu && up) bu.addEventListener("click", () => up.click());
    if (up) up.addEventListener("change", (e) => this.handleSigUpload(e, type));
    if (bd) bd.addEventListener("click", () => this.openDraw(type));
    if (bc) bc.addEventListener("click", () => this.clearSig(type));
  }

  handleSigUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => { this.state.signatures[type] = ev.target.result; if (type === "emp2") this.state.showEmp2 = true; this.renderSigPreviews(); this.updatePreview(); };
    r.readAsDataURL(file);
  }

  clearSig(type) {
    this.state.signatures[type] = null;
    if (type === "emp2") this.state.showEmp2 = false;
    if (this.elements[`${type}-sig-upload`]) this.elements[`${type}-sig-upload`].value = "";
    this.renderSigPreviews();
    this.updatePreview();
  }

  clearAllSigs() { ["hr","emp","emp2"].forEach(t => this.clearSig(t)); }

  renderSigPreviews() {
    ["hr","emp","emp2"].forEach(t => {
      const prev = this.elements[`prev-${t}-sig`], edit = this.elements[`${t}-sig-preview`];
      const data = this.state.signatures[t];
      const html = data ? `<img src="${data}" alt="Signature" style="max-width:180px;max-height:55px;">` : "";
      if (prev) { prev.innerHTML = html; }
      if (edit) { edit.innerHTML = html; }
    });
    if (this.elements["emp2-sig-block"]) this.elements["emp2-sig-block"].hidden = !this.state.showEmp2;
  }

  // Canvas
  setupCanvas() {
    if (!this.canvas || !this.ctx) return;
    this.canvas.width = 600; this.canvas.height = 200;
    this.ctx.lineWidth = 2; this.ctx.lineCap = "round"; this.ctx.lineJoin = "round"; this.ctx.strokeStyle = "#000";
    this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDraw());
    this.canvas.addEventListener("mouseout", () => this.stopDraw());
    this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); const t=e.touches[0], r=this.canvas.getBoundingClientRect(); this.startDraw({ clientX:t.clientX, clientY:t.clientY, rect:r }); }, { passive:false });
    this.canvas.addEventListener("touchmove", (e) => { e.preventDefault(); const t=e.touches[0], r=this.canvas.getBoundingClientRect(); this.draw({ clientX:t.clientX, clientY:t.clientY, rect:r }); }, { passive:false });
    this.canvas.addEventListener("touchend", (e) => { e.preventDefault(); this.stopDraw(); });
  }

  getPt(e) {
    const rect = e.rect || this.canvas.getBoundingClientRect();
    const sx = this.canvas.width / rect.width, sy = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * sx, y = (e.clientY - rect.top) * sy;
    return {x,y};
  }

  startDraw(e) {
    this.drawing.active = true;
    const p = this.getPt(e);
    this.drawing.currentPath = [p];
  }

  draw(e) {
    if (!this.drawing.active) return;
    const p = this.getPt(e);
    this.drawing.currentPath.push(p);
    this.redraw();
  }

  stopDraw() {
    if (!this.drawing.active) return;
    this.drawing.active = false;
    if (this.drawing.currentPath.length > 1) this.drawing.paths.push(this.drawing.currentPath.slice());
    this.drawing.currentPath = [];
  }

  redraw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.drawing.paths.forEach(path => { if (path.length>0) { this.ctx.beginPath(); this.ctx.moveTo(path[0].x,path[0].y); for (let i=1;i<path.length;i++) this.ctx.lineTo(path[i].x,path[i].y); this.ctx.stroke(); } });
    if (this.drawing.currentPath.length>0) { this.ctx.beginPath(); this.ctx.moveTo(this.drawing.currentPath[0].x,this.drawing.currentPath[0].y); for (let i=1;i<this.drawing.currentPath.length;i++) this.ctx.lineTo(this.drawing.currentPath[i].x,this.drawing.currentPath[i].y); this.ctx.stroke(); }
  }

  clearCanvas() { if (this.ctx) this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); this.drawing.paths = []; this.drawing.currentPath = []; }
  undoCanvas() { if (this.drawing.paths.length>0) { this.drawing.paths.pop(); this.redraw(); } }

  openDraw(type) { this.drawing.target = type; this.clearCanvas(); if (this.elements["draw-modal"]) this.elements["draw-modal"].classList.add("active"); document.body.style.overflow = "hidden"; }
  closeDrawModal() { if (this.elements["draw-modal"]) this.elements["draw-modal"].classList.remove("active"); document.body.style.overflow = "auto"; this.drawing.target = null; }

  saveDrawing() {
    if (this.drawing.paths.length === 0) { alert("Please draw a signature first"); return; }
    const tmp = document.createElement("canvas"); tmp.width = this.canvas.width; tmp.height = this.canvas.height;
    const tctx = tmp.getContext("2d");
    tctx.lineWidth = 2; tctx.lineCap = "round"; tctx.lineJoin = "round"; tctx.strokeStyle = "#000";
    this.drawing.paths.forEach(path => { if (path.length>0) { tctx.beginPath(); tctx.moveTo(path[0].x,path[0].y); for (let i=1;i<path.length;i++) tctx.lineTo(path[i].x,path[i].y); tctx.stroke(); } });
    const url = tmp.toDataURL("image/png");
    if (this.drawing.target) {
      this.state.signatures[this.drawing.target] = url;
      if (this.drawing.target === "emp2") this.state.showEmp2 = true;
    }
    this.renderSigPreviews(); this.updatePreview();
    this.closeDrawModal();
  }

  setupModalEvents() {
    if (this.elements["btn-close-modal"]) this.elements["btn-close-modal"].addEventListener("click", () => this.closeDrawModal());
    if (this.elements["btn-cancel-draw"]) this.elements["btn-cancel-draw"].addEventListener("click", () => this.closeDrawModal());
    if (this.elements["btn-save-draw"]) this.elements["btn-save-draw"].addEventListener("click", () => this.saveDrawing());
    if (this.elements["btn-clear-canvas"]) this.elements["btn-clear-canvas"].addEventListener("click", () => this.clearCanvas());
    if (this.elements["btn-undo-canvas"]) this.elements["btn-undo-canvas"].addEventListener("click", () => this.undoCanvas());
    if (this.elements["draw-modal"]) this.elements["draw-modal"].addEventListener("click", (e) => { if (e.target.id === "draw-modal") this.closeDrawModal(); });
    if (this.elements["draft-modal"]) this.elements["draft-modal"].addEventListener("click", (e) => { if (e.target.id === "draft-modal") this.closeDraftModal(); });
    if (this.elements["btn-close-draft-modal"]) this.elements["btn-close-draft-modal"].addEventListener("click", () => this.closeDraftModal());
    if (this.elements["btn-cancel-load"]) this.elements["btn-cancel-load"].addEventListener("click", () => this.closeDraftModal());
  }

  // Drafts
  serializeDraft() {
    return {
      id: this.state.currentDraftId || "draft_" + Date.now(),
      createdAt: new Date().toISOString(),
      documentType: this.elements["document-type"]?.value || "",
      date: this.elements["date"]?.value || "",
      refNumber: this.elements["ref-number"]?.value || "",
      confidential: this.elements["confidential"]?.checked || false,
      recipientName: this.elements["recipient-name"]?.value || "",
      recipientAddress: this.elements["recipient-address"]?.value || "",
      employeeId: this.elements["employee-id"]?.value || "",
      position: this.elements["position"]?.value || "",
      department: this.elements["department"]?.value || "",
      repName: this.elements["rep-name"]?.value || "",
      designation: this.elements["designation"]?.value || "",
      subject: this.elements["subject"]?.value || "",
      contentHTML: this.elements["content-editor"]?.innerHTML || "",
      showConfidential: this.elements["show-confidential"]?.checked !== false,
      showPageNumber: this.elements["show-page-number"]?.checked || false,
      logoData: this.state.logoData,
      signatures: this.state.signatures,
      showEmp2: this.state.showEmp2,
    };
  }

  deserializeDraft(d) {
    if (!d) return;
    const set = (id, v) => { if (this.elements[id] && v !== undefined) { if (this.elements[id].type === "checkbox") this.elements[id].checked = !!v; else this.elements[id].value = v; } };
    set("document-type", d.documentType); set("date", d.date); set("ref-number", d.refNumber); set("confidential", d.confidential);
    set("recipient-name", d.recipientName); set("recipient-address", d.recipientAddress); set("employee-id", d.employeeId); set("position", d.position);
    set("department", d.department); set("rep-name", d.repName); set("designation", d.designation); set("subject", d.subject);
    if (this.elements["content-editor"]) this.elements["content-editor"].innerHTML = d.contentHTML || "";
    set("show-confidential", d.showConfidential); set("show-page-number", d.showPageNumber);
    this.state.logoData = d.logoData || "Logo.png";
    this.state.signatures = d.signatures || {hr:null,emp:null,emp2:null};
    this.state.showEmp2 = !!d.showEmp2;
    this.state.currentDraftId = d.id;
    this.updateWordCharPageCounts();
    this.updatePreview();
    this.updateDocumentStatus();
  }

  async loadDraftsFromStorage() { 
    try { 
      const res = await fetch("/api/drafts");
      const data = await res.json();
      this.state.drafts = data.success ? data.drafts : [];
    } catch { 
      this.state.drafts = []; 
    } 
  }
  
  saveDraftsToStorage() { /* API call is made in saveDraft */ }

  async saveDraft() {
    const d = this.serializeDraft();
    const i = this.state.drafts.findIndex(x => x.id === d.id);
    if (i >= 0) this.state.drafts[i] = d; else this.state.drafts.push(d);
    
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d)
      });
      const data = await res.json();
      if (data.success) {
        this.state.currentDraftId = d.id;
        alert("Draft saved successfully to backend!");
        this.updateDocumentStatus();
      } else {
        alert("Failed to save draft to backend.");
      }
    } catch (e) {
      alert("Error saving draft.");
    }
  }

  openDraftModal() {
    this.loadDraftsFromStorage();
    const list = this.elements["draft-list"], no = this.elements["no-drafts"];
    if (!this.state.drafts.length) { if (list) list.innerHTML = ""; if (no) no.hidden = false; }
    else {
      if (no) no.hidden = true;
      list.innerHTML = this.state.drafts.map(d => {
        const dt = new Date(d.createdAt).toLocaleString();
        const t = (d.documentType || "Untitled") + " - " + (d.recipientName || "No Recipient");
        return `<div class="draft-item" data-id="${d.id}"><div class="draft-item-title">${t}</div><div class="draft-item-meta">${dt}</div></div>`;
      }).join("");
      list.querySelectorAll(".draft-item").forEach(it => it.addEventListener("click", () => { this.loadDraft(it.dataset.id); this.closeDraftModal(); }));
    }
    if (this.elements["draft-modal"]) this.elements["draft-modal"].classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeDraftModal() { if (this.elements["draft-modal"]) this.elements["draft-modal"].classList.remove("active"); document.body.style.overflow = "auto"; }

  loadDraft(id) {
    const d = this.state.drafts.find(x => x.id === id);
    if (d) { this.deserializeDraft(d); alert("Draft loaded successfully!"); }
    else alert("Draft not found");
  }

  duplicateDocument() {
    const d = this.serializeDraft();
    d.id = "draft_" + Date.now();
    d.refNumber = "";
    this.state.drafts.push(d);
    this.saveDraftsToStorage();
    this.state.currentDraftId = d.id;
    if (this.elements["ref-number"]) this.elements["ref-number"].value = "";
    this.updatePreview();
    alert("Document duplicated successfully!");
  }

  async deleteCurrentDraft() {
    if (!this.state.currentDraftId) { alert("No draft currently loaded"); return; }
    if (!confirm("Delete this draft?")) return;
    try {
      const res = await fetch(`/api/drafts?id=${this.state.currentDraftId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        this.state.drafts = this.state.drafts.filter(x => x.id !== this.state.currentDraftId);
        this.clearForm();
        alert("Draft deleted successfully from backend!");
      } else {
        alert("Failed to delete draft from backend.");
      }
    } catch (e) {
      alert("Error deleting draft.");
    }
  }

  // Export
  handlePrint() {
    if (!this.validateAll()) { alert("Please fill all required fields"); return; }
    this.updatePreview();
    window.print();
  }

  async handlePdf() {
    if (!this.validateAll()) { alert("Please fill all required fields"); return; }
    this.updatePreview();
    const { jsPDF } = window.jspdf;
    const page = this.elements["a4-page"];
    if (!page) return;
    const clone = page.cloneNode(true);
    clone.style.transform = "none"; clone.style.boxShadow = "none"; clone.style.background = "#fff";
    document.body.appendChild(clone);
    try {
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, logging: false, allowTaint: true, backgroundColor: "#fff" });
      document.body.removeChild(clone);
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      if (ih <= ph) { pdf.addImage(img, "PNG", 0, 0, pw, ih); }
      else {
        let left = ih, pos = 0;
        pdf.addImage(img, "PNG", 0, pos, pw, ih); left -= ph;
        while (left > 0) { pos -= ph; pdf.addPage(); pdf.addImage(img, "PNG", 0, pos, pw, ih); left -= ph; }
      }
      const dt = this.elements["document-type"]?.value.replace(/\s+/g, "_") || "Document";
      const rn = (this.elements["recipient-name"]?.value || "Recipient").replace(/\s+/g, "_");
      const dte = this.elements["date"]?.value || "date";
      pdf.save(`${dt}_${rn}_${dte}.pdf`);
    } catch (e) {
      document.body.removeChild(clone);
      alert("PDF generation failed");
    }
  }

  // Zoom
  zoomIn() { this.state.zoom = Math.min(2, this.state.zoom + 0.1); this.applyZoom(); }
  zoomOut() { this.state.zoom = Math.max(0.5, this.state.zoom - 0.1); this.applyZoom(); }
  fitToPage() {
    const c = this.elements["preview-container"], p = this.elements["a4-page"];
    if (!c || !p) return;
    const cw = c.clientWidth - 40, pw = p.scrollWidth;
    this.state.zoom = Math.max(0.3, Math.min(2, cw / pw));
    this.applyZoom();
  }
  applyZoom() {
    const p = this.elements["a4-page"];
    if (p) { p.style.transform = `scale(${this.state.zoom})`; p.style.transformOrigin = "top center"; }
    if (this.elements["zoom-level"]) this.elements["zoom-level"].textContent = Math.round(this.state.zoom * 100) + "%";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!window.app) window.app = new BehaviorLetterApp();
});
BehaviorLetterApp.prototype.togglePreview = function(){
  const p=document.getElementById('preview-panel');
  if(!p)return;
  const hidden = p.style.display==='none' || p.classList.contains('hidden');
  if(hidden){ p.style.display='block'; p.classList.remove('hidden'); }
  else { p.style.display='none'; p.classList.add('hidden'); }
};
