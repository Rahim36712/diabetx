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
    <aside className="w-64 fixed left-0 top-0 h-screen hidden md:flex flex-col justify-between z-40 bg-[#0A0E1A]/85 backdrop-blur-2xl border-r border-white/10 p-5 select-none">
      {/* Top Logo & Identity */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="material-symbols-filled text-[#0A0E1A] text-[24px] font-bold">
              monitoring
            </span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#dee2f6]">
              Diabet<span className="gradient-text">X</span> AI
            </h1>
            <p className="text-[10px] text-[#22D3EE] font-mono font-semibold tracking-wide">
              Balanced Twin OS
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94a3b8] px-3 pb-2">
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
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10 font-semibold"
                    : "text-[#94a3b8] hover:text-[#dee2f6] hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive ? "text-cyan-400" : "text-[#94a3b8] group-hover:text-[#dee2f6]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                        : "bg-white/5 text-[#94a3b8]"
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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400">
              Twin Engine Active
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#94a3b8]">v2.4</span>
        </div>
        <p className="text-[11px] text-[#94a3b8] leading-tight">
          Real-time cyber-physiological modeling & local AI synthesis.
        </p>
      </div>
    </aside>
  );
}
