// ============================================
// SINGLE TICKET API - GET, PUT, DELETE
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { initialTickets } from '@/data/tickets';
import { Ticket } from '@/types';

// In-memory store (will be replaced with database)
let tickets: Ticket[] = [...initialTickets];

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/tickets/[id] - Get single ticket
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const ticketId = parseInt(id, 10);
        
        const ticket = tickets.find(t => t.id === ticketId);
        
        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ticket' },
            { status: 500 }
        );
    }
}

// PUT /api/tickets/[id] - Update ticket
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const ticketId = parseInt(id, 10);
        const body = await request.json();
        
        const index = tickets.findIndex(t => t.id === ticketId);
        
        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }
        
        const existingTicket = tickets[index];
        
        // Build history entry
        const changedFields = Object.keys(body).filter(
            key => body[key] !== existingTicket[key as keyof Ticket]
        );
        
        const updatedTicket: Ticket = {
            ...existingTicket,
            ...body,
            logs: [
                ...existingTicket.logs,
                {
                    id: existingTicket.logs.length + 1,
                    action: 'status_changed',
                    performedBy: body.updatedBy || 'User',
                    timestamp: new Date().toISOString(),
                    details: `Updated fields: ${changedFields.join(', ')}`,
                },
            ],
        };
        
        tickets = [
            ...tickets.slice(0, index),
            updatedTicket,
            ...tickets.slice(index + 1),
        ];
        
        return NextResponse.json({
            success: true,
            data: updatedTicket,
        });
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update ticket' },
            { status: 500 }
        );
    }
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const ticketId = parseInt(id, 10);
        
        const index = tickets.findIndex(t => t.id === ticketId);
        
        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }
        
        tickets = [...tickets.slice(0, index), ...tickets.slice(index + 1)];
        
        return NextResponse.json({
            success: true,
            message: 'Ticket deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete ticket' },
            { status: 500 }
        );
    }
}
