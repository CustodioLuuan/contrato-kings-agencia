# 🌐 Configurando Seu Domínio

## 📋 Passos para Configurar

### 1. Editar o Arquivo de Configuração
Abra o arquivo `config.js` e altere a linha:

```javascript
PRODUCTION: 'https://seudominio.com', // ou https://www.seudominio.com
```

Para o seu domínio real, por exemplo:
```javascript
PRODUCTION: 'https://kingsagencia.com.br',
// ou
PRODUCTION: 'https://www.kingsagencia.com.br',
```

### 2. Fazer Upload dos Arquivos
Faça upload de TODOS os arquivos para seu servidor web:
- `index.html`
- `dashboard.html`
- `dashboard.css`
- `dashboard.js`
- `config.js`
- `script.js`
- `styles.css`

### 3. Configurar o Servidor Web
Certifique-se de que seu servidor web está configurado para:
- Servir arquivos HTML, CSS e JavaScript
- Permitir acesso aos arquivos estáticos
- Ter HTTPS habilitado (recomendado)

## 🔧 Como Funciona

### Desenvolvimento Local
- Quando você abrir `dashboard.html` diretamente no navegador
- Os links serão gerados com `http://localhost:8000`
- Você precisa rodar `python server.py` para testar

### Produção Online
- Quando você acessar pelo seu domínio real
- Os links serão gerados automaticamente com seu domínio
- Funciona sem precisar de servidor local

## 📱 Testando

1. **Localmente**: Use `python server.py` e acesse `http://localhost:8000/dashboard.html`
2. **Online**: Acesse `https://seudominio.com/dashboard.html`

## 🚨 Importante

- **Sempre use HTTPS** em produção para segurança
- **Teste localmente** antes de fazer upload
- **Mantenha backup** dos arquivos originais
- **Verifique se todos os arquivos** foram enviados para o servidor

## 🆘 Suporte

Se tiver problemas:
1. Verifique se todos os arquivos estão no servidor
2. Confirme se o domínio está configurado corretamente
3. Teste localmente primeiro
4. Verifique o console do navegador para erros
