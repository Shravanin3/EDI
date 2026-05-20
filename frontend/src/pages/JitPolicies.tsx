import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface JitPolicy {
  id: string;
  scope_level: string;
  max_idle_days: number;
  action: 'revoke' | 'alert';
}

interface GanttBar {
  token: string;
  start_day: number;
  end_day: number;
  scope_level: string;
}

interface JitData {
  policies: JitPolicy[];
  gantt: GanttBar[];
}

export default function JitPolicies() {
  const { data, loading, error, refetch } = useApi<JitData>('/api/policies/jit');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">JIT Policies</h1>
        <p className="page-subtitle">Configure Just-In-Time time-to-live rules and view token expiration timelines</p>
      </div>

      {/* Gantt Timeline */}
      <div className="enterprise-card p-6">
        <h2 className="text-sm font-medium text-foreground mb-1">Token Expiration Gantt</h2>
        <p className="text-xs text-muted-foreground mb-4">Active OAuth tokens with scheduled auto-revoke times</p>
        {loading ? (
          <ChartSkeleton height={250} />
        ) : !data?.gantt?.length ? (
          <EmptyState icon={Clock} title="No active tokens" description="Token expiration timelines will appear once JIT policies are enforced." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, data.gantt.length * 40)}>
            <BarChart data={data.gantt} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} label={{ value: 'Days', position: 'bottom', fontSize: 10, fill: '#5F6368' }} />
              <YAxis type="category" dataKey="token" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} width={90} />
              <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
              <Bar dataKey="end_day" fill="#1A73E8" radius={[0, 3, 3, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Policy Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : !data?.policies?.length ? (
        <div className="enterprise-card">
          <EmptyState icon={Clock} title="No policies configured" description="Create JIT policies to enforce time-bound scope access." />
        </div>
      ) : (
        <div className="enterprise-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Policy Rules</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header text-left px-4 py-3">Scope Level</th>
                <th className="data-table-header text-left px-4 py-3">Max Idle Days</th>
                <th className="data-table-header text-left px-4 py-3">Action</th>
                <th className="data-table-header text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.policies.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{p.scope_level}</td>
                  <td className="px-4 py-3 tabular-nums">{p.max_idle_days}</td>
                  <td className="px-4 py-3">
                    <StatusBadge level={p.action === 'revoke' ? 'danger' : 'warning'} label={p.action.toUpperCase()} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
