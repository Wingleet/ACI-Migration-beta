import React from 'react';
import { cn } from '@/lib/utils';
import { Risk, RISK_CATEGORY_LABELS, RISK_STATUS_LABELS } from '@/types/risk';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

interface RiskCardProps {
  risk: Risk;
  isSelected: boolean;
  onClick: () => void;
}

const riskLevelConfig = {
  low: { label: 'Faible', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Shield },
  medium: { label: 'Moyen', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  high: { label: 'Élevé', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
};

const statusConfig = {
  open: { className: 'border-red-500', bg: 'hover:bg-red-50 dark:hover:bg-red-950/20' },
  mitigated: { className: 'border-amber-500', bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/20' },
  accepted: { className: 'border-blue-500', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20' },
  closed: { className: 'border-green-500', bg: 'hover:bg-green-50 dark:hover:bg-green-950/20' },
};

export const RiskCard: React.FC<RiskCardProps> = ({ risk, isSelected, onClick }) => {
  const levelConfig = riskLevelConfig[risk.scoring.riskLevel];
  const LevelIcon = levelConfig.icon;
  const statusCfg = statusConfig[risk.status];
  
  const completedActions = risk.mitigationActions.filter((a) => a.status === 'completed').length;
  const totalActions = risk.mitigationActions.length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border border-l-4 cursor-pointer transition-all bg-card",
        statusCfg.className,
        statusCfg.bg,
        isSelected && "ring-2 ring-primary shadow-md"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-[10px] font-semibold leading-tight flex-1 line-clamp-2">
          {risk.title}
        </h4>
        <Badge variant="secondary" className={cn("text-[8px] px-1 py-0 h-4 shrink-0", levelConfig.className)}>
          <LevelIcon className="w-2.5 h-2.5 mr-0.5" />
          {risk.scoring.calculatedScore}
        </Badge>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">
          {RISK_CATEGORY_LABELS[risk.category]}
        </Badge>
        <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">
          {RISK_STATUS_LABELS[risk.status]}
        </Badge>
        {totalActions > 0 && (
          <span className="text-[7px] text-muted-foreground flex items-center gap-0.5">
            <CheckCircle className="w-2.5 h-2.5" />
            {completedActions}/{totalActions}
          </span>
        )}
      </div>

      {/* Owner */}
      <div className="mt-1 text-[8px] text-muted-foreground truncate">
        {risk.owner}
      </div>
    </div>
  );
};
