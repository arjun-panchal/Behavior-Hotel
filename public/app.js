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
      showSubject: true,
      showHrSignature: true,
      showEmployeeSignature: true,
      logoData: "Logo.png",
      logoMode: "watermark",
signatures: {
        hr: null,
        emp: null,
        emp2: null,
      },
      signatureModes: { hr: "upload", emp: "upload", emp2: "upload" },
      signatureNames: { hr: "", emp: "", emp2: "" },
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
    const dateEl = this.elements["date"];
    if (dateEl && !dateEl.value) dateEl.value = this.state.date;
    this.generateRefNumber();
    this.updateWordCharPageCounts();
    this.updatePreview();
    this.validateAll();
    this._ensureStorageFolders();
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
      "hr-sig-mode", "emp-sig-mode", "hr-sig-name", "emp-sig-name", "hr-sig-upload-wrap", "emp-sig-upload-wrap", "hr-sig-name-wrap", "emp-sig-name-wrap", "hr-sig-live-preview", "emp-sig-live-preview", "hr-sig-remove", "emp-sig-remove",
      "show-confidential", "show-page-number", "show-subject", "show-hr-signature", "show-employee-signature",
      "btn-new", "btn-save", "btn-load", "btn-print", "btn-pdf",
      "btn-clear", "btn-duplicate", "btn-delete-draft",
      "btn-zoom-in", "btn-zoom-out", "btn-fit-page", "zoom-level",
      "btn-show-editor", "btn-show-preview", "btn-toggle-preview",
      "draw-modal", "btn-close-modal", "btn-cancel-draw", "btn-save-draw", "btn-clear-canvas", "btn-undo-canvas", "signature-canvas",
      "draft-modal", "btn-close-draft-modal", "btn-cancel-load", "draft-list", "no-drafts", "draft-modal-notice",
      "print-file-modal", "btn-close-print-file", "btn-cancel-print-file", "print-file-list", "no-print-files", "print-file-notice",
      "doc-status",
      "error-doc-type", "error-date", "error-recipient", "error-subject", "error-content",
      "prev-date", "prev-ref", "prev-confidential-wrap", "prev-conf", "prev-recipient-name", "prev-rec-name", "prev-recipient-address", "prev-rec-addr", "prev-employee-id", "prev-rec-id", "prev-position", "prev-rec-pos", "prev-subject", "prev-subject-line", "prev-doc-type", "prev-content", "prev-sections", "prev-hr-name", "prev-hr-title", "prev-emp-name", "prev-emp2-name", "footer-confidential", "page-number", "page-num", "a4-page", "a4-print-container", "preview-container", "logo-file", "logo-remove", "prev-logo", "logo-mode", "prev-logo-watermark", "prev-hr-signature-block", "prev-employee-signature-block"
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
    const customTypeInput = document.getElementById("custom-doc-type-input");
    if (customTypeInput) customTypeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); this.addDocType(); }
    });
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
    ["hr", "emp"].forEach((t) => {
      const mode = this.elements[`${t}-sig-mode`];
      if (mode) mode.addEventListener("change", () => this.setSignatureMode(t, mode.value));
      const nm = this.elements[`${t}-sig-name`];
      if (nm) nm.addEventListener("input", () => this.setSignatureName(t, nm.value));
      const rm = this.elements[`${t}-sig-remove`];
      if (rm) rm.addEventListener("click", () => this.clearSig(t));
      this._syncSignatureModeUI(t);
    });
    if (this.elements["logo-mode"]) this.elements["logo-mode"].addEventListener("change", () => this.setLogoMode(this.elements["logo-mode"].value));
    if (this.elements["logo-remove"]) this.elements["logo-remove"].addEventListener("click", () => this.removeLogo());

    // Footer checkboxes
