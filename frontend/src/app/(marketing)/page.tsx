"use client";

import Link from "next/link";
import { ArrowRight, Shield, Globe, Lock, BrainCircuit, Users, FileText, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="bg-white dark:bg-[#10141a] text-gray-900 dark:text-[#dfe2eb] font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1p47P8ikqcvudpPBZVnV0-zjKrOfTp6mseBi82TAudE5z93diNenqTPnqVQPUL49ickBfJ1TcvJSc13rSMWNrtYJ0ZG-KxZLJH32gb65kTZM7QSdYO4A4rOHr75tQeT75pB8eh-p7ZqaE_wP-CO9I_rNTcjAmk52ZdgBSR4rMsj2ZTZkC7h6w4cZTrrU2mW3ktuku8ewKqlQzszoP-QA9mM4ER4fXQgjx9hx7RinMTNjapaeiWbTtIHN4KDvpb6RIlp7z5DLgucU" 
            alt="Merchant vessel bridge" 
            className="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-normal" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/70 dark:from-[#10141a] via-white/30 dark:via-transparent to-transparent dark:to-[#353940]/20"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="bg-white/70 dark:bg-[#181c22]/70 backdrop-blur-xl border border-gray-200 dark:border-[#dfe2eb]/10 max-w-5xl mx-auto p-12 md:p-20 rounded-[2rem] shadow-2xl dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
            <h1 className="font-extrabold text-5xl md:text-7xl tracking-tight mb-6 leading-tight">
                The New Standard in <br className="hidden md:block"/>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#00daf3] dark:to-[#0092a3] bg-clip-text text-transparent">Maritime Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-[#c5c6d0] max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                Empowering Merchant Navy officers with a unified knowledge base and secure operations platform for the digital era.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#00daf3] dark:to-[#0092a3] text-white dark:text-[#00363d] text-lg font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-[#00daf3]/20 transition-all w-full sm:w-auto text-center">
                    Join the Fleet
                </Link>
                <a href="#features" className="border border-gray-300 dark:border-[#44474f]/30 text-blue-600 dark:text-[#00daf3] text-lg font-bold px-10 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#262a31] transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                    Explore Platform
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem */}
      <section className="py-24 bg-gray-50 dark:bg-[#181c22]">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                    <h2 className="text-lg font-bold tracking-widest uppercase text-blue-600 dark:text-[#00daf3] drop-shadow-sm">The Navigation Gap</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-[#dfe2eb] leading-tight">Fragility in traditional maritime systems.</h3>
                    <p className="text-xl text-gray-600 dark:text-[#c5c6d0] leading-relaxed">
                        Maritime knowledge is currently siloed across physical manuals, disconnected local drives, and legacy software that hasn't evolved in decades. This fragmentation leads to operational delays, increased risk, and a critical lack of situational awareness.
                    </p>
                    <div className="grid grid-cols-2 gap-8 pt-4">
                        <div className="border-l-4 border-blue-600 dark:border-[#00daf3] pl-6">
                            <span className="block text-4xl font-black text-gray-900 dark:text-[#dfe2eb]">40%</span>
                            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#c5c6d0]">Information Lag</span>
                        </div>
                        <div className="border-l-4 border-indigo-500 dark:border-[#e9c176] pl-6">
                            <span className="block text-4xl font-black text-gray-900 dark:text-[#dfe2eb]">65%</span>
                            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#c5c6d0]">Manual Overhead</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white dark:bg-[#262a31] p-4 border border-gray-200 dark:border-[#44474f]/10 shadow-xl">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCChOj2n-Au9HvmRBPRWuSghM6rpxveNbGHZaw5zxVrSUy8gYnHFah1kxZ1PA3HIw0QART6je1T7L0uNjzIESuWleHX1pt1ZIZwofc14BPDkkWRRQptzM8SSZrZF5CoszcVuHGEaMWJIu2ohPEPXoFklaC0uw_HjdRmLTE3GaLcbrwURoCrkKVOa-aVChx7Ill9rsmO29nOxZH4uSsDV5ZSjk3b67xiCj6o4h4nGTxsnzniY4Nl1MW_AwCUzDduynFijDag6d3t_Cg" 
                          alt="Container Ship Overview" 
                          className="w-full h-full object-cover rounded-[1.5rem] grayscale hover:grayscale-0 transition-all duration-700" 
                        />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. Feature Cards */}
      <section id="features" className="py-32 bg-white dark:bg-[#10141a] relative">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="text-center mb-20 shadow-sm border-gray-900 border-none">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-[#dfe2eb] mb-6">Precision Navigational Tools</h2>
                <p className="text-xl text-gray-600 dark:text-[#c5c6d0] max-w-2xl mx-auto">Integrated systems designed for high-stakes maritime environments.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Forum */}
                <div className="bg-gray-50 dark:bg-[#181c22]/80 backdrop-blur border border-gray-200 dark:border-[#dfe2eb]/10 p-10 rounded-[2rem] group hover:border-blue-500/30 dark:hover:border-[#00daf3]/30 transition-all duration-500 hover:shadow-xl dark:hover:shadow-[#00daf3]/5">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-[#002126] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Users className="text-blue-600 dark:text-[#00daf3] h-8 w-8" />
                    </div>
                    <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-[#dfe2eb]">Officer's Forum</h4>
                    <p className="text-gray-600 dark:text-[#c5c6d0] leading-relaxed mb-8 h-24">
                        A global community of certified maritime professionals sharing real-time insights and operational best practices.
                    </p>
                    <Link href="/forum" className="text-blue-600 dark:text-[#00daf3] font-bold uppercase text-xs tracking-widest flex items-center gap-2 group/link">
                        Explore Community
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* AI Chatbot */}
                <div className="bg-gray-50 dark:bg-[#181c22]/80 backdrop-blur border-t-4 border-blue-600 dark:border-[#00daf3] p-10 rounded-[2rem] group hover:-translate-y-2 hover:border-blue-500 dark:hover:border-[#00daf3] transition-all duration-500 shadow-lg dark:hover:shadow-[#00daf3]/10 relative transform md:-translate-y-4 md:hover:-translate-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-[#00daf3] dark:to-[#0092a3] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/30">
                        <BrainCircuit className="text-white dark:text-[#00363d] h-8 w-8" />
                    </div>
                    <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-[#dfe2eb]">Operational AI</h4>
                    <p className="text-gray-600 dark:text-[#c5c6d0] leading-relaxed mb-8 h-24">
                        Get instant answers to complex regulatory queries and technical procedures with our maritime-trained LLM.
                    </p>
                    <Link href="/chat" className="text-blue-600 dark:text-[#00daf3] font-bold uppercase text-xs tracking-widest flex items-center gap-2 group/link">
                        Consult Co-Pilot
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Vault */}
                <div className="bg-gray-50 dark:bg-[#181c22]/80 backdrop-blur border border-gray-200 dark:border-[#dfe2eb]/10 p-10 rounded-[2rem] group hover:border-blue-500/30 dark:hover:border-[#00daf3]/30 transition-all duration-500 hover:shadow-xl dark:hover:shadow-[#00daf3]/5">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-[#002126] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <FileText className="text-blue-600 dark:text-[#00daf3] h-8 w-8" />
                    </div>
                    <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-[#dfe2eb]">Document Vault</h4>
                    <p className="text-gray-600 dark:text-[#c5c6d0] leading-relaxed mb-8 h-24">
                        A secure, offline-first repository for all essential ship documentation and technical manuals.
                    </p>
                    <Link href="/vault" className="text-blue-600 dark:text-[#00daf3] font-bold uppercase text-xs tracking-widest flex items-center gap-2 group/link">
                        Open Archive
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Security/Trust section */}
      <section className="py-24 bg-gray-100 dark:bg-[#0a0e14] border-y border-gray-200 dark:border-[#44474f]/20">
        <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center">
                <Shield className="text-blue-600 dark:text-[#e9c176] h-16 w-16 mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-[#dfe2eb] mb-8">Built for Command-Level Security</h2>
                <p className="text-xl text-gray-600 dark:text-[#c5c6d0] mb-16 max-w-3xl mx-auto leading-relaxed">
                    Data integrity is our North Star. M-Navy operates with the highest grade of encryption and compliance protocols to ensure operational confidentiality.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {[
                      { icon: Lock, label: "ISO/IEC 27001", sub: "Certified Protocol" },
                      { icon: Shield, label: "AES-256", sub: "Encryption Standard" },
                      { icon: Globe, label: "GDPR READY", sub: "Privacy First" },
                      { icon: CheckCircle2, label: "SOC2 TYPE II", sub: "Ongoing Compliance" },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                          <div className="h-16 w-full bg-white dark:bg-[#262a31] rounded-xl flex items-center justify-center border border-gray-200 dark:border-[#44474f]/30 mb-4 shadow-sm">
                              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.label}</span>
                          </div>
                          <span className="text-xs uppercase font-bold tracking-widest text-gray-500 dark:text-[#c5c6d0]">{item.sub}</span>
                      </div>
                    ))}
                </div>
            </div>
        </div>
      </section>
      
      {/* 5. CTA Section */}
      <section className="py-24 md:py-32 bg-white dark:bg-[#10141a]">
        <div className="container mx-auto px-6 max-w-6xl">
            <div className="bg-gray-50 dark:bg-[#262a31]/80 rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center border border-gray-200 dark:border-[#00daf3]/20 shadow-2xl">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-[#dfe2eb] mb-8 leading-tight">Ready to upgrade your vessel's IQ?</h2>
                    <p className="text-xl text-gray-600 dark:text-[#c5c6d0] mb-12">Join thousands of maritime professionals redefining excellence at sea.</p>
                    <Link href="/login" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#00daf3] dark:to-[#0092a3] text-white dark:text-[#00363d] text-xl font-bold px-12 py-5 rounded-xl transition-all hover:scale-105 shadow-xl hover:shadow-blue-500/50 dark:hover:shadow-[#00daf3]/40">
                        Request Fleet Access
                    </Link>
                </div>
            </div>
        </div>
      </section>

    </main>
  );
}
