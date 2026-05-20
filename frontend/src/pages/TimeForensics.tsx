import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import ErrorBoundaryFallback from '@/components/shared/ErrorBoundaryFallback';
import EmptyState from '@/components/shared/EmptyState';
import ChartSkeleton from '@/components/shared/ChartSkeleton';
import TableSkeleton from '@/components/shared/TableSkeleton';
import { CalendarSearch, Rewind, Play, FastForward } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface ForensicsSnapshot {
  date: string;
  total_scopes: number;
  restricted: number;
  sensitive: number;
  non_sensitive: number;
  quadrant_data?: Array<{ name: string; scope_sprawl: number; intent_mismatch: number; status: 'danger' | 'warning' | 'safe' }>;
  tree_summary?: Array<{ name: string; severity: 'danger' | 'warning' | 'safe' }>;
}

const statusColors = { danger: '#D32F2F', warning: '#FBC02D', safe: '#388E3C' };

export default function TimeForensics() {
  const [date, setDate] = useState<Date>();
  const { data, loading, error, refetch } = useApi<ForensicsSnapshot>(
    date ? `/api/audit/forensics?date=${format(date, 'yyyy-MM-dd')}` : '/api/audit/forensics'
  );

  const shiftDay = (delta: number) => {
    const base = date || new Date();
    const next = new Date(base);
    next.setDate(next.getDate() + delta);
    if (next <= new Date()) setDate(next);
  };

  if (error) return <ErrorBoundaryFallback message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Time Forensics</h1>
        <p className="page-subtitle">Rewind the security posture to any historical date</p>
      </div>

      {/* Time Machine Controls */}
      <div className="enterprise-card p-5 flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn('w-56 justify-start text-left font-normal text-sm', !date && 'text-muted-foreground')}>
              <CalendarSearch className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d > new Date()} initialFocus className={cn('p-3 pointer-events-auto')} />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1 border border-border rounded-md">
          <button onClick={() => shiftDay(-1)} className="p-2 hover:bg-secondary transition-colors rounded-l-md" title="Previous day">
            <Rewind className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => setDate(new Date())} className="p-2 hover:bg-secondary transition-colors" title="Today">
            <Play className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => shiftDay(1)} className="p-2 hover:bg-secondary transition-colors rounded-r-md" title="Next day">
            <FastForward className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {date && <span className="text-xs text-muted-foreground">Viewing snapshot: {format(date, 'yyyy-MM-dd')}</span>}
      </div>

      {/* KPI Row */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="enterprise-card p-5">
              <Skeleton className="h-3 w-20 mb-3 rounded-sm" />
              <Skeleton className="h-8 w-16 rounded-sm" />
            </div>
          ))}
        </div>
      ) : !data ? (
        <div className="enterprise-card">
          <EmptyState icon={CalendarSearch} title="No forensic data" description="Select a date to view the historical permission snapshot." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="enterprise-card p-5">
              <span className="kpi-label">Total Scopes</span>
              <p className="kpi-value text-xl mt-2">{data.total_scopes}</p>
            </div>
            <div className="enterprise-card p-5">
              <span className="kpi-label">Restricted</span>
              <p className="kpi-value text-xl mt-2 text-danger">{data.restricted}</p>
            </div>
            <div className="enterprise-card p-5">
              <span className="kpi-label">Sensitive</span>
              <p className="kpi-value text-xl mt-2 text-warning">{data.sensitive}</p>
            </div>
            <div className="enterprise-card p-5">
              <span className="kpi-label">Non-Sensitive</span>
              <p className="kpi-value text-xl mt-2 text-success">{data.non_sensitive}</p>
            </div>
          </div>

          {/* Reconstructed Quadrant */}
          <div className="grid grid-cols-2 gap-4">
            <div className="enterprise-card p-6">
              <h2 className="text-sm font-medium text-foreground mb-1">Reconstructed Posture Quadrant</h2>
              <p className="text-xs text-muted-foreground mb-4">Permissions as they existed on {data.date}</p>
              {!data.quadrant_data?.length ? (
                <EmptyState title="No quadrant data" description="Quadrant reconstruction not available for this date." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis type="number" dataKey="scope_sprawl" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                    <YAxis type="number" dataKey="intent_mismatch" tick={{ fontSize: 10, fill: '#5F6368' }} axisLine={{ stroke: '#E0E0E0' }} />
                    <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: 'none' }} />
                    <Scatter data={data.quadrant_data}>
                      {data.quadrant_data.map((e, i) => <Cell key={i} fill={statusColors[e.status]} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="enterprise-card p-6">
              <h2 className="text-sm font-medium text-foreground mb-1">Reconstructed File Summary</h2>
              <p className="text-xs text-muted-foreground mb-4">Files and their severity on {data.date}</p>
              {!data.tree_summary?.length ? (
                <EmptyState title="No file data" description="File state reconstruction not available for this date." />
              ) : (
                <div className="max-h-[280px] overflow-y-auto space-y-1">
                  {data.tree_summary.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary/50 rounded-sm">
                      <span className="status-dot" style={{ backgroundColor: statusColors[f.severity] }} />
                      <span className="text-foreground">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
