
import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { collapsed } = useSidebar();
  
  return (
    <aside 
      data-collapsed={collapsed}
      className={cn(
        "group h-screen fixed left-0 top-0 z-30 flex w-[280px] flex-col border-r bg-gradient-to-b from-indigo-700 to-purple-800 text-white transition-all",
        collapsed && "w-[80px]",
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <header className={cn("px-6 py-5", className)}>
      {children}
    </header>
  );
}

export function SidebarContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <footer className={cn("p-4 border-t border-indigo-600/30", className)}>
      {children}
    </footer>
  );
}

export function SidebarTrigger() {
  const { toggleCollapsed } = useSidebar();
  
  return (
    <button 
      onClick={toggleCollapsed} 
      className="h-9 w-9 rounded-md bg-transparent hover:bg-indigo-100/10 flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 5h18M3 12h18M3 19h18" />
      </svg>
    </button>
  );
}
