-- ===========================================
-- Web3 Wallet Integration Schema
-- ===========================================

-- Table: user_wallets (support multiple wallets per user)
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mindshare_user_id UUID REFERENCES mindshare_users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  wallet_provider VARCHAR(50) NOT NULL, -- 'metamask', 'walletconnect', 'coinbase', etc.
  chain_id INTEGER NOT NULL DEFAULT 1, -- Ethereum mainnet by default
  network_name VARCHAR(100) NOT NULL DEFAULT 'ethereum',
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_signature TEXT,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, wallet_address),
  UNIQUE(mindshare_user_id, wallet_address)
);

-- Table: ambassador_program (ambassador tracking and rewards)
CREATE TABLE IF NOT EXISTS ambassador_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindshare_user_id UUID NOT NULL REFERENCES mindshare_users(id) ON DELETE CASCADE,
  ambassador_level VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_rewards_earned DECIMAL(15,2) DEFAULT 0,
  monthly_rewards DECIMAL(15,2) DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(mindshare_user_id)
);

-- Table: ambassador_referrals (detailed referral tracking)
CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassador_program(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES mindshare_users(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) NOT NULL,
  referral_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  reward_earned DECIMAL(10,2) DEFAULT 0,
  referral_source VARCHAR(50), -- 'social', 'direct', 'promo_code'
  metadata JSONB, -- Additional referral data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(referral_code)
);

-- Table: ambassador_activities (Web3 activity tracking)
CREATE TABLE IF NOT EXISTS ambassador_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassador_program(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'transaction', 'nft_purchase', 'defi_interaction', 'social_share'
  activity_description TEXT,
  points_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  transaction_hash VARCHAR(255),
  chain_id INTEGER,
  contract_address VARCHAR(255),
  token_amount DECIMAL(36,18),
  token_symbol VARCHAR(20),
  usd_value DECIMAL(15,2),
  metadata JSONB, -- Activity-specific data
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: ambassador_rewards (reward distribution tracking)
CREATE TABLE IF NOT EXISTS ambassador_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassador_program(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL, -- 'referral_bonus', 'activity_bonus', 'monthly_bonus'
  reward_amount DECIMAL(15,2) NOT NULL,
  reward_currency VARCHAR(10) DEFAULT 'USD',
  reward_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_method VARCHAR(50), -- 'crypto', 'fiat', 'points'
  transaction_hash VARCHAR(255),
  wallet_address VARCHAR(255),
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_mindshare_user ON user_wallets(mindshare_user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_program_level ON ambassador_program(ambassador_level);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_ambassador ON ambassador_referrals(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_code ON ambassador_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_activities_ambassador ON ambassador_activities(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_activities_wallet ON ambassador_activities(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ambassador_activities_type ON ambassador_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_ambassador_rewards_ambassador ON ambassador_rewards(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_rewards_status ON ambassador_rewards(reward_status);

-- Enable RLS (Row Level Security)
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies: user_wallets
CREATE POLICY "Users can view their own wallets" ON user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wallets" ON user_wallets
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: ambassador_program
CREATE POLICY "Users can view their ambassador profile" ON ambassador_program
  FOR SELECT USING (
    mindshare_user_id IN (
      SELECT id FROM mindshare_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their ambassador profile" ON ambassador_program
  FOR UPDATE USING (
    mindshare_user_id IN (
      SELECT id FROM mindshare_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policies: ambassador_referrals
CREATE POLICY "Ambassadors can view their referrals" ON ambassador_referrals
  FOR SELECT USING (
    ambassador_id IN (
      SELECT id FROM ambassador_program WHERE mindshare_user_id IN (
        SELECT id FROM mindshare_users WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies: ambassador_activities
CREATE POLICY "Ambassadors can view their activities" ON ambassador_activities
  FOR SELECT USING (
    ambassador_id IN (
      SELECT id FROM ambassador_program WHERE mindshare_user_id IN (
        SELECT id FROM mindshare_users WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies: ambassador_rewards
CREATE POLICY "Ambassadors can view their rewards" ON ambassador_rewards
  FOR SELECT USING (
    ambassador_id IN (
      SELECT id FROM ambassador_program WHERE mindshare_user_id IN (
        SELECT id FROM mindshare_users WHERE user_id = auth.uid()
      )
    )
  );

-- Update existing mindshare_users to remove wallet_address (now in user_wallets)
-- This will be handled in migration script
