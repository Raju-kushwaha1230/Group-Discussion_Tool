import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  Loader2,
  AlertCircle,
  Users as UsersIcon,
  Search
} from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const fetchAdminRequests = useAuthStore(state => state.fetchAdminRequests);
  const manageAdminRequest = useAuthStore(state => state.manageAdminRequest);
  
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const fetchWorkspaces = useWorkspaceStore(state => state.fetchWorkspaces);
  const updateStatus = useWorkspaceStore(state => state.updateStatus);
  const manageMemberRequest = useWorkspaceStore(state => state.manageMemberRequest);
  const isLoading = useWorkspaceStore(state => state.isLoading);
  const createWorkspace = useWorkspaceStore(state => state.createWorkspace);

  const [activeTab, setActiveTab] = useState(user?.role === 'super-admin' ? 'role-requests' : 'workspace');
  const [adminRequests, setAdminRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', handle: '', color: 'bg-brand-pink' });

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      await fetchWorkspaces();
      if (user?.role === 'super-admin' && mounted) {
        const data = await fetchAdminRequests();
        setAdminRequests(data);
      }
    };

    loadData();
    
    return () => { mounted = false; };
  }, [fetchWorkspaces, fetchAdminRequests, user?._id, user?.id, user?.role]);

  const loadAdminRequests = async () => {
    const data = await fetchAdminRequests();
    setAdminRequests(data);
  };

  const handleAdminRequest = async (userId, status) => {
    const result = await manageAdminRequest(userId, status);
    if (result.success) {
      toast.success(result.message);
      // Refresh local list
      const data = await fetchAdminRequests();
      setAdminRequests(data);
    } else {
      toast.error(result.message);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    const success = await updateStatus(id, status);
    if (success) {
      toast.success(`Workspace ${status}`);
    } else {
      toast.error('Failed to update workspace status');
    }
  };

  const handleMemberUpdate = async (workspaceId, userId, status) => {
    const success = await manageMemberRequest(workspaceId, userId, status);
    if (success) {
      toast.success(`Member request ${status}`);
      fetchWorkspaces(); // Refresh to update member list
    } else {
      toast.error('Failed to update member status');
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    const success = await createWorkspace(newWorkspace);
    if (success) {
      toast.success('Workspace created and pending approval!');
      setShowCreateModal(false);
      fetchWorkspaces();
    } else {
      toast.error('Failed to create workspace');
    }
  };

  // Super Admin Data
  const pendingWorkspaces = workspaces.filter(ws => ws.status === 'pending');
  const approvedWorkspaces = workspaces.filter(ws => ws.status === 'approved');

  // Workspace Admin Data
  const myWorkspace = workspaces.find(ws => {
    const ownerId = (ws.owner?._id || ws.owner)?.toString();
    const userId = (user?._id || user?.id)?.toString();
    return ownerId === userId;
  });
  const pendingMembers = myWorkspace?.members?.filter(m => m.status === 'pending') || [];

  if (isLoading && workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 text-brand-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
             {user?.role === 'super-admin' ? 'System Command Center' : 'Workspace Command Center'}
           </h1>
           <p className="text-slate-500 font-medium">
             {user?.role === 'super-admin' 
               ? 'Global oversight of all workspaces and system requests.' 
               : `Managing ${myWorkspace?.name || 'your workspace'} members and settings.`}
           </p>
        </div>
        <div className="p-4 bg-brand-pink/10 rounded-2xl border border-brand-pink/20 flex items-center space-x-3">
           <Shield className="w-6 h-6 text-brand-pink" />
           <span className="font-black text-brand-pink uppercase tracking-widest text-xs">
             {user?.role === 'super-admin' ? 'Super Admin Mode' : 'Workspace Admin'}
           </span>
        </div>
      </div>

      {/* Tabs if Super Admin */}
      {user?.role === 'super-admin' && (
        <div className="flex items-center space-x-2 border-b border-slate-100">
           <button 
            onClick={() => setActiveTab('role-requests')}
            className={`px-6 py-4 font-black uppercase tracking-widest text-xs transition-all border-b-2 ${activeTab === 'role-requests' ? 'border-brand-pink text-brand-pink' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Role Requests ({adminRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-6 py-4 font-black uppercase tracking-widest text-xs transition-all border-b-2 ${activeTab === 'system' ? 'border-brand-pink text-brand-pink' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Workspace Requests ({pendingWorkspaces.length})
          </button>
          <button 
            onClick={() => setActiveTab('workspace-list')}
            className={`px-6 py-4 font-black uppercase tracking-widest text-xs transition-all border-b-2 ${activeTab === 'workspace-list' ? 'border-brand-pink text-brand-pink' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            All Workspaces ({approvedWorkspaces.length})
          </button>
        </div>
      )}

      {/* Super Admin Sections */}
      {user?.role === 'super-admin' && (
        <div className="space-y-12">
          {activeTab === 'role-requests' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3">
                 <UsersIcon className="w-6 h-6 text-brand-pink" />
                 <span>Admin Promotion Requests</span>
              </h3>
              <div className="space-y-4">
                 {adminRequests.length > 0 ? (
                   adminRequests.map(req => (
                     <div key={req._id} className="premium-card group hover:bg-slate-50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="flex items-center space-x-6 text-left">
                              <img src={req.avatar || `https://ui-avatars.com/api/?name=${req.username}&background=random`} className="w-16 h-16 rounded-2xl" alt="User" />
                              <div className="min-w-0">
                                 <h4 className="text-xl font-black text-slate-900 truncate">{req.username}</h4>
                                 <p className="text-sm font-bold text-slate-400">{req.email}</p>
                                 <p className="mt-2 text-sm text-slate-600 bg-slate-100 p-3 rounded-xl border border-slate-200 italic">"{req.adminRequestDetails}"</p>
                              </div>
                           </div>
                           <div className="flex items-center space-x-3">
                              <button onClick={() => handleAdminRequest(req._id, 'rejected')} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><XCircle className="w-6 h-6" /></button>
                              <button onClick={() => handleAdminRequest(req._id, 'approved')} className="bg-brand-pink text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-magenta-600 transition-all">Approve Role</button>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="premium-card text-center py-20 bg-slate-50/50 border-dashed">
                      <p className="text-slate-400 font-bold">No pending role requests.</p>
                   </div>
                 )}
              </div>
            </section>
          )}

          {activeTab === 'system' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3">
                 <AlertCircle className="w-6 h-6 text-brand-pink" />
                 <span>Workspace Requests</span>
              </h3>
              {/* Existing Pending Workspaces Logic */}
              <div className="space-y-4">
                 {pendingWorkspaces.length > 0 ? (
                   pendingWorkspaces.map(ws => (
                     <div key={ws._id} className="premium-card group hover:bg-slate-50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="flex items-center space-x-6 text-left">
                              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-brand-pink/10 group-hover:text-brand-pink transition-colors shrink-0">
                                 {ws.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-xl font-black text-slate-900 truncate">{ws.name}</h4>
                                 <p className="text-sm font-bold text-slate-400">@{ws.handle}</p>
                                 <div className="flex items-center space-x-4 mt-2">
                                    <span className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
                                       <User className="w-3.5 h-3.5" />
                                       <span>{ws.owner?.username}</span>
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center space-x-3">
                              <button onClick={() => handleStatusUpdate(ws._id, 'rejected')} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><XCircle className="w-6 h-6" /></button>
                              <button onClick={() => handleStatusUpdate(ws._id, 'approved')} className="bg-brand-pink text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-magenta-600 transition-all">Approve Workspace</button>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="premium-card text-center py-20 bg-slate-50/50 border-dashed">
                      <p className="text-slate-400 font-bold">No pending workspace requests.</p>
                   </div>
                 )}
              </div>
            </section>
          )}

          {activeTab === 'workspace-list' && (
             <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-brand-pink" />
                  <span>All Active Workspaces</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {approvedWorkspaces.map(ws => (
                    <div key={ws._id} className="premium-card flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl scale-75 ${ws.color || 'bg-brand-pink'} flex items-center justify-center text-white font-black`}>
                             {ws.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900">{ws.name}</h4>
                             <p className="text-xs text-slate-400 font-bold">@{ws.handle}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             </section>
          )}
        </div>
      )}

      {/* Workspace Admin View */}
      {user?.role === 'admin' && (
        <div className="space-y-12">
          {myWorkspace ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
                   <UsersIcon className="w-6 h-6 text-brand-pink" />
                   <span>Join Requests — {pendingMembers.length}</span>
                </h3>
              </div>
              <div className="space-y-4">
                {pendingMembers.length > 0 ? (
                  pendingMembers.map(member => (
                    <div key={member.user._id} className="premium-card group hover:bg-slate-50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center space-x-6">
                              <img src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.username}&background=random`} className="w-16 h-16 rounded-2xl" alt="Member" />
                              <div>
                                <h4 className="text-xl font-black text-slate-900">{member.user.displayName || member.user.username}</h4>
                                <p className="text-sm font-bold text-slate-400">{member.user.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center space-x-3">
                              <button onClick={() => handleMemberUpdate(myWorkspace._id, member.user._id, 'rejected')} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><XCircle className="w-6 h-6" /></button>
                              <button onClick={() => handleMemberUpdate(myWorkspace._id, member.user._id, 'approved')} className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Approve Join</button>
                          </div>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="premium-card text-center py-20 bg-slate-50/50 border-dashed">
                      <p className="text-slate-400 font-bold">No pending join requests.</p>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="premium-card text-center py-20 bg-brand-pink/5 border-brand-pink/20 border-dashed">
                  <div className="w-20 h-20 bg-brand-pink/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-brand-pink">
                     <Building2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Create Your Workspace</h3>
                  <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                    You've been approved as an Admin! Now you can create a dedicated workspace for your team.
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-brand-pink text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-pink/20 hover:bg-magenta-600 transition-all active:scale-95"
                  >
                    Start Creation
                  </button>
               </div>
            </section>
          )}
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-2">New Workspace</h2>
            <p className="text-slate-500 font-medium mb-8">Define your team's digital home.</p>
            
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Workspace Name</label>
                <input 
                  type="text"
                  required
                  value={newWorkspace.name}
                  onChange={e => setNewWorkspace({...newWorkspace, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-pink/20 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-all"
                  placeholder="e.g. Acme Studio"
                />
              </div>
              
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Unique Handle</label>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                   <input 
                    type="text"
                    required
                    value={newWorkspace.handle}
                    onChange={e => setNewWorkspace({...newWorkspace, handle: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-pink/20 focus:bg-white rounded-2xl px-12 py-4 font-bold text-slate-900 outline-none transition-all"
                    placeholder="acmestudio"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-brand-pink text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-magenta-600 transition-all active:scale-95"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
   
