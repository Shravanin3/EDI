import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import { GitPullRequest, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DiffLine {
  line: string;
  type: 'added' | 'removed' | 'neutral';
}

interface PullRequest {
  id: string;
  repository: string;
  file: string;
  proposed_fix: string;
  status: 'pending' | 'merged' | 'rejected';
  diff?: DiffLine[];
}

export default function PullRequests() {
  const { data, loading, error, refetch } = useApi<PullRequest[]>('/api/pr/list');
  const [merging, setMerging] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const mergePR = async (id: string) => {
    setMerging(id);
    try {
      await api.post('/api/pr/generate', { pr_id: id, action: 'merge' });
      toast({ title: 'PR merged', description: 'The least-privilege fix has been applied.' });
      refetch();
    } catch {
      toast({ title: 'Merge failed', variant: 'destructive' });
    } finally {
      setMerging(null);
    }
  };

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Pull Request Manager</h1>
        <p className="page-subtitle">AI-generated least-privilege remediation queue — click a row to inspect the diff</p>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : !data?.length ? (
        <div className="enterprise-card">
          <EmptyState icon={GitPullRequest} title="No pending fixes" description="All repositories are in compliance." />
        </div>
      ) : (
        <div className="enterprise-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header text-left px-4 py-3 w-8"></th>
                <th className="data-table-header text-left px-4 py-3">Repository</th>
                <th className="data-table-header text-left px-4 py-3">File</th>
                <th className="data-table-header text-left px-4 py-3">Summary</th>
                <th className="data-table-header text-left px-4 py-3">Status</th>
                <th className="data-table-header text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((pr) => (
                <>
                  <tr
                    key={pr.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === pr.id ? null : pr.id)}
                  >
                    <td className="px-4 py-3">
                      {expanded === pr.id ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{pr.repository}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{pr.file}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{pr.proposed_fix}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{pr.status}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {pr.status === 'pending' && (
                        <Button size="sm" onClick={() => mergePR(pr.id)} disabled={merging === pr.id}>
                          {merging === pr.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Merge PR'}
                        </Button>
                      )}
                    </td>
                  </tr>
                  {expanded === pr.id && pr.diff && (
                    <tr key={`${pr.id}-diff`}>
                      <td colSpan={6} className="p-0">
                        <div className="bg-secondary/30 border-y border-border">
                          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Inline Diff</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-sm bg-danger/20" /> Removed</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-sm bg-success/20" /> Added</span>
                          </div>
                          <div className="font-mono text-xs max-h-60 overflow-y-auto">
                            {pr.diff.map((line, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'px-6 py-0.5 leading-relaxed',
                                  line.type === 'removed' && 'bg-danger/8 text-danger',
                                  line.type === 'added' && 'bg-success/8 text-success',
                                  line.type === 'neutral' && 'text-foreground',
                                )}
                              >
                                <span className="inline-block w-4 text-muted-foreground mr-2 select-none">
                                  {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
                                </span>
                                {line.line}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
