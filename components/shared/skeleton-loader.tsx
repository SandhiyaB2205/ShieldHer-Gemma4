import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'default' | 'circular' | 'text' | 'card';
  count?: number;
}

export function SkeletonLoader({ 
  className, 
  variant = 'default',
  count = 1 
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-muted animate-pulse rounded-lg';
  
  const variantClasses = {
    default: 'h-4 w-full',
    circular: 'h-12 w-12 rounded-full',
    text: 'h-4 w-3/4',
    card: 'h-32 w-full',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(baseClasses, variantClasses[variant], className)}
    />
  ));

  return count === 1 ? items[0] : <div className="space-y-2">{items}</div>;
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circular" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-1/2" />
          <SkeletonLoader className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonLoader className="h-16 w-full" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
          <SkeletonLoader variant="circular" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-2/3" />
            <SkeletonLoader className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative h-64 rounded-xl overflow-hidden bg-muted animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    </div>
  );
}
