import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import StatusDot from '@/components/shared/StatusDot';
import { FolderTree, FileCode, AlertTriangle, Shield, LockOpen, ChevronRight, Folder } from 'lucide-react';
import { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  severity?: 'danger' | 'warning' | 'safe';
  privilege_status?: 'underprivileged' | 'perfect' | 'overprivileged';
  permission_weight?: number;
  children?: FileNode[];
}

interface TreeData {
  tree: FileNode[];
  treemap: Array<{ name: string; size: number; fill: string }>;
}

const privilegeIcons = {
  underprivileged: AlertTriangle,
  perfect: Shield,
  overprivileged: LockOpen,
};

function TreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [open, setOpen] = useState(node.type === 'directory');
  const Icon = node.type === 'directory' ? Folder : FileCode;
  const PrivIcon = node.privilege_status ? privilegeIcons[node.privilege_status] : null;

  return (
    <div>
      <button
        onClick={() => node.type === 'directory' && setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-secondary/50 transition-colors"
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {node.type === 'directory' && (
          <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        )}
        {node.type === 'file' && <span className="w-3" />}
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-foreground">{node.name}</span>
        {node.severity && <StatusDot level={node.severity} />}
        {PrivIcon && <PrivIcon className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
      </button>
      {open && node.children?.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

const TREEMAP_COLORS = ['#D32F2F', '#FBC02D', '#388E3C', '#1A73E8', '#F57C00', '#7B1FA2'];

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, index } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={TREEMAP_COLORS[index % TREEMAP_COLORS.length]} fillOpacity={0.85} stroke="#fff" strokeWidth={2} rx={2} />
      {width > 50 && height > 30 && (
        <text x={x + 6} y={y + 16} fill="#fff" fontSize={10} fontWeight={500}>{name}</text>
      )}
    </g>
  );
};

export default function WorkspaceTree() {
  const { data, loading, error, refetch } = useApi<TreeData>('/api/scan/latest/tree');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Workspace File Tree</h1>
        <p className="page-subtitle">Scanned directory structure with per-file severity and permission weight treemap</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* File Tree */}
        <div className="enterprise-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Directory</h2>
          </div>
          {loading ? (
            <TableSkeleton rows={8} columns={2} />
          ) : !data?.tree?.length ? (
            <EmptyState icon={FolderTree} title="No workspace data" description="Upload a repository to view the file tree." />
          ) : (
            <div className="py-2 max-h-[500px] overflow-y-auto">
              {data.tree.map((node) => <TreeNode key={node.id} node={node} />)}
            </div>
          )}
        </div>

        {/* Treemap */}
        <div className="enterprise-card p-6">
          <h2 className="text-sm font-medium text-foreground mb-1">Permission Weight Treemap</h2>
          <p className="text-xs text-muted-foreground mb-4">Box size represents relative scope consumption</p>
          {loading ? (
            <ChartSkeleton height={400} />
          ) : !data?.treemap?.length ? (
            <EmptyState title="No treemap data" description="Scan a repository to visualize permission weight." />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={data.treemap}
                dataKey="size"
                aspectRatio={4 / 3}
                content={<CustomTreemapContent />}
              >
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
              </Treemap>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
