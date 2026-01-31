
import { Lead, Appointment, Tenant, BrandingConfig, N8nWorkflow } from '../types';

// Detecta se está em produção ou local. Em produção na HostGator, a API geralmente fica em /api/core.php relativa ao domínio.
const isProduction = (import.meta.env && import.meta.env.PROD) || false;

const API_BASE = isProduction
  ? '/api/core.php' 
  : 'http://localhost/zprospector/api/core.php'; // Ajuste para seu ambiente local PHP se necessário

// Helper para headers com Tenant ID
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-ID': '1' // Em um sistema real, isso viria do login/subdomínio
  };
};

export const api = {
  // --- SYSTEM HEALTH ---
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}?action=health`, { headers: getHeaders() });
      return await res.json();
    } catch (e) {
      console.error("API Offline", e);
      return { status: 'offline' };
    }
  },

  // --- LEADS ---
  getLeads: async (): Promise<Lead[]> => {
    try {
      const res = await fetch(`${API_BASE}?action=get-leads`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Falha ao buscar leads');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("API Get Leads falhou, usando dados locais.", e);
      return []; 
    }
  },

  saveLead: async (lead: Partial<Lead>): Promise<any> => {
    const res = await fetch(`${API_BASE}?action=save-lead`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(lead)
    });
    return await res.json();
  },

  // --- BRANDING & CONFIG ---
  getBranding: async (): Promise<BrandingConfig | null> => {
    try {
      const res = await fetch(`${API_BASE}?action=get-branding`, { headers: getHeaders() });
      const data = await res.json();
      return data;
    } catch (e) { return null; }
  },

  saveBranding: async (config: BrandingConfig): Promise<any> => {
    const res = await fetch(`${API_BASE}?action=save-branding`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    return await res.json();
  },

  // --- TENANT SETTINGS (EVOLUTION / N8N) ---
  saveTenantSettings: async (settings: any): Promise<any> => {
    // Implementar endpoint PHP específico para salvar config JSON na tabela tenants ou integrations
    // Por enquanto, simula sucesso
    return { success: true };
  },

  // --- APPOINTMENTS ---
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const res = await fetch(`${API_BASE}?action=get-appointments`, { headers: getHeaders() });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  saveAppointment: async (appt: Appointment): Promise<any> => {
    const res = await fetch(`${API_BASE}?action=save-appointment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appt)
    });
    return await res.json();
  }
};
