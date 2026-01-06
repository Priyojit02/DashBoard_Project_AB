// ============================================
// BACKEND HOOKS - Hooks connected to Backend API
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { ticketService, analyticsService, adminService, authService, emailService, userService } from '@/lib/api-service';
import type { Ticket, User, AnalyticsData } from '@/types';
import type { TicketListParams, DashboardStats, AnalyticsResponse } from '@/lib/backend-api';

// ============================================
// Auth Hook
// ============================================

interface UseBackendAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginWithAzure: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export function useBackendAuth(): UseBackendAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (token) {
          authService.setToken(token);
          const result = await authService.getCurrentUser();
          if (result.success && result.data) {
            setUser(result.data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loginWithAzure = useCallback(async (azureToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.loginWithAzureToken(azureToken);
      if (result.success && result.data) {
        // No JWT needed - using Azure AD token directly
        setUser(result.data.user);
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    // No token refresh needed - using Azure AD directly
    return true;
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    loginWithAzure,
    logout,
    refreshToken,
  };
}

// ============================================
// Tickets Hook (Backend)
// ============================================

interface UseBackendTicketsOptions {
  autoLoad?: boolean;
  params?: TicketListParams;
}

interface UseBackendTicketsReturn {
  tickets: Ticket[];
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  loadTickets: (params?: TicketListParams) => Promise<void>;
  getTicket: (id: number) => Promise<Ticket | null>;
  createTicket: (data: any) => Promise<Ticket | null>;
  updateTicket: (id: number, data: any) => Promise<Ticket | null>;
  deleteTicket: (id: number) => Promise<boolean>;
  refreshTickets: () => Promise<void>;
}

export function useBackendTickets(options: UseBackendTicketsOptions = {}): UseBackendTicketsReturn {
  const { autoLoad = true, params = {} } = options;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async (loadParams: TicketListParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ticketService.getTickets({ ...params, ...loadParams });
      if (result.success && result.data) {
        setTickets(result.data.items);
        setTotal(result.data.total);
        setPage(result.data.page);
        setPages(result.data.pages);
      } else {
        setError(result.error || 'Failed to load tickets');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (autoLoad) {
      loadTickets();
    }
  }, [autoLoad, loadTickets]);

  const getTicket = useCallback(async (id: number): Promise<Ticket | null> => {
    const result = await ticketService.getTicketById(id);
    return result.success ? result.data || null : null;
  }, []);

  const createTicket = useCallback(async (data: any): Promise<Ticket | null> => {
    const result = await ticketService.createTicket(data);
    if (result.success && result.data) {
      setTickets(prev => [result.data!, ...prev]);
      return result.data;
    }
    return null;
  }, []);

  const updateTicket = useCallback(async (id: number, data: any): Promise<Ticket | null> => {
    const result = await ticketService.updateTicket(id, data);
    if (result.success && result.data) {
      setTickets(prev => prev.map(t => t.id === id ? result.data! : t));
      return result.data;
    }
    return null;
  }, []);

  const deleteTicket = useCallback(async (id: number): Promise<boolean> => {
    const result = await ticketService.deleteTicket(id);
    if (result.success) {
      setTickets(prev => prev.filter(t => t.id !== id));
      return true;
    }
    return false;
  }, []);

  const refreshTickets = useCallback(async () => {
    await loadTickets();
  }, [loadTickets]);

  return {
    tickets,
    total,
    page,
    pages,
    isLoading,
    error,
    loadTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    refreshTickets,
  };
}

// ============================================
// Dashboard Analytics Hook (Backend)
// ============================================

interface UseBackendDashboardReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBackendDashboard(): UseBackendDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard stats');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: loadStats,
  };
}

// ============================================
// Full Analytics Hook (Backend)
// ============================================

interface UseBackendAnalyticsReturn {
  analytics: AnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: (days?: number) => Promise<void>;
}

export function useBackendAnalytics(days = 30): UseBackendAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (daysParam = days) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getFullAnalytics(daysParam);
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refresh: loadAnalytics,
  };
}

// ============================================
// Admin Hook (Backend)
// ============================================

