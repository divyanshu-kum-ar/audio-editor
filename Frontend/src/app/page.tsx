"use client";
import { useEffect, useRef } from "react";
import { useAudioStore } from "@/store/audioStore";
import { MOCK_FILES } from "@/lib/mockData";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { EditorArea } from "@/components/editor/EditorArea";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";

export default function Home() {
  const addFile = useAudioStore((s) => s.addFile);
  const fileCount = useAudioStore((s) => s.files.length);
  // Guard so we only seed once even under React 18 StrictMode double-invoke
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && fileCount === 0) {
      seeded.current = true;
      MOCK_FILES.forEach((f) => addFile(f));
    }
  }, [addFile, fileCount]);

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      main={<EditorArea />}
      analytics={<AnalyticsPanel />}
    />
  );
}
