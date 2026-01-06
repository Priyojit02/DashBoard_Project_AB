// ============================================
// SIDEBAR COMPONENT
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface SidebarItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const menuItems: SidebarItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: '/tickets',
        label: 'All Tickets',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        href: '/analytics',
        label: 'Analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        href: '/reports',
        label: 'Reports',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
];

const quickFilters: SidebarItem[] = [
    {
        href: '/tickets?status=open',
        label: 'Open Tickets',
        icon: (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
        ),
    },
    {
        href: '/tickets?status=in-progress',
        label: 'In Progress',
        icon: (
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
        ),
    },
    {
        href: '/tickets?filter=overdue',
        label: 'Overdue',
        icon: (
            <span className="w-2 h-2 rounded-full bg-red-500" />
        ),
        badge: 5,
    },
    {
        href: '/tickets?filter=my-tickets',
        label: 'My Tickets',
        icon: (
            <span className="w-2 h-2 rounded-full bg-purple-500" />
        ),
    },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname();
    
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)]',
                    'w-64 bg-white border-r border-gray-200',
                    'transition-transform duration-200 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Main Menu */}
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Main Menu
                        </h3>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        pathname === item.href
                                            ? 'bg-[#D04A02]/10 text-[#D04A02]'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                    onClick={onClose}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    {/* Quick Filters */}
                    <div className="p-4 border-t border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Quick Filters
                        </h3>
                        <nav className="space-y-1">
                            {quickFilters.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                                    onClick={onClose}
                                >
                                    <span className="flex items-center gap-3">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    {/* SAP Modules */}
                    <div className="p-4 border-t border-gray-100 flex-1 overflow-y-auto">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            SAP Modules
                        </h3>
                        <nav className="space-y-1">
                            {['MM', 'PP', 'FICO', 'SD', 'HCM', 'WM', 'QM', 'PM'].map((module) => (
                                <Link
                                    key={module}
                                    href={`/tickets?module=${module}`}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                                    onClick={onClose}
                                >
                                    <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                                        {module}
                                    </span>
                                    {module === 'MM' && 'Materials Management'}
                                    {module === 'PP' && 'Production Planning'}
                                    {module === 'FICO' && 'Finance & Controlling'}
                                    {module === 'SD' && 'Sales & Distribution'}
                                    {module === 'HCM' && 'Human Capital'}
                                    {module === 'WM' && 'Warehouse Management'}
                                    {module === 'QM' && 'Quality Management'}
                                    {module === 'PM' && 'Plant Maintenance'}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    );
}
