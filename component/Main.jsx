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

  // 1. Initial Load: Instant jump to bottom to prevent "scroll up" glitch
  useEffect(() => {
    // Small timeout ensures DOM is ready
    const timer = setTimeout(() => {
      scrollToBottom("auto");
      isFirstRender.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 2. New Messages: Smooth scroll when chat updates
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

  // Legacy Record Logic
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
    // MAIN CONTAINER: Uses Flex Column to stack Header, Messages, and Input naturally
    <div className="flex flex-col w-full bg-[#050505] relative font-sans text-white overflow-hidden border-t border-white/10 md:border md:rounded-2xl md:mx-4 md:mb-4 h-[calc(100dvh-64px)] md:h-[calc(100vh-120px)] mt-16 md:mt-24">
      
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{
             backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }} 
      />

      {/* --- 1. HEADER (Flex Item) --- */}
      <div className="flex-none bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center">
           <p className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium flex items-center gap-2 uppercase tracking-wider">
             <span className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
             {isLiveSessionActive ? 'LIVE SESSION' : isRecordingLegacy ? 'RECORDING...' : 'ONLINE'}
           </p>
        </div>

        <button 
          onClick={onToggleVoiceMode}
          disabled={isMicActive}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
            voiceModeEnabled 
            ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.2)]' 
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          } ${isMicActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {voiceModeEnabled ? <Activity size={14} /> : <Bot size={14} />}
          {voiceModeEnabled ? 'Voice Mode' : 'Text Mode'}
        </button>
      </div>

      {/* --- 2. MESSAGES FEED (Flex Grow - This scrolls) --- */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
            
            {/* Agent-to-Agent Visual */}
            {msg.sender === 'agent-to-agent' && (
               <div className="w-full flex justify-center my-6">
                 <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 max-w-sm w-full flex flex-col gap-2 relative overflow-hidden group hover:border-[#7C3AED]/30 transition-colors">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#7C3AED]"></div>
                   <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">
                     <span className="flex items-center gap-1"><Terminal size={10} /> Protocol</span>
                     <span className="text-[#7C3AED] flex items-center gap-1 animate-pulse">Syncing...</span>
                   </div>
                   <p className="text-xs text-gray-300 font-mono leading-relaxed break-all">
                     <span className="text-[#7C3AED] mr-2">&gt;</span>{msg.text}
                   </p>
                 </div>
               </div>
            )}

            {/* Chat Bubbles */}
            {(msg.sender === 'user' || msg.sender === 'bot') && (
              <div className={`max-w-[90%] sm:max-w-[75%] relative group ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}>
                {/* Agent Label */}
                {msg.agentUsed && msg.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2 ml-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        msg.agentUsed === 'CHECKER' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 
                        'bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#7C3AED]'
                      }`}>
                        {msg.agentUsed}
                      </span>
                      {msg.metadata?.isReal !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          msg.metadata.isReal 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {msg.metadata.isReal ? 'VERIFIED' : 'FLAGGED'}
                        </span>
                      )}
                  </div>
                )}
                
                <div className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-lg backdrop-blur-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#7C3AED] text-white rounded-br-none shadow-[0_5px_15px_rgba(124,58,237,0.2)]' 
                    : 'bg-[#1A1A1A] border border-white/10 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.text}
                  
                  {/* Sources */}
                  {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified Sources:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.metadata.sources.map((src, i) => (
                           <div key={i} className="bg-black/40 px-2 py-1 rounded-md border border-white/5 text-[10px] text-gray-300 truncate max-w-[150px]">
                             {src}
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Time */}
                <span className="text-[10px] text-gray-600 font-medium mt-1.5 block opacity-0 group-hover:opacity-100 transition-opacity px-1">
                  {msg.timestamp ? (() => {
                    const date = new Date(msg.timestamp);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                  })() : ''}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {(isTyping || agentStatus || isLiveSessionActive) && (
           <div className="flex justify-start w-full animate-fade-in-up">
             <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-lg">
               <div className="relative w-4 h-4">
                 <span className={`absolute w-full h-full rounded-full border-2 opacity-20 ${isLiveSessionActive ? 'border-red-500' : 'border-[#7C3AED]'}`}></span>
                 <span className={`absolute w-full h-full rounded-full border-t-2 animate-spin ${isLiveSessionActive ? 'border-red-500' : 'border-[#7C3AED]'}`}></span>
               </div>
               <span className={`text-xs font-mono font-medium animate-pulse ${isLiveSessionActive ? 'text-red-400' : 'text-[#7C3AED]'}`}>
                 {isLiveSessionActive ? (agentStatus || "Listening...") : (agentStatus || "Processing...")}
               </span>
             </div>
           </div>
        )}
        
        {/* Scroll Anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* --- 3. INPUT AREA (Flex Item) --- */}
      <div className="flex-none bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 p-3 sm:p-5 z-40">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2 sm:gap-4">
          
          {/* Mic Button */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isTyping && !isLiveSessionActive}
            className={`relative p-3 sm:p-4 rounded-xl shadow-lg transition-all active:scale-95 border ${
              isMicActive
                ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' 
                : voiceModeEnabled 
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/50 hover:bg-[#7C3AED]/20 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : 'bg-[#1A1A1A] text-gray-400 hover:text-white border-white/10 hover:border-white/20'
            } ${isTyping && !isLiveSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isMicActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            )}
            {isMicActive ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/50 transition-all shadow-inner"
              placeholder={isLiveSessionActive ? "Listening..." : voiceModeEnabled ? "Tap Mic to Speak" : "Type a claim to verify..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isMicActive}
            />
          </div>

          {/* Send Button */}
          <button 
            type="submit" 
            disabled={!inputText.trim() || isTyping || isMicActive}
            className="p-3 sm:p-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 disabled:shadow-none"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- 2. The Main Page Logic ---
export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
        id: 1,
        sender: 'bot',
        text: 'I am ready to verify information. What claim would you like me to check today?',
        timestamp: null, // Will be set on client mount
        agentUsed: 'SYSTEM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);

  // Set initial timestamp on client mount to avoid hydration mismatch
  useEffect(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === 1 && !msg.timestamp 
        ? { ...msg, timestamp: new Date() }
        : msg
    ));
  }, []);

  const handleSendMessage = async (text) => {
    const userMsg = { id: Date.now(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    setIsTyping(true);
    setAgentStatus("Analyzing claim...");

    setTimeout(() => {
        const botResponse = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `I've analyzed your claim: "${text}". Based on cross-referencing multiple sources, this information appears to be accurate.`,
            timestamp: new Date(),
            agentUsed: 'CHECKER',
            metadata: {
                isReal: true,
                sources: ['reuters.com', 'apnews.com']
            }
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        setAgentStatus(null);
    }, 2000);
  };

  const handleSendAudio = (base64Audio, mimeType) => {
    console.log("Audio sent:", mimeType);
    setIsTyping(true);
    setAgentStatus("Transcribing audio...");
    setTimeout(() => {
        handleSendMessage("This is a simulated transcription of the audio recording.");
    }, 1500);
  };

  const handleToggleLiveSession = () => {
    setIsLiveSessionActive(!isLiveSessionActive);
    if (!isLiveSessionActive) {
        setAgentStatus("Connecting...");
    } else {
        setAgentStatus(null);
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