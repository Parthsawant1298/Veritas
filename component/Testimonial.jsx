"use client";
import React from 'react';
import { Play, Star, ShieldCheck, Quote } from 'lucide-react';

// --- Reusable Components ---

const VideoCard = ({ image, logo, company, tagColor, className = "" }) => (
  <div className={`relative group rounded-3xl overflow-hidden cursor-pointer min-h-[300px] border border-white/10 hover:border-[#7C3AED]/40 transition-all duration-500 ${className}`}>
    {/* Dot Pattern Overlay */}
    <div className="absolute inset-0 bg-dot-pattern opacity-[0.05] pointer-events-none z-10" />
    
    <img src={image} alt={company} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
    
    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
    
    {/* Play Button */}
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-[#7C3AED]/20 group-hover:border-[#7C3AED]/50 transition-all shadow-2xl">
        <Play className="w-6 h-6 text-white fill-white ml-1" />
      </div>
    </div>

    {/* Bottom Label */}
    <div className="absolute bottom-5 left-5 z-20 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-3 shadow-lg">
      {logo && (
        <div className={`w-8 h-8 ${tagColor} rounded-full flex items-center justify-center text-xs text-white font-bold shadow-inner`}>
          {logo}
        </div>
      )}
      <span className="text-white text-sm font-medium tracking-wide">{company}</span>
    </div>
  </div>
);

const ReviewCard = ({ avatar, name, role, text, stars, logo }) => (
  <div className="relative group bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl hover:border-[#7C3AED]/40 transition-all duration-300 h-fit overflow-hidden">
    {/* Dot Pattern Background */}
    <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
    
    <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
            {avatar && <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border border-white/10" />}
            {logo && (
                <div className="w-12 h-12 bg-[#1A1A1A] border border-white/5 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    <span className="bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">{logo}</span>
                </div>
            )}
            <div>
            {name && <h4 className="font-bold text-white text-sm tracking-wide">{name}</h4>}
            {role && <p className="text-gray-500 text-xs font-medium">{role}</p>}
            </div>
        </div>
        {stars && (
            <div className="flex gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" />
            ))}
            </div>
        )}
        </div>
        <p className="text-gray-400 text-sm leading-7 font-medium">
        "{text}"
        </p>
    </div>
  </div>
);

const QuoteCard = () => (
  <div className="relative bg-[#7C3AED] p-8 rounded-3xl shadow-[0_0_40px_rgba(124,58,237,0.15)] flex flex-col items-center justify-center text-center overflow-hidden min-h-[320px] group">
    {/* Dot Pattern Background (Lighter here) */}
    <div className="absolute inset-0 bg-dot-pattern opacity-[0.1] pointer-events-none" />
    
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

    <div className="relative z-10">
        <div className="mb-6 opacity-30 transform group-hover:scale-110 transition-transform duration-500">
             <Quote size={48} className="text-white fill-white" />
        </div>
        <p className="text-white text-xl font-medium leading-relaxed italic tracking-wide">
        "Veritas has completely transformed how we verify information. The real-time fact-checking is an essential tool for modern journalism."
        </p>
        <div className="mt-6 pt-6 border-t border-white/20 w-full flex justify-center">
            <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">Editor-in-Chief, Global News</span>
        </div>
    </div>
  </div>
);

// --- Main Component ---

const TestimonialSection = () => {
  return (
    <section className="bg-[#050505] py-16 px-6 md:px-12 font-sans text-white overflow-hidden">
      
      {/* CSS for the dot pattern */}
      <style jsx global>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#ffffff 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 pl-1.5 pr-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
              <span className="bg-[#6d28d9] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(109,40,217,0.4)] flex items-center justify-center">
                <ShieldCheck size={16} />
              </span>
              <span className="text-xl text-gray-300 font-medium">Testimonials</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-semibold leading-[1.2] tracking-tight mb-6 text-white">
            1,000+ Users Trust Veritas<br/>
            <span className="text-white/30">Join the Fight Against Misinformation</span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            See how journalists, researchers, and everyday users leverage Veritas to verify truth in real-time.
          </p>

        </div>

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1 */}
          <div className="space-y-6 flex flex-col">
            <VideoCard 
              image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              company="NewsHub Daily"
              logo="N"
              tagColor="bg-[#7C3AED]"
            />
            
            <ReviewCard 
              logo="V"
              stars={true}
              text="As a journalist, Veritas is my secret weapon. The Chrome extension works seamlessly while I browse, instantly flagging suspicious claims."
            />

            <ReviewCard 
              avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              name="David Martinez"
              role="Senior Editor"
              text="The AI-powered analysis is incredibly accurate. Veritas cross-references multiple sources instantly, something that would take our team hours to do manually."
            />
          </div>

          {/* Column 2 */}
          <div className="space-y-6 flex flex-col">
            <ReviewCard 
              avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              name="Sarah Chen"
              role="Research Analyst"
              text="Veritas has become essential for my research work. The detailed reports with source citations make it easy to verify claims."
            />

            <QuoteCard />

            <VideoCard 
              image="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              company="Global Media"
              logo="G"
              tagColor="bg-orange-500"
              className="flex-1" 
            />
          </div>

          {/* Column 3 */}
          <div className="space-y-6 flex flex-col">
            <ReviewCard 
              logo="T"
              stars={true}
              text="What impressed me most is the real-time detection. During election coverage, Veritas helped us fact-check statements live. The speed is unmatched."
            />

            <VideoCard 
              image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              company="Academic Research"
              logo="A"
              tagColor="bg-green-600"
            />

            <ReviewCard 
              avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              name="Michael Thompson"
              role="Content Creator"
              text="As someone who creates educational content, Veritas gives me confidence that I'm sharing accurate information. A game-changer."
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;