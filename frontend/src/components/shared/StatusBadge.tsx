import { cn } from '@/lib/utils';

type StatusLevel = 'danger' | 'warning' | 'safe';

interface StatusBadgeProps {
  level: StatusLevel;
  label: string;
  className?: string;
}

const levelStyles: Record<StatusLevel, string> = {
  danger: 'bg-danger/10 text-danger border-danger/20',
  warning: 'bg-warning/10 text-warning-foreground border-warning/30',
  safe: 'bg-success/10 text-success border-success/20',
};

const StatusBadge = ({ level, label, className }: StatusBadgeProps) => (
  <span className={cn('inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium', levelStyles[level], className)}>
    {label}
  </span>
);

export default StatusBadge;
