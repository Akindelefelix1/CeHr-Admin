import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useFeedback } from '../components/ui/Feedback';
import { createPlan, listPlans, updatePlan, type SubscriptionPlan } from '../services/superAdmin';

const money = (kobo: number) => `₦${(Number(kobo || 0) / 100).toLocaleString('en-NG')}`;
const blank = { key: '', name: '', description: '', monthlyPrice: '', annualPrice: '', features: '', color: '#2458d3', recommended: false };

export default function PlansPage() {
  const [annual, setAnnual] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const { notify } = useFeedback();

  const load = useCallback(async () => {
    try {
      setPlans(await listPlans());
    } catch (error) {
      notify('error', 'Plans unavailable', error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const edit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setForm({ key: plan.key, name: plan.name, description: plan.description, monthlyPrice: String(plan.monthlyPriceKobo / 100), annualPrice: String(plan.annualPriceKobo / 100), features: plan.features.join('\n'), color: plan.color, recommended: plan.recommended });
  };

  const closeModal = useCallback(() => {
    if (saving) return;
    setEditing(null);
    setCreating(false);
  }, [saving]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const input = { name: form.name.trim(), description: form.description.trim(), monthlyPrice: Number(form.monthlyPrice || 0), annualPrice: Number(form.annualPrice || 0), features: form.features.split('\n').map(value => value.trim()).filter(Boolean), color: form.color, recommended: form.recommended };
    try {
      setSaving(editing?.id || 'new');
      const result = editing ? await updatePlan(editing.id, input) : await createPlan({ ...input, key: form.key.trim() });
      setPlans(items => editing ? items.map(item => item.id === editing.id ? { ...item, ...result } : item) : [...items, result as SubscriptionPlan]);
      setEditing(null);
      setCreating(false);
      notify('success', 'Plan saved', 'Plan changes are now API-backed.');
    } catch (error) {
      notify('error', 'Plan save failed', error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setSaving('');
    }
  };

  return <>
    <div className="page-actions">
      <div><h2>Plans & pricing</h2><p>Set subscription content and per employee pricing.</p></div>
      <div className="button-group">
        <div className="billing-toggle"><button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Annual</button></div>
        <button className="button button--primary" onClick={() => { setForm(blank); setCreating(true); }}><Plus size={16}/>Create plan</button>
      </div>
    </div>
    {loading ? <div className="empty-state"><span className="spinner"/>Loading plans…</div> : <section className="pricing-grid">
      {plans.filter(plan => plan.isActive).map(plan => <article className={`price-card ${plan.recommended ? 'price-card--featured' : ''}`} key={plan.id}>
        <div className="price-dot" style={{ background: plan.color }}/><h3>{plan.name}</h3><p>{plan.description}</p>
        <div className="price"><b>{plan.monthlyPriceKobo || plan.annualPriceKobo ? money(annual ? plan.annualPriceKobo : plan.monthlyPriceKobo) : 'Custom'}</b><span>/ employee / {annual ? 'year' : 'month'}</span></div>
        <ul>{plan.features.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>
        <button className="button button--secondary button--full" disabled={Boolean(saving)} onClick={() => edit(plan)}>Edit plan</button>
      </article>)}
    </section>}
    {(editing || creating) && <Modal title={editing ? `Edit ${editing.name}` : 'Create pricing plan'} subtitle="Prices are charged per employee." onClose={closeModal}>
      <form className="form" onSubmit={submit}>
        {!editing && <label>Plan key<input required pattern="[a-z0-9-_]+" value={form.key} onChange={event => setForm(current => ({ ...current, key: event.target.value }))}/></label>}
        <label>Plan name<input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))}/></label>
        <div className="form-row">
          <label>Monthly price per employee<input required type="number" min="0" value={form.monthlyPrice} onChange={event => setForm(current => ({ ...current, monthlyPrice: event.target.value }))}/></label>
          <label>Annual price per employee<input required type="number" min="0" value={form.annualPrice} onChange={event => setForm(current => ({ ...current, annualPrice: event.target.value }))}/></label>
        </div>
        <label>Description<textarea required value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))}/></label>
        <label>Benefits<span className="form-hint">One benefit per line</span><textarea value={form.features} onChange={event => setForm(current => ({ ...current, features: event.target.value }))}/></label>
        <div className="modal-actions modal-actions--end"><button type="button" className="button button--secondary" disabled={Boolean(saving)} onClick={closeModal}>Cancel</button><button className="button button--primary" disabled={Boolean(saving)}>{saving && <LoaderCircle size={14} className="spin"/>}{saving ? 'Saving…' : editing ? 'Save changes' : 'Create plan'}</button></div>
      </form>
    </Modal>}
  </>;
}
