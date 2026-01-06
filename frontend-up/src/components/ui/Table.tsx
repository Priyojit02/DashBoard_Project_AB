// ============================================
// TABLE COMPONENT
// ============================================

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className }: TableProps) {
    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full border-collapse">
                {children}
            </table>
        </div>
    );
}

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
    return (
        <thead className={cn('bg-gray-50', className)}>
            {children}
        </thead>
    );
}

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
    return (
        <tbody className={cn('divide-y divide-gray-200', className)}>
            {children}
        </tbody>
    );
}

interface TableRowProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    isClickable?: boolean;
}

export function TableRow({ children, className, onClick, isClickable }: TableRowProps) {
    return (
        <tr
            className={cn(
                'transition-colors',
                isClickable && 'cursor-pointer hover:bg-gray-50',
                className
            )}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

interface TableHeadProps {
    children: ReactNode;
    className?: string;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
    width?: string;
}

export function TableHead({ 
    children, 
    className, 
    sortable = false,
    sortDirection = null,
    onSort,
    width,
}: TableHeadProps) {
    return (
        <th
            className={cn(
                'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                'border-b-2 border-gray-200',
                sortable && 'cursor-pointer select-none hover:bg-gray-100',
                className
            )}
            style={{ width }}
            onClick={sortable ? onSort : undefined}
        >
            <div className="flex items-center gap-1">
                {children}
                {sortable && (
                    <span className="inline-flex flex-col text-gray-400">
                        <svg 
                            className={cn(
                                'w-3 h-3 -mb-1',
                                sortDirection === 'asc' && 'text-[#D04A02]'
                            )} 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                        >
                            <path d="M7 14l5-5 5 5z"/>
                        </svg>
                        <svg 
                            className={cn(
                                'w-3 h-3',
                                sortDirection === 'desc' && 'text-[#D04A02]'
                            )} 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                        >
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </span>
                )}
            </div>
        </th>
    );
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
    return (
        <td className={cn('px-4 py-3 text-sm text-gray-900', className)}>
            {children}
        </td>
    );
}
