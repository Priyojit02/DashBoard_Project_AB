// ============================================
// STATUS BADGE COMPONENT
// ============================================

import { cn } from '@/lib/cn';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const statusColors: Record<string, string> = {
    'Open': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'On Hold': 'bg-gray-100 text-gray-800 border-gray-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full border',
                colorClass,
                sizeClasses[size],
                className
            )}
        >
            {status}
        </span>
    );
}
