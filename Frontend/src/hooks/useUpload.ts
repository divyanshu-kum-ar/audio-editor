"use client";
import { useCallback } from "react";
import { useAudioStore } from "@/store/audioStore";
import { AudioFile } from "@/types";
import { generateMockWaveform } from "@/lib/mockData";

// ---------------------------------------------------------------------------
// File-upload hook
// All Date / ID generation happens inside an async callback that runs
// exclusively on the client — safe from SSR / hydration.
// ---------------------------------------------------------------------------
export function useUpload() {
  const { addFile, setUploading } = useAudioStore();

  const processFile = useCallback(
    async (file: File) => {
      const ACCEPTED = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac", "audio/x-wav"];
      if (!ACCEPTED.includes(file.type)) {
        alert("Only MP3, WAV, OGG, FLAC files are supported.");
        return;
      }

      setUploading(true, 0);

      // Simulate upload progress
      for (let p = 0; p <= 90; p += 10) {
        await new Promise<void>((r) => setTimeout(r, 80));
        setUploading(true, p);
      }

      // Resolve duration via the Web Audio API (client-only)
      const url = URL.createObjectURL(file);
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio(url);
        audio.onloadedmetadata = () => resolve(audio.duration);
        audio.onerror = () => resolve(180);
      });

      setUploading(true, 100);
      await new Promise<void>((r) => setTimeout(r, 200));

      // crypto.randomUUID() is available in all modern browsers and Node ≥19.
      // It never runs during SSR, so there is no server/client mismatch.
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `file-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

      const audioFile: AudioFile = {
        id,
        name: file.name,
        size: file.size,
        duration: Number.isFinite(duration) ? duration : 180,
        format: file.type.includes("wav") ? "wav" : "mp3",
        url,
        // new Date() is fine here — only called inside an async event handler,
        // never during SSR render.
        uploadedAt: new Date(),
        waveformData: generateMockWaveform(Date.now() % 9999),
        metadata: {
          sampleRate: 44100,
          channels:   2,
          bitrate:    file.type.includes("wav") ? 1411 : 320,
        },
      };

      addFile(audioFile);
      setUploading(false, 0);
      return audioFile;
    },
    [addFile, setUploading],
  );

  return { processFile };
}
