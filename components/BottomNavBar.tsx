"use client";

import React from "react";
import { useNav, type NavTab } from "@/context/NavContext";

interface BottomNavBarProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export default function BottomNavBar({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
}: BottomNavBarProps) {
  const nav = useNav();
  const currentTab = propActiveTab ?? nav.activeTab;
  const handleTabChange = propOnTabChange ?? nav.setActiveTab;

  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "digital_twin", label: "Twin", icon: "boy" },
    { id: "timeline", label: "Timeline", icon: "timeline" },
    { id: "simulator", label: "Simulator", icon: "tune" },
    { id: "ai_coach", label: "AI Coach", icon: "smart_toy" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#060B08]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around select-none font-sans">
      {navItems.map((item) => {
        const isActive =
          currentTab === item.id ||
          (item.id === "digital_twin" && currentTab === "twin") ||
          (item.id === "ai_coach" && currentTab === "aicoach");

        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "text-lime-400 font-bold scale-105"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                isActive ? "text-lime-400" : "text-slate-400"
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
