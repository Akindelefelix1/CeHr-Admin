import type { Organization } from '../types';
import { featureFlags as previewFeatures, organizations as previewOrganizations, plans as previewPlans, revenueData } from '../data/mockData';
import { apiRequest, isPreviewMode } from './api';

export interface AdminIdentity { id:string; name:string; email:string; role:string; permissions:string[] }
export interface AdminAccount extends AdminIdentity { status:'Active'|'Invited'|'Suspended'; lastActive:string }
export interface OrganizationDetail extends Organization {
  phone?:string; website?:string; address?:string; description?:string; createdAt?:string;
  departments?:number; branches?:number; activeEmployees?:number; pendingInvites?:number;
  setupCompleted?:boolean; timezone?:string; modules?:string[];
}
export interface FeatureFlagDetail { id:string; key:string; name:string; description:string; category:string; status:'Stable'|'Beta'|'Internal'; icon?:string|null; defaultEnabled:boolean; enabledFor:number; totalOrganizations:number; rollout:number; createdAt?:string; updatedAt?:string }
export interface FeatureOrganization { id:string; name:string; email:string; status:string; overrideEnabled:boolean|null; effectiveEnabled:boolean }
export interface SubscriptionPlan { id:string; key:string; name:string; description:string; monthlyPriceKobo:number; annualPriceKobo:number; features:string[]; color:string; recommended:boolean; isActive:boolean; sortOrder:number }
export interface BillingRecord { id:string; organizationId?:string; organization?:string; plan?:string; description?:string; activity?:string; amountKobo:number; status:string; issuedAt?:string; createdAt?:string; dueAt?:string; reference?:string; currency?:string }
export interface BillingData { period:string; generatedAt:string; summary:{mrrKobo:number;collectedKobo:number;outstandingKobo:number;pendingKobo?:number;overdueKobo?:number;failedKobo:number;paidCount:number;pendingCount:number;overdueCount:number;trialCount?:number;totalOrganizations:number;collectionRateKobo:number}; invoices:BillingRecord[]; transactions:BillingRecord[]; payouts:BillingRecord[]; tab:string }
export interface AnalyticsData { period:number; view:string; generatedAt:string; metrics:{organizationGrowth:number;employeeGrowth:number;weeklyActiveUsers:number;engagementRate?:number;retentionRate?:number;featureAdoption:number;activeFeatureCount?:number;activeOrganizations:number;organizations:number;employees:number}; growth:Array<{month:string;organizations:number;employees:number}>; planMix:Array<{name:string;value:number;color:string}>; adoption:Array<{name:string;value:number}> }
export interface DashboardData { generatedAt:string; metrics:{totalOrganizations:number;activeEmployees:number;monthlyRevenueKobo:number;outstandingKobo:number;outstandingCount:number}; revenue:Array<{month:string;revenueKobo:number;targetKobo:number}>; pulse:{health:number;dailyActiveUsers:number;avgResponseMs:number;openIncidents:number;apiUptime:string}; recentOrganizations:OrganizationDetail[] }

