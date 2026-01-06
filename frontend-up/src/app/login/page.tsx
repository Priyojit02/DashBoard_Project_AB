// ============================================
// LOGIN PAGE
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

export default function LoginPage() {
    const router = useRouter();
    const { login, loading, error } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    
    const handleLogin = async () => {
        setIsSigningIn(true);
        try {
            const success = await login();
            if (success) {
                router.push('/dashboard');
            }
        } finally {
            setIsSigningIn(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 mx-auto mb-4 relative">
                            <Image
                                src="/pwcicon.png"
                                alt="PwC Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Ticket Management System
                        </h1>
                        <p className="text-gray-500 mt-2">
                            SAP Support Ticketing Platform
                        </p>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    
                    {/* Login Button */}
                    <Button
                        onClick={handleLogin}
                        isLoading={isSigningIn || loading}
                        className="w-full py-3"
                        size="lg"
                        leftIcon={
                            <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                                <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                                <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                                <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                                <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
                            </svg>
                        }
                    >
                        {isSigningIn ? 'Signing in...' : 'Sign in with Microsoft'}
                    </Button>
                    
                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Secure SSO Authentication
                            </span>
                        </div>
                    </div>
                    
                    {/* Info */}
                    <div className="text-center text-sm text-gray-500">
                        <p>Use your organization&apos;s Microsoft account to sign in.</p>
                        <p className="mt-2">
                            By signing in, you agree to our{' '}
                            <a href="#" className="text-[#D04A02] hover:underline">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-[#D04A02] hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Ticket Management System</p>
                    <p className="mt-1">Powered by SAP Integration</p>
                </div>
            </div>
        </div>
    );
}
