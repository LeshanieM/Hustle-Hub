import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm Hustle-Bot. How can I help you today?", 
      sender: 'bot', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: { up: 0, down: 0 }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Add ID counter ref
  const idCounterRef = useRef(1);
  
  // Helper function to get next ID
  const getNextId = () => {
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputValue(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputValue(''); // Clear previous input
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!hasOpened) setHasOpened(true);
  };

  const fetchBotResponse = async (userText) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      return data.reply || "Sorry, I am having trouble connecting.";
    } catch (error) {
      console.error("Chat API Error:", error);
      return "Error connecting to the server.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMessage = { 
      id: getNextId(), 
      text: userText, 
      sender: 'user', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const replyText = await fetchBotResponse(userText);
    
    const botResponse = {
      id: getNextId(),
      text: replyText,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: { up: 0, down: 0 }
    };
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleFAQClick = async (faqText) => {
    const userMessage = { 
      id: getNextId(), 
      text: faqText, 
      sender: 'user', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const replyText = await fetchBotResponse(faqText);

    const botResponse = {
      id: getNextId(),
      text: replyText,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: { up: 0, down: 0 }
    };
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!", { duration: 2000 });
  };

  const handleReaction = (msgId, type) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.sender === 'bot') {
        const newReactions = { ...msg.reactions };
        newReactions[type] = (newReactions[type] || 0) + 1;
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] font-sans">
      {/* Floating Button */}
      <button 
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-none cursor-pointer ${
          isOpen ? 'bg-gray-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'
        } ${!hasOpened && !isOpen ? 'animate-bounce' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle Chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-[4.5rem] right-0 w-[clamp(320px,90vw,400px)] max-h-[600px] bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gray-50 border-bottom border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm animate-pulse opacity-30"></div>
                <svg viewBox="0 0 100 100" className="w-6 h-6 relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>
                    <circle cx="50" cy="50" r="45" fill="white" stroke="#1111d4" strokeWidth="2" />
                    <circle cx="35" cy="45" r="5" fill="#1111d4" />
                    <circle cx="65" cy="45" r="5" fill="#1111d4" />
                    <path d="M 35 65 Q 50 75 65 65" fill="none" stroke="#1111d4" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight">Hustle-Bot</h3>
                <span className="text-[10px] text-green-500 font-medium">Online now</span>
              </div>
            </div>
            <button onClick={toggleChat} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6 max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`relative px-4 py-2.5 rounded-2xl text-sm max-w-[85%] break-words group shadow-sm ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.text}
                  
                  {/* Actions for Bot Messages */}
                  {msg.sender === 'bot' && (
                    <div className="absolute -bottom-5 left-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => copyToClipboard(msg.text)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Copy text"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleReaction(msg.id, 'up')}
                        className={`p-1 transition-colors ${msg.reactions.up > 0 ? 'text-blue-500' : 'text-gray-400 hover:text-green-500'}`}
                      >
                        <span className="text-[10px]">{msg.reactions.up > 0 ? msg.reactions.up : ''}</span>
                        👍
                      </button>
                      <button 
                        onClick={() => handleReaction(msg.id, 'down')}
                        className={`p-1 transition-colors ${msg.reactions.down > 0 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <span className="text-[10px]">{msg.reactions.down > 0 ? msg.reactions.down : ''}</span>
                        👎
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                  {msg.sender === 'bot' ? 'Bot' : 'You'} • {msg.timestamp}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-sm italic">
                  Bot is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Shortcuts */}
          <div className="px-4 pb-3 flex flex-wrap gap-2 overflow-x-auto">
            {['Try Simulator', 'Growth Tip 💡', 'Contact Us'].map((faq) => (
              <button 
                key={faq} 
                onClick={() => handleFAQClick(faq === 'Growth Tip 💡' ? 'Get a random Growth Tip' : faq === 'Try Simulator' ? '🏡 Try Simulator' : faq)}
                className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 rounded-full text-xs font-semibold transition-all shadow-sm"
              >
                {faq === 'Try Simulator' ? '🏡 Try Simulator' : faq}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
            <button 
              type="button"
              onClick={toggleListening}
              className={`p-2 flex-shrink-0 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-2a5 5 0 01-10 0H3a7.001 7.001 0 006 6.93V17H6v2h8v-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow py-2 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;