import { GanttChart } from "@/components/GanttChart/GanttChart";
import { useGanttStore } from "@/stores/ganttStore";
import { useEffect, useState } from "react";
import { AVIATION_PROJECT_DATA } from "@/lib/initialData";

export default function Home() {
  const { setProject, loadFromNetlify, project } = useGanttStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Netlify first, fallback to initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadFromNetlify();
        // Si pas de données (projet vide), utiliser les données initiales
        const currentProject = useGanttStore.getState().project;
        if (!currentProject.tasks || currentProject.tasks.length === 0) {
          setProject(AVIATION_PROJECT_DATA);
        }
      } catch (error) {
        console.warn('Fallback to initial data:', error);
        setProject(AVIATION_PROJECT_DATA);
      }
      setIsLoaded(true);
    };
    
    if (!isLoaded) {
      loadData();
    }
  }, [loadFromNetlify, setProject, isLoaded]);

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
