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
  FileDown,
  Loader2,
  Grid3X3,
  ExternalLink,
  Building2,
  Check,
  Search,
  Users,
  Sparkles,
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
import { FlowchartDiagram } from '@/types/flowchart';
import { getFlowchartImages, getFlowchartImagePath, getAciFlowchartImage, getAciDrawioFile, getProcessDesignFile } from '@/lib/flowchartImageMapping';
import { DrawioEditor } from './DrawioEditor';
import { Pencil } from 'lucide-react';
import { MATRIX_DATA, AREA_COLORS } from '@/lib/matrixApnData';
import { getAllServicesAndUnits, ServiceUnit } from '@/lib/dtOrgaData';
import { useDTOrgaStore, getServiceBySubModuleIdDynamic } from '@/stores/dtOrgaStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [isAciImageZoomed, setIsAciImageZoomed] = useState(false);
  const [isDrawioEditorOpen, setIsDrawioEditorOpen] = useState(false);
  const [isApnDialogOpen, setIsApnDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [aciImageFromDb, setAciImageFromDb] = useState<string | null>(null);
  const [aciImageLoading, setAciImageLoading] = useState(false);
  
  // DT Orga Store - subscribe to customAssociations for reactivity
  const customAssociations = useDTOrgaStore(state => state.customAssociations);
  const addProcessToService = useDTOrgaStore(state => state.addProcessToService);
  const removeProcessFromService = useDTOrgaStore(state => state.removeProcessFromService);
  const isSyncing = useDTOrgaStore(state => state.isSyncing);
  const lastSyncedAt = useDTOrgaStore(state => state.lastSyncedAt);
  const loadFromNetlify = useDTOrgaStore(state => state.loadFromNetlify);
  const saveToNetlify = useDTOrgaStore(state => state.saveToNetlify);
  
  // Charger les données depuis Netlify au démarrage
  useEffect(() => {
    loadFromNetlify();
  }, []);

  // Charger l'image ACI depuis la DB
  useEffect(() => {
    if (!subModule.id) return;
    
    setAciImageLoading(true);
    setAciImageFromDb(null);
    
    fetch(`/api/aci-image?moduleId=${encodeURIComponent(subModule.id)}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data.data?.content) {
          // Convertir base64 en data URL
          const mimeType = data.data.mimeType || 'image/png';
          setAciImageFromDb(`data:${mimeType};base64,${data.data.content}`);
        }
      })
      .catch(() => {
        // Fallback sur l'image locale
        setAciImageFromDb(null);
      })
      .finally(() => {
        setAciImageLoading(false);
      });
  }, [subModule.id]);
  
  // Fermer avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Fermer d'abord les dialogs ouverts, sinon fermer le drawer principal
        if (isDrawioEditorOpen) {
          setIsDrawioEditorOpen(false);
        } else if (isServiceDialogOpen) {
          setIsServiceDialogOpen(false);
        } else if (isApnDialogOpen) {
          setIsApnDialogOpen(false);
        } else if (isImageZoomed) {
          setIsImageZoomed(false);
        } else if (isAciImageZoomed) {
          setIsAciImageZoomed(false);
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDrawioEditorOpen, isServiceDialogOpen, isApnDialogOpen, isImageZoomed, isAciImageZoomed]);
  
  // Get all services with dynamic associations
  const allServices = useMemo(() => {
    const staticServices = getAllServicesAndUnits();
    return staticServices.map(service => {
      const customAssoc = customAssociations.find(a => a.serviceId === service.id);
      if (customAssoc) {
        return { ...service, subModuleIds: customAssoc.subModuleIds };
      }
      return service;
    });
  }, [customAssociations]);
  
  // Get services associated with this process
  const associatedServices = useMemo(() => {
    return allServices.filter(service => service.subModuleIds.includes(subModule.id));
  }, [subModule.id, allServices]);
  
  // Filter and group services
  const filteredAndGroupedServices = useMemo(() => {
    const query = serviceSearchQuery.toLowerCase().trim();
    
    // Filter services based on search
    const filtered = query 
      ? allServices.filter(s => 
          s.name.toLowerCase().includes(query) ||
          (s.parentName && s.parentName.toLowerCase().includes(query))
        )
      : allServices;
    
    // Group by parent
    const groups: { [key: string]: ServiceUnit[] } = {};
    filtered.forEach(service => {
      const groupKey = service.type === 'unit' && service.parentName 
        ? service.parentName 
        : service.type === 'service' ? service.name : 'Autres';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(service);
    });
    return groups;
  }, [allServices, serviceSearchQuery]);
  
  // Get APNs for this process
  const processApns = useMemo(() => {
    return MATRIX_DATA.filter(apn => apn.processId === subModule.id);
  }, [subModule.id]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  

  // Get all flowchart images for this subModule
  const flowchartImages = useMemo(() => {
    return getFlowchartImages(subModule.id);
  }, [subModule.id]);
  
  // Get current image path
  const getCurrentImagePath = () => {
    if (flowchartImages.length === 0) {
      // Fallback to old naming convention
      return `/images/flowchart/${subModule.id}_${subModule.name}.png`;
    }
    return flowchartImages[currentImageIndex] || flowchartImages[0];
  };

  // State for default ACI flowchart loaded from JSON file
  const [defaultAciFlowchart, setDefaultAciFlowchart] = useState<FlowchartDiagram | null>(null);
  const [isLoadingAciFlowchart, setIsLoadingAciFlowchart] = useState(false);

  // Reset image state when subModule changes
  useEffect(() => {
    setImageError(false);
    setIsImageZoomed(false);
    setCurrentImageIndex(0);
  }, [subModule.id]);

  // Load default ACI flowchart from JSON file when subModule changes
  useEffect(() => {
    const loadDefaultFlowchart = async () => {
      // Only load if no user-edited flowchart exists
      if (subModule.gapRecord.aciFlowchart) {
        setDefaultAciFlowchart(null);
        return;
      }

      setIsLoadingAciFlowchart(true);
      try {
        const response = await fetch(`/Flowchart/flowchart_${subModule.id}.json`);
        if (response.ok) {
          const data = await response.json() as FlowchartDiagram;
          setDefaultAciFlowchart(data);
        } else {
          setDefaultAciFlowchart(null);
        }
      } catch {
        setDefaultAciFlowchart(null);
      } finally {
        setIsLoadingAciFlowchart(false);
      }
    };

    loadDefaultFlowchart();
  }, [subModule.id, subModule.gapRecord.aciFlowchart]);

  // Parse flowchart data from stored JSON string, or use default from file
  const initialFlowchart = useMemo(() => {
    // Priority 1: User-edited flowchart stored in gapRecord
    if (subModule.gapRecord.aciFlowchart) {
      try {
        return JSON.parse(subModule.gapRecord.aciFlowchart) as FlowchartDiagram;
      } catch {
        return defaultAciFlowchart;
      }
    }
    // Priority 2: Default flowchart loaded from JSON file
    return defaultAciFlowchart;
  }, [subModule.id, subModule.gapRecord.aciFlowchart, defaultAciFlowchart]);

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

  // PDF Export function - Dynamic pages: AMOS (1 per image), ACI, Comments
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
      
      // Get all AMOS images for this subModule
      const amosImages = flowchartImages.length > 0 ? flowchartImages : [getCurrentImagePath()];
      const amosPageCount = amosImages.length;
      const totalPageCount = amosPageCount + 2; // AMOS pages + ACI page + Comments page
      
      // Helper: Add header to each page
      const addPageHeader = (pageTitle: string) => {
        let yPos = margin;
        
        // Project title
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MIS Migration Project', margin, yPos + 5);
        
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
      
      // Helper: Add AMOS image to current page
      const addAmosImage = async (imagePath: string, pageNum: number, imageNum: number, totalImages: number) => {
        const imageLabel = totalImages > 1 ? ` (${imageNum}/${totalImages})` : '';
        let yPosition = addPageHeader(`AMOS Process${imageLabel}`);
        
        // Title
        pdf.setFillColor('#dbeafe');
        pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 10, 2, 2, 'F');
        pdf.setTextColor('#1d4ed8');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`AMOS Process Flowchart${imageLabel}`, margin + 5, yPosition + 5);
        
        yPosition += 15;
        
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
      };
      
      // ==========================================
      // AMOS Process Pages (one per image)
      // ==========================================
      for (let i = 0; i < amosImages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        await addAmosImage(amosImages[i], i + 1, i + 1, amosImages.length);
      }
      
      // ==========================================
      // ACI Process Flowchart Page (Screenshot)
      // ==========================================
      pdf.addPage();
      let yPosition = addPageHeader('ACI Process');
      
      // Title
      pdf.setFillColor('#ffedd5');
      pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 10, 2, 2, 'F');
      pdf.setTextColor('#c2410c');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACI Process Flowchart', margin + 5, yPosition + 5);
      
      yPosition += 15;
      
      // Load ACI image from PNG file
      const aciImagePath = getAciFlowchartImage(subModule.id);
      if (aciImagePath) {
        try {
          // Fetch the image and convert to base64
          const aciResponse = await fetch(aciImagePath);
          const aciBlob = await aciResponse.blob();
          const aciImgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(aciBlob);
          });
          
          // Create an image to get dimensions
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = aciImgData;
          });
          
          // Calculate dimensions for PDF
          const maxImgWidth = pageWidth - margin * 2;
          const maxImgHeight = pageHeight - yPosition - 25;
          const imgRatio = img.width / img.height;
          let imgWidth = maxImgWidth;
          let imgHeight = imgWidth / imgRatio;
          if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight;
            imgWidth = imgHeight * imgRatio;
          }
          
          const xOffset = margin + (maxImgWidth - imgWidth) / 2;
          pdf.addImage(aciImgData, 'PNG', xOffset, yPosition, imgWidth, imgHeight);
        } catch (err) {
          console.error('Error loading ACI image:', err);
          pdf.setFillColor(lightGray);
          pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 60, 3, 3, 'F');
          pdf.setTextColor(grayColor);
          pdf.setFontSize(10);
          pdf.text('Erreur lors du chargement de l\'image ACI', pageWidth / 2 - 45, yPosition + 30);
        }
      } else {
        pdf.setFillColor(lightGray);
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 60, 3, 3, 'F');
        pdf.setTextColor(grayColor);
        pdf.setFontSize(10);
        pdf.text('Image ACI non disponible', pageWidth / 2 - 35, yPosition + 30);
      }
      
      // ==========================================
      // Comments Page
      // ==========================================
      pdf.addPage();
      yPosition = addPageHeader('Commentaires');
      
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
      // APN Page(s)
      // ==========================================
      pdf.addPage();
      yPosition = addPageHeader('APNs Associés');
      
      // Title
      pdf.setFillColor('#e0e7ff');
      pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 10, 2, 2, 'F');
      pdf.setTextColor('#4338ca');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`APNs pour ce Process (${processApns.length})`, margin + 5, yPosition + 5);
      
      yPosition += 15;
      
      if (processApns.length === 0) {
        pdf.setFillColor(lightGray);
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 30, 3, 3, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(grayColor);
        pdf.text('Aucun APN associé à ce process', pageWidth / 2 - 40, yPosition + 17);
      } else {
        // Table header
        pdf.setFillColor('#f3f4f6');
        pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 8, 1, 1, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#374151');
        pdf.text('APN', margin + 5, yPosition + 3);
        pdf.text('Nom', margin + 30, yPosition + 3);
        pdf.text('Description', margin + 110, yPosition + 3);
        
        yPosition += 10;
        
        for (const apn of processApns) {
          // Calculate row height based on content
          const titleLines = pdf.splitTextToSize(apn.title || '-', pageWidth - margin * 2 - 115);
          const rowHeight = Math.max(8, 4 + titleLines.length * 3.5);
          
          // Check if we need a new page
          if (yPosition + rowHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin + 20;
            
            // Repeat table header
            pdf.setFillColor('#f3f4f6');
            pdf.roundedRect(margin, yPosition - 2, pageWidth - margin * 2, 8, 1, 1, 'F');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#374151');
            pdf.text('APN', margin + 5, yPosition + 3);
            pdf.text('Nom', margin + 30, yPosition + 3);
            pdf.text('Description', margin + 110, yPosition + 3);
            yPosition += 10;
          }
          
          // Row background (alternating)
          const rowIndex = processApns.indexOf(apn);
          if (rowIndex % 2 === 0) {
            pdf.setFillColor('#fafafa');
            pdf.rect(margin, yPosition - 2, pageWidth - margin * 2, rowHeight, 'F');
          }
          
          // APN number
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor('#4338ca');
          pdf.text(apn.apn.toString(), margin + 5, yPosition + 3);
          
          // APN name (truncated)
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor('#000000');
          const apnNameTruncated = apn.apnName.length > 35 ? apn.apnName.substring(0, 35) + '...' : apn.apnName;
          pdf.text(apnNameTruncated, margin + 30, yPosition + 3);
          
          // Title/Description
          pdf.setFontSize(7);
          pdf.setTextColor(grayColor);
          pdf.text(titleLines, margin + 110, yPosition + 3);
          
          yPosition += rowHeight + 1;
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

            {/* Service/Unit Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] gap-1"
              onClick={() => setIsServiceDialogOpen(true)}
            >
              <Building2 className="w-3 h-3" />
              Services ({associatedServices.length})
            </Button>

            {/* APN Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] gap-1"
              onClick={() => setIsApnDialogOpen(true)}
            >
              <Grid3X3 className="w-3 h-3" />
              APNs ({processApns.length})
            </Button>

            {/* Download Process Design Button */}
            {getProcessDesignFile(subModule.id) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] gap-1"
                onClick={() => {
                  const filePath = getProcessDesignFile(subModule.id);
                  if (filePath) {
                    const link = document.createElement('a');
                    link.href = filePath;
                    link.download = filePath.split('/').pop() || 'ProcessDesign.docx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <FileDown className="w-3 h-3" />
                Process Design
              </Button>
            )}

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
          {/* ACI Process - Left Column */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-t-lg border border-orange-200 dark:border-orange-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-semibold text-sm text-orange-700 dark:text-orange-300">ACI Process</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800"
                onClick={() => setIsDrawioEditorOpen(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Edit</span>
              </Button>
            </div>
            <div className="flex-1 border border-t-0 border-border rounded-b-lg overflow-hidden bg-white flex items-center justify-center relative">
              {aciImageLoading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs text-center">Chargement...</span>
                </div>
              ) : (aciImageFromDb || getAciFlowchartImage(subModule.id)) ? (
                <>
                  <img
                    src={aciImageFromDb || getAciFlowchartImage(subModule.id)!}
                    alt={`ACI Flowchart ${subModule.name}`}
                    className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity p-2"
                    onClick={() => setIsAciImageZoomed(true)}
                    onError={(e) => {
                      // Si l'image ACI n'existe pas, afficher un placeholder
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    className="absolute bottom-2 right-2 p-1.5 bg-background/80 rounded-md hover:bg-background transition-colors"
                    onClick={() => setIsAciImageZoomed(true)}
                  >
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {aciImageFromDb && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/90 text-white text-[9px] rounded-md">
                      DB
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs text-center">Image ACI en cours de création</span>
                  <span className="text-[10px] text-center opacity-70">{subModule.id} {subModule.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* AMOS Process - Right Column */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-t-lg border border-blue-200 dark:border-blue-800 shrink-0">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">AMOS Process</span>
            </div>
            <div className="flex-1 border border-t-0 border-border rounded-b-lg bg-white flex items-center justify-center relative overflow-hidden">
              {imageError ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs text-center">Image non disponible</span>
                  <span className="text-[10px] text-center opacity-70">{getCurrentImagePath()}</span>
                </div>
              ) : (
                <>
                  <img
                    src={getCurrentImagePath()}
                    alt={`Flowchart ${subModule.name}`}
                    className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity p-2"
                    onError={() => setImageError(true)}
                    onClick={() => setIsImageZoomed(true)}
                  />
                  {/* Navigation pour plusieurs images */}
                  {flowchartImages.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 rounded-full px-3 py-1.5 shadow-md">
                      <button
                        className="p-1 hover:bg-muted rounded-full disabled:opacity-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(i => Math.max(0, i - 1));
                        }}
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronUp className="w-4 h-4 -rotate-90" />
                      </button>
                      <span className="text-xs font-medium min-w-[3rem] text-center">
                        {currentImageIndex + 1} / {flowchartImages.length}
                      </span>
                      <button
                        className="p-1 hover:bg-muted rounded-full disabled:opacity-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(i => Math.min(flowchartImages.length - 1, i + 1));
                        }}
                        disabled={currentImageIndex === flowchartImages.length - 1}
                      >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </button>
                    </div>
                  )}
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

      {/* ACI Image Zoom Modal */}
      {isAciImageZoomed && (aciImageFromDb || getAciFlowchartImage(subModule.id)) && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setIsAciImageZoomed(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={aciImageFromDb || getAciFlowchartImage(subModule.id)!}
              alt={`ACI Flowchart ${subModule.name}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-background transition-colors"
              onClick={() => setIsAciImageZoomed(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">ACI - {subModule.id} {subModule.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* AMOS Image Zoom Modal */}
      {isImageZoomed && !imageError && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={getCurrentImagePath()}
              alt={`Flowchart ${subModule.name}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-background transition-colors"
              onClick={() => setIsImageZoomed(false)}
            >
              <X className="w-5 h-5" />
            </button>
            {/* Navigation en mode zoom pour plusieurs images */}
            {flowchartImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/90 rounded-full px-4 py-2 shadow-lg">
                <button
                  className="p-2 hover:bg-muted rounded-full disabled:opacity-30 transition-colors"
                  onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronUp className="w-5 h-5 -rotate-90" />
                </button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {currentImageIndex + 1} / {flowchartImages.length}
                </span>
                <button
                  className="p-2 hover:bg-muted rounded-full disabled:opacity-30 transition-colors"
                  onClick={() => setCurrentImageIndex(i => Math.min(flowchartImages.length - 1, i + 1))}
                  disabled={currentImageIndex === flowchartImages.length - 1}
                >
                  <ChevronDown className="w-5 h-5 -rotate-90" />
                </button>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/90 rounded-lg">
              <span className="text-sm font-medium">{subModule.id} - {subModule.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Service Selection Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
        setIsServiceDialogOpen(open);
        if (!open) setServiceSearchQuery('');
      }}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                Assigner des services
                {/* Indicateur de synchronisation Netlify */}
                {isSyncing ? (
                  <Badge variant="secondary" className="ml-auto gap-1.5 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Synchronisation...
                  </Badge>
                ) : lastSyncedAt && (
                  <Badge variant="outline" className="ml-auto gap-1.5 text-emerald-600 border-emerald-300">
                    <Check className="w-3 h-3" />
                    Sauvegardé
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Sélections actuelles */}
          {associatedServices.length > 0 && (
            <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-b flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {associatedServices.length} service{associatedServices.length > 1 ? 's' : ''} assigné{associatedServices.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto">
                {associatedServices.map((s) => (
                  <Badge 
                    key={s.id}
                    variant="secondary"
                    className="shrink-0 gap-1.5 pr-1.5 bg-white dark:bg-background"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                    <button
                      onClick={() => removeProcessFromService(s.id, subModule.id)}
                      className="ml-1 p-0.5 hover:bg-destructive/20 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => {
                  associatedServices.forEach(s => {
                    removeProcessFromService(s.id, subModule.id);
                  });
                }}
              >
                Tout retirer
              </Button>
            </div>
          )}
          
          {/* Liste des services */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6 space-y-6">
              {Object.keys(filteredAndGroupedServices).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Aucun service trouvé</p>
                  <p className="text-sm">Essayez avec d'autres termes de recherche</p>
                </div>
              ) : (
                Object.entries(filteredAndGroupedServices).map(([groupName, services]) => (
                  <div key={groupName}>
                    {/* En-tête du groupe */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold">{groupName}</h4>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        {services.filter(s => associatedServices.some(as => as.id === s.id)).length}/{services.length}
                      </span>
                    </div>
                    
                    {/* Grille des services */}
                    <div className="grid grid-cols-2 gap-3">
                      {services.map((service) => {
                        const isAssociated = associatedServices.some(s => s.id === service.id);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              if (isAssociated) {
                                removeProcessFromService(service.id, subModule.id);
                              } else {
                                addProcessToService(service.id, subModule.id);
                              }
                            }}
                            className={cn(
                              "relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                              "hover:scale-[1.02] active:scale-[0.98]",
                              isAssociated 
                                ? "bg-primary/5 border-primary shadow-md shadow-primary/10" 
                                : "bg-card border-transparent hover:border-muted-foreground/20 hover:shadow-sm"
                            )}
                          >
                            {/* Checkbox visuel */}
                            <div 
                              className={cn(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                                isAssociated 
                                  ? "bg-primary border-primary" 
                                  : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                              )}
                            >
                              {isAssociated && (
                                <Check className="w-4 h-4 text-primary-foreground" />
                              )}
                            </div>
                            
                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: service.color }}
                                />
                                <span className="font-semibold text-sm truncate">
                                  {service.name}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {service.type === 'unit' ? 'Unité' : 'Service'}
                                {service.parentName && service.type === 'unit' && (
                                  <span className="opacity-60"> • {service.parentName}</span>
                                )}
                              </p>
                            </div>
                            
                            {/* Badge compteur */}
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "absolute -top-2 -right-2 text-[10px] font-bold px-2",
                                isAssociated && "bg-primary text-primary-foreground"
                              )}
                            >
                              {service.subModuleIds.length}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Footer */}
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-emerald-500" />
              Sauvegarde automatique
            </div>
            <Button 
              onClick={() => setIsServiceDialogOpen(false)}
              className="px-6"
            >
              Terminé
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* APN Dialog */}
      <Dialog open={isApnDialogOpen} onOpenChange={setIsApnDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-primary" />
              APNs pour {subModule.id} - {subModule.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{processApns.length} APNs</Badge>
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {processApns.length > 0 ? (
              <div className="space-y-2">
                {processApns.map((apn) => {
                  const areaColor = AREA_COLORS[apn.areaCode] || '#64748b';
                  return (
                    <div 
                      key={apn.id}
                      className="p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant="outline" 
                          className="font-mono text-xs shrink-0"
                          style={{ borderColor: areaColor, color: areaColor }}
                        >
                          APN {apn.apn}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{apn.apnName}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{apn.title}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Grid3X3 className="w-12 h-12 mb-2 opacity-50" />
                <p>Aucun APN associé à ce process</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Draw.io Editor Modal */}
      <DrawioEditor
        isOpen={isDrawioEditorOpen}
        onClose={() => setIsDrawioEditorOpen(false)}
        drawioFilePath={getAciDrawioFile(subModule.id)}
        moduleName={subModule.name}
        moduleId={subModule.id}
      />

    </motion.div>
  );
};
