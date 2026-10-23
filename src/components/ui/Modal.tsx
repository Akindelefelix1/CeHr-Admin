import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ title, subtitle, children, onClose, size='default' }: { title:string; subtitle?:string; children:ReactNode; onClose:()=>void; size?:'small'|'default'|'large' }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKeyDown); };
  }, []);
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button ref={closeRef} className="icon-button modal__close" onClick={onClose} aria-label="Close"><X size={19}/></button>
      <h2 id="modal-title">{title}</h2>{subtitle && <p className="modal__subtitle">{subtitle}</p>}
      {children}
    </section>
  </div>
}
