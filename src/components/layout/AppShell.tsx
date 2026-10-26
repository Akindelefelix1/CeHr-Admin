import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BadgeDollarSign, BarChart3, Bell, Building2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CreditCard, Flag, KeyRound, LayoutDashboard, LogOut, Menu, Search, Send, Settings, ShieldCheck, UserCog, UserRound, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useFeedback } from '../ui/Feedback';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { listSupportTickets } from '../../services/superAdmin';

const nav = [
  { label:'Overview', to:'/dashboard', icon:LayoutDashboard }, { label:'Organizations', to:'/organizations', icon:Building2 },
  { label:'Plans & pricing', to:'/plans', icon:BadgeDollarSign }, { label:'Feature controls', to:'/features', icon:Flag },
  { label:'Billing & revenue', to:'/billing', icon:CreditCard }, { label:'Analytics', to:'/analytics', icon:BarChart3 },
  { label:'Notifications', to:'/notifications', icon:Send }, { label:'Roles & access', to:'/roles-access', icon:UserCog },
  { label:'Support center', to:'/support', icon:CircleHelp }, { label:'Audit logs', to:'/audit', icon:ShieldCheck },
];
const requiredPermissions:Record<string,string[]>={
  '/dashboard':['organizations.read','analytics.read','billing.read'], '/organizations':['organizations.read'],
  '/plans':['billing.read'], '/features':['features.read'], '/billing':['billing.read'], '/analytics':['analytics.read'],
  '/notifications':['notifications.send'], '/roles-access':['admins.manage'], '/support':['support.manage'], '/audit':['audit.read'],
};

const titles: Record<string, {title:string; subtitle:string}> = {
  '/dashboard':{title:'Command center',subtitle:'A complete view of your platform today.'},
  '/organizations':{title:'Organizations',subtitle:'Manage every company on the CeHR platform.'},
  '/plans':{title:'Plans & pricing',subtitle:'Shape how customers access and pay for CeHR.'},
  '/features':{title:'Feature controls',subtitle:'Control product access and staged rollouts.'},
  '/billing':{title:'Billing & revenue',subtitle:'Monitor subscriptions, collections and revenue.'},
  '/analytics':{title:'Platform analytics',subtitle:'Understand adoption, retention and product health.'},
  '/notifications':{title:'Organization notifications',subtitle:'Send platform updates to all or selected organizations.'},
  '/roles-access':{title:'Roles & access',subtitle:'Manage administrators, roles and platform permissions.'},
  '/support':{title:'Support center',subtitle:'Resolve organization issues and service requests.'},
  '/audit':{title:'Audit logs',subtitle:'Review sensitive actions across the platform.'},
  '/settings':{title:'Platform settings',subtitle:'Configure security and operational preferences.'},
};

