import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, Building2, Download, MousePointerClick, UsersRound } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { useFeedback } from '../components/ui/Feedback';
import { getAnalytics, type AnalyticsData } from '../services/superAdmin';

const views = ['Growth', 'Engagement', 'Product', 'Retention'];
const periods = [{ label: 'Last 6 months', value: 6 }, { label: 'Last 12 months', value: 12 }];

export default function AnalyticsPage() {
  const [view, setView] = useState('Growth');
  const [period, setPeriod] = useState(6);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const { notify } = useFeedback();

  const load = async () => {
    const version = ++requestVersion.current;
    try {
      setLoading(true); setError('');
      const result = await getAnalytics(period, view);
      if (version === requestVersion.current) setData(result);
    } catch (requestError) {
      if (version === requestVersion.current) setError(requestError instanceof Error ? requestError.message : 'Unable to load analytics.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [period, view]);

  const exportReport = () => {
    if (!data) return;
    try {
      const rows = [['Section', 'Name', 'Value', 'Secondary value'], ['Growth', 'Month', 'Organizations', 'Employees'], ...data.growth.map(row => ['Growth', row.month, String(row.organizations), String(row.employees)]), ['Plan mix', 'Plan', 'Organizations', ''], ...data.planMix.map(row => ['Plan mix', row.name, String(row.value), '']), ['Adoption', 'Module', 'Adoption %', ''], ...data.adoption.map(row => ['Adoption', row.name, String(row.value), ''])];
      const cell=(value:string)=>{const safe=/^[\s]*[=+@-]/.test(value)?`'${value}`:value;return `"${safe.replaceAll('"','""')}"`;};
      const csv = rows.map(row => row.map(cell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = `cehr-analytics-${period}-months.csv`; link.click(); window.setTimeout(()=>URL.revokeObjectURL(url),0);
      notify('success', 'Analytics report exported', `${data.growth.length} periods were downloaded.`);
    } catch { notify('error', 'Export failed', 'Please retry the export.'); }
  };

  if (loading) return <div className="empty-state"><span className="spinner" />Loading analytics…</div>;
  if (error) return <div className="empty-state"><AlertTriangle /><b>Unable to load analytics</b><span>{error}</span><button className="button button--secondary" onClick={() => void load()}>Retry</button></div>;
  if (!data) return <div className="empty-state">No analytics data available.</div>;

  return <>
    <div className="page-actions">
      <div className="segmented">{views.map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>)}</div>
      <div className="button-group"><select className="select" value={period} onChange={event => setPeriod(Number(event.target.value))} aria-label="Analytics period">{periods.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select><button className="button button--secondary" onClick={exportReport}><Download size={16} />Export</button></div>
    </div>
    <section className="metrics-grid">
      <MetricCard label={view === 'Retention' ? 'Organization retention' : 'Organization growth'} value={view === 'Retention' ? `${data.metrics.retentionRate ?? 0}%` : `+${data.metrics.organizationGrowth}`} change={`${data.metrics.activeOrganizations} active`} icon={Building2} tone="#e9f0ff" />
      <MetricCard label={view === 'Engagement' ? 'Engagement rate' : 'Employee growth'} value={view === 'Engagement' ? `${data.metrics.engagementRate ?? 0}%` : `+${data.metrics.employeeGrowth.toLocaleString()}`} change={view === 'Engagement' ? `${data.metrics.weeklyActiveUsers.toLocaleString()} active this week` : `${data.metrics.employees.toLocaleString()} total`} icon={UsersRound} tone="#e8f8f1" />
      <MetricCard label="Weekly active users" value={data.metrics.weeklyActiveUsers.toLocaleString()} change="Last 7 days" icon={Activity} tone="#f1ecff" />
      <MetricCard label="Feature adoption" value={`${data.metrics.featureAdoption}%`} change={`${data.metrics.activeFeatureCount ?? data.adoption.length} tracked modules`} icon={MousePointerClick} tone="#fff4df" />
    </section>
    <section className="analytics-grid">
      <article className="panel analytics-wide"><div className="panel__header"><div><span className="eyebrow">PLATFORM GROWTH</span><h3>Organizations & employees</h3></div></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.growth}><CartesianGrid vertical={false} stroke="#edf0f4" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis yAxisId="left" axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} /><Tooltip /><Area yAxisId="left" dataKey="organizations" stroke="#2458d3" strokeWidth={3} fill="#e8efff" /><Area yAxisId="right" dataKey="employees" stroke="#8b5cf6" strokeWidth={2} fill="#f1ebff" /></AreaChart></ResponsiveContainer></div></article>
      <article className="panel"><div className="panel__header"><div><span className="eyebrow">PLAN MIX</span><h3>Subscription distribution</h3></div></div><div className="donut-wrap"><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={data.planMix} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3}>{data.planMix.map(item => <Cell fill={item.color} key={item.name} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><b>{data.metrics.organizations}<small>total orgs</small></b></div><div className="plan-legend">{data.planMix.map(item => <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.value}</b></div>)}</div></article>
    </section>
    <section className="panel"><div className="panel__header"><div><span className="eyebrow">PRODUCT ADOPTION</span><h3>Usage across key modules</h3></div></div><div className="adoption-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.adoption} layout="vertical"><CartesianGrid horizontal={false} stroke="#edf0f4" /><XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={value => `${value}%`} /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} /><Tooltip formatter={value => `${value}%`} /><Bar dataKey="value" fill="#2e68e6" radius={[0, 5, 5, 0]} barSize={18} /></BarChart></ResponsiveContainer></div></section>
  </>;
}
