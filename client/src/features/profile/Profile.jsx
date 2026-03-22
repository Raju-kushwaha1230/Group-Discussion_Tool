import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Globe, Moon, Camera, LogOut, Check, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || user?.username || '',
    bio: user?.bio || '',
    workspaceName: user?.workspaceName || '',
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    const success = await updateProfile(formData);
    setIsUpdating(false);
    if (success) {
      toast.success('Profile updated successfully!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sections = [
    { title: 'Personal Information', icon: User, items: [
      { label: 'Display Name', value: formData.displayName, field: 'displayName', editable: true },
      { label: 'Email', value: user?.email, editable: false },
      { label: 'Bio', value: formData.bio, field: 'bio', editable: true },
    ]},
    { title: 'Workspace', icon: Globe, items: [
      { label: 'Workspace Name', value: formData.workspaceName, field: 'workspaceName', editable: true },
      { label: 'Workspace Handle', value: user?.workspaceHandle || 'Not set', editable: false },
    ]},
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Profile & Preferences</h1>
        <button 
          onClick={handleLogout}
          className="bg-white border border-slate-200 text-red-500 font-bold px-6 py-2.5 rounded-2xl flex items-center space-x-2 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
        >
           <LogOut className="w-4 h-4" />
           <span>Logout</span>
        </button>
      </div>

      <div className="premium-card">
         <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative group">
               <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative bg-brand-pink/10 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-brand-pink">{user?.username?.charAt(0).toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <Camera className="w-8 h-8 text-white" />
                  </div>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white w-8 h-8 rounded-full shadow-lg"></div>
            </div>
            
            <div className="text-center md:text-left flex-1 min-w-0">
               <h2 className="text-3xl font-black text-slate-900 mb-2 truncate">{user?.displayName || user?.username}</h2>
               <p className="text-slate-500 font-medium text-lg mb-4 truncate">{user?.email}</p>
               <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{user?.role || 'User'}</span>
                  {user?.workspaceName && (
                    <span className="bg-brand-purple/10 text-brand-purple px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{user.workspaceName}</span>
                  )}
               </div>
            </div>
            
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
               {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
               <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </button>
         </div>

         {/* Admin Promotion Section */}
         {user?.role === 'user' && (
           <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div>
                 <p className="font-black text-slate-900">Workspace Administration</p>
                 <p className="text-sm text-slate-500 font-medium">
                   {user.adminRequestStatus === 'pending' 
                     ? 'Your request to become an Admin is pending approval.' 
                     : 'Want to create your own workspace? Request admin access.'}
                 </p>
              </div>
              <button 
                onClick={() => navigate('/become-admin')}
                disabled={user.adminRequestStatus === 'pending'}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  user.adminRequestStatus === 'pending' 
                    ? 'bg-amber-50 text-amber-500 cursor-default' 
                    : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                {user.adminRequestStatus === 'pending' ? 'Request Pending' : 'Become Admin'}
              </button>
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {sections.map(section => (
            <div key={section.title} className="premium-card">
               <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                     <section.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{section.title}</h3>
               </div>
               
               <div className="space-y-6">
                  {section.items.map(item => (
                     <div key={item.label}>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">{item.label}</label>
                        <div className="flex items-center justify-between group">
                           {item.editable ? (
                              <input 
                                type="text"
                                value={item.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, [item.field]: e.target.value }))}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all"
                              />
                           ) : (
                              <p className="font-bold text-slate-900 px-4">{item.value}</p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}
         
         <div className="premium-card bg-slate-900 text-white border-none shadow-slate-900/40">
            <h3 className="text-xl font-black mb-8 flex items-center space-x-3">
               <Moon className="w-6 h-6 text-brand-pink" />
               <span>Appearance</span>
            </h3>
            
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
               <div>
                  <p className="font-bold">Dark Mode</p>
                  <p className="text-xs text-slate-400">Reduce eye strain in low light</p>
               </div>
               <div className={`w-14 h-8 rounded-full transition-all duration-300 relative border-2 ${isDarkMode ? 'bg-brand-pink border-brand-pink' : 'bg-slate-800 border-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isDarkMode ? 'left-8' : 'left-2'}`}></div>
               </div>
            </div>
         </div>

         <div className="premium-card border-brand-pink/20 bg-brand-pink/2">
            <h3 className="text-xl font-black mb-8 flex items-center space-x-3">
               <Shield className="w-6 h-6 text-brand-pink" />
               <span>Security</span>
            </h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">Two-factor Authentication</p>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Enabled</span>
               </div>
               <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  Change Password
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
