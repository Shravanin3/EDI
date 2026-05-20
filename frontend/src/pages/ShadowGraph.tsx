import { useRef, useCallback, useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import { Network } from 'lucide-react';

interface GraphNode {
  id: string;
  type: 'user' | 'script' | 'file';
  label: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const nodeColors: Record<string, string> = { user: '#1A73E8', script: '#D32F2F', file: '#388E3C' };

export default function ShadowGraph() {
  const { data, loading, error, refetch } = useApi<GraphData>('/api/graph/topology');
  const containerRef = useRef<HTMLDivElement>(null);
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    import('react-force-graph-2d').then((mod) => setForceGraph(() => mod.default));
  }, []);

  const graphData = data ? {
    nodes: data.nodes.map((n) => ({ ...n, color: nodeColors[n.type] || '#5F6368' })),
    links: data.edges.map((e) => ({ source: e.source, target: e.target })),
  } : { nodes: [], links: [] };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  }, [selectedNode]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode === node.id;
    const isNeighbor = selectedNode && graphData.links.some(
      (l: any) => (l.source?.id === selectedNode && l.target?.id === node.id) || (l.target?.id === selectedNode && l.source?.id === node.id)
    );
    const dimmed = selectedNode && !isSelected && !isNeighbor;

    const r = 6;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = dimmed ? '#E0E0E0' : (node.color || '#5F6368');
    ctx.fill();

    if (isSelected) {
      ctx.strokeStyle = '#202124';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const fontSize = 10 / globalScale;
    if (globalScale > 0.6) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = dimmed ? '#BDBDBD' : '#5F6368';
      ctx.textAlign = 'center';
      ctx.fillText(node.label || node.id, node.x, node.y + r + fontSize + 2);
    }
  }, [selectedNode, graphData.links]);

  const linkColor = useCallback((link: any) => {
    if (!selectedNode) return '#E0E0E0';
    const s = link.source?.id || link.source;
    const t = link.target?.id || link.target;
    return (s === selectedNode || t === selectedNode) ? '#202124' : '#F5F5F5';
  }, [selectedNode]);

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Shadow Automation Graph</h1>
        <p className="page-subtitle">Interactive network topology — click a node to highlight its connections</p>
      </div>

      <div className="enterprise-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex gap-4">
            {(['user', 'script', 'file'] as const).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColors[type] }} />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
          {selectedNode && (
            <button onClick={() => setSelectedNode(null)} className="text-xs text-primary hover:underline">
              Clear selection
            </button>
          )}
        </div>

        {loading || !ForceGraph ? (
          <ChartSkeleton height={500} />
        ) : !data?.nodes?.length ? (
          <EmptyState icon={Network} title="No graph data available" description="Run a scan to generate the shadow automation topology." />
        ) : (
          <div ref={containerRef} className="w-full" style={{ height: 500 }}>
            <ForceGraph
              graphData={graphData}
              width={containerRef.current?.clientWidth || 800}
              height={500}
              nodeCanvasObject={nodeCanvasObject}
              onNodeClick={handleNodeClick}
              linkColor={linkColor}
              linkWidth={1}
              backgroundColor="#FAFAFA"
              cooldownTicks={100}
              nodeRelSize={6}
            />
          </div>
        )}
      </div>
    </div>
  );
}
