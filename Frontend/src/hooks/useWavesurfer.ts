"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAudioStore } from "@/store/audioStore";

export function useWavesurfer(containerRef: React.RefObject<HTMLDivElement | null>) {
  const wsRef = useRef<unknown>(null);
  const { currentFile, editorState, setPlaybackState, updateEditorState } =
    useAudioStore();

  const initWavesurfer = useCallback(async () => {
    if (!containerRef.current || !currentFile?.url) return;

    // Dynamic import to avoid SSR issues
    const WaveSurfer = (await import("wavesurfer.js")).default;

    if (wsRef.current) {
      (wsRef.current as { destroy: () => void }).destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(0,229,255,0.4)",
      progressColor: "rgba(0,229,255,0.9)",
      cursorColor: "#00e5ff",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 96,
      normalize: true,
      interact: true,
      backend: "WebAudio",
    });

    ws.on("ready", (dur: number) => {
      updateEditorState({ duration: dur });
      setPlaybackState("idle");
    });

    ws.on("audioprocess", (t: number) => {
      updateEditorState({ currentTime: t });
    });

    ws.on("finish", () => {
      setPlaybackState("idle");
      updateEditorState({ currentTime: 0 });
    });

    ws.on("play", () => setPlaybackState("playing"));
    ws.on("pause", () => setPlaybackState("paused"));

    setPlaybackState("loading");
    await ws.load(currentFile.url);
    wsRef.current = ws;
  }, [currentFile, containerRef, setPlaybackState, updateEditorState]);

  useEffect(() => {
    initWavesurfer();
    return () => {
      if (wsRef.current) {
        (wsRef.current as { destroy: () => void }).destroy();
        wsRef.current = null;
      }
    };
  }, [initWavesurfer]);

  // Sync volume
  useEffect(() => {
    if (wsRef.current) {
      const ws = wsRef.current as { setVolume: (v: number) => void; setMuted: (m: boolean) => void };
      ws.setVolume(editorState.isMuted ? 0 : editorState.volume);
    }
  }, [editorState.volume, editorState.isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (wsRef.current) {
      (wsRef.current as { setPlaybackRate: (r: number) => void }).setPlaybackRate(editorState.playbackRate);
    }
  }, [editorState.playbackRate]);

  const play = useCallback(() => {
    if (wsRef.current) (wsRef.current as { play: () => void }).play();
  }, []);

  const pause = useCallback(() => {
    if (wsRef.current) (wsRef.current as { pause: () => void }).pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (wsRef.current) (wsRef.current as { playPause: () => void }).playPause();
  }, []);

  const seekTo = useCallback((progress: number) => {
    if (wsRef.current) (wsRef.current as { seekTo: (p: number) => void }).seekTo(progress);
  }, []);

  const zoom = useCallback((val: number) => {
    if (wsRef.current) (wsRef.current as { zoom: (v: number) => void }).zoom(val);
  }, []);

  const skip = useCallback((seconds: number) => {
    if (wsRef.current) (wsRef.current as { skip: (s: number) => void }).skip(seconds);
  }, []);

  return { play, pause, togglePlay, seekTo, zoom, skip, wsRef };
}
