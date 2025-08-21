document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contract');
  
  if (contractId) {
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const contract = contracts.find(c => c.id === contractId);
    
    if (contract) {
      if (contract.status === 'signed') {
        disableForm();
      } else {
        enableForm(contract);
      }
    } else {
      showContractNotFoundMessage();
    }
  }
  
  // Inicializar assinatura digital
  initSignaturePad();
  
  // Event listeners
  document.getElementById('clearSignature').addEventListener('click', clearSignature);
  document.getElementById('submitContract').addEventListener('click', submitContract);
});





function showContractNotFoundMessage() {
  const banner = document.getElementById('statusBanner');
  banner.className = 'status-banner error';
  banner.innerHTML = `
    <h2>❌ Contrato não encontrado</h2>
    <p>O contrato solicitado não foi encontrado ou o link está inválido.</p>
  `;
}

function disableForm() {
  document.getElementById('signaturePad').style.pointerEvents = 'none';
  document.getElementById('clearSignature').disabled = true;
  document.getElementById('submitContract').style.display = 'none';
}

function enableForm(contract) {
  document.getElementById('signaturePad').style.pointerEvents = 'auto';
  document.getElementById('clearSignature').disabled = false;
  document.getElementById('submitContract').style.display = 'inline-block';
  
  // Atualizar conteúdo do contrato com dados do cliente
  updateContractContent(contract);
}

function updateContractContent(contract) {
  // Substituir placeholders no contrato
  const contractContent = document.querySelector('.contract-content');
  let content = contractContent.innerHTML;
  
  content = content.replace(/\[Nome do Cliente\]/g, contract.clientName);
  content = content.replace(/\[●\]/g, contract.clientDoc);
  content = content.replace(/\[Local\]/g, 'Itajaí/SC');
  content = content.replace(/\[Data\]/g, new Date().toLocaleDateString('pt-BR'));
  content = content.replace(/\[Cliente\]/g, contract.clientName);
  
  contractContent.innerHTML = content;
}

// Variáveis globais para assinatura
let signaturePad;

function initSignaturePad() {
  const canvas = document.getElementById('signaturePad');
  if (!canvas) return;
  
  // Ajustar tamanho do canvas
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // Inicializar SignaturePad
  signaturePad = new SignaturePad(canvas, {
    backgroundColor: '#ffffff',
    penColor: '#111827',
    minWidth: 0.8,
    maxWidth: 2.2
  });
  
  // Prevenir scroll em dispositivos touch
  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

function clearSignature() {
  if (signaturePad) {
    signaturePad.clear();
  }
}

function submitContract() {
  // Verificar se há assinatura
  if (!signaturePad || signaturePad.isEmpty()) {
    alert('Por favor, assine o contrato antes de continuar.');
    return;
  }
  
  // Obter ID do contrato da URL
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contract');
  
  if (!contractId) {
    alert('Erro: ID do contrato não encontrado.');
    return;
  }
  
  // Atualizar status do contrato
  const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  const contractIndex = contracts.findIndex(c => c.id === contractId);
  
  if (contractIndex !== -1) {
    contracts[contractIndex].status = 'signed';
    contracts[contractIndex].signedAt = new Date().toISOString();
    localStorage.setItem('contracts', JSON.stringify(contracts));
    
    // Mostrar mensagem de sucesso
    alert('Contrato assinado com sucesso! O PDF será baixado automaticamente.');
    
    // Gerar e baixar PDF
    buildPdf();
    
    // Atualizar interface
    disableForm();
  }
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
  
  // Conteúdo do contrato
  const contractContent = document.querySelector('.contract-content');
  const contractText = contractContent.innerText;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const lines = doc.splitTextToSize(contractText, usable);
  const lineHeight = 12;
  
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
  const signatureDataURL = signaturePad.toDataURL('image/png');
  const sigWidth = 280;
  const sigHeight = 100;
  doc.addImage(signatureDataURL, 'PNG', margin, cursorY, sigWidth, sigHeight);
  
  // Nome e data da assinatura
  cursorY += sigHeight + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nome: ${document.getElementById('signatureName').textContent}`, margin, cursorY);
  cursorY += 12;
  doc.text(`Data: ${document.getElementById('signatureDate').textContent}`, margin, cursorY);
  
  // Nome do arquivo
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contract');
  const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  const contract = contracts.find(c => c.id === contractId);
  
  const filename = contract 
    ? `Contrato_${contract.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    : `Contrato_Kings_Agencia_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
}


