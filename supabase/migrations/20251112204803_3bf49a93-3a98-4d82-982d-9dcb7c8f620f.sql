-- Insert sample pages
INSERT INTO pages (id, user_id, title, description, slug, is_published, template, view_count, created_at) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '4da220fa-b3e8-41f8-8f83-446ed47f1e7d', 'Free Marketing Guide 2024', 'Complete guide to digital marketing strategies that actually work', 'marketing-guide-2024', true, 'minimal', 342, NOW() - INTERVAL '7 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '4da220fa-b3e8-41f8-8f83-446ed47f1e7d', 'SEO Checklist', 'Ultimate SEO checklist for 2024 - boost your rankings', 'seo-checklist', true, 'minimal', 189, NOW() - INTERVAL '14 days'),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '4da220fa-b3e8-41f8-8f83-446ed47f1e7d', 'Content Calendar Template', 'Plan your content strategy with this comprehensive template', 'content-calendar', false, 'minimal', 0, NOW() - INTERVAL '2 days');

-- Insert sample resources
INSERT INTO resources (id, user_id, title, description, file_name, file_url, file_type, file_size, created_at) VALUES
('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '4da220fa-b3e8-41f8-8f83-446ed47f1e7d', 'Marketing Guide PDF', 'Comprehensive 50-page marketing guide', 'marketing-guide-2024.pdf', 'https://example.com/sample.pdf', 'application/pdf', 2457600, NOW() - INTERVAL '7 days'),
('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '4da220fa-b3e8-41f8-8f83-446ed47f1e7d', 'SEO Checklist Excel', 'Interactive SEO checklist spreadsheet', 'seo-checklist.xlsx', 'https://example.com/sample.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 1048576, NOW() - INTERVAL '14 days'),
('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', '4da220fa-b3e8-41f8-8f83-446ed47f1e7d', 'Content Calendar Template', 'Google Sheets template for content planning', 'content-calendar.xlsx', 'https://example.com/sample2.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 524288, NOW() - INTERVAL '2 days');

-- Link resources to pages
INSERT INTO page_resources (page_id, resource_id, display_order) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 0),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 0),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 0);

-- Insert sample email captures
INSERT INTO email_captures (page_id, email, full_name, captured_at) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'sarah.johnson@example.com', 'Sarah Johnson', NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'mike.chen@example.com', 'Mike Chen', NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'emma.williams@example.com', 'Emma Williams', NOW() - INTERVAL '4 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'alex.martinez@example.com', 'Alex Martinez', NOW() - INTERVAL '12 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'lisa.brown@example.com', 'Lisa Brown', NOW() - INTERVAL '10 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'david.lee@example.com', 'David Lee', NOW() - INTERVAL '2 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'jessica.taylor@example.com', 'Jessica Taylor', NOW() - INTERVAL '8 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'chris.anderson@example.com', 'Chris Anderson', NOW() - INTERVAL '1 day');

-- Insert sample analytics events (views, signups, downloads)
INSERT INTO analytics_events (page_id, event_type, metadata, created_at) VALUES
-- Marketing Guide views
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'view', '{"source": "organic"}', NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'view', '{"source": "social"}', NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'view', '{"source": "organic"}', NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'view', '{"source": "direct"}', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'view', '{"source": "social"}', NOW() - INTERVAL '1 day'),
-- Marketing Guide signups
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'signup', '{"email": "sarah.johnson@example.com"}', NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'signup', '{"email": "mike.chen@example.com"}', NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'signup', '{"email": "emma.williams@example.com"}', NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'signup', '{"email": "david.lee@example.com"}', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'signup', '{"email": "chris.anderson@example.com"}', NOW() - INTERVAL '1 day'),
-- SEO Checklist views
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'view', '{"source": "organic"}', NOW() - INTERVAL '12 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'view', '{"source": "social"}', NOW() - INTERVAL '10 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'view', '{"source": "organic"}', NOW() - INTERVAL '8 days'),
-- SEO Checklist signups
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'signup', '{"email": "alex.martinez@example.com"}', NOW() - INTERVAL '12 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'signup', '{"email": "lisa.brown@example.com"}', NOW() - INTERVAL '10 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'signup', '{"email": "jessica.taylor@example.com"}', NOW() - INTERVAL '8 days'),
-- Downloads
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'download', '{"resource_id": "d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a"}', NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'download', '{"resource_id": "d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a"}', NOW() - INTERVAL '4 days'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'download', '{"resource_id": "e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b"}', NOW() - INTERVAL '10 days');