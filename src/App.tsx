import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import { useAuth } from './context/AuthContext';

function ProtectedApp(){const {admin}=useAuth();const location=useLocation();if(!admin)return <Navigate to="/login" replace state={{from:location.pathname}}/>;return <AppShell><Routes><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/organizations" element={<OrganizationsPage/>}/><Route path="/plans" element={<PlansPage/>}/><Route path="/features" element={<FeaturesPage/>}/><Route path="/billing" element={<BillingPage/>}/><Route path="/analytics" element={<AnalyticsPage/>}/><Route path="/notifications" element={<NotificationsPage/>}/><Route path="/roles-access" element={<RolesAccessPage/>}/><Route path="/support" element={<SupportPage/>}/><Route path="/audit" element={<AuditPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></AppShell>}
export default function App(){return <Routes><Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/*" element={<ProtectedApp/>}/></Routes>}
