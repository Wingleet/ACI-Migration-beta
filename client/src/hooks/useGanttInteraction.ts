import { useState, useCallback, useRef } from 'react';
import { useGanttStore } from '@/stores/ganttStore';
import { addDays } from 'date-fns';
import { ViewSettings } from '@/types/gantt';

type InteractionMode = 'move' | 'resize-left' | 'resize-right' | null;

/**
 * Convert pixel delta to days based on zoom level
 */
function pixelsToDays(deltaX: number, columnWidth: number, zoomLevel: ViewSettings['zoomLevel']): number {
  const pixelsPerColumn = columnWidth;
  const columnsMovement = deltaX / pixelsPerColumn;
  
  switch (zoomLevel) {
    case 'day':
      return Math.round(columnsMovement);
    case 'week':
      return Math.round(columnsMovement * 7);
    case 'month':
      return Math.round(columnsMovement * 30);
    case 'year':
      return Math.round(columnsMovement * 365);
    default:
      return Math.round(columnsMovement);
  }
}

export function useGanttInteraction() {
  const { viewSettings, updateTask, project, selectTask, recalculate } = useGanttStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragDataRef = useRef<{
    taskId: string;
    originalStart: Date;
    originalEnd: Date;
    originalDuration: number;
    startX: number;
    mode: InteractionMode;
    lastDaysDelta: number;
  } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, taskId: string, interactionMode: InteractionMode) => {
    e.preventDefault();
    e.stopPropagation();
    
    const task = project.tasks.find(t => t.id === taskId);
    if (!task || task.isLocked) return;

    // Select the task
    selectTask(taskId);

    dragDataRef.current = {
      taskId,
      originalStart: new Date(task.start),
      originalEnd: new Date(task.end),
      originalDuration: task.duration,
      startX: e.clientX,
      mode: interactionMode,
      lastDaysDelta: 0,
    };
    
    setIsDragging(true);
  }, [project.tasks, selectTask]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragDataRef.current) return;

    const { taskId, originalStart, originalEnd, originalDuration, startX, mode, lastDaysDelta } = dragDataRef.current;
    const deltaX = e.clientX - startX;
    const daysDelta = pixelsToDays(deltaX, viewSettings.columnWidth, viewSettings.zoomLevel);

    // Only update if the days delta has changed
    if (daysDelta === lastDaysDelta) return;
    dragDataRef.current.lastDaysDelta = daysDelta;

    if (mode === 'move') {
      // Move the entire task
      const newStart = addDays(originalStart, daysDelta);
      const newEnd = addDays(originalEnd, daysDelta);
      updateTask(taskId, { 
        start: newStart, 
        end: newEnd,
      }, true); // Skip recalculate during drag
    } else if (mode === 'resize-right') {
      // Extend/shrink from the right (change end date and duration)
      const newDuration = Math.max(1, originalDuration + daysDelta);
      const newEnd = addDays(originalStart, newDuration);
      updateTask(taskId, { 
        duration: newDuration,
        end: newEnd,
      }, true); // Skip recalculate during drag
    } else if (mode === 'resize-left') {
      // Extend/shrink from the left (change start date and duration)
      const newDuration = Math.max(1, originalDuration - daysDelta);
      if (newDuration >= 1) {
        const newStart = addDays(originalStart, daysDelta);
        updateTask(taskId, { 
          start: newStart, 
          duration: newDuration,
        }, true); // Skip recalculate during drag
      }
    }
  }, [isDragging, viewSettings.columnWidth, viewSettings.zoomLevel, updateTask]);

  const handleMouseUp = useCallback(() => {
    if (dragDataRef.current) {
      // Recalculate dependencies after drag is complete
      recalculate();
    }
    setIsDragging(false);
    dragDataRef.current = null;
  }, [recalculate]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  };
}
