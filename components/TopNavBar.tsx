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
    <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-[#060A07]/95 backdrop-blur-xl border-b border-white/15 px-4 py-3 flex items-center justify-between font-sans">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center shadow-md shadow-lime-500/30 shrink-0 overflow-hidden">
          <svg
            className="w-5 h-5 text-[#060A07]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-base font-bold tracking-tight text-white">
            Diabet<span className="text-lime-400">X</span> AI
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-extrabold text-lime-300 bg-lime-400/20 px-2.5 py-1 rounded-full border border-lime-400/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          Live Engine
        </span>
      </div>
    </header>
  );
}
