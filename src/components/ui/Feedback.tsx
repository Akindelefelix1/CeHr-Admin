import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; title: string; message?: string }
interface FeedbackValue { notify: (kind: ToastKind, title: string, message?: string) => void }

const FeedbackContext = createContext<FeedbackValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts(items => items.filter(item => item.id !== id)), []);
  const notify = useCallback((kind: ToastKind, title: string, message?: string) => {
    const id = Date.now() + Math.random();
    setToasts(items => [...items.slice(-3), { id, kind, title, message }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);
  const value = useMemo(() => ({ notify }), [notify]);
  return <FeedbackContext.Provider value={value}>{children}<div className="toast-viewport" aria-live="polite" aria-atomic="false">{toasts.map(toast => {
    const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? CircleAlert : Info;
    return <div className={`toast toast--${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'} key={toast.id}><Icon size={20}/><div><b>{toast.title}</b>{toast.message && <p>{toast.message}</p>}</div><button onClick={() => dismiss(toast.id)} aria-label="Dismiss message"><X size={16}/></button></div>;
  })}</div></FeedbackContext.Provider>;
}

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useFeedback must be used inside FeedbackProvider');
  return value;
}
