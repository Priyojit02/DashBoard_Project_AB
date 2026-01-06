// ============================================
// AVATAR COMPONENT
// ============================================

import { cn } from '@/lib/cn';

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
};

function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-red-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

export function Avatar({ src, alt, name = 'User', size = 'md', className }: AvatarProps) {
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);
    
    if (src) {
        return (
            <img
                src={src}
                alt={alt || name}
                className={cn(
                    'rounded-full object-cover',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }
    
    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center text-white font-semibold',
                sizeClasses[size],
                bgColor,
                className
            )}
            title={name}
        >
            {initials}
        </div>
    );
}
