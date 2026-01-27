
# 🚀 Manual de Orquestração Global: Z-Prospector + N8n + Evolution API

Este guia detalha como configurar o **Master Cluster** de automação. O objetivo é conectar a entrada de mensagens (WhatsApp/Evolution), o processamento de inteligência (Gemini AI) e a gestão de dados (Z-Prospector Backend).

---

## 1. Arquitetura do Fluxo

O sistema opera em um ciclo fechado de eventos:

1.  **Entrada:** Cliente envia mensagem no WhatsApp -> **Evolution API** recebe.
2.  **Gatilho:** Evolution API envia webhook para o **N8n**.
3.  **Processamento:** N8n processa a mensagem, consulta o histórico e envia para o **Gemini AI**.
4.  **Ação:** N8n decide se responde o cliente (via Evolution) ou atualiza o CRM (via API Z-Prospector).

---

## 2. Configuração da Evolution API

Para que o N8n receba as mensagens, você deve configurar o Webhook na sua instância da Evolution (`master_1`).

1.  Acesse sua Evolution API Manager.
2.  Vá em **Instance Settings** > **Webhooks**.
3.  Habilite o Webhook Global.
4.  **URL:** Insira a URL do seu Workflow do N8n (Fluxo 2 abaixo).
    *   Ex: `https://n8n.sua-empresa.com/webhook/evolution-inbound`
5.  **Events:** Marque apenas:
    *   `MESSAGES_UPSERT`
    *   `SEND_MESSAGE`

---

## 3. Workflows Essenciais (JSON)

Você pode baixar estes arquivos diretamente pelo painel do **Z-Prospector > Módulo N8n**, mas aqui estão as definições lógicas.

### Fluxo 1: Sincronização de Leads (Entrada) & Boas Vindas
**Objetivo:** Receber dados de formulários (Facebook/Site), salvar no banco do Z-Prospector e enviar mensagem de boas-vindas.

*   **Node 1 (Webhook):** Método POST, Path `/lead-entry`.
*   **Node 2 (HTTP Request):** POST para `https://seu-zprospector.com/api/core.php?action=save-lead`.
*   **Node 3 (HTTP Request):** POST para Evolution API `/message/sendText` para dar oi ao cliente.

### Fluxo 2: AI Sales Development Rep (SDR)
**Objetivo:** Ler mensagens do WhatsApp, usar IA para qualificar e responder.

*   **Node 1 (Webhook):** Recebe `MESSAGES_UPSERT` da Evolution.
*   **Node 2 (Filter):** Ignora mensagens enviadas por `me` (você) e grupos.
*   **Node 3 (Google Gemini):**
    *   *Prompt:* "Analise a mensagem: '{{message}}'. O cliente tem interesse de compra? Responda JSON: { 'score': 0-100, 'intent': 'buy/info/complaint', 'reply_suggestion': 'texto' }".
*   **Node 4 (Switch):**
    *   Se `score > 80`: Marca como **HOT** no CRM.
    *   Se `intent == 'buy'`: Envia link de pagamento.
*   **Node 5 (Evolution API):** Envia a `reply_suggestion` para o cliente.

---

## 4. Configurando no Z-Prospector

1.  No arquivo `components/App.tsx`, certifique-se de que a `API_KEY` do Gemini está no `.env`.
2.  No módulo **N8n Automator** do sistema:
    *   Clique em "Testar Cluster" para verificar se seu N8n está online.
    *   Use o botão "Download" nos cards para pegar o `.json` pronto.
    *   No N8n, clique em "Import from File" e selecione o arquivo baixado.

## 5. Variáveis de Ambiente no N8n

Para os fluxos funcionarem, configure estas credenciais no N8n:

*   `EVOLUTION_API_URL`: URL da sua API (ex: `https://api.clikai.com.br`)
*   `EVOLUTION_API_KEY`: Sua chave global (`f292e7c5...`)
*   `ZPROSPECTOR_API_URL`: URL do seu frontend/backend (`https://zprospector.com.br/api/core.php`)
*   `GOOGLE_PALM_API_KEY`: Chave do Google AI Studio.

---

**Nota de Segurança:** Nunca compartilhe os arquivos JSON de workflow publicamente se eles contiverem chaves de API "hardcoded". O sistema de exportação do Z-Prospector remove credenciais sensíveis antes do download.
