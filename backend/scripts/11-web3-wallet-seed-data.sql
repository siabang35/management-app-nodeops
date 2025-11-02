-- ===========================================
-- Web3 Wallet Integration Seed Data (Fixed)
-- ===========================================

-- ✅ Insert sample user wallets for existing users
INSERT INTO user_wallets (
  user_id,
  mindshare_user_id,
  wallet_address,
  wallet_provider,
  chain_id,
  network_name,
  is_primary,
  is_verified
)
SELECT
  t.user_id,
  t.mindshare_user_id,
  t.wallet_address,
  t.wallet_provider,
  t.chain_id,
  CASE
    WHEN t.chain_id = 137 THEN 'polygon'
    WHEN t.chain_id = 56 THEN 'bsc'
    ELSE 'ethereum'
  END AS network_name,
  t.is_primary,
  t.is_verified
FROM (
  SELECT
    u.id AS user_id,
    mu.id AS mindshare_user_id,
    '0x' || substring(md5(u.email::text || 'wallet1') from 1 for 40) AS wallet_address,
    CASE WHEN random() > 0.5 THEN 'metamask' ELSE 'walletconnect' END AS wallet_provider,
    CASE
      WHEN random() > 0.7 THEN 137 -- Polygon
      WHEN random() > 0.4 THEN 56  -- BSC
      ELSE 1 -- Ethereum
    END AS chain_id,
    TRUE AS is_primary,
    random() > 0.3 AS is_verified
  FROM users u
  JOIN mindshare_users mu ON mu.user_id = u.id
  WHERE NOT EXISTS (
    SELECT 1 FROM user_wallets uw WHERE uw.user_id = u.id
  )
  LIMIT 20
) AS t;


-- ✅ Add secondary wallets for some users
INSERT INTO user_wallets (
  user_id,
  mindshare_user_id,
  wallet_address,
  wallet_provider,
  chain_id,
  network_name,
  is_primary,
  is_verified
)
SELECT
  t.user_id,
  t.mindshare_user_id,
  t.wallet_address,
  t.wallet_provider,
  t.chain_id,
  CASE
    WHEN t.chain_id = 137 THEN 'polygon'
    WHEN t.chain_id = 56 THEN 'bsc'
    ELSE 'ethereum'
  END AS network_name,
  FALSE AS is_primary,
  t.is_verified
FROM (
  SELECT
    uw.user_id,
    uw.mindshare_user_id,
    '0x' || substring(md5(uw.wallet_address || 'secondary') from 1 for 40) AS wallet_address,
    CASE WHEN uw.wallet_provider = 'metamask' THEN 'walletconnect' ELSE 'metamask' END AS wallet_provider,
    CASE
      WHEN uw.chain_id = 1 THEN 137
      WHEN uw.chain_id = 137 THEN 56
      ELSE 1
    END AS chain_id,
    random() > 0.5 AS is_verified
  FROM user_wallets uw
  WHERE random() > 0.6
  LIMIT 10
) AS t;


