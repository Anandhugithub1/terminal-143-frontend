// 📁 src/features/chat/hooks/useSocketMessages.js
import { useEffect } from 'react';
import { socket } from '../../../shared/socket/socket';

export const useSocketMessages = ({ sender, recipient, onMessage }) => {
  useEffect(() => {
    socket.emit('join_room', sender);

    const handleMessage = (msg) => {
      if ((msg.sender === sender && msg.recipient === recipient) || (msg.sender === recipient && msg.recipient === sender)) {
        onMessage(msg);
      }
    };

    socket.on('new_message', handleMessage);
    socket.on('message_sent', handleMessage);  

    return () => {
      socket.off('new_message', handleMessage);
      socket.off('message_sent', handleMessage);
    };
  }, [sender, recipient, onMessage]);
};