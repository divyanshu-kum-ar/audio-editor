export interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  format: "mp3" | "wav" | "ogg" | "flac";
  url: string;
  uploadedAt: Date;
  waveformData?: number[];
  metadata?: {
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    artist?: string;
    title?: string;
  };
}

export type TransformationType =
  | "trim"
  | "speed"
  | "echo"
  | "reverb"
  | "pitch"
  | "mute"
  | "volume"
  | "fade-in"
  | "fade-out"
  | "normalize";

export interface Transformation {
  id: string;
  type: TransformationType;
  label: string;
  params: Record<string, number | string | boolean>;
  enabled: boolean;
  appliedAt: Date;
  timestamp?: { start: number; end: number };
}

export interface SegmentAnalytics {
  segmentId: string;
  startTime: number;
  endTime: number;
  playCount: number;
  pauseCount: number;
  skipCount: number;
  replayCount: number;
  avgListenDuration: number;
  engagementScore: number; // 0-1
}

export interface PlaybackAnalytics {
  totalPlays: number;
  totalListeners: number;
  avgCompletionRate: number;
  totalDuration: number;
  segments: SegmentAnalytics[];
  peakHour: number;
  liveListeners: number;
  topCountries: { country: string; count: number }[];
  recentActivity: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  type: "play" | "pause" | "skip" | "replay" | "share";
  timestamp: Date;
  segment?: number;
  userId?: string;
}

export type PlaybackState = "idle" | "playing" | "paused" | "loading";

export interface EditorState {
  currentTime: number;
  duration: number;
  zoom: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  selectedRegion: { start: number; end: number } | null;
  isLooping: boolean;
}
