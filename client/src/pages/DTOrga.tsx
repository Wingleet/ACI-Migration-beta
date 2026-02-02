import React, { useState, useMemo, useRef, useCallback, memo } from 'react';
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileDown,
  Loader2,
} from 'lucide-react';
import { DT_ORGA_DATA, OrgNode, PersonnelInfo, ProcessInfo, getAllServicesAndUnits } from '@/lib/dtOrgaData';
import { useDTOrgaStore } from '@/stores/dtOrgaStore';
import { useProcessStore } from '@/stores/processStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'wouter';
import { jsPDF } from 'jspdf';

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
  level: number;
  parentX?: number;
  parentY?: number;
  onSelect: (node: OrgNode) => void;
  selectedId: string | null;
  showPersonnel: boolean;
  centerX: number;
  centerY: number;
}

const RadialNode: React.FC<RadialNodeProps> = ({
  node,
  x,
  y,
  angle,
  level,
  parentX,
  parentY,
  onSelect,
  selectedId,
  showPersonnel,
  centerX,
  centerY,
}) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  
  // Sizes based on level
  const nodeSize = level === 0 ? 70 : level === 1 ? 55 : 45;
  
  // Calculate children positions
  const childElements: React.ReactNode[] = [];
  
  if (hasChildren && level < 2) {
    const childCount = node.children!.length;
    // Wider spread and larger radius
    const childRadius = level === 0 ? 180 : 150;
    
    node.children!.forEach((child, index) => {
      // For level 0, distribute evenly around the circle (360/n spacing)
      // For level 1, spread children around parent angle
      let childAngle: number;
      if (level === 0) {
        // Evenly distribute around circle, starting from top (-90)
        childAngle = -90 + (360 / childCount) * index;
      } else {
        const spreadAngle = 70;
        const startAngle = angle - spreadAngle / 2;
        childAngle = childCount === 1 
          ? angle 
          : startAngle + (spreadAngle / (childCount - 1)) * index;
      }
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
          level={level + 1}
          parentX={x}
          parentY={y}
          onSelect={onSelect}
          selectedId={selectedId}
          showPersonnel={showPersonnel}
          centerX={centerX}
          centerY={centerY}
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
          strokeWidth={level === 1 ? 2.5 : 2}
          strokeOpacity={0.35}
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
            r={nodeSize / 2 + 6}
            fill="none"
            stroke={node.color}
            strokeWidth={3}
            strokeOpacity={0.6}
          />
        )}
        
        {/* Main circle */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={`${node.color}25`}
          stroke={node.color}
          strokeWidth={isSelected ? 3 : 2}
          className="transition-all"
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
                <Building2 className="w-5 h-5" style={{ color: node.color }} />
                <span className="text-[9px] font-bold mt-0.5" style={{ color: node.color }}>
                  DT
                </span>
              </>
            ) : (
              <span 
                className={cn(
                  "text-center leading-tight px-0.5",
                  level === 1 ? "text-[8px] font-semibold" : "text-[7px] font-medium"
                )}
                style={{ color: node.color }}
              >
                {node.name}
              </span>
            )}
          </div>
        </foreignObject>
        
        {/* Combined badge (personnel / processes) */}
        {((node.personnel && node.personnel.length > 0) || (node.processes && node.processes.length > 0)) && level > 0 && (
          <g>
            {/* Personnel badge - top right */}
            {node.personnel && node.personnel.length > 0 && (
              <>
                <circle
                  cx={x + nodeSize / 2 - 3}
                  cy={y - nodeSize / 2 + 3}
                  r={8}
                  fill="#3b82f6"
                />
                <text
                  x={x + nodeSize / 2 - 3}
                  y={y - nodeSize / 2 + 7}
                  textAnchor="middle"
                  fill="white"
                  fontSize={7}
                  fontWeight="bold"
                >
                  {node.personnel.length}
                </text>
              </>
            )}
            
            {/* Process badge - top left */}
            {node.processes && node.processes.length > 0 && (
              <>
                <circle
                  cx={x - nodeSize / 2 + 3}
                  cy={y - nodeSize / 2 + 3}
                  r={7}
                  fill="#10b981"
                />
                <text
                  x={x - nodeSize / 2 + 3}
                  y={y - nodeSize / 2 + 6}
                  textAnchor="middle"
                  fill="white"
                  fontSize={6}
                  fontWeight="bold"
                >
                  {node.processes.length}
                </text>
              </>
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
  showPersonnel: boolean;
  zoom: number;
}> = ({ onSelect, selectedId, showPersonnel, zoom }) => {
  const centerX = 450;
  const centerY = 380;
  const scale = zoom / 100;
  
  // Pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning on middle click or when holding space
    if (e.button === 1 || e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  }, [isPanning, startPan]);
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <svg 
        width={900 * scale} 
        height={760 * scale} 
        style={{ 
          minWidth: 900 * scale, 
          minHeight: 760 * scale,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
        viewBox="0 0 900 760"
      >
        {/* Background circles */}
        <circle cx={centerX} cy={centerY} r={180} fill="none" stroke="currentColor" strokeOpacity={0.04} strokeWidth={1} />
        <circle cx={centerX} cy={centerY} r={330} fill="none" stroke="currentColor" strokeOpacity={0.04} strokeWidth={1} />
        
        <RadialNode
          node={DT_ORGA_DATA}
          x={centerX}
          y={centerY}
          angle={0}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
          showPersonnel={showPersonnel}
          centerX={centerX}
          centerY={centerY}
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
  // Get dynamic services and process data
  const { getAllServicesAndUnits: getDynamicServices } = useDTOrgaStore();
  const { modules } = useProcessStore();
  
  // Get processes for this node from dynamic store
  const dynamicProcesses = useMemo(() => {
    const allServices = getDynamicServices();
    const service = allServices.find(s => s.id === node.id);
    
    if (service) {
      // Map subModuleIds to ProcessInfo with names from processStore
      return service.subModuleIds.map(subModuleId => {
        // Find the submodule in processStore to get the name
        for (const module of modules) {
          const subModule = module.subModules.find(sm => sm.id === subModuleId);
          if (subModule) {
            return {
              id: `p-${subModuleId}`,
              name: subModule.name,
              subModuleId: subModuleId
            } as ProcessInfo;
          }
        }
        // Fallback: check static data
        const staticProcess = node.processes?.find(p => p.subModuleId === subModuleId);
        return staticProcess || {
          id: `p-${subModuleId}`,
          name: subModuleId,
          subModuleId: subModuleId
        } as ProcessInfo;
      });
    }
    // Fallback to static processes
    return node.processes || [];
  }, [node.id, node.processes, getDynamicServices, modules]);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
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

      <div className="flex-1 overflow-y-auto">
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
              Processus AMOS ({dynamicProcesses.length})
            </h3>
            {dynamicProcesses.length > 0 ? (
              <div className="space-y-2">
                {dynamicProcesses.map((process) => (
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
      </div>
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
  const [showPersonnel, setShowPersonnel] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  // Export org chart to PDF - Single page with spread layout
  const handleExportPdf = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      // Helper to draw a box with personnel
      const drawBox = (x: number, y: number, width: number, title: string, personnel: PersonnelInfo[], color: string, isService: boolean = false): number => {
        const headerHeight = isService ? 9 : 7;
        const lineHeight = 4.5;
        const padding = 2.5;
        
        // Calculate height based on personnel
        const personnelHeight = personnel.length * lineHeight;
        const totalHeight = headerHeight + personnelHeight + padding * 2;
        
        // Background
        pdf.setFillColor('#ffffff');
        pdf.roundedRect(x, y, width, totalHeight, 1.5, 1.5, 'F');
        
        // Border
        pdf.setDrawColor(color);
        pdf.setLineWidth(isService ? 0.6 : 0.3);
        pdf.roundedRect(x, y, width, totalHeight, 1.5, 1.5, 'S');
        
        // Header
        pdf.setFillColor(color);
        pdf.roundedRect(x, y, width, headerHeight, 1.5, 1.5, 'F');
        pdf.rect(x, y + headerHeight - 1.5, width, 1.5, 'F');
        
        // Title
        pdf.setTextColor('#ffffff');
        pdf.setFontSize(isService ? 9 : 7);
        pdf.setFont('helvetica', 'bold');
        const maxTitleLen = Math.floor(width / 2.2);
        const displayTitle = title.length > maxTitleLen ? title.substring(0, maxTitleLen - 2) + '..' : title;
        pdf.text(displayTitle, x + width/2 - pdf.getTextWidth(displayTitle)/2, y + (isService ? 6.5 : 5));
        
        // Personnel
        let pY = y + headerHeight + padding;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#334155');
        pdf.setFontSize(5.5);
        
        personnel.forEach((person) => {
          const nameParts = person.name.split(' ');
          const shortName = nameParts.length > 1 
            ? `${nameParts[0].charAt(0)}. ${nameParts.slice(1).join(' ')}` 
            : person.name;
          const maxLen = Math.floor(width / 2);
          const displayName = shortName.length > maxLen ? shortName.substring(0, maxLen - 2) + '..' : shortName;
          pdf.text(displayName, x + 2, pY + 2.5);
          pY += lineHeight;
        });
        
        return totalHeight;
      };
      
      // Draw connection line
      const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        pdf.setDrawColor('#94a3b8');
        pdf.setLineWidth(0.3);
        pdf.line(x1, y1, x2, y2);
      };
      
      // Title
      pdf.setTextColor('#1e293b');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Organigramme Direction Technique', pageWidth/2 - 32, margin);
      
      const services = DT_ORGA_DATA.children || [];
      
      // Layout positions - spread across the page
      // DT at center top
      const dtWidth = 45;
      const dtX = pageWidth/2 - dtWidth/2;
      const dtY = margin + 8;
      const dtHeight = drawBox(dtX, dtY, dtWidth, DT_ORGA_DATA.name, DT_ORGA_DATA.personnel || [], '#6366f1', true);
      
      // Define service positions spread across the page
      // [Bureau Technique, Production, Logistique, MCC, Compliance, Admin]
      const servicePositions = [
        { name: 'bureau-technique', x: margin + 40, y: 45, unitsBelow: true },
        { name: 'production', x: pageWidth/2 - 20, y: 110, unitsBelow: true },
        { name: 'logistique', x: margin + 80, y: pageHeight/2 + 5, unitsBelow: true },
        { name: 'mcc', x: pageWidth - margin - 50, y: pageHeight/2 + 30, unitsBelow: false },
        { name: 'compliance-safety', x: pageWidth/2 + 70, y: 55, unitsBelow: false },
        { name: 'admin', x: pageWidth - margin - 45, y: 55, unitsBelow: false },
      ];
      
      const serviceWidth = 40;
      const unitWidth = 32;
      
      services.forEach((service, idx) => {
        const pos = servicePositions[idx] || { x: margin + idx * 50, y: 60, unitsBelow: true };
        
        // Draw connection from DT to service
        const dtCenterX = dtX + dtWidth/2;
        const dtBottomY = dtY + dtHeight;
        const serviceCenterX = pos.x + serviceWidth/2;
        
        // Elbow connection
        const midY = (dtBottomY + pos.y) / 2;
        drawLine(dtCenterX, dtBottomY, dtCenterX, midY);
        drawLine(dtCenterX, midY, serviceCenterX, midY);
        drawLine(serviceCenterX, midY, serviceCenterX, pos.y);
        
        // Draw service box
        const serviceHeight = drawBox(pos.x, pos.y, serviceWidth, service.name, service.personnel || [], service.color || '#8b5cf6', true);
        
        // Draw units
        const units = service.children || [];
        if (units.length > 0) {
          const unitGap = 3;
          const unitsPerRow = Math.min(units.length, 4);
          const totalUnitsWidth = unitsPerRow * unitWidth + (unitsPerRow - 1) * unitGap;
          
          let unitStartX = pos.x + (serviceWidth - totalUnitsWidth) / 2;
          if (unitStartX < pos.x - 20) unitStartX = pos.x - 20;
          
          let unitY = pos.y + serviceHeight + 8;
          let currentRow = 0;
          
          units.forEach((unit, uIdx) => {
            const col = uIdx % unitsPerRow;
            if (col === 0 && uIdx > 0) {
              currentRow++;
              unitY += 35;
            }
            
            const uX = unitStartX + col * (unitWidth + unitGap);
            
            // Connection from service to unit
            if (uIdx < unitsPerRow) {
              const unitCenterX = uX + unitWidth/2;
              const serviceBottomY = pos.y + serviceHeight;
              const connY = pos.y + serviceHeight + 4;
              
              if (uIdx === 0 && units.length > 1) {
                drawLine(pos.x + serviceWidth/2, serviceBottomY, pos.x + serviceWidth/2, connY);
                const firstUnitX = unitStartX + unitWidth/2;
                const lastUnitX = unitStartX + (Math.min(units.length, unitsPerRow) - 1) * (unitWidth + unitGap) + unitWidth/2;
                drawLine(firstUnitX, connY, lastUnitX, connY);
              } else if (units.length === 1) {
                drawLine(pos.x + serviceWidth/2, serviceBottomY, unitCenterX, unitY);
              }
              drawLine(unitCenterX, connY, unitCenterX, unitY);
            }
            
            drawBox(uX, unitY, unitWidth, unit.name, unit.personnel?.slice(0, 8) || [], unit.color || '#10b981', false);
          });
        }
      });
      
      // Footer
      pdf.setFontSize(5);
      pdf.setTextColor('#94a3b8');
      const exportDate = new Date().toLocaleDateString('fr-FR');
      pdf.text(`Aircalin - Direction Technique - Exporté le ${exportDate}`, margin, pageHeight - 5);
      
      // Save
      pdf.save('Organigramme_DT.pdf');
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

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

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              {viewMode === 'radial' && (
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setZoom(Math.max(10, zoom - 10))}
                    disabled={zoom <= 10}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs font-medium min-w-[3rem] text-center">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setZoom(100)}
                    disabled={zoom === 100}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
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

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span className="text-xs">Export PDF</span>
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
              showPersonnel={showPersonnel}
              zoom={zoom}
            />
          </div>
        )}

        {/* Legend */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Personnel
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Process
            </span>
            <span className="flex items-center gap-2 ml-auto text-muted-foreground/70">
              Cliquez sur un cercle pour voir les détails • Glissez pour naviguer
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Details */}
      {selectedNode && (
        <div className="w-96 shrink-0 relative z-10 h-full overflow-hidden">
          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      )}
    </div>
  );
};

export default DTOrga;
