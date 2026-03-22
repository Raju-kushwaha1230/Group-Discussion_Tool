import React, { useState } from 'react';
import { Shield, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function BecomeAdmin() {
  const { user, requestAdminRole, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [details, setDetails] = useState('');

  if (user?.role === 'admin' || user?.role === 'super-admin') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-emerald-500">
           <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Already an Admin</h2>
        <p className="text-slate-500 mb-8">You already have administrative privileges.</p>
        <button onClick={() => navigate('/admin')} className="btn-primary w-full">Go to Dashboard</button>
      </div>
    );
  }

  if (user?.adminRequestStatus === 'pending') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-amber-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-amber-500">
           <Send className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Request Pending</h2>
        <p className="text-slate-500 mb-8">Your request to become an Admin is being reviewed by the Super Admin.</p>
        <button onClick={() => navigate('/')} className="btn-primary w-full">Back Home</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await requestAdminRole(details);
    if (result.success) {
      toast.success(result.message);
      navigate('/profile');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
           <ArrowLeft className="w-6 h-6 text-slate-500" />
        </button>
        <div className="bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
           Role Promotion
        </div>
      </div>

      <div className="text-center">
         <div className="w-24 h-24 bg-brand-pink/10 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-brand-pink">
            <Shield className="w-12 h-12" />
         </div>
         <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Become an Admin</h1>
         <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
            Admins can create and manage their own workspaces, invite members, and moderate discussions.
         </p>
      </div>

      <div className="premium-card">
         <form onSubmit={handleSubmit} className="space-y-8">
            <div>
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Why do you want to be an Admin?</label>
               <textarea 
                 required
                 value={details}
                 onChange={e => setDetails(e.target.value)}
                 rows={5}
                 className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-pink/20 focus:bg-white rounded-3xl px-6 py-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                 placeholder="Please describe your intended workspace and why you need administrative access..."
               />
               <p className="mt-4 text-sm text-slate-400 font-medium">
                  Your request will be reviewed by the system's Super Admin. You'll be notified once a decision is made.
               </p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !details.trim()}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:translate-y-0"
            >
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                 <>
                   <span>Submit Promotion Request</span>
                   <Send className="w-4 h-4" />
                 </>
               )}
            </button>
         </form>
      </div>
    </div>
  );
}
