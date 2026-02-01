
import { Lead, Appointment, BrandingConfig, User } from '../types';

// Configuração para Produção
const API_BASE = '/api/core.php'; 

export const api = {
  // --- AUTHENTICATION ---
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Erro de conexão com servidor' };
    }
  },

  checkAuth: async (): Promise<{ authenticated: boolean; user?: User }> => {
    try {
      const res = await fetch(`${API_BASE}?action=check-auth`);
      return await res.json();
    } catch (e) {
      return { authenticated: false };
    }
  },

  logout: async () => {
    await fetch(`${API_BASE}?action=logout`);
  },

  // --- DATA FETCHING (Protected Routes - Session Handled by Browser Cookie) ---
  
  getLeads: async (): Promise<Lead[]> => {
    try {
      const res = await fetch(`${API_BASE}?action=get-leads`);
      if (!res.ok) throw new Error('Auth Error');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  saveLead: async (lead: Partial<Lead>): Promise<any> => {
    const res = await fetch(`${API_BASE}?action=save-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    return await res.json();
  },

  getBranding: async (): Promise<BrandingConfig | null> => {
    try {
      const res = await fetch(`${API_BASE}?action=get-branding`);
      const data = await res.json();
      return data.appName ? data : null;
    } catch (e) { return null; }
  },

  saveBranding: async (config: BrandingConfig): Promise<any> => {
    const res = await fetch(`${API_BASE}?action=save-branding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const res = await fetch(`${API_BASE}?action=get-appointments`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  saveAppointment: async (appt: Appointment): Promise<any> => {
    const res = await fetch(`${API_BASE}?action=save-appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appt)
    });
    return await res.json();
  }
};
