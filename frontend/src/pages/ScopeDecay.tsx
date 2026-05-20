import { useApi } from '@/hooks/useApi';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import { TrendingDown } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DecayPoint { day: number; [scope: string]: number; }
interface DecayData { points: DecayPoint[]; scopes: string[]; }

const COLORS = ['#1A73E8', '#D32F2F', '#FBC02D', '#388E3C', '#7B1FA2', '#F57C00'];

export default function ScopeDecay() {
  const { data, loading, error, refetch } = useApi<DecayData>('/api/analytics/decay');

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Scope Decay Analytics</h1>
        <p className="page-subtitle">Exponential decay curves — shaded area represents unnecessary risk window</p>
      </div>

      {loading ? (
        <ChartSkeleton height={450} />
      ) : !data?.points?.length ? (
        <div className="enterprise-card">
          <EmptyState icon={TrendingDown} title="No decay data" description="Historical scope usage data required to render decay analytics." />
        </div>
      ) : (
        <div className="enterprise-card p-6">
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={data.points} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <defs>
                {data.scopes.map((scope, i) => (
                  <linearGradient key={scope} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="day" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }}
                label={{ value: 'Days', position: 'bottom', fontSize: 10, fill: '#5F6368' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }}
                label={{ value: 'Usage Probability', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#5F6368' }}
              />
              <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {data.scopes.map((scope, i) => (
                <Area
                  key={scope}
                  type="monotone"
                  dataKey={scope}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  fill={`url(#grad-${i})`}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
