"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, TrendingUp, Globe, Clock, Activity,
  Play, Pause, SkipForward, RefreshCw, Share2,
} from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { formatDuration, getEngagementColor, formatRelativeTime } from "@/lib/mockData";
import { ActivityEvent, SegmentAnalytics } from "@/types";

// ---------------------------------------------------------------------------
// AnalyticsPanel — all time-dependent values are initialised in useEffect
// so SSR renders a stable skeleton and hydration never mismatches.
// ---------------------------------------------------------------------------
export function AnalyticsPanel() {
  const { analytics, isAnalyticsLoading } = useAudioStore();

  // Start at 0 on both server and client; set real value only after mount.
  const [liveCount, setLiveCount] = useState(0);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!analytics) return;
    setLiveCount(analytics.liveListeners);
    const interval = setInterval(() => {
      // Math.random() is fine inside useEffect — never runs on the server.
      setLiveCount((c) => Math.max(1, c + Math.floor((Math.random() - 0.45) * 8)));
    }, 2000);
    return () => clearInterval(interval);
  }, [analytics]);

  return (
    <div className="flex flex-col h-full glass border-l border-[#1e1e2e] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#1e1e2e] flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#3a3a52]" />
          <span className="text-sm font-display font-semibold text-[#e2e2f0]">
            Analytics
          </span>
          {analytics && (
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(255,77,46,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] live-dot" />
              <span className="text-[9px] font-mono text-[#ff4d2e] uppercase">Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isAnalyticsLoading ? (
          <LoadingSkeleton />
        ) : !analytics ? (
          <EmptyAnalytics />
        ) : (
          <div className="p-3 space-y-3">
            {/* Live listeners hero */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-4 rounded-2xl overflow-hidden border border-[rgba(255,77,46,0.15)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,77,46,0.08) 0%, rgba(255,140,66,0.04) 100%)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full"
                style={{
                  background: "radial-gradient(circle, #ff4d2e, transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#ff4d2e]" />
                <span className="text-[10px] font-mono text-[#ff8c42] uppercase tracking-wider">
                  Listening now
                </span>
              </div>
              {/* Render 0 on server; animated real value on client */}
              <motion.div
                key={liveCount}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-display font-bold text-[#e2e2f0]"
              >
                {mounted ? liveCount.toLocaleString() : "—"}
              </motion.div>
              <p className="text-[10px] text-[#3a3a52] mt-1">
                listeners · updating live
              </p>
            </motion.div>

            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-2">
              <MetricCard icon={Play}       label="Total Plays"  value={analytics.totalPlays.toLocaleString()}                accent="#00e5ff" delay={0.10} />
              <MetricCard icon={Users}      label="Listeners"    value={analytics.totalListeners.toLocaleString()}            accent="#a3ff3c" delay={0.15} />
              <MetricCard icon={TrendingUp} label="Completion"   value={`${(analytics.avgCompletionRate * 100).toFixed(1)}%`} accent="#a855f7" delay={0.20} />
              <MetricCard icon={Clock}      label="Peak Hour"    value={`${analytics.peakHour}:00`}                          accent="#ffcc44" delay={0.25} />
            </div>

            {/* Most replayed */}
            <div>
              <SectionHeader label="🔥 Most Replayed" />
              <MostReplayedSection
                segments={analytics.segments}
              />
            </div>

            {/* Segment engagement bars */}
            <div>
              <SectionHeader label="Engagement Map" />
              <EngagementBars segments={analytics.segments} />
            </div>

            {/* Top countries */}
            <div>
              <SectionHeader label="Top Countries" />
              <CountryList countries={analytics.topCountries} />
            </div>

            {/* Recent activity — timestamps shown only after mount */}
            <div>
              <SectionHeader label="Recent Activity" />
              <ActivityFeed events={analytics.recentActivity} mounted={mounted} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#3a3a52]">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#1e1e2e]" />
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, accent, delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-3 rounded-xl bg-[rgba(14,14,22,0.8)] border border-[#1e1e2e] hover:border-[#2a2a3e] transition-all"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3" style={{ color: accent }} />
        <span className="text-[9px] font-mono text-[#3a3a52] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-lg font-display font-bold text-[#e2e2f0]">{value}</div>
    </motion.div>
  );
}

function MostReplayedSection({
  segments,
}: {
  segments: SegmentAnalytics[];
}) {
  const sorted    = [...segments].sort((a, b) => b.replayCount - a.replayCount).slice(0, 3);
  const maxReplays = Math.max(...segments.map((s) => s.replayCount));

  return (
    <div className="space-y-1.5">
      {sorted.map((seg, i) => (
        <motion.div
          key={seg.segmentId}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(14,14,22,0.6)] border border-[#1e1e2e]"
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold font-mono"
            style={{
              background:
                i === 0 ? "rgba(255,77,46,0.2)"
                : i === 1 ? "rgba(255,140,66,0.15)"
                : "rgba(255,204,68,0.1)",
              color:
                i === 0 ? "#ff4d2e"
                : i === 1 ? "#ff8c42"
                : "#ffcc44",
            }}
          >
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[#8888aa] font-mono">
              {formatDuration(seg.startTime)} – {formatDuration(seg.endTime)}
            </div>
            <div className="mt-1 h-1 rounded-full bg-[#1e1e2e] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(seg.replayCount / maxReplays) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ background: getEngagementColor(seg.engagementScore) }}
              />
            </div>
          </div>
          <div
            className="text-[10px] font-mono font-semibold"
            style={{ color: getEngagementColor(seg.engagementScore) }}
          >
            {seg.replayCount.toLocaleString()}×
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EngagementBars({ segments }: { segments: SegmentAnalytics[] }) {
  const maxPlays = Math.max(...segments.map((s) => s.playCount));
  return (
    <div className="flex items-end gap-0.5 h-12 w-full rounded-lg overflow-hidden bg-[rgba(14,14,22,0.4)] p-1">
      {segments.map((seg) => (
        <motion.div
          key={seg.segmentId}
          initial={{ height: 0 }}
          animate={{ height: `${(seg.playCount / maxPlays) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex-1 rounded-sm"
          style={{
            background: getEngagementColor(seg.engagementScore),
            opacity: 0.8,
          }}
          title={`${seg.playCount.toLocaleString()} plays`}
        />
      ))}
    </div>
  );
}

function CountryList({
  countries,
}: {
  countries: { country: string; count: number }[];
}) {
  const max = countries[0]?.count ?? 1;
  return (
    <div className="space-y-1.5">
      {countries.map((c, i) => (
        <motion.div
          key={c.country}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2"
        >
          <Globe className="w-3 h-3 text-[#3a3a52] flex-shrink-0" />
          <span className="text-[10px] text-[#8888aa] flex-1 truncate">{c.country}</span>
          <div className="w-16 h-1 rounded-full bg-[#1e1e2e] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(c.count / max) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
              className="h-full rounded-full bg-[#00e5ff]"
            />
          </div>
          <span className="text-[9px] font-mono text-[#3a3a52] w-10 text-right">
            {c.count.toLocaleString()}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

const EVENT_META = {
  play:   { icon: Play,        color: "#a3ff3c", label: "Played"   },
  pause:  { icon: Pause,       color: "#ffcc44", label: "Paused"   },
  skip:   { icon: SkipForward, color: "#ff4d2e", label: "Skipped"  },
  replay: { icon: RefreshCw,   color: "#00e5ff", label: "Replayed" },
  share:  { icon: Share2,      color: "#a855f7", label: "Shared"   },
} as const;

// `mounted` prop prevents formatRelativeTime (which reads Date.now()) from
// running during SSR — timestamps are shown as "—" until hydration is done.
function ActivityFeed({
  events,
  mounted,
}: {
  events: ActivityEvent[];
  mounted: boolean;
}) {
  return (
    <div className="space-y-1">
      {events.slice(0, 8).map((evt, i) => {
        const meta = EVENT_META[evt.type];
        const Icon = meta.icon;
        return (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}18` }}
            >
              <Icon className="w-2.5 h-2.5" style={{ color: meta.color }} />
            </div>
            <span className="text-[10px] text-[#5a5a7a] flex-1">{meta.label}</span>
            {evt.segment !== undefined && (
              <span className="text-[9px] font-mono text-[#2a2a3e]">
                seg {evt.segment + 1}
              </span>
            )}
            {/* Only render relative time on the client to avoid mismatch */}
            <span className="text-[9px] text-[#2a2a3e] w-12 text-right">
              {mounted ? formatRelativeTime(evt.timestamp) : "—"}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  // Fixed widths — no random values
  const widths = [80, 60, 100, 70, 90, 55];
  return (
    <div className="p-3 space-y-3">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-12 rounded-xl shimmer"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function EmptyAnalytics() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <BarChart3 className="w-10 h-10 text-[#1e1e2e] mb-3" />
      <p className="text-[#3a3a52] text-sm">Select a file to view analytics</p>
    </div>
  );
}
