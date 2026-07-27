"use client";

import React, { createContext, useContext, useState } from "react";

export type NavTab =
  | "dashboard"
  | "digital_twin"
  | "timeline"
  | "simulator"
  | "ai_coach"
  | "twin"
  | "aicoach";

interface NavContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const NavContext = createContext<NavContextType>({
  activeTab: "dashboard",
  setActiveTab: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  return (
    <NavContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
