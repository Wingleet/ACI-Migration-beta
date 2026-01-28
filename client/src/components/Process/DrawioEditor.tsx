import React, { useEffect, useRef, useState } from 'react';
import { X, Save, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [xmlContent, setXmlContent] = useState<string | null>(null);

  // Load the .drawio file content
  useEffect(() => {
    if (isOpen && drawioFilePath) {
      setIsLoading(true);
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
    }
  }, [isOpen, drawioFilePath]);

  // Handle messages from Draw.io iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
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
          // User clicked save - download the XML
          console.log('Save event received', msg.xml);
          // Here you could implement server-side save
        } else if (msg.event === 'export') {
          // Export completed
          console.log('Export completed');
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
  }, [xmlContent, onClose]);

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
          className="w-[95vw] h-[90vh] bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col"
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
            </div>
            <div className="flex items-center gap-2">
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
