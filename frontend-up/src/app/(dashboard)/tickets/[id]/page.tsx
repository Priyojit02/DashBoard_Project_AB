// ============================================
// TICKET DETAIL PAGE
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket } from '@/types';
import { getTicketById, updateTicketStatus, addComment } from '@/lib/ticket-service';
import { formatDate, getDaysLabel } from '@/lib/utils';
import { 
    Button, 
    StatusBadge, 
    PriorityBadge, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent,
    Select,
    Input,
    TicketChat,
} from '@/components/ui';

const statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    const ticketId = params.id as string;
    
    // Load ticket
    useEffect(() => {
        async function loadTicket() {
            setIsLoading(true);
            const response = await getTicketById(ticketId);
            if (response.success && response.data) {
                setTicket(response.data);
            } else {
                setError('Ticket not found');
            }
            setIsLoading(false);
        }
        
        if (ticketId) {
            loadTicket();
        }
    }, [ticketId]);
    
    // Handle status change
    const handleStatusChange = async (newStatus: string) => {
        if (!ticket) return;
        
        const response = await updateTicketStatus(ticket.id, newStatus as Ticket['status']);
        if (response.success && response.data) {
            setTicket(response.data);
        }
    };
    
    // Handle add comment
    const handleAddComment = async () => {
        if (!ticket || !newComment.trim()) return;
        
        setIsSubmitting(true);
        const response = await addComment(ticket.id, newComment, 'Current User');
        if (response.success && response.data) {
            setTicket(response.data);
            setNewComment('');
        }
        setIsSubmitting(false);
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }
    
    if (error || !ticket) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">Ticket not found</h2>
                <p className="text-gray-500 mt-2">The ticket you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/tickets" className="mt-4 inline-block">
                    <Button>Back to Tickets</Button>
                </Link>
            </div>
        );
    }
    
    const daysInfo = getDaysLabel(ticket.completionBy);
    
    return (
        <div className="space-y-6">
            {/* Back Button & Header */}
            <div className="flex items-start justify-between">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Tickets
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Ticket #{ticket.id}
                        </h1>
                        {ticket.module && (
                            <span className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded font-medium">
                                {ticket.module}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1">
                        Created on {formatDate(ticket.createdOn)} by {ticket.createdBy}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/tickets/${ticket.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{ticket.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {ticket.description || 'No description provided.'}
                            </p>
                            
                            {/* Tags */}
                            {ticket.tags && ticket.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {ticket.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Comments ({ticket.comments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ticket.comments.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    No comments yet
                                </p>
                            ) : (
                                <div className="space-y-4 mb-4">
                                    {ticket.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">
                                                    {comment.author}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(comment.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{comment.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Add Comment */}
                            <div className="border-t border-gray-200 pt-4">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D04A02] focus:border-transparent resize-none"
                                    rows={3}
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        isLoading={isSubmitting}
                                        size="sm"
                                    >
                                        Add Comment
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {ticket.logs.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">{item.action}</span>
                                                {' by '}{item.by}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(item.date)}
                                            </p>
                                            {item.details && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {item.details}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Status
                                </label>
                                <Select
                                    options={statusOptions}
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                />
                            </div>
                            
                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Priority
                                </label>
                                <PriorityBadge priority={ticket.priority} />
                            </div>
                            
                            {/* Assignee */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Assigned To
                                </label>
                                <p className="text-gray-900">{ticket.assignedTo}</p>
                            </div>
                            
                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Due Date
                                </label>
                                <p className={`${daysInfo.type === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatDate(ticket.completionBy)}
                                </p>
                                <p className={`text-sm ${
                                    daysInfo.type === 'overdue' ? 'text-red-500' :
                                    daysInfo.type === 'today' ? 'text-yellow-600' : 'text-gray-500'
                                }`}>
                                    {daysInfo.text}
                                </p>
                            </div>
                            
                            {/* Raised By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Raised By
                                </label>
                                <p className="text-gray-900">{ticket.raisedBy}</p>
                            </div>
                            
                            {/* Created On */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Created On
                                </label>
                                <p className="text-gray-900">{formatDate(ticket.createdOn)}</p>
                            </div>
                            
                            {/* Closed On */}
                            {ticket.closedOn && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Closed On
                                    </label>
                                    <p className="text-gray-900">{formatDate(ticket.closedOn)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Attachments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Attachments ({ticket.attachments?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ticket.attachments && ticket.attachments.length > 0 ? (
                                <ul className="space-y-2">
                                    {ticket.attachments.map((attachment, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            <span className="text-[#D04A02] hover:underline cursor-pointer">
                                                {attachment.fileName}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">No attachments</p>
                            )}
                            <Button variant="outline" size="sm" className="w-full mt-4">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Attachment
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            {/* Chat Button - Shows only for In Progress tickets */}
            {ticket.status === 'In Progress' && !isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 bg-[#D04A02] text-white p-4 rounded-full shadow-lg hover:bg-[#B03E02] transition-colors z-40"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}
            
            {/* Chat Component */}
            <TicketChat
                ticketId={String(ticket.id)}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)
}
                currentUser={ticket.raisedBy || 'User'}
            />
        </div>
    );
}
