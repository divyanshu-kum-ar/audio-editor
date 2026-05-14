"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { PanelLeft, PanelRight, AudioWaveform } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { WaveformPlayer } from "./WaveformPlayer";
import { PlaybackControls } from "./PlaybackControls";
import { Toolbar } from "./Toolbar";
import { useWavesurfer } from "@/hooks/useWavesurfer";

export function EditorArea() {
  const { currentFile, playbackState, toggleSidebar, toggleAnalyticsPanel } = useAudioStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useWavesurfer(containerRef);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080810]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0 glass">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-[#1e1e2e] text-[#3a3a52] hover:text-[#8888aa] transition-all"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#1e1e2e]" />

          {currentFile ? (
            <motion.div
              key={currentFile.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                <AudioWaveform className="w-3 h-3 text-[#00e5ff]" />
              </div>
              <span className="text-sm font-medium text-[#e2e2f0] font-display truncate max-w-xs">
                {currentFile.metadata?.title ?? currentFile.name}
              </span>
              {currentFile.metadata?.artist && (
                <span className="text-xs text-[#3a3a52]">— {currentFile.metadata.artist}</span>
              )}
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ml-1
                ${currentFile.format === "wav" ? "bg-[rgba(163,255,60,0.1)] text-[#a3ff3c]" : "bg-[rgba(0,229,255,0.1)] text-[#00e5ff]"}`}>
                {currentFile.format}
              </span>
            </motion.div>
          ) : (
            <span className="text-sm text-[#3a3a52]">No file selected</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {playbackState === "playing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(163,255,60,0.1)] border border-[rgba(163,255,60,0.2)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#a3ff3c] live-dot" />
              <span className="text-[10px] font-mono text-[#a3ff3c] uppercase tracking-wider">Live</span>
            </motion.div>
          )}

          <button
            onClick={toggleAnalyticsPanel}
            className="p-1.5 rounded-lg hover:bg-[#1e1e2e] text-[#3a3a52] hover:text-[#8888aa] transition-all"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-[#1e1e2e]">
        <Toolbar wavesurfer={wavesurfer} />
      </div>

      {/* Waveform area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <WaveformPlayer containerRef={containerRef} wavesurfer={wavesurfer} />
      </div>

      {/* Playback controls */}
      <div className="flex-shrink-0 border-t border-[#1e1e2e]">
        <PlaybackControls wavesurfer={wavesurfer} />
      </div>
    </div>
  );
}
