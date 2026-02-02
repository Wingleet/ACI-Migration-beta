import React, { useMemo, useEffect } from 'react';
import { ProcessToolbar } from '@/components/Process/ProcessToolbar';
import { ModuleColumn } from '@/components/Process/ModuleColumn';
import { GapAnalysisDrawer } from '@/components/Process/GapAnalysisDrawer';
import { useProcessStore } from '@/stores/processStore';
import { AnimatePresence } from 'framer-motion';
import { getSortedModules } from '@/lib/processData';
import { Table2, Loader2, Check, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useSearch, useLocation } from 'wouter';

export default function Process() {
  const { 
    selectedSubModuleId, 
    selectSubModule, 
    getFilteredModules,
    getSubModuleById,
    loadFromNetlify,
    isSyncing,
    lastSyncedAt,
  } = useProcessStore();
  
  // Charger les données depuis Netlify au démarrage
  useEffect(() => {
    loadFromNetlify();
  }, []);
  
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  
  // Auto-select module from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const moduleParam = params.get('module');
    if (moduleParam && moduleParam !== selectedSubModuleId) {
      selectSubModule(moduleParam);
      // Clear the URL parameter after selection
      setLocation('/process', { replace: true });
    }
  }, [searchString, selectSubModule, selectedSubModuleId, setLocation]);

  const filteredModules = getSortedModules(getFilteredModules());
  const selectedData = selectedSubModuleId ? getSubModuleById(selectedSubModuleId) : null;

  // Flatten all submodules for table view
  const allSubModules = useMemo(() => {
    return filteredModules.flatMap(module => 
      module.subModules.map(sub => ({
        ...sub,
        moduleName: module.name,
        moduleId: module.id,
        moduleColor: module.departmentColor,
      }))
    );
  }, [filteredModules]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent" />
      </div>

      <ProcessToolbar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="flex flex-col gap-2 p-2 min-h-full">
          {/* Columns Section - Fit content */}
          <div className="shrink-0">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {filteredModules.map((module) => (
                <ModuleColumn
                  key={module.id}
                  module={module}
                  selectedSubModuleId={selectedSubModuleId}
                  onSelectSubModule={selectSubModule}
                />
              ))}
              
              {filteredModules.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground py-8">
                  Aucun module ne correspond aux filtres
                </div>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
            <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-xs font-semibold flex items-center gap-2">
                <Table2 className="w-3.5 h-3.5" />
                Récapitulatif Gap Analysis
              </h3>
              {/* Indicateur de synchronisation Netlify */}
              {isSyncing ? (
                <Badge variant="secondary" className="gap-1.5 animate-pulse text-[10px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sync...
                </Badge>
              ) : lastSyncedAt && (
                <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-300 text-[10px]">
                  <Cloud className="w-3 h-3" />
                  Netlify
                </Badge>
              )}
            </div>
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-muted-foreground w-16">ID</th>
                    <th className="text-left p-2 font-semibold text-muted-foreground w-32">Module</th>
                    <th className="text-left p-2 font-semibold text-muted-foreground">Sous-module</th>
                    <th className="text-center p-2 font-semibold text-muted-foreground w-20">Sélectionné</th>
                    <th className="text-center p-2 font-semibold text-muted-foreground w-16">Verdict</th>
                    <th className="text-left p-2 font-semibold text-muted-foreground">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubModules.map((sub, idx) => (
                    <tr 
                      key={sub.id}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors",
                        idx % 2 === 0 ? "bg-muted/10" : "",
                        selectedSubModuleId === sub.id && "bg-primary/10"
                      )}
                      onClick={() => selectSubModule(sub.id)}
                    >
                      <td className="p-1.5 font-mono text-[10px] text-muted-foreground">{sub.id}</td>
                      <td className="p-1.5">
                        <span className={cn(
                          "text-[9px] font-medium px-1.5 py-0.5 rounded",
                          sub.moduleColor === 'red' && "bg-red-100 text-red-700",
                          sub.moduleColor === 'blue' && "bg-blue-100 text-blue-700",
                          sub.moduleColor === 'green' && "bg-green-100 text-green-700",
                          sub.moduleColor === 'gray' && "bg-gray-100 text-gray-700",
                        )}>
                          {sub.moduleName}
                        </span>
                      </td>
                      <td className="p-1.5 font-medium text-[11px]">{sub.name}</td>
                      <td className="p-1.5 text-center">
                        {sub.isSelected ? (
                          <span className="text-emerald-600 font-semibold text-[10px]">Oui</span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Non</span>
                        )}
                      </td>
                      <td className="p-1.5 text-center">
                        {sub.gapRecord.verdict === 'fit' && (
                          <span className="text-emerald-600 font-bold text-[10px]">FIT</span>
                        )}
                        {sub.gapRecord.verdict === 'gap' && (
                          <span className="text-red-600 font-bold text-[10px]">GAP</span>
                        )}
                        {sub.gapRecord.verdict === 'na' && (
                          <span className="text-gray-500 font-medium text-[10px]">N/A</span>
                        )}
                        {!sub.gapRecord.verdict && (
                          <span className="text-gray-300 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-1.5 text-muted-foreground text-[10px] truncate max-w-[200px]">
                        {sub.gapRecord.comments?.length > 0 
                          ? sub.gapRecord.comments[0].content 
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
