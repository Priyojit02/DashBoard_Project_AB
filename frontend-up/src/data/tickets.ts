// ============================================
// INITIAL MOCK DATA - Matching frontend/src/data/data.js
// ============================================

import { Ticket, DBUser, AdminUser } from '@/types';

export const initialTickets: Ticket[] = [
    {
        id: 1,
        title: "Fix login page bug",
        description: "Users are unable to login using Google SSO. Getting a 403 error on the callback.",
        status: "Open",
        priority: "High",
        assignedTo: "Alice Johnson",
        raisedBy: "John Smith",
        completionBy: "2025-01-10",
        createdOn: "2025-01-02",
        closedOn: null,
        logs: [
            { id: 1, action: "ticket_created", performedBy: "John Smith", timestamp: "2025-01-02T09:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-02T09:01:00", details: "Ticket assigned to Alice Johnson" },
            { id: 3, action: "comment_added", performedBy: "Alice Johnson", timestamp: "2025-01-02T10:30:00", details: "Comment added" },
            { id: 4, action: "comment_added", performedBy: "John Smith", timestamp: "2025-01-02T11:00:00", details: "Comment added" }
        ],
        comments: [
            { id: 1, author: "John Smith", role: "raiser", message: "Users are unable to login using Google SSO. Getting a 403 error.", timestamp: "2025-01-02T09:00:00" },
            { id: 2, author: "Alice Johnson", role: "assignee", message: "I'm looking into this. Can you confirm which browser you're using?", timestamp: "2025-01-02T10:30:00" },
            { id: 3, author: "John Smith", role: "raiser", message: "Chrome version 120.0.6099.130. Also tested on Firefox, same issue.", timestamp: "2025-01-02T11:00:00" }
        ]
    },
    {
        id: 2,
        title: "Update dashboard layout",
        description: "The dashboard needs a refresh. Current layout is cluttered and hard to navigate.",
        status: "In Progress",
        priority: "Medium",
        assignedTo: "Bob Smith",
        raisedBy: "Sarah Davis",
        completionBy: "2025-01-15",
        createdOn: "2025-01-03",
        closedOn: null,
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Sarah Davis", timestamp: "2025-01-03T11:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-03T11:01:00", details: "Ticket assigned to Bob Smith" },
            { id: 3, action: "status_changed", performedBy: "Bob Smith", timestamp: "2025-01-04T09:00:00", details: "Status changed from Open to In Progress" },
            { id: 4, action: "comment_added", performedBy: "Bob Smith", timestamp: "2025-01-04T09:05:00", details: "Comment added" }
        ],
        comments: [
            { id: 1, author: "Sarah Davis", role: "raiser", message: "The dashboard needs a refresh. Current layout is cluttered and hard to navigate.", timestamp: "2025-01-03T11:00:00" },
            { id: 2, author: "Bob Smith", role: "assignee", message: "Got it. I've reviewed the requirements. Will start with the sidebar reorganization.", timestamp: "2025-01-04T09:05:00" },
            { id: 3, author: "Bob Smith", role: "assignee", message: "Sidebar changes done. Moving to the main content area now.", timestamp: "2025-01-05T16:00:00" }
        ]
    },
    {
        id: 3,
        title: "Prepare PwC color theme",
        description: "Implement the official PwC brand colors across the application.",
        status: "Completed",
        priority: "Medium",
        assignedTo: "Charlie Brown",
        raisedBy: "Mike Johnson",
        completionBy: "2024-12-30",
        createdOn: "2024-12-15",
        closedOn: "2024-12-28",
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Mike Johnson", timestamp: "2024-12-15T10:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2024-12-15T10:01:00", details: "Ticket assigned to Charlie Brown" },
            { id: 3, action: "status_changed", performedBy: "Charlie Brown", timestamp: "2024-12-16T08:00:00", details: "Status changed from Open to In Progress" },
            { id: 4, action: "comment_added", performedBy: "Charlie Brown", timestamp: "2024-12-20T14:00:00", details: "Comment added" },
            { id: 5, action: "status_changed", performedBy: "Charlie Brown", timestamp: "2024-12-28T11:00:00", details: "Status changed from In Progress to Completed" },
            { id: 6, action: "ticket_closed", performedBy: "Charlie Brown", timestamp: "2024-12-28T11:00:00", details: "Ticket closed" }
        ],
        comments: [
            { id: 1, author: "Mike Johnson", role: "raiser", message: "We need to implement PwC brand colors. Please refer to the brand guidelines.", timestamp: "2024-12-15T10:00:00" },
            { id: 2, author: "Charlie Brown", role: "assignee", message: "Starting work on this. Will update the CSS variables first.", timestamp: "2024-12-16T08:00:00" },
            { id: 3, author: "Charlie Brown", role: "assignee", message: "Color theme implemented. Primary: #D04A02, Secondary: #2D2D2D. Please review.", timestamp: "2024-12-20T14:00:00" },
            { id: 4, author: "Mike Johnson", role: "raiser", message: "Looks great! Approved.", timestamp: "2024-12-28T10:00:00" },
            { id: 5, author: "Charlie Brown", role: "assignee", message: "Thanks! Closing this ticket.", timestamp: "2024-12-28T11:00:00" }
        ]
    },
    {
        id: 4,
        title: "Database performance review",
        description: "Query response times have increased significantly. Some queries taking 10+ seconds.",
        status: "Open",
        priority: "High",
        assignedTo: "Dana White",
        raisedBy: "Tech Lead",
        completionBy: "2025-02-01",
        createdOn: "2025-01-05",
        closedOn: null,
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Tech Lead", timestamp: "2025-01-05T08:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-05T08:01:00", details: "Ticket assigned to Dana White" }
        ],
        comments: [
            { id: 1, author: "Tech Lead", role: "raiser", message: "Query response times have increased significantly. Need a full performance review.", timestamp: "2025-01-05T08:00:00" },
            { id: 2, author: "Dana White", role: "assignee", message: "I'll analyze the slow query logs and identify bottlenecks.", timestamp: "2025-01-05T09:30:00" }
        ]
    },
    {
        id: 5,
        title: "API integration testing",
        description: "Complete integration testing for the new payment gateway API.",
        status: "In Progress",
        priority: "High",
        assignedTo: "Alice Johnson",
        raisedBy: "Product Manager",
        completionBy: "2025-01-20",
        createdOn: "2025-01-06",
        closedOn: null,
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Product Manager", timestamp: "2025-01-06T10:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-06T10:01:00", details: "Ticket assigned to Alice Johnson" },
            { id: 3, action: "status_changed", performedBy: "Alice Johnson", timestamp: "2025-01-07T09:00:00", details: "Status changed from Open to In Progress" }
        ],
        comments: [
            { id: 1, author: "Product Manager", role: "raiser", message: "We need to complete integration testing for the new payment gateway before launch.", timestamp: "2025-01-06T10:00:00" },
            { id: 2, author: "Alice Johnson", role: "assignee", message: "Starting the test cases. Will cover all edge cases.", timestamp: "2025-01-07T09:00:00" },
            { id: 3, author: "Alice Johnson", role: "assignee", message: "50% of test cases completed. Found 2 minor issues, documenting them.", timestamp: "2025-01-08T15:00:00" }
        ]
    },
    {
        id: 6,
        title: "Security audit",
        description: "Conduct a comprehensive security audit of the application.",
        status: "Completed",
        priority: "Critical",
        assignedTo: "Bob Smith",
        raisedBy: "Security Team",
        completionBy: "2025-02-15",
        createdOn: "2024-12-20",
        closedOn: "2025-01-08",
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Security Team", timestamp: "2024-12-20T09:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2024-12-20T09:01:00", details: "Ticket assigned to Bob Smith" },
            { id: 3, action: "status_changed", performedBy: "Bob Smith", timestamp: "2024-12-21T08:00:00", details: "Status changed from Open to In Progress" },
            { id: 4, action: "status_changed", performedBy: "Bob Smith", timestamp: "2025-01-08T16:00:00", details: "Status changed from In Progress to Completed" },
            { id: 5, action: "ticket_closed", performedBy: "Bob Smith", timestamp: "2025-01-08T16:00:00", details: "Ticket closed" }
        ],
        comments: [
            { id: 1, author: "Security Team", role: "raiser", message: "We need a comprehensive security audit. Focus on authentication and data encryption.", timestamp: "2024-12-20T09:00:00" },
            { id: 2, author: "Bob Smith", role: "assignee", message: "Starting the audit. Will use OWASP guidelines.", timestamp: "2024-12-21T08:00:00" },
            { id: 3, author: "Bob Smith", role: "assignee", message: "Found XSS vulnerability in comment input. Implementing fix.", timestamp: "2024-12-28T11:00:00" },
            { id: 4, author: "Bob Smith", role: "assignee", message: "All vulnerabilities patched. Audit complete. Report attached.", timestamp: "2025-01-08T16:00:00" },
            { id: 5, author: "Security Team", role: "raiser", message: "Great work! Approved and closing.", timestamp: "2025-01-08T16:30:00" }
        ]
    },
    {
        id: 7,
        title: "MM Material Master Data Cleanup",
        description: "Clean up obsolete material master records in MM module.",
        status: "Open",
        priority: "Medium",
        assignedTo: "Alice Johnson",
        raisedBy: "SAP Admin",
        completionBy: "2025-01-25",
        createdOn: "2025-01-04",
        closedOn: null,
        module: "MM",
        logs: [
            { id: 1, action: "ticket_created", performedBy: "SAP Admin", timestamp: "2025-01-04T10:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-04T10:01:00", details: "Ticket assigned to Alice Johnson" }
        ],
        comments: [
            { id: 1, author: "SAP Admin", role: "raiser", message: "We have 500+ obsolete material records that need archiving.", timestamp: "2025-01-04T10:00:00" }
        ]
    },
    {
        id: 8,
        title: "FICO Cost Center Report Error",
        description: "Cost center report showing incorrect values for Q4 2024.",
        status: "In Progress",
        priority: "Critical",
        assignedTo: "Dana White",
        raisedBy: "Finance Team",
        completionBy: "2025-01-12",
        createdOn: "2025-01-05",
        closedOn: null,
        module: "FICO",
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Finance Team", timestamp: "2025-01-05T14:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-05T14:01:00", details: "Ticket assigned to Dana White" },
            { id: 3, action: "status_changed", performedBy: "Dana White", timestamp: "2025-01-05T15:00:00", details: "Status changed to In Progress" }
        ],
        comments: [
            { id: 1, author: "Finance Team", role: "raiser", message: "Urgent: Cost center report variance of $50K detected.", timestamp: "2025-01-05T14:00:00" },
            { id: 2, author: "Dana White", role: "assignee", message: "Investigating. Seems to be a posting date issue.", timestamp: "2025-01-05T15:00:00" }
        ]
    },
    {
        id: 9,
        title: "PP Production Order BOM Issue",
        description: "BOM explosion not picking up latest component changes.",
        status: "Open",
        priority: "High",
        assignedTo: "Bob Smith",
        raisedBy: "Production Manager",
        completionBy: "2025-01-18",
        createdOn: "2025-01-06",
        closedOn: null,
        module: "PP",
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Production Manager", timestamp: "2025-01-06T08:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2025-01-06T08:01:00", details: "Ticket assigned to Bob Smith" }
        ],
        comments: [
            { id: 1, author: "Production Manager", role: "raiser", message: "BOM changes made yesterday not reflecting in production orders.", timestamp: "2025-01-06T08:00:00" }
        ]
    },
    {
        id: 10,
        title: "SD Pricing Condition Record Update",
        description: "Update pricing conditions for new fiscal year 2025.",
        status: "Completed",
        priority: "Medium",
        assignedTo: "Charlie Brown",
        raisedBy: "Sales Team",
        completionBy: "2025-01-05",
        createdOn: "2024-12-28",
        closedOn: "2025-01-04",
        module: "SD",
        logs: [
            { id: 1, action: "ticket_created", performedBy: "Sales Team", timestamp: "2024-12-28T09:00:00", details: "Ticket created" },
            { id: 2, action: "assigned", performedBy: "System", timestamp: "2024-12-28T09:01:00", details: "Ticket assigned to Charlie Brown" },
            { id: 3, action: "status_changed", performedBy: "Charlie Brown", timestamp: "2024-12-30T10:00:00", details: "Status changed to In Progress" },
            { id: 4, action: "status_changed", performedBy: "Charlie Brown", timestamp: "2025-01-04T16:00:00", details: "Status changed to Completed" }
        ],
        comments: [
            { id: 1, author: "Sales Team", role: "raiser", message: "Need to update 200+ pricing condition records for 2025.", timestamp: "2024-12-28T09:00:00" },
            { id: 2, author: "Charlie Brown", role: "assignee", message: "All conditions updated. Please verify.", timestamp: "2025-01-04T16:00:00" }
        ]
    }
];

