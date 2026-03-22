import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Hash, Zap, ChevronUp, Image as ImageIcon } from 'lucide-react';

export default function MessageInput({ onSendMessage, onTyping, onRaiseHand, room }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      onTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  return (
    <div className="px-6 py-6 bg-white border-t border-slate-100 shrink-0">
      <form onSubmit={handleSubmit} className="relative max-w-7xl mx-auto">
        <div className={`transition-all duration-300 rounded-[2.5rem] border-2 shadow-sm focus-within:shadow-xl focus-within:shadow-brand-pink/10 ${
          message.length > 50 ? 'rounded-3xl' : 'rounded-[2.5rem]'
        } bg-slate-50 border-slate-100 focus-within:border-brand-pink/30 focus-within:bg-white overflow-hidden`}>
          
          {/* Action Header */}
          <div className="flex items-center px-6 pt-3 space-x-4">
             <button type="button" className="text-slate-400 hover:text-brand-pink transition-colors">
                <Hash className="w-4 h-4" />
             </button>
             <button type="button" className="text-slate-400 hover:text-brand-pink transition-colors">
                <Zap className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-slate-200"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Message #{room || 'general'}
             </span>
          </div>

          <div className="flex items-end p-2 px-4">
             <textarea
               ref={inputRef}
               rows={Math.min(5, message.split('\n').length || 1)}
               value={message}
               onChange={handleChange}
               onKeyDown={handleKeyDown}
               placeholder={`Send a message to ${room || 'the team'}...`}
               className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 font-medium placeholder-slate-400 py-3 px-2 resize-none max-h-40 custom-scrollbar"
             />

             <div className="flex items-center space-x-1 mb-1">
                <button type="button" className="p-2 text-slate-400 hover:text-brand-pink hover:bg-slate-100 rounded-xl transition-all">
                   <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-slate-400 hover:text-brand-pink hover:bg-slate-100 rounded-xl transition-all">
                   <Smile className="w-5 h-5" />
                </button>
                <button 
                  type="submit" 
                  disabled={!message.trim()}
                  className="ml-2 w-10 h-10 bg-brand-pink text-white rounded-xl flex items-center justify-center hover:bg-magenta-600 transition-all shadow-lg shadow-brand-pink/30 active:scale-90 disabled:opacity-50 disabled:grayscale disabled:scale-100 shrink-0"
                >
                   <Send className="w-5 h-5 fill-current" />
                </button>
             </div>
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-center justify-between px-6 mt-3 text-slate-400">
           <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold italic opacity-70">
                **Bold**, _italic_, `code`, /slash commands
              </span>
           </div>
           <button 
             type="button"
             onClick={onRaiseHand}
             className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:text-brand-purple transition-colors shrink-0"
           >
              <span>Raise Hand</span>
              <span className="text-base leading-none">✋</span>
           </button>
        </div>
      </form>
    </div>
  );
}
