-- ============================================
-- SEED DATA - Development/Testing Data
-- ============================================

-- Insert a system user (for auto-created tickets)
INSERT INTO users (azure_id, email, name, department, is_active, is_admin) VALUES
('system-bot-001', 'system@sap-ticket-bot.local', 'SAP Ticket Bot', 'IT Support', TRUE, FALSE);

-- Insert sample users (for testing)
INSERT INTO users (azure_id, email, name, department, is_active, is_admin) VALUES
('test-user-001', 'admin@example.com', 'Admin User', 'IT Administration', TRUE, TRUE),
('test-user-002', 'john.doe@example.com', 'John Doe', 'SAP MM Team', TRUE, FALSE),
('test-user-003', 'jane.smith@example.com', 'Jane Smith', 'SAP SD Team', TRUE, FALSE),
('test-user-004', 'mike.wilson@example.com', 'Mike Wilson', 'SAP FICO Team', TRUE, FALSE);


-- Insert sample tickets
INSERT INTO tickets (ticket_id, title, description, status, priority, category, created_by, assigned_to) VALUES
('T-001', 'Purchase Order not posting correctly', 
 'Getting error when trying to post PO 4500001234. Error message: "Material 100001 not found in plant 1000".',
 'Open', 'High', 'MM', 2, 2),
 
('T-002', 'Sales Order pricing issue', 
 'Customer ABC Corp is being charged incorrect pricing on SO 1234567. Should be getting 10% discount but system shows 5%.',
 'In Progress', 'Medium', 'SD', 3, 3),
 
('T-003', 'GL Account reconciliation discrepancy', 
 'There is a $5,000 variance between sub-ledger and GL for account 400000. Need to investigate transactions from last month.',
 'Awaiting Info', 'High', 'FICO', 4, 4),
 
('T-004', 'MRP run showing incorrect requirements', 
 'MRP is calculating wrong requirements for finished goods. Stock levels are not being considered properly.',
 'Open', 'Critical', 'PP', 2, NULL),
 
('T-005', 'User authorization issue', 
 'User JSMITH cannot access transaction ME21N. Getting authorization error even though role Z_MM_BUYER is assigned.',
 'Resolved', 'Medium', 'BASIS', 3, 2);


-- Insert sample ticket logs
INSERT INTO ticket_logs (ticket_id, user_id, log_type, action) VALUES
(1, 2, 'created', 'Ticket T-001 created'),
(2, 3, 'created', 'Ticket T-002 created'),
(2, 3, 'status_change', 'Status changed from Open to In Progress'),
(3, 4, 'created', 'Ticket T-003 created'),
(3, 4, 'status_change', 'Status changed from Open to Awaiting Info'),
(4, 2, 'created', 'Ticket T-004 created'),
(5, 3, 'created', 'Ticket T-005 created'),
(5, 2, 'status_change', 'Status changed from Open to Resolved');


-- Insert sample comments
INSERT INTO ticket_comments (ticket_id, author_id, content, is_internal) VALUES
(1, 2, 'I have checked the material master and the material does exist. Investigating further.', FALSE),
(1, 2, 'Internal note: Need to check if this is related to recent data migration.', TRUE),
(2, 3, 'Customer has confirmed they should receive the 10% discount. Checking pricing condition records.', FALSE),
(3, 4, 'Sent email to accounting team requesting transaction details for the period.', FALSE),
(5, 2, 'Added missing authorization object S_TCODE. Issue is now resolved.', FALSE);


-- Insert sample email sources
INSERT INTO email_sources (message_id, from_address, to_address, subject, body_text, received_at, processed_at, is_sap_related, detected_category, ticket_created_id) VALUES
('msg-001', 'user@company.com', 'support@example.com', 
 'SAP MM Issue - Purchase Order Error',
 'We are experiencing issues with purchase order processing. The system is showing error messages when trying to create new POs.',
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', TRUE, 'MM', 1),
 
('msg-002', 'sales@company.com', 'support@example.com',
 'SD Pricing Problem',
 'Our customer is complaining about incorrect pricing on their orders. Can someone look into this?',
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', TRUE, 'SD', 2);
