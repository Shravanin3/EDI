import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

const EmptyState = ({ icon: Icon = Inbox, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="rounded-full bg-secondary p-4 mb-4">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
  </div>
);

export default EmptyState;
