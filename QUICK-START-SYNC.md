# 🚀 Quick Start: Google Drive Sync

## ⚡ Setup em 5 Minutos

### Passo 1: Configure as Credenciais do Google

Você recebeu o erro: **"Missing required parameter client_id"**

Isso significa que você precisa configurar as credenciais do Google Drive.

---

### Passo 2: Crie o Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Create Project"**
3. Nome: `Personal Finance Tracker`
4. Clique **"Create"**

---

### Passo 3: Ative a Google Drive API

1. No menu lateral, vá em **"APIs & Services"** → **"Library"**
2. Procure por **"Google Drive API"**
3. Clique e depois **"Enable"**

---

### Passo 4: Configure o OAuth Consent Screen

1. Vá em **"APIs & Services"** → **"OAuth consent screen"**
2. Escolha **"External"**
3. Preencha:
   - **App name**: Personal Finance Tracker
   - **User support email**: Seu email
   - **Developer contact email**: Seu email
4. Clique **"Save and Continue"**
5. Em **"Scopes"**, clique **"Add or Remove Scopes"**
6. Procure e selecione: `https://www.googleapis.com/auth/drive.file`
7. **"Save and Continue"**
8. Em **"Test users"**, adicione seu email
9. **"Save and Continue"**

---

### Passo 5: Crie o OAuth 2.0 Client ID

1. Vá em **"APIs & Services"** → **"Credentials"**
2. Clique **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Escolha **"Web application"**
4. Nome: `Budget Tracker Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:5173
   ```
7. Clique **"Create"**
8. **COPIE O CLIENT ID** (vai parecer com: `xxx.apps.googleusercontent.com`)

---

### Passo 6: Crie a API Key

1. Ainda em **"Credentials"**, clique **"+ Create Credentials"** → **"API Key"**
2. Clique **"Restrict Key"**
3. Em **"API restrictions"**, escolha **"Restrict key"**
4. Selecione **"Google Drive API"**
5. Clique **"Save"**
6. **COPIE A API KEY** (vai parecer com: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

---

### Passo 7: Configure o Arquivo .env

1. Abra o arquivo `.env` na raiz do projeto (já foi criado para você)
2. Substitua os valores:

```env
# Substitua pelos seus valores REAIS:
VITE_GOOGLE_DRIVE_CLIENT_ID=SEU-CLIENT-ID-AQUI.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_API_KEY=SUA-API-KEY-AQUI
VITE_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5173
```

**Exemplo preenchido:**
```env
VITE_GOOGLE_DRIVE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_API_KEY=AIzaSyABCDEF123456789_xyz
VITE_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5173
```

---

### Passo 8: Reinicie o Servidor de Desenvolvimento

⚠️ **IMPORTANTE**: Vite só lê o arquivo `.env` ao iniciar!

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

---

### Passo 9: Conecte o Google Drive

1. Abra o app: http://localhost:5173
2. Vá para a página **"Configuração"**
3. Procure a seção **"Sync com Google Drive"**
4. Clique em **"Conectar Google Drive"**
5. Faça login com sua conta Google
6. Aceite as permissões
7. ✅ **Pronto!** O sync automático está ativo!

---

## ✨ O Que Acontece Agora?

### Backup Automático
- Toda vez que você fizer uma mudança (adicionar transação, editar orçamento, etc.)
- Após **5 segundos** de inatividade, um backup é criado automaticamente
- Backup é salvo na pasta **"Personal Finance Backups"** no seu Google Drive

### Versões Mantidas
O app mantém **5 versões**:
- 📌 **Atual** (mais recente)
- 🕐 **Backup 1** (versão anterior)
- 🕑 **Backup 2** (2 versões atrás)
- 🕒 **Backup 3** (3 versões atrás)
- 🕓 **Backup 4** (4 versões atrás)

Backups mais antigos são deletados automaticamente.

---

## 🔄 Usar em Múltiplos Dispositivos

### Computador + Celular

**No Computador:**
1. Conecte o Google Drive (passos acima)
2. Seus dados serão backupeados

**No Celular:**
1. Abra o app no navegador do celular
2. Vá em **"Configuração"**
3. Conecte o Google Drive (mesma conta)
4. Clique em **"Atualizar"** na lista de backups
5. Clique em **"Restaurar"** no backup mais recente
6. Recarregue a página

Agora ambos estão sincronizados! 🎉

**Para atualizar:**
- Fez mudança no Computador → Auto-backup → Restaure no Celular
- Fez mudança no Celular → Auto-backup → Restaure no Computador

---

## ⚙️ Configurações Úteis

### Desativar Auto-Sync (Apenas Backup Manual)
1. Vá em **"Configuração"**
2. Toggle o switch **"Auto-sync"** para OFF
3. Agora você precisa clicar em **"Fazer Backup Agora"** manualmente

### Fazer Backup Manual Agora
1. Vá em **"Configuração"**
2. Clique em **"Fazer Backup Agora"**

### Restaurar um Backup Anterior
1. Vá em **"Configuração"**
2. Clique em **"Atualizar"** para carregar a lista
3. Escolha o backup desejado
4. Clique em **"Restaurar"**
5. Confirme
6. Recarregue a página

---

## ❓ Problemas Comuns

### "Missing required parameter client_id"
**Solução**: Você não configurou o arquivo `.env` corretamente
- Verifique se `.env` existe na raiz do projeto
- Verifique se você copiou o Client ID e API Key corretamente
- **Reinicie o servidor** (`npm run dev`)

### "Access token expired"
**Solução**: O token expirou
1. Vá em **"Configuração"**
2. Clique em **"Desconectar"**
3. Conecte novamente

### Mudanças não aparecem em outro dispositivo
**Solução**: Não é sync em tempo real!
- Você precisa **restaurar** o backup mais recente manualmente
- No outro dispositivo, vá em Configuração → Atualizar → Restaurar

### Não vejo backups na lista
**Solução**:
1. Clique em **"Atualizar"**
2. Se ainda vazio, clique em **"Fazer Backup Agora"**
3. Depois clique em **"Atualizar"** novamente

---

## 🔐 Privacidade

✅ Seus dados vão direto do seu dispositivo para SEU Google Drive
✅ Não passam por nenhum servidor nosso
✅ App só acessa arquivos que ele mesmo criou
✅ Você pode desconectar a qualquer momento
✅ Backups ficam no SEU Drive - você controla tudo

---

## 📖 Documentação Completa

Para mais detalhes, veja:
- **GOOGLE-DRIVE-SYNC-GUIDE.md** - Guia completo com todos os detalhes

---

## 🎉 Pronto!

Agora você tem backup automático em nuvem com 100% de privacidade!

**Dúvidas?** Consulte o guia completo em `GOOGLE-DRIVE-SYNC-GUIDE.md`
