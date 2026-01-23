import React from 'react';
import { Module } from '@/types/process';
import { SubModuleCard } from './SubModuleCard';
import { cn } from '@/lib/utils';
import { DepartmentColor } from '@/types/process';

interface ModuleColumnProps {
  module: Module;
  selectedSubModuleId: string | null;
  onSelectSubModule: (subModuleId: string) => void;
}

const headerColorClasses: Record<DepartmentColor, string> = {
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  gray: 'bg-slate-500 text-white',
};

export const ModuleColumn: React.FC<ModuleColumnProps> = ({
  module,
  selectedSubModuleId,
  onSelectSubModule,
}) => {
  const doneCount = module.subModules.filter((sm) => sm.status === 'done').length;
  const totalCount = module.subModules.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col w-36 shrink-0 bg-muted/20 rounded overflow-hidden border border-border/50">
      {/* Header */}
      <div className={cn("px-1 py-1 shrink-0 text-center", headerColorClasses[module.departmentColor])}>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono opacity-80">{module.id}</span>
          <span className="text-[8px] font-mono opacity-80">{doneCount}/{totalCount}</span>
        </div>
        <h3 className="font-semibold text-[9px] leading-tight">{module.name}</h3>
      </div>

      {/* Sub-modules list */}
      <div className="flex-1 p-1.5 space-y-2 overflow-y-auto">
        {module.subModules.map((subModule) => (
          <SubModuleCard
            key={subModule.id}
            subModule={subModule}
            departmentColor={module.departmentColor}
            isActive={selectedSubModuleId === subModule.id}
            onClick={() => onSelectSubModule(subModule.id)}
          />
        ))}
        {module.subModules.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Aucun résultat
          </div>
        )}
      </div>
    </div>
  );
};
