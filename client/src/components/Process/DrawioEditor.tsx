import React, { useEffect, useRef, useState } from 'react';
import { X, Save, Download, Loader2, Cloud, CloudOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface DrawioEditorProps {
  isOpen: boolean;
  onClose: () => void;
  drawioFilePath: string | null;
  moduleName: string;
  moduleId: string;
}

export const DrawioEditor: React.FC<DrawioEditorProps> = ({
  isOpen,
  onClose,
  drawioFilePath,
  moduleName,
  moduleId,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const pendingXmlRef = useRef<string | null>(null);

  // Load the .drawio file content - first try DB, then fallback to local
  useEffect(() => {
    if (isOpen && drawioFilePath) {
      setIsLoading(true);
      setLoadedFromDb(false);
      
      // First try to load from Neon DB
      fetch(`/api/flowchart-save?path=${encodeURIComponent(drawioFilePath)}`)
        .then(response => {
          if (!response.ok) throw new Error('Not in DB');
          return response.json();
        })
        .then(data => {
          if (data.data?.content) {
            setXmlContent(data.data.content);
            setLoadedFromDb(true);
            setIsLoading(false);
          } else {
            throw new Error('No content in DB');
          }
        })
        .catch(() => {
          // Fallback to local file
          fetch(drawioFilePath)
            .then(response => {
              if (!response.ok) throw new Error('File not found');
              return response.text();
            })
            .then(content => {
              setXmlContent(content);
              setIsLoading(false);
            })
            .catch(error => {
              console.error('Error loading drawio file:', error);
              setXmlContent(null);
              setIsLoading(false);
            });
        });
    }
  }, [isOpen, drawioFilePath]);

  // Save to Neon DB (drawio XML)
  const saveDrawioToDb = async (xml: string) => {
    if (!drawioFilePath) return false;
    
    try {
      const response = await fetch('/api/flowchart-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: drawioFilePath,
          name: drawioFilePath.split('/').pop() || `${moduleId}.drawio`,
          content: xml,
        }),
      });
      
      if (!response.ok) throw new Error('Save failed');
      
      setXmlContent(xml);
      setLoadedFromDb(true);
      return true;
    } catch (error) {
      console.error('Error saving drawio to DB:', error);
      return false;
    }
  };

  // Save PNG image to Neon DB
  const savePngToDb = async (base64Data: string) => {
    try {
      // Construire le chemin de l'image ACI basé sur le moduleId
      const imagePath = `/Flowchart/${moduleId} ACI.png`;
      const imageName = `${moduleId} ACI.png`;
      
      const response = await fetch('/api/aci-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: imagePath,
          name: imageName,
          moduleId: moduleId,
          content: base64Data,
          mimeType: 'image/png',
        }),
      });
      
      if (!response.ok) throw new Error('PNG save failed');
      
      console.log('✅ PNG sauvegardé dans la DB');
      return true;
    } catch (error) {
      console.error('Error saving PNG to DB:', error);
      return false;
    }
  };

  // Request PNG export from Draw.io
  const requestPngExport = () => {
    if (iframeRef.current?.contentWindow) {
      setIsExportingPng(true);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          action: 'export',
          format: 'png',
          background: '#ffffff',
          scale: 2, // Higher quality
          border: 10,
        }),
        '*'
      );
    }
  };

  // Full save: XML + PNG
  const saveToDb = async (xml: string) => {
    if (!drawioFilePath) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    // Sauvegarder le XML
    const xmlSaved = await saveDrawioToDb(xml);
    
    if (xmlSaved) {
      // Stocker le XML pour référence et déclencher l'export PNG
      pendingXmlRef.current = xml;
      requestPngExport();
    } else {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
      setIsSaving(false);
    }
  };

  // Handle messages from Draw.io iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== 'https://embed.diagrams.net') return;
      
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.event === 'init') {
          // Draw.io is ready, send the XML content
          if (xmlContent && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                action: 'load',
                xml: xmlContent,
                autosave: 0,
              }),
              '*'
            );
          }
        } else if (msg.event === 'save') {
          // User clicked save - save to Neon DB
          console.log('Save event received');
          if (msg.xml) {
            saveToDb(msg.xml);
          }
        } else if (msg.event === 'export') {
          // Export PNG completed - save to DB
          console.log('Export PNG completed');
          setIsExportingPng(false);
          
          if (msg.data) {
            // msg.data contient l'image en base64 (data:image/png;base64,...)
            // Extraire juste la partie base64
            const base64Match = msg.data.match(/^data:image\/png;base64,(.+)$/);
            if (base64Match) {
              const pngSaved = await savePngToDb(base64Match[1]);
              
              if (pngSaved) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
              } else {
                // Le drawio est sauvé mais pas le PNG
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
              }
            }
          }
          
          setIsSaving(false);
        } else if (msg.event === 'exit') {
          // User closed the editor
          onClose();
        }
      } catch (e) {
        // Not a JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [xmlContent, onClose, moduleId]);

  // Fermer avec la touche Échap
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build the Draw.io embed URL
  const getDrawioUrl = () => {
    const params = new URLSearchParams({
      embed: '1',
      ui: 'atlas',
      spin: '1',
      modified: 'unsavedChanges',
      proto: 'json',
      saveAndExit: '0',
      noSaveBtn: '0',
      noExitBtn: '0',
    });
    return `https://embed.diagrams.net/?${params.toString()}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-screen h-screen bg-card shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xs">{moduleId}</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold">Éditer le flowchart ACI</h2>
                <p className="text-xs text-muted-foreground">{moduleName}</p>
              </div>
              {/* Source indicator */}
              {!isLoading && xmlContent && (
                <Badge variant="outline" className="text-[10px] ml-2">
                  {loadedFromDb ? (
                    <>
                      <Cloud className="w-3 h-3 mr-1 text-emerald-500" />
                      Neon DB
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 mr-1 text-amber-500" />
                      Local
                    </>
                  )}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Save status */}
              {isSaving && !isExportingPng && (
                <Badge variant="outline" className="text-[10px]">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Sauvegarde XML...
                </Badge>
              )}
              {isExportingPng && (
                <Badge variant="outline" className="text-[10px]">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Export PNG...
                </Badge>
              )}
              {saveSuccess && (
                <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">
                  <Check className="w-3 h-3 mr-1" />
                  XML + PNG sauvegardés
                </Badge>
              )}
              {saveError && (
                <Badge variant="outline" className="text-[10px] border-red-500 text-red-600">
                  <X className="w-3 h-3 mr-1" />
                  Erreur de sauvegarde
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4 mr-1" />
                Fermer
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Chargement de l'éditeur...</span>
                </div>
              </div>
            ) : !drawioFilePath ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-center p-8">
                  <span className="text-lg font-semibold text-muted-foreground">
                    Fichier .drawio non disponible
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Le fichier source pour ce module n'existe pas encore.
                  </span>
                  <span className="text-xs text-muted-foreground opacity-70">
                    Chemin attendu: /Flowchart/{moduleId}*.drawio
                  </span>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={getDrawioUrl()}
                className="w-full h-full border-0"
                title="Draw.io Editor"
              />
            )}
          </div>

          {/* Footer with info */}
          <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span>Powered by </span>
            <a 
              href="https://www.diagrams.net/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              diagrams.net
            </a>
            <span> (Draw.io) • </span>
            <span>Fichier: {drawioFilePath || 'N/A'}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DrawioEditor;