// Mock DB Users
export const initialDBUsers: DBUser[] = [
    {
        id: "user-1",
        email: "alice.johnson@pwc.com",
        name: "Alice Johnson",
        lastLogin: new Date("2025-01-06T09:00:00"),
        isActive: true,
        isAdmin: true
    },
    {
        id: "user-2",
        email: "bob.smith@pwc.com",
        name: "Bob Smith",
        lastLogin: new Date("2025-01-06T08:30:00"),
        isActive: true,
        isAdmin: false
    },
    {
        id: "user-3",
        email: "charlie.brown@pwc.com",
        name: "Charlie Brown",
        lastLogin: new Date("2025-01-05T16:00:00"),
        isActive: true,
        isAdmin: false
    },
    {
        id: "user-4",
        email: "dana.white@pwc.com",
        name: "Dana White",
        lastLogin: new Date("2025-01-06T10:15:00"),
        isActive: true,
        isAdmin: false
    }
];

// Mutable copy for API routes
export let mockTickets: Ticket[] = [...initialTickets];

// Mock Admin Users
export const initialAdmins: AdminUser[] = [
    {
        id: "user-1",
        email: "alice.johnson@pwc.com",
        name: "Alice Johnson",
        isAdmin: true,
        addedBy: "System",
        addedAt: new Date("2024-01-01T00:00:00")
    }
];
