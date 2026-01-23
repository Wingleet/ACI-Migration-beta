import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { Palette } from './Palette';
import { Inspector } from './Inspector';
import { FlowchartNodeData, NodeType, FlowchartDiagram } from '@/types/flowchart';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

interface FlowchartEditorProps {
  initialDiagram?: FlowchartDiagram | null;
  onChange?: (diagram: FlowchartDiagram) => void;
  diagramId?: string;
}

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

const FlowchartEditorInner: React.FC<FlowchartEditorProps> = ({
  initialDiagram,
  onChange,
  diagramId = 'default',
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialDiagram?.nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })) || []
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialDiagram?.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      animated: false,
      style: { strokeWidth: 2 },
      labelStyle: { fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
    })) || []
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Initialize node ID counter based on existing nodes
  useEffect(() => {
    if (initialDiagram?.nodes.length) {
      const maxId = Math.max(...initialDiagram.nodes.map(n => {
        const match = n.id.match(/node_(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }));
      nodeId = maxId + 1;
    }
    // Mark as initialized after first render
    isInitialized.current = true;
  }, []);

  // Save changes with debounce - only after user interactions
  const saveDiagram = useCallback(() => {
    if (!onChange || !isInitialized.current) return;
    
    const diagram: FlowchartDiagram = {
      id: diagramId,
      name: 'Flowchart',
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: n.data as FlowchartNodeData,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label as string | undefined,
      })),
      updatedAt: new Date().toISOString(),
    };
    onChange(diagram);
  }, [nodes, edges, onChange, diagramId]);

  // Debounced save - only trigger after user stops making changes
  useEffect(() => {
    if (!isInitialized.current) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDiagram();
    }, 500); // 500ms debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, saveDiagram]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2 },
            labelStyle: { fontSize: 10, fontWeight: 500 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultNames: Record<NodeType, string> = {
        terminator: 'Start',
        process: 'Process',
        processAcc: 'ACC',
        processEngineering: 'Engineering',
        processPlanning: 'Planning',
        processProduction: 'Production',
        processMcc: 'MCC',
        processLogistics: 'Logistics',
        processStore: 'Store',
        processFinance: 'Finance',
        predefinedProcess: 'Subprocess',
        decision: 'Decision?',
        document: 'Document',
        connector: '1',
        cloud: 'Software',
        note: 'Note...',
      };

      const newNode: Node = {
        id: getNodeId(),
        type,
        position,
        data: { name: defaultNames[type] || 'New Node', note: '', description: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const handleNodeChange = useCallback(
    (nodeId: string, data: Partial<FlowchartNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...data },
            };
          }
          return node;
        })
      );
      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev
      );
    },
    [setNodes]
  );

  const handleEdgeChange = useCallback(
    (edgeId: string, label: string) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return { ...edge, label };
          }
          return edge;
        })
      );
      setSelectedEdge((prev) =>
        prev?.id === edgeId ? { ...prev, label } : prev
      );
    },
    [setEdges]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      setSelectedEdge(null);
    },
    [setEdges]
  );

  const handleExport = () => {
    const diagram: FlowchartDiagram = {
      id: diagramId,
      name: 'Flowchart',
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: n.data as FlowchartNodeData,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label as string | undefined,
      })),
      updatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(diagram, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart_${diagramId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const diagram = JSON.parse(event.target?.result as string) as FlowchartDiagram;
          
          setNodes(diagram.nodes.map(n => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
          })));
          
          setEdges(diagram.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            type: 'smoothstep',
            style: { strokeWidth: 2 },
            labelStyle: { fontSize: 10, fontWeight: 500 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
          })));

          // Update node ID counter
          const maxId = Math.max(...diagram.nodes.map(n => {
            const match = n.id.match(/node_(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }), 0);
          nodeId = maxId + 1;
        } catch (err) {
          console.error('Failed to import flowchart:', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handleDeleteNode(selectedNode.id);
        } else if (selectedEdge && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handleDeleteEdge(selectedEdge.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, handleDeleteNode, handleDeleteEdge]);

  return (
    <div className="flex h-full w-full">
      {/* Left Panel - Palette */}
      <div className="w-[120px] border-r border-border bg-muted/20 shrink-0 overflow-y-auto">
        <Palette onDragStart={onDragStart} />
        
        {/* Actions */}
        <div className="p-1 border-t border-border mt-2 space-y-1">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Actions
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-7 text-[10px]"
            onClick={handleExport}
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-7 text-[10px]"
            onClick={handleImport}
          >
            <Upload className="w-3 h-3 mr-1.5" />
            Import JSON
          </Button>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[10, 10]}
          deleteKeyCode={null} // We handle delete manually
          className="bg-background"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} className="!bg-card !border-border !shadow-md" />
          <Panel position="top-right" className="!m-1">
            <div className="text-[9px] text-muted-foreground bg-card/80 px-2 py-1 rounded border border-border">
              {nodes.length} nœuds · {edges.length} liens
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Panel - Inspector (only visible when element is selected) */}
      {(selectedNode || selectedEdge) && (
        <div className="w-[160px] border-l border-border bg-muted/20 shrink-0 overflow-y-auto">
          <Inspector
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onNodeChange={handleNodeChange}
            onEdgeChange={handleEdgeChange}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
          />
        </div>
      )}
    </div>
  );
};

export const FlowchartEditor: React.FC<FlowchartEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowchartEditorInner {...props} />
    </ReactFlowProvider>
  );
};
