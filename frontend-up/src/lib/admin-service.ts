// ============================================
// ADMIN SERVICE - Admin & User Management
// ============================================

import { AdminUser, DBUser, ApiResponse, AdminPanelData, AddAdminPayload } from '@/types';
import { initialDBUsers, initialAdmins } from '@/data/tickets';

// In-memory store (will be replaced with DB)
let dbUsers: DBUser[] = [...initialDBUsers];
let admins: AdminUser[] = [...initialAdmins];

/**
 * Check if user is the first to login (becomes admin)
 */
export async function checkFirstLogin(email: string, name: string): Promise<ApiResponse<{ isFirstUser: boolean; isAdmin: boolean }>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if user already exists
            const existingUser = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (existingUser) {
                // User exists, update last login
                existingUser.lastLogin = new Date();
                existingUser.isActive = true;
                resolve({
                    success: true,
                    data: {
                        isFirstUser: false,
                        isAdmin: existingUser.isAdmin
                    }
                });
            } else {
                // New user - check if first user in DB
                const isFirstUser = dbUsers.length === 0;
                
                // Add new user
                const newUser: DBUser = {
                    id: `user-${Date.now()}`,
                    email,
                    name,
                    lastLogin: new Date(),
                    isActive: true,
                    isAdmin: isFirstUser // First user becomes admin
                };
                dbUsers.push(newUser);
                
                // If first user, also add to admins
                if (isFirstUser) {
                    admins.push({
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        isAdmin: true,
                        addedBy: 'System',
                        addedAt: new Date()
                    });
                }
                
                resolve({
                    success: true,
                    data: {
                        isFirstUser,
                        isAdmin: isFirstUser
                    }
                });
            }
        }, 100);
    });
}

/**
 * Get admin panel data (only for admins)
 */
export async function getAdminPanelData(): Promise<ApiResponse<AdminPanelData>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    users: dbUsers,
                    admins: admins,
                    totalUsers: dbUsers.length,
                    activeUsers: dbUsers.filter(u => u.isActive).length
                }
            });
        }, 100);
    });
}

/**
 * Add new admin (only existing admins can do this)
 */
export async function addAdmin(payload: AddAdminPayload, addedByEmail: string): Promise<ApiResponse<AdminUser>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if user exists in DB
            const user = dbUsers.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
            
            if (!user) {
                resolve({
                    success: false,
                    error: 'User not found. They must login at least once before being made admin.'
                });
                return;
            }
            
            // Check if already admin
            if (user.isAdmin) {
                resolve({
                    success: false,
                    error: 'User is already an admin.'
                });
                return;
            }
            
            // Make user admin
            user.isAdmin = true;
            
            const newAdmin: AdminUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: true,
                addedBy: addedByEmail,
                addedAt: new Date()
            };
            admins.push(newAdmin);
            
            resolve({
                success: true,
                data: newAdmin,
                message: `${user.name} has been added as an admin.`
            });
        }, 100);
    });
}

/**
 * Remove admin (only admins can do this, cannot remove self if last admin)
 */
export async function removeAdmin(userId: string, removedByEmail: string): Promise<ApiResponse<null>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const adminIndex = admins.findIndex(a => a.id === userId);
            
            if (adminIndex === -1) {
                resolve({
                    success: false,
                    error: 'Admin not found.'
                });
                return;
            }
            
            // Cannot remove self if last admin
            if (admins.length === 1) {
                resolve({
                    success: false,
                    error: 'Cannot remove the last admin. Add another admin first.'
                });
                return;
            }
            
            // Check if trying to remove self
            const adminToRemove = admins[adminIndex];
            if (adminToRemove.email.toLowerCase() === removedByEmail.toLowerCase() && admins.length <= 2) {
                resolve({
                    success: false,
                    error: 'Cannot remove yourself as admin unless there are other admins.'
                });
                return;
            }
            
            // Remove from admins
            admins.splice(adminIndex, 1);
            
            // Update user record
            const user = dbUsers.find(u => u.id === userId);
            if (user) {
                user.isAdmin = false;
            }
            
            resolve({
                success: true,
                data: null,
                message: 'Admin removed successfully.'
            });
        }, 100);
    });
}

/**
 * Get all users in the DB
 */
export async function getAllDBUsers(): Promise<ApiResponse<DBUser[]>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: dbUsers
            });
        }, 100);
    });
}

/**
 * Check if email is admin
 */
export async function isUserAdmin(email: string): Promise<boolean> {
    const user = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user?.isAdmin || false;
}

/**
 * Get admin list
 */
export async function getAdmins(): Promise<ApiResponse<AdminUser[]>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: admins
            });
        }, 100);
    });
}
