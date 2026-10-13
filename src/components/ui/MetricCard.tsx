import type { LucideIcon } from 'lucide-react';

interface Props { label: string; value: string; change: string; trend?: 'up' | 'down'; icon: LucideIcon; tone: string; note?: string }
export function MetricCard({ label, value, change, trend='up', icon: Icon, tone, note }: Props) {
  return <article className="metric-card">
    <div className="metric-card__top"><span className="metric-card__label">{label}</span><span className="metric-card__icon" style={{ background:tone }}><Icon size={18}/></span></div>
    <strong>{value}</strong>
    <div className="metric-card__meta"><span className={trend === 'up' ? 'positive' : 'negative'}>{trend === 'up' ? '↗' : '↘'} {change}</span><span>{note ?? 'vs last month'}</span></div>
  </article>
}
