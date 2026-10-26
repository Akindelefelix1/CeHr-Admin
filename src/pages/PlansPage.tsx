import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useFeedback } from '../components/ui/Feedback';
import { createPlan, listPlans, updatePlan, type SubscriptionPlan } from '../services/superAdmin';

const money = (kobo: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format((Number(kobo || 0) / 100));
const blank = { key: '', name: '', description: '', monthlyPrice: '', minimumMonthlyFee: '', annualDiscountPercent: '0', taxRatePercent: '0', features: '', color: '#2458d3', recommended: false };

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
    try { setPlans(await listPlans()); }
    catch (error) { notify('error', 'Plans unavailable', error instanceof Error ? error.message : 'Please retry.'); }
    finally { setLoading(false); }
  }, [notify]);
  useEffect(() => { void load(); }, [load]);

  const edit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setForm({ key: plan.key, name: plan.name, description: plan.description, monthlyPrice: String(plan.monthlyPriceKobo / 100), minimumMonthlyFee: String(plan.minimumMonthlyFeeKobo / 100), annualDiscountPercent: String(plan.annualDiscountPercent), taxRatePercent: String(plan.taxRatePercent), features: plan.features.join('\n'), color: plan.color, recommended: plan.recommended });
  };
  const closeModal = useCallback(() => { if (saving) return; setEditing(null); setCreating(false); }, [saving]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const input = { ...(editing?.isCustom ? { name: form.name.trim() } : {}), description: form.description.trim(), monthlyPrice: Number(form.monthlyPrice || 0), minimumMonthlyFee: Number(form.minimumMonthlyFee || 0), annualDiscountPercent: Number(form.annualDiscountPercent || 0), taxRatePercent: Number(form.taxRatePercent || 0), features: form.features.split('\n').map(value => value.trim()).filter(Boolean), color: form.color, recommended: form.recommended };
    try {
      setSaving(editing?.id || 'new');
      const result = editing ? await updatePlan(editing.id, input) : await createPlan({ ...input, key: form.key.trim(), name: form.name.trim(), isCustom: true });
      setPlans(items => editing ? items.map(item => item.id === editing.id ? { ...item, ...result } : item) : [...items, result as SubscriptionPlan]);
      setEditing(null); setCreating(false); notify('success', 'Plan saved', 'Pricing is now updated.');
    } catch (error) { notify('error', 'Plan save failed', error instanceof Error ? error.message : 'Please retry.'); }
    finally { setSaving(''); }
  };

  return <>
    <div className="page-actions">
      <div><h2>Plans & pricing</h2><p>Set per-user rates, minimums, and annual discounts.</p></div>
      <div className="button-group">
        <div className="billing-toggle"><button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Annual</button></div>
        <button className="button button--primary" onClick={() => { setForm({ ...blank, key: 'custom-', name: 'Custom' }); setCreating(true); }}><Plus size={16}/>Create custom plan</button>
      </div>
    </div>
    {loading ? <div className="empty-state"><span className="spinner"/>Loading plans…</div> : <section className="pricing-grid">
      {plans.filter(plan => plan.isActive).map(plan => {
        const amount = annual ? plan.annualPriceKobo : plan.monthlyPriceKobo;
        const quote = plan.isCustom && !plan.monthlyPriceKobo;
        const tierIntro = plan.key === 'starter' ? 'Included in Starter:' : plan.key === 'standard' ? 'Everything in Starter, plus:' : plan.key === 'professional' ? 'Everything in Standard, plus:' : 'Everything in Professional, tailored to your needs:';
        const tierOrder = ['starter', 'standard', 'professional'];
        const tierIndex = plan.isCustom ? tierOrder.length : Math.max(0, tierOrder.indexOf(plan.key.toLowerCase()));
        const cumulativeFeatures = [...new Set(plans.filter(item => { if (item.isCustom) return item.id === plan.id; const itemRank = tierOrder.indexOf(item.key.toLowerCase()); return itemRank >= 0 && itemRank <= tierIndex; }).flatMap(item => item.features))];
        return <article className={`price-card ${plan.recommended ? 'price-card--featured' : ''}`} key={plan.id}>
          <div className="price-dot" style={{ background: plan.color }}/><h3>{plan.name}</h3><p>{plan.description}</p>
          {plan.isCustom && <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{quote ? 'Quote-based' : 'Custom quote'}</span>}
          <div className="price"><b>{quote ? 'Quote-based' : money(amount)}</b><span>{quote ? 'set by the super admin' : `/ employee / ${annual ? 'year' : 'month'}`}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-y-2 border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">Minimum monthly fee</span><b className="text-right">{money(plan.minimumMonthlyFeeKobo)}</b><span className="text-slate-500">Annual discount</span><b className="text-right">{plan.annualDiscountPercent}%</b></div>
          <div className="mt-4 text-xs font-semibold text-slate-600">{tierIntro}</div><ul>{cumulativeFeatures.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>
          <button className="button button--secondary button--full" disabled={Boolean(saving)} onClick={() => edit(plan)}>Edit plan</button>
        </article>;
      })}
    </section>}
    {(editing || creating) && <Modal title={editing ? `Edit ${editing.name}` : 'Create custom plan'} subtitle="All rates are per approved employee. Changes apply to upcoming invoices." onClose={closeModal}>
      <form className="form" onSubmit={submit}>
        {creating && <label>Plan key<input required pattern="[a-z0-9-_]+" value={form.key} onChange={event => setForm(current => ({ ...current, key: event.target.value }))}/></label>}
        {(creating || editing?.isCustom) && <label>Plan name<input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))}/></label>}
        <div className="form-row">
          <label>Price per user / month (₦)<input required type="number" min="0" step="0.01" value={form.monthlyPrice} onChange={event => setForm(current => ({ ...current, monthlyPrice: event.target.value }))}/></label>
          <label>Minimum monthly fee (₦)<input required type="number" min="0" step="0.01" value={form.minimumMonthlyFee} onChange={event => setForm(current => ({ ...current, minimumMonthlyFee: event.target.value }))}/></label>
        </div>
        <div className="form-row">
          <label>Annual discount (%)<input required type="number" min="0" max="100" step="0.01" value={form.annualDiscountPercent} onChange={event => setForm(current => ({ ...current, annualDiscountPercent: event.target.value }))}/></label>
          <label>Tax rate (%)<input required type="number" min="0" max="100" step="0.01" value={form.taxRatePercent} onChange={event => setForm(current => ({ ...current, taxRatePercent: event.target.value }))}/></label>
        </div>
        <label>Description<textarea required value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))}/></label>
        <label>Benefits<span className="form-hint">One benefit per line</span><textarea value={form.features} onChange={event => setForm(current => ({ ...current, features: event.target.value }))}/></label>
        <div className="modal-actions modal-actions--end"><button type="button" className="button button--secondary" disabled={Boolean(saving)} onClick={closeModal}>Cancel</button><button className="button button--primary" disabled={Boolean(saving)}>{saving && <LoaderCircle size={14} className="spin"/>}{saving ? 'Saving…' : editing ? 'Save changes' : 'Create custom plan'}</button></div>
      </form>
    </Modal>}
  </>;
}
