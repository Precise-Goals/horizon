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
  Hand,
  X,
  ShieldAlert,
  CheckCircle2,
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
  const positionsRef = useRef<Record<string, Point>>(positions);
  positionsRef.current = positions;

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

  /**
   * Fit to View: Automatically calculates bounding box of all nodes
   * and centers & scales them with generous padding so 100% of the DAG is visible.
   */
  const fitToView = useCallback((customPositions?: Record<string, Point>) => {
    const activePositions = customPositions || positionsRef.current;
    const nodeIds = architecture.nodes.map((n) => n.id);
    const validPositions = nodeIds
      .map((id) => activePositions[id])
      .filter((p): p is Point => !!p);

    if (validPositions.length === 0 || !containerRef.current) return;

    // Node card bounds: width is 185px, height is ~72px, centered at (x, y)
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    validPositions.forEach((p) => {
      minX = Math.min(minX, p.x - 100);
      maxX = Math.max(maxX, p.x + 100);
      minY = Math.min(minY, p.y - 45);
      maxY = Math.max(maxY, p.y + 45);
    });

    const contentWidth = Math.max(200, maxX - minX);
    const contentHeight = Math.max(160, maxY - minY);

    const containerWidth = containerRef.current.clientWidth || 940;
    const containerHeight = containerRef.current.clientHeight || (isFullscreen ? window.innerHeight - 120 : 680);

    const paddingX = 64;
    const paddingY = 64;

    const availableW = Math.max(100, containerWidth - paddingX * 2);
    const availableH = Math.max(100, containerHeight - paddingY * 2);

    const scaleX = availableW / contentWidth;
    const scaleY = availableH / contentHeight;

    // Scale clamped between 0.35 and 1.15 to ensure readability while guaranteeing fit
    const optimalZoom = Math.min(1.15, Math.max(0.35, Math.min(scaleX, scaleY)));

    // Center content within container
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    const targetPanX = containerWidth / 2 - contentCenterX * optimalZoom;
    const targetPanY = containerHeight / 2 - contentCenterY * optimalZoom;

    setZoom(optimalZoom);
    setPan({ x: targetPanX, y: targetPanY });
  }, [architecture.nodes, isFullscreen]);

  /**
   * Initial spacious hierarchical tree layout calculation.
   * Uses normalized coordinate system then auto-fits cleanly into viewport.
   */
  const computeInitialTreeLayout = useCallback(() => {
    const newPositions: Record<string, Point> = {};
    const levels = architecture.topologicalLevels.slice().reverse(); // Reverse so Ingress is at top

    // Spacing constants
    const levelHeight = 160;
    const nodeSpacing = 240;
    const centerX = 600; // Reference origin center
    const topMargin = 100;

    levels.forEach((tierNodeIds, tierIdx) => {
      const y = topMargin + tierIdx * levelHeight;
      const count = tierNodeIds.length;
      const startX = count === 1 ? centerX : centerX - ((count - 1) * nodeSpacing) / 2;

      tierNodeIds.forEach((nodeId, nodeIdx) => {
        const x = count === 1 ? centerX : startX + nodeIdx * nodeSpacing;
        newPositions[nodeId] = { x, y };
      });
    });

    positionsRef.current = newPositions;
    setPositions(newPositions);

    // Automatically fit graph to view once positions are populated
    requestAnimationFrame(() => {
      fitToView(newPositions);
    });
  }, [architecture, fitToView]);

  // Reset or initialize positions when architecture changes
  useEffect(() => {
    computeInitialTreeLayout();
  }, [computeInitialTreeLayout]);

  // Refit when fullscreen state changes or window resizes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToView();
    }, 80);
    return () => clearTimeout(timer);
  }, [isFullscreen, fitToView]);

  useEffect(() => {
    const handleResize = () => {
      fitToView();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToView]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock body scroll in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isFullscreen]);

  // Node Dragging Handlers
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

  // Canvas Panning Handlers (Drag Background)
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Only primary mouse button initiates pan
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPan: { ...pan },
    };
  };

  // Global Mouse Move and Mouse Up Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Handling Node Drag
      if (draggingNodeId && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        const nextX = dragStartRef.current.initialNodePos.x + dx;
        const nextY = dragStartRef.current.initialNodePos.y + dy;

        setPositions((prev) => ({
          ...prev,
          [draggingNodeId]: { x: nextX, y: nextY },
        }));
        return;
      }

      // 2. Handling Canvas Pan
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;

        setPan({
          x: panStartRef.current.initialPan.x + dx,
          y: panStartRef.current.initialPan.y + dy,
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      dragStartRef.current = null;
      setIsPanning(false);
      panStartRef.current = null;
    };

    if (draggingNodeId || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, isPanning, zoom]);

  // Native Non-Passive Mousewheel Zoom listener to prevent passive event listener warnings
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(2.2, Math.max(0.3, prevZoom * zoomFactor));
        setPan((prevPan) => {
          const canvasX = (cursorX - prevPan.x) / prevZoom;
          const canvasY = (cursorY - prevPan.y) / prevZoom;
          return {
            x: cursorX - canvasX * nextZoom,
            y: cursorY - canvasY * nextZoom,
          };
        });
        return nextZoom;
      });
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);

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
        'miro-dag-canvas relative select-none border border-[#E5D7C5]',
        'bg-[#FAF6F0] bg-[radial-gradient(#C2B29F_1.5px,transparent_1.5px)] [background-size:24px_24px]',
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none shadow-2xl overflow-hidden'
          : 'w-full h-[640px] sm:h-[680px] rounded-2xl overflow-hidden',
        isPanning ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDownCanvas}
      onClick={() => onSelectNode(null)}
    >
      {/* ── Miro Toolbar & Controls Bar ── */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-30 pointer-events-none">
        {/* Left Badge Header */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs border border-[#E5D7C5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0047AB] animate-pulse" />
            <span className="text-xs font-bold text-[#1A1A1A] max-w-[220px] sm:max-w-xs truncate">
              {architecture.architectureName}
            </span>
            <span className="text-[10px] font-mono text-[#8A7B6D] hidden sm:inline">
              ({architecture.nodes.length} nodes &bull; {architecture.topologicalLevels.length} tiers)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF3EA] border border-[#E5D7C5] text-[#0047AB] font-bold">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Right Canvas Controls Toolbar */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-[#E5D7C5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] pointer-events-auto">
          {/* Fit to View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              fitToView();
            }}
            className="px-2 py-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#0047AB] hover:text-[#00388A] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-transparent hover:border-[#E5D7C5]"
            title="Auto-Fit entire DAG into canvas view"
          >
            <Scan className="w-3.5 h-3.5 text-[#0047AB]" />
            <span className="hidden sm:inline">Fit View</span>
          </button>

          <div className="w-px h-3.5 bg-[#E5D7C5]" />

          {/* Zoom In */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStepZoom(0.15);
            }}
            className="p-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            title="Zoom In (or scroll wheel)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStepZoom(-0.15);
            }}
            className="p-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            title="Zoom Out (or scroll wheel)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-[#E5D7C5]" />

          {/* Reset Layout */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              computeInitialTreeLayout();
            }}
            className="p-1.5 rounded-lg hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title="Reset to default tree layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="w-px h-3.5 bg-[#E5D7C5]" />

          {/* Fullscreen Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen((prev) => !prev);
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold',
              isFullscreen
                ? 'bg-[#0047AB] text-white hover:bg-[#00388A]'
                : 'hover:bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A]'
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
          className="absolute top-16 left-3.5 z-25 max-w-sm p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5D7C5] shadow-[0_8px_24px_rgba(0,0,0,0.08)] space-y-2 pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#F0E6D8] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0047AB]" />
              <span className="text-xs font-bold text-[#1A1A1A] truncate">
                {blastInfo.selectedNode.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF3EA] text-[#6E6258] font-bold">
                {blastInfo.selectedNode.type}
              </span>
            </div>
            <button
              onClick={() => onSelectNode(null)}
              className="p-1 rounded-lg hover:bg-[#FAF3EA] text-[#8A7B6D] hover:text-[#1A1A1A] cursor-pointer"
              title="Close inspection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[9px] font-bold text-emerald-800 block">
                Upstream Deps
              </span>
              <span className="text-emerald-950 font-bold">
                {blastInfo.upstreamDeps.length} Services
              </span>
            </div>

            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[9px] font-bold text-rose-800 block">
                Blast Radius
              </span>
              <span className="text-rose-950 font-bold">
                {blastInfo.downstreamBlast.length} Impaired
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Canvas Scaled Area (Transformed Container) ── */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning || draggingNodeId ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* SVG Directed Bezier Curves connecting nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            {/* Standard directional arrow marker */}
            <marker
              id={`arrow-default-${instanceId}`}
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
              id={`arrow-upstream-${instanceId}`}
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
              id={`arrow-downstream-${instanceId}`}
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
              const nodeHalfHeight = 34;

              // Calculate start (source bottom) and end (target top)
              const startX = sourcePos.x;
              const startY = sourcePos.y + nodeHalfHeight;
              const endX = targetPos.x;
              const endY = targetPos.y - nodeHalfHeight;

              // Smooth cubic bezier curve control points with generous spacing
              const deltaY = Math.abs(endY - startY);
              const controlY1 = startY + Math.max(40, deltaY * 0.45);
              const controlY2 = endY - Math.max(40, deltaY * 0.45);

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
                'absolute z-15 w-[185px] p-3 rounded-2xl border transition-all duration-150 select-none cursor-grab active:cursor-grabbing',
                'shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]',
                isSelected
                  ? 'bg-white border-[#0047AB] ring-2 ring-[#0047AB] shadow-xl scale-105 z-20'
                  : isDownstream
                  ? 'bg-rose-50/95 border-rose-400 ring-2 ring-rose-400 text-rose-950 shadow-md'
                  : isUpstream
                  ? 'bg-emerald-50/95 border-emerald-400 ring-2 ring-emerald-400 text-emerald-950 shadow-md'
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
                    <span className="text-[9px] font-mono text-[#8A7B6D] block truncate">
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

      {/* ── Miro Canvas Footer Guidance Bar ── */}
      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#8A7B6D] pointer-events-none z-20 gap-2">
        <span className="bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E5D7C5]">
          💡 <strong>Pan:</strong> Click & drag background &bull; <strong>Zoom:</strong> Scroll or &plusmn; &bull; <strong>Reposition:</strong> Drag cards
        </span>
        <span className="bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E5D7C5]">
          {selectedNodeId ? 'Click background to deselect' : 'Click any node to isolate blast radius'}
        </span>
      </div>
    </div>
  );

  return content;
};

