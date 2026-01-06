// ============================================
// PROFILE PAGE
// ============================================

'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from '@/components/ui';

export default function ProfilePage() {
    const { user } = useAuth();
    
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-500">View your account information</p>
            </div>
            
            {/* Profile Card */}
            <Card className="p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-[#D04A02] flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl font-bold text-white">
                            {user?.name?.charAt(0) || 'U'}
                        </span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                        <p className="text-gray-500">{user?.email || 'user@pwc.com'}</p>
                        {user?.isAdmin && (
                            <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium bg-[#D04A02]/10 text-[#D04A02]">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Administrator
                            </span>
                        )}
                    </div>
                </div>
            </Card>
            
            {/* Account Details */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900">{user?.email || 'user@pwc.com'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium text-gray-900">{user?.role || 'User'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Account Status</p>
                        <p className="font-medium text-green-600">Active</p>
                    </div>
                </div>
            </Card>
            
            {/* Activity Summary */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">12</p>
                        <p className="text-sm text-gray-500">Assigned Tickets</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">8</p>
                        <p className="text-sm text-gray-500">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">3</p>
                        <p className="text-sm text-gray-500">In Progress</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">1</p>
                        <p className="text-sm text-gray-500">Overdue</p>
                    </div>
                </div>
            </Card>
            
            {/* Authentication */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                        <svg className="w-6 h-6" viewBox="0 0 21 21" fill="none">
                            <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                            <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                            <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                            <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">Microsoft Account</p>
                        <p className="text-sm text-gray-500">Authenticated via Microsoft SSO</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        Connected
                    </span>
                </div>
            </Card>
        </div>
    );
}
