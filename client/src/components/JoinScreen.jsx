import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, Hash, Shield, Sparkles } from 'lucide-react';

export default function JoinScreen({ onJoin, defaultUsername }) {
  const [username, setUsername] = useState(defaultUsername || '');
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (defaultUsername) setUsername(defaultUsername);
  }, [defaultUsername]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim(), room.trim() || 'General');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-brand-pink/5 via-transparent to-transparent">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-10 animate-float">
          <div className="inline-flex p-4 bg-linear-to-br from-brand-pink to-brand-purple rounded-4xl shadow-xl shadow-brand-pink/20 mb-6">
            <MessageSquare className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Group<span className="text-brand-pink">Flow</span>
          </h1>
          <p className="mt-3 text-slate-500 font-medium">Connect, collaborate, and grow with your team.</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-pink/5 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-purple/5 rounded-full blur-3xl"></div>

           <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logged in as</span>
                 </div>
                 <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={`https://ui-avatars.com/api/?name=${username}&background=random&color=fff&bold=true`} className="w-12 h-12 rounded-xl shadow-sm" alt={username} />
                    <div>
                       <p className="text-lg font-black text-slate-900">{username}</p>
                       <p className="text-xs font-bold text-slate-400">Authenticated Member</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <label htmlFor="room" className="flex items-center justify-between px-2">
                    <span className="text-sm font-black text-slate-800">Choose a Room</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optional</span>
                 </label>
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                       <Hash className="h-5 w-5 text-slate-300 group-focus-within:text-brand-pink transition-colors" />
                    </div>
                    <input
                      id="room"
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="General"
                      className="block w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:border-brand-pink/20 focus:bg-white focus:ring-4 focus:ring-brand-pink/5 transition-all outline-none"
                    />
                 </div>
                 <div className="flex items-center space-x-2 px-2">
                    <Sparkles className="w-3 h-3 text-brand-purple" />
                    <p className="text-[10px] font-bold text-slate-400">Defaulting to #general if left empty</p>
                 </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-5 px-6 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-[0.15em] hover:bg-black hover:shadow-2xl hover:shadow-slate-300 transition-all active:scale-[0.98] group"
              >
                Enter Workspace
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </form>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
           Secure & End-to-End Encrypted Discussion
        </p>
      </div>
    </div>
  );
}
