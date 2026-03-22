import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Bell, 
  User, 
  Settings, 
  Hash, 
  Plus, 
  LayoutGrid,
  ChevronDown,
  Search as SearchIcon,
  Inbox,
  Calendar,
  Sparkles,
  MoreHorizontal,
  Shield
} from 'lucide-react';

import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rooms } = useRoomStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Inbox, label: 'Inbox', path: '/notifications' },
    { icon: MessageSquare, label: 'Channels', path: '/' },
    { icon: Calendar, label: 'This Week', path: '/home' },
  ];

  const userWorkspaces = user?.workspaces?.filter(ws => ws.status === 'approved') || [];
  
  const filteredNavItems = user?.role === 'super-admin' 
    ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }]
    : navItems;

  const filteredWorkspaces = user?.role === 'super-admin' ? [] : userWorkspaces;

  const directMessages = [
    { name: 'Maya Park', avatar: 'https://ui-avatars.com/api/?name=Maya+Park&background=ff00ff&color=fff', online: true },
    { name: 'Logan Smith', avatar: 'https://ui-avatars.com/api/?name=Logan+Smith&background=8b5cf6&color=fff', online: true },
    { name: 'Sarah Chen', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=3b82f6&color=fff', online: false },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Rail (Workspaces) - Hidden for Super Admin */}
      {user?.role !== 'super-admin' && (
        <div className="w-20 bg-brand-dark flex flex-col items-center py-6 space-y-4 shrink-0 z-50">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-white/10 cursor-pointer hover:rotate-12 transition-transform">
             <LayoutGrid className="w-6 h-6 text-brand-dark" />
          </div>
          
          <div className="w-full flex flex-col items-center space-y-4 overflow-y-auto custom-scrollbar no-scrollbar">
            {filteredWorkspaces.map(ws => (
              <div 
                key={ws.workspace._id}
                className={`w-12 h-12 ${ws.workspace.color || 'bg-brand-pink'} rounded-2xl flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all hover:scale-110 relative group ${location.pathname.includes(ws.workspace._id) ? 'ring-2 ring-white ring-offset-4 ring-offset-brand-dark' : ''}`}
              >
                {ws.workspace.name.charAt(0).toUpperCase()}
                <div className="absolute left-16 bg-white text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                   {ws.workspace.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pb-4">
             <div className="w-12 h-12 border-2 border-slate-700 border-dashed rounded-2xl flex items-center justify-center text-slate-500 cursor-pointer hover:border-slate-500 hover:text-slate-300 transition-all">
                <Plus className="w-6 h-6" />
             </div>
          </div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <div className={`w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-64 shadow-none'}`}>
        <div className="p-6 pb-2 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-8 cursor-pointer group">
            <h1 className="text-xl font-black tracking-tighter group-hover:text-brand-pink transition-all truncate">
              {user?.role === 'super-admin' ? 'System Management' : (user?.workspaceName || 'GroupFlow')}
            </h1>
            {user?.role !== 'super-admin' && (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors shrink-0">
                 <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            )}
          </div>

          <nav className="space-y-1 mb-10">
            {filteredNavItems.map(item => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive(item.path) 
                    ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 group'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-brand-pink'} transition-colors`} />
                <span className="font-bold">{item.label}</span>
              </Link>
            ))}

            {(user?.role === 'admin' && user?.role !== 'super-admin') && (
              <Link
                to="/admin"
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive('/admin') 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 group'
                }`}
              >
                <Shield className={`w-5 h-5 ${isActive('/admin') ? 'text-white' : 'text-slate-400 group-hover:text-brand-pink'} transition-colors`} />
                <span className="font-bold">Admin Panel</span>
              </Link>
            )}
          </nav>

          {user?.role !== 'super-admin' && (
            <div className="space-y-8">
              <div>
                  <div className="flex items-center justify-between mb-3 px-4 group cursor-pointer">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Channels</h3>
                     <Plus className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1">
                     {rooms.slice(0, 5).map(room => (
                       <Link 
                         key={room._id} 
                         to={`/room/${room.name}`}
                         className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                           location.pathname === `/room/${room.name}` ? 'text-brand-pink bg-brand-pink/5' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                         }`}
                       >
                          <Hash className={`w-4 h-4 ${location.pathname === `/room/${room.name}` ? 'text-brand-pink' : 'text-slate-300'} opacity-70`} />
                          <span className="text-sm truncate">{room.name}</span>
                       </Link>
                     ))}
                  </div>
              </div>

              <div>
                 <div className="flex items-center justify-between mb-3 px-4 group cursor-pointer">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Direct Messages</h3>
                    <Plus className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="space-y-1">
                    {directMessages.map(dm => (
                      <div key={dm.name} className="flex items-center space-x-3 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl cursor-pointer font-bold transition-all group">
                         <div className="relative shrink-0">
                            <img src={dm.avatar} className="w-6 h-6 rounded-lg grayscale group-hover:grayscale-0 transition-all" alt={dm.name} />
                            {dm.online && (
                               <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full"></div>
                            )}
                         </div>
                         <span className="text-sm flex-1 truncate">{dm.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-2">
           <Link to="/profile" className="bg-slate-50 rounded-3xl p-4 border border-slate-100 hover:border-brand-pink/20 transition-all cursor-pointer group block">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 border-2 border-white overflow-hidden shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-brand-pink font-black">{user?.username?.charAt(0).toUpperCase()}</span>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate text-slate-900">{user?.displayName || user?.username}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'User'}</p>
                 </div>
                 <div className="p-2 hover:bg-white rounded-xl transition-colors">
                    <Settings className="w-4 h-4 text-slate-400 hover:text-brand-pink" />
                 </div>
              </div>
           </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-40 transition-all">
           <div className="flex items-center space-x-4 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                 <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isSidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
              </button>
              {user?.role !== 'super-admin' && (
                <div className="flex-1 max-w-2xl relative group">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-pink transition-colors" />
                   <input 
                     type="text" 
                     placeholder={`Search anything in ${user?.workspaceName || 'GroupFlow'}...`}
                     className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-brand-pink/5 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         navigate(`/search?q=${e.target.value}`);
                       }
                     }}
                   />
                </div>
              )}
           </div>

           <div className="flex items-center space-x-4">
              {user?.role !== 'super-admin' && (
                <>
                  <button 
                    onClick={() => navigate('/home')}
                    className="hidden sm:flex bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-black hover:shadow-2xl hover:shadow-slate-300 transition-all active:scale-95"
                  >
                     New Message
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  <div className="flex items-center space-x-2">
                     <button 
                       onClick={() => navigate('/notifications')}
                       className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-pink hover:bg-brand-pink/5 transition-all relative"
                     >
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-pink rounded-full border border-white"></div>
                     </button>
                     <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                        <Sparkles className="w-5 h-5" />
                     </button>
                  </div>
                </>
              )}
              {user?.role === 'super-admin' && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <Shield className="w-4 h-4" />
                  <span>System Console</span>
                </div>
              )}
           </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-0 relative h-full">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
