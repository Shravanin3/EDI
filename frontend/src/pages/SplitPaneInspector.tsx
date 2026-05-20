import { useApi } from '@/hooks/useApi';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspectorData {
  developer_intent: string;
  source_code: string;
  manifest: string;
  manifest_diff?: Array<{ line: string; type: 'added' | 'removed' | 'neutral' }>;
  file_name: string;
}

export default function SplitPaneInspector() {
  const { data, loading, error, refetch } = useApi<InspectorData>('/api/scan/file/latest');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Code Inspector</h1>
          <p className="page-subtitle">Split-pane analysis of script source and manifest</p>
        </div>
        <Skeleton className="h-14 w-full rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-96 rounded-md" />
          <Skeleton className="h-96 rounded-md" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Code Inspector</h1>
          <p className="page-subtitle">Split-pane analysis of script source and manifest</p>
        </div>
        <div className="enterprise-card">
          <EmptyState icon={Code2} title="No file selected" description="Select a file from the Workspace Tree to inspect its code and permissions." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-header">Code Inspector</h1>
        <p className="page-subtitle">{data.file_name}</p>
      </div>

      {/* NLP Intent Card */}
      <div className="enterprise-card p-4 border-l-4 border-l-primary">
        <span className="text-[10px] font-medium text-primary uppercase tracking-wider">AI-Extracted Developer Intent</span>
        <p className="text-sm text-foreground mt-1">{data.developer_intent}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Source Code */}
        <div className="enterprise-card overflow-hidden">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Source Code — AST Execution Path</span>
          </div>
          <pre className="p-4 text-xs leading-relaxed text-foreground overflow-auto max-h-[500px] font-mono bg-secondary/20">
            {data.source_code}
          </pre>
        </div>

        {/* Manifest with Diff Overlay */}
        <div className="enterprise-card overflow-hidden">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">appsscript.json — Manifest Diff</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-sm bg-danger/20" /> Sprawl
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-sm bg-success/20" /> Retained
              </span>
            </div>
          </div>
          <div className="overflow-auto max-h-[500px]">
            {data.manifest_diff?.length ? (
              <div className="font-mono text-xs">
                {data.manifest_diff.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      'px-4 py-0.5 leading-relaxed',
                      line.type === 'removed' && 'bg-danger/8 text-danger',
                      line.type === 'added' && 'bg-success/8 text-success',
                      line.type === 'neutral' && 'text-foreground'
                    )}
                  >
                    <span className="inline-block w-4 text-muted-foreground mr-2 select-none">
                      {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
                    </span>
                    {line.line}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="p-4 text-xs leading-relaxed text-foreground font-mono bg-secondary/20">
                {data.manifest}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
