import React, { useState, useEffect, useRef } from 'react';
import { useProcessStore } from '@/stores/processStore';
import { DepartmentColor, Verdict } from '@/types/process';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  X, 
  AlertTriangle,
  Save,
  Cloud,
  CloudOff,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEPARTMENTS, UNSELECTED_SUBMODULES } from '@/lib/processData';
import { 
  fetchAllItems, 
  saveItem,
} from '@/lib/processDbClient';

// Fixed save ID for the single shared save
const SHARED_SAVE_ID = 'process-shared-save';

export const ProcessToolbar: React.FC = () => {
  const { filters, setFilters, resetFilters, getKPIs, modules, setModules } = useProcessStore();
  const kpis = getKPIs();

  // Cloud save/load state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const hasLoadedRef = useRef(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<string>('');

  // Auto-load saved state on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSavedState = async () => {
      setIsLoading(true);
      try {
        const items = await fetchAllItems();
        const savedItem = items.find(item => item.id === SHARED_SAVE_ID);
        if (savedItem?.modules) {
          // Apply UNSELECTED_SUBMODULES to ensure isSelected is always correct
          const modulesWithCorrectSelection = savedItem.modules.map((mod: any) => ({
            ...mod,
            subModules: mod.subModules.map((sm: any) => ({
              ...sm,
              isSelected: !UNSELECTED_SUBMODULES.has(sm.id),
            })),
          }));
          setModules(modulesWithCorrectSelection);
          setCloudStatus('connected');
        } else {
          setCloudStatus('idle');
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
        setCloudStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedState();
  }, [setModules]);

  // Extract only the data we want to save per sub-module
  const extractSaveData = () => {
    return modules.map(module => ({
      ...module,
      subModules: module.subModules.map(sm => ({
        id: sm.id,
        name: sm.name,
        isSelected: sm.isSelected,
        status: sm.status,
        criticality: sm.criticality,
        gapRecord: {
          ...sm.gapRecord,
          // Keep only: isSelected (on parent), verdict, comments, aciFlowchart
          verdict: sm.gapRecord.verdict,
          comments: sm.gapRecord.comments,
          aciFlowchart: sm.gapRecord.aciFlowchart,
          // Keep other fields for completeness
          asIs: sm.gapRecord.asIs,
          toBe: sm.gapRecord.toBe,
          gapType: sm.gapRecord.gapType,
          decision: sm.gapRecord.decision,
          owner: sm.gapRecord.owner,
          actions: sm.gapRecord.actions,
          risks: sm.gapRecord.risks,
          auditTrail: sm.gapRecord.auditTrail,
          aciProcess: sm.gapRecord.aciProcess,
          amosProcess: sm.gapRecord.amosProcess,
        },
      })),
    }));
  };

  // Save current state to cloud
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const saveData = extractSaveData();
      await saveItem({
        id: SHARED_SAVE_ID,
        title: 'Process Gap Analysis',
        description: `Sauvegardé le ${new Date().toLocaleString('fr-FR')}`,
        tags: ['process', 'gap-analysis'],
        status: 'active',
        modules: saveData,
      });
      setCloudStatus('connected');
      setSaveSuccess(true);
      // Reset success indicator after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setCloudStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 5 seconds if data has changed
  useEffect(() => {
    const autoSave = async () => {
      if (isSaving || isLoading) return;
      
      const currentData = JSON.stringify(extractSaveData());
      if (currentData === lastSaveDataRef.current) return; // No changes
      
      lastSaveDataRef.current = currentData;
      
      try {
        setIsSaving(true);
        await saveItem({
          id: SHARED_SAVE_ID,
          title: 'Process Gap Analysis',
          description: `Auto-sauvegardé le ${new Date().toLocaleString('fr-FR')}`,
          tags: ['process', 'gap-analysis'],
          status: 'active',
          modules: JSON.parse(currentData),
        });
        setCloudStatus('connected');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setCloudStatus('error');
      } finally {
        setIsSaving(false);
      }
    };

    // Start auto-save interval
    autoSaveIntervalRef.current = setInterval(autoSave, 5000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isSaving, isLoading, modules]);

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm shrink-0 px-2 py-1 flex items-center gap-4 overflow-x-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground">Analysés:</span>
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${kpis.analyzedPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-medium">
          {kpis.analyzedCount}/{kpis.totalSubModules}
        </span>
      </div>

      {/* Alerts */}
      {kpis.highRisksCount > 0 && (
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-red-500 text-red-600">
          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
          {kpis.highRisksCount}
        </Badge>
      )}

      <div className="h-4 w-px bg-border shrink-0" />

      {/* Search */}
      <div className="relative w-40 shrink-0">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Rechercher..."
          className="pl-7 h-6 text-[10px]"
        />
      </div>

      {/* Department Color */}
      <Select 
        value={filters.departmentColor || 'all'} 
        onValueChange={(v) => setFilters({ departmentColor: v === 'all' ? null : v as DepartmentColor })}
      >
        <SelectTrigger className="w-32 h-6 text-[10px]">
          <SelectValue placeholder="Département" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.color} value={dept.color}>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  dept.color === 'red' && "bg-red-500",
                  dept.color === 'blue' && "bg-blue-500",
                  dept.color === 'green' && "bg-green-500",
                  dept.color === 'gray' && "bg-slate-500",
                )} />
                {dept.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Verdict */}
      <Select 
        value={filters.verdict || 'all'} 
        onValueChange={(v) => setFilters({ verdict: v === 'all' ? null : v as Verdict })}
      >
        <SelectTrigger className="w-20 h-6 text-[10px]">
          <SelectValue placeholder="Verdict" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="fit">FIT</SelectItem>
          <SelectItem value="gap">GAP</SelectItem>
          <SelectItem value="na">N/A</SelectItem>
        </SelectContent>
      </Select>

      {/* Selection filter */}
      <Select 
        value={filters.isSelected === null ? 'all' : filters.isSelected ? 'selected' : 'unselected'} 
        onValueChange={(v) => setFilters({ isSelected: v === 'all' ? null : v === 'selected' })}
      >
        <SelectTrigger className="w-28 h-6 text-[10px]">
          <SelectValue placeholder="Sélection" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="selected">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Sélectionnés
            </div>
          </SelectItem>
          <SelectItem value="unselected">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Non sélectionnés
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      {(filters.search || filters.departmentColor || filters.verdict || filters.isSelected !== null) && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-5 px-1.5 text-[9px]">
          <X className="w-2.5 h-2.5" />
        </Button>
      )}

      <div className="flex-1" />

      {/* Cloud Status & Save Button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status indicator */}
        {isLoading && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        )}
        {!isLoading && cloudStatus === 'connected' && (
          <Cloud className="w-3 h-3 text-emerald-500" />
        )}
        {!isLoading && cloudStatus === 'error' && (
          <CloudOff className="w-3 h-3 text-red-500" />
        )}

        {/* Save Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className={cn(
            "h-6 px-2 text-[10px] gap-1 transition-colors",
            saveSuccess && "bg-emerald-100 border-emerald-500 text-emerald-700"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3 h-3" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          {saveSuccess ? 'Sauvegardé' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
};
