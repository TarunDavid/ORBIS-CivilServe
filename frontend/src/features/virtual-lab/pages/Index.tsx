import { useState, useEffect, useRef } from 'react';
import { Microscope, Play, Send, Bot, User as UserIcon, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../../api';

interface Scenario {
  id: number;
  title: string;
  description: string;
  competency: { name: string; domain: string };
}

interface Attempt {
  id: number;
  scenario: Scenario;
  transcript: { role: string; content: string }[];
  score: number | null;
  feedback: string | null;
  completed_at: string | null;
}

export default function VirtualLabIndex() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeAttempt?.transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/virtual_lab/scenarios/');
      setScenarios(res.data);
    } catch (err) {
      console.error('Failed to fetch scenarios', err);
    }
  };

  const startScenario = async (scenarioId: number) => {
    try {
      setLoading(true);
      const res = await api.post('/virtual_lab/attempts/', { scenario_id: scenarioId });
      setActiveAttempt(res.data);
    } catch (err) {
      console.error('Failed to start scenario', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeAttempt) return;

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/virtual_lab/attempts/${activeAttempt.id}/turn/`, {
        content: currentInput
      });
      setActiveAttempt({ ...activeAttempt, transcript: res.data });
    } catch (err) {
      console.error('Failed to process turn', err);
      alert('Simulation error.');
    } finally {
      setLoading(false);
    }
  };

  const finishScenario = async () => {
    if (!activeAttempt) return;
    try {
      setLoading(true);
      const res = await api.post(`/virtual_lab/attempts/${activeAttempt.id}/finish/`);
      setActiveAttempt(res.data);
    } catch (err) {
      console.error('Failed to finish scenario', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] font-jakarta bg-gray-50">
      {/* Sidebar: Available Scenarios */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Virtual Lab</h2>
            <p className="text-xs text-gray-500">Interactive Role-plays</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Available Scenarios</h3>
          {scenarios.map(scenario => (
            <div key={scenario.id} className="p-4 border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all bg-white group relative">
              <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
                {scenario.competency.domain}
              </div>
              <h4 className="font-bold text-gray-900 mb-2 leading-tight">{scenario.title}</h4>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{scenario.description}</p>
              <button 
                onClick={() => startScenario(scenario.id)}
                disabled={loading}
                className="w-full py-2 bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Simulation
              </button>
            </div>
          ))}
          {scenarios.length === 0 && (
            <p className="text-sm text-gray-400 px-2">No scenarios available.</p>
          )}
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 flex flex-col bg-canvas relative">
        {activeAttempt ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white z-10 flex items-center justify-between shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{activeAttempt.scenario.title}</h2>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Simulation Active
                </div>
              </div>
              {!activeAttempt.completed_at && (
                <button 
                  onClick={finishScenario}
                  disabled={loading || activeAttempt.transcript.length < 2}
                  className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  End & Evaluate
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeAttempt.transcript.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Send a message to begin the simulation.</p>
                </div>
              )}
              
              {activeAttempt.transcript.map((msg, idx) => (
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
                      <span className="text-gray-500 font-medium">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeAttempt.completed_at && (
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900">Evaluation Complete</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</div>
                      <div className="text-4xl font-black text-primary">{activeAttempt.score?.toFixed(0)}</div>
                      <div className="text-xs text-gray-500 mt-1">/ 100</div>
                    </div>
                    <div className="md:col-span-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Feedback</div>
                      <p className="text-gray-700 text-sm leading-relaxed">{activeAttempt.feedback}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {!activeAttempt.completed_at && (
              <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
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
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Microscope className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Virtual AI Lab</h2>
            <p className="text-gray-500 max-w-md mb-8">
              Practice your skills in highly realistic, LLM-driven role-play scenarios. Choose a scenario from the sidebar to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
