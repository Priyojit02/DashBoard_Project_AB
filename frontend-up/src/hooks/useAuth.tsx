// ============================================
// AUTH HOOK - Authentication State Management
// ============================================

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { User, AuthState } from '@/types';
import {
    initializeMsal,
    loginWithPopup,
    logout as msalLogout,
    getCurrentAccount,
    getUserProfile,
    isAuthenticated as checkAuth,
    getAccountInitials,
} from '@/lib/auth-service';

interface AuthContextValue extends AuthState {
    login: () => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    getInitials: () => string;
    account: AccountInfo | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        loading: true,
    });
    const [account, setAccount] = useState<AccountInfo | null>(null);
    
    // Initialize auth on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                await initializeMsal();
                const currentAccount = await getCurrentAccount();
                
                if (currentAccount) {
                    setAccount(currentAccount);
                    const userProfile = await getUserProfile();
                    setAuthState({
                        isAuthenticated: true,
                        user: userProfile,
                        loading: false,
                    });
                } else {
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    loading: false,
                    error: 'Failed to initialize authentication',
                });
            }
        };
        
        initAuth();
    }, []);
    
    // Login function
    const login = useCallback(async (): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, loading: true, error: undefined }));
        
        try {
            const response = await loginWithPopup();
            
            if (response?.account) {
                setAccount(response.account);
                const userProfile = await getUserProfile();
                setAuthState({
                    isAuthenticated: true,
                    user: userProfile,
                    loading: false,
                });
                return true;
            }
            
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Login cancelled or failed',
            }));
            return false;
        } catch (error) {
            console.error('Login error:', error);
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Login failed. Please try again.',
            }));
            return false;
        }
    }, []);
    
    // Logout function
    const logout = useCallback(async (): Promise<void> => {
        try {
            await msalLogout();
            setAccount(null);
            setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false,
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);
    
    // Refresh user profile
    const refreshUser = useCallback(async (): Promise<void> => {
        if (!authState.isAuthenticated) return;
        
        try {
            const userProfile = await getUserProfile();
            setAuthState(prev => ({
                ...prev,
                user: userProfile,
            }));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, [authState.isAuthenticated]);
    
    // Get user initials
    const getInitials = useCallback((): string => {
        return getAccountInitials(account);
    }, [account]);
    
    const value: AuthContextValue = {
        ...authState,
        login,
        logout,
        refreshUser,
        getInitials,
        account,
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook for auth state only (no context required)
 */
export function useAuthState() {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        loading: true,
    });
    
    useEffect(() => {
        const checkAuthState = async () => {
            try {
                const authenticated = await checkAuth();
                
                if (authenticated) {
                    const profile = await getUserProfile();
                    setState({
                        isAuthenticated: true,
                        user: profile,
                        loading: false,
                    });
                } else {
                    setState({
                        isAuthenticated: false,
                        user: null,
                        loading: false,
                    });
                }
            } catch {
                setState({
                    isAuthenticated: false,
                    user: null,
                    loading: false,
                });
            }
        };
        
        checkAuthState();
    }, []);
    
    return state;
}

/**
 * Hook to require authentication
 */
export function useRequireAuth(redirectPath: string = '/login') {
    const auth = useAuth();
    
    useEffect(() => {
        if (!auth.loading && !auth.isAuthenticated) {
            window.location.href = redirectPath;
        }
    }, [auth.loading, auth.isAuthenticated, redirectPath]);
    
    return auth;
}
