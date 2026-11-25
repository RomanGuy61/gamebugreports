(function () {
  'use strict';

  const form = document.getElementById('bugForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  const renderedAt = Date.now();

  /* ---------------- Character counters ---------------- */
  [['description', 'descriptionCount'], ['steps', 'stepsCount']].forEach(function (pair) {
    const input = document.getElementById(pair[0]);
    const counter = document.getElementById(pair[1]);
    if (!input || !counter) return;
    const update = function () { counter.textContent = input.value.length + ' / ' + input.maxLength; };
    input.addEventListener('input', update);
    update();
  });

  /* ---------------- Custom human check ---------------- */
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswer = document.getElementById('captchaAnswer');
  const refreshCaptcha = document.getElementById('refreshCaptcha');
  let captchaResult = 0;

  function newQuestion() {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    const plus = Math.random() > 0.45;
    captchaResult = plus ? a + b : a - b;
    captchaQuestion.textContent = 'What is ' + a + (plus ? ' + ' : ' − ') + b + '?';
    if (captchaAnswer) { captchaAnswer.value = ''; captchaAnswer.classList.remove('invalid'); }
    setError('captchaError', captchaAnswer, '');
  }
  newQuestion();
  refreshCaptcha.addEventListener('click', newQuestion);

  /* ---------------- Error helpers ---------------- */
  function setError(errorId, input, message) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = message;
    if (input) input.classList.toggle('invalid', Boolean(message));
  }
  function shake(input) {
    if (!input) return;
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
  }
  function clearStatus() {
    formStatus.textContent = '';
    formStatus.classList.remove('success');
  }
  function showError(message) {
    formStatus.textContent = message;
    formStatus.classList.remove('success');
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------------- File handling ---------------- */
  const fileInput = document.getElementById('logFiles');
  const dropzone = document.getElementById('dropzone');
  const fileList = document.getElementById('fileList');
  const filesError = document.getElementById('filesError');
  const MAX_TOTAL = 10 * 1024 * 1024;
  const MAX_FILES = 20;
  let selectedFiles = [];

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function syncInput() {
    const transfer = new DataTransfer();
    selectedFiles.forEach(function (file) { transfer.items.add(file); });
    fileInput.files = transfer.files;
  }

  function renderFiles() {
    fileList.textContent = '';
    selectedFiles.forEach(function (file, index) {
      const li = document.createElement('li');
      li.className = 'file-item';

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#i-file');
      icon.appendChild(use);

      const name = document.createElement('span');
      name.className = 'file-name';
      name.textContent = file.name;

      const size = document.createElement('span');
      size.className = 'file-size';
      size.textContent = formatSize(file.size);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'file-remove';
      remove.setAttribute('aria-label', 'Remove ' + file.name);
      const removeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const removeUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      removeUse.setAttribute('href', '#i-trash');
      removeIcon.appendChild(removeUse);
      remove.appendChild(removeIcon);
      remove.addEventListener('click', function () {
        selectedFiles.splice(index, 1);
        syncInput();
        renderFiles();
        filesError.textContent = '';
      });

      li.append(icon, name, size, remove);
      fileList.appendChild(li);
    });
  }

  function addFiles(incoming) {
    filesError.textContent = '';
    const files = Array.prototype.slice.call(incoming);
    const warnings = [];

    files.forEach(function (file) {
      if (selectedFiles.length >= MAX_FILES) {
        warnings.push('You can attach up to ' + MAX_FILES + ' files.');
        return;
      }
      if (file.size > MAX_TOTAL) {
        warnings.push(file.name + ' is larger than the 10 MB limit.');
        return;
      }
      const total = selectedFiles.reduce(function (sum, f) { return sum + f.size; }, 0);
      if (total + file.size > MAX_TOTAL) {
        warnings.push('Total attachments would exceed 10 MB. Try a smaller file or a stronger zip.');
        return;
      }
      if (selectedFiles.some(function (f) { return f.name === file.name && f.size === file.size; })) {
        warnings.push(file.name + ' is already attached.');
        return;
      }
      selectedFiles.push(file);
    });

    syncInput();
    renderFiles();
    if (warnings.length) filesError.textContent = warnings[0];
  }

  fileInput.addEventListener('change', function () {
    addFiles(fileInput.files);
  });

  ['dragenter', 'dragover'].forEach(function (type) {
    dropzone.addEventListener(type, function (event) {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    dropzone.addEventListener(type, function (event) {
      event.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', function (event) {
    if (event.dataTransfer && event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  });
  dropzone.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  /* ---------------- System specs modal ---------------- */
  const modal = document.getElementById('specsModal');
  const dialog = modal.querySelector('.modal-dialog');
  const specs = document.getElementById('specs');
  let lastFocused = null;

  function detectOS() {
    const ua = navigator.userAgent || '';
    if (/Win/i.test(ua)) return 'windows';
    if (/Mac/i.test(ua)) return 'mac';
    if (/Linux/i.test(ua)) return 'linux';
    return 'windows';
  }

  function selectOS(os) {
    dialog.querySelectorAll('[data-os-tab]').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.dataset.osTab === os));
    });
    dialog.querySelectorAll('[data-os-panel]').forEach(function (panel) {
      panel.hidden = panel.dataset.osPanel !== os;
    });
  }

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    selectOS(detectOS());
    dialog.querySelector('[data-os-tab][aria-selected="true"]').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-specs]').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });
  document.querySelectorAll('[data-close-specs]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  dialog.querySelectorAll('[data-os-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () { selectOS(tab.dataset.osTab); });
  });

  document.addEventListener('keydown', function (event) {
    if (modal.hidden) return;
    if (event.key === 'Escape') { closeModal(); return; }
    if (event.key !== 'Tab') return;
    const focusable = Array.prototype.slice.call(dialog.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  modal.querySelectorAll('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = document.querySelector(btn.dataset.copyTarget);
      if (target) copyText(target.textContent, btn);
    });
  });

  function copyText(text, btn) {
    const done = function () {
      const original = btn.innerHTML;
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.innerHTML = original; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(temp);
  }

  document.getElementById('insertTemplate').addEventListener('click', function () {
    const template = 'OS:\nCPU:\nGPU:\nRAM:\nGame version:\nOther relevant details:';
    const needsNewline = specs.value.trim() && !specs.value.endsWith('\n');
    specs.value += (needsNewline ? '\n' : '') + template;
    closeModal();
    specs.focus();
    specs.setSelectionRange(specs.value.length, specs.value.length);
  });

  /* ---------------- Validation + submission ---------------- */
  function validate() {
    let valid = true;
    let firstInvalid = null;

    function requireField(id, errorId, message) {
      const input = document.getElementById(id);
      const empty = !input.value.trim();
      setError(errorId, input, empty ? message : '');
      if (empty) { valid = false; if (!firstInvalid) firstInvalid = input; }
    }

    requireField('description', 'descriptionError', 'Please describe the bug so we know what to look for.');
    requireField('steps', 'stepsError', 'Please tell us how to reproduce the bug.');
    requireField('captchaAnswer', 'captchaError', 'Please answer the question above.');

    if (!valid) {
      shake(firstInvalid);
      firstInvalid.focus();
      return false;
    }

    if (Number(captchaAnswer.value.trim()) !== captchaResult) {
      newQuestion();
      setError('captchaError', captchaAnswer, 'That answer was not quite right. Try the new question.');
      shake(captchaAnswer);
      captchaAnswer.focus();
      return false;
    }

    const honey = form.querySelector('[name="_honey"]');
    const website = form.querySelector('[name="company_website"]');
    if ((honey && honey.value.trim()) || (website && website.value.trim())) {
      showError('Something went wrong. Please reload the page and try again.');
      return false;
    }

    if (Date.now() - renderedAt < 1500) {
      showError('That was a little too fast. Please take a moment and try again.');
      return false;
    }

    return true;
  }

  function setSending(sending) {
    submitBtn.disabled = sending;
    submitBtn.classList.toggle('is-sending', sending);
  }

  function showSuccess() {
    setSending(false);
    const banner = document.createElement('div');
    banner.className = 'success-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = '<strong>Report sent — thank you!</strong> We got your bug report and will take a look shortly.';
    form.insertBefore(banner, form.firstChild);
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    submitBtn.disabled = true;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearStatus();
    if (!validate()) return;

    const data = new FormData(form);
    const ajaxUrl = form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
    setSending(true);

    try {
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      let json;
      try { json = await response.json(); } catch (e) { throw new Error('Unexpected response'); }
      const ok = json.ok === true || String(json.success).toLowerCase() === 'true';
      if (ok) {
        showSuccess();
      } else {
        setSending(false);
        showError(json.message || 'Your report could not be sent. Please try again in a moment.');
      }
    } catch (error) {
      // If the request itself fails, fall back to a normal browser form POST.
      setSending(false);
      form.submit();
    }
  });
})();
