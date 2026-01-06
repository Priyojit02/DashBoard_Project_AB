// ============================================
// HOOKS INDEX
// ============================================

// Legacy hooks (using mock data)
export { useTickets } from './useTickets';
export { useAuth, AuthProvider, useAuthState, useRequireAuth } from './useAuth';
export { useAnalytics, useDateRangeReport, useAssigneeWorkload } from './useAnalytics';

// Backend-connected hooks
export {
  useBackendAuth,
  useBackendTickets,
  useBackendDashboard,
  useBackendAnalytics,
  useBackendAdmin,
  useBackendEmails,
  useBackendUsers,
} from './useBackend';
