"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Music2, Trash2, Clock, ChevronDown, AudioWaveform, FileAudio } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { useUpload } from "@/hooks/useUpload";
import { formatDuration, formatBytes } from "@/lib/mockData";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { HistoryPanel } from "./HistoryPanel";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { files, currentFile, selectFile, removeFile, isUploading, uploadProgress } = useAudioStore();
  const { processFile } = useUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) await processFile(file);
    },
    [processFile]
  );

  return (
    <div className="flex flex-col h-full glass border-r border-[#1e1e2e] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#1e1e2e] flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00e5ff, #a3ff3c)" }}>
            <AudioWaveform className="w-4 h-4 text-black" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight gradient-text-neon">
            AudioForge
          </span>
        </div>
        <p className="text-[10px] text-[#3a3a52] font-mono uppercase tracking-widest">
          Professional Studio
        </p>
      </div>

      {/* Upload Zone */}
      <div className="px-3 py-3 flex-shrink-0">
        <motion.label
          htmlFor="file-upload"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden",
            isDragging
              ? "border-[#00e5ff] bg-[rgba(0,229,255,0.08)]"
              : "border-[#1e1e2e] hover:border-[#2a2a3e] bg-[rgba(20,20,31,0.5)]"
          )}
        >
          {isUploading ? (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full border-2 border-[#00e5ff] border-t-transparent animate-spin" />
                <span className="text-xs text-[#00e5ff] font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #00e5ff, #a3ff3c)" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                isDragging ? "bg-[rgba(0,229,255,0.2)]" : "bg-[#1e1e2e]")}>
                <Upload className={cn("w-4 h-4", isDragging ? "text-[#00e5ff]" : "text-[#3a3a52]")} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-[#8888aa]">Drop audio or click to upload</p>
                <p className="text-[10px] text-[#3a3a52] mt-0.5">MP3 · WAV · OGG · FLAC</p>
              </div>
            </>
          )}
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
        </motion.label>
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a3a52]">
            Library · {files.length}
          </span>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence>
            {files.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16, height: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectFile(file.id)}
                className={cn(
                  "group relative p-3 rounded-xl cursor-pointer transition-all duration-200",
                  currentFile?.id === file.id
                    ? "bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)]"
                    : "bg-[rgba(20,20,31,0.6)] border border-transparent hover:border-[#1e1e2e] hover:bg-[rgba(20,20,31,0.9)]"
                )}
              >
                {/* Active indicator */}
                {currentFile?.id === file.id && (
                  <motion.div
                    layoutId="active-file"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                    style={{ background: "linear-gradient(180deg, #00e5ff, #a3ff3c)" }}
                  />
                )}

                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    currentFile?.id === file.id ? "bg-[rgba(0,229,255,0.15)]" : "bg-[#1e1e2e]"
                  )}>
                    <FileAudio className={cn("w-4 h-4", currentFile?.id === file.id ? "text-[#00e5ff]" : "text-[#3a3a52]")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-medium truncate leading-tight",
                      currentFile?.id === file.id ? "text-[#e2e2f0]" : "text-[#8888aa]"
                    )}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#3a3a52] font-mono">
                        {formatDuration(file.duration)}
                      </span>
                      <span className="text-[10px] text-[#2a2a3e]">·</span>
                      <span className="text-[10px] text-[#3a3a52]">{formatBytes(file.size)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-mono uppercase",
                        file.format === "wav" ? "bg-[rgba(163,255,60,0.1)] text-[#a3ff3c]" : "bg-[rgba(0,229,255,0.1)] text-[#00e5ff]"
                      )}>
                        {file.format}
                      </span>
                      <RelativeTime date={file.uploadedAt} />
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[rgba(255,77,46,0.15)] text-[#3a3a52] hover:text-[#ff4d2e] transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Mini waveform */}
                {currentFile?.id === file.id && file.waveformData && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    className="flex items-end gap-px h-4 mt-2 px-1"
                  >
                    {file.waveformData.slice(0, 48).map((v, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-sm opacity-60"
                        style={{
                          height: `${v * 100}%`,
                          background: "linear-gradient(180deg, #00e5ff, #a3ff3c)",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Music2 className="w-8 h-8 text-[#1e1e2e] mb-2" />
              <p className="text-xs text-[#3a3a52]">No files yet</p>
            </div>
          )}
        </div>
      </div>

      {/* History panel */}
      <div className="border-t border-[#1e1e2e] flex-shrink-0">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#3a3a52]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a3a52]">History</span>
          </div>
          <ChevronDown className={cn("w-3 h-3 text-[#3a3a52] transition-transform", !historyOpen && "-rotate-90")} />
        </button>
        <AnimatePresence>
          {historyOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <HistoryPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
