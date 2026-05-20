import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Anomaly {
  id: string;
  timestamp: string;
  script_name: string;
  anomaly_score: number;
}

interface HeatmapDay {
  date: string;
  count: number;
}

interface AnomalyData {
  feed: Anomaly[];
  heatmap: HeatmapDay[];
}

function HeatmapCalendar({ data }: { data: HeatmapDay[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="enterprise-card p-5">
      <h2 className="text-sm font-medium text-foreground mb-1">Anomaly Frequency</h2>
      <p className="text-xs text-muted-foreground mb-3">Last 30 days — darker cells indicate higher frequency</p>
      <div className="flex flex-wrap gap-1">
        {data.map((day) => {
          const intensity = day.count / maxCount;
          const bg = day.count === 0
            ? '#F3F4F6'
            : intensity > 0.75
            ? '#D32F2F'
            : intensity > 0.5
            ? '#E57373'
            : intensity > 0.25
            ? '#EF9A9A'
            : '#FFCDD2';
          return (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} anomalies`}
              className="w-5 h-5 rounded-sm border border-border"
              style={{ backgroundColor: bg }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {['#F3F4F6', '#FFCDD2', '#EF9A9A', '#E57373', '#D32F2F'].map((c) => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

export default function Anomalies() {
  const { data, loading, error, refetch } = useApi<AnomalyData>('/api/anomalies');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Recent Anomalies</h1>
        <p className="page-subtitle">IsolationForest ML model detections and frequency heatmap</p>
      </div>

      {/* Heatmap */}
      {loading ? (
        <div className="enterprise-card p-5">
          <Skeleton className="h-4 w-40 mb-3 rounded-sm" />
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="w-5 h-5 rounded-sm" />
            ))}
          </div>
        </div>
      ) : data?.heatmap?.length ? (
        <HeatmapCalendar data={data.heatmap} />
      ) : (
        <div className="enterprise-card">
          <EmptyState icon={Activity} title="No heatmap data" description="Anomaly frequency will appear once detections begin." />
        </div>
      )}

      {/* Live Feed */}
      <div className="enterprise-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Live Threat Feed</h2>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Auto-refreshing</span>
        </div>
        {loading ? (
          <TableSkeleton rows={6} columns={4} />
        ) : !data?.feed?.length ? (
          <EmptyState
            icon={Activity}
            title="No recent anomalies detected"
            description="System baseline stable. The ML model has not flagged any unusual permission patterns."
          />
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="data-table-header text-left px-4 py-3">Timestamp</th>
                  <th className="data-table-header text-left px-4 py-3">Script</th>
                  <th className="data-table-header text-left px-4 py-3">Anomaly Score</th>
                  <th className="data-table-header text-left px-4 py-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {data.feed.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs">{a.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{a.script_name}</td>
                    <td className="px-4 py-3 tabular-nums">{a.anomaly_score.toFixed(3)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        level={a.anomaly_score > 0.8 ? 'danger' : a.anomaly_score > 0.5 ? 'warning' : 'safe'}
                        label={a.anomaly_score > 0.8 ? 'Critical' : a.anomaly_score > 0.5 ? 'Warning' : 'Normal'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
