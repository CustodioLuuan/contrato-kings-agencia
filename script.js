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
  
  // Adicionar listeners para controlar o estado do botão de limpar
  signaturePad.addEventListener('beginStroke', updateClearButtonState);
  signaturePad.addEventListener('endStroke', updateClearButtonState);
  
  // Verificar estado inicial do botão
  updateClearButtonState();
}

function updateClearButtonState() {
  const clearButton = document.getElementById('clearSignature');
  if (clearButton && signaturePad) {
    clearButton.disabled = signaturePad.isEmpty();
  }
}

function showNotification(message, type = 'success', duration = 5000) {
  // Remover notificações existentes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  // Criar notificação
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Definir ícone baseado no tipo
  let icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${message}</div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Adicionar ao body
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remover automaticamente
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

function clearSignature() {
  if (signaturePad) {
    signaturePad.clear();
    updateClearButtonState();
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
    
    // Mostrar notificação de sucesso
    showNotification('Contrato assinado com sucesso! O PDF será baixado automaticamente.', 'success', 3000);
    
    // Atualizar interface
    disableForm();
    
    // Gerar e baixar PDF após um pequeno delay
    setTimeout(() => {
      buildPdf();
    }, 500);
    
    // Recarregar página após 3 segundos para mostrar o status atualizado
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
}

function buildPdf() {
  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      console.error('jsPDF não está disponível');
      showNotification('Erro ao gerar PDF: jsPDF não está carregado', 'error');
      return;
    }
    
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
    if (!contractContent) {
      console.error('Conteúdo do contrato não encontrado');
      showNotification('Erro ao gerar PDF: conteúdo do contrato não encontrado', 'error');
      return;
    }
    
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
    
    // Espaço para assinaturas
    if (cursorY < doc.internal.pageSize.getHeight() - margin - 200) {
      cursorY = doc.internal.pageSize.getHeight() - margin - 200;
    } else {
      doc.addPage();
      cursorY = margin;
    }
    
    // Assinatura da Kings Agência
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Kings Agência – CONTRATADO:', margin, cursorY);
    cursorY += 15;
    
    // Adicionar imagem da assinatura da Kings Agência
    try {
      const kingsSigWidth = 150;
      const kingsSigHeight = 60;
      doc.addImage('assets/signatures/kings-signature.png', 'PNG', margin, cursorY, kingsSigWidth, kingsSigHeight);
      cursorY += kingsSigHeight + 20;
    } catch (error) {
      // Se não conseguir carregar a imagem, apenas adiciona o texto
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Assinatura da Kings Agência', margin, cursorY);
      cursorY += 20;
    }
    
    // Assinatura do Contratante
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Assinatura do Contratante:', margin, cursorY);
    cursorY += 15;
    
    // Imagem da assinatura do contratante
    if (signaturePad && !signaturePad.isEmpty()) {
      const signatureDataURL = signaturePad.toDataURL('image/png');
      const sigWidth = 280;
      const sigHeight = 100;
      doc.addImage(signatureDataURL, 'PNG', margin, cursorY, sigWidth, sigHeight);
      cursorY += sigHeight + 10;
    }
    
    // Nome e data da assinatura do contratante
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Obter dados do contrato
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get('contract');
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const contract = contracts.find(c => c.id === contractId);
    
    if (contract) {
      doc.text(`Nome: ${contract.clientName}`, margin, cursorY);
      cursorY += 12;
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, cursorY);
    }
    
    // Nome do arquivo
    const filename = contract 
      ? `Contrato_${contract.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      : `Contrato_Kings_Agencia_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Salvar o PDF
    doc.save(filename);
    
    console.log('PDF gerado com sucesso:', filename);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
  }
}


