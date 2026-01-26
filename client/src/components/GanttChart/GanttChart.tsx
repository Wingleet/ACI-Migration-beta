import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGanttStore } from '@/stores/ganttStore';
import { useServicesStore } from '@/stores/servicesStore';
import { getXForDate, generateTimeTicks } from '@/lib/ganttUtils';
import { Task, Lane } from '@/types/gantt';
import { cn } from '@/lib/utils';
import { useGanttInteraction } from '@/hooks/useGanttInteraction';
import { Toolbar } from './Toolbar';
import { TaskDetailsPanel } from './TaskDetailsPanel';
import { ServicesSectionSidebar, ServicesSectionTimeline } from './ServicesSection';
import { format, isWithinInterval, isToday, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag,
  Lock,
  User
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Lane color mapping
const LANE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  impl: { bg: 'bg-sky-500', border: 'border-sky-400', text: 'text-sky-100', glow: 'shadow-sky-500/30' },
  train: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-100', glow: 'shadow-emerald-500/30' },
  data: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-100', glow: 'shadow-amber-500/30' },
  it: { bg: 'bg-violet-500', border: 'border-violet-400', text: 'text-violet-100', glow: 'shadow-violet-500/30' },
  support: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-100', glow: 'shadow-rose-500/30' },
};

const getStatusColor = (task: Task): string => {
  if (task.progress === 100) return 'bg-emerald-500 dark:bg-emerald-600';
  if (task.status === 'delayed') return 'bg-red-500 dark:bg-red-600';
  if (task.progress > 0) return 'bg-sky-500 dark:bg-sky-600';
  return 'bg-slate-400 dark:bg-slate-500';
};

interface TaskBarProps {
  task: Task;
  x: number;
  y: number;
  width: number;
  height: number;
  laneColor: typeof LANE_COLORS[keyof typeof LANE_COLORS];
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent, taskId: string, mode: 'move' | 'resize-left' | 'resize-right') => void;
  onClick: (taskId: string) => void;
}

