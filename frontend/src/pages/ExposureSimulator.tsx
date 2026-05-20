import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { FlaskConical, Loader2, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Script { id: string; name: string; }
interface BlastRow { target: string; type: string; risk: 'danger' | 'warning' | 'safe'; exposure: string; depth: number; }
interface SimResult { blast_radius_pct: number; rows: BlastRow[]; }

export default function ExposureSimulator() {
  const { data: scripts, loading: loadingScripts, error, refetch } = useApi<Script[]>('/api/scripts');
  const [selected, setSelected] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  const simulate = async () => {
    if (!selected) return;
    setSimulating(true);
    try {
      const res = await api.post<SimResult>('/api/graph/simulate', { script_id: selected });
      setResult(res.data);
    } catch { setResult(null); }
    finally { setSimulating(false); }
  };

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  const gaugeData = result ? [
    { name: 'Exposed', value: result.blast_radius_pct },
    { name: 'Safe', value: 100 - result.blast_radius_pct },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Exposure Simulator</h1>
        <p className="page-subtitle">Predict blast radius if a script token is compromised</p>
      </div>

      <div className="enterprise-card p-5 flex items-end gap-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Select Script</label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={loadingScripts ? 'Loading…' : 'Choose a script'} />
            </SelectTrigger>
            <SelectContent>
              {scripts?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={simulate} disabled={!selected || simulating} size="sm">
          {simulating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Simulate
        </Button>
      </div>

      {simulating && (
        <div className="grid grid-cols-3 gap-4">
          <ChartSkeleton height={250} />
          <div className="col-span-2"><TableSkeleton rows={5} columns={4} /></div>
        </div>
      )}

      {!simulating && !result && (
        <div className="enterprise-card">
          <EmptyState icon={FlaskConical} title="No simulation run" description="Select a script and run a simulation to view the predictive blast radius." />
        </div>
      )}

      {!simulating && result && (
        <div className="grid grid-cols-3 gap-4">
          {/* Gauge */}
          <div className="enterprise-card p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-foreground mb-2">Blast Radius</h3>
            <div className="relative w-48 h-28 overflow-hidden">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                    cy="100%"
                  >
                    <Cell fill="#D32F2F" />
                    <Cell fill="#E0E0E0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <span className="text-2xl font-bold text-foreground">{result.blast_radius_pct}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Corporate data exposure</p>
          </div>

          {/* BFS Tree */}
          <div className="col-span-2 enterprise-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Downstream Impact — BFS Traversal</h3>
            </div>
            {result.rows.length === 0 ? (
              <EmptyState icon={FlaskConical} title="No exposure" description="Minimal downstream exposure detected." />
            ) : (
              <div className="max-h-[350px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      <th className="data-table-header text-left px-4 py-3">Depth</th>
                      <th className="data-table-header text-left px-4 py-3">Target</th>
                      <th className="data-table-header text-left px-4 py-3">Type</th>
                      <th className="data-table-header text-left px-4 py-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: r.depth }).map((_, j) => (
                              <ChevronRight key={j} className="h-3 w-3 text-border" />
                            ))}
                            <span className="tabular-nums">{r.depth}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{r.target}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.type}</td>
                        <td className="px-4 py-3"><StatusBadge level={r.risk} label={r.risk} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
