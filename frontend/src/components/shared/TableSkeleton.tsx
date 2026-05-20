import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
  <div className="enterprise-card overflow-hidden">
    <div className="border-b border-border px-4 py-3 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1 rounded-sm" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="px-4 py-3 flex gap-4 border-b border-border last:border-0">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1 rounded-sm" />
        ))}
      </div>
    ))}
  </div>
);

export default TableSkeleton;
