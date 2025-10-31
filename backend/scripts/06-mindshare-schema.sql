-- MINDSHARE MODULE: Complete schema for leaderboard and user profiles

-- Table: mindshare_users (extended user profile for mindshare)
CREATE TABLE IF NOT EXISTS mindshare_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  x_handle VARCHAR(255), -- Twitter/X handle
  telegram_id VARCHAR(255),
  discord_id VARCHAR(255),
  discord_username VARCHAR(255),
  discord_invite_link VARCHAR(512),
  promo_code VARCHAR(50) UNIQUE,
  profile_bio TEXT,
  profile_avatar_url VARCHAR(512),
  mindshare_score DECIMAL(15,2) DEFAULT 0, -- Calculated from activities
  rank INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Table: mindshare_activities (track activities that contribute to mindshare score)
CREATE TABLE IF NOT EXISTS mindshare_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindshare_user_id UUID NOT NULL REFERENCES mindshare_users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'share', 'engagement', 'referral', 'task_completion'
  activity_description TEXT,
  points_earned DECIMAL(10,2) NOT NULL,
  metadata JSONB, -- Additional activity data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: mindshare_referrals (track referrals and promotions)
CREATE TABLE IF NOT EXISTS mindshare_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES mindshare_users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES mindshare_users(id) ON DELETE SET NULL,
  promo_code_used VARCHAR(50),
  referral_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'claimed'
  bonus_points_awarded DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Table: mindshare_leaderboard (pre-calculated leaderboard cache)
CREATE TABLE IF NOT EXISTS mindshare_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindshare_user_id UUID NOT NULL REFERENCES mindshare_users(id) ON DELETE CASCADE,
  current_rank INTEGER NOT NULL,
  mindshare_score DECIMAL(15,2) NOT NULL,
  period VARCHAR(20) DEFAULT 'all_time', -- 'weekly', 'monthly', 'all_time'
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mindshare_user_id, period)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mindshare_users_wallet ON mindshare_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_mindshare_users_score ON mindshare_users(mindshare_score DESC);
CREATE INDEX IF NOT EXISTS idx_mindshare_activities_user ON mindshare_activities(mindshare_user_id);
CREATE INDEX IF NOT EXISTS idx_mindshare_referrals_referrer ON mindshare_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_mindshare_leaderboard_rank ON mindshare_leaderboard(current_rank);
CREATE INDEX IF NOT EXISTS idx_mindshare_leaderboard_period ON mindshare_leaderboard(period);

-- Enable RLS (Row Level Security)
ALTER TABLE mindshare_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindshare_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindshare_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindshare_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies: mindshare_users
CREATE POLICY "Users can view all mindshare profiles" ON mindshare_users
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own mindshare profile" ON mindshare_users
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: mindshare_activities
CREATE POLICY "Users can view activities for their profile" ON mindshare_activities
  FOR SELECT USING (
    mindshare_user_id IN (
      SELECT id FROM mindshare_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policies: mindshare_referrals
CREATE POLICY "Users can view their referrals" ON mindshare_referrals
  FOR SELECT USING (
    referrer_id IN (
      SELECT id FROM mindshare_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policies: mindshare_leaderboard
CREATE POLICY "Everyone can view leaderboard" ON mindshare_leaderboard
  FOR SELECT USING (TRUE);
