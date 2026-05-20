import { useApi } from '@/hooks/useApi';
import KpiCard from '@/components/shared/KpiCard';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import { Shield, AlertTriangle, FileCode, Lock } from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, BarChart, Bar, Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  risk_exposure_score: number;
  res_trend: Array<{ day: number; score: number }>;
  total_scripts: number;
  overprivileged: number;
  critical_scopes: number;
  quadrant_data: Array<{
    name: string;
    scope_sprawl: number;
    intent_mismatch: number;
    status: 'danger' | 'warning' | 'safe';
  }>;
  risk_distribution: Array<{
    category: string;
    restricted: number;
    sensitive: number;
    non_sensitive: number;
  }>;
}

const statusColors = { danger: '#D32F2F', warning: '#FBC02D', safe: '#388E3C' };

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi<DashboardData>('/api/dashboard');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Security Posture Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your organization's OAuth security posture</p>
      </div>

      {/* RES Hero + Sparkline */}
      <div className="enterprise-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="kpi-label">Risk Exposure Score</span>
            {loading ? (
              <Skeleton className="h-12 w-32 mt-2 rounded-sm" />
            ) : (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold tabular-nums text-foreground">
                  {data?.risk_exposure_score ?? '—'}
                </span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            )}
          </div>
          <div className="w-48 h-16">
            {loading ? (
              <Skeleton className="w-full h-full rounded-sm" />
            ) : data?.res_trend?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.res_trend}>
                  <Line type="monotone" dataKey="score" stroke="#1A73E8" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No trend data</div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">30-day historical trend</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Scripts" value={data?.total_scripts} icon={FileCode} loading={loading} />
        <KpiCard label="Overprivileged" value={data?.overprivileged} icon={AlertTriangle} loading={loading} />
        <KpiCard label="Critical Scopes" value={data?.critical_scopes} icon={Lock} loading={loading} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Quadrant */}
        <div className="enterprise-card p-6">
          <h2 className="text-sm font-medium text-foreground mb-1">Posture Quadrant</h2>
          <p className="text-xs text-muted-foreground mb-4">X: Scope Sprawl · Y: Intent Mismatch</p>
          {loading ? (
            <ChartSkeleton height={320} />
          ) : !data?.quadrant_data?.length ? (
            <EmptyState title="No scan data" description="Run a repository scan to populate the quadrant." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis type="number" dataKey="scope_sprawl" name="Scope Sprawl" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                <YAxis type="number" dataKey="intent_mismatch" name="Intent Mismatch" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
                <Scatter data={data.quadrant_data}>
                  {data.quadrant_data.map((e, i) => <Cell key={i} fill={statusColors[e.status]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Risk Distribution Stacked Bar */}
        <div className="enterprise-card p-6">
          <h2 className="text-sm font-medium text-foreground mb-1">Risk Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">Script severity ratio across organization</p>
          {loading ? (
            <ChartSkeleton height={320} />
          ) : !data?.risk_distribution?.length ? (
            <EmptyState title="No distribution data" description="Scan repositories to see the risk distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.risk_distribution} layout="vertical" margin={{ top: 10, right: 10, bottom: 10, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} width={50} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="restricted" stackId="a" fill="#D32F2F" name="Restricted" />
                <Bar dataKey="sensitive" stackId="a" fill="#FBC02D" name="Sensitive" />
                <Bar dataKey="non_sensitive" stackId="a" fill="#388E3C" name="Non-Sensitive" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
