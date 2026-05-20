import { Skeleton } from '@/components/ui/skeleton';

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="enterprise-card p-6" style={{ height }}>
    <Skeleton className="h-4 w-40 mb-6 rounded-sm" />
    <div className="flex items-end gap-3 h-[calc(100%-3rem)]">
      {[60, 80, 45, 90, 55, 70, 40, 85].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

export default ChartSkeleton;
