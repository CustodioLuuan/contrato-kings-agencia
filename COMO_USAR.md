# 🚀 Como Usar o Sistema de Contratos

## ⚡ **Solução Rápida - Servidor Local**

### 1. Instalar Python (se não tiver)
- Baixe em: https://python.org
- Ou use: `python --version` para verificar se já tem

### 2. Executar o servidor
```bash
python server.py
```

### 3. Acessar o sistema
- Dashboard: http://localhost:8000/dashboard.html
- O navegador abrirá automaticamente

### 4. Testar os links
- Crie um contrato na dashboard
- Clique em "Ver" e depois "Copiar Link"
- Cole o link em uma nova aba do navegador
- Agora funcionará! ✅

---

## 🌐 **Solução Permanente - Hospedar Online**

### Opção A: GitHub Pages (Recomendado)
1. Crie conta no GitHub
2. Crie repositório: `kings-agencia-contratos`
3. Faça upload dos arquivos
4. Ative GitHub Pages nas configurações
5. Site ficará em: `https://SEU_USUARIO.github.io/kings-agencia-contratos/`

### Opção B: Netlify
1. Acesse netlify.com
2. Faça login com GitHub
3. Conecte seu repositório
4. Deploy automático

---

## 📱 **Links Funcionais**

Após hospedar, os links serão:
- **Dashboard**: `https://SEU_DOMINIO/dashboard.html`
- **Contrato**: `https://SEU_DOMINIO/index.html?contract=ID_DO_CONTRATO`

---

## 🔧 **Arquivos do Sistema**
- `index.html` - Página de assinatura
- `dashboard.html` - Painel administrativo
- `styles.css` - Estilos da página de assinatura
- `dashboard.css` - Estilos da dashboard
- `script.js` - JavaScript da página de assinatura
- `dashboard.js` - JavaScript da dashboard
- `server.py` - Servidor local para testes
- `deploy.md` - Instruções de hospedagem

---

## 💡 **Dica Importante**
Os links só funcionam quando o site está hospedado online ou rodando em um servidor local. Arquivos locais (`file://`) não permitem links funcionais.

