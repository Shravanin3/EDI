import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorBoundaryFallback = ({ message = 'Unable to connect to the security backend.', onRetry }: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="rounded-full bg-danger/10 p-4 mb-4">
      <AlertTriangle className="h-6 w-6 text-danger" />
    </div>
    <h3 className="text-sm font-medium text-foreground mb-1">Connection Error</h3>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

export default ErrorBoundaryFallback;
