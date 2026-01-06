// ============================================
// ANALYTICS API - GET Statistics
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { initialTickets } from '@/data/tickets';
import { Ticket } from '@/types';

// In-memory store
const tickets: Ticket[] = [...initialTickets];

// GET /api/analytics - Get ticket statistics
export async function GET(request: NextRequest) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        
        // Calculate statistics
        const stats = {
            total: tickets.length,
            byStatus: {} as Record<string, number>,
            byPriority: {} as Record<string, number>,
            byModule: {} as Record<string, number>,
            byAssignee: {} as Record<string, number>,
            overdue: 0,
            dueSoon: 0,
            completedThisWeek: 0,
            createdThisWeek: 0,
        };
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        tickets.forEach(ticket => {
            // Count by status
            stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
            
            // Count by priority
            stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
            
            // Count by module
            if (ticket.module) {
                stats.byModule[ticket.module] = (stats.byModule[ticket.module] || 0) + 1;
            }
            
            // Count by assignee
            stats.byAssignee[ticket.assignedTo] = (stats.byAssignee[ticket.assignedTo] || 0) + 1;
            
            // Check overdue
            const dueDate = new Date(ticket.completionBy);
            if (dueDate < today && ticket.status !== 'Completed' && ticket.status !== 'Cancelled') {
                stats.overdue++;
            }
            
            // Check due soon
            if (dueDate >= today && dueDate <= weekFromNow && 
                ticket.status !== 'Completed' && ticket.status !== 'Cancelled') {
                stats.dueSoon++;
            }
            
            // Created this week
            const createdDate = new Date(ticket.createdOn);
            if (createdDate >= weekAgo && createdDate <= today) {
                stats.createdThisWeek++;
            }
            
            // Completed this week (use closedOn)
            if (ticket.status === 'Completed' && ticket.closedOn) {
                const completedDate = new Date(ticket.closedOn);
                if (completedDate >= weekAgo && completedDate <= today) {
                    stats.completedThisWeek++;
                }
            }
        });
        
        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
