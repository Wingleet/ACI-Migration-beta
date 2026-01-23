import React, { useEffect, useState } from 'react';
import { useRiskStore } from '@/stores/riskStore';
import { RiskCard, RiskDetailDrawer, StudyEditDialog } from '@/components/Risk';
import { STUDY_STATUS_LABELS, ChangeStudy } from '@/types/risk';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  FileText, 
  Clock, 
  Plus,
  Pencil,
} from 'lucide-react';

const Risk: React.FC = () => {
  const { 
    studies,
    selectedStudyId, 
    selectedRiskId,
    selectStudy, 
    selectRisk,
    updateStudy,
  } = useRiskStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Auto-select first study on mount
  useEffect(() => {
    if (studies.length > 0 && !selectedStudyId) {
      selectStudy(studies[0].id);
    }
  }, [studies, selectedStudyId, selectStudy]);

  const selectedStudy = studies.find((s) => s.id === selectedStudyId);

  const handleSaveStudy = (updates: Partial<ChangeStudy>) => {
    if (selectedStudy) {
      updateStudy(selectedStudy.id, updates);
    }
  };

  if (!selectedStudy) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent" />
      </div>

      {/* Development Banner */}
      <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-300 dark:border-amber-700 px-4 py-1.5 text-center shrink-0">
        <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
          🚧 En cours de développement...
        </span>
      </div>
      
      {/* Study Header */}
      <div 
        className="px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 cursor-pointer hover:bg-muted/30 transition-colors group"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold">{selectedStudy.title}</h1>
              <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[9px] text-muted-foreground line-clamp-1">
              {selectedStudy.summary || 'Cliquer pour modifier'}
            </p>
          </div>
          <Badge variant="secondary" className="text-[9px]">
            {STUDY_STATUS_LABELS[selectedStudy.status]}
          </Badge>
        </div>

        {/* KPIs */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-[9px]">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span>{selectedStudy.sections.filter((s) => s.status === 'approved').length}/{selectedStudy.sections.length} sections</span>
          </div>
          <div className="flex items-center gap-1 text-[9px]">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>{selectedStudy.risks.filter((r) => r.scoring.riskLevel === 'high' && r.status === 'open').length} risques élevés</span>
          </div>
          {selectedStudy.targetGoLiveDate && (
            <div className="flex items-center gap-1 text-[9px]">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>Go-Live: {selectedStudy.targetGoLiveDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Register */}
      <main className="flex-1 overflow-hidden relative z-10">
        {/* Risks Grid */}
        <div className="h-full overflow-y-auto p-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold">Registre des Risques</h2>
            <Button variant="outline" size="sm" className="h-6 text-[9px]">
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {selectedStudy.risks.map((risk) => (
              <RiskCard
                key={risk.id}
                risk={risk}
                isSelected={risk.id === selectedRiskId}
                onClick={() => selectRisk(risk.id)}
              />
            ))}
          </div>

          {selectedStudy.risks.length === 0 && (
            <div className="text-center py-8 text-[10px] text-muted-foreground">
              Aucun risque enregistré pour cette étude
            </div>
          )}
        </div>
      </main>

      {/* Risk Detail Drawer */}
      <RiskDetailDrawer 
        isOpen={!!selectedRiskId} 
        onClose={() => selectRisk(null)} 
      />

      {/* Study Edit Dialog */}
      <StudyEditDialog
        study={selectedStudy}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveStudy}
      />
    </div>
  );
};

export default Risk;
