import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../../../api';

interface Message {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

interface Thread {
  id: number;
  title: string;
  messages: Message[];
}

export default function AssistantIndex() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchThreads = async () => {
    try {
      const res = await api.get('/assistant/threads/');
      setThreads(res.data);
      if (res.data.length > 0 && !activeThread) {
        setActiveThread(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch threads', err);
    }
  };

  const createThread = async () => {
    try {
      const res = await api.post('/assistant/threads/', { title: 'New Conversation' });
      setThreads([res.data, ...threads]);
      setActiveThread(res.data);
    } catch (err) {
      console.error('Failed to create thread', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeThread) return;

    const userMessage = { id: Date.now(), role: 'user', content: input, timestamp: new Date().toISOString() };
    
    // Optimistic UI update
    setActiveThread(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      await api.post(`/assistant/threads/${activeThread.id}/chat/`, {
        content: currentInput
      });
      
      // Update with real response
      setActiveThread(prev => prev ? {
        ...prev,
        // Replace optimistic message and add AI response (since we get only the AI response back, we should just fetch the thread or manually append)
        // Actually, let's just re-fetch the thread to ensure complete sync
      } : null);
      
      const updatedThread = await api.get(`/assistant/threads/${activeThread.id}/`);
      setActiveThread(updatedThread.data);

    } catch (err) {
      console.error('Failed to send message', err);
      // Remove optimistic message on error (simplified)
      alert("Failed to get a response from ORBIS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] font-jakarta bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={createThread}
            className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex justify-center items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${activeThread?.id === thread.id ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <div className="font-semibold truncate">{thread.title}</div>
              <div className={`text-xs mt-1 ${activeThread?.id === thread.id ? 'text-blue-100' : 'text-gray-400'}`}>
                {thread.messages.length} messages
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-canvas relative">
        {activeThread ? (
          <>
            <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-between shadow-sm">
              <h2 className="text-xl font-bold text-gray-800">{activeThread.title}</h2>
              <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                Qwen 2.5 1.5B (Local)
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeThread.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-primary text-white'}`}>
                      {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`p-5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl flex gap-4 flex-row">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-gray-500 font-medium">ORBIS is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask ORBIS anything..."
                  disabled={loading}
                  className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary outline-none shadow-inner text-gray-800 font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-md"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
              <div className="text-center mt-3 text-xs text-gray-400">
                ORBIS uses RAG with SQLite-vec to retrieve knowledge from your Content Studio.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Bot className="w-20 h-20 text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to ORBIS Assistant</h2>
            <p className="text-gray-500 max-w-md mb-8">
              Your offline-first AI tutor for Official Statistics. I can help answer questions based on the materials you've uploaded.
            </p>
            <button
              onClick={createThread}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md"
            >
              Start a Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
