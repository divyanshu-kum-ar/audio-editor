"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore } from "@/store/audioStore";

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  analytics: React.ReactNode;
}

export function DashboardLayout({ sidebar, main, analytics }: DashboardLayoutProps) {
  const { sidebarOpen, analyticsPanelOpen } = useAudioStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050508]">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow top-left */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #00e5ff, transparent 70%)" }} />
      {/* Ambient glow bottom-right */}
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #ff4d2e, transparent 70%)" }} />

      {/* Left Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 overflow-hidden h-full"
          >
            <div className="w-[280px] h-full">{sidebar}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main editor */}
      <motion.div layout className="flex-1 min-w-0 h-full overflow-hidden">
        {main}
      </motion.div>

      {/* Right analytics panel */}
      <AnimatePresence initial={false}>
        {analyticsPanelOpen && (
          <motion.div
            key="analytics"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 overflow-hidden h-full"
          >
            <div className="w-[320px] h-full">{analytics}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
