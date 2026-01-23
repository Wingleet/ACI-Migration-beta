import { GanttChart } from "@/components/GanttChart/GanttChart";
import { useGanttStore } from "@/stores/ganttStore";
import { useEffect } from "react";
import { AVIATION_PROJECT_DATA } from "@/lib/initialData";

export default function Home() {
  const { setProject } = useGanttStore();

  // Initialize with real aviation project data
  useEffect(() => {
    setProject(AVIATION_PROJECT_DATA);
  }, [setProject]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%)] bg-[size:120px_100%] opacity-[0.03]" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden relative z-10">
        <GanttChart />
      </div>
    </div>
  );
}
