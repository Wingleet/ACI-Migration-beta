import React, { useState } from 'react';
import { X } from 'lucide-react';

const Organigrame: React.FC = () => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
      </div>

      {/* Image Container - fills entire available space */}
      <div className="flex-1 flex items-center justify-center p-2 relative z-10 overflow-hidden">
        <img
          src="/images/flowchart/organigrame.png"
          alt="Organigramme du Projet"
          className="max-w-full max-h-full object-contain cursor-pointer rounded-lg shadow-lg border border-border transition-transform hover:scale-[1.01]"
          onClick={() => setIsZoomed(true)}
        />
      </div>

      {/* Fullscreen Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] overflow-auto">
            <img
              src="/images/flowchart/organigrame.png"
              alt="Organigramme du Projet"
              className="max-w-none rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
              onClick={() => setIsZoomed(false)}
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organigrame;
