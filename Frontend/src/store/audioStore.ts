import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  AudioFile,
  Transformation,
  PlaybackAnalytics,
  EditorState,
  PlaybackState,
} from "@/types";
import { generateMockAnalytics } from "@/lib/mockData";

interface AudioStore {
  // Files
  files: AudioFile[];
  currentFile: AudioFile | null;
  isUploading: boolean;
  uploadProgress: number;

  // Playback
  playbackState: PlaybackState;
  editorState: EditorState;

  // Transformations
  transformations: Transformation[];
  undoStack: Transformation[][];
  redoStack: Transformation[][];

  // Analytics
  analytics: PlaybackAnalytics | null;
  isAnalyticsLoading: boolean;

  // UI
  sidebarOpen: boolean;
  analyticsPanelOpen: boolean;

  // Actions — Files
  addFile: (file: AudioFile) => void;
  removeFile: (id: string) => void;
  selectFile: (id: string) => void;
  setUploading: (val: boolean, progress?: number) => void;

  // Actions — Playback
  setPlaybackState: (state: PlaybackState) => void;
  updateEditorState: (patch: Partial<EditorState>) => void;

  // Actions — Transformations
  addTransformation: (t: Transformation) => void;
  toggleTransformation: (id: string) => void;
  removeTransformation: (id: string) => void;
  undo: () => void;
  redo: () => void;

  // Actions — Analytics
  loadAnalytics: (fileId: string) => Promise<void>;

  // Actions — UI
  toggleSidebar: () => void;
  toggleAnalyticsPanel: () => void;
}

const DEFAULT_EDITOR: EditorState = {
  currentTime: 0,
  duration: 0,
  zoom: 1,
  volume: 0.8,
  playbackRate: 1,
  isMuted: false,
  selectedRegion: null,
  isLooping: false,
};

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => ({
    files: [],
    currentFile: null,
    isUploading: false,
    uploadProgress: 0,

    playbackState: "idle",
    editorState: DEFAULT_EDITOR,

    transformations: [],
    undoStack: [],
    redoStack: [],

    analytics: null,
    isAnalyticsLoading: false,

    sidebarOpen: true,
    analyticsPanelOpen: true,

    addFile: (file) =>
      set((s) => ({ files: [...s.files, file] })),

    removeFile: (id) =>
      set((s) => ({
        files: s.files.filter((f) => f.id !== id),
        currentFile: s.currentFile?.id === id ? null : s.currentFile,
      })),

    selectFile: (id) => {
      const file = get().files.find((f) => f.id === id);
      if (file) {
        set({
          currentFile: file,
          playbackState: "idle",
          transformations: [],
          editorState: { ...DEFAULT_EDITOR, duration: file.duration },
        });
        get().loadAnalytics(id);
      }
    },

    setUploading: (val, progress = 0) =>
      set({ isUploading: val, uploadProgress: progress }),

    setPlaybackState: (state) => set({ playbackState: state }),

    updateEditorState: (patch) =>
      set((s) => ({ editorState: { ...s.editorState, ...patch } })),

    addTransformation: (t) => {
      const prev = get().transformations;
      set({
        transformations: [...prev, t],
        undoStack: [...get().undoStack, prev],
        redoStack: [],
      });
    },

    toggleTransformation: (id) =>
      set((s) => ({
        transformations: s.transformations.map((t) =>
          t.id === id ? { ...t, enabled: !t.enabled } : t
        ),
      })),

    removeTransformation: (id) => {
      const prev = get().transformations;
      set({
        transformations: prev.filter((t) => t.id !== id),
        undoStack: [...get().undoStack, prev],
        redoStack: [],
      });
    },

    undo: () => {
      const { undoStack, transformations } = get();
      if (!undoStack.length) return;
      const prev = undoStack[undoStack.length - 1];
      set({
        transformations: prev,
        undoStack: undoStack.slice(0, -1),
        redoStack: [transformations, ...get().redoStack],
      });
    },

    redo: () => {
      const { redoStack, transformations } = get();
      if (!redoStack.length) return;
      const next = redoStack[0];
      set({
        transformations: next,
        redoStack: redoStack.slice(1),
        undoStack: [...get().undoStack, transformations],
      });
    },

    loadAnalytics: async (fileId) => {
      set({ isAnalyticsLoading: true });
      await new Promise((r) => setTimeout(r, 800));
      const file = get().files.find((f) => f.id === fileId);
      set({
        analytics: generateMockAnalytics(file?.duration ?? 180),
        isAnalyticsLoading: false,
      });
    },

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    toggleAnalyticsPanel: () =>
      set((s) => ({ analyticsPanelOpen: !s.analyticsPanelOpen })),
  }))
);
