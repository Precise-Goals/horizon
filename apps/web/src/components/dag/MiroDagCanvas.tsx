import React, { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';
import type { DecodedArchitecture } from '../../engine/dagArchitectAgent';
import {
  Database,
  Server,
  Layers,
  Globe,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  Scan,
  X,
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
  const instanceId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport transform states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interactive interaction states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  // Drag tracking refs
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialNodePos: Point } | null>(null);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; initialPan: Point } | null>(null);

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

  const fitToView = useCallback((customPositions?: Record<string, Point>) => {
    const activePositions = customPositions || positions;
    const nodeIds = architecture.nodes.map((n) => n.id);
    const validPositions = nodeIds
      .map((id) => activePositions[id])
      .filter((p): p is Point => !!p);

    if (validPositions.length === 0 || !containerRef.current) return;

    const minX = Math.min(...validPositions.map((p) => p.x));
    const maxX = Math.max(...validPositions.map((p) => p.x));
    const minY = Math.min(...validPositions.map((p) => p.y));
    const maxY = Math.max(...validPositions.map((p) => p.y));

    const nodeWidth = 190;
    const nodeHeight = 85;

    const boundingW = (maxX - minX) + nodeWidth + 120;
    const boundingH = (maxY - minY) + nodeHeight + 140;

    const containerW = containerRef.current.clientWidth || 900;
    const containerH = containerRef.current.clientHeight || 650;

    const scaleX = containerW / boundingW;
    const scaleY = containerH / boundingH;
    const calculatedZoom = Math.min(1.2, Math.max(0.45, Math.min(scaleX, scaleY)));

    const boundingCenterX = (minX + maxX) / 2;
    const boundingCenterY = (minY + maxY) / 2;

    const panX = containerW / 2 - boundingCenterX * calculatedZoom;
    const panY = containerH / 2 - boundingCenterY * calculatedZoom;

    setZoom(calculatedZoom);
    setPan({ x: panX, y: panY });
  }, [architecture.nodes, positions]);

  const computeInitialTreeLayout = useCallback(() => {
    const newPositions: Record<string, Point> = {};
    const levels = architecture.topologicalLevels;

    const levelGapY = 160;
    const nodeGapX = 220;

    levels.forEach((levelNodeIds, levelIndex) => {
      const y = 80 + levelIndex * levelGapY;
      const count = levelNodeIds.length;
      const totalWidth = (count - 1) * nodeGapX;
      const startX = -totalWidth / 2;

      levelNodeIds.forEach((id, nodeIdx) => {
        newPositions[id] = {
          x: startX + nodeIdx * nodeGapX + 450,
          y,
        };
      });
    });

    setPositions(newPositions);
    setTimeout(() => fitToView(newPositions), 40);
  }, [architecture.topologicalLevels, fitToView]);

  useEffect(() => {
    computeInitialTreeLayout();
  }, [architecture.architectureName, computeInitialTreeLayout]);

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.miro-dag-canvas button')) return;
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPan: { ...pan },
    };
  };

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialNodePos: { ...positions[nodeId] },
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPan({
          x: panStartRef.current.initialPan.x + dx,
          y: panStartRef.current.initialPan.y + dy,
        });
      } else if (draggingNodeId && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        setPositions((prev) => ({
          ...prev,
          [draggingNodeId]: {
            x: dragStartRef.current!.initialNodePos.x + dx,
            y: dragStartRef.current!.initialNodePos.y + dy,
          },
        }));
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
      panStartRef.current = null;
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingNodeId, zoom]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.min(2.2, Math.max(0.3, zoom * zoomFactor));

    const canvasX = (cursorX - pan.x) / zoom;
    const canvasY = (cursorY - pan.y) / zoom;

    const nextPanX = cursorX - canvasX * nextZoom;
    const nextPanY = cursorY - canvasY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  const handleStepZoom = (delta: number) => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const centerX = containerW / 2;
    const centerY = containerH / 2;

    const nextZoom = Math.min(2.2, Math.max(0.3, zoom + delta));
    const canvasX = (centerX - pan.x) / zoom;
    const canvasY = (centerY - pan.y) / zoom;

    const nextPanX = centerX - canvasX * nextZoom;
    const nextPanY = centerY - canvasY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  const content = (
    <div
      ref={containerRef}
      className={cn(
        'miro-dag-canvas relative select-none border border-white/[0.08]',
        'bg-[#0A0A0B] bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] [background-size:24px_24px]',
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none shadow-2xl overflow-hidden'
          : 'w-full h-[640px] sm:h-[680px] rounded-[14px] overflow-hidden',
        isPanning ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDownCanvas}
      onWheel={handleWheel}
      onClick={() => onSelectNode(null)}
    >
      {/* ── Miro Toolbar & Controls Bar ── */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-30 pointer-events-none">
        {/* Left Badge Header */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-[10px] bg-[#141416]/95 backdrop-blur-md border border-white/[0.1] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span className="text-xs font-semibold text-[#ECECF0] max-w-[220px] sm:max-w-xs truncate">
              {architecture.architectureName}
            </span>
            <span className="text-[10px] font-mono text-[#63636E] hidden sm:inline">
              ({architecture.nodes.length} nodes &bull; {architecture.topologicalLevels.length} tiers)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/[0.08] text-[#7C7FF7]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Right Canvas Controls Toolbar */}
        <div className="flex items-center gap-1 bg-[#141416]/95 backdrop-blur-md p-1 rounded-[10px] border border-white/[0.1] shadow-[0_8px_24px_rgba(0,0,0,0.6)] pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fitToView();
            }}
            className="px-2 py-1 rounded-[6px] hover:bg-white/[0.08] text-[#7C7FF7] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Auto-Fit entire DAG into canvas view"
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit View</span>
          </button>

          <div className="w-px h-3.5 bg-white/[0.08]" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStepZoom(0.15);
            }}
            className="p-1.5 rounded-[6px] hover:bg-white/[0.08] text-[#A0A0AB] hover:text-[#ECECF0] transition-colors cursor-pointer"
            title="Zoom In (or scroll wheel)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStepZoom(-0.15);
            }}
            className="p-1.5 rounded-[6px] hover:bg-white/[0.08] text-[#A0A0AB] hover:text-[#ECECF0] transition-colors cursor-pointer"
            title="Zoom Out (or scroll wheel)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-white/[0.08]" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              computeInitialTreeLayout();
            }}
            className="p-1.5 rounded-[6px] hover:bg-white/[0.08] text-[#A0A0AB] hover:text-[#ECECF0] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="Reset to default tree layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="w-px h-3.5 bg-white/[0.08]" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen((prev) => !prev);
            }}
            className={cn(
              'p-1.5 rounded-[6px] transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium',
              isFullscreen
                ? 'bg-[#6366F1] text-white'
                : 'hover:bg-white/[0.08] text-[#A0A0AB] hover:text-[#ECECF0]'
            )}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen Modal'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Active Selection HUD Inspector (Floating Card) ── */}
      {blastInfo && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-16 left-3.5 z-25 max-w-sm p-3.5 rounded-[12px] bg-[#141416]/95 backdrop-blur-md border border-white/[0.12] shadow-[0_16px_48px_rgba(0,0,0,0.7)] space-y-2 pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span className="text-xs font-semibold text-[#ECECF0] truncate">
                {blastInfo.selectedNode.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-[#A0A0AB] uppercase">
                {blastInfo.selectedNode.type}
              </span>
            </div>
            <button
              onClick={() => onSelectNode(null)}
              className="p-1 rounded-[4px] hover:bg-white/[0.08] text-[#63636E] hover:text-[#ECECF0] cursor-pointer"
              title="Close inspection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-[8px] bg-[#34D399]/10 border border-[#34D399]/25">
              <span className="text-[9px] uppercase font-medium text-[#34D399] block">
                Upstream Deps
              </span>
              <span className="text-[#ECECF0] font-semibold">
                {blastInfo.upstreamDeps.length} Services
              </span>
            </div>

            <div className="p-2 rounded-[8px] bg-[#F87171]/10 border border-[#F87171]/25">
              <span className="text-[9px] uppercase font-medium text-[#F87171] block">
                Blast Radius
              </span>
              <span className="text-[#ECECF0] font-semibold">
                {blastInfo.downstreamBlast.length} Impaired
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Canvas Scaled Area ── */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning || draggingNodeId ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <marker
              id={`arrow-default-${instanceId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(255, 255, 255, 0.25)" />
            </marker>

            <marker
              id={`arrow-upstream-${instanceId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#34D399" />
            </marker>

            <marker
              id={`arrow-downstream-${instanceId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#F87171" />
            </marker>
          </defs>

          {architecture.nodes.map((node) => {
            const sourcePos = positions[node.id];
            if (!sourcePos) return null;

            return node.dependencies.map((targetId) => {
              const targetPos = positions[targetId];
              if (!targetPos) return null;

              const nodeHalfHeight = 34;

              const startX = sourcePos.x;
              const startY = sourcePos.y + nodeHalfHeight;
              const endX = targetPos.x;
              const endY = targetPos.y - nodeHalfHeight;

              const deltaY = Math.abs(endY - startY);
              const controlY1 = startY + Math.max(40, deltaY * 0.45);
              const controlY2 = endY - Math.max(40, deltaY * 0.45);

              const isUpstreamEdge =
                selectedNodeId === node.id && blastInfo?.upstreamDeps.includes(targetId);
              const isDownstreamEdge =
                selectedNodeId === targetId && blastInfo?.downstreamBlast.includes(node.id);

              const strokeColor = isUpstreamEdge
                ? '#34D399'
                : isDownstreamEdge
                ? '#F87171'
                : 'rgba(255, 255, 255, 0.2)';

              const strokeWidth = isUpstreamEdge || isDownstreamEdge ? 2.5 : 1.5;
              const markerId = isUpstreamEdge
                ? `arrow-upstream-${instanceId}`
                : isDownstreamEdge
                ? `arrow-downstream-${instanceId}`
                : `arrow-default-${instanceId}`;

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

        {/* ── Draggable Node Cards ── */}
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
                'absolute z-15 w-[185px] p-3 rounded-[12px] border transition-all duration-150 select-none cursor-grab active:cursor-grabbing',
                'shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
                isSelected
                  ? 'bg-[#18181B] border-[#6366F1] ring-2 ring-[#6366F1] shadow-[0_0_24px_rgba(99,102,241,0.3)] scale-105 z-20'
                  : isDownstream
                  ? 'bg-[#18181B] border-[#F87171] ring-1 ring-[#F87171] text-[#ECECF0]'
                  : isUpstream
                  ? 'bg-[#18181B] border-[#34D399] ring-1 ring-[#34D399] text-[#ECECF0]'
                  : 'bg-[#141416] border-white/[0.08] hover:border-white/[0.18] hover:scale-[1.02]'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 border',
                      isSelected
                        ? 'bg-[#6366F1] text-white border-[#6366F1]'
                        : isDownstream
                        ? 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30'
                        : isUpstream
                        ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30'
                        : 'bg-white/[0.04] text-[#A0A0AB] border-white/[0.08]'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-[#ECECF0] block truncate leading-tight">
                      {node.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#63636E] uppercase block truncate">
                      {node.type}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    node.status === 'healthy' ? 'bg-[#34D399] animate-pulse' : 'bg-[#F87171]'
                  )}
                  title={`Status: ${node.status}`}
                />
              </div>

              <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#63636E]">
                <span>
                  {node.dependencies.length === 0
                    ? 'Root Service'
                    : `Deps: ${node.dependencies.length}`}
                </span>
                <span className="text-[9px] text-[#A0A0AB] flex items-center gap-0.5">
                  <Move className="w-2.5 h-2.5" />
                  <span>drag</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Miro Canvas Footer Guidance Bar ── */}
      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#63636E] pointer-events-none z-20 gap-2">
        <span className="bg-[#141416]/80 backdrop-blur-md px-2.5 py-1 rounded-[6px] border border-white/[0.08]">
          💡 <strong>Pan:</strong> Click & drag &bull; <strong>Zoom:</strong> Scroll or &plusmn; &bull; <strong>Reposition:</strong> Drag cards
        </span>
        <span className="bg-[#141416]/80 backdrop-blur-md px-2.5 py-1 rounded-[6px] border border-white/[0.08]">
          {selectedNodeId ? 'Click background to deselect' : 'Click any node to isolate blast radius'}
        </span>
      </div>
    </div>
  );

  return content;
};
