import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import { BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

interface LedgerEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  hash: string;
}

interface VolumeBar {
  date: string;
  count: number;
}

interface LedgerData {
  entries: LedgerEntry[];
  volume: VolumeBar[];
}

export default function ScopeLedger() {
  const { data, loading, error, refetch } = useApi<LedgerData>('/api/audit/ledger');
  const [filterDate, setFilterDate] = useState<string | null>(null);

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  const filteredEntries = filterDate
    ? data?.entries?.filter((e) => e.timestamp.startsWith(filterDate)) ?? []
    : data?.entries ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Scope Ledger</h1>
        <p className="page-subtitle">Immutable security audit log — click a bar to filter by day</p>
      </div>

      {/* Volume Scrubber */}
      <div className="enterprise-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Volume by Day</span>
          {filterDate && (
            <button onClick={() => setFilterDate(null)} className="text-xs text-primary hover:underline">Clear filter</button>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-16 w-full rounded-sm" />
        ) : !data?.volume?.length ? (
          <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">No volume data</div>
        ) : (
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={data.volume} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" hide />
              <Tooltip contentStyle={{ fontSize: 10, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
              <Bar
                dataKey="count"
                fill="#1A73E8"
                radius={[2, 2, 0, 0]}
                cursor="pointer"
                onClick={(d: any) => setFilterDate(d.date === filterDate ? null : d.date)}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Ledger Table */}
      {loading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : !filteredEntries.length ? (
        <div className="enterprise-card">
          <EmptyState icon={BookOpen} title="No audit entries" description={filterDate ? `No events on ${filterDate}.` : 'Security events will be recorded here as they occur.'} />
        </div>
      ) : (
        <div className="enterprise-card overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="data-table-header text-left px-4 py-3">Timestamp</th>
                  <th className="data-table-header text-left px-4 py-3">Actor</th>
                  <th className="data-table-header text-left px-4 py-3">Action</th>
                  <th className="data-table-header text-left px-4 py-3">Target</th>
                  <th className="data-table-header text-left px-4 py-3">SHA-256</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs">{e.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{e.actor}</td>
                    <td className="px-4 py-3 text-foreground">{e.action}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{e.target}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs truncate max-w-[180px]">{e.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
