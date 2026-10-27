import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Modal } from './Modal';

interface Props {
  open: boolean; title: string; message: string; confirmLabel: string;
  tone?: 'danger' | 'warning'; busy?: boolean; onCancel: () => void; onConfirm: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, tone='danger', busy=false, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return <Modal title={title} subtitle={message} onClose={onCancel} size="small">
    <div className={`confirm-callout confirm-callout--${tone}`}><AlertTriangle size={18}/><span>This action affects the live platform and will be recorded in the audit log.</span></div>
    <div className="modal-actions modal-actions--end"><button className="button button--secondary" disabled={busy} onClick={onCancel}>Cancel</button><button className={tone === 'danger' ? 'button button--danger-solid' : 'button button--primary'} disabled={busy} aria-busy={busy} onClick={onConfirm}>{busy&&<LoaderCircle size={15} className="spin"/>}{confirmLabel}</button></div>
  </Modal>;
}
