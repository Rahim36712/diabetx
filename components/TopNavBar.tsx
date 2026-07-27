"use client";

import React from "react";
import { useNav, type NavTab } from "@/context/NavContext";

interface TopNavBarProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export default function TopNavBar({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
}: TopNavBarProps) {
  const nav = useNav();
  const currentTab = propActiveTab ?? nav.activeTab;
  return (
    <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-[#0A0E1A]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md shadow-cyan-500/20">
          <span className="material-symbols-filled text-[#0A0E1A] text-[18px] font-bold">
            monitoring
          </span>
        </div>
        <div>
          <h1 className="font-display text-base font-bold tracking-tight text-[#dee2f6]">
            Diabet<span className="gradient-text">X</span> AI
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
    </header>
  );
}