-- ✅ Insert sample ambassador activities with Web3 data
INSERT INTO ambassador_activities (
  ambassador_id,
  wallet_address,
  activity_type,
  activity_description,
  points_earned,
  transaction_hash,
  chain_id,
  contract_address,
  token_amount,
  token_symbol,
  usd_value,
  metadata,
  verified
)
SELECT
  ap.id AS ambassador_id,
  uw.wallet_address,
  activity_type,
  CASE
    WHEN activity_type = 'transaction' THEN 'Token transfer completed'
    WHEN activity_type = 'nft_purchase' THEN 'NFT purchased on marketplace'
    WHEN activity_type = 'defi_interaction' THEN 'DeFi protocol interaction'
    ELSE 'Social media share'
  END AS activity_description,
  (ARRAY[50, 100, 150, 200, 250, 500])[floor(random() * 6 + 1)::int]::numeric AS points_earned,
  '0x' || substring(md5(random()::text) from 1 for 64) AS transaction_hash,
  uw.chain_id,
  CASE
    WHEN activity_type IN ('nft_purchase', 'defi_interaction') THEN '0x' || substring(md5(random()::text) from 1 for 40)
    ELSE NULL
  END AS contract_address,
  CASE
    WHEN activity_type IN ('transaction', 'defi_interaction') THEN random() * 1000
    ELSE NULL
  END AS token_amount,
  CASE
    WHEN activity_type IN ('transaction', 'defi_interaction') THEN
      CASE
        WHEN uw.chain_id = 1 THEN 'ETH'
        WHEN uw.chain_id = 137 THEN 'MATIC'
        WHEN uw.chain_id = 56 THEN 'BNB'
        ELSE 'ETH'
      END
    ELSE NULL
  END AS token_symbol,
  CASE
    WHEN activity_type IN ('transaction', 'defi_interaction') THEN (random() * 1000) * (random() * 3000 + 1000)
    ELSE NULL
  END AS usd_value,
  jsonb_build_object(
    'platform', CASE WHEN activity_type = 'social_share' THEN 'twitter' ELSE 'blockchain' END,
    'timestamp', NOW(),
    'verified', TRUE,
    'gas_used', CASE WHEN activity_type != 'social_share' THEN floor(random() * 200000 + 21000) ELSE NULL END,
    'gas_price', CASE WHEN activity_type != 'social_share' THEN (random() * 100 + 10)::text || ' gwei' ELSE NULL END
  ) AS metadata,
  TRUE AS verified
FROM ambassador_program ap
JOIN user_wallets uw ON uw.mindshare_user_id = ap.mindshare_user_id
CROSS JOIN LATERAL (
  SELECT (ARRAY['transaction', 'nft_purchase', 'defi_interaction', 'social_share'])[floor(random() * 4 + 1)::int] AS activity_type
) AS act
WHERE uw.is_primary = TRUE
LIMIT 50;


-- ✅ Insert sample ambassador rewards
INSERT INTO ambassador_rewards (
  ambassador_id,
  reward_type,
  reward_amount,
  reward_currency,
  reward_status,
  payment_method,
  wallet_address
)
SELECT
  ap.id AS ambassador_id,
  (ARRAY['referral_bonus', 'activity_bonus', 'monthly_bonus'])[floor(random() * 3 + 1)::int] AS reward_type,
  (ARRAY[50, 100, 250, 500, 1000])[floor(random() * 5 + 1)::int]::numeric AS reward_amount,
  'USD' AS reward_currency,
  (ARRAY['pending', 'paid', 'failed'])[floor(random() * 3 + 1)::int] AS reward_status,
  CASE WHEN random() > 0.5 THEN 'crypto' ELSE 'points' END AS payment_method,
  uw.wallet_address
FROM ambassador_program ap
JOIN user_wallets uw ON uw.mindshare_user_id = ap.mindshare_user_id AND uw.is_primary = TRUE
WHERE random() > 0.3
LIMIT 30;


-- ✅ Update ambassador program stats with new data
UPDATE ambassador_program
SET
  total_referrals = total_referrals + floor(random() * 10),
  active_referrals = active_referrals + floor(random() * 5),
  total_rewards_earned = total_rewards_earned + (
    SELECT COALESCE(SUM(reward_amount), 0)
    FROM ambassador_rewards ar
    WHERE ar.ambassador_id = ambassador_program.id AND ar.reward_status = 'paid'
  ),
  monthly_rewards = (
    SELECT COALESCE(SUM(reward_amount), 0)
    FROM ambassador_rewards ar
    WHERE ar.ambassador_id = ambassador_program.id
      AND ar.reward_status = 'paid'
      AND ar.created_at >= NOW() - INTERVAL '30 days'
  ),
  last_activity_at = GREATEST(
    last_activity_at,
    NOW() - (random() * 30 || ' days')::interval
  );


-- ✅ Update mindshare scores based on new Web3 activities
UPDATE mindshare_users
SET
  mindshare_score = mindshare_score + (
    SELECT COALESCE(SUM(aa.points_earned), 0)
    FROM ambassador_activities aa
    JOIN ambassador_program ap ON ap.id = aa.ambassador_id
    WHERE ap.mindshare_user_id = mindshare_users.id
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM ambassador_activities aa
  JOIN ambassador_program ap ON ap.id = aa.ambassador_id
  WHERE ap.mindshare_user_id = mindshare_users.id
);
