import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, X, Sparkles } from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import './ChatBotWidget.css';

export default function ChatBotWidget({ isFloating = false, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi! I'm FinMitra AI, your personal financial assistant. Ask me anything about your income, expenses, category spending, or savings tips!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const response = await aiApi.sendMessage(query);
      const aiMessage = {
        sender: 'ai',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Sorry, I had trouble analyzing your finances right now. Please try again!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    "What is my total expense?",
    "Which is my highest spend?",
    "Am I over budget?",
    "Give me savings advice"
  ];

  return (
    <div className={`chatbot-card ${isFloating ? 'floating-card' : ''}`}>
      {/* Chatbot Header */}
      <div className="chatbot-header">
        <div className="bot-info">
          <div className="bot-avatar">
            <Bot size={20} color="#00E676" />
          </div>
          <div>
            <h4 className="bot-name">FinMitra AI Assistant</h4>
            <span className="bot-status">● Active Financial Advisor</span>
          </div>
        </div>

        {isFloating && onClose && (
          <button className="close-chat-btn" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble-wrapper ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              <p className="message-text">{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-bubble-wrapper ai">
            <div className="message-bubble ai loading-bubble">
              <RefreshCw size={16} className="spin-icon" /> Analyzing your financial data...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="chat-chips-row">
        {quickChips.map((chip, idx) => (
          <button 
            key={idx} 
            className="chat-chip"
            onClick={() => handleSend(chip)}
          >
            <Sparkles size={12} /> {chip}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chatbot-input-form">
        <input 
          type="text" 
          placeholder="Ask FinMitra AI about your finances..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="send-btn" disabled={loading || !inputMsg.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
