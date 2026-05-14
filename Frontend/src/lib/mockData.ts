import {
  AudioFile,
  PlaybackAnalytics,
  SegmentAnalytics,
  ActivityEvent,
} from "@/types";

// ---------------------------------------------------------------------------
// Deterministic pseudo-random using a seeded LCG — safe for SSR because it
// produces the same sequence on server AND client for the same seed.
// ---------------------------------------------------------------------------
function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ---------------------------------------------------------------------------
// Fixed waveform data — deterministic, never changes between renders
// ---------------------------------------------------------------------------
export function generateMockWaveform(seed = 42, points = 200): number[] {
  const rng = createSeededRng(seed);
  return Array.from({ length: points }, (_, i) => {
    const base = Math.sin(i * 0.15) * 0.3 + 0.5;
    const noise = (rng() - 0.5) * 0.4;
    const spike = rng() > 0.9 ? rng() * 0.4 : 0;
    return Math.max(0.05, Math.min(1, base + noise + spike));
  });
}

// Fixed bar heights for the EmptyState idle animation — integers [20,100],
// same every render on server and client.
export const EMPTY_STATE_BARS: number[] = [
  40, 55, 70, 65, 80, 50, 45, 90, 60, 75,
  35, 85, 55, 70, 40, 95, 50, 65, 80, 45,
  60, 75, 55, 40, 85, 70, 50, 65, 45, 90,
  35, 80,
];

// Fixed heights for the Loading shimmer bars — same every render.
export const LOADING_BARS: number[] = [
  50, 70, 45, 80, 60, 35, 75, 55, 90, 40,
  65, 50, 80, 45, 70, 55, 35, 85, 60, 75,
  40, 65, 50, 80,
];

// ---------------------------------------------------------------------------
// Deterministic analytics
// ---------------------------------------------------------------------------
export function generateMockAnalytics(duration: number, seed = 99): PlaybackAnalytics {
  const rng = createSeededRng(seed);
  const segmentCount = Math.max(8, Math.floor(duration / 15));
  const segmentDuration = duration / segmentCount;

  const segments: SegmentAnalytics[] = Array.from(
    { length: segmentCount },
    (_, i) => {
      const isHot = rng() > 0.7;
      const playCount = isHot
        ? Math.floor(rng() * 800 + 400)
        : Math.floor(rng() * 200 + 50);
      return {
        segmentId: `seg-${i}`,
        startTime: i * segmentDuration,
        endTime: (i + 1) * segmentDuration,
        playCount,
        pauseCount: Math.floor(rng() * 30),
        skipCount: Math.floor(rng() * 20),
        replayCount: Math.floor(rng() * playCount * 0.3),
        avgListenDuration: segmentDuration * (0.5 + rng() * 0.5),
        engagementScore: isHot ? 0.7 + rng() * 0.3 : rng() * 0.6,
      };
    }
  );

  // Stable timestamps — never Date.now() at module/render level
  const BASE_TS = new Date("2025-05-01T10:00:00Z").getTime();
  const recentActivity: ActivityEvent[] = Array.from({ length: 12 }, (_, i) => ({
    id: `evt-${i}`,
    type: (["play", "pause", "skip", "replay", "share"] as const)[
      Math.floor(rng() * 5)
    ],
    timestamp: new Date(BASE_TS - Math.floor(rng() * 3600000)),
    segment: Math.floor(rng() * segmentCount),
  })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    totalPlays:        Math.floor(rng() * 50000 + 10000),
    totalListeners:    Math.floor(rng() * 12000 + 3000),
    avgCompletionRate: 0.6 + rng() * 0.35,
    totalDuration:     duration * Math.floor(rng() * 5000 + 1000),
    segments,
    peakHour:          Math.floor(rng() * 24),
    liveListeners:     Math.floor(rng() * 200 + 20),
    topCountries: [
      { country: "United States", count: Math.floor(rng() * 5000 + 2000) },
      { country: "United Kingdom", count: Math.floor(rng() * 2000 + 500) },
      { country: "Germany",        count: Math.floor(rng() * 1500 + 300) },
      { country: "Japan",          count: Math.floor(rng() * 1200 + 200) },
      { country: "Canada",         count: Math.floor(rng() * 900 + 150) },
    ],
    recentActivity,
  };
}

// ---------------------------------------------------------------------------
// MOCK_FILES — stable dates (no Date.now()) so SSR === client
// ---------------------------------------------------------------------------
const EPOCH = new Date("2025-05-01T12:00:00Z").getTime();

export const MOCK_FILES: AudioFile[] = [
  {
    id: "file-1",
    name: "midnight_session_v3.wav",
    size: 28400000,
    duration: 247,
    format: "wav",
    url: "",
    uploadedAt: new Date(EPOCH - 86400000 * 2),
    waveformData: generateMockWaveform(1),
    metadata: { bitrate: 1411, sampleRate: 44100, channels: 2, artist: "Studio A", title: "Midnight Session" },
  },
  {
    id: "file-2",
    name: "podcast_episode_42.mp3",
    size: 52100000,
    duration: 3542,
    format: "mp3",
    url: "",
    uploadedAt: new Date(EPOCH - 86400000 * 5),
    waveformData: generateMockWaveform(2),
    metadata: { bitrate: 192, sampleRate: 44100, channels: 2, title: "Episode 42" },
  },
  {
    id: "file-3",
    name: "ambient_loop_01.wav",
    size: 11200000,
    duration: 124,
    format: "wav",
    url: "",
    uploadedAt: new Date(EPOCH - 86400000),
    waveformData: generateMockWaveform(3),
    metadata: { bitrate: 1411, sampleRate: 48000, channels: 2, title: "Ambient Loop" },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// NOTE: Only call formatRelativeTime inside useEffect or event handlers —
// never during SSR render, as it reads Date.now() which differs server/client.
export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getEngagementColor(score: number): string {
  if (score > 0.8) return "#ff4d2e";
  if (score > 0.6) return "#ff8c42";
  if (score > 0.4) return "#ffcc44";
  if (score > 0.2) return "#44aaff";
  return "#2244aa";
}
