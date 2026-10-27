import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginSuperAdmin, type AdminIdentity } from '../services/superAdmin';
import { session } from '../services/api';

const ADMIN_KEY='cehr_super_admin_identity';
interface AuthValue { admin:AdminIdentity|null; login:(email:string,password:string)=>Promise<void>; completePasswordChange:()=>void; logout:()=>void }
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const [admin,setAdmin]=useState<AdminIdentity|null>(()=>{
  // A profile alone is not a session: it can remain after a partial browser
  // storage failure or manual token removal. Never render protected UI then.
  if(!session.getToken()){sessionStorage.removeItem(ADMIN_KEY);return null;}
  try{const stored=JSON.parse(sessionStorage.getItem(ADMIN_KEY)||'null');if(stored&&typeof stored.id==='string'&&typeof stored.name==='string'&&typeof stored.email==='string'&&Array.isArray(stored.permissions))return stored as AdminIdentity;session.clear();return null;}catch{session.clear();return null}
 });
 useEffect(()=>{
  const handleExpired=()=>setAdmin(null);
  window.addEventListener('superAdminSessionExpired',handleExpired);
  return()=>window.removeEventListener('superAdminSessionExpired',handleExpired);
 },[]);
 const value=useMemo<AuthValue>(()=>({admin,login:async(email,password)=>{const result=await loginSuperAdmin(email,password);session.setToken(result.accessToken);sessionStorage.setItem(ADMIN_KEY,JSON.stringify(result.admin));setAdmin(result.admin)},completePasswordChange:()=>{if(!admin)return;const updated={...admin,mustChangePassword:false};sessionStorage.setItem(ADMIN_KEY,JSON.stringify(updated));setAdmin(updated)},logout:()=>{session.clear();sessionStorage.removeItem(ADMIN_KEY);setAdmin(null)}}),[admin]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be inside AuthProvider');return value;}
