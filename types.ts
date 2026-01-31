
export enum LeadStatus {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT'
}

export enum PipelineStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED = 'CLOSED'
}

export type SalesPhase = 'ATRAIR' | 'CONVERSAR' | 'QUALIFICAR' | 'AGENDAR' | 'FECHAR';
export type SalesMode = 'DIRECT' | 'ASSISTED'; // Modo 1 vs Modo 2

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  stage: string;
  lastInteraction: string;
  value: number;
  source: string;
}

export interface Appointment {
  id: string;
  lead: string;
  time: string;
  date: number;
  month: number;
  year: number;
  service: string;
  serviceId?: string;
  status: 'CONFIRMED' | 'PENDING';
  ia: boolean;
  value?: number;
  paymentMethod?: string; // Novo: Rastreia como foi pago (Pix, Cartão)
}

export interface AppNotification {
  id: string;
  type: 'APPOINTMENT' | 'SALE' | 'INBOX' | 'BROADCAST' | 'SYSTEM' | 'N8N';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  targetStatus: LeadStatus | 'ALL';
  productId: string;
  productName: string;
  template: string;
  scheduledAt: string;
  status: 'IDLE' | 'SENDING' | 'COMPLETED' | 'PAUSED';
  totalLeads: number;
  sentLeads: number;
  conversions: number;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  webhookUrl: string;
  apiKey?: string;
  event: 'LEAD_CREATED' | 'STAGE_CHANGED' | 'AI_QUALIFIED' | 'PAYMENT_RECEIVED' | 'CUSTOM';
  status: 'ACTIVE' | 'PAUSED';
  lastExecution?: string;
  hits: number;
}

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

export interface BrandingConfig {
  fullLogo: string;
  fullLogoDark: string;
  iconLogo: string;
  iconLogoDark: string;
  favicon: string;
  salesPageLogo: string;
  appName: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING';
  icon: string;
  color: string;
}

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'AGENT';

export interface Tenant {
  id: string;
  name: string;
  niche: string;
  healthScore: number;
  revenue: number;
  activeLeads: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  instanceName?: string;
  instanceStatus?: 'DISCONNECTED' | 'CONNECTED' | 'CONNECTING';
  n8nWorkflows?: N8nWorkflow[];
  salesMode: SalesMode; // Configuração do Modo de Operação
}

export type AppModule = 
  | 'prospecting' 
  | 'products' 
  | 'scheduling' 
  | 'results' 
  | 'admin'
  | 'inbox'
  | 'offer'
  | 'payments'
  | 'profile'
  | 'broadcast'
  | 'search'
  | 'concierge'
  | 'capture'    // Adicionado para Scraper
  | 'automation'; // Adicionado para Fluxos