if (this.elements["show-confidential"]) this.elements["show-confidential"].addEventListener("change", (e) => { this.state.showConfidential = e.target.checked; this.updatePreview(); });
    if (this.elements["show-page-number"]) this.elements["show-page-number"].addEventListener("change", (e) => { this.state.showPageNumber = e.target.checked; this.updatePreview(); });
    if (this.elements["show-subject"]) this.elements["show-subject"].addEventListener("change", (e) => { this.state.showSubject = e.target.checked; this.updatePreview(); });
    if (this.elements["show-hr-signature"]) this.elements["show-hr-signature"].addEventListener("change", (e) => { this.state.showHrSignature = e.target.checked; this.updatePreview(); });
    if (this.elements["show-employee-signature"]) this.elements["show-employee-signature"].addEventListener("change", (e) => { this.state.showEmployeeSignature = e.target.checked; this.updatePreview(); });

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

    // Email coming-soon overlay
    const emailOverlay = document.getElementById("email-coming-overlay");
    if (emailOverlay) {
      emailOverlay.addEventListener("click", (e) => { if (e.target === emailOverlay) this.closeEmailComing(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.closeEmailComing(); });
    }


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
    if (this._flag("show-subject")) ok = this.validateField("subject", "error-subject") && ok;
    else if (this.elements["error-subject"]) { this.elements["error-subject"].textContent = ""; this.elements["subject"]?.classList.remove("error"); }
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

  // Custom document types
  get _docTypeSelect() { return this.elements["document-type"]; }

  handleDocTypeChange(select) {
    const el = select || this._docTypeSelect;
    if (!el) return;
    const isCustomChoice = el.value === "__custom__";
    this._syncCustomDocTypeUI(el);
    if (isCustomChoice) {
      const input = document.getElementById("custom-doc-type-input");
      if (input) { input.value = ""; input.focus(); }
    } else {
      this.state.documentType = el.value;
      this.validateField("document-type", this.getErrorId("document-type"));
      this.updatePreview();
      this.updateDocumentStatus();
    }
  }

  async addDocType() {
    const select = this._docTypeSelect;
    const input = document.getElementById("custom-doc-type-input");
    if (!select || !input) return;

    const name = (input.value || "").trim();
    if (!name) { input.focus(); return; }
    if (name === "__custom__") { input.value = ""; return; }

    const exists = Array.from(select.options).some(o => o.textContent.trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      await this.uiAlert("This document type already exists.", { type: "warning", title: "Already exists" });
      input.value = "";
      return;
    }

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    opt.dataset.custom = "1";

    const sentinel = Array.from(select.options).find(o => o.value === "__custom__");
    select.insertBefore(opt, sentinel || null);
    if (!this.state.customTypes.includes(name)) this.state.customTypes.push(name);

    select.value = name;
    input.value = "";
    this._syncCustomDocTypeUI(select);
    this.state.documentType = name;
    this.validateField("document-type", this.getErrorId("document-type"));
    this.updatePreview();
    this.updateDocumentStatus();
  }

  async deleteDocType() {
    const select = this._docTypeSelect;
    if (!select) return;
    const current = select.options[select.selectedIndex];
    if (!current || current.dataset.custom !== "1") return;
    if (!(await this.uiConfirm(`Delete document type "${current.textContent}"?`, { type: "warning", title: "Delete document type", okText: "Delete" }))) return;

    const name = current.value;
    current.remove();
    this.state.customTypes = this.state.customTypes.filter(t => t !== name);

    const fallback = Array.from(select.options).find(o => o.value !== "__custom__");
    select.value = fallback ? fallback.value : "";
    this._syncCustomDocTypeUI(select);
    this.state.documentType = select.value;
    this.validateField("document-type", this.getErrorId("document-type"));
    this.updatePreview();
    this.updateDocumentStatus();
  }

  _syncCustomDocTypeUI(select) {
    const controls = document.getElementById("custom-doc-type-controls");
    const delBtn = document.getElementById("del-custom");
    const current = select.options[select.selectedIndex];
    const isCustomChoice = select.value === "__custom__";
    const isCustomType = !!current && current.dataset.custom === "1";

    if (controls) controls.classList.toggle("hidden", !isCustomChoice);
    if (delBtn) delBtn.classList.toggle("hidden", !isCustomType);
  }

  _flag(id) {
    const el = this.elements[id];
    return el ? !!el.checked : true;
  }

  renderPreview() { this.updatePreview(); }

  execCmd(command, value = null) { this.applyFormat(command, value); }

  updateField(key, value) {
    this.state[key] = value;
    this.updatePreview();
  }

  updateConf(value) {
    const confEl = this.elements["input-conf"] || this.elements["confidential"];
    if (confEl && value !== undefined && value !== null) {
      if (confEl.type === "select-one") confEl.value = value;
      else confEl.checked = !!value;
    }
    this.state.confidential = confEl?.type === "select-one" ? (confEl?.value || "") : !!confEl?.checked;
    this.updatePreview();
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
    if (this.elements["prev-ref"]) this.elements["prev-ref"].textContent = refEl?.value ? `Ref: ${refEl.value}` : (refEl?.value || "");
    const isConfSelect = confEl?.type === "select-one";
    const confText = isConfSelect ? (confEl.value || "") : "";
    const showConf = isConfSelect ? !!confText : !!confEl?.checked;
    if (this.elements["prev-confidential-wrap"]) {
      this.elements["prev-confidential-wrap"].hidden = !showConf;
      this.elements["prev-confidential-wrap"].style.display = showConf ? "" : "none";
      if (isConfSelect) this.elements["prev-confidential-wrap"].textContent = confText;
    }
    if (this.elements["prev-conf"]) {
      this.elements["prev-conf"].hidden = !showConf;
      this.elements["prev-conf"].style.display = showConf ? "" : "none";
      if (isConfSelect) this.elements["prev-conf"].textContent = confText;
    }
    if (this.elements["prev-recipient-name"]) this.elements["prev-recipient-name"].textContent = recName?.value || "";
    if (this.elements["prev-rec-name"]) this.elements["prev-rec-name"].textContent = recName?.value || "";
    if (this.elements["prev-recipient-address"]) this.elements["prev-recipient-address"].textContent = recAddr?.value || "";
    if (this.elements["prev-rec-addr"]) this.elements["prev-rec-addr"].textContent = recAddr?.value || "";
    if (this.elements["prev-employee-id"]) this.elements["prev-employee-id"].textContent = recId?.value ? "Employee ID: " + recId.value : "";
    if (this.elements["prev-rec-id"]) this.elements["prev-rec-id"].textContent = recId?.value ? "Employee ID: " + recId.value : "";
    if (this.elements["prev-position"]) this.elements["prev-position"].textContent = recPos?.value ? "Position: " + recPos.value : (recPos?.value || "");
    if (this.elements["prev-rec-pos"]) this.elements["prev-rec-pos"].textContent = recPos?.value || "";
    if (this.elements["prev-subject"]) this.elements["prev-subject"].textContent = subj?.value || "";
    if (this.elements["prev-subject-line"]) {
      const hasSubject = !!(subj?.value || "").trim();
      const showSubj = this._flag("show-subject") && hasSubject;
      this.elements["prev-subject-line"].hidden = !showSubj;
      this.elements["prev-subject-line"].style.display = showSubj ? "" : "none";
    }
    if (this.elements["prev-doc-type"]) this.elements["prev-doc-type"].textContent = docTypeEl?.value || "";
    if (this.elements["prev-content"]) this.elements["prev-content"].innerHTML = editorEl?.innerHTML || "";
    if (this.elements["prev-sections"]) {
      const sectionsHTML = this._sectionsToHTML();
      this.elements["prev-sections"].innerHTML = (editorEl?.innerHTML || "") + sectionsHTML;
    }
    this.renderSigPreviews();
    if (this.elements["prev-hr-name"]) this.elements["prev-hr-name"].textContent = repName?.value || "";
    if (this.elements["prev-hr-title"]) this.elements["prev-hr-title"].textContent = repTitle?.value || "";
    if (this.elements["prev-emp-name"]) this.elements["prev-emp-name"].textContent = recName?.value || "";
    if (this.elements["prev-emp2-name"]) this.elements["prev-emp2-name"].textContent = recName?.value || "Witness";
    if (this.elements["footer-confidential"]) {
      this.elements["footer-confidential"].style.display = showConf ? "block" : "none";
    }
    if (this.elements["prev-hr-signature-block"]) {
      const showHr = this._flag("show-hr-signature");
      this.elements["prev-hr-signature-block"].hidden = !showHr;
      this.elements["prev-hr-signature-block"].style.display = showHr ? "" : "none";
    }
    if (this.elements["prev-employee-signature-block"]) {
      const showEmp = this._flag("show-employee-signature");
      this.elements["prev-employee-signature-block"].hidden = !showEmp;
      this.elements["prev-employee-signature-block"].style.display = showEmp ? "" : "none";
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

  async newDocument() {
    if (!(await this.uiConfirm("Create new document? Unsaved changes will be lost.", { type: "warning", title: "New document", okText: "Create" }))) return;
    this.clearForm();
  }

  showComingSoon({ title, message, icon } = {}) {
    const el = document.getElementById("email-coming-overlay");
    if (!el) return;
    const titleEl = document.getElementById("email-coming-title");
    const msgEl = document.getElementById("email-coming-message");
    const iconEl = document.getElementById("email-coming-icon");
    if (titleEl && title) titleEl.textContent = title;
    if (msgEl && message) msgEl.textContent = message;
    if (iconEl && icon) iconEl.innerHTML = '<i class="fa-solid ' + icon + '"></i>';
    el.classList.add("active");
    el.setAttribute("aria-hidden", "false");
  }

  emailComingSoon() {
    this.showComingSoon({
      title: "Send Email",
      message: "Email this document directly from your dashboard. This feature is currently under development.",
      icon: "fa-envelope"
    });
  }

  emailHistoryComingSoon() {
    this.showComingSoon({
      title: "Email History",
      message: "All sent emails and document history will appear here. This feature is currently under development.",
      icon: "fa-envelope-circle-check"
    });
  }

  profileComingSoon() {
    this.showComingSoon({
      title: "My Profile",
      message: "Manage your profile details and account preferences here. This feature is currently under development.",
      icon: "fa-user"
    });
  }

  settingsComingSoon() {
    this.showComingSoon({
      title: "Settings",
      message: "Application settings and preferences are under development.",
      icon: "fa-gear"
    });
  }

  signOutComingSoon() {
    this.showComingSoon({
      title: "Sign Out",
      message: "Account sign-out will be available once authentication is enabled.",
      icon: "fa-arrow-right-from-bracket"
    });
  }

  printerComingSoon() {
    this.showComingSoon({
      title: "Direct Printing",
      message: "Print documents straight from the dashboard. This feature is currently under development.",
      icon: "fa-print"
    });
  }

  closeEmailComing() {
    const el = document.getElementById("email-coming-overlay");
    if (el) {
      el.classList.remove("active");
      el.setAttribute("aria-hidden", "true");
    }
  }

  uiAlert(message, opts = {}) {
    return this._uiModal(message, Object.assign({ mode: "alert" }, opts));
  }

  uiConfirm(message, opts = {}) {
    return this._uiModal(message, Object.assign({ mode: "confirm" }, opts));
  }

  _uiModal(message, opts = {}) {
    const mode = opts.mode || "alert";
    const type = opts.type || "info";
    return new Promise((resolve) => {
      const overlay = document.getElementById("ui-modal");
      if (!overlay) {
        if (mode === "confirm") resolve(window.confirm(message));
        else { window.alert(message); resolve(true); }
        return;
      }
      const card = overlay.querySelector(".bh-ui-card");
      const iconEl = overlay.querySelector(".bh-ui-icon");
      const titleEl = document.getElementById("ui-modal-title");
      const msgEl = document.getElementById("ui-modal-message");
      const okBtn = document.getElementById("ui-modal-ok");
      const cancelBtn = document.getElementById("ui-modal-cancel");
      const icons = { info: "fa-circle-info", success: "fa-circle-check", error: "fa-circle-xmark", warning: "fa-triangle-exclamation" };
      const defaultTitles = { info: "Notice", success: "Success", error: "Error", warning: "Warning" };

      if (card) card.setAttribute("data-variant", type);
      if (iconEl) iconEl.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i>';
      if (titleEl) titleEl.textContent = opts.title || (mode === "confirm" ? "Please Confirm" : (defaultTitles[type] || "Notice"));
      if (msgEl) msgEl.textContent = message || "";
      okBtn.textContent = opts.okText || (mode === "confirm" ? "Confirm" : "OK");
      cancelBtn.textContent = opts.cancelText || "Cancel";
      cancelBtn.style.display = mode === "confirm" ? "" : "none";

      const finish = (val) => {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        overlay.removeEventListener("mousedown", onBackdrop);
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
        resolve(val);
      };
      const onOk = () => finish(true);
      const onCancel = () => finish(false);
      const onBackdrop = (e) => { if (e.target === overlay) (mode === "confirm" ? onCancel() : onOk()); };
      const onKey = (e) => {
        if (e.key === "Escape") (mode === "confirm" ? onCancel() : onOk());
        else if (e.key === "Enter") onOk();
      };

      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      overlay.addEventListener("mousedown", onBackdrop);
      document.addEventListener("keydown", onKey);

      document.body.style.overflow = "hidden";
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      setTimeout(() => { try { okBtn.focus(); } catch (err) {} }, 30);
    });
  }



  clearForm() {
    const f = (id, val = "") => { if (this.elements[id]) this.elements[id].value = val; };
    const typeSel = this._docTypeSelect;
    if (typeSel) { const first = Array.from(typeSel.options).find((o) => o.value !== "__custom__"); typeSel.value = first ? first.value : ""; }
    f("date", new Date().toISOString().split("T")[0]);
    f("ref-number", "");
    if (this.elements["confidential"]) this.elements["confidential"].checked = false;
    this.state.logoData = "Logo.png";
    this.state.logoMode = "watermark";
    if (this.elements["logo-file"]) this.elements["logo-file"].value = "";
    if (this.elements["logo-mode"]) this.elements["logo-mode"].value = "watermark";
    this.renderLogoPreview();
    f("recipient-name", ""); f("recipient-address", ""); f("employee-id", ""); f("position", "");
    f("department", ""); f("rep-name", ""); f("designation", "");
    f("subject", "");
    if (this.elements["content-editor"]) this.elements["content-editor"].innerHTML = "";
    const sectionList = document.getElementById("sections-editor-list");
    if (sectionList) sectionList.innerHTML = "";
    if (this.elements["show-confidential"]) this.elements["show-confidential"].checked = true;
if (this.elements["show-page-number"]) this.elements["show-page-number"].checked = false;
    if (this.elements["show-subject"]) this.elements["show-subject"].checked = true;
    if (this.elements["show-hr-signature"]) this.elements["show-hr-signature"].checked = true;
    if (this.elements["show-employee-signature"]) this.elements["show-employee-signature"].checked = true;
    if (this._docTypeSelect) this._syncCustomDocTypeUI(this._docTypeSelect);
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
    const wmEl = this.elements["prev-logo-watermark"];
    const defaultEl = this.elements["default-logo"];
    const custom = this.state.logoData && this.state.logoData !== "Logo.png" ? this.state.logoData : "";
    const src = custom || "Logo.png";
    if (logoEl) { logoEl.src = src; logoEl.hidden = false; }
    if (wmEl) { wmEl.src = src; wmEl.hidden = this.state.logoMode === "none"; }
    if (defaultEl) defaultEl.hidden = true;
    if (this.elements["logo-remove"]) this.elements["logo-remove"].classList.toggle("hidden", !custom);
  }

  setLogoMode(value) {
    this.state.logoMode = value === "none" ? "none" : "watermark";
    this.renderLogoPreview();
    this.updatePreview();
  }

removeLogo() { this.state.logoData = null; if (this.elements["logo-file"]) this.elements["logo-file"].value = ""; this.renderLogoPreview(); this.updatePreview(); }  resetLogo() { this.state.logoData = "Logo.png"; if (this.elements["logo-file"]) this.elements["logo-file"].value = ""; this.renderLogoPreview(); this.updatePreview(); }

  // Sigs
  setupSig(type) {
    const up = this.elements[`${type}-sig-upload`], bu = this.elements[`btn-${type}-upload`], bd = this.elements[`btn-${type}-draw`], bc = this.elements[`btn-${type}-clear`];
    if (bu && up) bu.addEventListener("click", () => up.click());
    if (up) up.addEventListener("change", (e) => this.uploadSig(e, type));
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
    if (this.state.signatureNames) this.state.signatureNames[type] = "";
    if (this.elements[`${type}-sig-upload`]) this.elements[`${type}-sig-upload`].value = "";
    if (this.elements[`${type}-sig-name`]) this.elements[`${type}-sig-name`].value = "";
    const live = this.elements[`${type}-sig-live-preview`];
    if (live) live.innerHTML = "";
    this.renderSigPreviews();
    this.updatePreview();
  }

  clearAllSigs() {
    ["hr", "emp", "emp2"].forEach((t) => this.clearSig(t));
    this.state.signatureModes = { hr: "upload", emp: "upload", emp2: "upload" };
    this.state.signatureNames = { hr: "", emp: "", emp2: "" };
    ["hr", "emp"].forEach((t) => {
      const mode = this.elements[`${t}-sig-mode`];
      if (mode) mode.value = "upload";
      const nm = this.elements[`${t}-sig-name`];
      if (nm) nm.value = "";
      this._syncSignatureModeUI(t);
    });
  }

renderSigPreviews() {
    ["hr", "emp", "emp2"].forEach(t => {
      const prev = this.elements[`prev-${t}-sig`], edit = this.elements[`${t}-sig-preview`];
      const html = this._signatureHTML(t);
      if (prev) { prev.innerHTML = html; }
      if (edit) { edit.innerHTML = html; }
      const rm = this.elements[`${t}-sig-remove`];
      if (rm) rm.classList.toggle("hidden", !html);
    });
    if (this.elements["emp2-sig-block"]) this.elements["emp2-sig-block"].hidden = !this.state.showEmp2;
  }

  _signatureHTML(type) {
    const mode = this.state.signatureModes?.[type] || "upload";
    if (mode === "name") {
      const name = (this.state.signatureNames?.[type] || "").trim();
      if (!name) return "";
      return `<div style="height:50px;display:flex;align-items:flex-end;font-family:'Segoe Script','Brush Script MT','Lucida Handwriting',cursive;font-size:17px;line-height:1.1;">${this._escHTML(name)}</div>`;
    }
    const data = this.state.signatures?.[type];
    return data ? `<img src="${data}" alt="Signature" style="max-width:180px;max-height:50px;">` : "";
  }

  setSignatureMode(type, value) {
    this.state.signatureModes[type] = value === "name" ? "name" : "upload";
    this._syncSignatureModeUI(type);
    this.renderSigPreviews();
    this.updatePreview();
    if (this.state.signatureModes[type] === "name") {
      const nm = this.elements[`${type}-sig-name`];
      if (nm) { try { nm.focus(); } catch (e) { /* not focusable */ } }
    }
  }

  setSignatureName(type, value) {
    this.state.signatureNames[type] = value;
    this.renderSigPreviews();
    this.updatePreview();
    const live = this.elements[`${type}-sig-live-preview`];
    if (live) live.innerHTML = this._signatureHTML(type);
  }

  _syncSignatureModeUI(type) {
    const mode = this.state.signatureModes?.[type] || "upload";
    const up = this.elements[`${type}-sig-upload-wrap`];
    const nm = this.elements[`${type}-sig-name-wrap`];
    if (up) up.classList.toggle("hidden", mode !== "upload");
    if (nm) nm.classList.toggle("hidden", mode !== "name");
    const live = this.elements[`${type}-sig-live-preview`];
    if (live) live.innerHTML = mode === "name" ? this._signatureHTML(type) : "";
  }

  uploadSig(e, type = "hr") {
    this.state.signatureModes[type] = "upload";
    this._syncSignatureModeUI(type);
    this.handleSigUpload(e, type);
  }

  uploadLogo(e) { this.handleLogoUpload(e); }

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

  async saveDrawing() {
    if (this.drawing.paths.length === 0) { await this.uiAlert("Please draw a signature first", { type: "warning" }); return; }
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
    if (this.elements["print-file-modal"]) this.elements["print-file-modal"].addEventListener("click", (e) => { if (e.target.id === "print-file-modal") this.closePrintFileModal(); });
    if (this.elements["btn-close-print-file"]) this.elements["btn-close-print-file"].addEventListener("click", () => this.closePrintFileModal());
    if (this.elements["btn-cancel-print-file"]) this.elements["btn-cancel-print-file"].addEventListener("click", () => this.closePrintFileModal());
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
      sections: this._collectSections(),
showConfidential: this.elements["show-confidential"]?.checked !== false,
      showPageNumber: this.elements["show-page-number"]?.checked || false,
      showSubject: this.elements["show-subject"]?.checked !== false,
      showHrSignature: this.elements["show-hr-signature"]?.checked !== false,
      showEmployeeSignature: this.elements["show-employee-signature"]?.checked !== false,
      logoData: this.state.logoData,
      logoMode: this.state.logoMode,
      signatures: this.state.signatures,
      signatureModes: this.state.signatureModes,
      signatureNames: this.state.signatureNames,
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
    this._renderSectionList(d.sections);
    set("show-confidential", d.showConfidential); set("show-page-number", d.showPageNumber); set("show-subject", d.showSubject); set("show-hr-signature", d.showHrSignature); set("show-employee-signature", d.showEmployeeSignature);
    this.state.logoData = d.logoData || "Logo.png";
    this.state.logoMode = d.logoMode === "none" ? "none" : "watermark";
    if (this.elements["logo-mode"]) this.elements["logo-mode"].value = this.state.logoMode;
    this.state.signatures = d.signatures || {hr:null,emp:null,emp2:null};
    this.state.signatureModes = Object.assign({ hr: "upload", emp: "upload", emp2: "upload" }, d.signatureModes || {});
    this.state.signatureNames = Object.assign({ hr: "", emp: "", emp2: "" }, d.signatureNames || {});
    ["hr", "emp"].forEach((t) => {
      const mode = this.elements[`${t}-sig-mode`];
      if (mode) mode.value = this.state.signatureModes[t];
      const nm = this.elements[`${t}-sig-name`];
      if (nm) nm.value = this.state.signatureNames[t];
      this._syncSignatureModeUI(t);
    });
    this.state.showEmp2 = !!d.showEmp2;
    this.state.currentDraftId = d.id;
    this.updateWordCharPageCounts();
    this.updatePreview();
    this.updateDocumentStatus();
  }

  _localKey() { return "bh_drafts_v1"; }

  _readLocalDrafts() {
    try {
      const raw = window.localStorage.getItem(this._localKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  _writeLocalDrafts(list) {
    try { window.localStorage.setItem(this._localKey(), JSON.stringify(list || [])); return true; }
    catch (e) { return false; }
  }

  async loadDraftsFromStorage() {
    try {
      const res = await fetch("/api/drafts");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      this.state.drafts = (data && data.success && Array.isArray(data.drafts)) ? data.drafts : [];
    } catch (e) {
      this.state.drafts = this._readLocalDrafts();
    }
  }

  saveDraftsToStorage() {
    this._writeLocalDrafts(this.state.drafts);
  }

  _draftFileBase(d) {
    const type = String((d && d.documentType) || "Untitled").replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "Document";
    const id = String((d && d.id) || ("draft_" + Date.now()));
    return `${type}_${id}`;
  }

  async _saveLocalFile(category, filename, content, base64 = false) {
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, filename, content, base64 })
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!(data && data.success);
    } catch (e) { return false; }
  }

  async _deleteLocalFile(category, filename) {
    try {
      await fetch(`/api/files?category=${encodeURIComponent(category)}&filename=${encodeURIComponent(filename)}`, { method: "DELETE" });
    } catch (e) { /* ignore */ }
  }

  _ensureStorageFolders() {
    fetch("/api/files").catch(() => {});
  }

  async saveDraft() {
    const d = this.serializeDraft();
    const i = this.state.drafts.findIndex(x => x.id === d.id);
    if (i >= 0) this.state.drafts[i] = d; else this.state.drafts.push(d);
    this.state.currentDraftId = d.id;
    this.saveDraftsToStorage();

    let notice;
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data || !data.success) throw new Error("Save rejected by server");
      notice = "Draft saved to backend.";
    } catch (e) {
      notice = "Saved locally in Draft Folder.";
    }
    await this._saveLocalFile("Drafts", this._draftFileBase(d) + ".json", JSON.stringify(d, null, 2));
    this.updateDocumentStatus();
    await this.openDraftModal(notice);
  }

  saveDraftManually() {
    return this.saveDraft();
  }

  async openDraftModal(notice) {
    await this.loadDraftsFromStorage();
    const modal = this.elements["draft-modal"];
    const list = this.elements["draft-list"], no = this.elements["no-drafts"];
    const noticeEl = this.elements["draft-modal-notice"];
    if (noticeEl) {
      if (notice) { noticeEl.textContent = notice; noticeEl.hidden = false; }
      else { noticeEl.textContent = ""; noticeEl.hidden = true; }
    }
    if (!this.state.drafts.length) {
      if (list) list.innerHTML = "";
      if (no) no.hidden = false;
    } else {
      if (no) no.hidden = true;
      list.innerHTML = this.state.drafts.map(d => {
        const dt = new Date(d.createdAt).toLocaleString();
        const t = (d.documentType || "Untitled") + " - " + (d.recipientName || "No Recipient");
        return `<div class="draft-item" data-id="${d.id}"><div class="draft-item-main"><div class="draft-item-title">${t}</div><div class="draft-item-meta">${dt}</div></div><button type="button" class="draft-item-delete" data-id="${d.id}" aria-label="Delete draft" title="Delete draft"><i class="fa-solid fa-trash-can"></i></button></div>`;
      }).join("");
      list.querySelectorAll(".draft-item").forEach(it => it.addEventListener("click", () => { this.loadDraft(it.dataset.id); this.closeDraftModal(); }));
      list.querySelectorAll(".draft-item-delete").forEach(btn => btn.addEventListener("click", (e) => { e.stopPropagation(); this.deleteDraftById(btn.dataset.id); }));
    }
    if (modal) { modal.classList.add("active"); modal.setAttribute("aria-hidden", "false"); }
    document.body.style.overflow = "hidden";
  }

  closeDraftModal() {
    if (this.elements["draft-modal"]) { this.elements["draft-modal"].classList.remove("active"); this.elements["draft-modal"].setAttribute("aria-hidden", "true"); }
    document.body.style.overflow = "auto";
  }

  openDrafts() {
    return this.openDraftModal();
  }

  async openPrintFileModal() {
    const modal = this.elements["print-file-modal"];
    const list = this.elements["print-file-list"], no = this.elements["no-print-files"];
    const noticeEl = this.elements["print-file-notice"];
    if (noticeEl) { noticeEl.textContent = ""; noticeEl.hidden = true; }
    if (list) list.innerHTML = `<div class="print-file-group-title">Loading…</div>`;
    if (no) no.hidden = true;
    if (modal) { modal.classList.add("active"); modal.setAttribute("aria-hidden", "false"); }
    document.body.style.overflow = "hidden";

    let folders = { Drafts: [], Exports: [] };
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      if (data && data.success && data.folders) folders = data.folders;
    } catch (e) { /* ignore */ }

    const groups = [
      { key: "Drafts", label: "Drafts", kind: "draft" },
      { key: "Exports", label: "Exports", kind: "export" }
    ];
    const html = groups.map(g => {
      const files = Array.isArray(folders[g.key]) ? folders[g.key] : [];
      if (!files.length) return "";
      const items = files.map(f => {
        const fileIcon = f.toLowerCase().endsWith(".pdf") ? "fa-file-pdf" : "fa-file-lines";
        const actionIcon = g.kind === "draft" ? "fa-pen-to-square" : "fa-print";
        return `<div class="draft-item print-file-item" data-category="${g.key}" data-file="${this._escHTML(f)}" data-kind="${g.kind}"><div class="file-item-icon"><i class="fa-solid ${fileIcon}"></i></div><div class="draft-item-main"><div class="draft-item-title">${this._escHTML(f)}</div><div class="draft-item-meta">${g.label}</div></div><span class="file-item-print"><i class="fa-solid ${actionIcon}"></i></span></div>`;
      }).join("");
      return `<div class="print-file-group"><div class="print-file-group-title">${g.label} · ${files.length}</div>${items}</div>`;
    }).join("");

    if (list) list.innerHTML = html;
    if (!html) {
      if (no) no.hidden = false;
    } else {
      if (no) no.hidden = true;
      list.querySelectorAll(".print-file-item").forEach(it => it.addEventListener("click", () => this.printLocalFile(it.dataset.category, it.dataset.file, it.dataset.kind)));
    }
  }

  closePrintFileModal() {
    if (this.elements["print-file-modal"]) { this.elements["print-file-modal"].classList.remove("active"); this.elements["print-file-modal"].setAttribute("aria-hidden", "true"); }
    document.body.style.overflow = "auto";
  }

  async printLocalFile(category, filename, kind) {
    const url = `/api/files?category=${encodeURIComponent(category)}&filename=${encodeURIComponent(filename)}`;
    if (kind === "draft") {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const d = await res.json();
        this.deserializeDraft(d);
        this.closePrintFileModal();
        if (typeof window.switchInputTab === "function") window.switchInputTab("type");
        this.updatePreview();
        setTimeout(() => { try { window.print(); } catch (e) { /* ignore */ } }, 60);
      } catch (e) {
        await this.uiAlert("Could not open that saved file for printing.", { type: "error" });
      }
      return;
    }
    this.closePrintFileModal();
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");
    frame.src = url;
    frame.onload = () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (e) {
        window.open(url, "_blank");
      }
      setTimeout(() => { if (frame.parentNode) frame.parentNode.removeChild(frame); }, 60000);
    };
    document.body.appendChild(frame);
  }

  printLocalFilePicker() {
    let input = document.getElementById("print-local-file-input");
    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      input.id = "print-local-file-input";
      input.accept = "application/pdf,image/*";
      input.style.display = "none";
      document.body.appendChild(input);
    }
    input.onchange = () => {
      const file = input.files && input.files[0];
      input.value = "";
      if (file) this._setSelectedPrintFile(file);
    };
    input.click();
  }

  _setSelectedPrintFile(file) {
    this._selectedPrintFile = file;
    const nameEl = document.getElementById("print-file-name");
    if (nameEl) { nameEl.textContent = file.name; nameEl.hidden = false; }
    const btn = document.getElementById("btn-print-selected");
    if (btn) { btn.disabled = false; btn.removeAttribute("aria-disabled"); }
  }

  printSelectedFileNow() {
    if (!this._selectedPrintFile) {
      this.uiAlert("Please upload a document first.", { type: "warning", title: "No document selected" });
      return;
    }
    this.printSelectedLocalFile(this._selectedPrintFile);
  }

  printSelectedLocalFile(file) {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
    const isImage = (file.type || "").indexOf("image/") === 0;
    if (!isPdf && !isImage) {
      this.uiAlert("Only PDF and image files can be printed.", { type: "warning", title: "Unsupported file" });
      return;
    }

    const url = URL.createObjectURL(file);
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    document.body.appendChild(frame);

    let printed = false;
    const fallbackOpen = () => {
      const w = window.open(url, "_blank");
      if (!w) {
        this.uiAlert("Please allow pop-ups for this site, then print the file from the new tab.", { type: "warning", title: "Pop-up blocked" });
      }
    };
    const doPrint = () => {
      if (printed) return;
      printed = true;
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (e) {
        fallbackOpen();
      }
      setTimeout(() => {
        if (frame.parentNode) frame.parentNode.removeChild(frame);
        URL.revokeObjectURL(url);
      }, 60000);
    };

    if (isPdf) {
      frame.onload = () => setTimeout(doPrint, 500);
      frame.src = url;
    } else {
      const doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
      if (!doc) { fallbackOpen(); return; }
      doc.open();
      doc.write(
        '<!doctype html><html><head><meta charset="utf-8"><title></title>' +
        '<style>@page{margin:0}html,body{margin:0;padding:0}body{padding:10mm}img{max-width:100%;max-height:90vh;display:block;margin:0 auto}</style>' +
        '</head><body><img alt=""></body></html>'
      );
      doc.close();
      const img = doc.querySelector("img");
      if (!img) { fallbackOpen(); return; }
      img.onload = () => setTimeout(doPrint, 100);
      img.onerror = () => fallbackOpen();
      img.src = url;
    }

    setTimeout(doPrint, 5000);
  }

  async loadDraft(id) {
    const d = this.state.drafts.find(x => x.id === id);
    if (d) {
      this.deserializeDraft(d);
      if (typeof window.switchInputTab === "function") window.switchInputTab("type");
      await this.uiAlert("Draft loaded successfully!", { type: "success", title: "Draft loaded" });
    } else {
      await this.uiAlert("Draft not found", { type: "error" });
    }
  }

  async duplicateDocument() {
    const d = this.serializeDraft();
    d.id = "draft_" + Date.now();
    d.refNumber = "";
    this.state.drafts.push(d);
    this.saveDraftsToStorage();
    this.state.currentDraftId = d.id;
    if (this.elements["ref-number"]) this.elements["ref-number"].value = "";
    this.updatePreview();
    await this.uiAlert("Document duplicated successfully!", { type: "success", title: "Duplicated" });
  }

  async deleteCurrentDraft() {
    if (!this.state.currentDraftId) { await this.uiAlert("No draft currently loaded", { type: "warning" }); return; }
    if (!(await this.uiConfirm("Delete this draft?", { type: "warning", title: "Delete draft", okText: "Delete" }))) return;
    const id = this.state.currentDraftId;
    const draftFile = this._draftFileBase(this.state.drafts.find(x => x.id === id) || { id });
    this.state.drafts = this.state.drafts.filter(x => x.id !== id);
    this.saveDraftsToStorage();
    await this._deleteLocalFile("Drafts", draftFile + ".json");
    try {
      const res = await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data || !data.success) throw new Error("Delete rejected by server");
      this.clearForm();
      await this.uiAlert("Draft deleted successfully from backend!", { type: "success", title: "Draft deleted" });
    } catch (e) {
      this.clearForm();
      await this.uiAlert("Draft removed from this browser (backend not reachable).", { type: "success", title: "Draft deleted" });
    }
  }

  async deleteDraftById(id) {
    const d = this.state.drafts.find(x => x.id === id);
    if (!d) { await this.uiAlert("Draft not found", { type: "error" }); return; }
    if (!(await this.uiConfirm("Delete this draft?", { type: "warning", title: "Delete draft", okText: "Delete" }))) return;
    this.state.drafts = this.state.drafts.filter(x => x.id !== id);
    this.saveDraftsToStorage();
    await this._deleteLocalFile("Drafts", this._draftFileBase(d) + ".json");
    try {
      const res = await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data || !data.success) throw new Error("Delete rejected by server");
    } catch (e) {
      // backend not reachable — local removal still stands
    }
    if (this.state.currentDraftId === id) {
      this.state.currentDraftId = null;
      this.clearForm();
    }
    await this.openDraftModal("Draft deleted.");
  }

