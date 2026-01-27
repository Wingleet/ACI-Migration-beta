import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  GitBranch, 
  Building2,
  User,
  X,
  ExternalLink,
  List,
  Circle,
} from 'lucide-react';
import { DT_ORGA_DATA, OrgNode, PersonnelInfo, ProcessInfo } from '@/lib/dtOrgaData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'wouter';

// ============================================
// TREE VIEW COMPONENTS
// ============================================

interface OrgNodeCardProps {
  node: OrgNode;
  level: number;
  onSelect: (node: OrgNode) => void;
  selectedId: string | null;
}

const OrgNodeCard: React.FC<OrgNodeCardProps> = ({ node, level, onSelect, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const typeStyles = {
    direction: 'border-l-4 bg-gradient-to-r from-indigo-500/10 to-transparent',
    service: 'border-l-4 bg-gradient-to-r from-purple-500/5 to-transparent',
    unit: 'border-l-2 bg-muted/30',
    role: 'border-l-2 bg-muted/20',
  };

  return (
    <div className="mb-1">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
          typeStyles[node.type],
          isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:bg-accent/50'
        )}
        style={{ 
          marginLeft: level * 16,
          borderLeftColor: node.color || '#6b7280',
        }}
        onClick={() => onSelect(node)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-accent rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: node.color || '#6b7280' }}
        />
        
        <span className={cn(
          'text-sm font-medium',
          node.type === 'direction' && 'text-base font-bold',
          node.type === 'service' && 'font-semibold',
        )}>
          {node.name}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {node.personnel && node.personnel.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              <Users className="w-3 h-3" />
              {node.personnel.length}
            </span>
          )}
          {node.processes && node.processes.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              <GitBranch className="w-3 h-3" />
              {node.processes.length}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <OrgNodeCard
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// RADIAL VIEW COMPONENTS
// ============================================

interface RadialNodeProps {
  node: OrgNode;
  x: number;
  y: number;
  angle: number;
  radius: number;
  level: number;
  parentX?: number;
  parentY?: number;
  onSelect: (node: OrgNode) => void;
  selectedId: string | null;
}

const RadialNode: React.FC<RadialNodeProps> = ({
  node,
  x,
  y,
  angle,
  radius,
  level,
  parentX,
  parentY,
  onSelect,
  selectedId,
}) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  
  // Calculate size based on level
  const nodeSize = level === 0 ? 80 : level === 1 ? 60 : 50;
  
  // Calculate children positions
  const childElements: React.ReactNode[] = [];
  
  if (hasChildren && level < 2) {
    const childCount = node.children!.length;
    const spreadAngle = level === 0 ? 360 : 80; // Wider spread for center
    const startAngle = level === 0 ? 0 : angle - spreadAngle / 2;
    const childRadius = level === 0 ? 180 : 140;
    
    node.children!.forEach((child, index) => {
      const childAngle = startAngle + (spreadAngle / (childCount - 1 || 1)) * index;
      const childAngleRad = (childAngle * Math.PI) / 180;
      const childX = x + Math.cos(childAngleRad) * childRadius;
      const childY = y + Math.sin(childAngleRad) * childRadius;
      
      childElements.push(
        <RadialNode
          key={child.id}
          node={child}
          x={childX}
          y={childY}
          angle={childAngle}
          radius={childRadius}
          level={level + 1}
          parentX={x}
          parentY={y}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      );
    });
  }

  return (
    <>
      {/* Connection line to parent */}
      {parentX !== undefined && parentY !== undefined && (
        <line
          x1={parentX}
          y1={parentY}
          x2={x}
          y2={y}
          stroke={node.color || '#6b7280'}
          strokeWidth={2}
          strokeOpacity={0.4}
        />
      )}
      
      {/* Render children first (behind) */}
      {childElements}
      
      {/* Node circle */}
      <g
        className="cursor-pointer"
        onClick={() => onSelect(node)}
      >
        {/* Glow effect for selected */}
        {isSelected && (
          <circle
            cx={x}
            cy={y}
            r={nodeSize / 2 + 8}
            fill="none"
            stroke={node.color}
            strokeWidth={3}
            strokeOpacity={0.5}
          />
        )}
        
        {/* Main circle */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={`${node.color}20`}
          stroke={node.color}
          strokeWidth={isSelected ? 3 : 2}
          className="transition-all hover:opacity-80"
        />
        
        {/* Icon/Text in center */}
        <foreignObject
          x={x - nodeSize / 2}
          y={y - nodeSize / 2}
          width={nodeSize}
          height={nodeSize}
          className="pointer-events-none"
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            {level === 0 ? (
              <>
                <Building2 className="w-6 h-6" style={{ color: node.color }} />
                <span className="text-[10px] font-bold mt-0.5" style={{ color: node.color }}>
                  DT
                </span>
              </>
            ) : (
              <span 
                className={cn(
                  "text-center leading-tight px-1",
                  level === 1 ? "text-[9px] font-semibold" : "text-[8px] font-medium"
                )}
                style={{ color: node.color }}
              >
                {node.name}
              </span>
            )}
          </div>
        </foreignObject>
        
        {/* Badges */}
        {(node.personnel?.length || node.processes?.length) && level > 0 && (
          <g>
            {node.processes && node.processes.length > 0 && (
              <g>
                <circle
                  cx={x + nodeSize / 2 - 5}
                  cy={y - nodeSize / 2 + 5}
                  r={8}
                  fill={node.color}
                />
                <text
                  x={x + nodeSize / 2 - 5}
                  y={y - nodeSize / 2 + 9}
                  textAnchor="middle"
                  fill="white"
                  fontSize={8}
                  fontWeight="bold"
                >
                  {node.processes.length}
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    </>
  );
};

const RadialView: React.FC<{
  onSelect: (node: OrgNode) => void;
  selectedId: string | null;
}> = ({ onSelect, selectedId }) => {
  const centerX = 400;
  const centerY = 350;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto">
      <svg 
        width="800" 
        height="700" 
        className="min-w-[800px] min-h-[700px]"
        viewBox="0 0 800 700"
      >
        {/* Background circles */}
        <circle cx={centerX} cy={centerY} r={180} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
        <circle cx={centerX} cy={centerY} r={320} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
        
        <RadialNode
          node={DT_ORGA_DATA}
          x={centerX}
          y={centerY}
          angle={0}
          radius={0}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      </svg>
    </div>
  );
};

// ============================================
// DETAIL PANEL
// ============================================

interface DetailPanelProps {
  node: OrgNode;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div 
        className="p-4 border-b border-border"
        style={{ 
          background: `linear-gradient(135deg, ${node.color}15 0%, transparent 100%)`,
          borderLeft: `4px solid ${node.color}`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{node.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{node.type}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Personnel Section */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" style={{ color: node.color }} />
              Personnel
            </h3>
            {node.personnel && node.personnel.length > 0 ? (
              <div className="space-y-2">
                {node.personnel.map((person, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.role}</p>
                      {person.email && (
                        <p className="text-xs text-blue-500">{person.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun personnel assigné</p>
            )}
          </div>

          {/* Processes Section */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4" style={{ color: node.color }} />
              Processus AMOS
            </h3>
            {node.processes && node.processes.length > 0 ? (
              <div className="space-y-2">
                {node.processes.map((process) => (
                  <Link 
                    key={process.id} 
                    href={`/process?module=${process.subModuleId}`}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group">
                      <span 
                        className="text-xs font-mono font-bold px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: `${node.color}20`,
                          color: node.color,
                        }}
                      >
                        {process.subModuleId}
                      </span>
                      <span className="text-sm flex-1">{process.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun processus associé</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

type ViewMode = 'tree' | 'radial';

const DTOrga: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('radial');

  return (
    <div className="h-full w-full flex bg-background overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
      </div>

      {/* Left Panel - Org View */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Organisation DT</h1>
                <p className="text-sm text-muted-foreground">Direction Technique - Structure organisationnelle</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'radial' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={() => setViewMode('radial')}
              >
                <Circle className="w-4 h-4" />
                <span className="text-xs">Radial</span>
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={() => setViewMode('tree')}
              >
                <List className="w-4 h-4" />
                <span className="text-xs">Liste</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'tree' ? (
          <ScrollArea className="flex-1 p-4">
            <OrgNodeCard
              node={DT_ORGA_DATA}
              level={0}
              onSelect={setSelectedNode}
              selectedId={selectedNode?.id || null}
            />
          </ScrollArea>
        ) : (
          <div className="flex-1 overflow-auto">
            <RadialView
              onSelect={setSelectedNode}
              selectedId={selectedNode?.id || null}
            />
          </div>
        )}

        {/* Legend */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500/30 border-2 border-indigo-500" />
              Direction
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500/20 border-2 border-purple-500" />
              Service
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted border-2 border-slate-400" />
              Unité
            </span>
            <span className="flex items-center gap-2 ml-auto text-muted-foreground">
              Cliquez sur un nœud pour voir les détails
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Details */}
      {selectedNode && (
        <div className="w-96 shrink-0 relative z-10">
          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      )}
    </div>
  );
};

export default DTOrga;
