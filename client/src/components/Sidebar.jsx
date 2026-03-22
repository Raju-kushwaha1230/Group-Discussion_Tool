import { Users, Hash, Hand, MicOff } from 'lucide-react';

export default function Sidebar({ users, currentUser, currentRoom, raisedHands = [], onMuteUser }) {
  const currentUsername = typeof currentUser === 'string' ? currentUser : currentUser?.username;
  const currentUserRole = currentUser?.role || 'participant';
  const isModerator = ['moderator', 'admin'].includes(currentUserRole);

  // Generate a consistent color based on username
  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 
      'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 z-0">
      {/* Room Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Room</h3>
        <div className="flex items-center space-x-2 text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-100 p-1.5 rounded-md">
            <Hash className="h-5 w-5 text-blue-600" />
          </div>
          <span className="font-bold text-lg truncate flex-1">{currentRoom}</span>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-2 bg-white">
        <Users className="h-5 w-5 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Online Users</h2>
        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
          {users.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar bg-gray-50/30">
        {users.map((username, index) => {
          const isMe = username === currentUsername;
          const avatarColor = getAvatarColor(username);
          const hasHandRaised = raisedHands.includes(username);
          
          return (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-2.5 rounded-xl transition-all ${
                isMe ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-gray-100/80 transparent border border-transparent'
              } ${hasHandRaised ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
            >
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0 ${avatarColor} relative`}>
                {username.charAt(0).toUpperCase()}
                {hasHandRaised && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-md animate-bounce">
                    <Hand className="h-3 w-3 text-white fill-current" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isMe ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {username} {isMe && <span className="text-xs font-normal text-blue-600 ml-1">(You)</span>}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isModerator && !isMe && (
                   <button 
                    onClick={() => onMuteUser(username)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Mute user"
                   >
                     <MicOff className="h-4 w-4" />
                   </button>
                )}
                <div className="flex h-3 w-3 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
