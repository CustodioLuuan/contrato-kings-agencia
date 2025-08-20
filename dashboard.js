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
    document.getElementById('clientEmail').value = contract.clientEmail;
    document.getElementById('clientDoc').value = contract.clientDoc;
    document.getElementById('clientAddress').value = contract.clientAddress;
    document.getElementById('contractValue').value = contract.contractValue;
    document.getElementById('paymentTerms').value = contract.paymentTerms || '';
    document.getElementById('dueDate').value = contract.dueDate || '';
    document.getElementById('contractNotes').value = contract.contractNotes || '';
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contractData = {
      id: this.currentContractId || this.generateId(),
      clientName: formData.get('clientName'),
      clientEmail: formData.get('clientEmail'),
      clientDoc: formData.get('clientDoc'),
      clientAddress: formData.get('clientAddress'),
      contractValue: formData.get('contractValue'),
      paymentTerms: formData.get('paymentTerms'),
      dueDate: formData.get('dueDate'),
      contractNotes: formData.get('contractNotes'),
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
        <p>${contract.clientEmail} • ${contract.contractValue}</p>
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
        <span class="detail-label">Cliente:</span>
        <span class="detail-value">${contract.clientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">E-mail:</span>
        <span class="detail-value">${contract.clientEmail}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">CPF/CNPJ:</span>
        <span class="detail-value">${contract.clientDoc}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Endereço:</span>
        <span class="detail-value">${contract.clientAddress}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Valor:</span>
        <span class="detail-value">${contract.contractValue}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Condições de Pagamento:</span>
        <span class="detail-value">${contract.paymentTerms || 'Não informado'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Data de Vencimento:</span>
        <span class="detail-value">${contract.dueDate ? new Date(contract.dueDate).toLocaleDateString('pt-BR') : 'Não informado'}</span>
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
      ${contract.contractNotes ? `
        <div class="detail-row">
          <span class="detail-label">Observações:</span>
          <span class="detail-value">${contract.contractNotes}</span>
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
    
    window.open(`mailto:${contract.clientEmail}?subject=${subject}&body=${body}`);
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
      // Criar um link temporário para abrir a página de contrato
      const baseUrl = getBaseUrl();
      const contractUrl = `${baseUrl}/index.html?contract=${contract.id}`;
      
      // Abrir em nova aba para gerar o PDF
      const newWindow = window.open(contractUrl, '_blank');
      
      if (newWindow) {
        this.showNotification('📄 Abrindo contrato para download do PDF...', 'info');
        
        // Aguardar um pouco e mostrar instruções
        setTimeout(() => {
          this.showNotification('💡 Na nova aba, clique em "Enviar e Baixar PDF" para baixar o arquivo', 'info');
        }, 2000);
      } else {
        this.showNotification('❌ Erro ao abrir contrato. Verifique se o popup está bloqueado.', 'danger');
      }
    } catch (error) {
      console.error('Erro ao abrir contrato:', error);
      this.showNotification('❌ Erro ao abrir contrato para download', 'danger');
    }
  }
}

// Inicializar o gerenciador de contratos
const contractManager = new ContractManager();

// Expor para uso global
window.contractManager = contractManager;
