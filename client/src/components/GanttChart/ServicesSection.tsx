import React, { useState, useMemo } from 'react';
import {
  useServicesStore,
  groupMembersByService,
  SERVICE_COLORS,
  TeamMember,
} from '@/stores/servicesStore';
import { useGanttStore } from '@/stores/ganttStore';
import { getXForDate } from '@/lib/ganttUtils';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  User,
  Building2,
  Network,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ROW_HEIGHT = 28;
const SERVICE_HEADER_HEIGHT = 32;

// Service order for display
const SERVICE_ORDER = [
  'Projet',
  'BA DTN',
  'Technical Office',
  'Production',
  'Logistique',
  'IT',
  'HR',
  'Partners',
];

// Main Services Section Sidebar
interface ServicesSectionProps {
  startY: number;
}

export const ServicesSectionSidebar: React.FC<ServicesSectionProps> = ({ startY }) => {
  const { members, addMember, removeMember } = useServicesStore();
  const [expandedServices, setExpandedServices] = useState<string[]>(['Projet', 'Technical Office', 'Production', 'Logistique']);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    role: 'Business Specialist',
    service: 'Production',
    company: '',
  });

  const groupedMembers = groupMembersByService(members);

  const toggleService = (service: string) => {
    setExpandedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleAddMember = () => {
    if (newMember.firstName && newMember.lastName) {
      addMember({
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        role: newMember.role,
        service: newMember.service,
        company: newMember.company || undefined,
      });
      setNewMember({
        firstName: '',
        lastName: '',
        role: 'Business Specialist',
        service: 'Production',
        company: '',
      });
      setShowAddDialog(false);
    }
  };

  return (
    <>
      {/* Section Header */}
      <div
        className="flex items-center justify-between px-4 border-b-2 border-t-2 border-border bg-muted/50"
        style={{ height: 32 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Services Impactés
        </span>
        <div className="flex items-center gap-1">
          <Link href="/organigrame">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              title="Voir l'organigramme"
            >
              <Network className="w-3 h-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setShowAddDialog(true)}
            title="Ajouter un membre"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Services List */}
      {SERVICE_ORDER.map((serviceName) => {
        const serviceMembers = groupedMembers[serviceName] || [];
        if (serviceMembers.length === 0) return null;

        const isExpanded = expandedServices.includes(serviceName);
        const color = SERVICE_COLORS[serviceName] || '#6b7280';

        return (
          <div key={serviceName}>
            {/* Service Header */}
            <div
              className="flex items-center justify-between px-3 border-b border-border/40 cursor-pointer hover:bg-accent/30 transition-colors"
              style={{
                height: SERVICE_HEADER_HEIGHT,
                borderLeft: `3px solid ${color}`,
                background: `linear-gradient(90deg, ${color}10 0%, transparent 100%)`,
              }}
              onClick={() => toggleService(serviceName)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span
                  className="text-xs font-semibold"
                  style={{ color }}
                >
                  {serviceName}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">
                {serviceMembers.length}
              </span>
            </div>

            {/* Members */}
            {isExpanded && serviceMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-3 border-b border-border/20 hover:bg-accent/20 group transition-colors"
                style={{ height: ROW_HEIGHT, paddingLeft: 24 }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <User className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs truncate">
                    {member.firstName} {member.lastName}
                  </span>
                  {member.company && (
                    <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">
                      {member.company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground hidden group-hover:block">
                    {member.role}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMember(member.id);
                    }}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Ajouter un membre
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Prénom"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                className="h-9"
              />
              <Input
                placeholder="Nom"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                className="h-9"
              />
            </div>
            <Select
              value={newMember.role}
              onValueChange={(v) => setNewMember({ ...newMember, role: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chef de projet">Chef de projet</SelectItem>
                <SelectItem value="Key User">Key User</SelectItem>
                <SelectItem value="Business Specialist">Business Specialist</SelectItem>
                <SelectItem value="BA">BA</SelectItem>
                <SelectItem value="Référent IT">Référent IT</SelectItem>
                <SelectItem value="PMO">PMO</SelectItem>
                <SelectItem value="Intégrateur">Intégrateur</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newMember.service}
              onValueChange={(v) => setNewMember({ ...newMember, service: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Projet">Projet</SelectItem>
                <SelectItem value="BA DTN">BA DTN</SelectItem>
                <SelectItem value="Technical Office">Technical Office</SelectItem>
                <SelectItem value="Technical Office - Engineering">Technical Office - Engineering</SelectItem>
                <SelectItem value="Technical Office - Planning">Technical Office - Planning</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Production - MCC">Production - MCC</SelectItem>
                <SelectItem value="Production - Cabine">Production - Cabine</SelectItem>
                <SelectItem value="Production - SGS">Production - SGS</SelectItem>
                <SelectItem value="Production - Preparator">Production - Preparator</SelectItem>
                <SelectItem value="Logistique">Logistique</SelectItem>
                <SelectItem value="Logistique - Achats">Logistique - Achats</SelectItem>
                <SelectItem value="Logistique - Finance">Logistique - Finance</SelectItem>
                <SelectItem value="Logistique - Magasin">Logistique - Magasin</SelectItem>
                <SelectItem value="Logistique - Import">Logistique - Import</SelectItem>
                <SelectItem value="Logistique - Contrats">Logistique - Contrats</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Partners">Partners</SelectItem>
              </SelectContent>
            </Select>
            {newMember.service === 'Partners' && (
              <Input
                placeholder="Entreprise (ex: NEO Conseil)"
                value={newMember.company}
                onChange={(e) => setNewMember({ ...newMember, company: e.target.value })}
                className="h-9"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleAddMember} disabled={!newMember.firstName || !newMember.lastName}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Get workload color based on days per week (green to red gradient)
const getWorkloadColor = (daysPerWeek: number): { bg: string; border: string; label: string } => {
  if (daysPerWeek >= 5) {
    return { bg: '#ef4444', border: '#dc2626', label: 'Très élevé' }; // Red
  } else if (daysPerWeek >= 4) {
    return { bg: '#f97316', border: '#ea580c', label: 'Élevé' }; // Orange
  } else if (daysPerWeek >= 3) {
    return { bg: '#eab308', border: '#ca8a04', label: 'Moyen' }; // Yellow
  } else if (daysPerWeek >= 2) {
    return { bg: '#84cc16', border: '#65a30d', label: 'Normal' }; // Light green
  } else if (daysPerWeek >= 1) {
    return { bg: '#22c55e', border: '#16a34a', label: 'Bas' }; // Green
  } else {
    return { bg: '#9ca3af', border: '#6b7280', label: 'Aucun' }; // Gray
  }
};

// Workload bar component for a member's task assignment
interface WorkloadBarProps {
  taskName: string;
  startDate: Date;
  endDate: Date;
  daysPerWeek: number;
  y: number;
  viewSettings: any;
}

const WorkloadBar: React.FC<WorkloadBarProps> = ({
  taskName,
  startDate,
  endDate,
  daysPerWeek,
  y,
  viewSettings,
}) => {
  const x = getXForDate(startDate, viewSettings.startDate, viewSettings.columnWidth, viewSettings.zoomLevel);
  const width = getXForDate(endDate, startDate, viewSettings.columnWidth, viewSettings.zoomLevel);
  
  const workloadColor = getWorkloadColor(daysPerWeek);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute cursor-default"
            style={{
              top: y + (ROW_HEIGHT - 18) / 2,
              left: x,
              width: Math.max(width, 4),
              height: 18,
            }}
          >
            <div
              className="h-full rounded-sm relative overflow-hidden border transition-all shadow-sm"
              style={{
                backgroundColor: workloadColor.bg,
                borderColor: workloadColor.border,
              }}
            >
              {width > 50 && (
                <span className="absolute inset-0 flex items-center px-1.5 text-[9px] font-medium text-white truncate drop-shadow-sm">
                  {daysPerWeek}j
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-2 max-w-[200px]">
          <div className="text-xs">
            <p className="font-semibold truncate">{taskName}</p>
            <p className="text-muted-foreground">
              {format(startDate, 'dd MMM', { locale: fr })} - {format(endDate, 'dd MMM', { locale: fr })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: workloadColor.bg }}
              />
              <span className="font-medium">{daysPerWeek}/5 j/sem</span>
              <span className="text-muted-foreground">({workloadColor.label})</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Timeline with workload visualization
export const ServicesSectionTimeline: React.FC<ServicesSectionProps> = ({ startY }) => {
  const { members } = useServicesStore();
  const { project, viewSettings } = useGanttStore();
  const [expandedServices] = useState<string[]>(['Projet', 'Technical Office', 'Production', 'Logistique']);
  
  const groupedMembers = groupMembersByService(members);
  
  // Build workload data per member from task assignments
  const memberWorkloads = useMemo(() => {
    const workloads: Record<string, Array<{
      taskId: string;
      taskName: string;
      startDate: Date;
      endDate: Date;
      daysPerWeek: number;
    }>> = {};
    
    project.tasks.forEach((task) => {
      if (!task.assignments) return;
      
      task.assignments.forEach((assignment) => {
        if (!workloads[assignment.memberId]) {
          workloads[assignment.memberId] = [];
        }
        workloads[assignment.memberId].push({
          taskId: task.id,
          taskName: task.name,
          startDate: task.start,
          endDate: task.end,
          daysPerWeek: assignment.daysPerWeek,
        });
      });
    });
    
    return workloads;
  }, [project.tasks]);
  
  let currentY = startY + 32; // After separator
  const elements: React.ReactNode[] = [];

  SERVICE_ORDER.forEach((serviceName) => {
    const serviceMembers = groupedMembers[serviceName] || [];
    if (serviceMembers.length === 0) return;

    const isExpanded = expandedServices.includes(serviceName);
    const color = SERVICE_COLORS[serviceName] || '#6b7280';

    // Service header background
    elements.push(
      <div
        key={`service-bg-${serviceName}`}
        className="absolute left-0 w-full border-b border-border/20 pointer-events-none"
        style={{
          top: currentY,
          height: SERVICE_HEADER_HEIGHT,
          background: `linear-gradient(90deg, ${color}05 0%, transparent 50%)`,
        }}
      />
    );

    currentY += SERVICE_HEADER_HEIGHT;

    if (isExpanded) {
      serviceMembers.forEach((member) => {
        // Row background
        elements.push(
          <div
            key={`row-bg-${member.id}`}
            className="absolute left-0 w-full border-b border-border/10 pointer-events-none"
            style={{
              top: currentY,
              height: ROW_HEIGHT,
            }}
          />
        );
        
        // Workload bars for this member
        const workloads = memberWorkloads[member.id] || [];
        workloads.forEach((workload, idx) => {
          elements.push(
            <WorkloadBar
              key={`workload-${member.id}-${workload.taskId}-${idx}`}
              taskName={workload.taskName}
              startDate={workload.startDate}
              endDate={workload.endDate}
              daysPerWeek={workload.daysPerWeek}
              y={currentY}
              viewSettings={viewSettings}
            />
          );
        });
        
        currentY += ROW_HEIGHT;
      });
    }
  });

  return <>{elements}</>;
};

// Calculate total height
export const useServicesSectionHeight = () => {
  const { members } = useServicesStore();
  const expandedServices = ['Projet', 'Technical Office', 'Production', 'Logistique'];
  
  const groupedMembers = groupMembersByService(members);
  
  let height = 32; // Separator

  SERVICE_ORDER.forEach((serviceName) => {
    const serviceMembers = groupedMembers[serviceName] || [];
    if (serviceMembers.length === 0) return;

    height += SERVICE_HEADER_HEIGHT;

    if (expandedServices.includes(serviceName)) {
      height += serviceMembers.length * ROW_HEIGHT;
    }
  });

  return height;
};
