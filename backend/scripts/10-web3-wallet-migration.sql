-- ===========================================
-- Web3 Wallet Migration Script
-- Migrate existing wallet_address from mindshare_users to user_wallets
-- ===========================================

-- Migrate existing wallet addresses to user_wallets table
INSERT INTO user_wallets (
  user_id,
  mindshare_user_id,
  wallet_address,
  wallet_provider,
  chain_id,
  network_name,
  is_primary,
  is_verified,
  connected_at
)
SELECT
  mu.user_id,
  mu.id as mindshare_user_id,
  mu.wallet_address,
  'legacy' as wallet_provider,
  1 as chain_id,
  'ethereum' as network_name,
  TRUE as is_primary,
  mu.is_verified,
  mu.created_at as connected_at
FROM mindshare_users mu
WHERE mu.wallet_address IS NOT NULL
  AND mu.wallet_address != ''
  AND NOT EXISTS (
    SELECT 1 FROM user_wallets uw
    WHERE uw.mindshare_user_id = mu.id
    AND uw.wallet_address = mu.wallet_address
  );

-- Create ambassador program entries for existing mindshare users
INSERT INTO ambassador_program (
  mindshare_user_id,
  ambassador_level,
  total_referrals,
  is_active,
  joined_at
)
SELECT
  mu.id,
  CASE
    WHEN mu.mindshare_score >= 50000 THEN 'platinum'
    WHEN mu.mindshare_score >= 25000 THEN 'gold'
    WHEN mu.mindshare_score >= 10000 THEN 'silver'
    ELSE 'bronze'
  END as ambassador_level,
  COALESCE((SELECT COUNT(*) FROM mindshare_referrals mr WHERE mr.referrer_id = mu.id), 0) as total_referrals,
  TRUE as is_active,
  mu.created_at as joined_at
FROM mindshare_users mu
WHERE NOT EXISTS (
  SELECT 1 FROM ambassador_program ap WHERE ap.mindshare_user_id = mu.id
);

-- Migrate existing referrals to ambassador_referrals
INSERT INTO ambassador_referrals (
  ambassador_id,
  referred_user_id,
  referral_code,
  referral_status,
  reward_earned,
  created_at,
  completed_at
)
SELECT
  ap.id as ambassador_id,
  mr.referred_user_id,
  mr.promo_code_used as referral_code,
  CASE
    WHEN mr.referral_status = 'completed' THEN 'completed'
    WHEN mr.referral_status = 'claimed' THEN 'completed'
    ELSE 'pending'
  END as referral_status,
  mr.bonus_points_awarded as reward_earned,
  mr.created_at,
  CASE
    WHEN mr.referral_status IN ('completed', 'claimed') THEN mr.created_at
    ELSE NULL
  END as completed_at
FROM mindshare_referrals mr
JOIN ambassador_program ap ON ap.mindshare_user_id = mr.referrer_id
WHERE NOT EXISTS (
  SELECT 1 FROM ambassador_referrals ar
  WHERE ar.referral_code = mr.promo_code_used
);

-- Migrate existing activities to ambassador_activities
INSERT INTO ambassador_activities (
  ambassador_id,
  wallet_address,
  activity_type,
  activity_description,
  points_earned,
  metadata,
  verified,
  created_at
)
SELECT
  ap.id as ambassador_id,
  COALESCE(uw.wallet_address, 'unknown') as wallet_address,
  ma.activity_type,
  ma.activity_description,
  ma.points_earned,
  ma.metadata,
  COALESCE((ma.metadata->>'verified')::boolean, FALSE) as verified,
  ma.created_at
FROM mindshare_activities ma
JOIN ambassador_program ap ON ap.mindshare_user_id = ma.mindshare_user_id
LEFT JOIN user_wallets uw ON uw.mindshare_user_id = ma.mindshare_user_id AND uw.is_primary = TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM ambassador_activities aa
  WHERE aa.ambassador_id = ap.id
  AND aa.created_at = ma.created_at
  AND aa.activity_type = ma.activity_type
);

-- Update ambassador program stats
UPDATE ambassador_program
SET
  total_referrals = (
    SELECT COUNT(*) FROM ambassador_referrals ar WHERE ar.ambassador_id = ambassador_program.id
  ),
  active_referrals = (
    SELECT COUNT(*) FROM ambassador_referrals ar
    WHERE ar.ambassador_id = ambassador_program.id AND ar.referral_status = 'completed'
  ),
  total_rewards_earned = (
    SELECT COALESCE(SUM(ar.reward_earned), 0) FROM ambassador_referrals ar
    WHERE ar.ambassador_id = ambassador_program.id AND ar.referral_status = 'completed'
  ),
  last_activity_at = (
    SELECT MAX(aa.created_at) FROM ambassador_activities aa WHERE aa.ambassador_id = ambassador_program.id
  );

-- Now we can safely remove wallet_address from mindshare_users
-- (keeping this commented out for safety - run manually after verification)
-- ALTER TABLE mindshare_users DROP COLUMN IF EXISTS wallet_address;
