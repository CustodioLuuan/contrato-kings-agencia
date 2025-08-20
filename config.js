// Configuração do sistema de contratos
const CONFIG = {
  // Configuração do domínio online
  DOMAIN: {
    // Altere aqui para o seu domínio real
    PRODUCTION: 'https://contratos.kingsagencia.com.br', // Seu domínio na Vercel
    DEVELOPMENT: 'http://localhost:8000'
  },
  
  // Configurações da empresa
  COMPANY: {
    NAME: 'Kings Agência',
    CPF: '145.998.009-37',
    CITY: 'Itajaí',
    STATE: 'SC'
  },
  
  // Configurações do sistema
  SYSTEM: {
    VERSION: '1.0.0',
    DEBUG: false
  }
};

// Função para obter a URL base atual
function getBaseUrl() {
  // Se estiver rodando online (com domínio real)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  
  // Se estiver rodando localmente
  if (window.location.protocol === 'file:') {
    return CONFIG.DOMAIN.DEVELOPMENT;
  }
  
  // Se estiver rodando no servidor local
  return CONFIG.DOMAIN.DEVELOPMENT;
}

// Função para verificar se está em produção
function isProduction() {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
}

// Função para verificar se está em desenvolvimento local
function isLocalDevelopment() {
  return window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
