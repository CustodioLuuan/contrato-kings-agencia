(function() {
  const form = document.getElementById('contractForm');
  const nomeInput = document.getElementById('nome');
  const docInput = document.getElementById('doc');
  const docLabel = document.getElementById('docLabel');
  const docTypeRadios = Array.from(document.querySelectorAll('input[name="docType"]'));
  const emailInput = document.getElementById('email');
  const enderecoInput = document.getElementById('endereco');
  const aceiteInput = document.getElementById('aceite');
  const contractBox = document.getElementById('contractBox');
  const contractContentEl = document.querySelector('.contract-content');
  const contractTemplate = contractContentEl ? contractContentEl.innerText : '';

  function getSelectedDocType() {
    const selected = docTypeRadios.find(r => r.checked);
    return selected ? selected.value : 'CPF';
  }

  // Signature Pad setup
  const canvas = document.getElementById('signatureCanvas');
  const clearBtn = document.getElementById('clearSignature');
  const fsOpenBtn = document.getElementById('openSignatureFullscreen');
  const fsModal = document.getElementById('signatureFullscreen');
  const fsCanvas = document.getElementById('signatureCanvasFS');
  const fsClearBtn = document.getElementById('fsClear');
  const fsCloseBtn = document.getElementById('fsClose');
  let signaturePad;
  let signaturePadFS;
  let hasSignatureImage = false;
  let signatureImageDataURL = null;

  function isTouchDevice() {
    return (
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
    );
  }

  function resizeCanvasToDisplaySize(canvasEl) {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const { clientWidth, clientHeight } = canvasEl;
    canvasEl.width = clientWidth * ratio;
    canvasEl.height = clientHeight * ratio;
    const ctx = canvasEl.getContext('2d');
    ctx.scale(ratio, ratio);
  }

  function initSignaturePad() {
    resizeCanvasToDisplaySize(canvas);
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: '#ffffff',
      penColor: '#111827',
      minWidth: 0.8,
      maxWidth: 2.2
    });
    // Evita scroll enquanto assina em mobile
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
  }

  function sizeFsCanvas() {
    const wrap = document.getElementById('sigfsWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    // Ajuste fino: compensa possíveis arredondamentos de viewport em iOS/Android
    const scaledWidth = Math.round(width * ratio);
    const scaledHeight = Math.round(height * ratio);
    fsCanvas.width = scaledWidth;
    fsCanvas.height = scaledHeight;
    const ctx = fsCanvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    fsCanvas.style.width = width + 'px';
    fsCanvas.style.height = height + 'px';
  }

  function initSignaturePadFS() {
    sizeFsCanvas();
    signaturePadFS = new SignaturePad(fsCanvas, {
      backgroundColor: '#ffffff',
      penColor: '#111827',
      minWidth: 0.9,
      maxWidth: 2.4
    });
    fsCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
    fsCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
  }

  window.addEventListener('resize', () => {
    const data = signaturePad && !signaturePad.isEmpty() ? signaturePad.toData() : null;
    resizeCanvasToDisplaySize(canvas);
    if (signaturePad) {
      signaturePad.clear();
      if (data) {
        signaturePad.fromData(data);
      } else if (hasSignatureImage && signatureImageDataURL) {
        drawImageOnCanvasContain(signatureImageDataURL);
      }
    }
  });

  initSignaturePad();

  // Oculta o botão de tela cheia em dispositivos não-touch (desktop)
  if (fsOpenBtn && !isTouchDevice()) {
    fsOpenBtn.style.display = 'none';
  }

  function renderContractPreview() {
    if (!contractContentEl) return;
    const name = (nomeInput.value || '').trim() || '[Nome do Cliente]';
    const docType = getSelectedDocType();
    const docMasked = (docInput.value || '').trim() || '[●]';
    let rendered = contractTemplate;
    // Substitui nome nas duas variações de placeholder
    rendered = rendered.replace(/\[Nome do Cliente\]/g, name);
    rendered = rendered.replace(/\[Cliente\]/g, name);
    // Substitui CPF/CNPJ no placeholder específico
    if (docType === 'CNPJ') {
      rendered = rendered.replace(/CPF nº \[●\]/g, `CNPJ nº ${docMasked}`);
    } else {
      rendered = rendered.replace(/CPF nº \[●\]/g, `CPF nº ${docMasked}`);
    }
    contractContentEl.innerText = rendered;
  }

  clearBtn.addEventListener('click', function() {
    if (signaturePad) signaturePad.clear();
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.restore();
    hasSignatureImage = false;
    signatureImageDataURL = null;
  });

  function openFullscreenSignature() {
    if (!fsModal) return;
    fsModal.classList.remove('hidden');
    document.body.classList.add('sigfs-lock');
    try {
      if (screen.orientation && screen.orientation.lock) {
        const isPortrait = window.matchMedia('(orientation: portrait)').matches;
        if (isPortrait) screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {}
    if (!signaturePadFS) initSignaturePadFS(); else { sizeFsCanvas(); signaturePadFS.clear(); }
    if (signaturePad && !signaturePad.isEmpty()) signaturePadFS.fromData(signaturePad.toData());
    window.addEventListener('resize', sizeFsCanvas);
    window.addEventListener('orientationchange', sizeFsCanvas);
  }

  function closeFullscreenSignature(saveBack = true) {
    if (!fsModal) return;
    if (saveBack && signaturePadFS && !signaturePadFS.isEmpty()) {
      // Corrige orientação: se a tela estava em retrato, roda a imagem do FS
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      if (isPortrait) {
        // Renderiza em um canvas auxiliar rotacionado 90°
        const aux = document.createElement('canvas');
        aux.width = fsCanvas.height;
        aux.height = fsCanvas.width;
        const actx = aux.getContext('2d');
        actx.save();
        actx.translate(aux.width / 2, aux.height / 2);
        actx.rotate(-Math.PI / 2);
        actx.drawImage(fsCanvas, -fsCanvas.width / 2, -fsCanvas.height / 2);
        actx.restore();
        signatureImageDataURL = aux.toDataURL('image/png');
      } else {
        signatureImageDataURL = fsCanvas.toDataURL('image/png');
      }
      hasSignatureImage = true;
      signaturePad.clear();
      drawImageOnCanvasContain(signatureImageDataURL);
    }
    fsModal.classList.add('hidden');
    document.body.classList.remove('sigfs-lock');
    window.removeEventListener('resize', sizeFsCanvas);
    window.removeEventListener('orientationchange', sizeFsCanvas);
  }

  if (fsOpenBtn) fsOpenBtn.addEventListener('click', openFullscreenSignature);
  if (fsClearBtn) fsClearBtn.addEventListener('click', () => signaturePadFS && signaturePadFS.clear());
  if (fsCloseBtn) fsCloseBtn.addEventListener('click', () => closeFullscreenSignature(true));

  // Fecha ao apertar back no Android/iOS
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !fsModal.classList.contains('hidden')) closeFullscreenSignature(false);
  });
  window.addEventListener('popstate', function() {
    if (!fsModal.classList.contains('hidden')) closeFullscreenSignature(false);
  });

  function setError(fieldName, message) {
    const el = document.querySelector(`.error[data-for="${fieldName}"]`);
    if (el) el.textContent = message || '';
  }

  function validateCPF(cpf) {
    // Remove non-digits
    cpf = (cpf || '').replace(/\D/g, '');
    if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    function calcDigit(digs) {
      let sum = 0;
      for (let i = 0; i < digs.length; i++) {
        sum += parseInt(digs.charAt(i), 10) * ((digs.length + 1) - i);
      }
      const mod = (sum * 10) % 11;
      return mod === 10 ? 0 : mod;
    }

    const d1 = calcDigit(cpf.substring(0, 9));
    const d2 = calcDigit(cpf.substring(0, 10));
    return d1 === parseInt(cpf.charAt(9), 10) && d2 === parseInt(cpf.charAt(10), 10);
  }

  function validateCNPJ(cnpj) {
    cnpj = (cnpj || '').replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    function calc(base) {
      let length = base.length - 2;
      let numbers = base.substring(0, length);
      let digits = base.substring(length);
      let sum = 0;
      let pos = length - 7;
      for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i), 10) * pos--;
        if (pos < 2) pos = 9;
      }
      let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== parseInt(digits.charAt(0), 10)) return false;
      length = length + 1;
      numbers = base.substring(0, length);
      sum = 0;
      pos = length - 7;
      for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i), 10) * pos--;
        if (pos < 2) pos = 9;
      }
      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      return result === parseInt(digits.charAt(1), 10);
    }

    return calc(cnpj);
  }

  function validate() {
    let ok = true;
    // Nome
    if (!nomeInput.value.trim()) { setError('nome', 'Informe o nome completo'); ok = false; } else setError('nome');
    // Documento
    const docType = getSelectedDocType();
    const docVal = docInput.value.trim();
    if (!docVal) { setError('doc', `Informe o ${docType}`); ok = false; }
    else if (docType === 'CPF' && !validateCPF(docVal)) { setError('doc', 'CPF inválido'); ok = false; }
    else if (docType === 'CNPJ' && !validateCNPJ(docVal)) { setError('doc', 'CNPJ inválido'); ok = false; }
    else setError('doc');
    // Email
    if (!emailInput.value.trim()) { setError('email', 'Informe o e-mail'); ok = false; } else setError('email');
    // Endereço
    if (!enderecoInput.value.trim()) { setError('endereco', 'Informe o endereço'); ok = false; } else setError('endereco');
    // Assinatura
    if (!signaturePad || (signaturePad.isEmpty() && !hasSignatureImage)) { setError('signature', 'Assine no campo acima'); ok = false; } else setError('signature');
    // Aceite
    if (!aceiteInput.checked) { setError('aceite', 'É necessário aceitar os termos'); ok = false; } else setError('aceite');

    return ok;
  }

  function currentDateBR() {
    const d = new Date();
    return d.toLocaleDateString('pt-BR');
  }

  function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
    const split = doc.splitTextToSize(text, maxWidth);
    split.forEach(function(line, idx) {
      doc.text(line, x, y + (idx * lineHeight));
    });
    return y + split.length * lineHeight;
  }

  function drawImageOnCanvasContain(dataURL) {
    const img = new Image();
    img.onload = function() {
      const ctx = canvas.getContext('2d');
      // Garante densidade correta
      resizeCanvasToDisplaySize(canvas);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const targetW = canvas.clientWidth;
      const targetH = canvas.clientHeight;
      const scale = Math.min(targetW / img.width, targetH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (targetW - drawW) / 2;
      const dy = (targetH - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    };
    img.src = dataURL;
  }

  function buildPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usable = pageWidth - margin * 2;
    let cursorY = margin;

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Contrato de Prestação de Serviços – Kings Agência', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    // Dados do contratante
    const dados = [
      `Nome: ${nomeInput.value.trim()}`,
      `${getSelectedDocType()}: ${docInput.value.trim()}`,
      `E-mail: ${emailInput.value.trim()}`,
      `Endereço: ${enderecoInput.value.trim()}`,
      `Data: ${currentDateBR()}`
    ].join('\n');
    cursorY = addWrappedText(doc, dados, margin, cursorY, usable, 16) + 8;

    // Conteúdo do contrato (o mesmo que exibido na caixa)
    const contrato = contractBox.innerText.trim();
    doc.setFont('helvetica', 'bold');
    doc.text('Contrato:', margin, cursorY);
    cursorY += 16;
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(contrato, usable);
    const lineHeight = 14;
    lines.forEach(function(line) {
      if (cursorY > doc.internal.pageSize.getHeight() - margin - 160) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    // Espaço para assinatura
    if (cursorY < doc.internal.pageSize.getHeight() - margin - 160) {
      cursorY = doc.internal.pageSize.getHeight() - margin - 160;
    } else {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Assinatura do Contratante:', margin, cursorY);
    cursorY += 8;

    // Imagem da assinatura
    const signatureDataURL = hasSignatureImage && signatureImageDataURL
      ? signatureImageDataURL
      : signaturePad.toDataURL('image/png');
    const sigWidth = 280;
    const sigHeight = 100;
    doc.addImage(signatureDataURL, 'PNG', margin, cursorY, sigWidth, sigHeight);

    // Rodapé com identificações
    const bottomY = doc.internal.pageSize.getHeight() - margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Kings Agência – CONTRATADO', margin, bottomY);
    doc.text(`${nomeInput.value.trim()} – CONTRATANTE`, pageWidth - margin, bottomY, { align: 'right' });

    const filename = `Contrato_Kings_Agencia_${nomeInput.value.trim().replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }

  function maskCPF(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }

  function maskCNPJ(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18);
  }

  function applyDocMask() {
    const type = getSelectedDocType();
    const cursor = docInput.selectionStart;
    const before = docInput.value;
    docInput.value = type === 'CPF' ? maskCPF(docInput.value) : maskCNPJ(docInput.value);
    const diff = docInput.value.length - before.length;
    docInput.setSelectionRange(cursor + diff, cursor + diff);
  }

  docInput.addEventListener('input', function() {
    applyDocMask();
    renderContractPreview();
  });

  docTypeRadios.forEach(r => r.addEventListener('change', function() {
    const type = getSelectedDocType();
    docLabel.textContent = type;
    docInput.placeholder = type === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00';
    setError('doc');
    applyDocMask();
    renderContractPreview();
  }));

  nomeInput.addEventListener('input', renderContractPreview);

  // Primeira renderização mantendo placeholders quando vazio
  renderContractPreview();

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validate()) {
      // Foca no primeiro erro
      const firstError = document.querySelector('.error:not(:empty)');
      if (firstError) {
        const target = firstError.getAttribute('data-for');
        const input = document.getElementById(target);
        if (input) input.focus();
      }
      return;
    }
    buildPdf();
  });
})();


