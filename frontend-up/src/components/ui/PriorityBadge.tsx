// ============================================
// PRIORITY BADGE COMPONENT
// ============================================

import { cn } from '@/lib/cn';

interface PriorityBadgeProps {
    priority: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const priorityColors: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-800 border-red-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low': 'bg-green-100 text-green-800 border-green-200',
};

const priorityDots: Record<string, string> = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500',
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
};

export function PriorityBadge({ priority, size = 'md', className }: PriorityBadgeProps) {
    const colorClass = priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    const dotColor = priorityDots[priority] || 'bg-gray-500';
    
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full border',
                colorClass,
                sizeClasses[size],
                className
            )}
        >
            <span className={cn('rounded-full', dotColor, dotSizes[size])} />
            {priority}
        </span>
    );
}
