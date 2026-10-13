import type { OrganizationStatus } from '../../types';

export function StatusBadge({ status }: { status: OrganizationStatus | 'Stable' | 'Beta' | 'Internal' | 'Resolved' | 'Investigating' }) {
  return <span className={`status status--${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span>;
}
