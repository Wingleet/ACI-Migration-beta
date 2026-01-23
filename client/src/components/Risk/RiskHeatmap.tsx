import React from 'react';
import { cn } from '@/lib/utils';
import { useRiskStore } from '@/stores/riskStore';

interface RiskHeatmapProps {
  studyId: string;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ studyId }) => {
  const { getRiskHeatmapData } = useRiskStore();
  const heatmapData = getRiskHeatmapData(studyId);

  const getCellColor = (severity: number, probability: number) => {
    const score = severity * probability;
    if (score >= 16) return 'bg-red-500 text-white';
    if (score >= 9) return 'bg-orange-400 text-white';
    if (score >= 4) return 'bg-yellow-400 text-black';
    return 'bg-green-400 text-black';
  };

  const getCount = (severity: number, probability: number) => {
    const cell = heatmapData.find((d) => d.severity === severity && d.probability === probability);
    return cell?.count || 0;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <h3 className="text-xs font-semibold mb-2 text-foreground">Heatmap Risques</h3>
      <div className="flex gap-1">
        {/* Y-axis label */}
        <div className="flex flex-col justify-between py-1 pr-1">
          <span className="text-[7px] text-muted-foreground rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Probabilité →
          </span>
        </div>
        
        <div className="flex-1">
          {/* Grid */}
          <div className="grid grid-cols-5 gap-0.5">
            {[5, 4, 3, 2, 1].map((prob) =>
              [1, 2, 3, 4, 5].map((sev) => {
                const count = getCount(sev, prob);
                return (
                  <div
                    key={`${sev}-${prob}`}
                    className={cn(
                      "w-6 h-6 rounded-sm flex items-center justify-center text-[8px] font-bold transition-all",
                      getCellColor(sev, prob),
                      count > 0 ? "ring-2 ring-foreground/30" : "opacity-40"
                    )}
                  >
                    {count > 0 ? count : ''}
                  </div>
                );
              })
            )}
          </div>
          
          {/* X-axis label */}
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[7px] text-muted-foreground">1</span>
            <span className="text-[7px] text-muted-foreground">Sévérité →</span>
            <span className="text-[7px] text-muted-foreground">5</span>
          </div>
        </div>
      </div>
    </div>
  );
};