const wait = (ms=450) => new Promise(resolve => window.setTimeout(resolve,ms));
const previewFeatureDefaults: Record<string, boolean> = Object.fromEntries(previewFeatures.map(feature => [feature.id, feature.rollout === 100]));
const previewFeatureOverrides: Record<string, Record<string, boolean>> = {};
const formatDateTime = (value: unknown, fallback = '—') => {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
};
const normalizeOrganization = (raw: Record<string,any>, index=0): OrganizationDetail => ({
  id:String(raw.id || raw.organizationId || `ORG-${index+1}`), name:String(raw.name || 'Unnamed organization'),
  initials:String(raw.initials || raw.name?.split(/\s+/).map((x:string)=>x[0]).join('').slice(0,2) || 'OR').toUpperCase(),
  industry:String(raw.industry || 'Not specified'), employees:Number(raw.employees ?? raw.employeeCount ?? raw._count?.employees ?? 0),
  plan:raw.plan || raw.subscription?.plan || 'Starter', mrr:Number(raw.mrr ?? raw.subscription?.mrr ?? 0), status:raw.status || 'Active',
  joined:String(raw.joined || (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—')),
  health:Number(raw.health ?? 80), admin:String(raw.admin || raw.ownerName || raw.name || 'Organization admin'), email:String(raw.email || ''),
  location:String(raw.location || [raw.city,raw.state,raw.country].filter(Boolean).join(', ') || 'Not provided'), lastActive:String(raw.lastActive || '—'),
  phone:raw.phone, website:raw.website, address:raw.address, description:raw.description, createdAt:raw.createdAt,
  departments:Number(raw.departments ?? raw._count?.departments ?? 0), branches:Number(raw.branches ?? raw._count?.branches ?? 0),
  activeEmployees:Number(raw.activeEmployees ?? raw._count?.employees ?? raw.employees ?? 0), pendingInvites:Number(raw.pendingInvites ?? raw._count?.employeeInvites ?? 0),
  setupCompleted:Boolean(raw.setupCompleted ?? raw.setupCompletedAt), timezone:raw.timezone, modules:raw.modules || [],
});
const normalizeAdmin = (raw: Record<string, any>): AdminAccount => ({
  id: String(raw.id || raw.adminId || ''),
  name: String(raw.name || 'Unnamed administrator'),
  email: String(raw.email || ''),
  role: String(raw.role || 'Read-only admin'),
  permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
  status: raw.status || 'Active',
  lastActive: formatDateTime(raw.lastActive ?? raw.lastLoginAt ?? raw.lastSeenAt),
});

export async function loginSuperAdmin(email:string,password:string) {
  if (isPreviewMode) { await wait(); if(password.length<8) throw new Error('Password must contain at least 8 characters.'); return {accessToken:'preview-session',admin:{id:'preview-admin',name:'Adeola Ogunleye',email,role:'Super administrator',permissions:['*']}}; }
  return apiRequest<{accessToken:string;admin:AdminIdentity}>('/super-admin/auth/login',{method:'POST',body:JSON.stringify({email,password})});
}
export async function listOrganizations():Promise<OrganizationDetail[]> {
  if(isPreviewMode){await wait();return previewOrganizations.map((x,i)=>normalizeOrganization({...x,departments:5+i,branches:2+(i%3),pendingInvites:i%4,setupCompleted:i!==5,phone:'+234 800 000 0000',website:`https://${x.name.toLowerCase().replaceAll(' ','')}.com`,timezone:'Africa/Lagos',modules:['Core HR','Attendance','Payroll','Documents']},i));}
  const data=await apiRequest<any>('/super-admin/organizations?limit=100'); return (data.organizations || data.data || data).map(normalizeOrganization).map((org: OrganizationDetail) => ({...org, lastActive: formatDateTime(org.lastActive)}));
}
export async function createOrganization(input:{name:string;email:string;industry?:string;plan?:string}):Promise<OrganizationDetail> {
  if(isPreviewMode){await wait();return normalizeOrganization({id:`ORG-${Date.now()}`,name:input.name,email:input.email,industry:input.industry,plan:input.plan,status:'Trial',joined:new Date().toISOString(),health:100,admin:input.email,pendingInvites:1});}
  const data=await apiRequest<any>('/super-admin/organizations',{method:'POST',body:JSON.stringify(input)});
  return normalizeOrganization(data.organization || data.data || data);
}
export async function updateOrganizationStatus(id:string,status:'Active'|'Suspended'):Promise<OrganizationDetail> {
  if(isPreviewMode){await wait();return normalizeOrganization({id,status});}
  const data=await apiRequest<any>(`/super-admin/organizations/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify({status})});
  return normalizeOrganization(data.organization || data.data || data);
}
export async function getOrganization(id:string):Promise<OrganizationDetail>{
  if(isPreviewMode){await wait(250);const item=previewOrganizations.find(x=>x.id===id);if(!item)throw new Error('Organization not found.');return normalizeOrganization({...item,departments:8,branches:3,pendingInvites:4,setupCompleted:true,phone:'+234 800 000 0000',website:'https://example.com',timezone:'Africa/Lagos',description:'A growing organization using CeHR to manage its people operations.',modules:['Core HR','Attendance','Payroll','Recruitment','Documents']});}
  const data=await apiRequest<any>(`/super-admin/organizations/${encodeURIComponent(id)}`); const organization=normalizeOrganization(data.organization || data.data || data); return {...organization, lastActive: formatDateTime(organization.lastActive)};
}
export async function listAdmins():Promise<AdminAccount[]> {
  if(isPreviewMode){await wait();return [{id:'1',name:'Adeola Ogunleye',email:'adeola@cehr.com',role:'Super administrator',permissions:['*'],status:'Active',lastActive:'Now'},{id:'2',name:'Moses Eze',email:'moses@cehr.com',role:'Operations admin',permissions:['organizations.read','organizations.manage','notifications.send','support.manage'],status:'Active',lastActive:'18 min ago'},{id:'3',name:'Chidinma Okafor',email:'chidinma@cehr.com',role:'Billing admin',permissions:['billing.read','billing.manage','analytics.read'],status:'Invited',lastActive:'Never'}];}
  const data=await apiRequest<any>('/super-admin/admins'); return (data.admins || data.data || data).map(normalizeAdmin);
}
export async function inviteAdmin(input:{name:string;email:string;role:string;permissions:string[]}) { if(isPreviewMode){await wait();return {id:String(Date.now()),...input,status:'Invited' as const,lastActive:'Never'};} const data=await apiRequest<any>('/super-admin/admins',{method:'POST',body:JSON.stringify(input)}); return normalizeAdmin(data.admin || data.data || data); }
export async function updateAdmin(id:string,input:{role:string;permissions:string[]}) { if(isPreviewMode){await wait();return input;} return apiRequest(`/super-admin/admins/${id}`,{method:'PATCH',body:JSON.stringify(input)}); }
export async function removeAdmin(id:string) { if(isPreviewMode){await wait();return;} return apiRequest(`/super-admin/admins/${id}`,{method:'DELETE'}); }
export async function sendPlatformNotification(input:{organizationIds:'all'|string[];subject:string;message:string;channel:'email'|'email_and_in_app'}) { if(isPreviewMode){await wait(700);return {sentCount:input.organizationIds==='all'?previewOrganizations.length:input.organizationIds.length};} return apiRequest<{sentCount:number}>('/super-admin/notifications/broadcast',{method:'POST',body:JSON.stringify(input)}); }
export async function listFeatures():Promise<FeatureFlagDetail[]> { if(isPreviewMode){await wait();return previewFeatures.map(feature=>{const defaultEnabled=previewFeatureDefaults[feature.id]??false;const overrides=previewFeatureOverrides[feature.id]||{};const enabledFor=previewOrganizations.filter(org=>overrides[org.id]??defaultEnabled).length;return {...feature,key:feature.id,defaultEnabled,enabledFor,totalOrganizations:previewOrganizations.length,rollout:Math.round(enabledFor/previewOrganizations.length*100)};});} const data=await apiRequest<any>('/super-admin/features'); return data.features || data.data || data; }
export async function createFeature(input:{key:string;name:string;description:string;category:string;status:'Stable'|'Beta'|'Internal';icon?:string;defaultEnabled?:boolean}):Promise<FeatureFlagDetail> { if(isPreviewMode){await wait();const id=`feature-${Date.now()}`;previewFeatureDefaults[id]=Boolean(input.defaultEnabled);previewFeatureOverrides[id]={};return {...input,id,icon:input.icon||input.name.slice(0,2).toUpperCase(),defaultEnabled:Boolean(input.defaultEnabled),enabledFor:0,totalOrganizations:previewOrganizations.length,rollout:0};} const data=await apiRequest<any>('/super-admin/features',{method:'POST',body:JSON.stringify(input)}); return data.feature || data.data || data; }
export async function updateFeature(id:string,input:Partial<Pick<FeatureFlagDetail,'name'|'description'|'category'|'status'|'icon'|'defaultEnabled'>>):Promise<FeatureFlagDetail> { if(isPreviewMode){await wait();if(input.defaultEnabled!==undefined)previewFeatureDefaults[id]=input.defaultEnabled;const current=(await listFeatures()).find(feature=>feature.id===id);if(!current)throw new Error('Feature not found.');return {...current,...input};} const data=await apiRequest<any>(`/super-admin/features/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)}); return data.feature || data.data || data; }
export async function listFeatureOrganizations(id:string):Promise<{feature:{id:string;name:string;defaultEnabled:boolean};organizations:FeatureOrganization[]}> { if(isPreviewMode){await wait();const feature=(await listFeatures()).find(item=>item.id===id);if(!feature)throw new Error('Feature not found.');const overrides=previewFeatureOverrides[id]||{};return {feature:{id,name:feature.name,defaultEnabled:feature.defaultEnabled},organizations:previewOrganizations.map(org=>({id:org.id,name:org.name,email:org.email,status:org.status,overrideEnabled:Object.prototype.hasOwnProperty.call(overrides,org.id)?overrides[org.id]:null,effectiveEnabled:overrides[org.id]??feature.defaultEnabled}))};} return apiRequest(`/super-admin/features/${encodeURIComponent(id)}/organizations`); }
export async function setFeatureOrganization(id:string,organizationId:string,enabled:boolean) { if(isPreviewMode){await wait();(previewFeatureOverrides[id]??={})[organizationId]=enabled;return {override:{featureId:id,organizationId,enabled}};} return apiRequest(`/super-admin/features/${encodeURIComponent(id)}/organizations/${encodeURIComponent(organizationId)}`,{method:'PUT',body:JSON.stringify({enabled})}); }
export async function clearFeatureOrganization(id:string,organizationId:string) { if(isPreviewMode){await wait();if(previewFeatureOverrides[id])delete previewFeatureOverrides[id][organizationId];return;} return apiRequest(`/super-admin/features/${encodeURIComponent(id)}/organizations/${encodeURIComponent(organizationId)}`,{method:'DELETE'}); }
export async function listPlans():Promise<SubscriptionPlan[]> { if(isPreviewMode){await wait();return previewPlans.map((plan:any,index)=>normalizePlan({id:plan.id,key:plan.id,name:plan.name,description:plan.description,monthlyPriceKobo:plan.monthlyPrice*100,annualPriceKobo:plan.annualPrice*100,features:plan.features,color:plan.color,recommended:Boolean(plan.recommended),isActive:true,sortOrder:index+1}));} const data=await apiRequest<any>('/super-admin/plans'); return (data.plans || data.data || data).map(normalizePlan); }
const normalizePlan=(raw:any):SubscriptionPlan=>({id:String(raw.id),key:String(raw.key||raw.id),name:String(raw.name||''),description:String(raw.description||''),monthlyPriceKobo:Number(raw.monthlyPriceKobo ?? Number(raw.monthlyPrice||0)*100),annualPriceKobo:Number(raw.annualPriceKobo ?? Number(raw.annualPrice||0)*100),features:Array.isArray(raw.features)?raw.features:[],color:String(raw.color||'#2458d3'),recommended:Boolean(raw.recommended),isActive:raw.isActive!==false,sortOrder:Number(raw.sortOrder||0)});
export async function updatePlan(id:string,input:Partial<{name:string;description:string;monthlyPrice:number;annualPrice:number;features:string[];color:string;recommended:boolean;isActive:boolean;sortOrder:number}>){ if(isPreviewMode){await wait();return normalizePlan({...input,id,key:id});} const data=await apiRequest<any>(`/super-admin/plans/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)}); return normalizePlan(data.plan || data.data || data); }
export async function createPlan(input:{key:string;name:string;description:string;monthlyPrice:number;annualPrice:number;features:string[];color?:string;recommended?:boolean}){ if(isPreviewMode){await wait();return normalizePlan({...input,id:`plan-${Date.now()}`});} const data=await apiRequest<any>('/super-admin/plans',{method:'POST',body:JSON.stringify(input)}); return normalizePlan(data.plan || data.data || data); }
const normalizeBillingRecord=(raw:any):BillingRecord=>({...raw,amountKobo:Number(raw?.amountKobo||0),status:String(raw?.status||'Pending')});
export async function getBilling(tab='Overview'):Promise<BillingData>{
  if(isPreviewMode){await wait();const records=[['Northstar Logistics','Subscription renewal',124000000,'Paid'],['Kora Health','Subscription renewal',68000000,'Paid'],['Sabi Retail','Subscription renewal',32000000,'Paid'],['Verde Systems','Subscription renewal',85000000,'Paid'],['Greenfield Foods','Subscription invoice',68000000,'Overdue']].map(([organization,activity,amountKobo,status],index)=>({id:`preview-${index}`,organization:String(organization),activity:String(activity),description:String(activity),amountKobo:Number(amountKobo),status:String(status),createdAt:new Date(Date.now()-index*3600000).toISOString()}));const paid=records.filter(row=>row.status==='Paid');const outstanding=records.filter(row=>row.status!=='Paid');return {period:new Date().toISOString().slice(0,7),generatedAt:new Date().toISOString(),summary:{mrrKobo:paid.reduce((sum,row)=>sum+row.amountKobo,0),collectedKobo:paid.reduce((sum,row)=>sum+row.amountKobo,0),outstandingKobo:outstanding.reduce((sum,row)=>sum+row.amountKobo,0),failedKobo:0,paidCount:paid.length,pendingCount:0,overdueCount:outstanding.length,totalOrganizations:records.length,collectionRateKobo:80},invoices:records,transactions:records,payouts:paid.length?[{id:'preview-payout',description:'Platform subscription settlement',amountKobo:paid.reduce((sum,row)=>sum+row.amountKobo,0),status:'Scheduled',createdAt:new Date().toISOString()}]:[],tab};}
  const data=await apiRequest<any>(`/super-admin/billing?tab=${encodeURIComponent(tab)}`);return {...data,invoices:(data.invoices||[]).map(normalizeBillingRecord),transactions:(data.transactions||[]).map(normalizeBillingRecord),payouts:(data.payouts||[]).map(normalizeBillingRecord)};
}
export async function getAnalytics(period=6,view='Growth'):Promise<AnalyticsData>{
  if(isPreviewMode){await wait();const growth=(period===12?['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']:['May','Jun','Jul','Aug','Sep','Oct']).map((month,index)=>({month,organizations:158+index*15,employees:6900+index*400}));return {period,view,generatedAt:new Date().toISOString(),metrics:{organizationGrowth:period===6?18:43,employeeGrowth:period===6?608:1510,weeklyActiveUsers:7104,engagementRate:76,retentionRate:96,featureAdoption:70,activeFeatureCount:6,activeOrganizations:224,organizations:234,employees:9348},growth,planMix:[{name:'Starter',value:68,color:'#b7c1d1'},{name:'Growth',value:94,color:'#2e68e6'},{name:'Scale',value:43,color:'#8b5cf6'},{name:'Enterprise',value:19,color:'#102a68'}],adoption:[{name:'Core HR',value:96},{name:'Documents',value:84},{name:'Attendance',value:76},{name:'Payroll',value:68},{name:'Recruitment',value:53},{name:'Performance',value:41}]};}
  return apiRequest<AnalyticsData>(`/super-admin/analytics?period=${encodeURIComponent(period)}&view=${encodeURIComponent(view)}`);
}
export async function getDashboard(period=6):Promise<DashboardData>{
  if(isPreviewMode){await wait();return {generatedAt:new Date().toISOString(),metrics:{totalOrganizations:previewOrganizations.length,activeEmployees:previewOrganizations.reduce((sum,org)=>sum+org.employees,0),monthlyRevenueKobo:4280000000,outstandingKobo:320000000,outstandingCount:12},revenue:revenueData.map((row:any)=>({month:String(row.month),revenueKobo:Number(row.revenue||0)*1000000,targetKobo:Number(row.target||0)*1000000})),pulse:{health:92,dailyActiveUsers:6821,avgResponseMs:184,openIncidents:0,apiUptime:'99.99%'},recentOrganizations:previewOrganizations.slice(0,5).map((org,i)=>normalizeOrganization({...org,joined:org.joined},i))};}
  const data=await apiRequest<any>(`/super-admin/dashboard?period=${encodeURIComponent(period)}`);return {...data,recentOrganizations:(data.recentOrganizations||[]).map(normalizeOrganization)};
}
