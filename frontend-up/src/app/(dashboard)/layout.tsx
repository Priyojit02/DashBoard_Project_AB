// ============================================
// DASHBOARD LAYOUT (Protected Routes)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, loading, user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);
    
    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }
    
    // Don't render until we know auth state
    if (!isAuthenticated) {
        return null;
    }
    
    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar
                user={user ? {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    isAdmin: user.isAdmin,
                } : undefined}
                onLogout={handleLogout}
            />
            
            {/* Main Content Area */}
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                
                {/* Page Content */}
                <main className="flex-1 p-6 lg:ml-0">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-[#D04A02] text-white rounded-full shadow-lg"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    {children}
                </main>
            </div>
        </div>
    );
}
