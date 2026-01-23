import React from 'react';
import { SubModule, DepartmentColor } from '@/types/process';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check } from 'lucide-react';

interface SubModuleCardProps {
  subModule: SubModule;
  departmentColor: DepartmentColor;
  isActive: boolean; // UI state: currently clicked/selected in drawer
  onClick: () => void;
}

const verdictConfig = {
  fit: { label: 'FIT', className: 'bg-emerald-500 text-white' },
  gap: { label: 'GAP', className: 'bg-red-500 text-white' },
  na: { label: 'N/A', className: 'bg-slate-400 text-white' },
};

const departmentColorClasses: Record<DepartmentColor, string> = {
  red: 'border-l-red-500 hover:bg-red-50 dark:hover:bg-red-950/20',
  blue: 'border-l-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20',
  green: 'border-l-green-500 hover:bg-green-50 dark:hover:bg-green-950/20',
  gray: 'border-l-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950/20',
};

export const SubModuleCard: React.FC<SubModuleCardProps> = ({
  subModule,
  departmentColor,
  isActive,
  onClick,
}) => {
  const verdict = subModule.gapRecord.verdict ? verdictConfig[subModule.gapRecord.verdict] : null;
  const hasHighRisk = subModule.gapRecord.risks.some((r) => r.criticality === 'high');

  return (
    <div
      onClick={onClick}
      className={cn(
        "px-1.5 py-1 rounded-sm border-l-2 cursor-pointer transition-colors relative",
        "hover:bg-accent/50",
        departmentColorClasses[departmentColor],
        isActive && "ring-1 ring-primary bg-accent",
        // Non sélectionné = grisé
        !subModule.isSelected && "opacity-50 bg-slate-100 dark:bg-slate-800/50"
      )}
    >
      <div className="flex items-start gap-1">
        {/* Indicateur vert/gris */}
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0 mt-0.5",
          subModule.isSelected ? "bg-emerald-500" : "bg-slate-400"
        )}>
          {subModule.isSelected && (
            <Check className="w-2 h-2 text-white" />
          )}
        </div>
        <span className="text-[7px] font-mono text-muted-foreground shrink-0 mt-0.5">
          {subModule.id.split('.')[1]}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "text-[9px] leading-tight break-words",
            !subModule.isSelected && "text-muted-foreground"
          )}>
            {subModule.name}
          </h4>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
          {verdict && (
            <span className={cn("text-[6px] px-0.5 rounded font-bold", verdict.className)}>
              {verdict.label}
            </span>
          )}
          {hasHighRisk && (
            <AlertTriangle className="w-2 h-2 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};
