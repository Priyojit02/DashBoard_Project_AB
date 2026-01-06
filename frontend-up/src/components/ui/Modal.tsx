// ============================================
// MODAL COMPONENT
// ============================================

'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
};

export function Modal({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    showCloseButton = true,
    className,
}: ModalProps) {
    // Handle escape key
    const handleEscKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc) {
            onClose();
        }
    }, [closeOnEsc, onClose]);
    
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscKey]);
    
    if (!isOpen) return null;
    
    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />
            
            {/* Modal */}
            <div
                className={cn(
                    'relative bg-white rounded-lg shadow-xl w-full mx-4',
                    'max-h-[90vh] overflow-hidden flex flex-col',
                    'animate-in fade-in-0 zoom-in-95 duration-200',
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        {title && (
                            <h2 className="text-xl font-semibold text-gray-900">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
    
    // Portal to body
    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    
    return null;
}

interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div className={cn(
            'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50',
            className
        )}>
            {children}
        </div>
    );
}
