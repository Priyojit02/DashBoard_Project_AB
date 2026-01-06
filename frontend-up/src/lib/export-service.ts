// ============================================
// EXPORT SERVICE - Excel/CSV Export Functionality
// ============================================

import { Ticket } from '@/types';
import { formatDate } from './utils';

// Dynamic import for xlsx
async function getXLSX() {
    const XLSX = await import('xlsx');
    return XLSX;
}

/**
 * Export tickets to Excel (.xlsx)
 */
export async function exportToExcel(
    tickets: Ticket[],
    filename: string = 'tickets'
): Promise<void> {
    const XLSX = await getXLSX();
    
    // Prepare data for export
    const exportData = tickets.map(ticket => ({
        'ID': ticket.id,
        'Title': ticket.title,
        'Description': ticket.description,
        'Status': ticket.status,
        'Priority': ticket.priority,
        'Assigned To': ticket.assignedTo,
        'Raised By': ticket.raisedBy,
        'Created On': formatDate(ticket.createdOn),
        'Completion By': formatDate(ticket.completionBy),
        'Module': ticket.module || 'N/A',
        'Tags': ticket.tags?.join(', ') || '',
    }));
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
        { wch: 8 },   // ID
        { wch: 40 },  // Title
        { wch: 60 },  // Description
        { wch: 12 },  // Status
        { wch: 10 },  // Priority
        { wch: 20 },  // Assigned To
        { wch: 20 },  // Raised By
        { wch: 15 },  // Created On
        { wch: 15 },  // Completion By
        { wch: 10 },  // Module
        { wch: 30 },  // Tags
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    
    // Trigger download
    XLSX.writeFile(wb, fullFilename);
}

/**
 * Export tickets to CSV
 */
export function exportToCSV(
    tickets: Ticket[],
    filename: string = 'tickets'
): void {
    // Prepare headers
    const headers = [
        'ID',
        'Title',
        'Description',
        'Status',
        'Priority',
        'Assigned To',
        'Raised By',
        'Created On',
        'Completion By',
        'Module',
        'Tags',
    ];
    
    // Prepare rows
    const rows = tickets.map(ticket => [
        ticket.id.toString(),
        `"${ticket.title.replace(/"/g, '""')}"`,
        `"${ticket.description.replace(/"/g, '""')}"`,
        ticket.status,
        ticket.priority,
        ticket.assignedTo,
        ticket.raisedBy,
        formatDate(ticket.createdOn),
        formatDate(ticket.completionBy),
        ticket.module || 'N/A',
        ticket.tags?.join('; ') || '',
    ]);
    
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, `${filename}_${timestamp}.csv`);
    } else {
        // Other browsers
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${filename}_${timestamp}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Export report data to Excel
 */
export async function exportReportToExcel(
    reportData: {
        summary?: Record<string, unknown>;
        details?: Record<string, unknown>[];
    },
    reportType: string,
    filename: string = 'report'
): Promise<void> {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet if present
    if (reportData.summary) {
        const summaryData = Object.entries(reportData.summary).map(([key, value]) => ({
            'Metric': key,
            'Value': value,
        }));
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    }
    
    // Add details sheet if present
    if (reportData.details && reportData.details.length > 0) {
        const detailsWs = XLSX.utils.json_to_sheet(reportData.details);
        XLSX.utils.book_append_sheet(wb, detailsWs, 'Details');
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${reportType}_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, fullFilename);
}

/**
 * Export analytics data to Excel
 */
export async function exportAnalyticsToExcel(
    analytics: {
        statusSummary: { status: string; count: number }[];
        priorityDistribution: { priority: string; count: number; percentage: number }[];
        moduleDistribution: { module: string; count: number; percentage: number }[];
        assigneeWorkload: {
            assignee: string;
            total: number;
            completed: number;
            completionRate: number;
        }[];
    },
    filename: string = 'analytics'
): Promise<void> {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();
    
    // Status Summary sheet
    if (analytics.statusSummary) {
        const statusWs = XLSX.utils.json_to_sheet(analytics.statusSummary);
        XLSX.utils.book_append_sheet(wb, statusWs, 'Status Summary');
    }
    
    // Priority Distribution sheet
    if (analytics.priorityDistribution) {
        const priorityWs = XLSX.utils.json_to_sheet(analytics.priorityDistribution);
        XLSX.utils.book_append_sheet(wb, priorityWs, 'Priority Distribution');
    }
    
    // Module Distribution sheet
    if (analytics.moduleDistribution) {
        const moduleWs = XLSX.utils.json_to_sheet(analytics.moduleDistribution);
        XLSX.utils.book_append_sheet(wb, moduleWs, 'Module Distribution');
    }
    
    // Assignee Workload sheet
    if (analytics.assigneeWorkload) {
        const workloadWs = XLSX.utils.json_to_sheet(analytics.assigneeWorkload);
        XLSX.utils.book_append_sheet(wb, workloadWs, 'Assignee Workload');
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}

// Add msSaveBlob type declaration for IE compatibility
declare global {
    interface Navigator {
        msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
    }
}
