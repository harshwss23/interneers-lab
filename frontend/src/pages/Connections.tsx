import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Users, User, ArrowLeft, MessageCircle, Video, MoreVertical, Paperclip, Smile, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  sender_role: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface UserProfile {
  id: number;
  username: string;
  role: string;
  status: string;
}

export default function Connections() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [managers, setManagers] = useState<UserProfile[]>([]);
  const [activeChat, setActiveChat] = useState<'all' | number | null>(user?.role === 'WAREHOUSE_MANAGER' ? 'all' : null);
  const [activeChatUsername, setActiveChatUsername] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
    if (user?.role === 'ADMIN') {
      fetchManagers();
    }
  }, [user]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/accounts/chat-history/', { headers: getHeaders() });
      const json = await response.json();
      setMessages(json.data || json);
    } catch (error) {
      console.error('Failed to fetch chat history', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/accounts/users/', { headers: getHeaders() });
      const json = await response.json();
      const allUsers = json.data || json;
      setManagers(allUsers.filter((u: UserProfile) => u.role === 'WAREHOUSE_MANAGER'));
    } catch (error) {
      console.error('Failed to fetch managers', error);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Use ws:// for local development. Make sure protocol matches environment.
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Dynamically connect to the current host to support deployed environments
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: data.sender,
        sender_role: data.sender_role,
        receiver: data.receiver,
        content: data.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected. Reconnecting in 5s...');
      setTimeout(connectWebSocket, 5000);
    };
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !ws.current) return;

    const payload = {
      message: messageText,
      receiver_id: activeChat === 'all' ? null : activeChat
    };

    ws.current.send(JSON.stringify(payload));
    setMessageText('');
  };

  const getFilteredMessages = () => {
    if (user?.role === 'WAREHOUSE_MANAGER') {
      return messages; // Managers see broadcast and direct messages to admin
    }
    
    if (activeChat === 'all') {
      // Show broadcast messages sent by admin
      return messages.filter(m => m.receiver === 'all' && m.sender === user?.username);
    }
    
    // Show 1-on-1 messages
    return messages.filter(m => 
      (m.sender === user?.username && m.receiver === activeChatUsername) ||
      (m.sender === activeChatUsername && (m.receiver === user?.username || m.receiver === 'admin'))
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - var(--navbar-height))' }}>
      <div style={{
        display: 'flex',
        height: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Sidebar */}
        {user?.role === 'ADMIN' && (
          <div style={{
            width: '320px',
            borderRight: '1px solid #f1f5f9',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <MessageCircle size={20} color="#0ea5e9" /> Connections
              </h2>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 0' }}>
              <div 
                onClick={() => { setActiveChat('all'); setActiveChatUsername(null); }}
                style={{
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: activeChat === 'all' ? '#f0f9ff' : 'transparent',
                  borderRight: activeChat === 'all' ? '3px solid #0ea5e9' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#0ea5e9" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>Broadcast to All</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Send to all managers</div>
                </div>
              </div>

              <div style={{ padding: '1.5rem 1.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Warehouse Managers
              </div>

              {managers.map(manager => (
                <div 
                  key={manager.id}
                  onClick={() => { setActiveChat(manager.id); setActiveChatUsername(manager.username); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: activeChat === manager.id ? '#f8fafc' : 'transparent',
                    borderRight: activeChat === manager.id ? '3px solid #0f172a' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 600 }}>
                      {manager.username.substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: manager.status === 'ACTIVE' ? '#10b981' : '#cbd5e1', border: '2px solid #ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{manager.username}</div>
                    <div style={{ fontSize: '0.75rem', color: manager.status === 'ACTIVE' ? '#10b981' : '#94a3b8' }}>
                      {manager.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', position: 'relative' }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <ArrowLeft size={18} />
                  </button>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                      {activeChat === 'all' || user?.role === 'WAREHOUSE_MANAGER' ? 'AD' : (activeChatUsername?.substring(0,2).toUpperCase() || 'WM')}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '2px solid #ffffff' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
                      {user?.role === 'WAREHOUSE_MANAGER' ? 'Admin Team' : (activeChat === 'all' ? 'Broadcast' : activeChatUsername)}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '0.1rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> ONLINE
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#ffffff' }}>
                {getFilteredMessages().map((msg, idx) => {
                  const isMine = msg.sender === user?.username;
                  
                  // Formatting date/time
                  const dateObj = new Date(msg.timestamp);
                  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}>
                      <div style={{
                        background: isMine ? 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)' : '#ffffff',
                        color: isMine ? '#ffffff' : '#334155',
                        padding: '0.875rem 1.25rem',
                        borderRadius: isMine ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                        border: isMine ? 'none' : '1px solid #f1f5f9',
                        boxShadow: isMine ? '0 4px 15px rgba(0, 198, 255, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.03)',
                        maxWidth: '65%',
                        lineHeight: '1.5',
                        fontSize: '0.95rem'
                      }}>
                        {msg.content}
                      </div>
                      
                      {/* Timestamp and Read Receipt */}
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: '#94a3b8', 
                        marginTop: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0 0.5rem'
                      }}>
                        {timeString} {isMine && <CheckCheck size={14} color="#0ea5e9" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={sendMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      width: '100%',
                      padding: '1rem 3rem 1rem 1.5rem',
                      borderRadius: '999px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Smile size={20} color="#94a3b8" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <button type="submit" disabled={!messageText.trim()} style={{
                  width: 48, height: 48,
                  borderRadius: '50%',
                  background: messageText.trim() ? '#0f172a' : '#e2e8f0',
                  color: messageText.trim() ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: messageText.trim() ? '0 4px 10px rgba(15, 23, 42, 0.2)' : 'none'
                }}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#ffffff' }}>
              <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>Select a connection to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
