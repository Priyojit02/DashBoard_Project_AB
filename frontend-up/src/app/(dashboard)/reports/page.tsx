// ============================================
// REPORTS PAGE
// ============================================

'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { useDateRangeReport, useAssigneeWorkload } from '@/hooks/useAnalytics';
import { 
    Button, 
    Input, 
    Select, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent,
    StatusBadge,
    Modal,
    ModalFooter,
} from '@/components/ui';
import { formatDate, getUniqueAssignees } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-service';

export default function ReportsPage() {
    const { tickets, isLoading } = useTickets();
    const [activeTab, setActiveTab] = useState<'date-range' | 'workload'>('date-range');
    
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
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500 mt-1">
                    Generate detailed reports for your tickets
                </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('date-range')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'date-range'
                            ? 'border-[#D04A02] text-[#D04A02]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Date Range Report
                </button>
                <button
                    onClick={() => setActiveTab('workload')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'workload'
                            ? 'border-[#D04A02] text-[#D04A02]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Assignee Workload
                </button>
            </div>
            
            {/* Report Content */}
            {activeTab === 'date-range' && <DateRangeReport tickets={tickets} />}
            {activeTab === 'workload' && <AssigneeWorkloadReport tickets={tickets} />}
        </div>
    );
}

// ============================================
// DATE RANGE REPORT COMPONENT
// ============================================

interface DateRangeReportProps {
    tickets: ReturnType<typeof useTickets>['tickets'];
}

function DateRangeReport({ tickets }: DateRangeReportProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { dateRange, reportData, updateDateRange } = useDateRangeReport(tickets);
    const [isExporting, setIsExporting] = useState(false);
    
    const handleGenerateReport = () => {
        if (startDate && endDate) {
            updateDateRange(startDate, endDate);
        }
    };
    
    const handleExport = async () => {
        if (!reportData) return;
        setIsExporting(true);
        try {
            await exportToExcel(
                [...reportData.ticketsCreated, ...reportData.ticketsClosed],
                `date_range_report_${startDate}_to_${endDate}`
            );
        } finally {
            setIsExporting(false);
        }
    };
    
    return (
        <div className="space-y-6">
            {/* Date Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleGenerateReport} disabled={!startDate || !endDate}>
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Report Results */}
            {reportData && (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Tickets Created</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-1">
                                        {reportData.totalCreated}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Tickets Closed</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">
                                        {reportData.totalClosed}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    {/* Export Button */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            isLoading={isExporting}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export to Excel
                        </Button>
                    </div>
                    
                    {/* Ticket Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Created Tickets */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tickets Created ({reportData.totalCreated})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reportData.ticketsCreated.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No tickets created in this period
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {reportData.ticketsCreated.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="p-3 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        #{ticket.id}
                                                    </span>
                                                    <StatusBadge status={ticket.status} size="sm" />
                                                </div>
                                                <p className="font-medium text-gray-900 mt-1 truncate">
                                                    {ticket.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Created: {formatDate(ticket.createdOn)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Closed Tickets */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tickets Closed ({reportData.totalClosed})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reportData.ticketsClosed.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No tickets closed in this period
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {reportData.ticketsClosed.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="p-3 rounded-lg border border-green-200 bg-green-50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        #{ticket.id}
                                                    </span>
                                                    <StatusBadge status={ticket.status} size="sm" />
                                                </div>
                                                <p className="font-medium text-gray-900 mt-1 truncate">
                                                    {ticket.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Closed: {formatDate(ticket.closedOn)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================
// ASSIGNEE WORKLOAD REPORT COMPONENT
// ============================================

interface AssigneeWorkloadReportProps {
    tickets: ReturnType<typeof useTickets>['tickets'];
}

function AssigneeWorkloadReport({ tickets }: AssigneeWorkloadReportProps) {
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const { workloadReport, selectedWorkload, assigneeTickets } = useAssigneeWorkload(
        tickets,
        selectedAssignee
    );
    const [showModal, setShowModal] = useState(false);
    
    const assignees = getUniqueAssignees(tickets);
    const assigneeOptions = [
        { value: '', label: 'Select Assignee' },
        ...assignees.map(a => ({ value: a, label: a })),
    ];
    
    const handleViewDetails = (assignee: string) => {
        setSelectedAssignee(assignee);
        setShowModal(true);
    };
    
    return (
        <div className="space-y-6">
            {/* Assignee Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Assignee</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Select
                            options={assigneeOptions}
                            value={selectedAssignee}
                            onChange={(e) => setSelectedAssignee(e.target.value)}
                            placeholder="Select an assignee"
                        />
                    </div>
                </CardContent>
            </Card>
            
            {/* Workload Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Workload Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workloadReport.map((assignee) => (
                            <div
                                key={assignee.assignee}
                                className="p-4 rounded-lg border border-gray-200 hover:border-[#D04A02] hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => handleViewDetails(assignee.assignee)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {assignee.assignee}
                                    </h3>
                                    <span className="text-xl font-bold text-[#D04A02]">
                                        {assignee.total}
                                    </span>
                                </div>
                                
                                {/* Mini Progress Bars */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span className="text-xs text-gray-500 flex-1">Open</span>
                                        <span className="text-xs font-medium">{assignee.open}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                        <span className="text-xs text-gray-500 flex-1">In Progress</span>
                                        <span className="text-xs font-medium">{assignee.inProgress}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-xs text-gray-500 flex-1">Completed</span>
                                        <span className="text-xs font-medium">{assignee.completed}</span>
                                    </div>
                                    {assignee.overdue > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            <span className="text-xs text-red-600 flex-1">Overdue</span>
                                            <span className="text-xs font-medium text-red-600">{assignee.overdue}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Completion Rate */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Completion Rate</span>
                                        <span className="font-medium text-green-600">{assignee.completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full transition-all"
                                            style={{ width: `${assignee.completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {/* Detail Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Workload Details - ${selectedAssignee}`}
                size="lg"
            >
                {selectedWorkload && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-blue-50 text-center">
                                <p className="text-2xl font-bold text-blue-600">{selectedWorkload.open}</p>
                                <p className="text-xs text-blue-700">Open</p>
                            </div>
                            <div className="p-3 rounded-lg bg-yellow-50 text-center">
                                <p className="text-2xl font-bold text-yellow-600">{selectedWorkload.inProgress}</p>
                                <p className="text-xs text-yellow-700">In Progress</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 text-center">
                                <p className="text-2xl font-bold text-green-600">{selectedWorkload.completed}</p>
                                <p className="text-xs text-green-700">Completed</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-50 text-center">
                                <p className="text-2xl font-bold text-red-600">{selectedWorkload.overdue}</p>
                                <p className="text-xs text-red-700">Overdue</p>
                            </div>
                        </div>
                        
                        {/* Ticket List */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                                Assigned Tickets ({assigneeTickets.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {assigneeTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500 font-mono">#{ticket.id}</p>
                                            <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                                        </div>
                                        <StatusBadge status={ticket.status} size="sm" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <ModalFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
