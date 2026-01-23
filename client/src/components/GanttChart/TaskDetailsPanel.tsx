import React, { useState } from 'react';
import { Task } from '@/types/gantt';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  X, 
  Calendar, 
  Clock, 
  Flag, 
  Lock, 
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Minus,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useGanttStore } from '@/stores/ganttStore';

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
}

const statusConfig = {
  'planned': { 
    label: 'Planifié', 
    color: 'bg-slate-500', 
    icon: Calendar,
    textColor: 'text-slate-500'
  },
  'in-progress': { 
    label: 'En cours', 
    color: 'bg-sky-500', 
    icon: Clock,
    textColor: 'text-sky-500'
  },
  'completed': { 
    label: 'Terminé', 
    color: 'bg-emerald-500', 
    icon: CheckCircle2,
    textColor: 'text-emerald-500'
  },
  'delayed': { 
    label: 'En retard', 
    color: 'bg-red-500', 
    icon: AlertTriangle,
    textColor: 'text-red-500'
  },
};

export const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({ task, onClose }) => {
  const { updateTask } = useGanttStore();
  const status = task.status || 'planned';
  const statusInfo = statusConfig[status];
  
  const daysRemaining = differenceInDays(task.end, new Date());
  const isOverdue = daysRemaining < 0 && task.progress < 100;

  const [editingDuration, setEditingDuration] = useState(false);
  const [durationInput, setDurationInput] = useState(task.duration.toString());

  const handleToggleLock = () => {
    updateTask(task.id, { isLocked: !task.isLocked });
  };

  const handleDurationChange = (newDuration: number) => {
    if (newDuration < 1 || task.isLocked) return;
    const newEnd = addDays(task.start, newDuration);
    updateTask(task.id, { 
      duration: newDuration,
      end: newEnd
    });
  };

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDurationInput(e.target.value);
  };

  const handleDurationInputBlur = () => {
    const newDuration = parseInt(durationInput, 10);
    if (!isNaN(newDuration) && newDuration >= 1) {
      handleDurationChange(newDuration);
    } else {
      setDurationInput(task.duration.toString());
    }
    setEditingDuration(false);
  };

  const handleDurationInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDurationInputBlur();
    } else if (e.key === 'Escape') {
      setDurationInput(task.duration.toString());
      setEditingDuration(false);
    }
  };

  // Sync duration input when task changes
  React.useEffect(() => {
    setDurationInput(task.duration.toString());
  }, [task.duration]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="border-l border-border bg-card flex flex-col shrink-0 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {task.type === 'milestone' && (
                  <Flag className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <Badge 
                  variant="secondary" 
                  className={cn("text-[10px] font-bold", statusInfo.color, "text-white")}
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <h3 className="font-display text-lg leading-tight">{task.name}</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 -mr-2 -mt-2"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Dates Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Dates
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Début
                </span>
                <span className="font-mono-data text-sm font-medium">
                  {format(task.start, 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Fin
                </span>
                <span className="font-mono-data text-sm font-medium">
                  {format(task.end, 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>

            {/* Editable Duration */}
            <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Durée</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDurationChange(task.duration - 1)}
                  disabled={task.isLocked || task.duration <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                {editingDuration ? (
                  <Input
                    type="number"
                    min="1"
                    value={durationInput}
                    onChange={handleDurationInputChange}
                    onBlur={handleDurationInputBlur}
                    onKeyDown={handleDurationInputKeyDown}
                    className="w-16 h-7 text-center font-mono-data font-bold text-sm"
                    autoFocus
                    disabled={task.isLocked}
                  />
                ) : (
                  <button
                    onClick={() => !task.isLocked && setEditingDuration(true)}
                    className={cn(
                      "font-mono-data font-bold px-2 py-1 rounded hover:bg-muted transition-colors min-w-[60px] text-center",
                      task.isLocked && "cursor-not-allowed opacity-50"
                    )}
                    disabled={task.isLocked}
                  >
                    {task.duration} j
                  </button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDurationChange(task.duration + 1)}
                  disabled={task.isLocked}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Days remaining indicator */}
            {task.progress < 100 && (
              <div className={cn(
                "flex items-center justify-between rounded-lg p-3",
                isOverdue ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-muted/30"
              )}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">
                    {isOverdue ? 'Retard' : 'Jours restants'}
                  </span>
                </div>
                <span className="font-mono-data font-bold">
                  {isOverdue ? Math.abs(daysRemaining) : daysRemaining} j
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Baseline comparison (if exists) */}
          {task.baselineStart && task.baselineEnd && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  Baseline
                </h4>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Début prévu:</span>
                    <span className="font-mono-data">
                      {format(task.baselineStart, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fin prévue:</span>
                    <span className="font-mono-data">
                      {format(task.baselineEnd, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleToggleLock}
        >
          {task.isLocked ? (
            <>
              <Unlock className="w-4 h-4" />
              Déverrouiller la tâche
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Verrouiller la tâche
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
