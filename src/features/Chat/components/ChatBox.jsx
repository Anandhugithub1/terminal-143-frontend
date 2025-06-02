import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, sendMessage } from '../api/messageapi';
import { useSocketMessages } from '../Hooks/useSocketMessage';
import { Mic, Paperclip, Send } from 'lucide-react';

const ChatBox = ({ sender, recipient }) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', sender, recipient],
    queryFn: () => fetchMessages({ sender, recipient }),
  });

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', sender, recipient] });
      setContent('');
    },
  });

  useSocketMessages({
    sender,
    recipient,
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', sender, recipient] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full h-[100dvh] bg-white flex flex-col justify-between sm:max-w-sm mx-auto relative">
      {/* Banner */}
     {/* <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
  <div className="flex items-center bg-gradient-to-r from-[#A726C1] to-[#7014AA] text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4 mr-1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132a.75.75 0 00-1.167.624v4.68a.75.75 0 001.167.624l3.197-2.132a.75.75 0 000-1.264z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    3x your chances to match
  </div>
</div> */}


      {/* Header */}
      <div className="pt-20 pb-6 flex flex-col items-center text-center">
        <img
          src="https://i.pravatar.cc/100"
          alt={recipient}
          className="w-20 h-20 rounded-full shadow-md"
        />
        <p className="font-medium mt-2">{recipient}</p>
        <p className="text-sm font-semibold mt-2 text-black">
          Stand out with <span className="text-pr">First Impressions</span>.
          <br />
          Send a message
        </p>
        <p className="text-xs text-gray-500 mt-1">
          You can send <span className="text-pr font-medium">3 messages</span> without matching
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {isLoading ? (
          <p className="text-center text-gray-500 mt-4">Loading...</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === sender ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  msg.sender === sender
                    ? 'bg-purple-700 text-white rounded-br-none'
                    : 'bg-gray-100 text-black rounded-bl-none'
                }`}
              >
                {msg.content}
                <div className="text-[10px] mt-1 text-right text-white/60">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="px-3 py-2 border-t border-gray-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your messages"
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm bg-gray-50 focus:outline-none"
        />
        <button
          disabled
          className="p-2 text-gray-400"
        >
          <Paperclip size={18} />
        </button>
        <button
          disabled
          className="p-2 text-gray-400"
        >
          <Mic size={18} />
        </button>
        <button
          onClick={() => mutation.mutate({ sender, recipient, content })}
          disabled={!content.trim()}
          className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-full text-white disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
