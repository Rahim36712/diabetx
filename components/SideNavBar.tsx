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
    <aside className="w-64 fixed left-0 top-0 h-screen hidden md:flex flex-col justify-between z-40 bg-white border-r border-slate-200 p-5 select-none font-sans shadow-lg">
      {/* Top Logo & Identity */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-500 to-lime-600 flex items-center justify-center shadow-md shadow-lime-500/25 shrink-0 overflow-hidden">
            <svg
              className="w-6 h-6 text-white"
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
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 truncate">
              Diabet<span className="text-lime-600">X</span> AI
            </h1>
            <p className="text-[10px] text-lime-700 font-mono font-extrabold tracking-wide uppercase">
              Balanced Twin OS
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-2">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-lime-500/15 text-lime-800 border border-lime-500/30 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                      isActive ? "text-lime-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-px rounded-md font-extrabold uppercase leading-none shrink-0 ${
                      isActive
                        ? "bg-lime-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
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
      <div className="glass-card rounded-2xl p-4 border border-slate-200 space-y-2.5 bg-slate-50/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-xs font-mono font-extrabold text-lime-800">
              Twin Engine Active
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">v2.4</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-tight font-medium">
          Real-time cyber-physiological modeling & local AI synthesis.
        </p>
      </div>
    </aside>
  );
}
