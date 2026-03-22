import { Search as SearchIcon, Users, Hash, MapPin, ChevronRight, Filter, Loader2, Building2, CheckCircle } from 'lucide-react';
import useRoomStore from '../../store/roomStore';
import useWorkspaceStore from '../../store/workspaceStore';
import useAuthStore from '../../store/authStore';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const { user } = useAuthStore();
  const { joinWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState(initialQuery);
  const { searchResults, searchAll, isLoading } = useRoomStore();

  useEffect(() => {
    if (initialQuery) {
       searchAll(initialQuery);
    }
  }, [initialQuery, searchAll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query !== initialQuery) searchAll(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchAll, initialQuery]);

  const handleJoinRequest = async (workspaceId) => {
    const res = await joinWorkspace(workspaceId);
    if (res.success) {
      toast.success('Join request sent successfully!');
      searchAll(query); // Refresh to update status
    } else {
      toast.error(res.error || 'Failed to send join request');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Results' },
    { id: 'people', label: 'People', icon: Users },
    { id: 'channel', label: 'Channels', icon: Hash },
    { id: 'workspace', label: 'Workspaces', icon: Building2 },
  ];

  const results = [
    ...searchResults.users.map(u => ({ ...u, type: 'people', name: u.displayName || u.username, avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random` })),
    ...searchResults.rooms.map(r => ({ ...r, type: 'channel', name: r.name, topic: r.topic || 'No topic' })),
    ...searchResults.workspaces.map(w => {
      const userMembership = user?.workspaces?.find(mw => mw.workspace === w._id || mw.workspace?._id === w._id);
      return { ...w, type: 'workspace', name: w.name, status: userMembership?.status || 'none' };
    })
  ];

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Search</h1>
        <div className="relative flex-1 max-w-lg group">
           <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isLoading ? 'text-brand-pink' : 'text-slate-400'} group-focus-within:text-brand-pink transition-colors`} />
           <input 
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search people, channels, or workspaces..."
             className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-brand-pink/5 focus:border-brand-pink/20 outline-none transition-all shadow-sm"
           />
           {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-pink animate-spin" />}
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' 
                : 'bg-white text-slate-500 border border-slate-100 hover:border-brand-pink/20 hover:text-slate-900 shadow-sm'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredResults.map((res, idx) => (
          <div 
            key={idx} 
            className="premium-card group hover:border-brand-pink/20 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${
                  res.type === 'people' ? 'bg-slate-100' : 
                  res.type === 'channel' ? 'bg-brand-purple/10' : 
                  res.type === 'workspace' ? 'bg-indigo-50' : 'bg-brand-pink/10'
                }`}>
                  {res.type === 'people' ? (
                    <img src={res.avatar} alt={res.name} className="w-full h-full rounded-3xl object-cover" />
                  ) : res.type === 'channel' ? (
                    <Hash className="w-8 h-8 text-brand-purple" />
                  ) : res.type === 'workspace' ? (
                    <Building2 className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <MapPin className="w-8 h-8 text-brand-pink" />
                  )}
                </div>
                
                <div>
                   <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-xl font-black text-slate-900">{res.name}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        res.type === 'people' ? 'bg-slate-100 text-slate-500' :
                        res.type === 'channel' ? 'bg-brand-purple/10 text-brand-purple' : 
                        res.type === 'workspace' ? 'bg-indigo-100 text-indigo-600' : 'bg-brand-pink/10 text-brand-pink'
                      }`}>
                         {res.type}
                      </span>
                   </div>
                   <p className="text-slate-500 font-medium">
                      {res.type === 'people' ? res.role : 
                       res.type === 'workspace' ? `@${res.handle}` :
                       res.type === 'channel' ? res.topic : res.address}
                   </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                 {res.type === 'workspace' ? (
                   res.status === 'none' ? (
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleJoinRequest(res._id); }}
                       className="bg-brand-pink text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-magenta-600 transition-all"
                     >
                        Join Workspace
                     </button>
                   ) : res.status === 'pending' ? (
                     <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Approval</span>
                     </div>
                   ) : (
                     <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Joined</span>
                     </div>
                   )
                 ) : (
                   <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResults.length === 0 && (
         <div className="premium-card text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
               <SearchIcon className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No results found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
               We couldn't find anything matching your search. Try adjusting your filters or search terms.
            </p>
         </div>
      )}
    </div>
  );
}
