// ============================================
// STATS CARD COMPONENT
// ============================================

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
    onClick?: () => void;
}

const colorClasses = {
    default: 'border-l-gray-400',
    primary: 'border-l-[#D04A02]',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    danger: 'border-l-red-500',
    info: 'border-l-blue-500',
};

const iconColorClasses = {
    default: 'text-gray-400 bg-gray-100',
    primary: 'text-[#D04A02] bg-orange-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
};

export function StatsCard({
    title,
    value,
    icon,
    trend,
    color = 'default',
    className,
    onClick,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
                'border-l-4',
                colorClasses[color],
                onClick && 'cursor-pointer hover:shadow-md transition-shadow',
                className
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                    {trend && (
                        <p className={cn(
                            'mt-1 text-sm font-medium flex items-center gap-1',
                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-gray-500 font-normal">vs last period</span>
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={cn(
                        'p-3 rounded-lg',
                        iconColorClasses[color]
                    )}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
