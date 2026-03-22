import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Hash, 
  Bell, 
  Search, 
  MoreVertical, 
  ChevronRight, 
  Download, 
  Pin,
  Calendar,
  Layers,
  FileText,
  X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import JoinScreen from '../../components/JoinScreen';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3002';

export default function ChatLayout() {
  const { user, token, logout } = useAuthStore();
  const { activeRoomData, setActiveRoom, isLoading: isRoomLoading } = useRoomStore();
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [room, setRoom] = useState(roomId || 'general');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [raisedHands, setRaisedHands] = useState([]); 
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);

  useEffect(() => {
    if (roomId) {
      setActiveRoom(roomId);
    }
  }, [roomId, setActiveRoom]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(URL, { 
      autoConnect: false,
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('user_list', (userList) => setUsers(userList));
    newSocket.on('message_history', (history) => setMessages(history));
    newSocket.on('receive_message', (message) => setMessages((prev) => [...prev, message]));
    newSocket.on('reaction_update', ({ messageId, reactions }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    });
    newSocket.on('user_hand_raised', ({ username }) => {
      setRaisedHands((prev) => !prev.includes(username) ? [...prev, username] : prev);
      toast(`${username} raised their hand!`, { icon: '✋' });
      setTimeout(() => setRaisedHands((prev) => prev.filter(u => u !== username)), 10000);
    });
    newSocket.on('system_message', (message) => setMessages((prev) => [...prev, message]));
    newSocket.on('user_typing', (typingUsername) => {
      setTypingUsers((prev) => !prev.includes(typingUsername) ? [...prev, typingUsername] : prev);
    });
    newSocket.on('user_stopped_typing', (stoppedUsername) => {
      setTypingUsers((prev) => prev.filter(u => u !== stoppedUsername));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
     if (roomId && roomId !== room) {
        setRoom(roomId);
        if (socket) {
           socket.emit('join', { room: roomId });
        }
     }
  }, [roomId, socket, room]);

  const handleJoin = (usernameOverride, roomName) => {
    setRoom(roomName);
    setIsJoined(true);
    if(socket) {
      socket.connect();
      socket.emit('join', { room: roomName });
    }
  };

  const handleSendMessage = (text) => {
    if (text.trim() && socket) {
      socket.emit('send_message', { text: text.trim() });
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (socket) socket.emit('message_reaction', { messageId, emoji });
  };

  const handleRaiseHand = () => {
    if (socket) {
      socket.emit('raise_hand');
      setRaisedHands((prev) => !prev.includes(user.username) ? [...prev, user.username] : prev);
    }
  };

  if (!isJoined) {
    return (
       <div className="absolute inset-0 z-50 bg-white">
          <JoinScreen onJoin={handleJoin} defaultUsername={user?.username} />
       </div>
    );
  }

  return (
    <div className="flex h-full bg-white relative">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Room Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white/50 backdrop-blur-sm relative z-10">
           <div className="flex items-center space-x-3">
              <div className="bg-slate-50 p-2 rounded-xl">
                 {isRoomLoading ? <Loader2 className="w-5 h-5 text-brand-pink animate-spin" /> : <Hash className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="min-w-0">
                 <h2 className="text-sm font-black text-slate-900 flex items-center space-x-2 truncate">
                    <span>{activeRoomData?.name || room}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                 </h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                   {activeRoomData?.topic || (users.length > 0 ? `${users.length} members online` : 'Connecting...')}
                 </p>
              </div>
           </div>

           <div className="flex items-center space-x-1">
              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                 <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                 <Bell className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsRightRailOpen(!isRightRailOpen)}
                className={`p-2 rounded-xl transition-all ${isRightRailOpen ? 'text-brand-pink bg-brand-pink/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                 <Users className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-100 mx-2"></div>
              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                 <MoreVertical className="w-4 h-4" />
              </button>
           </div>
        </div>

        <MessageList 
          messages={messages} 
          currentUser={user?.username} 
          typingUsers={typingUsers} 
          onReaction={handleReaction} 
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage} 
          onTyping={(isTyping) => {
             if (socket) {
                if (isTyping) socket.emit('typing');
                else socket.emit('stop_typing');
             }
          }} 
          onRaiseHand={handleRaiseHand}
          room={room}
        />
      </div>

      {/* Right Rail (Members & Details) */}
      <div className={`transition-all duration-300 ease-in-out border-l border-slate-100 bg-slate-50/50 flex flex-col shrink-0 ${isRightRailOpen ? 'w-80' : 'w-0 overflow-hidden border-none'}`}>
        <div className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
           {/* Section: Members */}
           <div>
              <div className="flex items-center justify-between mb-4 px-2">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Members — {users.length}</h3>
                 <button className="text-[10px] font-black text-brand-pink uppercase tracking-widest hover:underline">See All</button>
              </div>
              <div className="space-y-3">
                 {users.map(u => (
                   <div key={u} className="flex items-center space-x-3 p-2 hover:bg-white hover:shadow-sm rounded-2xl transition-all cursor-pointer group">
                      <div className="relative">
                         <img src={`https://ui-avatars.com/api/?name=${u}&background=random&color=fff`} className="w-10 h-10 rounded-xl" alt={u} />
                         <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-800 truncate">{u}</p>
                         <p className="text-[10px] text-slate-400 font-medium">Available</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Section: Shared Media */}
           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Shared Media</h3>
              <div className="grid grid-cols-2 gap-2">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square bg-slate-200 rounded-2xl overflow-hidden hover:opacity-80 cursor-pointer transition-opacity border-2 border-white shadow-sm">
                       <img src={`https://picsum.photos/200?random=${i}`} className="w-full h-full object-cover" alt="Shared" />
                    </div>
                 ))}
              </div>
           </div>

           {/* Section: Shared Files */}
           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Shared Files</h3>
              <div className="space-y-2">
                 {[
                   { name: 'mobile-nav-mockup.pdf', size: '2.5 MB' },
                   { name: 'tokens.json', size: '12 KB' }
                 ].map(f => (
                   <div key={f.name} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 hover:border-brand-pink/20 transition-all cursor-pointer group">
                      <div className="flex items-center space-x-3 min-w-0">
                         <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-brand-pink">
                            <FileText className="w-4 h-4" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{f.size}</p>
                         </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-300 hover:text-slate-900" />
                   </div>
                 ))}
              </div>
           </div>

           {/* Section: Integrations */}
           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Integrations</h3>
              <div className="space-y-3">
                 <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                       <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                          <Calendar className="w-4 h-4" />
                       </div>
                       <p className="text-xs font-black text-slate-900 tracking-tight">Google Calendar</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                       <p className="text-[10px] font-bold text-slate-800">Launch Sync @ 2PM</p>
                       <p className="text-[9px] text-slate-400">Zoom Call • 35 mins</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Right Rail Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
           <button className="w-full py-3 bg-brand-pink text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-magenta-600 transition-all active:scale-95">
              Launch Group Video
           </button>
        </div>
      </div>
    </div>
  );
}
