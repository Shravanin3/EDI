import { type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  label: string;
  value?: string | number;
  icon: LucideIcon;
  loading?: boolean;
}

const KpiCard = ({ label, value, icon: Icon, loading }: KpiCardProps) => (
  <div className="enterprise-card p-5">
    <div className="flex items-start justify-between mb-3">
      <span className="kpi-label">{label}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    {loading ? (
      <Skeleton className="h-8 w-24 rounded-sm" />
    ) : (
      <span className="kpi-value">{value ?? '—'}</span>
    )}
  </div>
);

export default KpiCard;
