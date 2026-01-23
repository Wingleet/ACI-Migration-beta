import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { FlowchartNodeData, NodeType, FLOWCHART_SYMBOLS } from '@/types/flowchart';

interface InspectorProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeChange: (nodeId: string, data: Partial<FlowchartNodeData>) => void;
  onEdgeChange: (edgeId: string, label: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedNode,
  selectedEdge,
  onNodeChange,
  onEdgeChange,
  onDeleteNode,
  onDeleteEdge,
}) => {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs p-2">
        <p>Sélectionnez un élément</p>
        <p className="text-[10px] mt-1">pour modifier ses propriétés</p>
      </div>
    );
  }

  if (selectedNode) {
    const nodeData = selectedNode.data as FlowchartNodeData;
    const symbol = FLOWCHART_SYMBOLS.find(s => s.type === selectedNode.type as NodeType);

    return (
      <div className="p-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            {symbol?.standardName || 'Node'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Nom *</label>
            <Input
              value={nodeData.name || ''}
              onChange={(e) => onNodeChange(selectedNode.id, { name: e.target.value })}
              placeholder="Nom du nœud..."
              className="h-7 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Note</label>
            <Input
              value={nodeData.note || ''}
              onChange={(e) => onNodeChange(selectedNode.id, { note: e.target.value })}
              placeholder="Note courte..."
              className="h-7 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Description</label>
            <Textarea
              value={nodeData.description || ''}
              onChange={(e) => onNodeChange(selectedNode.id, { description: e.target.value })}
              placeholder="Description détaillée..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-[9px] text-muted-foreground">
            ID: {selectedNode.id}
          </p>
          <p className="text-[9px] text-muted-foreground">
            Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
          </p>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="p-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            Connexion
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteEdge(selectedEdge.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Label</label>
          <Input
            value={(selectedEdge.label as string) || ''}
            onChange={(e) => onEdgeChange(selectedEdge.id, e.target.value)}
            placeholder="Ex: Oui / Non..."
            className="h-7 text-xs"
          />
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-[9px] text-muted-foreground">
            De: {selectedEdge.source}
          </p>
          <p className="text-[9px] text-muted-foreground">
            Vers: {selectedEdge.target}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
