import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock3, LoaderCircle, PlugZap, RefreshCw, Save, ShieldCheck, Wrench } from 'lucide-react';
import { useFeedback } from '../components/ui/Feedback';
import { getPlatformSettings, updatePlatformSettings, type PlatformIntegrationStatus, type PlatformSettingsResponse, type PlatformSettingsValues } from '../services/platformSettings';
import './PlatformSettingsPage.css';

type Section = 'operations' | 'security' | 'notifications' | 'integrations';

const sections: { id: Section; label: string; icon: typeof Wrench }[] = [
  { id: 'operations', label: 'Service availability', icon: Wrench },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: PlugZap },
];

function SettingSwitch({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: (value: boolean) => void }) {
  return <button className={`settings-switch${checked ? ' is-on' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}><span /></button>;
}

function IntegrationCard({ item }: { item: PlatformIntegrationStatus }) {
  const ready = item.status === 'ready';
  const disabled = item.status === 'disabled';
  return <article className="settings-integration">
    <span className={`settings-integration__icon${ready ? ' is-ready' : ''}`}>{ready ? <CheckCircle2 size={19} /> : disabled ? <AlertTriangle size={19} /> : <PlugZap size={19} />}</span>
    <div className="settings-integration__body"><div className="settings-integration__title"><b>{item.name}</b><span>{item.provider}</span></div><p>{item.description}</p></div>
    <span className={`settings-status-pill settings-status-pill--${item.status}`}>{ready ? 'Configured' : disabled ? 'Disabled' : 'Needs setup'}</span>
  </article>;
}

export function SettingsPage() {
  const [section, setSection] = useState<Section>('operations');
  const [data, setData] = useState<PlatformSettingsResponse | null>(null);
  const [draft, setDraft] = useState<PlatformSettingsValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useFeedback();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getPlatformSettings();
      setData(result);
      setDraft({ ...result.settings });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Platform settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const dirty = useMemo(() => Boolean(data && draft && JSON.stringify(data.settings) !== JSON.stringify(draft)), [data, draft]);
  const enablingMaintenance = Boolean(data && draft?.maintenanceMode && !data.settings.maintenanceMode);
  const change = <K extends keyof PlatformSettingsValues>(key: K, value: PlatformSettingsValues[K]) => setDraft(current => current ? { ...current, [key]: value } : current);

  const save = async () => {
    if (!draft || !dirty) return;
    if (enablingMaintenance && !confirmMaintenance) return;
    setSaving(true);
    setError('');
    try {
      const result = await updatePlatformSettings(draft);
      setData(result);
      setDraft({ ...result.settings });
      setConfirmMaintenance(false);
      notify('success', 'Platform settings saved', 'Changes are active on the backend.');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Platform settings could not be saved.';
      setError(message);
      notify('error', 'Settings were not saved', message);
    } finally {
      setSaving(false);
    }
  };

  const activeSection = sections.find(item => item.id === section)!;
  const ActiveIcon = activeSection.icon;
  const updatedLabel = data?.updatedAt ? `${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt))}${data.updatedBy ? ` by ${data.updatedBy}` : ''}` : 'Default settings';

  return <div className="platform-settings-page">
    <div className="platform-settings-heading">
      <div><span className="eyebrow">PLATFORM SETTINGS</span><h2>Control platform behavior</h2><p>Changes are saved to the backend and recorded in the audit log.</p></div>
      <button className="button button--secondary" type="button" onClick={() => void refresh()} disabled={loading || saving || dirty}><RefreshCw size={15} />Refresh</button>
    </div>

    {error && <div className="settings-error" role="alert"><AlertTriangle size={18} /><span>{error}</span>{!data && <button className="text-button" type="button" onClick={() => void refresh()}>Try again</button>}</div>}
    {loading && !data && <section className="panel settings-loading"><LoaderCircle className="spin" size={20} /><b>Loading saved settings…</b></section>}
    {!loading && !data && error && <section className="panel settings-unavailable"><ShieldCheck size={27} /><h3>Settings are unavailable</h3><p>Check the backend connection and your platform settings permission, then try again.</p></section>}

    {data && draft && <>
      <div className="settings-summary">
        <span className={`settings-summary__indicator${draft.maintenanceMode ? ' is-maintenance' : ''}`} />
        <div><b>{draft.maintenanceMode ? 'Maintenance mode is on' : 'Platform is live'}</b><span>Last saved: {updatedLabel}</span></div>
        <span className="settings-summary__right">{draft.maintenanceMode ? 'Organization API traffic is paused' : 'Organization services are available'}</span>
      </div>

      <div className="platform-settings-layout">
        <nav className="settings-nav" aria-label="Platform settings sections">
          {sections.map(item => { const Icon = item.icon; return <button type="button" key={item.id} className={section === item.id ? 'active' : ''} aria-current={section === item.id ? 'page' : undefined} onClick={() => setSection(item.id)}><Icon size={17} />{item.label}</button>; })}
        </nav>

        <section className="panel settings-content" aria-labelledby="settings-section-title">
          <div className="settings-content__heading"><span className="settings-content__icon"><ActiveIcon size={19} /></span><div><h3 id="settings-section-title">{activeSection.label}</h3><p>{section === 'operations' ? 'Control whether organization services can be used.' : section === 'security' ? 'Set super-admin session and audit history limits.' : section === 'notifications' ? 'Choose whether platform announcements may be emailed.' : 'Check backend integration configuration without exposing credentials.'}</p></div></div>

          {section === 'operations' && <div className="settings-fields">
            <div className="settings-row"><div><b>Maintenance mode</b><p>Pauses organization API requests and returns a maintenance message. Super-admin and health endpoints remain available.</p></div><SettingSwitch checked={draft.maintenanceMode} disabled={saving} label="Maintenance mode" onChange={value => { if (!value) setConfirmMaintenance(false); change('maintenanceMode', value); }} /></div>
            {enablingMaintenance && <label className="settings-confirm-maintenance"><input type="checkbox" checked={confirmMaintenance} onChange={event => setConfirmMaintenance(event.target.checked)} disabled={saving}/><span>I understand that enabling maintenance pauses requests for all organizations.</span></label>}
            <label className="settings-field"><span>Maintenance message</span><textarea value={draft.maintenanceMessage} maxLength={500} rows={3} disabled={saving} onChange={event => change('maintenanceMessage', event.target.value)} placeholder="CeHR is undergoing scheduled maintenance. Please try again shortly."/><small>{draft.maintenanceMessage.length}/500 characters. This message is returned to organization API clients while maintenance is on.</small></label>
          </div>}

          {section === 'security' && <div className="settings-fields">
            <label className="settings-field settings-field--narrow"><span>Super-admin session duration</span><div className="settings-input-with-suffix"><input type="number" min={1} max={24} step={1} value={draft.adminSessionHours} disabled={saving} onChange={event => change('adminSessionHours', Number(event.target.value))}/><span>hours</span></div><small>Applies to new sign-ins. Existing access tokens keep their current expiry.</small></label>
            <label className="settings-field settings-field--narrow"><span>Audit log retention</span><div className="settings-input-with-suffix"><input type="number" min={30} max={3650} step={1} value={draft.auditRetentionDays} disabled={saving} onChange={event => change('auditRetentionDays', Number(event.target.value))}/><span>days</span></div><small>Older audit entries are excluded immediately and removed by the daily cleanup.</small></label>
          </div>}

          {section === 'notifications' && <div className="settings-fields">
            <div className="settings-row"><div><b>Platform email broadcasts</b><p>When disabled, email-only broadcasts are rejected. Combined email and in-app broadcasts continue in-app only.</p></div><SettingSwitch checked={draft.emailNotificationsEnabled} disabled={saving} label="Platform email broadcasts" onChange={value => change('emailNotificationsEnabled', value)} /></div>
            <div className="settings-note"><Bell size={17}/><span>Email delivery also requires a configured email integration. Transactional emails such as account invitations and password resets follow the backend mail configuration independently.</span></div>
          </div>}

          {section === 'integrations' && <div className="settings-fields">
            <div className="settings-integrations">{data.integrations.map(item => <IntegrationCard key={item.key} item={item} />)}</div>
            <div className="settings-note"><ShieldCheck size={17}/><span>Credentials are never returned to the browser. Configure provider secrets in the backend host environment, then restart or redeploy the backend. Status shows configuration presence, not a live provider transaction test.</span></div>
          </div>}

          <div className="settings-content__footer"><span><Clock3 size={14}/>Saved changes are audited.</span>{dirty && <b>Unsaved changes</b>}</div>
        </section>
      </div>

      <div className="settings-savebar"><span>{dirty ? 'You have unsaved changes.' : `Updated ${updatedLabel}`}</span><button className="button button--primary" type="button" onClick={() => void save()} disabled={!dirty || saving || loading || (enablingMaintenance && !confirmMaintenance)}>{saving ? <LoaderCircle size={15} className="spin" /> : <Save size={15}/>} {saving ? 'Saving…' : 'Save changes'}</button></div>
    </>}
  </div>;
}
