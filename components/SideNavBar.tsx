"use client";

import React from "react";
import { useNav, type NavTab } from "@/context/NavContext";

export type { NavTab };

interface SideNavBarProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export default function SideNavBar({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
}: SideNavBarProps) {
  const nav = useNav();
  const currentTab = propActiveTab ?? nav.activeTab;
  const handleTabChange = propOnTabChange ?? nav.setActiveTab;

  const navItems: { id: NavTab; label: string; icon: string; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "digital_twin", label: "Digital Twin", icon: "boy", badge: "3D" },
    { id: "timeline", label: "Timeline", icon: "timeline" },
    { id: "simulator", label: "Simulator", icon: "tune" },
    { id: "ai_coach", label: "AI Coach", icon: "smart_toy", badge: "AI" },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen hidden md:flex flex-col justify-between z-40 bg-[#060B08]/90 backdrop-blur-2xl border-r border-white/10 p-5 select-none font-sans">
      {/* Top Logo & Identity */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-lime-500/25">
            <span className="material-symbols-filled text-[#060B08] text-[24px] font-bold">
              monitoring
            </span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white">
              Diabet<span className="text-lime-400">X</span> AI
            </h1>
            <p className="text-[10px] text-lime-400 font-mono font-semibold tracking-wide">
              Balanced Twin OS
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive =
              currentTab === item.id ||
              (item.id === "digital_twin" && currentTab === "twin") ||
              (item.id === "ai_coach" && currentTab === "aicoach");

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-lime-500/15 text-lime-400 border border-lime-500/30 shadow-md shadow-lime-500/10 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive ? "text-lime-400" : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-px rounded-md font-bold uppercase leading-none ${
                      isActive
                        ? "bg-lime-400/20 text-lime-300 border border-lime-400/30"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status Panel */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-lime-400">
              Twin Engine Active
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">v2.4</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-tight font-medium">
          Real-time cyber-physiological modeling & local AI synthesis.
        </p>
      </div>
    </aside>
  );
}