const TaskBar: React.FC<TaskBarProps> = ({
  task,
  x,
  y,
  width,
  height,
  laneColor,
  isSelected,
  isDragging,
  onMouseDown,
  onClick,
}) => {
  const barHeight = 28;
  const isMilestone = task.type === 'milestone';
  
  if (isMilestone) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 45 }}
              className={cn(
                "absolute cursor-pointer",
                isDragging && isSelected && "z-50"
              )}
              style={{
                top: y + (height - 20) / 2,
                left: x - 10,
              }}
              onClick={() => onClick(task.id)}
              onMouseDown={(e) => onMouseDown(e, task.id, 'move')}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded-sm shadow-lg transition-all",
                  "bg-gradient-to-br from-amber-400 to-amber-600",
                  "border-2 border-amber-300",
                  isSelected && "ring-2 ring-amber-400 ring-offset-2 ring-offset-background",
                  isDragging && isSelected && "scale-110"
                )}
              >
                <Flag className="w-2.5 h-2.5 text-amber-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="gantt-tooltip">
            <TaskTooltip task={task} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "absolute group gantt-task-bar",
              isDragging && isSelected && "dragging z-50"
            )}
            style={{
              top: y + (height - barHeight) / 2,
              left: x,
              width: Math.max(width, 8),
              height: barHeight,
              transformOrigin: 'left center',
            }}
          >
            {/* Main bar */}
            <div
              className={cn(
                "h-full rounded-md relative overflow-hidden cursor-pointer",
                "border transition-all duration-200",
                laneColor.bg,
                laneColor.border,
                isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                task.isLocked && "opacity-70"
              )}
              onMouseDown={(e) => onMouseDown(e, task.id, 'move')}
              onClick={() => onClick(task.id)}
            >
              {/* Lock icon */}
              {task.isLocked && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Lock className="w-3 h-3 text-white/60" />
                </div>
              )}

              {/* Task label */}
              {width > 80 && (
                <div className="absolute inset-0 flex items-center px-2 gap-1.5">
                  <span className={cn(
                    "text-[11px] font-semibold truncate",
                    laneColor.text
                  )}>
                    {task.name}
                  </span>
                </div>
              )}

              {/* Resize handles */}
              {!task.isLocked && (
                <>
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 transition-colors z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onMouseDown(e, task.id, 'resize-left');
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 transition-colors z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onMouseDown(e, task.id, 'resize-right');
                    }}
                  />
                </>
              )}
            </div>

            {/* External label for narrow bars */}
            {width <= 80 && (
              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                {task.name}
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="gantt-tooltip p-0">
          <TaskTooltip task={task} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TaskTooltip: React.FC<{ task: Task }> = ({ task }) => (
  <div className="p-3 min-w-[200px] max-w-[280px]">
    <div className="mb-2">
      <h4 className="font-semibold text-sm leading-tight">{task.name}</h4>
    </div>
    
    <div className="space-y-1.5 text-xs text-muted-foreground">
      <div className="flex justify-between">
        <span>Début:</span>
        <span className="font-mono-data text-foreground">{format(task.start, 'dd MMM yyyy')}</span>
      </div>
      <div className="flex justify-between">
        <span>Fin:</span>
        <span className="font-mono-data text-foreground">{format(task.end, 'dd MMM yyyy')}</span>
      </div>
      <div className="flex justify-between">
        <span>Durée:</span>
        <span className="font-mono-data text-foreground">{task.duration} jours</span>
      </div>

      {task.owner && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-border mt-2">
          <User className="w-3 h-3" />
          <span>{task.owner}</span>
        </div>
      )}
    </div>
  </div>
);

// Constants for services section
const SERVICE_ROW_HEIGHT = 28;
const SERVICE_HEADER_HEIGHT = 32;

export const GanttChart: React.FC = () => {
  const { project, viewSettings, selectTask, selectedTaskId } = useGanttStore();
  const { members } = useServicesStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [isSyncingScroll, setIsSyncingScroll] = useState(false);
  const { handleMouseDown, handleMouseMove, handleMouseUp, isDragging } = useGanttInteraction();

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Synchronize scroll between sidebar and timeline
  const handleTimelineScroll = () => {
    if (isSyncingScroll || !containerRef.current || !sidebarRef.current) return;
    setIsSyncingScroll(true);
    sidebarRef.current.scrollTop = containerRef.current.scrollTop;
    requestAnimationFrame(() => setIsSyncingScroll(false));
  };

  const handleSidebarScroll = () => {
    if (isSyncingScroll || !containerRef.current || !sidebarRef.current) return;
    setIsSyncingScroll(true);
    containerRef.current.scrollTop = sidebarRef.current.scrollTop;
    requestAnimationFrame(() => setIsSyncingScroll(false));
  };

  // Calculate dimensions
  const ticks = useMemo(() => 
    generateTimeTicks(viewSettings.startDate, viewSettings.endDate, viewSettings.zoomLevel),
    [viewSettings.startDate, viewSettings.endDate, viewSettings.zoomLevel]
  );
  
  // Calculate services section height (simplified)
  const servicesSectionHeight = useMemo(() => {
    // Group members by main service
    const serviceGroups: Record<string, number> = {};
    members.forEach((m) => {
      const mainService = m.service.split(' - ')[0];
      serviceGroups[mainService] = (serviceGroups[mainService] || 0) + 1;
    });
    
    let height = 32; // Separator
    const expandedServices = ['Projet', 'Technical Office', 'Production', 'Logistique'];
    
    Object.entries(serviceGroups).forEach(([service, count]) => {
      if (count > 0) {
        height += SERVICE_HEADER_HEIGHT;
        if (expandedServices.includes(service)) {
          height += count * SERVICE_ROW_HEIGHT;
        }
      }
    });
    
    return height;
  }, [members]);
  
  const totalWidth = ticks.length * viewSettings.columnWidth;
  const projectHeight = project.tasks.length * viewSettings.rowHeight + (project.lanes.length * 40) + 56;
  const totalHeight = projectHeight + servicesSectionHeight;

  // Today line position
  const todayX = useMemo(() => {
    const today = new Date();
    if (isWithinInterval(today, { start: viewSettings.startDate, end: viewSettings.endDate })) {
      return getXForDate(today, viewSettings.startDate, viewSettings.columnWidth, viewSettings.zoomLevel);
    }
    return null;
  }, [viewSettings]);

  useEffect(() => {
    if (containerRef.current) {
      setCanvasWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTaskClick = (taskId: string) => {
    selectTask(taskId);
  };

  const selectedTask = project.tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground border border-border rounded-xl overflow-hidden shadow-xl">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Task List) */}
        <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 z-10">
          {/* Sidebar Header - matches timeline header height */}
          <div className="h-14 border-b-2 border-border flex items-center px-4 bg-muted/30 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tâches du Projet
            </span>
          </div>

          {/* Task List - synced scroll with timeline (hidden scrollbar) */}
          <div 
            ref={sidebarRef}
            className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleSidebarScroll}
          >
            {project.lanes.map((lane, laneIndex) => {
              const laneTasks = project.tasks.filter(t => t.laneId === lane.id);
              const laneColor = LANE_COLORS[lane.id] || LANE_COLORS.impl;
              
              return (
                <div key={lane.id}>
                  {/* Lane Header */}
                  <div 
                    className="h-10 flex items-center px-4 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(90deg, ${lane.color}15 0%, transparent 100%)`,
                      borderLeft: `3px solid ${lane.color}`
                    }}
                  >
                    <span 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: lane.color }}
                    >
                      {lane.name}
                    </span>
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {laneTasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <AnimatePresence>
                    {laneTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "flex items-center px-4 border-b border-border/30 cursor-pointer transition-all duration-200",
                          "hover:bg-accent/50",
                          selectedTaskId === task.id && "bg-accent border-l-2 border-l-primary"
                        )}
                        style={{ height: viewSettings.rowHeight }}
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-sm font-medium truncate">
                            {task.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}
            
            {/* Services Section */}
            <ServicesSectionSidebar startY={projectHeight - 56} />
          </div>
        </div>

        {/* Timeline Area */}
        <div 
          className="flex-1 overflow-auto relative gantt-scroll" 
          ref={containerRef}
          onScroll={handleTimelineScroll}
        >
          <div 
            style={{ width: Math.max(totalWidth, canvasWidth), height: totalHeight }} 
            className="relative bg-gradient-to-b from-muted/20 to-transparent"
          >
            {/* Grid Background */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <defs>
                <pattern 
                  id="grid" 
                  width={viewSettings.columnWidth} 
                  height={viewSettings.rowHeight} 
                  patternUnits="userSpaceOnUse"
                >
                  <path 
                    d={`M ${viewSettings.columnWidth} 0 L 0 0 0 ${viewSettings.rowHeight}`} 
                    fill="none" 
                    stroke="var(--border)" 
                    strokeWidth="0.5" 
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Header (Time Axis) */}
            <div className="sticky top-0 z-20 flex bg-card/95 backdrop-blur-sm border-b-2 border-border h-14 shadow-sm">
              {ticks.map((tick, i) => {
                const isCurrentPeriod = isToday(tick.date) || 
                  (viewSettings.zoomLevel === 'month' && 
                   new Date().getMonth() === tick.date.getMonth() && 
                   new Date().getFullYear() === tick.date.getFullYear());
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col justify-center items-center border-r border-border/50 transition-colors",
                      isCurrentPeriod && "bg-primary/10"
                    )}
                    style={{ width: viewSettings.columnWidth, minWidth: viewSettings.columnWidth }}
                  >
                    <span className={cn(
                      "text-xs font-bold font-mono-data",
                      isCurrentPeriod ? "text-primary" : "text-foreground"
                    )}>
                      {tick.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono-data">
                      {tick.subLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Today Line */}
            {todayX !== null && (
              <div
                className="absolute top-14 bottom-0 w-0.5 bg-red-500 z-30 gantt-today-line pointer-events-none"
                style={{ left: todayX }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg">
                  AUJOURD'HUI
                </div>
              </div>
            )}

            {/* Tasks Rendering */}
            <div className="relative mt-0">
              {(() => {
                let currentY = 0;
                return project.lanes.map(lane => {
                  const laneTasks = project.tasks.filter(t => t.laneId === lane.id);
                  const laneHeaderHeight = 40;
                  const laneY = currentY;
                  currentY += laneHeaderHeight;

                  const tasksRender = laneTasks.map((task) => {
                    const x = getXForDate(task.start, viewSettings.startDate, viewSettings.columnWidth, viewSettings.zoomLevel);
                    const width = getXForDate(task.end, task.start, viewSettings.columnWidth, viewSettings.zoomLevel);
                    const taskY = currentY;
                    currentY += viewSettings.rowHeight;

                    const laneColor = LANE_COLORS[lane.id] || LANE_COLORS.impl;

                    return (
                      <TaskBar
                        key={task.id}
                        task={task}
                        x={x}
                        y={taskY}
                        width={width}
                        height={viewSettings.rowHeight}
                        laneColor={laneColor}
                        isSelected={selectedTaskId === task.id}
                        isDragging={isDragging}
                        onMouseDown={handleMouseDown}
                        onClick={handleTaskClick}
                      />
                    );
                  });

                  return (
                    <React.Fragment key={lane.id}>
                      {/* Lane Background Strip */}
                      <div
                        className="absolute left-0 w-full border-b border-border/20 pointer-events-none"
                        style={{ 
                          top: laneY, 
                          height: laneHeaderHeight,
                          background: `linear-gradient(90deg, ${lane.color}08 0%, transparent 50%)`
                        }}
                      />
                      {tasksRender}
                    </React.Fragment>
                  );
                });
              })()}
              
              {/* Services Timeline */}
              <ServicesSectionTimeline startY={projectHeight - 56} />
            </div>
          </div>
        </div>

        {/* Task Details Panel */}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetailsPanel 
              task={selectedTask} 
              onClose={() => selectTask(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
