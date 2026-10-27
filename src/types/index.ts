export type OrganizationStatus = 'Active' | 'Trial' | 'Past due' | 'Suspended' | 'Archived';
export type PlanName = 'Starter' | 'Standard' | 'Professional' | 'Custom';

export interface Organization {
  id: string; name: string; initials: string; industry: string; employees: number;
  plan: string; mrr: number; status: OrganizationStatus; joined: string; health: number;
  admin: string; email: string; location: string; lastActive: string;
}

export interface FeatureFlag {
  id: string; name: string; description: string; category: string; enabledFor: number;
  totalOrganizations: number; rollout: number; status: 'Stable' | 'Beta' | 'Internal'; icon: string;
}

export interface PricingPlan {
  id: string; name: string; description: string; monthlyPrice: number; annualPrice: number;
  subscribers: number; color: string; recommended?: boolean; features: string[];
}