export function AppShell({ children }: { children:ReactNode }) {
  const [open,setOpen] = useState(false); const [collapsed,setCollapsed] = useState(false); const [notificationsOpen,setNotificationsOpen]=useState(false); const [profileOpen,setProfileOpen]=useState(false); const [logoutOpen,setLogoutOpen]=useState(false); const [searchValue,setSearchValue]=useState(''); const [openSupportCount,setOpenSupportCount]=useState(0); const location=useLocation(); const navigate=useNavigate(); const meta=titles[location.pathname] ?? titles['/dashboard']; const {notify}=useFeedback(); const {admin,logout}=useAuth();
  useEffect(()=>{ window.scrollTo({top:0,behavior:'instant'}); document.title=`${meta.title} · CeHR Control`; },[location.pathname,meta.title]);
  const canAccess=(path:string)=>Boolean(admin&&(admin.permissions.includes('*')||requiredPermissions[path]?.every(permission=>admin.permissions.includes(permission))||(path==='/settings'&&admin.permissions.includes('settings.manage'))));
  const visibleNav=nav.filter(item=>canAccess(item.to));
  const submitSearch=()=>{const value=searchValue.trim().toLowerCase();if(!value)return;const match=visibleNav.find(item=>item.label.toLowerCase().includes(value));if(match){navigate(match.to);setSearchValue('')}else notify('error','No results found',`Nothing matched “${searchValue}” in the pages available to your account.`)};
  useEffect(()=>{let active=true;const refresh=async()=>{try{const tickets=await listSupportTickets();if(active)setOpenSupportCount(tickets.filter(ticket=>!['RESOLVED','CLOSED'].includes(ticket.status)).length);}catch{/* The shell remains usable while support is unavailable. */}};void refresh();window.addEventListener('supportTicketsUpdated',refresh);return()=>{active=false;window.removeEventListener('supportTicketsUpdated',refresh);};},[]);
  return <div className={`app-shell ${collapsed?'app-shell--sidebar-collapsed':''}`}>
    <aside className={`sidebar ${open?'sidebar--open':''}`}>
      <div className="sidebar__brand"><div className="brand-symbol"><span>C</span></div><div><b>CeHR</b><small>Control</small></div><button className="sidebar-collapse-button" onClick={()=>setCollapsed(value=>!value)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} title={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}</button><button className="sidebar-close-button" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <div className="workspace"><span>SUPER ADMIN WORKSPACE</span><div className="workspace__row"><span className="avatar avatar--blue">CE</span><div><b>CeHR Platform</b><small>Production</small></div><ChevronDown size={15}/></div></div>
      <nav aria-label="Primary navigation"><span className="nav-label">PLATFORM</span>{visibleNav.filter(item=>nav.indexOf(item)<6).map(item=><NavLink key={item.to} to={item.to} title={collapsed?item.label:undefined} aria-label={collapsed?item.label:undefined} onClick={()=>setOpen(false)}><item.icon size={18}/><span>{item.label}</span></NavLink>)}{visibleNav.some(item=>nav.indexOf(item)>=6)&&<span className="nav-label nav-label--lower">OPERATIONS</span>}{visibleNav.filter(item=>nav.indexOf(item)>=6).map(item=><NavLink key={item.to} to={item.to} title={collapsed?item.label:undefined} aria-label={collapsed?item.label:undefined} onClick={()=>setOpen(false)}><item.icon size={18}/><span>{item.label}</span>{item.to==='/support'&&openSupportCount>0&&<em>{openSupportCount}</em>}</NavLink>)}</nav>
      <div className="sidebar__footer">{canAccess('/settings')&&<NavLink to="/settings" title={collapsed?'Platform settings':undefined} aria-label={collapsed?'Platform settings':undefined}><Settings size={18}/><span>Platform settings</span></NavLink>}<button className="sidebar-logout" title={collapsed?'Sign out':undefined} aria-label={collapsed?'Sign out':undefined} onClick={()=>setLogoutOpen(true)}><LogOut size={18}/><span>Sign out</span></button><div className="profile"><span className="avatar">{admin?.name.split(' ').map(x=>x[0]).join('').slice(0,2)||'AD'}</span><div><b>{admin?.name}</b><small>{admin?.role}</small></div></div></div>
    </aside>
    {open&&<div className="sidebar-overlay" onClick={()=>setOpen(false)}/>} 
    <main className="main"><a className="skip-link" href="#main-content">Skip to main content</a><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button><div className="topbar__title"><h1>{meta.title}</h1><p>{meta.subtitle}</p></div><div className="topbar__actions"><label className="search"><Search size={17}/><input value={searchValue} onChange={e=>setSearchValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submitSearch()}}} aria-label="Search platform" placeholder="Search anything…"/><kbd>Enter</kbd></label>{(canAccess('/notifications')||canAccess('/support'))&&<button className="icon-button notification" onClick={()=>setNotificationsOpen(true)} aria-label="Open support and notification shortcuts"><Bell size={19}/><i/></button>}<button className="profile-button" onClick={()=>setProfileOpen(true)} aria-label="Open administrator menu"><span className="avatar">{admin?.name.split(' ').map(x=>x[0]).join('').slice(0,2)||'AD'}</span><span>{admin?.name.split(' ')[0]}</span><ChevronDown size={14}/></button></div></header>
      <div className="page-content" id="main-content">{children}</div><div className="system-status"><Activity size={13}/><span>All systems operational</span></div>
      {notificationsOpen&&<Modal title="Platform shortcuts" subtitle="Open the live queues and workflows available to your account." onClose={()=>setNotificationsOpen(false)} size="small"><div className="notification-list">{canAccess('/support')&&<button onClick={()=>{setNotificationsOpen(false);navigate('/support')}}><i className="notification-dot"/><span><b>Support queue</b><small>{openSupportCount} open {openSupportCount===1?'ticket':'tickets'}</small></span></button>}{canAccess('/notifications')&&<button onClick={()=>{setNotificationsOpen(false);navigate('/notifications')}}><i className="notification-dot"/><span><b>Organization broadcasts</b><small>Compose a platform notification</small></span></button>}{canAccess('/billing')&&<button onClick={()=>{setNotificationsOpen(false);navigate('/billing')}}><i className="notification-dot"/><span><b>Billing overview</b><small>Review current invoices and collections</small></span></button>}</div></Modal>}
      {profileOpen&&<Modal title="Administrator account" subtitle="Signed in to CeHR Control." onClose={()=>setProfileOpen(false)} size="small"><div className="profile-summary"><span className="avatar">{admin?.name.split(' ').map(x=>x[0]).join('').slice(0,2)||'AD'}</span><div><b>{admin?.name}</b><span>{admin?.email}</span><small>{admin?.role}</small></div></div><div className="stack-actions"><button className="button button--secondary" onClick={()=>{setProfileOpen(false);navigate('/change-password')}}><KeyRound size={16}/>Change password</button>{canAccess('/roles-access')&&<button className="button button--secondary" onClick={()=>{setProfileOpen(false);navigate('/roles-access')}}>View access</button>}<button className="button button--danger" onClick={()=>{setProfileOpen(false);setLogoutOpen(true)}}>Sign out</button></div></Modal>}
      <ConfirmDialog open={logoutOpen} title="Sign out of CeHR Control?" message="Your current administrator session will end on this device." confirmLabel="Sign out" tone="warning" onCancel={()=>setLogoutOpen(false)} onConfirm={()=>{setLogoutOpen(false);logout();navigate('/login',{replace:true})}}/>
    </main>
  </div>
}
