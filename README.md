# 📄 Sistema de Contratos - Kings Agência

Sistema completo para gerenciamento e assinatura digital de contratos da Kings Agência.

## 🚀 Funcionalidades

### Dashboard Administrativa (`dashboard.html`)
- **Gestão de Contratos**: Criar, editar e visualizar contratos
- **Estatísticas**: Total de contratos, pendentes e assinados
- **Links Personalizados**: Gerar links únicos para cada cliente
- **Envio por E-mail**: Enviar contratos diretamente por e-mail
- **Status Tracking**: Acompanhar status de assinatura em tempo real

### Página de Assinatura (`index.html`)
- **Formulário Inteligente**: Preenchimento automático com dados do cliente
- **Assinatura Digital**: Assinatura com caneta digital ou mouse
- **Geração de PDF**: PDF profissional com todos os dados
- **Validação Completa**: Validação de CPF/CNPJ e campos obrigatórios
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile

## 📁 Estrutura de Arquivos

```
pagina de contrato/
├── index.html          # Página de assinatura do contrato
├── dashboard.html      # Dashboard administrativa
├── styles.css          # Estilos da página de assinatura
├── dashboard.css       # Estilos da dashboard
├── script.js           # JavaScript da página de assinatura
├── dashboard.js        # JavaScript da dashboard
└── README.md           # Esta documentação
```

## 🛠️ Como Usar

### 1. Acessando a Dashboard
Abra `dashboard.html` no seu navegador para acessar o painel administrativo.

### 2. Criando um Contrato
1. Clique em **"+ Novo Contrato"**
2. Preencha os dados do cliente:
   - Nome completo
   - E-mail
   - CPF/CNPJ
   - Endereço
   - Valor do contrato
   - Condições de pagamento (opcional)
   - Data de vencimento (opcional)
   - Observações (opcional)
3. Clique em **"Salvar Contrato"**

### 3. Enviando para o Cliente
Após criar o contrato, você tem duas opções:

#### Opção A: Copiar Link
1. Clique em **"Ver"** no contrato criado
2. Clique em **"Copiar Link"**
3. Cole o link em uma mensagem para o cliente

#### Opção B: Enviar por E-mail
1. Clique em **"Ver"** no contrato criado
2. Clique em **"Enviar por E-mail"**
3. O e-mail será aberto automaticamente com o link

### 4. Assinatura pelo Cliente
Quando o cliente acessar o link:
1. Os dados serão preenchidos automaticamente
2. O contrato será atualizado com as informações reais
3. O cliente só precisa assinar digitalmente
4. O PDF será gerado e baixado automaticamente
5. O status será atualizado para "Assinado" na dashboard

## 🎨 Personalização

### Modificando o Contrato
Para alterar o texto do contrato, edite o conteúdo dentro da div `.contract-content` no arquivo `index.html`.

### Alterando Cores e Estilos
Os estilos estão organizados em variáveis CSS no início dos arquivos:
- `styles.css` - Para a página de assinatura
- `dashboard.css` - Para a dashboard

### Adicionando Novos Campos
1. Adicione o campo no formulário da dashboard (`dashboard.html`)
2. Atualize o JavaScript da dashboard (`dashboard.js`)
3. Adicione o campo no formulário de assinatura (`index.html`)
4. Atualize o JavaScript de assinatura (`script.js`)

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos e responsivos
- **JavaScript ES6+**: Funcionalidades dinâmicas
- **jsPDF**: Geração de PDFs
- **SignaturePad**: Assinatura digital
- **LocalStorage**: Armazenamento local dos dados

## 📱 Compatibilidade

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile (iOS/Android)

## 🔒 Segurança e Privacidade

- **Dados Locais**: Todos os dados ficam armazenados localmente no navegador
- **Sem Servidor**: Não há envio de dados para servidores externos
- **Controle Total**: Você tem controle completo sobre os dados dos clientes

## 💡 Dicas de Uso

### Para Melhor Experiência
1. **Use Chrome**: Melhor compatibilidade com todas as funcionalidades
2. **Backup Regular**: Exporte os dados do localStorage periodicamente
3. **Teste os Links**: Sempre teste os links antes de enviar aos clientes
4. **Mantenha Atualizado**: Mantenha os arquivos sempre atualizados

### Backup dos Dados
Para fazer backup dos contratos:
1. Abra o DevTools (F12)
2. Vá para Console
3. Digite: `console.log(JSON.stringify(JSON.parse(localStorage.getItem('contracts') || '[]'), null, 2))`
4. Copie o resultado e salve em um arquivo

### Restaurar Dados
Para restaurar os dados:
1. Abra o DevTools (F12)
2. Vá para Console
3. Cole o JSON e execute: `localStorage.setItem('contracts', JSON.stringify(SEU_JSON_AQUI))`

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique se está usando um navegador atualizado
2. Limpe o cache do navegador
3. Verifique se todos os arquivos estão na mesma pasta
4. Teste em modo incógnito

## 📄 Licença

Este sistema foi desenvolvido especificamente para a Kings Agência. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a Kings Agência**

