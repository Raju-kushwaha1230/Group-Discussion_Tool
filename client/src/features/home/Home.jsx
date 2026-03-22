import React, { useEffect } from 'react';
import { 
  Megaphone, 
  CheckCircle,
  MessageSquare, 
  Hash, 
  Clock, 
  ChevronRight, 
  Zap, 
  Command,
  Plus
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import useWorkspaceStore from '../../store/workspaceStore';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Search as SearchIcon, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rooms, fetchRooms, isLoading: isRoomsLoading } = useRoomStore();
  const { searchWorkspaces, joinWorkspace, isLoading: isWorkspaceLoading } = useWorkspaceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const result = await searchWorkspaces(searchQuery);
    if (result.success) {
      setSearchResults(result.data);
    }
    setIsSearching(false);
  };

  const handleJoin = async (workspaceId) => {
    const result = await joinWorkspace(workspaceId);
    if (result.success) {
      toast.success('Join request sent!');
      // Update local state if needed
    } else {
      toast.error(result.error);
    }
  };

  const userApprovedWorkspaces = user?.workspaces?.filter(ws => ws.status === 'approved') || [];
  const hasWorkspace = userApprovedWorkspaces.length > 0;

  const recentDMs = [
    { name: 'Ethan Cole', msg: 'Are we meeting after standup?', time: '1h', avatar: 'https://ui-avatars.com/api/?name=Ethan+Cole&background=random' },
    { name: 'Nina Alvarez', msg: 'Reviewed the doc—looks great!', time: '3h', avatar: 'https://ui-avatars.com/api/?name=Nina+Alvarez&background=random' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {!hasWorkspace ? (
        <div className="space-y-12">
           {/* Discover Workspaces View */}
           <div className="text-center space-y-4 py-12">
              <div className="w-20 h-20 bg-brand-pink/10 rounded-[32px] flex items-center justify-center mx-auto text-brand-pink mb-6">
                 <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Find Your Workspace</h2>
              <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
                 Search for an existing workspace to join, or wait for an admin to invite you.
              </p>
              
              <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-8 relative group">
                 <SearchIcon className="absolute left-6 top-[70%] -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-pink transition-colors" />
                 <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by workspace name or handle..."
                    className="w-full bg-white border-2 border-slate-100 focus:border-brand-pink/20 rounded-[32px] py-6 pl-16 pr-6 font-bold text-lg shadow-xl shadow-slate-200/50 outline-none transition-all"
                 />
                 <button type="submit" className="absolute right-4 top-[70%] -translate-y-1/2 bg-brand-pink text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-magenta-600 transition-all active:scale-95">
                    Search
                 </button>
              </form>
           </div>

           {/* Search Results */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {isSearching ? (
                 [1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[40px] animate-pulse"></div>)
              ) : searchResults.length > 0 ? (
                 searchResults.map(ws => (
                    <div key={ws._id} className="premium-card group hover:bg-slate-50 transition-all">
                       <div className="flex items-center space-x-4 mb-6">
                          <div className={`w-14 h-14 rounded-2xl ${ws.color || 'bg-brand-pink'} flex items-center justify-center text-white font-black text-xl`}>
                             {ws.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-black text-slate-900 truncate">{ws.name}</h4>
                             <p className="text-sm font-bold text-slate-400">@{ws.handle}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-6">
                          <span>{ws.members?.length || 0} members</span>
                          <span>{ws.owner?.username}</span>
                       </div>
                       <button 
                         onClick={() => handleJoin(ws._id)}
                         disabled={user?.workspaces?.some(u_ws => u_ws.workspace?._id === ws._id)}
                         className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                            user?.workspaces?.some(u_ws => u_ws.workspace?._id === ws._id)
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-black shadow-xl'
                         }`}
                       >
                          {user?.workspaces?.some(u_ws => u_ws.workspace?._id === ws._id && u_ws.status === 'pending') 
                             ? 'Request Pending' 
                             : 'Request to Join'}
                       </button>
                    </div>
                 ))
              ) : searchQuery && !isSearching ? (
                 <div className="col-span-full text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-lg">No workspaces found matching "{searchQuery}"</p>
                 </div>
              ) : null}
           </div>

           {/* Hero section if no search yet */}
           {!searchQuery && searchResults.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
                 <div className="premium-card bg-brand-pink text-white p-12">
                    <Building2 className="w-12 h-12 mb-6" />
                    <h3 className="text-3xl font-black mb-4">Want your own space?</h3>
                    <p className="text-white/80 font-medium text-lg mb-8 leading-relaxed">
                       Approved administrators can create their own custom workspaces for team discussions.
                    </p>
                    <Link to="/become-admin" className="inline-block bg-white text-brand-pink px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-pink/20 hover:scale-105 transition-all">
                       Become an Admin
                    </Link>
                 </div>
                 <div className="premium-card bg-slate-900 text-white p-12">
                    <Zap className="w-12 h-12 text-brand-pink mb-6" />
                    <h3 className="text-3xl font-black mb-4">How it works</h3>
                    <ul className="space-y-4 text-slate-400 font-medium">
                       <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-brand-pink shrink-0" />
                          <span>Search for your team's workspace name</span>
                       </li>
                       <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-brand-pink shrink-0" />
                          <span>Send a request to join the workspace</span>
                       </li>
                       <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-brand-pink shrink-0" />
                          <span>Get approved by the workspace admin</span>
                       </li>
                    </ul>
                 </div>
              </div>
           )}
        </div>
      ) : (
        /* Original Dashboard Content for Users in Workspace */
        <>
          <div className="premium-card relative overflow-hidden group">
             <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-brand-pink/5 skew-x-12 group-hover:bg-brand-pink/10 transition-colors duration-700"></div>
             <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
                <div className="flex items-center space-x-6">
                   <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <img src="https://images.unsplash.com/photo-1522071823991-b38e4a9040cc?auto=format&fit=crop&q=80&w=200" alt="Workspace" className="w-full h-full object-cover" />
                   </div>
                  <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                        {userWorkspaces[0]?.workspace?.name || 'Your Workspace'}
                      </h1>
                      <p className="text-slate-500 font-medium text-lg">
                        Welcome back, {user?.displayName || user?.username} — Here's what's happening.
                      </p>
                   </div>
                </div>
                {/* ... other header actions ... */}
             </div>
          </div>
          {/* ... Rest of original Home.jsx grid ... */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="premium-card">
                 <h3 className="text-xl font-black mb-6">Your Channels</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isRoomsLoading ? (
                       [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse"></div>)
                    ) : rooms.map(room => (
                       <Link key={room._id} to={`/room/${room.name}`} className="group p-4 rounded-3xl border border-slate-100 hover:border-brand-pink/20 hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="flex items-center space-x-4">
                             <div className={`w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                                <Hash className="w-6 h-6 text-brand-pink" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-900 truncate">#{room.name}</h4>
                                <p className="text-xs text-slate-500 truncate">{room.topic || 'No topic set'}</p>
                             </div>
                          </div>
                       </Link>
                    ))}
                 </div>
              </div>
            </div>
            
            <div className="space-y-8">
               <div className="premium-card bg-slate-900 text-white">
                  <h3 className="font-black text-lg mb-4 flex items-center space-x-2">
                     <Zap className="w-5 h-5 text-brand-pink" />
                     <span>Join More</span>
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Looking for another team? Search and join more workspaces anytime.</p>
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); /* logic to show search */ }} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all">
                     Find Workspaces
                  </button>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
