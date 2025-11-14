# 📁 Guia de Sync Automático - Simples e Fácil

## ✨ Como Funciona?

**Sem API keys. Sem configuração complexa. Apenas 3 cliques!**

O sync automático permite que você salve seus dados em um arquivo na sua pasta do Google Drive, Dropbox, OneDrive, ou qualquer pasta no seu computador.

---

## 🚀 Configuração (Uma Vez)

### Passo 1: Abra a Página de Configuração

No app, clique em **"Configuração"** (ícone de engrenagem)

### Passo 2: Escolha Onde Salvar

1. Na seção **"Sync de Arquivos"**, clique em **"Escolher Arquivo de Sync"**

2. O navegador abrirá uma janela para você escolher onde salvar

3. **Navegue até sua pasta do Google Drive/Dropbox/OneDrive**
   - Google Drive: `C:\Users\SeuNome\Google Drive\`
   - Dropbox: `C:\Users\SeuNome\Dropbox\`
   - OneDrive: `C:\Users\SeuNome\OneDrive\`

4. Digite um nome para o arquivo: `meu-orcamento.json`

5. Clique em **"Salvar"**

### Passo 3: Pronto! ✅

O app agora vai salvar automaticamente nesse arquivo toda vez que você fizer uma mudança!

---

## 💾 O Que Acontece Automaticamente?

### Salvamento Automático
- Você adiciona uma transação → **5 segundos depois** → Salvo automaticamente! ✅
- Você edita um orçamento → **5 segundos depois** → Salvo automaticamente! ✅
- Você cria uma categoria → **5 segundos depois** → Salvo automaticamente! ✅

### Backups Automáticos
- O app mantém **5 versões de backup** guardadas no navegador
- Se algo der errado, você pode restaurar de qualquer backup
- Backups antigos são deletados automaticamente

---

## 🌍 Usar em Múltiplos Dispositivos

### Cenário: Computador + Celular

#### No Computador:
1. Configure o sync (passos acima)
2. Escolha um arquivo na pasta do **Google Drive** (ou Dropbox/OneDrive)
3. Seus dados são salvos automaticamente

#### No Celular (Navegador):
1. Abra o app no navegador do celular
2. Vá em **"Configuração"**
3. Clique em **"Escolher Arquivo de Sync"**
4. Navegue até a **mesma pasta** do Google Drive
5. Selecione o **mesmo arquivo** (`meu-orcamento.json`)
6. Clique em **"Carregar do Arquivo"**
7. Pronto! Seus dados estão sincronizados! 🎉

#### Mantendo Sincronizado:
- **No computador:** Faça mudanças → Auto-salvo no arquivo
- **No celular:** Clique em **"Carregar do Arquivo"** para pegar as últimas mudanças

---

## 🔄 Funções Principais

### Salvar Agora (Manual)
Se você quiser forçar um salvamento imediatamente:
1. Vá em **"Configuração"**
2. Clique em **"Salvar Agora"**

### Carregar do Arquivo
Para pegar a última versão do arquivo (útil quando usar em múltiplos dispositivos):
1. Vá em **"Configuração"**
2. Clique em **"Carregar do Arquivo"**
3. ⚠️ Isso substitui seus dados locais pelos dados do arquivo

### Desativar Auto-Sync
Se quiser controle manual:
1. Vá em **"Configuração"**
2. Desative o switch **"Auto-sync"**
3. Agora você precisa clicar em **"Salvar Agora"** manualmente

### Restaurar Backup
Se precisar voltar para uma versão anterior:
1. Vá em **"Configuração"**
2. Na seção **"Backups Automáticos"**, veja a lista
3. Clique em **"Restaurar"** no backup que você quer
4. Recarregue a página

---

## 📱 Navegadores Suportados

### ✅ Suportado (Sync Automático):
- ✅ **Chrome** (Desktop e Android)
- ✅ **Edge** (Desktop)
- ✅ **Opera** (Desktop)

### ⚠️ Não Suportado (Apenas Backup Manual):
- ⚠️ **Firefox** - Use "Baixar Backup" e "Carregar Backup"
- ⚠️ **Safari** - Use "Baixar Backup" e "Carregar Backup"

**Backup Manual:** Você baixa um arquivo JSON e depois faz upload dele manualmente quando quiser restaurar.

---

## 🔐 Privacidade e Segurança

### Seus Dados São 100% Seus

- ✅ **Dados salvos localmente** - Tudo fica no seu computador
- ✅ **Você escolhe onde salvar** - Google Drive, Dropbox, pasta local, etc.
- ✅ **Sem servidores** - Dados não passam por nenhum servidor nosso
- ✅ **Sem cadastro** - Sem necessidade de criar conta
- ✅ **Sem API keys** - Sem configuração complexa

---

## ❓ Perguntas Frequentes

### Como o sync funciona exatamente?

O app salva seus dados em um arquivo JSON que você escolhe. Se você escolher um arquivo na sua pasta do Google Drive, o Google Drive sincroniza esse arquivo entre seus dispositivos automaticamente (isso é função do Google Drive, não do app).

### Preciso estar online?

- **Para usar o app:** NÃO, funciona 100% offline
- **Para sincronizar entre dispositivos:** SIM, o Google Drive/Dropbox precisa sincronizar o arquivo

### E se eu usar em dois dispositivos ao mesmo tempo?

Não é recomendado. Se você fizer mudanças no computador E no celular ao mesmo tempo:
- O último a salvar vai sobrescrever o arquivo
- Você pode perder mudanças

**Recomendação:** Use em um dispositivo por vez. Quando mudar de dispositivo, clique em "Carregar do Arquivo".

### Posso usar sem Google Drive/Dropbox?

SIM! Você pode escolher qualquer pasta no seu computador. Mas aí o sync entre dispositivos não funciona automaticamente.

### O arquivo é seguro?

O arquivo JSON contém todos os seus dados financeiros em texto puro. Se você está preocupado com privacidade:
- Use criptografia de disco (BitLocker no Windows, FileVault no Mac)
- Salve em uma pasta criptografada
- Ou use apenas localmente (sem cloud)

---

## 🆘 Resolução de Problemas

### "Arquivo de sync não configurado"

**Solução:** Você precisa clicar em "Escolher Arquivo de Sync" primeiro.

### "Navegador não suportado"

**Solução:** Use Chrome ou Edge. Ou use os botões "Baixar Backup" e "Carregar Backup" para fazer sync manual.

### Mudanças não aparecem em outro dispositivo

**Solução:**
1. Verifique se o Google Drive sincronizou o arquivo
2. No outro dispositivo, clique em "Carregar do Arquivo"
3. Recarregue a página

### "Falha ao salvar"

**Possíveis causas:**
- Arquivo foi movido ou deletado
- Sem permissão para escrever no arquivo
- Disco cheio

**Solução:**
1. Clique em "Mudar arquivo de sync"
2. Escolha um novo local
3. Tente novamente

---

## 💡 Dicas Pro

### Backup Regular
- O app mantém 5 backups automáticos
- Mas é bom baixar um backup manual de vez em quando
- Clique em "Baixar Backup" para ter uma cópia extra

### Nomenclatura de Arquivo
Use nomes descritivos:
- ✅ `orcamento-2025.json`
- ✅ `financas-pessoais.json`
- ❌ `dados.json` (muito genérico)

### Organização
Crie uma pasta específica:
- `Google Drive/Orçamentos/meu-orcamento.json`
- Assim você sabe onde está e fica organizado

---

## 🎯 Resumo

1. **Configurar:** Escolha um arquivo (1x apenas)
2. **Usar:** App salva automaticamente (5s após mudança)
3. **Sincronizar:** Clique em "Carregar do Arquivo" em outros dispositivos
4. **Backup:** 5 versões automáticas sempre guardadas

**Sem complicação. Sem API keys. Sem cadastro. Simples assim! 🎉**
