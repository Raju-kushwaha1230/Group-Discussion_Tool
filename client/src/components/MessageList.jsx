import React, { useRef, useEffect } from 'react';
import { Smile, MessageCircle, MoreHorizontal, Reply } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import classNames from 'classnames';

export default function MessageList({ messages, currentUser, typingUsers = [], onReaction }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const otherTypingUsers = typingUsers.filter(u => u !== currentUser);
  const emojiList = ['👍', '❤️', '🔥', '👏', '😮', '🚀'];

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-1 bg-white relative">
      <div className="flex flex-col space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 space-y-6 select-none">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-slate-400" />
            </div>
            <div className="text-center space-y-1">
               <h3 className="text-xl font-black text-slate-900">Start the conversation</h3>
               <p className="text-sm font-medium">Say hello to your teammates!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id || index} className="flex justify-center my-6">
                  <div className="px-6 py-1.5 bg-slate-50 border border-slate-100/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isMe = msg.sender === currentUser;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isConsecutive = prevMsg && prevMsg.sender === msg.sender && (new Date(msg.timestamp) - new Date(prevMsg.timestamp) < 60000);

            return (
              <div
                key={msg.id || index}
                className={classNames('group relative flex items-start space-x-4 px-4 py-2 hover:bg-slate-50 transition-colors', {
                  'mt-4': !isConsecutive,
                })}
              >
                {/* Avatar (only show for first message in a group) */}
                <div className="w-10 shrink-0 select-none">
                   {!isConsecutive ? (
                      <img 
                        src={getAvatar(msg.sender)} 
                        alt={msg.sender} 
                        className="w-10 h-10 rounded-xl shadow-sm hover:scale-110 transition-transform cursor-pointer"
                      />
                   ) : (
                      <div className="w-10 h-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] text-slate-400 font-bold">{formatTime(msg.timestamp)}</span>
                      </div>
                   )}
                </div>

                <div className="flex-1 min-w-0">
                  {!isConsecutive && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-black text-slate-900 hover:underline cursor-pointer">{msg.sender}</span>
                      <span className="text-[10px] font-bold text-slate-400">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-p:text-slate-800 tracking-[-0.01em]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                       {msg.reactions.map((r, i) => (
                         <button 
                           key={i}
                           onClick={() => onReaction(msg.id, r.emoji)}
                           className="bg-slate-50 border border-slate-200 hover:border-brand-pink/30 hover:bg-brand-pink/5 rounded-full px-2.5 py-1 text-xs flex items-center space-x-2 transition-all group/reaction"
                         >
                           <span className="scale-110 group-hover/reaction:scale-125 transition-transform">{r.emoji}</span>
                           <span className="font-bold text-slate-500 group-hover/reaction:text-brand-pink">{r.users?.length || 0}</span>
                         </button>
                       ))}
                    </div>
                  )}
                </div>

                {/* Floating Actions */}
                <div className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 flex items-center bg-white border border-slate-100 rounded-2xl shadow-xl p-1 z-10">
                   <div className="flex items-center px-1">
                      {emojiList.map(emoji => (
                        <button 
                          key={emoji}
                          onClick={() => onReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-slate-50"
                        >
                          <span className="text-base">{emoji}</span>
                        </button>
                      ))}
                   </div>
                   <div className="w-px h-4 bg-slate-100 mx-1"></div>
                   <button className="p-2 text-slate-400 hover:text-brand-pink rounded-xl hover:bg-slate-50 transition-colors">
                      <Reply className="w-4 h-4" />
                   </button>
                   <button className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Typing Indicator */}
      {otherTypingUsers.length > 0 && (
        <div className="flex items-center space-x-3 px-8 pt-4 pb-2 text-slate-400 select-none animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex space-x-1 bg-slate-100 p-2 rounded-xl">
            <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-bounce"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {otherTypingUsers.length === 1 
              ? `${otherTypingUsers[0]} is typing...` 
              : `${otherTypingUsers.length} people are typing...`}
          </span>
        </div>
      )}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
