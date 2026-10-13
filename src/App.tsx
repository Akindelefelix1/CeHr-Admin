import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import OrganizationsPage from './pages/OrganizationsPage';
import PlansPage from './pages/PlansPage';
import FeaturesPage from './pages/FeaturesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { AuditPage, BillingPage, SettingsPage, SupportPage } from './pages/OperationsPages';

export default function App(){return <AppShell><Routes><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/organizations" element={<OrganizationsPage/>}/><Route path="/plans" element={<PlansPage/>}/><Route path="/features" element={<FeaturesPage/>}/><Route path="/billing" element={<BillingPage/>}/><Route path="/analytics" element={<AnalyticsPage/>}/><Route path="/support" element={<SupportPage/>}/><Route path="/audit" element={<AuditPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></AppShell>}
