"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentAnalytics } from "@/types";
import { formatDuration, getEngagementColor } from "@/lib/mockData";

interface HeatmapOverlayProps {
  segments: SegmentAnalytics[];
  duration: number;
}

export function HeatmapOverlay({ segments, duration }: HeatmapOverlayProps) {
  const [hoveredSeg, setHoveredSeg] = useState<SegmentAnalytics | null>(null);
  const [tooltipX, setTooltipX] = useState(0);

  if (!duration || !segments.length) return null;

  const maxPlays = Math.max(...segments.map((s) => s.playCount));

  return (
    <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none">
      {/* Gradient fade */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(6,6,9,0.8) 0%, transparent 100%)" }} />

      {/* Heatmap bars */}
      <div className="absolute inset-0 flex items-end pointer-events-auto">
        {segments.map((seg) => {
          const left = (seg.startTime / duration) * 100;
          const width = ((seg.endTime - seg.startTime) / duration) * 100;
          const height = (seg.playCount / maxPlays) * 100;
          const color = getEngagementColor(seg.engagementScore);

          return (
            <div
              key={seg.segmentId}
              className="absolute bottom-0 heatmap-bar cursor-pointer"
              style={{ left: `${left}%`, width: `${width}%`, height: `${height}%` }}
              onMouseEnter={(e) => {
                setHoveredSeg(seg);
                const rect = e.currentTarget.closest(".heatmap-container")?.getBoundingClientRect();
                setTooltipX(e.clientX - (rect?.left ?? 0));
              }}
              onMouseLeave={() => setHoveredSeg(null)}
            >
              <div
                className="w-full h-full rounded-t-sm opacity-70"
                style={{ background: `linear-gradient(180deg, ${color}, ${color}44)` }}
              />
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredSeg && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-14 glass-elevated px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] pointer-events-none z-30 text-[10px] whitespace-nowrap"
            style={{ left: Math.max(4, tooltipX - 70) }}
          >
            <div className="font-mono text-[#8888aa] mb-1">
              {formatDuration(hoveredSeg.startTime)} – {formatDuration(hoveredSeg.endTime)}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-[#3a3a52]">Plays</span>
              <span className="text-[#e2e2f0] font-medium">{hoveredSeg.playCount.toLocaleString()}</span>
              <span className="text-[#3a3a52]">Replays</span>
              <span className="text-[#e2e2f0] font-medium">{hoveredSeg.replayCount.toLocaleString()}</span>
              <span className="text-[#3a3a52]">Skips</span>
              <span className="text-[#ff4d2e] font-medium">{hoveredSeg.skipCount}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
