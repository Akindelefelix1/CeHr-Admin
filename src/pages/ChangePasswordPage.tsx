import { useState, type FormEvent } from 'react';
import { KeyRound, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../components/ui/Feedback';
import { changeSuperAdminPassword } from '../services/superAdmin';

export default function ChangePasswordPage(){
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [saving,setSaving]=useState(false);
  const {completePasswordChange,logout}=useAuth();
  const {notify}=useFeedback();
  const navigate=useNavigate();
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(newPassword!==confirmPassword){notify('error','Passwords do not match','Enter the same new password in both fields.');return;}
    if(newPassword===currentPassword){notify('error','Choose a new password','Your new password must differ from the temporary password.');return;}
    setSaving(true);
    try{await changeSuperAdminPassword(currentPassword,newPassword);completePasswordChange();notify('success','Password updated','Your administrator account is ready to use.');navigate('/dashboard',{replace:true});}
    catch(error){notify('error','Password update failed',error instanceof Error?error.message:'Please try again.');}
    finally{setSaving(false);}
  };
  return <main className="login-page"><section className="login-brand"><div className="login-brand__content"><div className="login-logo"><div className="brand-symbol"><span>C</span></div><div><b>CephasHR</b><small>CONTROL</small></div></div><div className="login-copy"><span className="login-kicker"><KeyRound size={15}/>ACCOUNT SECURITY</span><h1>One secure step before you continue.</h1><p>Choose a new password for your CeHR Control administrator account.</p></div></div></section><section className="login-form-wrap"><form className="login-form" onSubmit={submit}><span className="login-lock"><KeyRound size={18}/></span><h2>Set a new password</h2><p>Your temporary password must be replaced before you can use the Super Admin workspace.</p><label>Temporary password<input type="password" autoComplete="current-password" required minLength={8} maxLength={72} value={currentPassword} onChange={event=>setCurrentPassword(event.target.value)}/></label><label>New password<input type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={newPassword} onChange={event=>setNewPassword(event.target.value)}/><small>Use at least 12 characters.</small></label><label>Confirm new password<input type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)}/></label><button className="button button--primary login-submit" disabled={saving}>{saving?<LoaderCircle className="spin" size={16}/>:<KeyRound size={16}/>} {saving?'Updating password…':'Update password'}</button><button className="text-button" type="button" disabled={saving} onClick={()=>{logout();navigate('/login',{replace:true})}}>Sign out</button></form></section></main>;
}
