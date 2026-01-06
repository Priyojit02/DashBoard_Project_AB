// ============================================
// DATA TRANSFORMATION - Backend to Frontend Mapping
// ============================================
// Maps backend API responses (snake_case) to frontend types (camelCase)

import type { Ticket, TicketLog, TicketComment, User } from '@/types';

/**
 * Backend Ticket Response Type (as returned by FastAPI)
 */
interface BackendTicketResponse {
    id: number;
    ticket_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    created_by: number;
    assigned_to: number | null;
    source_email_id: string | null;
    source_email_from: string | null;
    source_email_subject: string | null;
    llm_confidence: number | null;
    sla_due_date: string | null;
    resolution_time: number | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    created_by_user?: BackendUserBrief | null;
    assigned_to_user?: BackendUserBrief | null;
    logs?: BackendLogResponse[];
    comments?: BackendCommentResponse[];
}

interface BackendUserBrief {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
}

interface BackendLogResponse {
    id: number;
    ticket_id: number;
    user_id: number;
    log_type: string;
    action: string;
    old_value: string | null;
    new_value: string | null;
    log_metadata: any;
    created_at: string;
    user?: BackendUserBrief;
}

interface BackendCommentResponse {
    id: number;
    ticket_id: number;
    author_id: number;
    content: string;
    is_internal: boolean;
    is_edited: boolean;
    edited_at: string | null;
    created_at: string;
    author?: BackendUserBrief;
}

interface BackendListResponse {
    items: BackendTicketResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

/**
 * Transform backend ticket to frontend Ticket type
 */
export function transformTicket(backend: BackendTicketResponse): Ticket {
    const assignedToName = backend.assigned_to_user?.name || 'Unassigned';
    const raisedByName = backend.created_by_user?.name || 'Unknown';
    
    // Map status - backend may use different values
    const statusMap: Record<string, Ticket['status']> = {
        'Open': 'Open',
        'In Progress': 'In Progress',
        'Awaiting Info': 'On Hold',
        'Resolved': 'Completed',
        'Closed': 'Completed',
        'Completed': 'Completed',
        'On Hold': 'On Hold',
        'Cancelled': 'Cancelled',
    };
    
    // Map category to module
    const moduleMap: Record<string, Ticket['module']> = {
        'MM': 'MM',
        'SD': 'SD', 
        'FICO': 'FICO',
        'PP': 'PP',
        'HCM': 'HCM',
        'PM': 'PM',
        'QM': 'QM',
        'WM': 'WM',
        'PS': 'PS',
        'OTHER': 'Other',
    };
    
    return {
        id: backend.id,
        title: backend.title,
        description: backend.description,
        status: statusMap[backend.status] || 'Open',
        priority: backend.priority as Ticket['priority'],
        assignedTo: assignedToName,
        assignedToEmail: backend.assigned_to_user?.email,
        raisedBy: raisedByName,
        createdBy: raisedByName,
        createdOn: backend.created_at.split('T')[0],
        completionBy: backend.sla_due_date?.split('T')[0] || backend.created_at.split('T')[0],
        closedOn: backend.resolved_at?.split('T')[0] || null,
        module: moduleMap[backend.category] || 'Other',
        logs: backend.logs?.map(transformLog) || [],
        comments: backend.comments?.map(transformComment) || [],
        emailSource: backend.source_email_id ? {
            emailId: backend.source_email_id,
            subject: backend.source_email_subject || '',
            from: backend.source_email_from || '',
            receivedAt: new Date(backend.created_at),
        } : undefined,
    };
}

/**
 * Transform backend log to frontend TicketLog type
 */
export function transformLog(backend: BackendLogResponse): TicketLog {
    const actionMap: Record<string, TicketLog['action']> = {
        'created': 'ticket_created',
        'status_change': 'status_changed',
        'assignment': 'assigned',
        'priority_change': 'priority_changed',
        'comment': 'comment_added',
        'email_received': 'ticket_created',
        'auto_classified': 'ticket_created',
    };
    
    return {
        id: backend.id,
        action: actionMap[backend.log_type] || 'status_changed',
        performedBy: backend.user?.name || 'System',
        timestamp: backend.created_at,
        details: backend.action,
    };
}

/**
 * Transform backend comment to frontend TicketComment type
 */
export function transformComment(backend: BackendCommentResponse): TicketComment {
    return {
        id: backend.id,
        author: backend.author?.name || 'Unknown',
        role: 'viewer', // Would need more context to determine actual role
        message: backend.content,
        timestamp: backend.created_at,
    };
}

/**
 * Transform backend list response to frontend format
 */
export function transformTicketList(backend: BackendListResponse): {
    items: Ticket[];
    total: number;
    page: number;
    size: number;
    pages: number;
} {
    return {
        items: backend.items.map(transformTicket),
        total: backend.total,
        page: backend.page,
        size: backend.size,
        pages: backend.pages,
    };
}

/**
 * Transform frontend Ticket to backend create format
 */
export function toBackendCreateTicket(ticket: Partial<Ticket>): {
    title: string;
    description: string;
    priority: string;
    category: string;
    assigned_to?: number;
} {
    return {
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'Medium',
        category: ticket.module || 'OTHER',
    };
}

/**
 * Transform frontend Ticket updates to backend format
 */
export function toBackendUpdateTicket(updates: Partial<Ticket>): Record<string, any> {
    const result: Record<string, any> = {};
    
    if (updates.title !== undefined) result.title = updates.title;
    if (updates.description !== undefined) result.description = updates.description;
    if (updates.status !== undefined) {
        // Map frontend status to backend status
        const statusMap: Record<string, string> = {
            'Open': 'Open',
            'In Progress': 'In Progress',
            'Completed': 'Resolved',
            'On Hold': 'Awaiting Info',
            'Cancelled': 'Closed',
        };
        result.status = statusMap[updates.status] || updates.status;
    }
    if (updates.priority !== undefined) result.priority = updates.priority;
    if (updates.module !== undefined) result.category = updates.module;
    
    return result;
}

/**
 * Check if data looks like backend format (has snake_case fields)
 */
export function isBackendFormat(data: any): boolean {
    if (!data) return false;
    return 'created_at' in data || 'assigned_to' in data || 'ticket_id' in data;
}

/**
 * Auto-transform data if it's in backend format
 */
export function autoTransformTicket(data: any): Ticket {
    if (isBackendFormat(data)) {
        return transformTicket(data as BackendTicketResponse);
    }
    return data as Ticket;
}

/**
 * Auto-transform list if it's in backend format
 */
export function autoTransformTicketList(data: any): Ticket[] {
    if (Array.isArray(data)) {
        return data.map(autoTransformTicket);
    }
    if (data?.items && Array.isArray(data.items)) {
        return data.items.map(autoTransformTicket);
    }
    return [];
}
