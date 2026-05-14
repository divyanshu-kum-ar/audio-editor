"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Zap, Volume2, Music, FastForward, Eye, EyeOff, Trash2, Mic2 } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { Transformation, TransformationType } from "@/types";
import { formatDuration } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const TRANSFORM_META: Record<TransformationType, { icon: React.ElementType; color: string; bg: string }> = {
  trim: { icon: Scissors, color: "#00e5ff", bg: "rgba(0,229,255,0.1)" },
  speed: { icon: FastForward, color: "#a3ff3c", bg: "rgba(163,255,60,0.1)" },
  echo: { icon: Mic2, color: "#ff4d2e", bg: "rgba(255,77,46,0.1)" },
  reverb: { icon: Zap, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  pitch: { icon: Music, color: "#ffcc44", bg: "rgba(255,204,68,0.1)" },
  mute: { icon: Volume2, color: "#ff4d2e", bg: "rgba(255,77,46,0.1)" },
  volume: { icon: Volume2, color: "#00e5ff", bg: "rgba(0,229,255,0.1)" },
  "fade-in": { icon: Zap, color: "#a3ff3c", bg: "rgba(163,255,60,0.1)" },
  "fade-out": { icon: Zap, color: "#a3ff3c", bg: "rgba(163,255,60,0.1)" },
  normalize: { icon: Zap, color: "#ffcc44", bg: "rgba(255,204,68,0.1)" },
};

function HistoryItem({ t }: { t: Transformation }) {
  const { toggleTransformation, removeTransformation } = useAudioStore();
  const meta = TRANSFORM_META[t.type] ?? TRANSFORM_META.volume;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: t.enabled ? 1 : 0.4, y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
        t.enabled ? "bg-[rgba(20,20,31,0.8)]" : "bg-transparent"
      )}
    >
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: meta.bg }}>
        <Icon className="w-3 h-3" style={{ color: meta.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-[#8888aa] truncate">{t.label}</p>
        {t.timestamp && (
          <p className="text-[9px] text-[#3a3a52] font-mono">
            {formatDuration(t.timestamp.start)} – {formatDuration(t.timestamp.end)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toggleTransformation(t.id)}
          className="p-0.5 rounded hover:bg-[#1e1e2e] text-[#3a3a52] hover:text-[#8888aa]"
        >
          {t.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button
          onClick={() => removeTransformation(t.id)}
          className="p-0.5 rounded hover:bg-[rgba(255,77,46,0.1)] text-[#3a3a52] hover:text-[#ff4d2e]"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

export function HistoryPanel() {
  const { transformations, undo, redo, undoStack, redoStack } = useAudioStore();

  return (
    <div className="px-3 pb-3">
      <div className="max-h-44 overflow-y-auto space-y-0.5 mb-2">
        <AnimatePresence>
          {transformations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 text-center"
            >
              <p className="text-[10px] text-[#2a2a3e]">No transformations yet</p>
            </motion.div>
          ) : (
            transformations.map((t) => <HistoryItem key={t.id} t={t} />)
          )}
        </AnimatePresence>
      </div>

      {/* Undo/redo buttons */}
      <div className="flex gap-1.5">
        <button
          onClick={undo}
          disabled={!undoStack.length}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-mono text-[#3a3a52] bg-[#0f0f18] hover:bg-[#1e1e2e] hover:text-[#8888aa] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-[#1e1e2e]"
        >
          ↩ Undo
        </button>
        <button
          onClick={redo}
          disabled={!redoStack.length}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-mono text-[#3a3a52] bg-[#0f0f18] hover:bg-[#1e1e2e] hover:text-[#8888aa] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-[#1e1e2e]"
        >
          Redo ↪
        </button>
      </div>
    </div>
  );
}