interface UseBackendAdminReturn {
  users: User[];
  admins: User[];
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  addAdmin: (userId: number) => Promise<boolean>;
  removeAdmin: (userId: number) => Promise<boolean>;
  deactivateUser: (userId: number) => Promise<boolean>;
  reactivateUser: (userId: number) => Promise<boolean>;
}

export function useBackendAdmin(): UseBackendAdminReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResult, adminsResult] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAdmins(),
      ]);

      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }
      if (adminsResult.success && adminsResult.data) {
        setAdmins(adminsResult.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addAdmin = useCallback(async (userId: number): Promise<boolean> => {
    const result = await adminService.addAdmin(userId);
    if (result.success) {
      await loadData();
      return true;
    }
    return false;
  }, [loadData]);

  const removeAdmin = useCallback(async (userId: number): Promise<boolean> => {
    const result = await adminService.removeAdmin(userId);
    if (result.success) {
      await loadData();
      return true;
    }
    return false;
  }, [loadData]);

  const deactivateUser = useCallback(async (userId: number): Promise<boolean> => {
    const result = await adminService.deactivateUser(userId);
    if (result.success) {
      await loadData();
      return true;
    }
    return false;
  }, [loadData]);

  const reactivateUser = useCallback(async (userId: number): Promise<boolean> => {
    const result = await adminService.reactivateUser(userId);
    if (result.success) {
      await loadData();
      return true;
    }
    return false;
  }, [loadData]);

  return {
    users,
    admins,
    isLoading,
    error,
    loadData,
    addAdmin,
    removeAdmin,
    deactivateUser,
    reactivateUser,
  };
}

// ============================================
// Email Processing Hook (Admin only - Backend)
// ============================================

interface EmailStats {
  total: number;
  processed: number;
  sap_related: number;
  tickets_created: number;
  errors: number;
}

interface UseBackendEmailsReturn {
  stats: EmailStats | null;
  recentEmails: any[];
  unprocessedEmails: any[];
  isLoading: boolean;
  error: string | null;
  triggerFetch: (daysBack?: number, maxEmails?: number) => Promise<any>;
  reprocessEmail: (emailId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useBackendEmails(): UseBackendEmailsReturn {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [unprocessedEmails, setUnprocessedEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsResult, recentResult, unprocessedResult] = await Promise.all([
        emailService.getEmailStats(),
        emailService.getRecentEmails(10),
        emailService.getUnprocessedEmails(50),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
      if (recentResult.success && recentResult.data) {
        setRecentEmails(recentResult.data);
      }
      if (unprocessedResult.success && unprocessedResult.data) {
        setUnprocessedEmails(unprocessedResult.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerFetch = useCallback(async (daysBack = 1, maxEmails = 100) => {
    setError(null);
    try {
      const result = await emailService.triggerEmailFetch(daysBack, maxEmails);
      if (result.success) {
        await loadData(); // Refresh after fetch
        return result.data;
      } else {
        setError(result.error || 'Failed to trigger email fetch');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to trigger email fetch');
      return null;
    }
  }, [loadData]);

  const reprocessEmail = useCallback(async (emailId: number): Promise<boolean> => {
    const result = await emailService.reprocessEmail(emailId);
    if (result.success) {
      await loadData();
      return true;
    }
    return false;
  }, [loadData]);

  return {
    stats,
    recentEmails,
    unprocessedEmails,
    isLoading,
    error,
    triggerFetch,
    reprocessEmail,
    refresh: loadData,
  };
}

// ============================================
// Users Hook (Backend)
// ============================================

interface UseBackendUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchUsers: (query: string) => Promise<User[]>;
  getAssignableUsers: () => Promise<User[]>;
  refresh: () => Promise<void>;
}

export function useBackendUsers(): UseBackendUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    const result = await userService.searchUsers(query);
    return result.success && result.data ? result.data : [];
  }, []);

  const getAssignableUsers = useCallback(async (): Promise<User[]> => {
    const result = await userService.getAssignableUsers();
    return result.success && result.data ? result.data : [];
  }, []);

  return {
    users,
    isLoading,
    error,
    searchUsers,
    getAssignableUsers,
    refresh: loadUsers,
  };
}
