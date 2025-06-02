// 📁 src/features/chat/api/messageApi.js
import axios from 'axios';

export const fetchMessages = async ({ sender, recipient }) => {
  const res = await axios.get(`/messages/${sender}`, { params: { sender, recipient } });
  return res.data.messages;
};

export const sendMessage = async ({ sender, recipient, content }) => {
  const res = await axios.post('/messages', { sender, recipient, content });
  return res.data.data;
};