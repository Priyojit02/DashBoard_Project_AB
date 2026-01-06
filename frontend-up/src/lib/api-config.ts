// ============================================
// API Configuration - Backend Connection
// ============================================
// Uses Azure AD token directly (no JWT)

// Backend API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// API endpoints
export const API_ENDPOINTS = {
  // Auth (No JWT - uses Azure AD token directly)
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    verify: '/auth/verify',
  },
  
  // Tickets
  tickets: {
    list: '/tickets',
    create: '/tickets',
    get: (id: number) => `/tickets/${id}`,
    getByTicketId: (ticketId: string) => `/tickets/by-ticket-id/${ticketId}`,
    update: (id: number) => `/tickets/${id}`,
    delete: (id: number) => `/tickets/${id}`,
    recent: '/tickets/recent',
    my: '/tickets/my',
    logs: (id: number) => `/tickets/${id}/logs`,
    comments: {
      add: (ticketId: number) => `/tickets/${ticketId}/comments`,
      update: (commentId: number) => `/tickets/comments/${commentId}`,
      delete: (commentId: number) => `/tickets/comments/${commentId}`,
    },
  },
  
  // Users
  users: {
    list: '/users',
    get: (id: number) => `/users/${id}`,
    search: '/users/search',
    assignable: '/users/assignable',
    count: '/users/count',
    profile: '/users/profile',
  },
  
  // Admin
  admin: {
    users: '/admin/users',
    admins: '/admin/admins',
    addAdmin: '/admin/admins/add',
    removeAdmin: '/admin/admins/remove',
    stats: '/admin/stats',
    auditLogs: '/admin/audit-logs',
    deactivateUser: (id: number) => `/admin/users/${id}/deactivate`,
    reactivateUser: (id: number) => `/admin/users/${id}/reactivate`,
  },
  
  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    full: '/analytics/full',
    user: '/analytics/user',
    categories: '/analytics/categories',
  },
  
  // Email Processing
  emails: {
    fetch: '/emails/fetch',
    stats: '/emails/stats',
    recent: '/emails/recent',
    unprocessed: '/emails/unprocessed',
    reprocess: (id: number) => `/emails/${id}/reprocess`,
    byCategory: (category: string) => `/emails/by-category/${category}`,
  },
};

// Request configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
};
