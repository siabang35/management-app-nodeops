-- ===========================================
-- Insert sample mindshare users with real web3 data
-- ===========================================
INSERT INTO mindshare_users (
  user_id,
  wallet_address,
  email,
  x_handle,
  telegram_id,
  discord_id,
  discord_username,
  discord_invite_link,
  promo_code,
  profile_bio,
  mindshare_score,
  is_verified
)
SELECT 
  users.id,
  '0x' || substring(md5(users.email::text) from 1 for 40) AS wallet_address,
  users.email,
  '@' || lower(substring(users.full_name from 1 for 1)) || 
  lower(substring(users.full_name from position(' ' in users.full_name) + 1)) AS x_handle,
  FLOOR(random() * 1000000000)::text AS telegram_id,
  FLOOR(random() * 1000000000000)::text AS discord_id,
  lower(replace(users.full_name, ' ', '_')) || FLOOR(random() * 1000)::text AS discord_username,
  'https://discord.gg/' || substring(md5(random()::text) from 1 for 8) AS discord_invite_link,
  'NODEOPS' || FLOOR(random() * 100000)::text AS promo_code,
  'Active contributor in NodeOps community | Web3 enthusiast' AS profile_bio,
  FLOOR(random() * 10000 + 1000)::numeric(15,2) AS mindshare_score,
  random() > 0.5 AS is_verified
FROM users
LIMIT 30
ON CONFLICT (user_id) DO NOTHING;


-- ===========================================
-- Insert mindshare activities
-- ===========================================
INSERT INTO mindshare_activities (
  mindshare_user_id,
  activity_type,
  activity_description,
  points_earned,
  metadata
)
SELECT 
  mu.id,
  (ARRAY['share', 'engagement', 'referral', 'task_completion'])[floor(random() * 4 + 1)::int],
  'Activity completed successfully',
  (ARRAY[50, 100, 150, 200, 250])[floor(random() * 5 + 1)::int]::numeric,
  jsonb_build_object(
    'platform', (ARRAY['twitter', 'discord', 'telegram'])[floor(random() * 3 + 1)::int],
    'timestamp', NOW(),
    'verified', random() > 0.5
  )
FROM mindshare_users mu
LIMIT 100;


-- ===========================================
-- Insert sample referrals
-- ===========================================
INSERT INTO mindshare_referrals (
  referrer_id,
  referred_user_id,
  promo_code_used,
  referral_status,
  bonus_points_awarded
)
SELECT 
  (SELECT id FROM mindshare_users 
    LIMIT 1 
    OFFSET floor(random() * GREATEST((SELECT COUNT(*) FROM mindshare_users) - 1, 0))::int),
  (SELECT id FROM mindshare_users 
    LIMIT 1 
    OFFSET floor(random() * GREATEST((SELECT COUNT(*) FROM mindshare_users) - 1, 0))::int),
  (SELECT promo_code FROM mindshare_users 
    LIMIT 1 
    OFFSET floor(random() * GREATEST((SELECT COUNT(*) FROM mindshare_users) - 1, 0))::int),
  (ARRAY['pending', 'completed', 'claimed'])[floor(random() * 3 + 1)::int],
  (ARRAY[100, 250, 500])[floor(random() * 3 + 1)::int]::numeric
LIMIT 50;


-- ===========================================
-- Populate leaderboard (top 25)
-- ===========================================
INSERT INTO mindshare_leaderboard (
  mindshare_user_id,
  current_rank,
  mindshare_score,
  period
)
SELECT 
  id,
  ROW_NUMBER() OVER (ORDER BY mindshare_score DESC),
  mindshare_score,
  'all_time'
FROM mindshare_users
ORDER BY mindshare_score DESC
LIMIT 25;
