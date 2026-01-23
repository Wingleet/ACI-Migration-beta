import React, { useState } from 'react';
import { useGanttStore } from '@/stores/ganttStore';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Upload,
  Loader2,
  Check,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import { ViewSettings } from '@/types/gantt';
import { addMonths, subMonths, startOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { parseProjectFile } from '@/lib/mppParser';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const zoomLevelLabels: Record<ViewSettings['zoomLevel'], string> = {
  year: 'Année',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
};

// Available zoom levels (only week and month)
const availableZoomLevels: ViewSettings['zoomLevel'][] = ['month', 'week'];

export const Toolbar: React.FC = () => {
  const { viewSettings, updateViewSettings, project, setProject } = useGanttStore();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleZoomIn = () => {
    const currentIndex = availableZoomLevels.indexOf(viewSettings.zoomLevel);
    if (currentIndex < availableZoomLevels.length - 1) {
      updateViewSettings({ zoomLevel: availableZoomLevels[currentIndex + 1] });
    }
  };

  const handleZoomOut = () => {
    const currentIndex = availableZoomLevels.indexOf(viewSettings.zoomLevel);
    if (currentIndex > 0) {
      updateViewSettings({ zoomLevel: availableZoomLevels[currentIndex - 1] });
    }
  };

  // PDF Export function
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    
    try {
      // Find the Gantt chart container
      const ganttContainer = document.querySelector('.gantt-scroll')?.parentElement;
      if (!ganttContainer) {
        alert('Gantt chart non trouvé');
        return;
      }
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const grayColor = '#6b7280';
      
      // === PAGE 1: Gantt Chart Screenshot ===
      let yPosition = margin;
      
      // Header
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AMOS Migration Project', margin, yPosition + 6);
      
      pdf.setFontSize(10);
      pdf.setTextColor(grayColor);
      pdf.text('Gantt Chart - Planning du Projet', pageWidth - margin - 60, yPosition + 6);
      
      yPosition += 12;
      
      // Project info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Projet: ${project.name}`, margin, yPosition);
      
      pdf.setTextColor(grayColor);
      const periodText = `Période: ${format(viewSettings.startDate, 'MMM yyyy', { locale: fr })} → ${format(viewSettings.endDate, 'MMM yyyy', { locale: fr })}`;
      pdf.text(periodText, margin + 100, yPosition);
      
      pdf.text(`${project.tasks.length} tâches`, margin + 200, yPosition);
      
      yPosition += 6;
      
      // Separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 5;
      
      // Capture Gantt chart using html-to-image
      try {
        const imgData = await toPng(ganttContainer as HTMLElement, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          skipFonts: true,
        });
        
        // Get dimensions from the container
        const containerWidth = (ganttContainer as HTMLElement).offsetWidth;
        const containerHeight = (ganttContainer as HTMLElement).offsetHeight;
        
        // Calculate dimensions for PDF
        const maxImgWidth = pageWidth - margin * 2;
        const maxImgHeight = pageHeight - yPosition - 20;
        const imgRatio = containerWidth / containerHeight;
        let imgWidth = maxImgWidth;
        let imgHeight = imgWidth / imgRatio;
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = imgHeight * imgRatio;
        }
        
        const xOffset = margin + (maxImgWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, yPosition, imgWidth, imgHeight);
        
      } catch (err) {
        console.error('Error capturing Gantt:', err);
        pdf.setFillColor('#f3f4f6');
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 80, 3, 3, 'F');
        pdf.setTextColor(grayColor);
        pdf.setFontSize(10);
        pdf.text('Erreur lors de la capture du Gantt chart', pageWidth / 2 - 40, yPosition + 40);
      }
      
      // === PAGE 2: Task List ===
      pdf.addPage();
      yPosition = margin;
      
      // Header
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AMOS Migration Project', margin, yPosition + 5);
      
      pdf.setFontSize(10);
      pdf.setTextColor(grayColor);
      pdf.text('Liste des Tâches', pageWidth - margin - 35, yPosition + 5);
      
      yPosition += 12;
      
      // Separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 8;
      
      // Table header
      pdf.setFillColor('#f3f4f6');
      pdf.roundedRect(margin, yPosition - 3, pageWidth - margin * 2, 8, 1, 1, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Tâche', margin + 3, yPosition + 2);
      pdf.text('Début', margin + 100, yPosition + 2);
      pdf.text('Fin', margin + 140, yPosition + 2);
      pdf.text('Durée', margin + 175, yPosition + 2);
      pdf.text('Statut', margin + 205, yPosition + 2);
      pdf.text('Responsable', margin + 235, yPosition + 2);
      
      yPosition += 10;
      
      // Task rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      
      for (const task of project.tasks) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin + 10;
        }
        
        // Alternate row background
        if (project.tasks.indexOf(task) % 2 === 0) {
          pdf.setFillColor('#fafafa');
          pdf.rect(margin, yPosition - 3, pageWidth - margin * 2, 6, 'F');
        }
        
        pdf.setTextColor(0, 0, 0);
        const taskName = task.name.length > 35 ? task.name.substring(0, 35) + '...' : task.name;
        pdf.text(taskName, margin + 3, yPosition);
        
        pdf.setTextColor(grayColor);
        pdf.text(format(task.start, 'dd/MM/yyyy'), margin + 100, yPosition);
        pdf.text(format(task.end, 'dd/MM/yyyy'), margin + 140, yPosition);
        pdf.text(`${task.duration}j`, margin + 175, yPosition);
        
        // Status with color
        const statusColor = task.status === 'completed' ? '#059669' :
                          task.status === 'in-progress' ? '#d97706' :
                          task.status === 'delayed' ? '#dc2626' : '#6b7280';
        pdf.setTextColor(statusColor);
        const statusLabel = task.status === 'completed' ? 'Terminé' :
                          task.status === 'in-progress' ? 'En cours' :
                          task.status === 'delayed' ? 'Retard' : 'Planifié';
        pdf.text(statusLabel, margin + 205, yPosition);
        
        pdf.setTextColor(grayColor);
        pdf.text(task.owner || '-', margin + 235, yPosition);
        
        yPosition += 6;
      }
      
      // === FOOTER on all pages ===
      const totalPages = pdf.getNumberOfPages();
      const exportDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        
        // Date
        pdf.setFontSize(8);
        pdf.setTextColor(grayColor);
        pdf.text(`Exporté le ${exportDate}`, margin, pageHeight - 6);
        
        // Page number
        pdf.text(`Page ${i} / ${totalPages}`, pageWidth / 2 - 12, pageHeight - 6);
        
        // Project ref
        pdf.text(`Réf: ${project.id}`, pageWidth - margin - 30, pageHeight - 6);
      }
      
      // Save
      const fileName = `Gantt_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleImportMpp = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mpp,.xml,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Check if it's a binary .mpp file
      if (file.name.toLowerCase().endsWith('.mpp')) {
        alert(
          `Les fichiers .mpp binaires ne peuvent pas être lus directement.\n\n` +
          `Pour importer votre projet:\n` +
          `1. Ouvrez le fichier dans Microsoft Project\n` +
          `2. Exportez-le en XML (Fichier → Enregistrer sous → XML)\n` +
          `3. Importez le fichier XML ici\n\n` +
          `Ou utilisez un fichier JSON avec le format simplifié.`
        );
        return;
      }
      
      setIsImporting(true);
      setImportStatus('idle');
      
      try {
        const parsedProject = await parseProjectFile(file);
        
        if (parsedProject) {
          // Update the project with parsed data
          setProject(parsedProject);
          
          // Adjust view settings to show the project timeline
          const tasks = parsedProject.tasks;
          if (tasks.length > 0) {
            const allStarts = tasks.map(t => t.start.getTime());
            const allEnds = tasks.map(t => t.end.getTime());
            const minStart = new Date(Math.min(...allStarts));
            const maxEnd = new Date(Math.max(...allEnds));
            
            // Set view to show the entire project with some padding
            updateViewSettings({
              startDate: startOfMonth(subMonths(minStart, 1)),
              endDate: startOfMonth(addMonths(maxEnd, 2)),
            });
          }
          
          setImportStatus('success');
          setTimeout(() => setImportStatus('idle'), 3000);
        } else {
          setImportStatus('error');
          alert(
            `Erreur lors de l'import du fichier.\n\n` +
            `Formats supportés:\n` +
            `- XML exporté depuis Microsoft Project\n` +
            `- JSON avec le format simplifié\n\n` +
            `Vérifiez que le fichier est valide et réessayez.`
          );
          setTimeout(() => setImportStatus('idle'), 3000);
        }
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus('error');
        alert(`Erreur lors de l'import: ${error}`);
        setTimeout(() => setImportStatus('idle'), 3000);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-14 border-b border-border flex items-center px-4 bg-card/80 backdrop-blur-sm justify-between gap-4">
        {/* Left Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Import MPP */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleImportMpp}
                disabled={isImporting}
                className={`gap-1.5 h-8 px-3 text-xs transition-colors ${
                  importStatus === 'success' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                  importStatus === 'error' ? 'bg-red-100 border-red-500 text-red-700' : ''
                }`}
              >
                {isImporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : importStatus === 'success' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : importStatus === 'error' ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isImporting ? 'Import...' : 
                   importStatus === 'success' ? 'Importé' : 
                   importStatus === 'error' ? 'Erreur' : 
                   'Import .mpp'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Importer un fichier Microsoft Project (XML) ou JSON
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Export PDF */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="gap-1.5 h-8 px-3 text-xs"
              >
                {isExportingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileDown className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isExportingPdf ? 'Export...' : 'Export PDF'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exporter le Gantt en PDF</TooltipContent>
          </Tooltip>
        </div>

        {/* Center Section - Current Period */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {format(viewSettings.startDate, 'MMM yyyy', { locale: fr })}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-sm font-medium text-muted-foreground">
            {format(viewSettings.endDate, 'MMM yyyy', { locale: fr })}
          </span>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomOut} 
                  disabled={availableZoomLevels.indexOf(viewSettings.zoomLevel) === 0}
                  className="h-7 w-7"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom arrière</TooltipContent>
            </Tooltip>

            <Badge 
              variant="secondary" 
              className="min-w-[70px] justify-center font-mono-data text-[10px] uppercase"
            >
              {zoomLevelLabels[viewSettings.zoomLevel]}
            </Badge>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomIn} 
                  disabled={availableZoomLevels.indexOf(viewSettings.zoomLevel) === availableZoomLevels.length - 1}
                  className="h-7 w-7"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom avant</TooltipContent>
            </Tooltip>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
};
