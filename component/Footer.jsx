"use client";
import React from 'react';
import { Twitter, Github, Linkedin, Instagram, ArrowRight, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-20 pb-10 px-6 md:px-12 font-sans text-white relative overflow-hidden">
      
       {/* CSS for Dot Pattern */}
       <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#ffffff 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#7C3AED]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- TOP CTA SECTION --- */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-20 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
           <div className="absolute right-0 top-0 w-64 h-64 bg-[#7C3AED]/10 blur-[80px] rounded-full pointer-events-none" />

           <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to verify the truth?</h2>
              <p className="text-gray-400">Join thousands of users using Veritas today.</p>
           </div>

           <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#7C3AED]/25 hover:-translate-y-1">
                 Get Started Now
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-bold transition-all">
                 Contact Sales
              </button>
           </div>
        </div>

        {/* --- MAIN FOOTER LINKS --- */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 mb-16">
           
           {/* Brand Column */}
           <div className="col-span-2 md:col-span-4 space-y-6">
              <div className="flex items-center gap-2 text-2xl font-bold">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                    <Zap size={18} className="text-white fill-white" />
                  </div>
                  Veritas
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                 The world's leading AI-powered verification platform. We help you separate fact from fiction in real-time.
              </p>
              <div className="flex gap-4">
                 <a href="#" className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#7C3AED] hover:bg-[#7C3AED] transition-all duration-300">
                    <Twitter size={18} />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#7C3AED] hover:bg-[#7C3AED] transition-all duration-300">
                    <Github size={18} />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#7C3AED] hover:bg-[#7C3AED] transition-all duration-300">
                    <Linkedin size={18} />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#7C3AED] hover:bg-[#7C3AED] transition-all duration-300">
                    <Instagram size={18} />
                 </a>
              </div>
           </div>

           {/* Links Column 1 */}
           <div className="col-span-1 md:col-span-2 space-y-6">
              <h4 className="text-white font-bold">Product</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Features</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Integrations</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Pricing</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Changelog</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Docs</a></li>
              </ul>
           </div>

           {/* Links Column 2 */}
           <div className="col-span-1 md:col-span-2 space-y-6">
              <h4 className="text-white font-bold">Company</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">About Us</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Careers</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Blog</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Contact</a></li>
                 <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Partners</a></li>
              </ul>
           </div>

           {/* Newsletter Column */}
           <div className="col-span-2 md:col-span-4 space-y-6">
              <h4 className="text-white font-bold">Stay Updated</h4>
              <p className="text-gray-400 text-sm">Subscribe to our newsletter for the latest AI updates.</p>
              <form className="relative">
                 <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
                 />
                 <button className="absolute right-1.5 top-1.5 p-1.5 bg-[#7C3AED] rounded-lg text-white hover:bg-[#6D28D9] transition-colors">
                    <ArrowRight size={16} />
                 </button>
              </form>
           </div>
        </div>

        {/* --- COPYRIGHT --- */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-gray-500 text-sm">
              &copy; 2024 Veritas AI Inc. All rights reserved.
           </p>
           <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
           </div>
        </div>

      </div>
    </footer>
  );
}