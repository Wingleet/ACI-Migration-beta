import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Module, SubModule, Verdict } from '@/types/process';
import { useProcessStore } from '@/stores/processStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  X, 
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  ImageIcon,
  ZoomIn,
  Maximize2,
  Minimize2,
  FileDown,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FlowchartEditor } from '@/components/Flowchart';
import { FlowchartDiagram } from '@/types/flowchart';

interface GapAnalysisDrawerProps {
  module: Module;
  subModule: SubModule;
  onClose: () => void;
}

const verdictOptions: { value: Verdict; label: string }[] = [
  { value: 'fit', label: 'FIT - Conforme' },
  { value: 'gap', label: 'GAP - Écart' },
  { value: 'na', label: 'N/A - Non applicable' },
];

export const GapAnalysisDrawer: React.FC<GapAnalysisDrawerProps> = ({
  module,
  subModule,
  onClose,
}) => {
  const { updateSubModule, updateGapRecord, addComment, removeComment } = useProcessStore();
  
  const [sectionsOpen, setSectionsOpen] = useState({
    comments: true,
  });

  const [newCommentUser, setNewCommentUser] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isFlowchartFullscreen, setIsFlowchartFullscreen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  const aciFlowchartRef = useRef<HTMLDivElement>(null);

  // Generate image path from subModule id and name
  const getFlowchartImagePath = () => {
    return `/images/flowchart/${subModule.id}_${subModule.name}.png`;
  };

  // Reset image error when subModule changes
  useEffect(() => {
    setImageError(false);
    setIsImageZoomed(false);
  }, [subModule.id]);

  // Parse flowchart data from stored JSON string
  const initialFlowchart = useMemo(() => {
    if (subModule.gapRecord.aciFlowchart) {
      try {
        return JSON.parse(subModule.gapRecord.aciFlowchart) as FlowchartDiagram;
      } catch {
        return null;
      }
    }
    return null;
  }, [subModule.id]); // Only reparse when subModule changes

  const handleGapRecordChange = (field: string, value: any) => {
    updateGapRecord(module.id, subModule.id, { [field]: value });
  };

  const handleFlowchartChange = (diagram: FlowchartDiagram) => {
    updateGapRecord(module.id, subModule.id, { aciFlowchart: JSON.stringify(diagram) });
  };

  const handleAddComment = () => {
    if (!newCommentUser.trim() || !newCommentContent.trim()) return;
    addComment(module.id, subModule.id, newCommentUser, newCommentContent);
    setNewCommentUser('');
    setNewCommentContent('');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // PDF Export function - 3 pages: AMOS, ACI, Comments
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const grayColor = '#6b7280';
      const lightGray = '#f3f4f6';
      
      // Helper: Add header to each page
      const addPageHeader = (pageTitle: string) => {
        let yPos = margin;
        
        // Project title
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AMOS Migration Project', margin, yPos + 5);
        
        // Page title on the right
        pdf.setFontSize(11);
        pdf.setTextColor(grayColor);
        pdf.text(pageTitle, pageWidth - margin - pdf.getTextWidth(pageTitle), yPos + 5);
        
        yPos += 12;
        
        // Sub-module info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${subModule.id} - ${subModule.name}`, margin, yPos);
        
        yPos += 6;
        
        // Module and status
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const moduleTextColor = module.departmentColor === 'red' ? '#b91c1c' : 
                               module.departmentColor === 'blue' ? '#1d4ed8' : 
                               module.departmentColor === 'green' ? '#15803d' : '#374151';
        pdf.setTextColor(moduleTextColor);
        pdf.text(module.name, margin, yPos);
        
        // Selection status
        const selectionText = subModule.isSelected ? '✓ Sélectionné' : '○ Non sélectionné';
        const selectionColor = subModule.isSelected ? '#059669' : '#6b7280';
        pdf.setTextColor(selectionColor);
        pdf.text(selectionText, margin + 80, yPos);
        
        // Verdict
        const verdictLabel = subModule.gapRecord.verdict === 'fit' ? 'FIT' :
                            subModule.gapRecord.verdict === 'gap' ? 'GAP' :
                            subModule.gapRecord.verdict === 'na' ? 'N/A' : '-';
        const verdictColor = subModule.gapRecord.verdict === 'fit' ? '#059669' :
                            subModule.gapRecord.verdict === 'gap' ? '#dc2626' : '#6b7280';
        pdf.setTextColor(verdictColor);
        pdf.text(`Verdict: ${verdictLabel}`, margin + 140, yPos);
        
        yPos += 5;
        
        // Separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        
        return yPos + 8;
      };
      
      // ==========================================
      // PAGE 1: AMOS Process Flowchart
      // ==========================================
      let yPosition = addPageHeader('Page 1/3 - AMOS Process');
      
      // Title
      pdf.setFillColor('#dbeafe');
      pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 10, 2, 2, 'F');
      pdf.setTextColor('#1d4ed8');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AMOS Process Flowchart', margin + 5, yPosition + 5);
      
      yPosition += 15;
      
      // Try to add AMOS image
      const imagePath = getFlowchartImagePath();
      const imageBoxHeight = pageHeight - yPosition - 25;
      
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = imagePath;
        });
        
        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = img.width;
        imgCanvas.height = img.height;
        const ctx = imgCanvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const imgData = imgCanvas.toDataURL('image/png');
        
        // Calculate image dimensions to fit
        const maxImgWidth = pageWidth - margin * 2;
        const maxImgHeight = imageBoxHeight;
        const imgRatio = img.width / img.height;
        let imgWidth = maxImgWidth;
        let imgHeight = imgWidth / imgRatio;
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = imgHeight * imgRatio;
        }
        
        // Center the image
        const xOffset = margin + (maxImgWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, yPosition, imgWidth, imgHeight);
      } catch {
        pdf.setFillColor(lightGray);
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 60, 3, 3, 'F');
        pdf.setTextColor(grayColor);
        pdf.setFontSize(10);
        pdf.text('Image AMOS non disponible', pageWidth / 2 - 30, yPosition + 30);
        pdf.setFontSize(8);
        pdf.text(imagePath, pageWidth / 2 - 40, yPosition + 40);
      }
      
      // ==========================================
      // PAGE 2: ACI Process Flowchart (Screenshot)
      // ==========================================
      pdf.addPage();
      yPosition = addPageHeader('Page 2/3 - ACI Process');
      
      // Title
      pdf.setFillColor('#ffedd5');
      pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 10, 2, 2, 'F');
      pdf.setTextColor('#c2410c');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACI Process Flowchart', margin + 5, yPosition + 5);
      
      yPosition += 15;
      
      // Capture ACI flowchart using html-to-image - only the ReactFlow canvas
      const aciContainer = aciFlowchartRef.current;
      // Find the actual ReactFlow canvas element (excluding palette and inspector)
      const reactFlowCanvas = aciContainer?.querySelector('.react-flow') as HTMLElement;
      if (reactFlowCanvas) {
        try {
          // Use html-to-image which supports modern CSS colors (oklch)
          const aciImgData = await toPng(reactFlowCanvas, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true,
            filter: (node) => {
              // Filter out controls and panels from ReactFlow
              const exclusionClasses = ['react-flow__panel', 'react-flow__controls', 'react-flow__minimap'];
              if (node.classList) {
                return !exclusionClasses.some(cls => node.classList.contains(cls));
              }
              return true;
            },
          });
          
          // Get dimensions from the ReactFlow canvas
          const containerWidth = reactFlowCanvas.offsetWidth;
          const containerHeight = reactFlowCanvas.offsetHeight;
          
          // Calculate dimensions for PDF
          const maxImgWidth = pageWidth - margin * 2;
          const maxImgHeight = pageHeight - yPosition - 25;
          const imgRatio = containerWidth / containerHeight;
          let imgWidth = maxImgWidth;
          let imgHeight = imgWidth / imgRatio;
          if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight;
            imgWidth = imgHeight * imgRatio;
          }
          
          const xOffset = margin + (maxImgWidth - imgWidth) / 2;
          pdf.addImage(aciImgData, 'PNG', xOffset, yPosition, imgWidth, imgHeight);
        } catch (err) {
          console.error('Error capturing ACI flowchart:', err);
          pdf.setFillColor(lightGray);
          pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 60, 3, 3, 'F');
          pdf.setTextColor(grayColor);
          pdf.setFontSize(10);
          pdf.text('Erreur lors de la capture du flowchart ACI', pageWidth / 2 - 45, yPosition + 30);
        }
      } else {
        pdf.setFillColor(lightGray);
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 60, 3, 3, 'F');
        pdf.setTextColor(grayColor);
        pdf.setFontSize(10);
        pdf.text('Flowchart ACI non disponible', pageWidth / 2 - 35, yPosition + 30);
      }
      
      // ==========================================
      // PAGE 3: Comments
      // ==========================================
      pdf.addPage();
      yPosition = addPageHeader('Page 3/3 - Commentaires');
      
      // Title
      pdf.setFillColor('#f3f4f6');
      pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 10, 2, 2, 'F');
      pdf.setTextColor('#374151');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Commentaires (${subModule.gapRecord.comments.length})`, margin + 5, yPosition + 5);
      
      yPosition += 15;
      
      if (subModule.gapRecord.comments.length === 0) {
        pdf.setFillColor(lightGray);
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 30, 3, 3, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(grayColor);
        pdf.text('Aucun commentaire pour ce sous-module', pageWidth / 2 - 40, yPosition + 17);
      } else {
        const sortedComments = [...subModule.gapRecord.comments]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        for (const comment of sortedComments) {
          // Calculate comment box height based on content
          const contentLines = pdf.splitTextToSize(comment.content, pageWidth - margin * 2 - 15);
          const commentHeight = Math.max(18, 12 + contentLines.length * 4);
          
          // Check if we need a new page
          if (yPosition + commentHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin + 10;
          }
          
          // Comment box
          pdf.setFillColor(lightGray);
          pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, commentHeight, 2, 2, 'F');
          
          // User name
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(comment.user, margin + 5, yPosition + 5);
          
          // Timestamp
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(grayColor);
          pdf.setFontSize(8);
          pdf.text(` · ${formatDate(comment.timestamp)}`, margin + 5 + pdf.getTextWidth(comment.user) + 2, yPosition + 5);
          
          // Comment content
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          pdf.text(contentLines, margin + 8, yPosition + 12);
          
          yPosition += commentHeight + 5;
        }
      }
      
      // ==========================================
      // FOOTER on all pages
      // ==========================================
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
        
        // Date on left
        pdf.setFontSize(8);
        pdf.setTextColor(grayColor);
        pdf.text(`Exporté le ${exportDate}`, margin, pageHeight - 6);
        
        // Page number in center
        pdf.text(`Page ${i} / ${totalPages}`, pageWidth / 2 - 10, pageHeight - 6);
        
        // Reference on right
        pdf.text(`Réf: ${subModule.id}`, pageWidth - margin - 25, pageHeight - 6);
      }
      
      // Save PDF
      const fileName = `Gap_Analysis_${subModule.id}_${subModule.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-card shadow-2xl z-50 flex flex-col"
    >
      {/* Compact Header */}
      <div className="px-4 py-2 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Badge 
              variant="outline" 
              className="text-[10px] font-mono shrink-0"
            >
              {subModule.id}
            </Badge>
            <Badge 
              variant="secondary"
              className={cn(
                "text-[10px] shrink-0",
                module.departmentColor === 'red' && "bg-red-100 text-red-700",
                module.departmentColor === 'blue' && "bg-blue-100 text-blue-700",
                module.departmentColor === 'green' && "bg-green-100 text-green-700",
                module.departmentColor === 'gray' && "bg-slate-100 text-slate-700",
              )}
            >
              {module.name}
            </Badge>
            <h2 className="text-sm font-semibold truncate">{subModule.name}</h2>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Selection status */}
            <Select 
              value={subModule.isSelected ? 'selected' : 'unselected'} 
              onValueChange={(v) => updateSubModule(module.id, subModule.id, { isSelected: v === 'selected' })}
            >
              <SelectTrigger className="h-7 text-[10px] w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Sélectionné
                  </div>
                </SelectItem>
                <SelectItem value="unselected">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    Non sélectionné
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Verdict */}
            <Select value={subModule.gapRecord.verdict || ''} onValueChange={(v) => handleGapRecordChange('verdict', v || null)}>
              <SelectTrigger className="h-7 text-[10px] w-32">
                <SelectValue placeholder="Verdict" />
              </SelectTrigger>
              <SelectContent>
                {verdictOptions.map((opt) => (
                  <SelectItem key={opt.value!} value={opt.value!}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export PDF Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] gap-1"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
            >
              {isExportingPdf ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <FileDown className="w-3 h-3" />
              )}
              Export PDF
            </Button>

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full Page Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Process Comparison - Takes most of the space */}
        <div className="flex-1 grid grid-cols-2 gap-3 p-3 min-h-0">
          {/* ACI Process - Left Column - Flowchart Editor */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-t-lg border border-orange-200 dark:border-orange-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-semibold text-sm text-orange-700 dark:text-orange-300">ACI Process</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-orange-600 hover:text-orange-700 hover:bg-orange-200/50"
                onClick={() => setIsFlowchartFullscreen(true)}
                title="Plein écran"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div ref={aciFlowchartRef} className="flex-1 border border-t-0 border-border rounded-b-lg overflow-hidden">
              <FlowchartEditor
                key={subModule.id}
                diagramId={subModule.id}
                initialDiagram={initialFlowchart}
                onChange={handleFlowchartChange}
              />
            </div>
          </div>

          {/* AMOS Process - Right Column */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-t-lg border border-blue-200 dark:border-blue-800 shrink-0">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">AMOS Process</span>
            </div>
            <div className="flex-1 border border-t-0 border-border rounded-b-lg bg-muted/20 flex items-center justify-center relative overflow-hidden">
              {imageError ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs text-center">Image non disponible</span>
                  <span className="text-[10px] text-center opacity-70">{getFlowchartImagePath()}</span>
                </div>
              ) : (
                <>
                  <img
                    src={getFlowchartImagePath()}
                    alt={`Flowchart ${subModule.name}`}
                    className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity p-2"
                    onError={() => setImageError(true)}
                    onClick={() => setIsImageZoomed(true)}
                  />
                  <button
                    className="absolute bottom-2 right-2 p-1.5 bg-background/80 rounded-md hover:bg-background transition-colors"
                    onClick={() => setIsImageZoomed(true)}
                  >
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section - Fixed at bottom */}
        <div className="shrink-0 border-t border-border">
          <Collapsible open={sectionsOpen.comments} onOpenChange={() => toggleSection('comments')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50">
              <span className="font-medium text-xs flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Commentaires ({subModule.gapRecord.comments.length})
              </span>
              {sectionsOpen.comments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="max-h-[200px] overflow-y-auto">
              <div className="px-3 pb-3 space-y-2">
                {/* Add comment form */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={newCommentUser}
                      onChange={(e) => setNewCommentUser(e.target.value)}
                      placeholder="Nom et prénom..."
                      className="h-7 text-xs"
                    />
                    <Textarea
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Votre commentaire..."
                      className="min-h-[50px] text-xs resize-none"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={handleAddComment}
                    disabled={!newCommentUser.trim() || !newCommentContent.trim()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {/* Comments list */}
                {subModule.gapRecord.comments.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    {[...subModule.gapRecord.comments]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((comment) => (
                        <div 
                          key={comment.id} 
                          className="p-2 bg-muted/30 rounded-lg text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">{comment.user}</span>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground text-[10px]">
                                {formatDate(comment.timestamp)}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 text-muted-foreground hover:text-destructive"
                              onClick={() => removeComment(module.id, subModule.id, comment.id)}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap pl-4">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && !imageError && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={getFlowchartImagePath()}
              alt={`Flowchart ${subModule.name}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-background transition-colors"
              onClick={() => setIsImageZoomed(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/90 rounded-lg">
              <span className="text-sm font-medium">{subModule.id} - {subModule.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Flowchart Fullscreen Modal */}
      {isFlowchartFullscreen && (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-orange-100 dark:bg-orange-900/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="font-semibold text-sm text-orange-700 dark:text-orange-300">
                ACI Process - {subModule.id} {subModule.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-200/50"
              onClick={() => setIsFlowchartFullscreen(false)}
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Réduire
            </Button>
          </div>
          
          {/* Fullscreen Flowchart Editor */}
          <div className="flex-1 overflow-hidden">
            <FlowchartEditor
              key={`fullscreen-${subModule.id}`}
              diagramId={subModule.id}
              initialDiagram={initialFlowchart}
              onChange={handleFlowchartChange}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
