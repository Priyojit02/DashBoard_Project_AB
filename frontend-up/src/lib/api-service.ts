// ============================================
// UNIFIED API SERVICE - Backend Integration
// ============================================
// This service connects frontend to backend endpoints
// Switches between mock data and real API based on env

import backendApi, {
  authApi,
  ticketsApi,
  usersApi,
  adminApi,
  analyticsApi,
  emailsApi,
  TicketListParams,
  TicketListResponse,
  CreateTicketData,
  UpdateTicketData,
  DashboardStats,
  AnalyticsResponse,
} from './backend-api';
import type { Ticket, User, TicketLog, TicketComment, ApiResponse, AdminPanelData } from '@/types';

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// ============================================
// Auth Service (Connected to Backend)
// ============================================

export const authService = {
  /**
   * Login with Azure AD token - sends to backend
   */
  async loginWithAzureToken(azureAccessToken: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await authApi.login(azureAccessToken);
      // Map backend response to User type
      const user: User = {
        id: String(response.id),
        email: response.email,
        name: response.name,
        role: response.is_admin ? 'admin' : 'user',
        isAdmin: response.is_admin,
        avatar: response.avatar_url,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
      return {
        success: true,
        data: { user },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const user = await authApi.getMe();
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get user' };
    }
  },

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user: any }>> {
    try {
      const result = await authApi.verifyToken();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Token verification failed' };
    }
  },

  /**
   * Logout - handled by auth-service
   */
  logout(): void {
    // No-op - Azure AD logout is handled by auth-service
  },

  /**
   * Set auth token - no-op, using Azure AD directly
   */
  setToken(_token: string): void {
    // No-op - using Azure AD token directly
  },

  /**
   * Clear auth token - no-op
   */
  clearToken(): void {
    // No-op - Azure AD logout is handled by auth-service
  },
};

// ============================================
// Ticket Service (Connected to Backend)
// ============================================

export const ticketService = {
  /**
   * Get all tickets with pagination and filters
   */
  async getTickets(params: TicketListParams = {}): Promise<ApiResponse<TicketListResponse>> {
    try {
      const response = await ticketsApi.getTickets(params);
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch tickets' };
    }
  },

  /**
   * Get single ticket by ID
   */
  async getTicketById(id: number): Promise<ApiResponse<Ticket>> {
    try {
      const ticket = await ticketsApi.getTicket(id);
      return { success: true, data: ticket };
    } catch (error: any) {
      return { success: false, error: error.message || 'Ticket not found' };
    }
  },

  /**
   * Get ticket by ticket_id format (T-001)
   */
  async getTicketByTicketId(ticketId: string): Promise<ApiResponse<Ticket>> {
    try {
      const ticket = await ticketsApi.getTicketByTicketId(ticketId);
      return { success: true, data: ticket };
    } catch (error: any) {
      return { success: false, error: error.message || 'Ticket not found' };
    }
  },

  /**
   * Create new ticket
   */
  async createTicket(data: CreateTicketData): Promise<ApiResponse<Ticket>> {
    try {
      const ticket = await ticketsApi.createTicket(data);
      return { success: true, data: ticket };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create ticket' };
    }
  },

  /**
   * Update ticket
   */
  async updateTicket(id: number, data: UpdateTicketData): Promise<ApiResponse<Ticket>> {
    try {
      const ticket = await ticketsApi.updateTicket(id, data);
      return { success: true, data: ticket };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update ticket' };
    }
  },

  /**
   * Delete ticket
   */
  async deleteTicket(id: number): Promise<ApiResponse<null>> {
    try {
      await ticketsApi.deleteTicket(id);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete ticket' };
    }
  },

  /**
   * Get recent tickets
   */
  async getRecentTickets(limit = 10): Promise<ApiResponse<Ticket[]>> {
    try {
      const tickets = await ticketsApi.getRecentTickets(limit);
      return { success: true, data: tickets };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch recent tickets' };
    }
  },

  /**
   * Get my tickets
   */
  async getMyTickets(skip = 0, limit = 20): Promise<ApiResponse<TicketListResponse>> {
    try {
      const response = await ticketsApi.getMyTickets({ skip, limit });
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch your tickets' };
    }
  },

  /**
   * Get ticket history/logs
   */
  async getTicketLogs(ticketId: number): Promise<ApiResponse<TicketLog[]>> {
    try {
      const logs = await ticketsApi.getTicketLogs(ticketId);
      return { success: true, data: logs };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch ticket logs' };
    }
  },

  /**
   * Add comment to ticket
   */
  async addComment(ticketId: number, content: string, isInternal = false): Promise<ApiResponse<TicketComment>> {
    try {
      const comment = await ticketsApi.addComment(ticketId, content, isInternal);
      return { success: true, data: comment };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add comment' };
    }
  },

  /**
   * Update comment
   */
  async updateComment(commentId: number, content: string): Promise<ApiResponse<TicketComment>> {
    try {
      const comment = await ticketsApi.updateComment(commentId, content);
      return { success: true, data: comment };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update comment' };
    }
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: number): Promise<ApiResponse<null>> {
    try {
      await ticketsApi.deleteComment(commentId);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete comment' };
    }
  },
};

// ============================================
// User Service (Connected to Backend)
// ============================================

