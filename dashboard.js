class ContractManager {
  constructor() {
    this.contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    this.currentContractId = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderContracts();
    this.updateStats();
  }

  bindEvents() {
    // Botões principais
    document.getElementById('newContractBtn').addEventListener('click', () => this.openModal());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('closeViewModal').addEventListener('click', () => this.closeViewModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    
    // Formulário
    document.getElementById('contractForm').addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Ações do contrato
    document.getElementById('copyLinkBtn').addEventListener('click', () => this.copyContractLink());
    document.getElementById('sendEmailBtn').addEventListener('click', () => this.sendContractEmail());
    document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadContractPdf());
    document.getElementById('deleteContractBtn').addEventListener('click', () => this.deleteContract());
    
    // Fechar modais clicando fora
    document.getElementById('contractModal').addEventListener('click', (e) => {
      if (e.target.id === 'contractModal') this.closeModal();
    });
    
    document.getElementById('viewModal').addEventListener('click', (e) => {
      if (e.target.id === 'viewModal') this.closeViewModal();
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  openModal(contractId = null) {
    this.currentContractId = contractId;
    const modal = document.getElementById('contractModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('contractForm');
    
    if (contractId) {
      // Editando contrato existente
      const contract = this.contracts.find(c => c.id === contractId);
      if (contract) {
        title.textContent = 'Editar Contrato';
        this.fillForm(contract);
      }
    } else {
      // Novo contrato
      title.textContent = 'Novo Contrato';
      form.reset();
      
      // Definir data de pagamento como hoje
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('paymentDate').value = today;
    }
    
    modal.classList.add('active');
  }

  closeModal() {
    document.getElementById('contractModal').classList.remove('active');
    this.currentContractId = null;
  }

  openViewModal(contractId) {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    this.currentContractId = contractId;
    this.renderContractDetails(contract);
    document.getElementById('viewModal').classList.add('active');
  }

  closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
    this.currentContractId = null;
  }

  fillForm(contract) {
    document.getElementById('clientName').value = contract.clientName;
    document.getElementById('clientDoc').value = contract.clientDoc;
    document.getElementById('paymentDate').value = contract.paymentDate || '';
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contractData = {
      id: this.currentContractId || this.generateId(),
      clientName: formData.get('clientName'),
      clientDoc: formData.get('clientDoc'),
      paymentDate: formData.get('paymentDate'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      signedAt: null
    };

    if (this.currentContractId) {
      // Atualizar contrato existente
      const index = this.contracts.findIndex(c => c.id === this.currentContractId);
      if (index !== -1) {
        contractData.signedAt = this.contracts[index].signedAt;
        this.contracts[index] = contractData;
      }
    } else {
      // Adicionar novo contrato
      this.contracts.push(contractData);
    }

    this.saveContracts();
    this.renderContracts();
    this.updateStats();
    this.closeModal();
    
    this.showNotification('Contrato salvo com sucesso!', 'success');
  }

  renderContracts() {
    const container = document.getElementById('contractsList');
    container.innerHTML = '';

    if (this.contracts.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--muted);">
          <p>Nenhum contrato criado ainda.</p>
          <p>Clique em "Novo Contrato" para começar.</p>
        </div>
      `;
      return;
    }

    this.contracts.forEach(contract => {
      const contractElement = this.createContractElement(contract);
      container.appendChild(contractElement);
    });
  }

  createContractElement(contract) {
    const div = document.createElement('div');
    div.className = 'contract-item';
    
    const statusClass = contract.status === 'signed' ? 'signed' : 'pending';
    const statusText = contract.status === 'signed' ? 'Assinado' : 'Pendente';
    
    div.innerHTML = `
      <div class="contract-info">
        <h3>${contract.clientName}</h3>
        <p>${contract.clientDoc} • ${contract.paymentDate ? new Date(contract.paymentDate).toLocaleDateString('pt-BR') : 'Data não informada'}</p>
      </div>
      <div class="contract-status">
        <span class="status-badge ${statusClass}">${statusText}</span>
        <div class="contract-actions">
          <button class="btn btn-ghost" onclick="contractManager.openViewModal('${contract.id}')">Ver</button>
          <button class="btn btn-ghost" onclick="contractManager.openModal('${contract.id}')">Editar</button>
        </div>
      </div>
    `;
    
    return div;
  }

  renderContractDetails(contract) {
    const container = document.getElementById('contractDetails');
    
    const statusClass = contract.status === 'signed' ? 'signed' : 'pending';
    const statusText = contract.status === 'signed' ? 'Assinado' : 'Pendente';
    
    container.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Nome Completo:</span>
        <span class="detail-value">${contract.clientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">CPF ou CNPJ:</span>
        <span class="detail-value">${contract.clientDoc}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Data de Pagamento:</span>
        <span class="detail-value">${contract.paymentDate ? new Date(contract.paymentDate).toLocaleDateString('pt-BR') : 'Não informado'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Criado em:</span>
        <span class="detail-value">${new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      ${contract.signedAt ? `
        <div class="detail-row">
          <span class="detail-label">Assinado em:</span>
          <span class="detail-value">${new Date(contract.signedAt).toLocaleDateString('pt-BR')} às ${new Date(contract.signedAt).toLocaleTimeString('pt-BR')}</span>
        </div>
      ` : ''}
    `;

    // Mostrar/ocultar botão de download baseado no status
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
      if (contract.status === 'signed') {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.disabled = false;
      } else {
        downloadBtn.style.display = 'none';
      }
    }
  }

  copyContractLink() {
    const contract = this.contracts.find(c => c.id === this.currentContractId);
    if (!contract) return;
    
    // Usar a função de configuração para obter a URL base
    const baseUrl = getBaseUrl();
    const link = `${baseUrl}/index.html?contract=${contract.id}`;
    
    // Mostrar aviso se estiver rodando localmente
    if (isLocalDevelopment()) {
      this.showNotification('⚠️ Para links funcionais, use o servidor local (python server.py)', 'warning');
    }
    
    navigator.clipboard.writeText(link).then(() => {
      this.showNotification('Link copiado para a área de transferência!', 'success');
    }).catch(() => {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('Link copiado para a área de transferência!', 'success');
    });
  }

  sendContractEmail() {
    const contract = this.contracts.find(c => c.id === this.currentContractId);
    if (!contract) return;
    
    // Usar a função de configuração para obter a URL base
    const baseUrl = getBaseUrl();
    const link = `${baseUrl}/index.html?contract=${contract.id}`;
    const subject = encodeURIComponent('Contrato para Assinatura - Kings Agência');
    const body = encodeURIComponent(`
Olá ${contract.clientName},

Segue o link para assinatura do seu contrato:

${link}

Atenciosamente,
Kings Agência
    `);
    
    // Como não temos mais email, abrir em uma nova aba para copiar o link
    window.open(link, '_blank');
    this.showNotification('📄 Contrato aberto em nova aba. Copie o link para enviar ao cliente.', 'info');
  }

  deleteContract() {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;
    
    const index = this.contracts.findIndex(c => c.id === this.currentContractId);
    if (index !== -1) {
      this.contracts.splice(index, 1);
      this.saveContracts();
      this.renderContracts();
      this.updateStats();
      this.closeViewModal();
      this.showNotification('Contrato excluído com sucesso!', 'success');
    }
  }

  updateStats() {
    const total = this.contracts.length;
    const pending = this.contracts.filter(c => c.status === 'pending').length;
    const signed = this.contracts.filter(c => c.status === 'signed').length;
    
    document.getElementById('totalContracts').textContent = total;
    document.getElementById('pendingContracts').textContent = pending;
    document.getElementById('signedContracts').textContent = signed;
  }

  saveContracts() {
    localStorage.setItem('contracts', JSON.stringify(this.contracts));
  }

  showNotification(message, type = 'info') {
    // Criar notificação simples
    const notification = document.createElement('div');
    
    let backgroundColor = '#6b7280'; // default
    if (type === 'success') backgroundColor = '#10b981';
    if (type === 'warning') backgroundColor = '#f59e0b';
    if (type === 'danger') backgroundColor = '#ef4444';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-size: 0.9rem;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Método para marcar contrato como assinado (chamado pelo index.html)
  markAsSigned(contractId) {
    const contract = this.contracts.find(c => c.id === contractId);
    if (contract) {
      contract.status = 'signed';
      contract.signedAt = new Date().toISOString();
      this.saveContracts();
      this.renderContracts();
      this.updateStats();
    }
  }

  // Método para baixar PDF do contrato
  downloadContractPdf() {
    const contract = this.contracts.find(c => c.id === this.currentContractId);
    if (!contract) return;

    // Verificar se o contrato foi assinado
    if (contract.status !== 'signed') {
      this.showNotification('❌ Este contrato ainda não foi assinado!', 'warning');
      return;
    }

    try {
      // Criar conteúdo HTML do contrato para PDF
      const contractHtml = this.generateContractHtml(contract);
      
      // Gerar e baixar PDF
      this.generateAndDownloadPdf(contractHtml, contract);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.showNotification('❌ Erro ao gerar PDF do contrato', 'danger');
    }
  }

  // Gerar HTML do contrato para PDF
  generateContractHtml(contract) {
    const signedDate = new Date(contract.signedAt);
    const paymentDate = contract.paymentDate ? new Date(contract.paymentDate) : new Date();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .contract-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
          .signature-section { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
          .signature-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 10px; }
          .company-info { text-align: center; margin-top: 40px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
          <div style="font-size: 18px; color: #666;">KINGS AGÊNCIA</div>
        </div>

        <div class="section">
          <div class="section-title">1. DADOS DO CONTRATANTE</div>
          <p><strong>Nome Completo:</strong> ${contract.clientName}</p>
          <p><strong>CPF/CNPJ:</strong> ${contract.clientDoc}</p>
          <p><strong>Data de Pagamento:</strong> ${paymentDate.toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="section">
          <div class="section-title">2. OBJETO DO CONTRATO</div>
          <p>Este contrato tem por objeto a prestação de serviços de marketing digital e gestão de redes sociais pela Kings Agência, conforme especificações técnicas e cronograma estabelecidos entre as partes.</p>
        </div>

        <div class="section">
          <div class="section-title">3. VALOR E FORMA DE PAGAMENTO</div>
          <p>O valor dos serviços será conforme orçamento aprovado, com pagamento realizado na data acordada de ${paymentDate.toLocaleDateString('pt-BR')}.</p>
        </div>

        <div class="section">
          <div class="section-title">4. PRAZO DE EXECUÇÃO</div>
          <p>Os serviços serão executados conforme cronograma estabelecido entre as partes, com início após a assinatura deste contrato.</p>
        </div>

        <div class="section">
          <div class="section-title">5. RESPONSABILIDADES</div>
          <p><strong>Kings Agência:</strong> Compromete-se a executar os serviços com qualidade profissional e dentro dos prazos estabelecidos.</p>
          <p><strong>Cliente:</strong> Compromete-se a fornecer todas as informações necessárias e realizar os pagamentos nos prazos acordados.</p>
        </div>

        <div class="signature-section">
          <div class="section-title">ASSINATURAS</div>
          
          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div style="width: 45%;">
              <div class="signature-line">
                <p style="text-align: center; margin-top: 10px;"><strong>${contract.clientName}</strong></p>
                <p style="text-align: center; font-size: 12px;">Cliente</p>
                <p style="text-align: center; font-size: 12px;">CPF/CNPJ: ${contract.clientDoc}</p>
              </div>
            </div>
            
            <div style="width: 45%;">
              <div class="signature-line">
                <p style="text-align: center; margin-top: 10px;"><strong>Kings Agência</strong></p>
                <p style="text-align: center; font-size: 12px;">Prestador de Serviços</p>
                <p style="text-align: center; font-size: 12px;">CNPJ: 14.599.800/0001-37</p>
              </div>
            </div>
          </div>
        </div>

        <div class="company-info">
          <p><strong>Kings Agência</strong> - Marketing Digital e Gestão de Redes Sociais</p>
          <p>Itajaí - SC | www.kingsagencia.com.br</p>
          <p>Contrato assinado digitalmente em ${signedDate.toLocaleDateString('pt-BR')} às ${signedDate.toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;
  }

  // Gerar e baixar PDF
  generateAndDownloadPdf(htmlContent, contract) {
    // Criar um elemento temporário para renderizar o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    // Usar jsPDF para gerar o PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Converter HTML para PDF
    pdf.html(tempDiv, {
      callback: function(pdf) {
        // Baixar o PDF
        const fileName = `contrato_${contract.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        // Remover elemento temporário
        document.body.removeChild(tempDiv);
        
        // Mostrar notificação de sucesso
        this.showNotification('✅ PDF baixado com sucesso!', 'success');
      }.bind(this),
      x: 15,
      y: 15,
      width: 180
    });
  }
}

// Inicializar o gerenciador de contratos
const contractManager = new ContractManager();

// Expor para uso global
window.contractManager = contractManager;