// Content sections
  addSection(heading = "", body = "", focus = true) {
    const list = document.getElementById("sections-editor-list");
    if (!list) return;

    const row = document.createElement("div");
    row.className = "bh-section-row";

    const head = document.createElement("input");
    head.type = "text";
    head.className = "bh-input bh-section-heading";
    head.placeholder = "Section heading";
    head.value = heading;

    const bodyEl = document.createElement("textarea");
    bodyEl.className = "bh-input bh-section-body";
    bodyEl.rows = 3;
    bodyEl.placeholder = "Section paragraph";
    bodyEl.value = body;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "bh-icon-button text-red-600";
    del.title = "Remove section";
    del.innerHTML = '<i class="fa-solid fa-trash"></i>';
    del.addEventListener("click", () => this.removeSection(row));

    head.addEventListener("input", () => this.updatePreview());
    bodyEl.addEventListener("input", () => this.updatePreview());

    row.appendChild(head);
    row.appendChild(bodyEl);
    row.appendChild(del);
    list.appendChild(row);

    if (focus) head.focus();
    this.updatePreview();
  }

  removeSection(row) {
    if (!row) return;
    row.remove();
    this.updatePreview();
  }

  _collectSections() {
    const list = document.getElementById("sections-editor-list");
    if (!list) return [];
    return Array.from(list.children).map((row) => ({
      heading: row.querySelector(".bh-section-heading")?.value || "",
      body: row.querySelector(".bh-section-body")?.value || "",
    }));
  }

  _renderSectionList(sections) {
    const list = document.getElementById("sections-editor-list");
    if (!list) return;
    list.innerHTML = "";
    (Array.isArray(sections) ? sections : []).forEach((s) => this.addSection(s.heading || "", s.body || "", false));
  }

  _sectionsToHTML() {
    const list = document.getElementById("sections-editor-list");
    if (!list) return "";
    return Array.from(list.children).map((row) => {
      const h = (row.querySelector(".bh-section-heading")?.value || "").trim();
      const p = (row.querySelector(".bh-section-body")?.value || "").trim();
      if (!h && !p) return "";
      return (h ? `<div style="font-weight:700; margin:8px 0 4px;">${this._escHTML(h)}</div>` : "")
        + (p ? `<div>${this._escHTML(p).replace(/\n/g, "<br>")}</div>` : "");
    }).join("");
  }

  _escHTML(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

// Export
  handlePrint() {
    this.updatePreview();
    window.print();
  }

  printDocument() {
    this.handlePrint();
  }

  async handlePdf() {
    if (!this.validateAll()) { await this.uiAlert("Please fill all required fields", { type: "warning" }); return; }
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
      const filename = `${dt}_${rn}_${dte}.pdf`;
      pdf.save(filename);
      try {
        const b64 = String(pdf.output("datauristring")).split(",")[1] || "";
        await this._saveLocalFile("Exports", filename, b64, true);
      } catch (e) { /* ignore archive failure */ }
    } catch (e) {
      document.body.removeChild(clone);
      await this.uiAlert("PDF generation failed", { type: "error" });
    }
  }

  downloadPDF() {
    return this.handlePdf();
  }

  // Zoom helpers — called by HTML buttons
  zoomPreview(delta) {
    this.state.zoom = Math.max(0.3, Math.min(3, (this.state.zoom || 1) + delta));
    this._applyZoom();
  }
  resetZoom() {
    const wrap = document.getElementById('preview-scroll-wrap');
    const page = document.getElementById('a4-print-container');
    if (wrap && page) {
      const wrapW = wrap.clientWidth - 40;
      const pageW = page.offsetWidth / (this.state.zoom || 1); // natural width before scale
      this.state.zoom = Math.max(0.3, Math.min(2, wrapW / pageW));
    } else {
      this.state.zoom = 1;
    }
    this._applyZoom();
  }
  _applyZoom() {
    const page = document.getElementById('a4-print-container');
    const label = document.getElementById('zoom-level-label');
    if (page) {
      page.style.transform = `scale(${this.state.zoom})`;
      page.style.transformOrigin = 'top center';
      // Adjust wrapper height so scroll area reflects scaled size
      const naturalH = page.offsetHeight / this.state.zoom;
      page.parentElement && (page.parentElement.style.minHeight = Math.ceil(naturalH * this.state.zoom) + 'px');
    }
    if (label) label.textContent = Math.round(this.state.zoom * 100) + '%';
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
