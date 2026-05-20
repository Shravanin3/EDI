import { cn } from '@/lib/utils';

type DotLevel = 'danger' | 'warning' | 'safe';

const dotColors: Record<DotLevel, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  safe: 'bg-success',
};

const StatusDot = ({ level, className }: { level: DotLevel; className?: string }) => (
  <span className={cn('status-dot', dotColors[level], className)} />
);

export default StatusDot;
