import type { FeatureFlag, Organization, PricingPlan } from '../types';

export const organizations: Organization[] = [
  { id:'ORG-1048', name:'Northstar Logistics', initials:'NL', industry:'Logistics', employees:482, plan:'Enterprise', mrr:1240000, status:'Active', joined:'12 Jan 2025', health:94, admin:'Chiamaka Okoye', email:'admin@northstar.ng', location:'Lagos, Nigeria', lastActive:'2 min ago' },
  { id:'ORG-1047', name:'Kora Health', initials:'KH', industry:'Healthcare', employees:214, plan:'Scale', mrr:680000, status:'Active', joined:'08 Feb 2025', health:88, admin:'Tobi Balogun', email:'people@kora.health', location:'Abuja, Nigeria', lastActive:'18 min ago' },
  { id:'ORG-1046', name:'Aster Finance', initials:'AF', industry:'Fintech', employees:126, plan:'Growth', mrr:320000, status:'Trial', joined:'24 Sep 2026', health:72, admin:'Fatima Bello', email:'ops@aster.africa', location:'Lagos, Nigeria', lastActive:'1 hr ago' },
  { id:'ORG-1045', name:'Greenfield Foods', initials:'GF', industry:'Manufacturing', employees:338, plan:'Scale', mrr:680000, status:'Past due', joined:'16 Mar 2025', health:48, admin:'Ifeanyi Obi', email:'hr@greenfield.co', location:'Ogun, Nigeria', lastActive:'2 days ago' },
  { id:'ORG-1044', name:'Sabi Retail', initials:'SR', industry:'Retail', employees:91, plan:'Growth', mrr:320000, status:'Active', joined:'02 Apr 2025', health:91, admin:'Mariam Lawal', email:'team@sabiretail.com', location:'Kano, Nigeria', lastActive:'35 min ago' },
  { id:'ORG-1043', name:'Atlas Energy', initials:'AE', industry:'Energy', employees:677, plan:'Enterprise', mrr:1540000, status:'Suspended', joined:'19 Nov 2024', health:31, admin:'Kunle Adeyemi', email:'admin@atlasenergy.ng', location:'Port Harcourt, Nigeria', lastActive:'12 days ago' },
];

export const plans: PricingPlan[] = [
  { id:'starter', name:'Starter', description:'For growing teams building their HR foundation.', monthlyPrice:850, annualPrice:720, subscribers:68, color:'#8c9aad', features:['Up to 25 employees','Core HR & documents','Leave management','Email support'] },
  { id:'growth', name:'Growth', description:'For companies ready to automate people operations.', monthlyPrice:2500, annualPrice:2100, subscribers:94, color:'#2e68e6', recommended:true, features:['Up to 150 employees','Payroll & attendance','Recruitment suite','Priority support'] },
  { id:'scale', name:'Scale', description:'Advanced control for multi-team organizations.', monthlyPrice:5000, annualPrice:4250, subscribers:43, color:'#8b5cf6', features:['Up to 500 employees','Advanced analytics','Performance & surveys','Dedicated success manager'] },
  { id:'enterprise', name:'Enterprise', description:'Flexible infrastructure for complex workforces.', monthlyPrice:0, annualPrice:0, subscribers:19, color:'#102a68', features:['Unlimited employees','Talent management','Custom workflows & SSO','24/7 premium support'] },
];

export const featureFlags: FeatureFlag[] = [
  { id:'payroll', name:'Payroll Suite', description:'Salary processing, approvals and audit trails', category:'Finance', enabledFor:192, totalOrganizations:224, rollout:86, status:'Stable', icon:'₦' },
  { id:'wallet', name:'Employee Wallets', description:'Rewards, points and employee withdrawals', category:'Finance', enabledFor:144, totalOrganizations:224, rollout:64, status:'Stable', icon:'W' },
  { id:'talent', name:'Talent Management', description:'Client workforce requests and deployments', category:'People', enabledFor:31, totalOrganizations:224, rollout:14, status:'Beta', icon:'T' },
  { id:'intelligence', name:'People Intelligence', description:'AI-assisted reports and recommendations', category:'Analytics', enabledFor:58, totalOrganizations:224, rollout:26, status:'Beta', icon:'AI' },
  { id:'telecom', name:'Telecom Benefits', description:'Airtime and data purchases for employees', category:'Benefits', enabledFor:101, totalOrganizations:224, rollout:45, status:'Stable', icon:'5G' },
  { id:'savings', name:'Employee Savings', description:'Managed savings plans and transactions', category:'Finance', enabledFor:0, totalOrganizations:224, rollout:0, status:'Internal', icon:'S' },
];

export const revenueData = [
  { month:'May', revenue:28.4, target:31 }, { month:'Jun', revenue:31.8, target:33 },
  { month:'Jul', revenue:34.1, target:35 }, { month:'Aug', revenue:37.6, target:38 },
  { month:'Sep', revenue:40.2, target:41 }, { month:'Oct', revenue:42.8, target:44 },
];

export const growthData = [
  { month:'May', organizations:161, employees:6840 }, { month:'Jun', organizations:174, employees:7290 },
  { month:'Jul', organizations:187, employees:7680 }, { month:'Aug', organizations:201, employees:8190 },
  { month:'Sep', organizations:216, employees:8740 }, { month:'Oct', organizations:234, employees:9348 },
];
