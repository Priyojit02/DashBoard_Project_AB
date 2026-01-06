// ============================================
// ANALYTICS PAGE
// ============================================

'use client';

import { useTickets } from '@/hooks/useTickets';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
    StatsCard, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent,
    StatusBadge,
    PriorityBadge,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AnalyticsPage() {
    const { tickets, isLoading } = useTickets();
    const {
        analytics,
        overdueTickets,
        upcomingTickets,
        workloadReport,
        priorityDistribution,
        moduleDistribution,
        statusSummary,
    } = useAnalytics({ tickets });
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-500 mt-1">
                    Insights and statistics for your tickets
                </p>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Tickets"
                    value={analytics.totalTickets}
                    color="primary"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Completed"
                    value={analytics.completedTickets}
                    color="success"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="In Progress"
                    value={analytics.inProgressTickets}
                    color="warning"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Overdue"
                    value={analytics.overdueTickets}
                    color="danger"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue Tickets */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Overdue Tickets
                                </span>
                            </CardTitle>
                            <span className="text-sm text-gray-500">
                                {overdueTickets.length} total
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {overdueTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No overdue tickets!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {overdueTickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/tickets/${ticket.id}`}
                                        className="block p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-red-600 font-mono">#{ticket.id}</span>
                                            <span className="text-xs text-red-600 font-medium">
                                                {ticket.daysOverdue} days overdue
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-900 mt-1 truncate">{ticket.title}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{ticket.assignedTo}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Upcoming Deadlines */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Upcoming Deadlines
                                </span>
                            </CardTitle>
                            <span className="text-sm text-gray-500">
                                Next 7 days
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {upcomingTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No upcoming deadlines</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {upcomingTickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/tickets/${ticket.id}`}
                                        className="block p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-yellow-700 font-mono">#{ticket.id}</span>
                                            <span className="text-xs text-yellow-700 font-medium">
                                                {ticket.daysUntilDue === 0 
                                                    ? 'Due today' 
                                                    : ticket.daysUntilDue === 1 
                                                        ? 'Due tomorrow'
                                                        : `Due in ${ticket.daysUntilDue} days`
                                                }
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-900 mt-1 truncate">{ticket.title}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{ticket.assignedTo}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Quadrant Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statusSummary.map(({ status, count, color }) => {
                                const percentage = analytics.totalTickets > 0 
                                    ? ((count / analytics.totalTickets) * 100).toFixed(1)
                                    : '0';
                                return (
                                    <div key={status}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{status}</span>
                                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{ 
                                                    width: `${percentage}%`,
                                                    backgroundColor: color 
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
                
                {/* Priority Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Priority Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {priorityDistribution.map(({ priority, count, percentage }) => {
                                const colors: Record<string, string> = {
                                    Critical: '#DC3545',
                                    High: '#FD7E14',
                                    Medium: '#FFC107',
                                    Low: '#28A745',
                                };
                                return (
                                    <div key={priority}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="flex items-center gap-2">
                                                <span 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: colors[priority] }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{priority}</span>
                                            </span>
                                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{ 
                                                    width: `${percentage}%`,
                                                    backgroundColor: colors[priority] 
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
                
                {/* Module Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets by SAP Module</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {moduleDistribution.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No module data available</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {moduleDistribution.map(({ module, count, percentage }) => (
                                    <Link
                                        key={module}
                                        href={`/tickets?module=${module}`}
                                        className="p-3 rounded-lg border border-gray-200 hover:border-[#D04A02] hover:bg-gray-50 transition-all"
                                    >
                                        <div className="text-2xl font-bold text-gray-900">{count}</div>
                                        <div className="text-sm font-medium text-gray-700">{module}</div>
                                        <div className="text-xs text-gray-500">{percentage}% of total</div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Assignee Workload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assignee Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {workloadReport.map((assignee) => (
                                <div 
                                    key={assignee.assignee}
                                    className="p-3 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{assignee.assignee}</span>
                                        <span className="text-sm text-gray-500">{assignee.total} tickets</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            Open: {assignee.open}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            In Progress: {assignee.inProgress}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Done: {assignee.completed}
                                        </span>
                                        {assignee.overdue > 0 && (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                Overdue: {assignee.overdue}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Completion rate: {assignee.completionRate}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
