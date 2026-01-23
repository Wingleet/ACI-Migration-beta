import React from 'react';
import { cn } from '@/lib/utils';
import { useRiskStore } from '@/stores/riskStore';
import { 
  Risk, 
  RISK_CATEGORY_LABELS, 
  RISK_STATUS_LABELS, 
  IMPACT_AREA_LABELS,
  RiskStatus,
} from '@/types/risk';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, 
  AlertTriangle, 
  Shield, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  Circle,
  Loader2,
  Target,
} from 'lucide-react';

interface RiskDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const riskLevelConfig = {
  low: { label: 'Faible', className: 'bg-green-500', textClass: 'text-green-600' },
  medium: { label: 'Moyen', className: 'bg-amber-500', textClass: 'text-amber-600' },
  high: { label: 'Élevé', className: 'bg-red-500', textClass: 'text-red-600' },
};

const statusOptions: { value: RiskStatus; label: string }[] = [
  { value: 'open', label: 'Ouvert' },
  { value: 'mitigated', label: 'Atténué' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'closed', label: 'Clôturé' },
];

export const RiskDetailDrawer: React.FC<RiskDetailDrawerProps> = ({ isOpen, onClose }) => {
  const { getSelectedRisk, getSelectedStudy, updateRisk, updateRiskScoring, updateMitigationAction } = useRiskStore();
  const risk = getSelectedRisk();
  const study = getSelectedStudy();

  if (!isOpen || !risk || !study) return null;

  const levelConfig = riskLevelConfig[risk.scoring.riskLevel];
  const completedActions = risk.mitigationActions.filter((a) => a.status === 'completed').length;
  const progressPercent = risk.mitigationActions.length > 0 
    ? (completedActions / risk.mitigationActions.length) * 100 
    : 0;

  const handleStatusChange = (status: RiskStatus) => {
    updateRisk(study.id, risk.id, { status });
  };

  const handleScoringChange = (field: 'severity' | 'probability' | 'detectability', value: number) => {
    updateRiskScoring(study.id, risk.id, {
      ...risk.scoring,
      [field]: value,
    });
  };

  const toggleActionStatus = (actionId: string) => {
    const action = risk.mitigationActions.find((a) => a.id === actionId);
    if (!action) return;
    
    const newStatus = action.status === 'completed' ? 'pending' : 'completed';
    updateMitigationAction(study.id, risk.id, actionId, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
    });
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className={cn("text-[9px]", levelConfig.className, "text-white")}>
            {levelConfig.label} - Score: {risk.scoring.calculatedScore}
          </Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-sm font-bold leading-tight">{risk.title}</h2>
        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{risk.description}</p>

        {/* Status selector */}
        <div className="mt-2">
          <Select value={risk.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-7 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Scoring */}
        <div className="bg-muted/30 rounded-lg p-2">
          <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" /> Scoring S-P-D
          </h3>
          <div className="space-y-2">
            {[
              { key: 'severity' as const, label: 'Sévérité', value: risk.scoring.severity },
              { key: 'probability' as const, label: 'Probabilité', value: risk.scoring.probability },
              { key: 'detectability' as const, label: 'Détectabilité', value: risk.scoring.detectability },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-[9px]">{item.label}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleScoringChange(item.key, n)}
                      className={cn(
                        "w-5 h-5 rounded text-[8px] font-bold transition-all",
                        item.value >= n 
                          ? n <= 2 ? "bg-green-500 text-white" 
                            : n <= 3 ? "bg-amber-500 text-white" 
                            : "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category & Impact */}
        <div className="bg-muted/30 rounded-lg p-2">
          <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Catégorie & Impacts
          </h3>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[8px]">
              {RISK_CATEGORY_LABELS[risk.category]}
            </Badge>
            {risk.impactAreas.map((area) => (
              <Badge key={area} variant="outline" className="text-[7px]">
                {IMPACT_AREA_LABELS[area]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Owner & Dates */}
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="flex items-center gap-2 text-[9px]">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">{risk.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] mt-1 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Créé: {risk.createdAt} | MAJ: {risk.updatedAt}</span>
          </div>
        </div>

        {/* Mitigation Actions */}
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" /> Actions d'atténuation
            </h3>
            <span className="text-[8px] text-muted-foreground">
              {completedActions}/{risk.mitigationActions.length}
            </span>
          </div>
          
          {risk.mitigationActions.length > 0 && (
            <Progress value={progressPercent} className="h-1 mb-2" />
          )}

          <div className="space-y-1.5">
            {risk.mitigationActions.map((action) => (
              <div 
                key={action.id}
                onClick={() => toggleActionStatus(action.id)}
                className={cn(
                  "p-1.5 rounded border cursor-pointer transition-all",
                  action.status === 'completed' 
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    : "bg-card border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-1.5">
                  {action.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                  ) : action.status === 'in_progress' ? (
                    <Loader2 className="w-3 h-3 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[9px] font-medium leading-tight",
                      action.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {action.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[7px] text-muted-foreground">
                      <span>{action.owner}</span>
                      {action.dueDate && (
                        <>
                          <span>•</span>
                          <span className={cn(
                            action.status !== 'completed' && 
                            action.dueDate < new Date().toISOString().split('T')[0] && 
                            "text-red-600 font-medium"
                          )}>
                            {action.dueDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {risk.mitigationActions.length === 0 && (
              <p className="text-[9px] text-muted-foreground text-center py-2">
                Aucune action définie
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
