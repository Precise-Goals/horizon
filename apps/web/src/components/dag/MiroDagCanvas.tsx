import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { DecodedArchitecture } from '../../engine/dagArchitectAgent';
import type { SystemNode, NodeType } from '../../types';
import {
  Database,
  Server,
  Layers,
  Globe,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  Move,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  cache: Server,
  gateway: Globe,
  application: Layers,
};

interface MiroDagCanvasProps {
  architecture: DecodedArchitecture;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

export const MiroDagCanvas: React.FC<MiroDagCanvasProps> = ({
  architecture,
  selectedNodeId,
  onSelectNode,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialNodePos: Point } | null>(null);

  // Compute blast radius info for highlighted node
  const blastInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = architecture.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const downstream = new Set<string>();
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const n of architecture.nodes) {
        if (n.dependencies.includes(current) && !downstream.has(n.id)) {
          downstream.add(n.id);
          queue.push(n.id);
        }
      }
    }

    return {
      selectedNode: node,
      upstreamDeps: node.dependencies,
      downstreamBlast: Array.from(downstream),
    };
  }, [selectedNodeId, architecture]);

  // Initial hierarchical tree layout calculation (Ingress at top, persistence at bottom)
  const computeInitialTreeLayout = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 840;
    const initialPositions: Record<string, Point> = {};

    const levels = architecture.topologicalLevels.slice().reverse(); // Reverse so Tier 3 (Ingress) is at top
    const totalLevels = levels.length;
    const levelHeight = totalLevels > 1 ? Math.min(130, 420 / totalLevels) : 120;
    const topMargin = 70;

    levels.forEach((tierNodeIds, tierIdx) => {
      const y = topMargin + tierIdx * levelHeight;
      const count = tierNodeIds.length;
      const nodeSpacing = Math.min(220, (containerWidth - 120) / Math.max(1, count));
      const startX = containerWidth / 2 - ((count - 1) * nodeSpacing) / 2;

      tierNodeIds.forEach((nodeId, nodeIdx) => {
        const x = startX + nodeIdx * nodeSpacing;
        initialPositions[nodeId] = { x, y };
      });
    });

    setPositions(initialPositions);
  }, [architecture]);

  // Reset or initialize positions when architecture changes
  useEffect(() => {
    computeInitialTreeLayout();
  }, [computeInitialTreeLayout]);

  // Dragging event listeners
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const currentPos = positions[nodeId] || { x: 0, y: 0 };
    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialNodePos: { ...currentPos },
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeId || !dragStartRef.current) return;
      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;

      setPositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.max(90, Math.min(950, dragStartRef.current!.initialNodePos.x + dx)),
          y: Math.max(40, Math.min(520, dragStartRef.current!.initialNodePos.y + dy)),
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      dragStartRef.current = null;
    };

    if (draggingNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, zoom]);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.75, Math.min(1.35, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'miro-dag-canvas relative w-full h-[520px] rounded-2xl overflow-hidden select-none border border-[#E5D7C5]',
        'bg-[#FAF6F0] bg-[radial-gradient(#C2B29F_1.5px,transparent_1.5px)] [background-size:22px_22px]',
        className
      )}
      onClick={() => onSelectNode(null)}
    >
      {/* ── Miro Toolbar & Controls Bar ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E5D7C5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
            <span className="text-xs font-bold text-[#1A1A1A]">{architecture.architectureName}</span>
            <span className="text-[10px] font-mono text-[#8A7B6D]">
              ({architecture.nodes.length} nodes &bull; {architecture.topologicalLevels.length} tiers)
            </span>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-[#E5D7C5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] pointer-events-auto">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[#E5D7C5]" />
          <button
            onClick={computeInitialTreeLayout}
            className="p-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title="Reset Tree Layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Tree</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Canvas Scaled Area ── */}
      <div
        className="w-full h-full relative transition-transform duration-75 origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* SVG Directed Bezier Curves connecting nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            {/* Standard directional arrow marker */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#9C8D7D" />
            </marker>

            {/* Upstream provider highlighted arrow */}
            <marker
              id="arrow-upstream"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
            </marker>

            {/* Downstream blast highlighted arrow */}
            <marker
              id="arrow-downstream"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#E11D48" />
            </marker>
          </defs>

          {/* Render directed dependency edges */}
          {architecture.nodes.map((node) => {
            const sourcePos = positions[node.id];
            if (!sourcePos) return null;

            return node.dependencies.map((targetId) => {
              const targetPos = positions[targetId];
              if (!targetPos) return null;

              // Node dimensions
              const nodeHalfHeight = 32;

              // Calculate start (source bottom) and end (target top)
              const startX = sourcePos.x;
              const startY = sourcePos.y + nodeHalfHeight;
              const endX = targetPos.x;
              const endY = targetPos.y - nodeHalfHeight;

              // Smooth cubic bezier curve control points
              const deltaY = Math.abs(endY - startY);
              const controlY1 = startY + Math.max(30, deltaY * 0.45);
              const controlY2 = endY - Math.max(30, deltaY * 0.45);

              // Determine highlights
              const isUpstreamEdge =
                selectedNodeId === node.id && blastInfo?.upstreamDeps.includes(targetId);
              const isDownstreamEdge =
                selectedNodeId === targetId && blastInfo?.downstreamBlast.includes(node.id);

              const strokeColor = isUpstreamEdge
                ? '#059669'
                : isDownstreamEdge
                ? '#E11D48'
                : '#B0A294';

              const strokeWidth = isUpstreamEdge || isDownstreamEdge ? 2.5 : 1.5;
              const markerId = isUpstreamEdge
                ? 'arrow-upstream'
                : isDownstreamEdge
                ? 'arrow-downstream'
                : 'arrow-default';

              return (
                <path
                  key={`${node.id}->${targetId}`}
                  d={`M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isUpstreamEdge || isDownstreamEdge ? 'none' : '4 3'}
                  markerEnd={`url(#${markerId})`}
                  className="transition-colors duration-150"
                />
              );
            });
          })}
        </svg>

        {/* ── Draggable Node Cards (Miro Style) ── */}
        {architecture.nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;

          const Icon = iconMap[node.type] || Server;
          const isSelected = selectedNodeId === node.id;
          const isDownstream = blastInfo?.downstreamBlast.includes(node.id);
          const isUpstream = blastInfo?.upstreamDeps.includes(node.id);

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDownNode(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id === selectedNodeId ? null : node.id);
              }}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={cn(
                'absolute z-15 w-[190px] p-3 rounded-2xl border transition-all duration-150 select-none cursor-grab active:cursor-grabbing',
                'shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]',
                isSelected
                  ? 'bg-white border-[#0047AB] ring-2 ring-[#0047AB] shadow-lg scale-105'
                  : isDownstream
                  ? 'bg-rose-50/95 border-rose-400 ring-2 ring-rose-400 text-rose-950'
                  : isUpstream
                  ? 'bg-emerald-50/95 border-emerald-400 ring-2 ring-emerald-400 text-emerald-950'
                  : 'bg-white/95 border-[#DACBB8] hover:border-[#0047AB]/50 hover:shadow-md hover:scale-[1.02]'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border',
                      isSelected
                        ? 'bg-[#0047AB] text-white border-[#00388A]'
                        : isDownstream
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : isUpstream
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-[#FAF3EA] text-[#0047AB] border-[#E5D7C5]'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-[#1A1A1A] block truncate leading-tight">
                      {node.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#8A7B6D] uppercase block truncate">
                      {node.type}
                    </span>
                  </div>
                </div>

                {/* Health status dot */}
                <span
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    node.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  )}
                  title={`Status: ${node.status}`}
                />
              </div>

              {/* Dependency indicator footer */}
              <div className="mt-2 pt-1.5 border-t border-[#F0E6D8] flex items-center justify-between text-[10px] font-mono text-[#6E6258]">
                <span>
                  {node.dependencies.length === 0
                    ? 'Root Service'
                    : `Deps: ${node.dependencies.length}`}
                </span>
                <span className="text-[9px] text-[#A39281] flex items-center gap-0.5">
                  <Move className="w-2.5 h-2.5" />
                  <span>drag</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Miro Canvas Footer Note ── */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-[#8A7B6D] pointer-events-none z-20">
        <span>* Drag nodes to customize topology layout</span>
        <span>Click node to isolate blast radius</span>
      </div>
    </div>
  );
};
