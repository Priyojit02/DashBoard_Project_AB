// ============================================
// UTILITY FUNCTIONS
// ============================================

import { Ticket, TicketStats, TicketFilters, SortConfig } from '@/types';

/**
 * Format date string for display
 */
export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
    });
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Get today's date at midnight
 */
export function getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

/**
 * Calculate days difference between two dates
 */
export function getDaysDifference(dateString: string): number {
    const dueDate = new Date(dateString);
    const today = getToday();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get human-readable days label
 */
export function getDaysLabel(dateString: string): { text: string; type: 'overdue' | 'today' | 'upcoming' } {
    const diffDays = getDaysDifference(dateString);
    
    if (diffDays < 0) {
        return { text: `${Math.abs(diffDays)} days overdue`, type: 'overdue' };
    } else if (diffDays === 0) {
        return { text: 'Due today', type: 'today' };
    } else if (diffDays === 1) {
        return { text: 'Due tomorrow', type: 'upcoming' };
    } else {
        return { text: `Due in ${diffDays} days`, type: 'upcoming' };
    }
}

/**
 * Check if ticket is overdue
 */
export function isOverdue(ticket: Ticket): boolean {
    if (ticket.status === 'Completed' || ticket.status === 'Cancelled') return false;
    const dueDate = new Date(ticket.completionBy);
    return dueDate < getToday();
}

/**
 * Calculate ticket statistics
 */
export function calculateTicketStats(tickets: Ticket[]): TicketStats {
    const today = getToday();
    
    return {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        completed: tickets.filter(t => t.status === 'Completed').length,
        onHold: tickets.filter(t => t.status === 'On Hold').length,
        cancelled: tickets.filter(t => t.status === 'Cancelled').length,
        overdue: tickets.filter(t => isOverdue(t)).length,
    };
}

/**
 * Filter tickets based on filters
 */
export function filterTickets(tickets: Ticket[], filters: TicketFilters): Ticket[] {
    return tickets.filter(ticket => {
        if (filters.id && !ticket.id.toString().includes(filters.id)) return false;
        if (filters.title && !ticket.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
        if (filters.status && ticket.status !== filters.status) return false;
        if (filters.assignedTo && !ticket.assignedTo.toLowerCase().includes(filters.assignedTo.toLowerCase())) return false;
        if (filters.completionBy && !ticket.completionBy.includes(filters.completionBy)) return false;
        if (filters.priority && ticket.priority !== filters.priority) return false;
        if (filters.module && ticket.module !== filters.module) return false;
        
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            const ticketDate = new Date(ticket.createdOn);
            if (ticketDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            const ticketDate = new Date(ticket.createdOn);
            if (ticketDate > toDate) return false;
        }
        
        return true;
    });
}

/**
 * Sort tickets based on sort config
 */
export function sortTickets(tickets: Ticket[], sortConfig: SortConfig): Ticket[] {
    return [...tickets].sort((a, b) => {
        let valueA = a[sortConfig.column];
        let valueB = b[sortConfig.column];
                // Handle null/undefined values
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (valueB == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = (valueB as string).toLowerCase();
        }
        
        if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Get overdue tickets
 */
export function getOverdueTickets(tickets: Ticket[]): Ticket[] {
    return tickets.filter(ticket => isOverdue(ticket));
}

/**
 * Get upcoming tickets (due within next N days)
 */
export function getUpcomingTickets(tickets: Ticket[], days: number = 7): Ticket[] {
    const today = getToday();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return tickets.filter(ticket => {
        if (ticket.status === 'Completed' || ticket.status === 'Cancelled') return false;
        const dueDate = new Date(ticket.completionBy);
        return dueDate >= today && dueDate <= futureDate;
    });
}

/**
 * Get unique assignees from tickets
 */
export function getUniqueAssignees(tickets: Ticket[]): string[] {
    return [...new Set(tickets.map(t => t.assignedTo))].sort();
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(name: string | undefined): string {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T, 
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Format status for CSS class
 */
export function getStatusClass(status: string): string {
    return `status-${status.replace(' ', '').toLowerCase()}`;
}

/**
 * Format priority for CSS class
 */
export function getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): string {
    if (total === 0) return "0.0";
    return ((value / total) * 100).toFixed(1);
}
