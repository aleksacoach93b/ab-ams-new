-- Debug avatar upload issue
-- Run this in Supabase SQL Editor to test player update

-- Check if player exists
SELECT id, name, "imageUrl" FROM "Player" WHERE id = 'cmgx8s4on0004js04xuupniro';

-- Test updating player with base64 image
UPDATE "Player" 
SET "imageUrl" = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
WHERE id = 'cmgx8s4on0004js04xuupniro';

-- Check if update was successful
SELECT id, name, "imageUrl" FROM "Player" WHERE id = 'cmgx8s4on0004js04xuupniro';
