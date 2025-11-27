"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Mic, Send, StopCircle, Activity, ShieldCheck, Bot, Terminal } from 'lucide-react';
import Navbar from '@/component/Navbar';

// --- 1. The UI Component (ChatInterface) ---
const ChatInterface = ({ 
  messages = [], 
  onSendMessage, 
  onSendAudio,
  onToggleLiveSession,
  isTyping, 
  agentStatus,
  voiceModeEnabled,
  isLiveSessionActive,
  onToggleVoiceMode
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingLegacy, setIsRecordingLegacy] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const isFirstRender = useRef(true);

  // --- SCROLL LOGIC ---
  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom("auto");
      isFirstRender.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isFirstRender.current) {
      scrollToBottom("smooth");
    }
  }, [messages, isTyping, agentStatus, isLiveSessionActive]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const startRecordingLegacy = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: recorder.mimeType });
        if (recordedBlob.size > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(recordedBlob);
            reader.onloadend = () => {
              const base64String = reader.result;
              onSendAudio(base64String.split(',')[1], recorder.mimeType);
            };
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecordingLegacy(true);
    } catch (err) {
      console.error(err);
      setIsRecordingLegacy(false);
    }
  };

  const stopRecordingLegacy = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecordingLegacy(false);
    }
  };

  const handleMicClick = () => {
    if (voiceModeEnabled) {
      onToggleLiveSession();
    } else {
      if (isRecordingLegacy) stopRecordingLegacy();
      else startRecordingLegacy();
    }
  };

  const isMicActive = isLiveSessionActive || isRecordingLegacy;

  return (
    <div className="flex flex-col w-full bg-[#050505] relative font-sans text-white overflow-hidden border-t border-white/10 md:border md:rounded-2xl md:mx-4 md:mb-4 h-[calc(100dvh-64px)] md:h-[calc(100vh-120px)] mt-16 md:mt-24">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="flex-none bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center">
           <p className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium flex items-center gap-2 uppercase tracking-wider">
             <span className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
             {isLiveSessionActive ? 'LIVE SESSION' : isRecordingLegacy ? 'RECORDING...' : 'ONLINE'}
           </p>
        </div>
        <button onClick={onToggleVoiceMode} disabled={isMicActive} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wide ${voiceModeEnabled ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'} ${isMicActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {voiceModeEnabled ? <Activity size={14} /> : <Bot size={14} />}
          {voiceModeEnabled ? 'Voice Mode' : 'Text Mode'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
            {msg.sender === 'agent-to-agent' && (
               <div className="w-full flex justify-center my-6">
                 <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 max-w-sm w-full flex flex-col gap-2 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#7C3AED]"></div>
                   <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">
                     <span className="flex items-center gap-1"><Terminal size={10} /> Protocol</span>
                     <span className="text-[#7C3AED] flex items-center gap-1 animate-pulse">Syncing...</span>
                   </div>
                   <p className="text-xs text-gray-300 font-mono leading-relaxed break-all"><span className="text-[#7C3AED] mr-2">&gt;</span>{msg.text}</p>
                 </div>
               </div>
            )}
            {(msg.sender === 'user' || msg.sender === 'bot') && (
              <div className={`max-w-[90%] sm:max-w-[75%] relative group ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.agentUsed && msg.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2 ml-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${msg.agentUsed === 'CHECKER' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : msg.agentUsed === 'SWARM' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#7C3AED]'}`}>
                        {msg.agentUsed}
                      </span>
                      {msg.metadata?.verdict && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${msg.metadata.verdict === 'REAL' ? 'bg-green-500/10 border-green-500/30 text-green-400' : msg.metadata.verdict === 'FAKE' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                          {msg.metadata.verdict}
                        </span>
                      )}
                  </div>
                )}
                <div className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-lg backdrop-blur-sm ${msg.sender === 'user' ? 'bg-[#7C3AED] text-white rounded-br-none' : 'bg-[#1A1A1A] border border-white/10 text-gray-200 rounded-bl-none'}`}>
                  {msg.text}
                  {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><ShieldCheck size={12} /> Verified Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.metadata.sources.map((src, i) => (
                           <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="bg-black/40 px-2 py-1 rounded-md border border-white/5 text-[10px] text-blue-400 hover:text-blue-300 truncate max-w-[200px] underline">{src.title}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start w-full animate-fade-in-up">
             <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-lg">
               <span className={`text-xs font-mono font-medium animate-pulse text-[#7C3AED]`}>{agentStatus}</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      <div className="flex-none bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 p-3 sm:p-5 z-40">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2 sm:gap-4">
          <button type="button" onClick={handleMicClick} disabled={isTyping && !isLiveSessionActive} className={`relative p-3 sm:p-4 rounded-xl shadow-lg transition-all active:scale-95 border ${isMicActive ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' : voiceModeEnabled ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/50' : 'bg-[#1A1A1A] text-gray-400 border-white/10'} ${isTyping && !isLiveSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isMicActive ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 transition-all" placeholder={isLiveSessionActive ? "Listening..." : "Type a claim to verify..."} value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={isMicActive} />
          </div>
          <button type="submit" disabled={!inputText.trim() || isTyping || isMicActive} className="p-3 sm:p-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl shadow-lg disabled:opacity-50 transition-all">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- 2. The Main Page Logic (API INTEGRATION) ---
export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
        id: 1,
        sender: 'bot',
        text: 'I am ready to verify information. What claim would you like me to check today?',
        timestamp: null,
        agentUsed: 'SYSTEM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);

  useEffect(() => {
    setMessages(prev => prev.map(msg => msg.id === 1 && !msg.timestamp ? { ...msg, timestamp: new Date() } : msg));
  }, []);

  // --- API CALLING LOGIC (CORRECTED FOR FASTAPI BACKEND) ---
  const handleSendMessage = async (text) => {
    // 1. Optimistic Update
    const userMsg = { id: Date.now(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setAgentStatus("Orchestrating Agents...");

    try {
        // 2. Call Main Agent (Orchestrator)
        const mainRes = await fetch('http://localhost:8000/api/main-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userText: text })
        });
        const plan = await mainRes.json();

        // 3. Handle Actions
        if (plan.action === "DELEGATE_TO_CHECKER") {
            setAgentStatus("Verifying with Google Search...");
            
            // Visual for Agent handoff
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'agent-to-agent',
                text: `Handoff to Check Agent: "${plan.checker_query}"`,
                timestamp: new Date()
            }]);

            // Call Check Agent
            const checkRes = await fetch('http://localhost:8000/api/check-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: plan.checker_query })
            });
            const checkResult = await checkRes.json();

            // Synthesize final response
            const synthRes = await fetch('http://localhost:8000/api/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userQuery: text,
                    checkResult: checkResult
                })
            });
            const synthData = await synthRes.json();

            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: synthData.text,
                timestamp: new Date(),
                agentUsed: 'CHECKER',
                metadata: {
                    verdict: checkResult.verdict,
                    confidence: checkResult.confidence,
                    sources: checkResult.sources
                }
            }]);

        } else if (plan.action === "SCAN_CRISIS") {
            setAgentStatus("Scanning Crisis Trends...");
            
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'agent-to-agent',
                text: `Deploying Swarm for topic: "${plan.scan_topic}"`,
                timestamp: new Date()
            }]);

            // Call Crisis Scanner
            const scanRes = await fetch('http://localhost:8000/api/scan-crisis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: plan.scan_topic })
            });
            const trends = await scanRes.json();

            // Format trends result
            let summary = "Crisis Scan Complete. Found the following trends:\n\n";
            trends.forEach((t, idx) => {
                summary += `${idx + 1}. [${t.verdict}] ${t.claim}\n   Severity: ${t.severity} | Volume: ${t.volume} mentions\n\n`;
            });

            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: summary,
                timestamp: new Date(),
                agentUsed: 'SWARM',
                metadata: { trends }
            }]);

        } else {
            // DIRECT REPLY
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: plan.reply_text,
                timestamp: new Date(),
                agentUsed: 'ORCHESTRATOR'
            }]);
        }

    } catch (error) {
        console.error('API Error:', error);
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            text: "Error connecting to Veritas Core. Please ensure the Python backend is running on http://localhost:8000",
            timestamp: new Date(),
            agentUsed: 'SYSTEM_ERROR'
        }]);
    } finally {
        setIsTyping(false);
        setAgentStatus(null);
    }
  };

  const handleSendAudio = async (base64Audio, mimeType) => {
    setIsTyping(true);
    setAgentStatus("Transcribing...");
    try {
        const res = await fetch('http://localhost:8000/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                base64Audio: base64Audio, 
                mimeType: mimeType 
            })
        });
        const data = await res.json();
        
        if (data.text && data.text.trim()) {
            // Feed transcription back into normal flow
            await handleSendMessage(data.text);
        } else {
            setIsTyping(false);
            setAgentStatus(null);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: "Could not transcribe audio. Please try again.",
                timestamp: new Date(),
                agentUsed: 'SYSTEM'
            }]);
        }
    } catch (error) {
        console.error('Transcription Error:', error);
        setIsTyping(false);
        setAgentStatus(null);
    }
  };

  const handleToggleLiveSession = () => {
    if (!isLiveSessionActive) {
      // Start live session
      setIsLiveSessionActive(true);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "Live voice session started. Speak now...",
        timestamp: new Date(),
        agentUsed: 'LIVE'
      }]);
      
      // TODO: Connect to WebSocket at ws://localhost:8000/ws/live-session
      // For now, just a placeholder
    } else {
      // Stop live session
      setIsLiveSessionActive(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "Live voice session ended.",
        timestamp: new Date(),
        agentUsed: 'LIVE'
      }]);
    }
  };

  const handleToggleVoiceMode = () => {
    setVoiceModeEnabled(!voiceModeEnabled);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <ChatInterface 
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendAudio={handleSendAudio}
        onToggleLiveSession={handleToggleLiveSession}
        isTyping={isTyping}
        agentStatus={agentStatus}
        voiceModeEnabled={voiceModeEnabled}
        isLiveSessionActive={isLiveSessionActive}
        onToggleVoiceMode={handleToggleVoiceMode}
      />
    </div>
  );
}