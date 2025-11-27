"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, ShieldCheck, Trophy, Brain, Users, Globe, Clock, Layers } from 'lucide-react';
import ColorBends from './ColorBends';
import Testimonials from "./Testimonial"; // Assuming this path exists based on your snippet

export default function AboutUs() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background images for carousel
  const backgroundImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];

  // Auto-change background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-[#7C3AED]/30">
      
      {/* Global CSS for Dot Pattern */}
      <style jsx global>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#ffffff 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="relative h-[500px] lg:h-[600px] overflow-hidden flex items-center justify-center">
        {/* ColorBends Animated Background - Same as Hero.jsx */}
        <div className="absolute inset-0 z-0">
          <ColorBends
            colors={["#ff0066", "#9900ff", "#00ffee", "#ff3399"]}
            rotation={30}
            speed={0.15}
            scale={0.9}
            frequency={1.0}
            warpStrength={0.6}
            mouseInfluence={0.3}
            parallax={0.3}
            noise={0.005}
            transparent={false}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-[#050505]/20"></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 animate-fade-in-up">
             <span className="bg-[#6d28d9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(109,40,217,0.4)]">
               About Veritas
             </span>
             <span className="text-sm text-gray-300 font-medium">Truth Through Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Truth Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500">Technology</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Leading the fight against misinformation with cutting-edge AI technology. Real-time verification for a truthful digital world.
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT SECTION --- */}
      <section className="py-20 px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Side with Glow */}
            <div className="order-2 lg:order-1 relative group">
               <div className="absolute -inset-4 bg-[#7C3AED]/20 blur-3xl rounded-[3rem] -z-10 group-hover:bg-[#7C3AED]/30 transition-all duration-500" />
               <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[500px] lg:h-[600px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
                  <img
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60"
                    alt="Veritas AI Technology"
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Floating Badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#6d28d9] flex items-center justify-center text-white">
                          <Brain size={20} />
                      </div>
                      <div>
                          <div className="text-white font-bold">AI-Powered</div>
                          <div className="text-xs text-gray-400">Truth Verification Technology</div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                  Pioneering <span className="text-[#6d28d9]">AI-Powered</span> Truth Verification
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  Veritas stands at the forefront of combating misinformation through advanced AI technology. Our specialized agents work in real-time to detect, analyze, and verify information across digital platforms.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed">
                  With cutting-edge machine learning algorithms and natural language processing, we provide instant claim verification through our Chrome extension and web application, making truth accessible to everyone.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: "Accuracy Rate", value: "99.8%" },
                    { label: "Claims Verified", value: "10M+" },
                    { label: "Real-time", value: "24/7" },
                    { label: "Languages", value: "50+" }
                 ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center text-center hover:border-[#6d28d9]/30 transition-colors">
                        <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                 ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/contact">
                  <button className="w-full sm:w-auto px-8 py-3.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(109,40,217,0.3)] hover:shadow-[0_0_30px_rgba(109,40,217,0.5)]">
                    Get Started
                  </button>
                </Link>
                <Link href="/services">
                  <button className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all">
                    View Services
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- METHODOLOGY SECTION --- */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden bg-[#0A0A0A] border-y border-white/5">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             
             {/* Left Content */}
             <div className="space-y-10">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Our <span className="text-[#6d28d9]">Truth Verification</span><br/>Process
                </h2>
                
                <div className="space-y-8">
                   {[
                      { num: "01", title: "Real-time Analysis", desc: "Advanced NLP models analyze text context, sentiment, and linguistic patterns to identify potential misinformation with unprecedented accuracy." },
                      { num: "02", title: "Source Verification", desc: "Instantly cross-references claims with thousands of trusted sources and databases to provide immediate fact-checking results." },
                      { num: "03", title: "Continuous Learning", desc: "Machine learning system adapts to new misinformation patterns and evolving digital landscapes for better protection." }
                   ].map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#6d28d9] font-bold text-lg group-hover:bg-[#6d28d9] group-hover:text-white transition-all duration-300 shadow-lg">
                               {step.num}
                            </div>
                         </div>
                         <div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#6d28d9] transition-colors">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Right Image */}
             <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden border border-white/10 group">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Methodology"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                      <Layers size={32} className="text-white" />
                   </div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24 px-6 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-[#6d28d9]">Veritas</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Combining cutting-edge AI technology with unwavering commitment to accuracy and transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain />, title: "Advanced AI", desc: "State-of-the-art machine learning algorithms for unparalleled misinformation detection accuracy." },
              { icon: <ShieldCheck />, title: "Enterprise Security", desc: "Bank-level encryption ensuring your data remains private and protected at all times." },
              { icon: <Clock />, title: "Real-time Analysis", desc: "Lightning-fast claim verification with results delivered in milliseconds, not minutes." },
              { icon: <CheckCircle2 />, title: "99.8% Accuracy", desc: "Unmatched precision in detecting and verifying information claims across platforms." },
              { icon: <Globe />, title: "Global Coverage", desc: "Supporting 50+ languages with region-specific fact-checking capabilities worldwide." },
              { icon: <Trophy />, title: "Transparent Results", desc: "Clear explanations and source citations building trust through complete transparency." }
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 hover:border-[#6d28d9]/40 transition-all duration-300 hover:-translate-y-1">
                 <div className="w-12 h-12 rounded-xl bg-[#6d28d9]/10 flex items-center justify-center text-[#6d28d9] mb-6 group-hover:bg-[#6d28d9] group-hover:text-white transition-all shadow-lg">
                    {React.cloneElement(item.icon, { size: 24 })}
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#6d28d9] transition-colors">{item.title}</h3>
                 <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                 </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="relative z-10 border-t border-white/5 bg-[#050505]">
        <Testimonials />
      </section>

    </div>
  );
}