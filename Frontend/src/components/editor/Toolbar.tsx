"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Undo2, Redo2, Download, Gauge, Mic2, Music, Volume2, VolumeX,
  Zap, Waves, ChevronDown,
} from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { Transformation } from "@/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stable fallback epoch for appliedAt — avoids any Date.now() at render time.
// This is metadata-only; wall-clock accuracy is not needed here.
// ---------------------------------------------------------------------------
const TRANSFORM_EPOCH = new Date("2025-05-01T00:00:00Z");

interface ToolbarProps {
  wavesurfer: { zoom: (v: number) => void };
}

export function Toolbar({ wavesurfer: _wavesurfer }: ToolbarProps) {
  const {
    currentFile,
    editorState,
    updateEditorState,
    addTransformation,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useAudioStore();

  const [activeSlider, setActiveSlider] = useState<
    "speed" | "volume" | "pitch" | null
  >(null);

  // Monotonic counter for IDs — deterministic, never diverges between renders.
  // Increment happens only inside event handlers (client-only), never during render.
  const idCounter = useRef(0);

  const makeTransform = (
    type: Transformation["type"],
    label: string,
    params: Record<string, number | string | boolean> = {},
  ): Transformation => ({
    id: `t-${type}-${++idCounter.current}`,
    type,
    label,
    params,
    enabled: true,
    appliedAt: TRANSFORM_EPOCH,
    timestamp: editorState.selectedRegion ?? undefined,
  });

  const handleTrim = () => {
    if (!editorState.selectedRegion) return;
    addTransformation(
      makeTransform(
        "trim",
        `Trim ${editorState.selectedRegion.start.toFixed(1)}s–${editorState.selectedRegion.end.toFixed(1)}s`,
      ),
    );
  };

  const handleEffect = (type: Transformation["type"], label: string) => {
    addTransformation(makeTransform(type, label));
  };

  const handleDownload = () => {
    if (!currentFile?.url) return;
    const a = document.createElement("a");
    a.href = currentFile.url;
    a.download = currentFile.name;
    a.click();
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto bg-[#0a0a10]">
      {/* Edit actions */}
      <ToolGroup label="EDIT">
        <ToolButton
          icon={Scissors}
          label="Trim"
          onClick={handleTrim}
          disabled={!editorState.selectedRegion}
          accent="neon"
        />
        <ToolButton icon={Undo2} label="Undo" onClick={undo} disabled={!undoStack.length} />
        <ToolButton icon={Redo2} label="Redo" onClick={redo} disabled={!redoStack.length} />
        <ToolButton icon={Download} label="Export" onClick={handleDownload} disabled={!currentFile} />
      </ToolGroup>

      <div className="w-px h-8 bg-[#1e1e2e] flex-shrink-0 mx-1" />

      {/* Effects */}
      <ToolGroup label="FX">
        <ToolButton icon={Mic2}  label="Echo"      onClick={() => handleEffect("echo",      "Echo Applied"  )} accent="ember"  />
        <ToolButton icon={Waves} label="Reverb"    onClick={() => handleEffect("reverb",    "Reverb Applied")} accent="violet" />
        <ToolButton icon={Zap}   label="Normalize" onClick={() => handleEffect("normalize", "Normalized"    )} accent="lime"   />
      </ToolGroup>

      <div className="w-px h-8 bg-[#1e1e2e] flex-shrink-0 mx-1" />

      {/* Sliders group */}
      <ToolGroup label="ADJUST">

        {/* ── Speed ─────────────────────────────────────────────────── */}
        <SliderButton
          icon={Gauge}
          label={`${editorState.playbackRate}×`}
          tooltip="Speed"
          active={activeSlider === "speed"}
          onToggle={() => setActiveSlider(activeSlider === "speed" ? null : "speed")}
        />
        <AnimatePresence>
          {activeSlider === "speed" && (
            <SliderPopover
              label="Playback Speed"
              min={0.5} max={2} step={0.25}
              value={editorState.playbackRate}
              onChange={(v) => {
                updateEditorState({ playbackRate: v });
                addTransformation(makeTransform("speed", `Speed ${v}×`, { rate: v }));
              }}
              markers={["0.5×", "1×", "1.5×", "2×"]}
              markerValues={[0.5, 1, 1.5, 2]}
              onClose={() => setActiveSlider(null)}
            />
          )}
        </AnimatePresence>

        {/* ── Volume ────────────────────────────────────────────────── */}
        <SliderButton
          icon={editorState.isMuted ? VolumeX : Volume2}
          label={`${Math.round(editorState.volume * 100)}%`}
          tooltip="Volume"
          active={activeSlider === "volume"}
          onToggle={() => setActiveSlider(activeSlider === "volume" ? null : "volume")}
          onAlt={() => updateEditorState({ isMuted: !editorState.isMuted })}
        />
        <AnimatePresence>
          {activeSlider === "volume" && (
            <SliderPopover
              label="Volume"
              min={0} max={1} step={0.05}
              value={editorState.volume}
              onChange={(v) => updateEditorState({ volume: v })}
              onClose={() => setActiveSlider(null)}
            />
          )}
        </AnimatePresence>

        {/* ── Pitch ─────────────────────────────────────────────────── */}
        <SliderButton
          icon={Music}
          label="Pitch"
          tooltip="Pitch Shift"
          active={activeSlider === "pitch"}
          onToggle={() => setActiveSlider(activeSlider === "pitch" ? null : "pitch")}
        />
        <AnimatePresence>
          {activeSlider === "pitch" && (
            <SliderPopover
              label="Pitch Shift"
              min={-12} max={12} step={1}
              value={0}
              onChange={(v) => {
                if (v !== 0)
                  addTransformation(
                    makeTransform("pitch", `Pitch ${v > 0 ? "+" : ""}${v} semitones`, { semitones: v }),
                  );
              }}
              onClose={() => setActiveSlider(null)}
            />
          )}
        </AnimatePresence>
      </ToolGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToolGroup
// ---------------------------------------------------------------------------
function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 relative">
      <span className="absolute -top-4 left-0 text-[7px] font-mono text-[#2a2a3e] uppercase tracking-widest hidden">
        {label}
      </span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToolButton
// ---------------------------------------------------------------------------
interface ToolButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: "neon" | "ember" | "lime" | "violet";
}

const ACCENT_STYLES = {
  neon:   "hover:bg-[rgba(0,229,255,0.1)]  hover:text-[#00e5ff] hover:border-[rgba(0,229,255,0.2)]",
  ember:  "hover:bg-[rgba(255,77,46,0.1)]  hover:text-[#ff4d2e] hover:border-[rgba(255,77,46,0.2)]",
  lime:   "hover:bg-[rgba(163,255,60,0.1)] hover:text-[#a3ff3c] hover:border-[rgba(163,255,60,0.2)]",
  violet: "hover:bg-[rgba(168,85,247,0.1)] hover:text-[#a855f7] hover:border-[rgba(168,85,247,0.2)]",
} as const;

function ToolButton({ icon: Icon, label, onClick, disabled, accent }: ToolButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-transparent transition-all duration-150 flex-shrink-0",
        "text-[#5a5a7a] bg-[#0f0f18]",
        accent ? ACCENT_STYLES[accent] : "hover:bg-[#1e1e2e] hover:text-[#8888aa]",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden md:inline">{label}</span>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// SliderButton
// ---------------------------------------------------------------------------
function SliderButton({
  icon: Icon, label, tooltip, active, onToggle, onAlt,
}: {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  active: boolean;
  onToggle: () => void;
  onAlt?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      onClick={onToggle}
      onContextMenu={(e) => { e.preventDefault(); onAlt?.(); }}
      title={tooltip}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-all duration-150 flex-shrink-0",
        active
          ? "bg-[rgba(0,229,255,0.1)] text-[#00e5ff] border-[rgba(0,229,255,0.25)]"
          : "text-[#5a5a7a] bg-[#0f0f18] border-transparent hover:bg-[#1e1e2e] hover:text-[#8888aa]",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="font-mono text-[10px]">{label}</span>
      <ChevronDown className={cn("w-3 h-3 transition-transform", active && "rotate-180")} />
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// SliderPopover
// ---------------------------------------------------------------------------
interface SliderPopoverProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  onClose: () => void;
  markers?: string[];
  markerValues?: number[];
}

function SliderPopover({
  label, min, max, step, value, onChange, onClose, markers, markerValues,
}: SliderPopoverProps) {
  // Computed fill percentage — pure arithmetic, safe on server and client
  const fillPct = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      className="absolute top-10 left-0 z-50 glass-elevated rounded-xl p-4 shadow-glass border border-[rgba(255,255,255,0.08)] min-w-48"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-[#8888aa] uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={onClose}
          className="text-[#3a3a52] hover:text-[#8888aa] text-xs"
        >
          ✕
        </button>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, #00e5ff ${fillPct}%, #1e1e2e ${fillPct}%)`,
        }}
      />

      <div className="flex justify-between mt-1">
        {markers && markerValues ? (
          markers.map((m, i) => (
            <button
              key={m}
              onClick={() => onChange(markerValues[i])}
              className={cn(
                "text-[9px] font-mono transition-colors",
                markerValues[i] === value
                  ? "text-[#00e5ff]"
                  : "text-[#3a3a52] hover:text-[#8888aa]",
              )}
            >
              {m}
            </button>
          ))
        ) : (
          <>
            <span className="text-[9px] font-mono text-[#3a3a52]">{min}</span>
            <span className="text-[10px] font-mono text-[#00e5ff] font-bold">{value}</span>
            <span className="text-[9px] font-mono text-[#3a3a52]">{max}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
