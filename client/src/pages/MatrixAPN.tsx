import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter,
  Grid3X3,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { MATRIX_DATA, AREAS, PROCESSES, AREA_COLORS, APNEntry } from '@/lib/matrixApnData';
import { UNSELECTED_SUBMODULES } from '@/lib/processData';

// Get unique process IDs from matrix data
const ALL_PROCESS_IDS = [...new Set(MATRIX_DATA.map(d => d.processId))];
const SELECTED_PROCESS_IDS = ALL_PROCESS_IDS.filter(id => !UNSELECTED_SUBMODULES.has(id));

const MatrixAPN: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'area' | 'process' | 'apn'>('area');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...MATRIX_DATA];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(d => 
        d.areaName.toLowerCase().includes(searchLower) ||
        d.processName.toLowerCase().includes(searchLower) ||
        d.apn.toLowerCase().includes(searchLower) ||
        d.apnName.toLowerCase().includes(searchLower) ||
        d.title.toLowerCase().includes(searchLower) ||
        d.processId.toLowerCase().includes(searchLower) ||
        d.areaCode.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply area filter
    if (selectedArea) {
      data = data.filter(d => d.areaCode === selectedArea.split(':')[0]);
    }
    
    // Apply process filter
    if (selectedProcess) {
      data = data.filter(d => d.processId === selectedProcess.split(':')[0]);
    }
    
    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'area') {
        cmp = a.areaCode.localeCompare(b.areaCode) || a.processId.localeCompare(b.processId);
      } else if (sortBy === 'process') {
        cmp = a.processId.localeCompare(b.processId);
      } else {
        cmp = parseInt(a.apn) - parseInt(b.apn);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    
    return data;
  }, [search, selectedArea, selectedProcess, sortBy, sortOrder]);

  // Group by area
  const groupedData = useMemo(() => {
    const groups: Record<string, APNEntry[]> = {};
    filteredData.forEach(entry => {
      const key = `${entry.areaCode}:${entry.areaName}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });
    return groups;
  }, [filteredData]);

  const toggleArea = (area: string) => {
    setExpandedAreas(prev => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedAreas(new Set(Object.keys(groupedData)));
  };

  const collapseAll = () => {
    setExpandedAreas(new Set());
  };

  const toggleSort = (column: 'area' | 'process' | 'apn') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Get available processes for selected area
  const availableProcesses = useMemo(() => {
    if (!selectedArea) return PROCESSES;
    const areaCode = selectedArea.split(':')[0];
    return PROCESSES.filter(p => p.startsWith(areaCode + '.'));
  }, [selectedArea]);

  // Global KPIs
  const globalKpis = useMemo(() => {
    const totalProcesses = ALL_PROCESS_IDS.length;
    const selectedProcesses = SELECTED_PROCESS_IDS.length;
    const unselectedProcesses = totalProcesses - selectedProcesses;
    
    // APNs for selected processes
    const selectedApns = MATRIX_DATA.filter(d => !UNSELECTED_SUBMODULES.has(d.processId));
    const unselectedApns = MATRIX_DATA.filter(d => UNSELECTED_SUBMODULES.has(d.processId));
    
    return {
      totalProcesses,
      selectedProcesses,
      unselectedProcesses,
      totalApns: MATRIX_DATA.length,
      selectedApns: selectedApns.length,
      unselectedApns: unselectedApns.length,
    };
  }, []);

  // Per-area KPIs
  const areaKpis = useMemo(() => {
    const kpis: Record<string, { total: number; selected: number; unselected: number; processes: number; selectedProcesses: number }> = {};
    
    MATRIX_DATA.forEach(entry => {
      const key = `${entry.areaCode}:${entry.areaName}`;
      if (!kpis[key]) {
        kpis[key] = { total: 0, selected: 0, unselected: 0, processes: 0, selectedProcesses: 0 };
      }
      kpis[key].total++;
      if (UNSELECTED_SUBMODULES.has(entry.processId)) {
        kpis[key].unselected++;
      } else {
        kpis[key].selected++;
      }
    });
    
    // Count processes per area
    PROCESSES.forEach(p => {
      const [processId] = p.split(':');
      const areaCode = processId.split('.')[0];
      const areaKey = Object.keys(kpis).find(k => k.startsWith(areaCode + ':'));
      if (areaKey) {
        kpis[areaKey].processes++;
        if (!UNSELECTED_SUBMODULES.has(processId)) {
          kpis[areaKey].selectedProcesses++;
        }
      }
    });
    
    return kpis;
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Grid3X3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Matrix APN</h1>
              <p className="text-sm text-muted-foreground">
                Matrice des Process et APN par Area
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Tout ouvrir
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Tout fermer
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Process:</span>
            <Badge variant="default" className="text-xs bg-emerald-600">
              {globalKpis.selectedProcesses} sélectionnés
            </Badge>
            <Badge variant="secondary" className="text-xs bg-slate-500 text-white">
              {globalKpis.unselectedProcesses} non sélectionnés
            </Badge>
            <span className="text-xs text-muted-foreground">/ {globalKpis.totalProcesses}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">APNs:</span>
            <Badge variant="default" className="text-xs bg-emerald-600">
              {globalKpis.selectedApns} sélectionnés
            </Badge>
            <Badge variant="secondary" className="text-xs bg-slate-500 text-white">
              {globalKpis.unselectedApns} non sélectionnés
            </Badge>
            <span className="text-xs text-muted-foreground">/ {globalKpis.totalApns}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} résultats affichés
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher APN, Process, Title..."
              className="pl-9 h-9"
            />
          </div>

          {/* Area Filter */}
          <Select 
            value={selectedArea || 'all'} 
            onValueChange={(v) => {
              setSelectedArea(v === 'all' ? null : v);
              setSelectedProcess(null); // Reset process when area changes
            }}
          >
            <SelectTrigger className="w-56 h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les Areas ({AREAS.length})</SelectItem>
              {AREAS.map(area => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Process Filter */}
          <Select 
            value={selectedProcess || 'all'} 
            onValueChange={(v) => setSelectedProcess(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-64 h-9">
              <SelectValue placeholder="Process" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les Process ({availableProcesses.length})</SelectItem>
              {availableProcesses.map(process => (
                <SelectItem key={process} value={process}>
                  {process}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          {(search || selectedArea || selectedProcess) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedArea(null);
                setSelectedProcess(null);
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto relative z-10">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
            <tr className="border-b border-border">
              <th className="text-left p-3 font-semibold text-sm w-12"></th>
              <th 
                className="text-left p-3 font-semibold text-sm cursor-pointer hover:bg-muted/50 transition-colors w-48"
                onClick={() => toggleSort('area')}
              >
                <div className="flex items-center gap-2">
                  Area
                  <ArrowUpDown className={cn("w-4 h-4", sortBy === 'area' ? 'text-primary' : 'text-muted-foreground')} />
                </div>
              </th>
              <th 
                className="text-left p-3 font-semibold text-sm cursor-pointer hover:bg-muted/50 transition-colors w-64"
                onClick={() => toggleSort('process')}
              >
                <div className="flex items-center gap-2">
                  Process
                  <ArrowUpDown className={cn("w-4 h-4", sortBy === 'process' ? 'text-primary' : 'text-muted-foreground')} />
                </div>
              </th>
              <th 
                className="text-left p-3 font-semibold text-sm cursor-pointer hover:bg-muted/50 transition-colors w-32"
                onClick={() => toggleSort('apn')}
              >
                <div className="flex items-center gap-2">
                  APN
                  <ArrowUpDown className={cn("w-4 h-4", sortBy === 'apn' ? 'text-primary' : 'text-muted-foreground')} />
                </div>
              </th>
              <th className="text-left p-3 font-semibold text-sm">APN Name</th>
              <th className="text-left p-3 font-semibold text-sm">Title</th>
              <th className="text-left p-3 font-semibold text-sm w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).sort((a, b) => a[0].localeCompare(b[0])).map(([areaKey, entries]) => {
              const isExpanded = expandedAreas.has(areaKey);
              const [areaCode] = areaKey.split(':');
              const areaColor = AREA_COLORS[areaCode] || '#64748b';
              const kpi = areaKpis[areaKey] || { total: 0, selected: 0, unselected: 0, processes: 0, selectedProcesses: 0 };
              
              return (
                <React.Fragment key={areaKey}>
                  {/* Area Group Header */}
                  <tr 
                    className="bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50"
                    onClick={() => toggleArea(areaKey)}
                  >
                    <td className="p-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                    <td colSpan={6} className="p-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: areaColor }}
                        />
                        <span className="font-semibold">{areaKey}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Process:</span>
                          <Badge variant="default" className="text-[10px] h-5 bg-emerald-600">
                            {kpi.selectedProcesses}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-5 bg-slate-500 text-white">
                            {kpi.processes - kpi.selectedProcesses}
                          </Badge>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">APNs:</span>
                          <Badge variant="default" className="text-[10px] h-5 bg-emerald-600">
                            {kpi.selected}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-5 bg-slate-500 text-white">
                            {kpi.unselected}
                          </Badge>
                          <span className="text-xs text-muted-foreground">/ {kpi.total}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Area Entries */}
                  {isExpanded && entries.map((entry) => (
                    <tr 
                      key={entry.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3"></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: areaColor }}
                          />
                          <span className="text-xs text-muted-foreground truncate">{entry.areaCode}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="font-mono text-xs shrink-0"
                            style={{ 
                              borderColor: areaColor,
                              color: areaColor,
                            }}
                          >
                            {entry.processId}
                          </Badge>
                          <span className="text-sm truncate" title={entry.processName}>
                            {entry.processName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm font-medium text-primary">
                          {entry.apn}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm truncate block max-w-xs" title={entry.apnName}>
                          {entry.apnName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-muted-foreground truncate block max-w-md" title={entry.title}>
                          {entry.title}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link href={`/process?module=${entry.processId}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2" title="Voir le process">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            Aucune entrée trouvée
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixAPN;