export const userService = {
  /**
   * Get all users
   */
  async getUsers(skip = 0, limit = 100): Promise<ApiResponse<User[]>> {
    try {
      const users = await usersApi.getUsers({ skip, limit });
      return { success: true, data: users };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch users' };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const user = await usersApi.getUser(id);
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message || 'User not found' };
    }
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    try {
      const users = await usersApi.searchUsers(query);
      return { success: true, data: users };
    } catch (error: any) {
      return { success: false, error: error.message || 'Search failed' };
    }
  },

  /**
   * Get assignable users (for ticket assignment)
   */
  async getAssignableUsers(): Promise<ApiResponse<User[]>> {
    try {
      const users = await usersApi.getAssignableUsers();
      return { success: true, data: users };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch assignable users' };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; department?: string }): Promise<ApiResponse<User>> {
    try {
      const user = await usersApi.updateProfile(data);
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  },
};

// ============================================
// Admin Service (Connected to Backend)
// ============================================

export const adminService = {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const users = await adminApi.getAllUsers();
      return { success: true, data: users };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch users' };
    }
  },

  /**
   * Get all admins
   */
  async getAdmins(): Promise<ApiResponse<User[]>> {
    try {
      const admins = await adminApi.getAdmins();
      return { success: true, data: admins };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch admins' };
    }
  },

  /**
   * Get admin panel data
   */
  async getAdminPanelData(): Promise<ApiResponse<AdminPanelData>> {
    try {
      const [users, admins, stats] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAdmins(),
        adminApi.getStats(),
      ]);

      return {
        success: true,
        data: {
          users: users.map(u => ({
            id: String(u.id),
            email: u.email,
            name: u.name,
            lastLogin: u.updatedAt ? new Date(u.updatedAt) : new Date(),
            isActive: u.isActive ?? true,
            isAdmin: u.isAdmin,
          })),
          admins: admins.map(a => ({
            id: String(a.id),
            email: a.email,
            name: a.name,
            isAdmin: true,
            addedBy: 'System',
            addedAt: a.createdAt ? new Date(a.createdAt) : new Date(),
          })),
          totalUsers: stats.total_users,
          activeUsers: stats.total_users, // Adjust based on actual response
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch admin data' };
    }
  },

  /**
   * Add admin
   */
  async addAdmin(userId: number): Promise<ApiResponse<User>> {
    try {
      const user = await adminApi.addAdmin(userId);
      return { success: true, data: user, message: `${user.name} has been added as an admin.` };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add admin' };
    }
  },

  /**
   * Remove admin
   */
  async removeAdmin(userId: number): Promise<ApiResponse<null>> {
    try {
      await adminApi.removeAdmin(userId);
      return { success: true, data: null, message: 'Admin removed successfully.' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to remove admin' };
    }
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(skip = 0, limit = 50): Promise<ApiResponse<any[]>> {
    try {
      const logs = await adminApi.getAuditLogs({ skip, limit });
      return { success: true, data: logs };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch audit logs' };
    }
  },

  /**
   * Deactivate user
   */
  async deactivateUser(userId: number): Promise<ApiResponse<null>> {
    try {
      await adminApi.deactivateUser(userId);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to deactivate user' };
    }
  },

  /**
   * Reactivate user
   */
  async reactivateUser(userId: number): Promise<ApiResponse<null>> {
    try {
      await adminApi.reactivateUser(userId);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reactivate user' };
    }
  },
};

// ============================================
// Analytics Service (Connected to Backend)
// ============================================

export const analyticsService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const stats = await analyticsApi.getDashboardStats();
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch dashboard stats' };
    }
  },

  /**
   * Get full analytics
   */
  async getFullAnalytics(days = 30): Promise<ApiResponse<AnalyticsResponse>> {
    try {
      const analytics = await analyticsApi.getFullAnalytics(days);
      return { success: true, data: analytics };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch analytics' };
    }
  },

  /**
   * Get user analytics
   */
  async getUserAnalytics(): Promise<ApiResponse<any>> {
    try {
      const analytics = await analyticsApi.getUserAnalytics();
      return { success: true, data: analytics };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch user analytics' };
    }
  },

  /**
   * Get category summary
   */
  async getCategorySummary(): Promise<ApiResponse<any[]>> {
    try {
      const summary = await analyticsApi.getCategorySummary();
      return { success: true, data: summary };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch category summary' };
    }
  },
};

// ============================================
// Email Service (Admin only - Connected to Backend)
// ============================================

export const emailService = {
  /**
   * Trigger email fetch manually
   */
  async triggerEmailFetch(daysBack = 1, maxEmails = 100): Promise<ApiResponse<any>> {
    try {
      const result = await emailsApi.triggerFetch({ days_back: daysBack, max_emails: maxEmails });
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch emails' };
    }
  },

  /**
   * Get email processing stats
   */
  async getEmailStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await emailsApi.getStats();
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch email stats' };
    }
  },

  /**
   * Get recent processed emails
   */
  async getRecentEmails(limit = 10): Promise<ApiResponse<any[]>> {
    try {
      const emails = await emailsApi.getRecent(limit);
      return { success: true, data: emails };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch recent emails' };
    }
  },

  /**
   * Get unprocessed emails
   */
  async getUnprocessedEmails(limit = 50): Promise<ApiResponse<any[]>> {
    try {
      const emails = await emailsApi.getUnprocessed(limit);
      return { success: true, data: emails };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch unprocessed emails' };
    }
  },

  /**
   * Reprocess a specific email
   */
  async reprocessEmail(emailId: number): Promise<ApiResponse<any>> {
    try {
      const result = await emailsApi.reprocess(emailId);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reprocess email' };
    }
  },
};

// ============================================
// Export all services
// ============================================

export default {
  auth: authService,
  tickets: ticketService,
  users: userService,
  admin: adminService,
  analytics: analyticsService,
  emails: emailService,
};
