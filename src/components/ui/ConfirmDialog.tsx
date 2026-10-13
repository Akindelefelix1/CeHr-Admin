import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface Props {
  open: boolean; title: string; message: string; confirmLabel: string;
  tone?: 'danger' | 'warning'; onCancel: () => void; onConfirm: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, tone='danger', onCancel, onConfirm }: Props) {
  if (!open) return null;
  return <Modal title={title} subtitle={message} onClose={onCancel} size="small">
    <div className={`confirm-callout confirm-callout--${tone}`}><AlertTriangle size={18}/><span>This action affects the live platform and will be recorded in the audit log.</span></div>
    <div className="modal-actions modal-actions--end"><button className="button button--secondary" onClick={onCancel}>Cancel</button><button className={tone === 'danger' ? 'button button--danger-solid' : 'button button--primary'} onClick={onConfirm}>{confirmLabel}</button></div>
  </Modal>;
}
