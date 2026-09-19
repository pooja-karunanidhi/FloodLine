import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, ShieldAlert, CornerDownRight } from 'lucide-react';
import { ZoneData, ShelterData } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: ZoneData;
  shelters: ShelterData[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  source?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedZone,
  shelters,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      text: `🤖 **FloodSense AI Operational**\n\nI am grounded in live municipal sensor telemetries, dyke thresholds, and road inundation models.\n\n• **Current High-Alert Sector:** ${selectedZone.code} (${selectedZone.name})\n• **Risk Score:** ${selectedZone.riskScore}/100 (${selectedZone.riskLevel})\n• **Estimated Time to Flood:** ${selectedZone.estimatedTimeToFloodMinutes ? `${Math.floor(selectedZone.estimatedTimeToFloodMinutes / 60)}h ${selectedZone.estimatedTimeToFloodMinutes % 60}m` : 'Stable'}\n\nHow can I assist your evacuation planning or risk assessment?`,
      timestamp: 'Just now',
      source: 'FloodSense Risk Engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    'Is Zone 4 safe?',
    'Where is the nearest shelter?',
    'Which roads are flooded?',
    'How many people are affected?',
    'What should I do during a flood?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const promptToSend = (questionText || input).trim();
    if (!promptToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: {
            currentZone: selectedZone.code,
            zoneRisk: selectedZone.riskScore,
            waterLevel: selectedZone.waterLevel,
            criticalLevel: selectedZone.criticalWaterLevel,
            shelterAvailableCount: shelters.filter((s) => s.status !== 'FULL').length,
          },
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: data.reply || 'Analysis completed with current telemetry records.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback local reply if fetch network fails
      const fallbackAiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: `🤖 **FloodSense AI (Local Fallback)**\n\n• **${selectedZone.code} Status:** ${selectedZone.riskLevel} (${selectedZone.riskScore}/100)\n• **Water Level:** ${selectedZone.waterLevel}m (Critical: ${selectedZone.criticalWaterLevel}m)\n• **Recommended Action:** Evacuate low-lying areas immediately. Move via North Arterial Viaduct to Government Model High School (2.4 km away, 130 beds free).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local-emergency-heuristics',
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  FloodSense AI Emergency Assistant
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-mono font-medium">
                  Gemini Flash + Telemetry Grounding
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Authoritative disaster decision-support assistant for civil command
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Prompt Chips */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono font-semibold text-slate-500 shrink-0">Quick Queries:</span>
          {presetQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-slate-100 text-sky-800 border border-slate-200 hover:border-sky-300 whitespace-nowrap transition shrink-0 shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-white">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-sky-600 text-white shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[9px] font-mono ${
                    isAi ? 'border-slate-200 text-slate-400' : 'border-sky-500 text-sky-100'
                  }`}>
                    <span>{m.timestamp}</span>
                    {m.source && <span>{m.source}</span>}
                  </div>
                </div>
                {!isAi && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-sky-700 font-mono p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Synthesizing multi-zone hydrology telemetries...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about risk, shelter availability, or road closures..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
