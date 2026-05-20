import { useApi } from '@/hooks/useApi';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface FrictionData {
  merged: number;
  rejected: number;
  ttr_weekly: Array<{ week: string; fast: number; medium: number; slow: number }>;
}

export default function FrictionAnalytics() {
  const { data, loading, error, refetch } = useApi<FrictionData>('/api/webhooks/github/stats');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  const total = (data?.merged ?? 0) + (data?.rejected ?? 0);
  const rate = total > 0 ? Math.round(((data?.merged ?? 0) / total) * 100) : 0;
  const donutData = data ? [
    { name: 'Merged', value: data.merged },
    { name: 'Rejected', value: data.rejected },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Friction Analytics</h1>
        <p className="page-subtitle">Remediation acceptance rate and developer response velocity</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Donut */}
        <div className="enterprise-card p-6">
          <h2 className="text-sm font-medium text-foreground mb-4">Acceptance Rate</h2>
          {loading ? (
            <ChartSkeleton height={280} />
          ) : total === 0 ? (
            <EmptyState icon={PieIcon} title="No friction data" description="PR merge/reject events will appear once GitHub webhooks are active." />
          ) : (
            <div className="flex items-center justify-center">
              <div className="relative" style={{ width: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" stroke="none">
                      <Cell fill="#388E3C" />
                      <Cell fill="#D32F2F" />
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{rate}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Acceptance</span>
                </div>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#388E3C' }} />
                  <span className="text-sm text-foreground">Merged ({data?.merged})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#D32F2F' }} />
                  <span className="text-sm text-foreground">Rejected ({data?.rejected})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TTR Chart */}
        <div className="enterprise-card p-6">
          <h2 className="text-sm font-medium text-foreground mb-1">Time-to-Remediate (TTR)</h2>
          <p className="text-xs text-muted-foreground mb-4">Developer response velocity over 8 weeks</p>
          {loading ? (
            <ChartSkeleton height={280} />
          ) : !data?.ttr_weekly?.length ? (
            <EmptyState icon={PieIcon} title="No TTR data" description="Weekly remediation velocity will appear as PRs are processed." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.ttr_weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="fast" stackId="a" fill="#388E3C" name="< 1 day" />
                <Bar dataKey="medium" stackId="a" fill="#FBC02D" name="1-3 days" />
                <Bar dataKey="slow" stackId="a" fill="#D32F2F" name="> 3 days" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
