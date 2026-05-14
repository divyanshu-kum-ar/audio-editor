"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore } from "@/store/audioStore";
import { formatDuration, EMPTY_STATE_BARS, LOADING_BARS } from "@/lib/mockData";
import { HeatmapOverlay } from "./HeatmapOverlay";

interface WaveformPlayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  wavesurfer: { zoom: (v: number) => void };
}

export function WaveformPlayer({ containerRef, wavesurfer }: WaveformPlayerProps) {
  const { currentFile, playbackState, editorState, analytics, updateEditorState } = useAudioStore();
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX]       = useState(0);
  // Client-only width so tooltip clamping never mismatches SSR
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? 800);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [containerRef]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorState.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    setHoverTime(progress * editorState.duration);
    setHoverX(x);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Timeline ruler */}
      <div className="flex-shrink-0 h-7 border-b border-[#1e1e2e] relative overflow-hidden bg-[#0a0a0f]">
        <TimelineRuler duration={editorState.duration} />
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[#1e1e2e] bg-[#08080f] flex-shrink-0">
        <span className="text-[9px] font-mono text-[#2a2a3e] uppercase tracking-widest">Zoom</span>
        {[0.5, 1, 2, 4, 8].map((z) => (
          <button
            key={z}
            onClick={() => {
              updateEditorState({ zoom: z });
              wavesurfer.zoom(z * 50);
            }}
            className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
              editorState.zoom === z
                ? "bg-[rgba(0,229,255,0.15)] text-[#00e5ff] border border-[rgba(0,229,255,0.3)]"
                : "text-[#3a3a52] hover:text-[#8888aa] hover:bg-[#1e1e2e] border border-transparent"
            }`}
          >
            {z}×
          </button>
        ))}
        <div className="ml-auto text-[10px] font-mono text-[#3a3a52]">
          {formatDuration(editorState.currentTime)} / {formatDuration(editorState.duration)}
        </div>
      </div>

      {/* Main waveform canvas */}
      <div
        className="flex-1 relative overflow-hidden bg-[#060609] cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        {!currentFile ? (
          <EmptyState />
        ) : playbackState === "loading" ? (
          <LoadingState />
        ) : (
          <>
            {/* Heatmap overlay */}
            {analytics && (
              <HeatmapOverlay
                segments={analytics.segments}
                duration={editorState.duration}
              />
            )}

            {/* Wavesurfer container */}
            <div className="absolute inset-0 flex items-center px-2">
              <div
                ref={containerRef as React.RefObject<HTMLDivElement>}
                id="waveform"
                className="w-full"
                style={{ minHeight: 96 }}
              />
            </div>

            {/* Center line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[rgba(255,255,255,0.03)] pointer-events-none" />

            {/* Hover tooltip — clamped with client-measured width */}
            <AnimatePresence>
              {hoverTime !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-2 pointer-events-none z-20"
                  style={{ left: Math.max(0, Math.min(hoverX, containerWidth - 60)) }}
                >
                  <div className="glass-elevated px-2 py-1 rounded text-[10px] font-mono text-[#00e5ff] border border-[rgba(0,229,255,0.2)] whitespace-nowrap">
                    {formatDuration(hoverTime)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected region overlay */}
            {editorState.selectedRegion && editorState.duration > 0 && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10"
                style={{
                  left:  `${(editorState.selectedRegion.start / editorState.duration) * 100}%`,
                  width: `${((editorState.selectedRegion.end - editorState.selectedRegion.start) / editorState.duration) * 100}%`,
                  background:  "rgba(0,229,255,0.08)",
                  borderLeft:  "2px solid rgba(0,229,255,0.5)",
                  borderRight: "2px solid rgba(0,229,255,0.5)",
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TimelineRuler — pure deterministic math, no random values
// ---------------------------------------------------------------------------
function TimelineRuler({ duration }: { duration: number }) {
  if (!duration) return null;
  const count   = Math.min(Math.floor(duration / 10), 40);
  const markers = Array.from({ length: count }, (_, i) => ({
    t:   (i * duration) / count,
    pct: (i / count) * 100,
  }));
  return (
    <div className="absolute inset-0 flex items-end pb-1 overflow-hidden">
      {markers.map(({ t, pct }) => (
        <div
          key={pct}
          className="absolute flex flex-col items-center"
          style={{ left: `${pct}%` }}
        >
          <div className="w-px h-2 bg-[#1e1e2e]" />
          <span className="text-[8px] font-mono text-[#2a2a3e] mt-0.5 whitespace-nowrap">
            {formatDuration(t)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState — fixed bar heights, no Math.random() in render
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="flex items-end gap-1 h-16"
      >
        {EMPTY_STATE_BARS.map((heightPct, i) => (
          <div
            key={i}
            className="w-2 rounded-sm"
            style={{
              height: `${heightPct}%`,
              background: "linear-gradient(180deg, rgba(0,229,255,0.3), rgba(163,255,60,0.1))",
            }}
          />
        ))}
      </motion.div>
      <p className="text-[#3a3a52] text-sm">Select a file to start editing</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LoadingState — pre-defined two-frame animation targets, no Math.random()
// Each bar oscillates between two deterministic heights derived from index.
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-end gap-1 h-16">
        {LOADING_BARS.map((h, i) => {
          // Alternate target derived deterministically from index
          const altH = LOADING_BARS[(i + Math.floor(LOADING_BARS.length / 2)) % LOADING_BARS.length];
          return (
            <motion.div
              key={i}
              className="w-2 rounded-sm bg-[#1e1e2e]"
              animate={{ height: [`${h}%`, `${altH}%`] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.03,
                repeatType: "reverse",
              }}
            />
          );
        })}
      </div>
      <p className="text-[10px] text-[#3a3a52] font-mono">Analyzing waveform…</p>
    </div>
  );
}
