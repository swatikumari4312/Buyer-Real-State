-- Test script to validate database constraints and sample data

-- Test 1: Verify enum constraints
DO $$
BEGIN
    -- Test valid city enum
    INSERT INTO buyers (full_name, phone, city, property_type, purpose, timeline, source, owner_id)
    SELECT 'Test User', '1234567890', 'Chandigarh', 'Apartment', 'Buy', '0-3m', 'Website', id
    FROM users LIMIT 1;
    
    -- Clean up test data
    DELETE FROM buyers WHERE full_name = 'Test User';
    
    RAISE NOTICE 'Enum constraints test passed';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Enum constraints test failed: %', SQLERRM;
END $$;

-- Test 2: Verify foreign key constraints
DO $$
BEGIN
    -- This should fail due to invalid owner_id
    BEGIN
        INSERT INTO buyers (full_name, phone, city, property_type, purpose, timeline, source, owner_id)
        VALUES ('Test User', '1234567890', 'Chandigarh', 'Apartment', 'Buy', '0-3m', 'Website', gen_random_uuid());
        
        RAISE EXCEPTION 'Foreign key constraint test failed - invalid insert succeeded';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'Foreign key constraint test passed';
    END;
END $$;

-- Test 3: Verify sample data exists
DO $$
DECLARE
    user_count INTEGER;
    buyer_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO buyer_count FROM buyers;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'No users found in database';
    END IF;
    
    IF buyer_count = 0 THEN
        RAISE EXCEPTION 'No buyers found in database';
    END IF;
    
    RAISE NOTICE 'Sample data verification passed - Users: %, Buyers: %', user_count, buyer_count;
END $$;

-- Test 4: Verify indexes exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'buyers_owner_id_idx') THEN
        RAISE EXCEPTION 'Missing index: buyers_owner_id_idx';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'buyers_status_idx') THEN
        RAISE EXCEPTION 'Missing index: buyers_status_idx';
    END IF;
    
    RAISE NOTICE 'Database indexes verification passed';
END $$;

RAISE NOTICE 'All database tests completed successfully!';
