import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, AtSign, Hash, Clock, Check, Loader2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => api.put(`/users/notifications/${id}/read`)));
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/users/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Notifications</h1>
        <button className="text-sm font-bold text-brand-pink hover:text-magenta-600 transition-colors flex items-center space-x-2">
           <Check className="w-4 h-4" />
           <span>Mark all as read</span>
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-brand-pink animate-spin" />
            <p className="text-slate-400 font-bold">Loading your notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              onClick={() => !notif.read && markRead(notif._id)}
              className={`premium-card group transition-all cursor-pointer relative ${
                !notif.read ? 'bg-white border-brand-pink/20 ring-1 ring-brand-pink/5' : 'bg-slate-50/50 border-transparent opacity-80 hover:opacity-100 hover:bg-white hover:border-slate-100'
              }`}
            >
              <div className="flex items-center space-x-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  !notif.read ? 'bg-brand-pink/10 shadow-lg shadow-brand-pink/10' : 'bg-slate-100'
                }`}>
                  {notif.type === 'mention' ? (
                    <AtSign className={`w-6 h-6 ${!notif.read ? 'text-brand-pink' : 'text-slate-400'}`} />
                  ) : notif.type === 'message' ? (
                    <MessageSquare className={`w-6 h-6 ${!notif.read ? 'text-brand-pink' : 'text-slate-400'}`} />
                  ) : (
                    <Hash className={`w-6 h-6 ${!notif.read ? 'text-brand-pink' : 'text-slate-400'}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-slate-900">
                      <span className="text-brand-pink">{notif.title}</span> {notif.message}
                    </p>
                    <div className="flex items-center space-x-3">
                       <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </span>
                       {!notif.read && (
                         <div className="w-2 h-2 bg-brand-pink rounded-full shadow-lg shadow-brand-pink/40 animate-pulse"></div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="premium-card text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
               <Sparkles className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">All caught up!</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
               You don't have any new notifications at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
