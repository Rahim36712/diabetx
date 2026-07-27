"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full md:w-[calc(100%-16rem)] md:ml-64 bg-[#050811]/90 backdrop-blur-md border-t border-white/10 py-8 px-4 md:px-8 text-center mt-12 text-xs text-[#94a3b8]">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="font-display font-bold text-base text-[#dee2f6] flex items-center justify-center gap-2">
          <span>Diabet<span className="gradient-text">X</span> AI</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Digital Twin v2.4
          </span>
        </div>
        <p className="max-w-2xl mx-auto leading-relaxed font-medium">
          Educational digital twin self-management platform. Grounded in deterministic physiology algorithms & AI synthesis. Not medical advice or treatment. Consult a physician for clinical decisions.
        </p>
        <div className="text-[11px] font-mono text-[#94a3b8]/60 pt-1">
          © {new Date().getFullYear()} DiabetX Health Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
