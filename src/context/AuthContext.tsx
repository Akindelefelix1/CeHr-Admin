import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginSuperAdmin, type AdminIdentity } from '../services/superAdmin';
import { session } from '../services/api';

const ADMIN_KEY='cehr_super_admin_identity';
interface AuthValue { admin:AdminIdentity|null; login:(email:string,password:string)=>Promise<void>; logout:()=>void }
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const [admin,setAdmin]=useState<AdminIdentity|null>(()=>{try{return JSON.parse(sessionStorage.getItem(ADMIN_KEY)||'null')}catch{return null}});
 useEffect(()=>{
  const handleExpired=()=>setAdmin(null);
  window.addEventListener('superAdminSessionExpired',handleExpired);
  return()=>window.removeEventListener('superAdminSessionExpired',handleExpired);
 },[]);
 const value=useMemo<AuthValue>(()=>({admin,login:async(email,password)=>{const result=await loginSuperAdmin(email,password);session.setToken(result.accessToken);sessionStorage.setItem(ADMIN_KEY,JSON.stringify(result.admin));setAdmin(result.admin)},logout:()=>{session.clear();sessionStorage.removeItem(ADMIN_KEY);setAdmin(null)}}),[admin]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be inside AuthProvider');return value;}
