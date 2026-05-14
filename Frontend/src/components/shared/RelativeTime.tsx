"use client";
import { useEffect, useState } from "react";

/**
 * Renders a human-readable relative timestamp entirely on the client.
 * Renders a neutral placeholder on the server so SSR and the first client
 * paint agree, eliminating the hydration mismatch caused by Date.now().
 */
export function RelativeTime({
  date,
  className = "text-[9px] text-[#2a2a3e]",
}: {
  date: Date;
  className?: string;
}) {
  // Empty string on both server and first client render → no mismatch
  const [label, setLabel] = useState("");

  useEffect(() => {
    function compute() {
      const diff  = Date.now() - date.getTime();
      const mins  = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days  = Math.floor(diff / 86400000);
      if (mins < 1)   return "just now";
      if (mins < 60)  return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
    setLabel(compute());
    // Re-evaluate every minute so the label stays accurate
    const id = setInterval(() => setLabel(compute()), 60_000);
    return () => clearInterval(id);
  }, [date]);

  return <span className={className}>{label || "—"}</span>;
}
