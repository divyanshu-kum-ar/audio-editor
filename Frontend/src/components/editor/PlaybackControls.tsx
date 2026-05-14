"use client";
import { motion } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Volume2, VolumeX,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { formatDuration } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  wavesurfer: {
    togglePlay: () => void;
    seekTo: (p: number) => void;
    skip: (s: number) => void;
  };
}

export function PlaybackControls({ wavesurfer }: PlaybackControlsProps) {
  const { playbackState, editorState, updateEditorState } = useAudioStore();

  const isPlaying = playbackState === "playing";
  const progress = editorState.duration > 0 ? editorState.currentTime / editorState.duration : 0;

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-[#08080f] glass-elevated">
      {/* Time display */}
      <div className="flex items-center gap-1 font-mono text-sm min-w-[100px]">
        <span className="text-[#e2e2f0]">{formatDuration(editorState.currentTime)}</span>
        <span className="text-[#2a2a3e]">/</span>
        <span className="text-[#3a3a52]">{formatDuration(editorState.duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {/* Skip back */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => wavesurfer.skip(-10)}
          className="p-2 rounded-lg text-[#5a5a7a] hover:text-[#8888aa] hover:bg-[#1e1e2e] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[8px] font-mono">10s</span>
        </motion.button>

        {/* Skip to start */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => wavesurfer.seekTo(0)}
          className="p-2 rounded-lg text-[#5a5a7a] hover:text-[#8888aa] hover:bg-[#1e1e2e] transition-all"
        >
          <SkipBack className="w-4 h-4" />
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={wavesurfer.togglePlay}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg",
            isPlaying
              ? "bg-[#00e5ff] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              : "bg-[#e2e2f0] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(226,226,240,0.3)]"
          )}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </motion.button>

        {/* Skip to end */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => wavesurfer.seekTo(1)}
          className="p-2 rounded-lg text-[#5a5a7a] hover:text-[#8888aa] hover:bg-[#1e1e2e] transition-all"
        >
          <SkipForward className="w-4 h-4" />
        </motion.button>

        {/* Skip forward */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => wavesurfer.skip(10)}
          className="p-2 rounded-lg text-[#5a5a7a] hover:text-[#8888aa] hover:bg-[#1e1e2e] transition-all"
        >
          <span className="text-[8px] font-mono">10s</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Loop */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateEditorState({ isLooping: !editorState.isLooping })}
          className={cn(
            "p-2 rounded-lg transition-all",
            editorState.isLooping
              ? "text-[#00e5ff] bg-[rgba(0,229,255,0.1)]"
              : "text-[#5a5a7a] hover:text-[#8888aa] hover:bg-[#1e1e2e]"
          )}
        >
          <Repeat className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <button
          onClick={() => updateEditorState({ isMuted: !editorState.isMuted })}
          className="p-1.5 rounded text-[#5a5a7a] hover:text-[#8888aa] transition-colors"
        >
          {editorState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range" min={0} max={1} step={0.01}
          value={editorState.isMuted ? 0 : editorState.volume}
          onChange={(e) => updateEditorState({ volume: Number(e.target.value), isMuted: false })}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, #00e5ff ${editorState.volume * 100}%, #1e1e2e ${editorState.volume * 100}%)`,
          }}
        />
        <span className="text-[10px] font-mono text-[#3a3a52] w-8 text-right">
          {Math.round(editorState.volume * 100)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a0a0f]">
        <motion.div
          className="h-full"
          style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, #00e5ff, #a3ff3c)" }}
        />
      </div>
    </div>
  );
}
