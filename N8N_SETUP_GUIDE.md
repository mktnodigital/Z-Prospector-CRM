
# 🚀 Manual de Orquestração Global: Z-Prospector + N8n + Evolution API

Este guia detalha como configurar o **Master Cluster** de automação. O objetivo é conectar a entrada de mensagens (WhatsApp/Evolution), o processamento de inteligência (Gemini AI) e a gestão de dados (Z-Prospector Backend).

> **IMPORTANTE:** A arquitetura do sistema utiliza endpoints HTTP (API REST) para todas as integrações com o n8n. Não há conexão direta com banco de dados MySQL nos fluxos de automação, garantindo maior segurança e desacoplamento.

---

## 1. Arquitetura do Fluxo (Stateless API)

O sistema opera em um ciclo fechado de eventos HTTP:

1.  **Entrada:** Cliente envia mensagem no WhatsApp -> **Evolution API** recebe.
2.  **Gatilho:** Evolution API envia webhook (POST) para o **N8n**.
3.  **Processamento:** N8n processa a mensagem, consulta o Gemini AI e toma decisões.
4.  **Ação de Dados:** N8n chama a API do Z-Prospector (`core.php`) para salvar/atualizar leads.
5.  **Ação de Resposta:** N8n chama a Evolution API para responder ao cliente.

**NENHUM NÓ MYSQL DEVE SER USADO NO N8N.** Use sempre `HTTP Request` apontando para `https://zprospector.com.br/api/core.php`.

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

## 3. Workflows Essenciais (JSON Prontos)

Você pode baixar estes arquivos diretamente pelo painel do **Z-Prospector > Módulo N8n > Download Blueprint**.

### Fluxo 1: Sincronização de Leads (Meta Ads -> API)
**Objetivo:** Receber dados do Facebook e salvar via API.

*   **Node 1 (Webhook):** Método POST, Path `/meta-lead-entry`.
*   **Node 2 (HTTP Request):** POST para `.../api/core.php?action=save-lead`.
    *   Campos: `name`, `phone`, `email`, `source`, `status`.
*   **Node 3 (HTTP Request):** POST para Evolution API `/message/sendText` (Boas vindas).

### Fluxo 2: AI SDR - Qualificação Neural
**Objetivo:** Ler mensagens, classificar com Gemini e atualizar status via API.

*   **Node 1 (Webhook):** Recebe `MESSAGES_UPSERT` da Evolution.
*   **Node 2 (Google Gemini):** Classifica intenção (COMPRA/DUVIDA).
*   **Node 3 (Switch):** Se `COMPRA`, segue.
*   **Node 4 (HTTP Request):** POST para `.../api/core.php?action=update-lead-stage`.
    *   Define lead como **HOT**.

---

## 4. System Core Workflows (Infraestrutura)

Disponíveis em **Central do Operador > Infra**. Estes fluxos usam endpoints administrativos (`sys-*`).

1.  **Sys - Tenant Provisioning:** `POST /api/core.php?action=sys-provision-tenant`
2.  **Sys - Global Billing:** `POST /api/core.php?action=sys-update-tenant-status`
3.  **Sys - Health Monitor:** `GET /api/core.php?action=sys-db-latency`

---

## 5. Configurando no Z-Prospector

1.  No arquivo `components/App.tsx`, certifique-se de que a `API_KEY` do Gemini está no `.env`.
2.  No módulo **N8n Automator** do sistema:
    *   Clique no botão de **Download** (ícone de seta) nos cards de workflow para baixar o JSON atualizado.
    *   No N8n, clique em "Import from File" e selecione o arquivo.

## 6. Variáveis de Ambiente no N8n

Para os fluxos funcionarem, configure estas credenciais no N8n:

*   `EVOLUTION_API_URL`: URL da sua API (ex: `https://api.clikai.com.br`)
*   `EVOLUTION_API_KEY`: Sua chave global.
*   `ZPROSPECTOR_API_URL`: `https://zprospector.com.br/api/core.php`
*   `GOOGLE_PALM_API_KEY`: Chave do Google AI Studio.
