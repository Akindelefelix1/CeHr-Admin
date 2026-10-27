import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import OrganizationsPage from './pages/OrganizationsPage';
import PlansPage from './pages/PlansPage';
import FeaturesPage from './pages/FeaturesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { AuditPage, SettingsPage, SupportPage } from './pages/OperationsPages';
import BillingPage from './pages/BillingPage';
import LoginPage from './pages/LoginPage';
import RolesAccessPage from './pages/RolesAccessPage';
import NotificationsPage from './pages/NotificationsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';

const pagePermissions:Record<string,string[]>={
 '/dashboard':['organizations.read','analytics.read','billing.read'],
 '/organizations':['organizations.read'], '/plans':['billing.read'], '/features':['features.read'],
 '/billing':['billing.read'], '/analytics':['analytics.read'], '/notifications':['notifications.send'],
 '/roles-access':['admins.manage'], '/support':['support.manage'], '/audit':['audit.read'], '/settings':['settings.manage'],
};
function ProtectedApp(){const {admin}=useAuth();const location=useLocation();if(!admin)return <Navigate to="/login" replace state={{from:location.pathname}}/>;if(location.pathname==='/change-password')return <ChangePasswordPage/>;
 const canAccess=(path:string)=>admin.permissions.includes('*')||pagePermissions[path].every(permission=>admin.permissions.includes(permission));
 const fallback=Object.keys(pagePermissions).find(canAccess);
 const denied=<section className="empty-state"><b>You don’t have access to this page</b><span>Your administrator permissions do not include the access required here.</span>{fallback&&<Link className="button button--secondary" to={fallback}>Go to an available page</Link>}</section>;
 const page=(path:string,element:ReactNode)=><Route key={path} path={path} element={canAccess(path)?element:denied}/>;
 return <AppShell><Routes>{page('/dashboard',<DashboardPage/>)}{page('/organizations',<OrganizationsPage/>)}{page('/plans',<PlansPage/>)}{page('/features',<FeaturesPage/>)}{page('/billing',<BillingPage/>)}{page('/analytics',<AnalyticsPage/>)}{page('/notifications',<NotificationsPage/>)}{page('/roles-access',<RolesAccessPage/>)}{page('/support',<SupportPage/>)}{page('/audit',<AuditPage/>)}{page('/settings',<SettingsPage/>)}<Route path="*" element={fallback?<Navigate to={fallback} replace/>:<>{denied}</>}/></Routes></AppShell>}
export default function App(){return <Routes><Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/*" element={<ProtectedApp/>}/></Routes>}
