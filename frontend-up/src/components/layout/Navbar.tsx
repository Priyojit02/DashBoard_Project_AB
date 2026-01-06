// ============================================
// NAVBAR COMPONENT
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui';

interface NavbarProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
        isAdmin?: boolean;
    };
    onLogout?: () => void;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/tickets', label: 'Tickets', icon: 'ticket' },
    { href: '/analytics', label: 'Analytics', icon: 'chart' },
    { href: '/reports', label: 'Reports', icon: 'document' },
];

export function Navbar({ user, onLogout }: NavbarProps) {
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    return (
        <nav className="bg-[#2D2D2D] text-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 relative">
                            <Image
                                src="/pwcicon.png"
                                alt="PwC Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-xl hidden sm:block">Ticket System</span>
                    </Link>
                    
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                    pathname === item.href || pathname.startsWith(item.href + '/')
                                        ? 'bg-[#D04A02] text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Profile Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-700 transition-colors"
                        >
                            <Avatar
                                name={user?.name || 'User'}
                                src={user?.avatar}
                                size="sm"
                            />
                            <span className="hidden sm:block text-sm font-medium">
                                {user?.name || 'User'}
                            </span>
                            {user?.isAdmin && (
                                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#D04A02] text-white rounded">
                                    Admin
                                </span>
                            )}
                            <svg
                                className={cn(
                                    'w-4 h-4 transition-transform',
                                    showProfileMenu && 'rotate-180'
                                )}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {/* Dropdown */}
                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user?.email || 'user@example.com'}
                                        </p>
                                        {user?.isAdmin && (
                                            <span className="inline-flex items-center mt-1 px-2 py-0.5 text-xs font-medium bg-[#D04A02]/10 text-[#D04A02] rounded">
                                                Administrator
                                            </span>
                                        )}
                                    </div>
                                    
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                    </Link>
                                    
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    
                                    {/* Admin Link - Only shown if user is admin */}
                                    {user?.isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#D04A02] hover:bg-[#D04A02]/10"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Admin Panel
                                        </Link>
                                    )}
                                    
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                onLogout?.();
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                                pathname === item.href || pathname.startsWith(item.href + '/')
                                    ? 'bg-[#D04A02] text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
