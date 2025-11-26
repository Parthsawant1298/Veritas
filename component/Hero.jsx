"use client";
import React from 'react';
import { Command, Layout, Type, Image as ImageIcon, MousePointer2, Plus } from 'lucide-react';
import ColorBends from './ColorBends';
import CurvedLogoLoop from './CurvedLogoLoop';

export default function Hero() {
  const logoElements = [
    <path d="M3.89 15.672L6.255.461A.542.542 0 017.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 00-.96 0L3.53 17.984z"/>,
    <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>,
    <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>,
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>,
    <>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </>,
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  ];

  const loopedLogos = [...logoElements, ...logoElements, ...logoElements];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start pt-32 pb-12 overflow-hidden bg-[#050505]">
      
      {/* ColorBends Animated Background */}
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={["#ff0066", "#9900ff", "#00ffee", "#ff3399"]}
          rotation={30}
          speed={0.5}
          scale={0.9}
          frequency={1.8}
          warpStrength={1.5}
          mouseInfluence={1.0}
          parallax={0.8}
          noise={0.03}
          transparent={false}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-[#050505]/20"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
            <span className="bg-[#6d28d9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(109,40,217,0.4)]">
              v1.0
            </span>
            <span className="text-sm text-gray-300">Real-time Truth Assessment</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.15] mb-6 text-white">
          <span className="block text-gray-100">Truth Through</span>
          <span className="block bg-gradient-to-b from-white via-gray-200 to-gray-500 text-transparent bg-clip-text pb-2">
            Technology.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
          Real-time misinformation detection powered by specialized AI agents. <br className="hidden md:block" />
          Chrome extension + web app for instant claim verification.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <button className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 hover:bg-white text-black rounded-lg font-medium transition-colors duration-200">
            Get Started
          </button>
          
          <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-white rounded-lg font-medium backdrop-blur-md transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            View Documentation
          </button>
        </div>

        {/* --- NEW DASHBOARD MOCKUP (The "Rectangle") --- */}
        <div className="relative w-full max-w-6xl mx-auto perspective-[2000px] group mb-24">
           {/* Glow Effect */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] bg-purple-600/30 blur-[100px] rounded-full -z-10 pointer-events-none transition-all duration-1000 group-hover:bg-purple-600/40"></div>
           
           {/* The Window Frame */}
           <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl transform rotate-x-12 transition-transform duration-700 ease-out group-hover:rotate-x-0 origin-bottom">
              
              {/* Toolbar */}
              <div className="h-12 bg-[#121212] border-b border-white/5 flex items-center px-4 justify-between">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                 </div>
                 <div className="flex-1 flex justify-center">
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-md px-3 py-1 text-xs text-gray-500 flex items-center gap-2 w-64 justify-center">
                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                       veritas.com
                    </div>
                 </div>
                 <div className="w-16"></div>
              </div>

              {/* Content Area - Split View */}
              <div className="flex h-[500px] md:h-[600px] relative">
                 
                 {/* Sidebar (Hidden on mobile) */}
                 <div className="hidden md:flex w-64 border-r border-white/5 flex-col bg-[#0D0D0D] p-4 gap-6">
                    <div className="flex items-center gap-2 text-white/80 font-semibold text-sm mb-2">
                       <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">V</div>
                       Veritas
                    </div>
                    
                    <div className="space-y-1">
                       <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Tools</div>
                       {['Dashboard', 'Verification', 'Reports', 'Settings'].map((item, i) => (
                          <div key={i} className={`px-2 py-1.5 rounded-md text-sm cursor-pointer flex items-center gap-3 ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-purple-500' : 'bg-transparent'}`}></div>
                             {item}
                          </div>
                       ))}
                    </div>

                    <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/5">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full"></div>
                          <div>
                             <div className="text-xs font-bold text-white">Pro Plan</div>
                             <div className="text-[10px] text-gray-400">Active</div>
                          </div>
                       </div>
                       <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-purple-500"></div>
                       </div>
                    </div>
                 </div>

                 {/* Main Canvas */}
                 <div className="flex-1 bg-black relative overflow-hidden p-8 md:p-16 flex flex-col justify-center items-center text-center">
                    {/* Background Gradients inside canvas */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    {/* Fake Hero Content */}
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 mb-6">
                           Real-time AI Verification
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                           Advanced Misinformation Detection powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Veritas AI</span>
                        </h2>
                        
                        {/* App Icons Grid */}
                        <div className="flex items-center justify-center gap-4 mt-10">
                           {[1,2,3,4,5].map((_, i) => (
                              <div key={i} className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-110 duration-200 cursor-pointer">
                                 <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-700 to-black opacity-50"></div>
                              </div>
                           ))}
                           <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer hover:border-white/40">
                              <Plus size={20} />
                           </div>
                        </div>
                    </div>

                    {/* Floating Elements simulating a design tool */}
                    <div className="absolute top-8 right-8 bg-[#1A1A1A] border border-white/10 rounded-lg p-2 shadow-xl hidden lg:block">
                        <div className="flex gap-2">
                           <div className="p-2 hover:bg-white/10 rounded"><MousePointer2 size={16} className="text-white" /></div>
                           <div className="p-2 hover:bg-white/10 rounded"><Type size={16} className="text-gray-400" /></div>
                           <div className="p-2 hover:bg-white/10 rounded"><Layout size={16} className="text-gray-400" /></div>
                           <div className="p-2 hover:bg-white/10 rounded"><ImageIcon size={16} className="text-gray-400" /></div>
                        </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>

      </div>

      {/* Curved Logo Loop */}
      <div className="relative z-10 w-full mx-auto overflow-hidden mb-8">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none"></div>
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none"></div>
        
        <CurvedLogoLoop logos={loopedLogos} />
      </div>
      
    </div>
  );
}