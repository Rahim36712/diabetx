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
  const handleTabChange = propOnTabChange ?? nav.setActiveTab;

  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "digital_twin", label: "Twin", icon: "boy" },
    { id: "timeline", label: "Timeline", icon: "timeline" },
    { id: "simulator", label: "Simulator", icon: "tune" },
    { id: "ai_coach", label: "Coach", icon: "smart_toy" },
  ];

  return (
    <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-2.5 flex flex-col space-y-2 font-sans shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-lime-500 to-lime-600 flex items-center justify-center shadow-md shadow-lime-500/20 shrink-0 overflow-hidden">
            <svg
              className="w-5 h-5 text-white"
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
            <h1 className="font-display text-base font-bold tracking-tight text-slate-900">
              Diabet<span className="text-lime-600">X</span> AI
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-extrabold text-lime-800 bg-lime-500/15 px-2.5 py-1 rounded-full border border-lime-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-ping" />
            Live Engine
          </span>
        </div>
      </div>

      {/* Top Bar Interactive Quick Navigation Tabs */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
        {navItems.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.id === "digital_twin" && currentTab === "twin") ||
            (item.id === "ai_coach" && currentTab === "aicoach");

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-lime-500/20 text-lime-800 border border-lime-500/40 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
