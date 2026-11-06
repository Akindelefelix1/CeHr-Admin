import { apiRequest } from './api';

export interface PlatformSettingsValues {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  adminSessionHours: number;
  auditRetentionDays: number;
  emailNotificationsEnabled: boolean;
}

export interface PlatformIntegrationStatus {
  key: 'email' | 'payments' | 'airtime';
  name: string;
  provider: string;
  status: 'ready' | 'disabled' | 'needs_configuration';
  description: string;
}

export interface PlatformSettingsResponse {
  settings: PlatformSettingsValues;
  integrations: PlatformIntegrationStatus[];
  updatedAt: string | null;
  updatedBy: string | null;
}

export function getPlatformSettings() {
  return apiRequest<PlatformSettingsResponse>('/super-admin/settings', {}, { cache: false });
}

export function updatePlatformSettings(input: Partial<PlatformSettingsValues>) {
  return apiRequest<PlatformSettingsResponse>('/super-admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
