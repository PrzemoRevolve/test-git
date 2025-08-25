import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';

const Echo: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const wsUrl = import.meta.env.PROD ? `ws://${window.location.host}/ws` : 'ws://localhost:3000/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      const receivedMessage: Message = {
        id: Date.now().toString(),
        text: event.data,
        timestamp: new Date(),
        type: 'received'
      };
      setChatHistory(prev => [...prev, receivedMessage]);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSend = () => {
    if (!message.trim() || !isConnected) return;

    // Add message to chat history
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      timestamp: new Date(),
      type: 'sent'
    };

    setChatHistory(prev => [...prev, newMessage]);

    // Send via WebSocket (will be implemented)
    if (wsRef.current) {
      wsRef.current.send(message.trim());
    }

    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Echo Chat</h2>
      
      <div style={{ marginBottom: '10px' }}>
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Chat History */}
      <div 
        style={{ 
          border: '1px solid #ccc', 
          height: '400px', 
          overflowY: 'auto', 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: '#f9f9f9'
        }}
      >
        {chatHistory.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
            No messages yet. Start typing to begin the echo conversation!
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div 
              key={msg.id}
              style={{
                marginBottom: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: msg.type === 'sent' ? '#007bff' : '#6c757d',
                color: 'white',
                alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                marginLeft: msg.type === 'sent' ? 'auto' : '0',
                marginRight: msg.type === 'received' ? 'auto' : '0'
              }}
            >
              <div>{msg.text}</div>
              <div style={{ fontSize: '0.8em', opacity: 0.8, marginTop: '4px' }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input and Send Button */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || !isConnected}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: (!message.trim() || !isConnected) ? 0.6 : 1
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Echo;