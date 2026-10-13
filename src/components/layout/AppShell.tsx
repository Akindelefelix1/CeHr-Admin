import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BadgeDollarSign, BarChart3, Bell, Building2, ChevronDown, CircleHelp, CreditCard, Flag, LayoutDashboard, Menu, Search, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useFeedback } from '../ui/Feedback';

const nav = [
  { label:'Overview', to:'/dashboard', icon:LayoutDashboard }, { label:'Organizations', to:'/organizations', icon:Building2 },
  { label:'Plans & pricing', to:'/plans', icon:BadgeDollarSign }, { label:'Feature controls', to:'/features', icon:Flag },
  { label:'Billing & revenue', to:'/billing', icon:CreditCard }, { label:'Analytics', to:'/analytics', icon:BarChart3 },
  { label:'Support center', to:'/support', icon:CircleHelp }, { label:'Audit logs', to:'/audit', icon:ShieldCheck },
];

const titles: Record<string, {title:string; subtitle:string}> = {
  '/dashboard':{title:'Command center',subtitle:'A complete view of your platform today.'},
  '/organizations':{title:'Organizations',subtitle:'Manage every company on the CeHR platform.'},
  '/plans':{title:'Plans & pricing',subtitle:'Shape how customers access and pay for CeHR.'},
  '/features':{title:'Feature controls',subtitle:'Control product access and staged rollouts.'},
  '/billing':{title:'Billing & revenue',subtitle:'Monitor subscriptions, collections and revenue.'},
  '/analytics':{title:'Platform analytics',subtitle:'Understand adoption, retention and product health.'},
  '/support':{title:'Support center',subtitle:'Resolve organization issues and service requests.'},
  '/audit':{title:'Audit logs',subtitle:'Review sensitive actions across the platform.'},
  '/settings':{title:'Platform settings',subtitle:'Configure security and operational preferences.'},
};

export function AppShell({ children }: { children:ReactNode }) {
  const [open,setOpen] = useState(false); const [notificationsOpen,setNotificationsOpen]=useState(false); const [profileOpen,setProfileOpen]=useState(false); const [searchValue,setSearchValue]=useState(''); const location=useLocation(); const navigate=useNavigate(); const meta=titles[location.pathname] ?? titles['/dashboard']; const {notify}=useFeedback();
  useEffect(()=>{ window.scrollTo({top:0,behavior:'instant'}); document.title=`${meta.title} · CeHR Control`; },[location.pathname,meta.title]);
  const submitSearch=()=>{const value=searchValue.trim().toLowerCase();if(!value)return;const match=nav.find(item=>item.label.toLowerCase().includes(value));if(match){navigate(match.to);setSearchValue('')}else notify('error','No results found',`Nothing matched “${searchValue}”. Try organizations, billing, analytics, or support.`)};
  return <div className="app-shell">
    <aside className={`sidebar ${open?'sidebar--open':''}`}>
      <div className="sidebar__brand"><div className="brand-symbol"><span>C</span></div><div><b>CeHR</b><small>Control</small></div><button onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <div className="workspace"><span>SUPER ADMIN WORKSPACE</span><div className="workspace__row"><span className="avatar avatar--blue">CE</span><div><b>CeHR Platform</b><small>Production</small></div><ChevronDown size={15}/></div></div>
      <nav aria-label="Primary navigation"><span className="nav-label">PLATFORM</span>{nav.slice(0,6).map(item=><NavLink key={item.to} to={item.to} onClick={()=>setOpen(false)}><item.icon size={18}/><span>{item.label}</span>{item.to==='/support'&&<em>8</em>}</NavLink>)}<span className="nav-label nav-label--lower">OPERATIONS</span>{nav.slice(6).map(item=><NavLink key={item.to} to={item.to} onClick={()=>setOpen(false)}><item.icon size={18}/><span>{item.label}</span>{item.to==='/support'&&<em>8</em>}</NavLink>)}</nav>
      <div className="sidebar__footer"><NavLink to="/settings"><Settings size={18}/>Platform settings</NavLink><div className="profile"><span className="avatar">AO</span><div><b>Adeola Ogunleye</b><small>Super administrator</small></div><ChevronDown size={15}/></div></div>
    </aside>
    {open&&<div className="sidebar-overlay" onClick={()=>setOpen(false)}/>} 
    <main className="main"><a className="skip-link" href="#main-content">Skip to main content</a><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button><div className="topbar__title"><h1>{meta.title}</h1><p>{meta.subtitle}</p></div><div className="topbar__actions"><label className="search"><Search size={17}/><input value={searchValue} onChange={e=>setSearchValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submitSearch()}}} aria-label="Search platform" placeholder="Search anything…"/><kbd>Enter</kbd></label><button className="icon-button notification" onClick={()=>setNotificationsOpen(true)} aria-label="Notifications"><Bell size={19}/><i/></button><button className="profile-button" onClick={()=>setProfileOpen(true)} aria-label="Open administrator menu"><span className="avatar">AO</span><span>Adeola</span><ChevronDown size={14}/></button></div></header>
      <div className="page-content" id="main-content">{children}</div><div className="system-status"><Activity size={13}/><span>All systems operational</span></div>
      {notificationsOpen&&<Modal title="Notifications" subtitle="Recent platform activity requiring your attention." onClose={()=>setNotificationsOpen(false)} size="small"><div className="notification-list"><button onClick={()=>{setNotificationsOpen(false);notify('info','Payment review','Greenfield Foods has an overdue invoice of ₦680,000.')}}><i className="notification-dot"/><span><b>Payment requires attention</b><small>Greenfield Foods · 12 minutes ago</small></span></button><button onClick={()=>{setNotificationsOpen(false);notify('info','Support ticket','Urgent ticket #2840 was opened by Atlas Energy.')}}><i className="notification-dot"/><span><b>Urgent support ticket</b><small>Atlas Energy · 28 minutes ago</small></span></button></div><div className="modal-actions modal-actions--end"><button className="button button--secondary" onClick={()=>{setNotificationsOpen(false);notify('success','Notifications cleared','All notifications were marked as read.')}}>Mark all as read</button></div></Modal>}
      {profileOpen&&<Modal title="Administrator account" subtitle="Signed in as a super administrator." onClose={()=>setProfileOpen(false)} size="small"><div className="profile-summary"><span className="avatar">AO</span><div><b>Adeola Ogunleye</b><span>adeola@cehr.com</span><small>Full platform access</small></div></div><div className="stack-actions"><button className="button button--secondary" onClick={()=>{setProfileOpen(false);notify('info','Profile settings','Personal profile management will connect during the API phase.')}}>Manage profile</button><button className="button button--secondary" onClick={()=>{setProfileOpen(false);notify('success','Session refreshed','Your session is active and secure.')}}>Check session</button></div></Modal>}
    </main>
  </div>
}
