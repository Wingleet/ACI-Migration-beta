import React from 'react';
import { ProcessToolbar } from '@/components/Process/ProcessToolbar';
import { ModuleColumn } from '@/components/Process/ModuleColumn';
import { GapAnalysisDrawer } from '@/components/Process/GapAnalysisDrawer';
import { useProcessStore } from '@/stores/processStore';
import { AnimatePresence } from 'framer-motion';
import { getSortedModules } from '@/lib/processData';

export default function Process() {
  const { 
    selectedSubModuleId, 
    selectSubModule, 
    getFilteredModules,
    getSubModuleById 
  } = useProcessStore();

  const filteredModules = getSortedModules(getFilteredModules());
  const selectedData = selectedSubModuleId ? getSubModuleById(selectedSubModuleId) : null;

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent" />
      </div>

      <ProcessToolbar />

      {/* Main Content - Modules Map */}
      <main className="flex-1 overflow-hidden relative z-10">
        <div className="h-full overflow-x-auto overflow-y-hidden px-1 py-1">
          <div className="flex gap-1 h-full">
            {filteredModules.map((module) => (
              <ModuleColumn
                key={module.id}
                module={module}
                selectedSubModuleId={selectedSubModuleId}
                onSelectSubModule={selectSubModule}
              />
            ))}
            
            {filteredModules.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Aucun module ne correspond aux filtres
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Gap Analysis Drawer */}
      <AnimatePresence>
        {selectedData && (
          <GapAnalysisDrawer
            module={selectedData.module}
            subModule={selectedData.subModule}
            onClose={() => selectSubModule(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
