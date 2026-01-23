import React from 'react';
import { FLOWCHART_SYMBOLS, NodeType } from '@/types/flowchart';
import { 
  Circle, 
  Square, 
  Diamond, 
  FileText, 
  CircleDot,
  SquareStack,
  Cloud
} from 'lucide-react';

interface PaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

const getIcon = (type: NodeType) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'terminator':
      return <Circle className={iconClass} />;
    case 'process':
    case 'processAcc':
    case 'processEngineering':
    case 'processPlanning':
    case 'processProduction':
    case 'processMcc':
    case 'processLogistics':
    case 'processStore':
    case 'processFinance':
      return <Square className={iconClass} />;
    case 'predefinedProcess':
      return <SquareStack className={iconClass} />;
    case 'decision':
      return <Diamond className={iconClass} />;
    case 'document':
      return <FileText className={iconClass} />;
    case 'connector':
      return <CircleDot className={iconClass} />;
    case 'cloud':
      return <Cloud className={iconClass} />;
    default:
      return <Square className={iconClass} />;
  }
};

const getColorClass = (type: NodeType) => {
  switch (type) {
    case 'terminator':
      return 'bg-white border-slate-400 hover:bg-slate-50 dark:bg-slate-100 dark:border-slate-500';
    case 'process':
    case 'processProduction':
    case 'processMcc':
      return 'bg-blue-100 border-blue-400 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-600';
    case 'processAcc':
      return 'bg-slate-200 border-slate-400 hover:bg-slate-300 dark:bg-slate-700/50 dark:border-slate-500';
    case 'processEngineering':
    case 'processPlanning':
      return 'bg-red-100 border-red-400 hover:bg-red-200 dark:bg-red-900/30 dark:border-red-600';
    case 'processLogistics':
    case 'processStore':
    case 'processFinance':
      return 'bg-green-100 border-green-400 hover:bg-green-200 dark:bg-green-900/30 dark:border-green-600';
    case 'predefinedProcess':
      return 'bg-purple-100 border-purple-400 hover:bg-purple-200 dark:bg-purple-900/30 dark:border-purple-600';
    case 'decision':
      return 'bg-amber-100 border-amber-400 hover:bg-amber-200 dark:bg-amber-900/30 dark:border-amber-600';
    case 'document':
      return 'bg-orange-100 border-orange-400 hover:bg-orange-200 dark:bg-orange-900/30 dark:border-orange-600';
    case 'connector':
      return 'bg-slate-100 border-slate-400 hover:bg-slate-200 dark:bg-slate-700/50 dark:border-slate-500';
    case 'cloud':
      return 'bg-cyan-100 border-cyan-400 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:border-cyan-600';
    default:
      return 'bg-gray-100 border-gray-400';
  }
};

export const Palette: React.FC<PaletteProps> = ({ onDragStart }) => {
  return (
    <div className="flex flex-col gap-1 p-1">
      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
        Symboles
      </span>
      {FLOWCHART_SYMBOLS.map((symbol) => (
        <div
          key={symbol.type}
          draggable
          onDragStart={(e) => onDragStart(e, symbol.type)}
          className={`
            flex items-center gap-2 p-1.5 rounded border cursor-grab
            transition-colors text-[10px]
            ${getColorClass(symbol.type)}
          `}
          title={`${symbol.standardName} - ${symbol.amosUsage}`}
        >
          {getIcon(symbol.type)}
          <span className="truncate">{symbol.standardName}</span>
        </div>
      ))}
    </div>
  );
};
