-- Insert demo user
INSERT INTO "users" ("id", "email", "name", "password_hash", "role") 
VALUES (
  gen_random_uuid(),
  'demo@example.com',
  'Demo User',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'user'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample buyer leads
WITH demo_user AS (
  SELECT id FROM users WHERE email = 'demo@example.com' LIMIT 1
)
INSERT INTO "buyers" (
  "full_name", "email", "phone", "city", "property_type", "bhk", 
  "purpose", "budget_min", "budget_max", "timeline", "source", 
  "status", "notes", "tags", "owner_id"
) 
SELECT 
  'Rajesh Kumar', 'rajesh@example.com', '9876543210', 'Chandigarh', 'Apartment', '3',
  'Buy', 5000000, 7000000, '3-6m', 'Website', 'New', 
  'Looking for a 3BHK apartment in Sector 22', '["urgent", "family"]'::jsonb, demo_user.id
FROM demo_user
UNION ALL
SELECT 
  'Priya Sharma', 'priya@example.com', '9876543211', 'Mohali', 'Villa', '4',
  'Buy', 8000000, 12000000, '0-3m', 'Referral', 'Qualified', 
  'Interested in independent villa with garden', '["premium", "garden"]'::jsonb, demo_user.id
FROM demo_user
UNION ALL
SELECT 
  'Amit Singh', 'amit@example.com', '9876543212', 'Zirakpur', 'Plot', NULL,
  'Buy', 2000000, 3000000, '>6m', 'Walk-in', 'Contacted', 
  'Looking for residential plot for future construction', '["investment"]'::jsonb, demo_user.id
FROM demo_user
UNION ALL
SELECT 
  'Neha Gupta', 'neha@example.com', '9876543213', 'Panchkula', 'Apartment', '2',
  'Rent', 25000, 35000, '0-3m', 'Call', 'Visited', 
  'Young professional looking for 2BHK rental', '["professional", "furnished"]'::jsonb, demo_user.id
FROM demo_user
UNION ALL
SELECT 
  'Vikram Mehta', NULL, '9876543214', 'Chandigarh', 'Office', NULL,
  'Buy', 15000000, 20000000, '3-6m', 'Website', 'Negotiation', 
  'Business owner looking for commercial space', '["commercial", "business"]'::jsonb, demo_user.id
FROM demo_user;
