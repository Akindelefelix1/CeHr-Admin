export type OrganizationStatus = 'Active' | 'Trial' | 'Past due' | 'Suspended';
export type PlanName = 'Starter' | 'Growth' | 'Scale' | 'Enterprise';

export interface Organization {
  id: string; name: string; initials: string; industry: string; employees: number;
  plan: PlanName; mrr: number; status: OrganizationStatus; joined: string; health: number;
  admin: string; email: string; location: string; lastActive: string;
}

export interface FeatureFlag {
  id: string; name: string; description: string; category: string; enabledFor: number;
  totalOrganizations: number; rollout: number; status: 'Stable' | 'Beta' | 'Internal'; icon: string;
}

export interface PricingPlan {
  id: string; name: PlanName; description: string; monthlyPrice: number; annualPrice: number;
  subscribers: number; color: string; recommended?: boolean; features: string[];
}
