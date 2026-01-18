
# ZapFlow SaaS - Sales & Automation (Architecture & Tech Spec)

## 1) Visão Geral
O ZapFlow é um ecossistema SaaS de prospecção e vendas focado em **WhatsApp**, projetado para automatizar o funil de vendas de pequenos e médios negócios. O sistema utiliza **IA (Gemini/ChatGPT)** para qualificar leads em tempo real e agendar serviços automaticamente, eliminando o gargalo do atendimento humano em etapas repetitivas.

**Principais Alavancas de Resultado:**
- **Recuperação de Leads:** Follow-up automático que para imediatamente quando o cliente responde.
- **Qualificação:** Classificação (Frio/Morno/Quente) baseada na análise de sentimento da IA.
- **Agendamento Autônomo:** Extração de datas e horários de conversas naturais para criar agendamentos no sistema.

---

## 2) Arquitetura HostGator (Stack Recomendada)
Dado o ambiente **cPanel / HostGator**, a stack deve ser robusta, porém de fácil deploy e baixo consumo de infraestrutura complexa.

- **Backend:** PHP 8.3 + Laravel 11.
- **Frontend:** Inertia.js + Vue.js 3 + Tailwind CSS (gera um SPA moderno dentro do Blade).
- **Banco de Dados:** MySQL 8.0.
- **Filas (Queues):** Driver `database` (padrão Laravel) rodando via Cron Job (necessário para disparos e webhooks).
- **Servidor Web:** Apache (padrão cPanel) com regras de `.htaccess`.

**Justificativa:** Laravel é o framework mais estável para ambientes cPanel, oferecendo segurança nativa (CSRF, XSS, SQL Injection), sistema de migrações e excelente performance em servidores compartilhados ou VPS básicos.

---

## 3) Modelagem Multi-tenant e Franquias
A abordagem será **Single Database com Discriminator Column (`tenant_id`)**.

- **Isolamento:** Todos os modelos cruciais estendem um `BaseModel` que aplica um Global Scope para filtrar por `tenant_id`.
- **Franquias:** Existe uma tabela `franchises` (Matriz). Cada `tenant` (Unidade) pertence a uma `franchise_id`.
- **Consolidação:** Administradores de Franquias acessam um Dashboard consolidado que desativa o Global Scope de `tenant_id` e filtra por `franchise_id`.

---

## 4) Esquema do Banco de Dados (MySQL)

### Tabelas Principais (Resumo)

- **tenants:** `id`, `name`, `subdomain`, `plan_id`, `status` (active/blocked), `franchise_id`.
- **franchises:** `id`, `name`, `admin_user_id`.
- **users:** `id`, `tenant_id`, `name`, `email`, `password`, `role_id`.
- **leads:** `id`, `tenant_id`, `name`, `phone`, `email`, `status` (COLD/WARM/HOT), `stage_id`, `assigned_to`.
- **pipelines:** `id`, `tenant_id`, `name`, `niche` (barbearia, imobiliária, etc).
- **pipeline_stages:** `id`, `pipeline_id`, `name`, `order`.
- **integrations:** `id`, `tenant_id`, `provider` (Evolution, OpenAI), `config` (JSON keys), `status`.
- **appointments:** `id`, `tenant_id`, `lead_id`, `service_id`, `scheduled_at`, `status`.
- **campaigns:** `id`, `tenant_id`, `name`, `message_template`, `scheduled_at`, `total_leads`, `sent_count`.
- **subscriptions:** `id`, `tenant_id`, `gateway`, `external_id`, `status`, `next_billing`.

---

## 5) RBAC (Permissões)
Estrutura baseada em níveis:
1. **SUPER_ADMIN:** Gestão total da plataforma, planos e usuários globais.
2. **TENANT_ADMIN:** Gestão da unidade, faturamento e integrações.
3. **MANAGER:** Gestão de equipe de vendas, relatórios e campanhas.
4. **AGENT:** Atendimento via chat, gestão de leads próprios.
5. **FINANCIAL:** Acesso apenas a relatórios de vendas e faturamento.

---

## 6) Integrações Detalhadas

### Evolution API (WhatsApp)
- **Fluxo:** O sistema consome a API da Evolution via Guzzle (Laravel). 
- **Instância:** Cada Tenant tem seu `instanceName` (ex: `unidade_01_vendas`).
- **Webhooks:** O sistema expõe `/api/webhooks/whatsapp` para receber status de mensagem lida, mensagens recebidas e QR code.

### n8n
- **Event-Driven:** O sistema emite eventos via `WebhookService`.
- **Exemplo:** Ao arrastar um lead para "Proposta", o Laravel dispara um POST para a URL do n8n cadastrada com o JSON do lead.

### AI Engine (Gemini / OpenAI)
- **Prompt Base:** "Você é um assistente de vendas da [EMPRESA]. Analise o texto: '[MENSAGEM]'. Identifique: 1. Qualificação (0-100), 2. Intenção de agendamento (Sim/Não), 3. Data e hora mencionada. Retorne apenas JSON."

---

## 7) Regras Críticas
1. **Anti-Duplicidade:** Verificação de Hash `(tenant_id, campaign_id, lead_phone)` antes de inserir na fila de disparo.
2. **Rate Limiting:** Disparos intervalados (ex: 20-40 segundos entre mensagens) para evitar banimento do WhatsApp.
3. **Pause on Reply:** Se o lead responder, a flag `auto_followup` é setada como `false` para o lead.

---

## 8) Roadmap
- **Fase 1 (MVP):** Gestão de Leads, Kanban, Integração Evolution API, Disparo de Campanhas Manual.
- **Fase 2 (Automação):** IA para qualificação, Integração n8n, Follow-up automático recursivo.
- **Fase 3 (BI & Franquias):** Dashboards consolidados, Visão Matriz/Filial, Pagamentos Recorrentes automáticos.
