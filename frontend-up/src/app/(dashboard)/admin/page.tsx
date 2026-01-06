// ============================================
// ADMIN PANEL PAGE
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Input, Modal } from '@/components/ui';
import { getAdminPanelData, addAdmin, removeAdmin } from '@/lib/admin-service';
import { AdminPanelData, DBUser, AdminUser } from '@/types';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [adminData, setAdminData] = useState<AdminPanelData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
    
    // Check if user is admin
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        
        if (user && !user.isAdmin) {
            router.push('/dashboard');
            return;
        }
        
        fetchAdminData();
    }, [isAuthenticated, user, router]);
    
    const fetchAdminData = async () => {
        setIsLoading(true);
        try {
            const response = await getAdminPanelData();
            if (response.success && response.data) {
                setAdminData(response.data);
            }
        } catch (err) {
            setError('Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddAdmin = async () => {
        if (!newAdminEmail.trim() || !user?.email) return;
        
        setIsAddingAdmin(true);
        try {
            const response = await addAdmin(
                { email: newAdminEmail, name: '' },
                user.email
            );
            
            if (response.success) {
                await fetchAdminData();
                setShowAddAdminModal(false);
                setNewAdminEmail('');
            } else {
                setError(response.error || 'Failed to add admin');
            }
        } catch (err) {
            setError('Failed to add admin');
        } finally {
            setIsAddingAdmin(false);
        }
    };
    
    const handleRemoveAdmin = async (adminId: string) => {
        if (!user?.email) return;
        
        if (!confirm('Are you sure you want to remove this admin?')) return;
        
        try {
            const response = await removeAdmin(adminId, user.email);
            
            if (response.success) {
                await fetchAdminData();
            } else {
                setError(response.error || 'Failed to remove admin');
            }
        } catch (err) {
            setError('Failed to remove admin');
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="spinner" />
            </div>
        );
    }
    
    if (!user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don&apos;t have permission to access this page.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-500">Manage users and administrators</p>
                </div>
                <Button onClick={() => setShowAddAdminModal(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Admin
                </Button>
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-red-600">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-2xl font-bold text-gray-900">{adminData?.totalUsers || 0}</div>
                    <div className="text-sm text-gray-500">Total Users</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-green-600">{adminData?.activeUsers || 0}</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-[#D04A02]">{adminData?.admins.length || 0}</div>
                    <div className="text-sm text-gray-500">Administrators</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                        {(adminData?.totalUsers || 0) - (adminData?.admins.length || 0)}
                    </div>
                    <div className="text-sm text-gray-500">Regular Users</div>
                </Card>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'users'
                                ? 'border-[#D04A02] text-[#D04A02]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        All Users ({adminData?.users.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'admins'
                                ? 'border-[#D04A02] text-[#D04A02]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Administrators ({adminData?.admins.length || 0})
                    </button>
                </nav>
            </div>
            
            {/* Users Table */}
            {activeTab === 'users' && (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminData?.users.map((dbUser: DBUser) => (
                                    <tr key={dbUser.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {dbUser.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900">{dbUser.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{dbUser.email}</td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">
                                            {new Date(dbUser.lastLogin).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                dbUser.isActive 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {dbUser.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                dbUser.isAdmin 
                                                    ? 'bg-[#D04A02]/10 text-[#D04A02]' 
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {dbUser.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            
            {/* Admins Table */}
            {activeTab === 'admins' && (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Added By</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Added On</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminData?.admins.map((admin: AdminUser) => (
                                    <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#D04A02] flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {admin.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900">{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                                        <td className="py-3 px-4 text-gray-500">{admin.addedBy}</td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">
                                            {new Date(admin.addedAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {admin.email !== user?.email && (
                                                <button
                                                    onClick={() => handleRemoveAdmin(admin.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                            {admin.email === user?.email && (
                                                <span className="text-gray-400 text-sm">You</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            
            {/* Add Admin Modal */}
            <Modal
                isOpen={showAddAdminModal}
                onClose={() => setShowAddAdminModal(false)}
                title="Add New Administrator"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Enter the email address of the user you want to make an administrator. 
                        The user must have logged in at least once.
                    </p>
                    <Input
                        label="Email Address"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="user@pwc.com"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddAdminModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddAdmin}
                            isLoading={isAddingAdmin}
                            disabled={!newAdminEmail.trim()}
                        >
                            Add Admin
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
