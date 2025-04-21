-- Create download logs table
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  mod_id TEXT NOT NULL,
  steam_id TEXT,
  steam_username TEXT,
  discord_id TEXT,
  discord_username TEXT,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own download logs
CREATE POLICY view_own_downloads ON public.download_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert download logs
CREATE POLICY insert_download_logs ON public.download_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to select all download logs (for admin purposes)
CREATE POLICY service_role_select_all ON public.download_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Add indexes for better performance
CREATE INDEX idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_steam_id ON public.download_logs(steam_id);
CREATE INDEX idx_download_logs_discord_id ON public.download_logs(discord_id);
CREATE INDEX idx_download_logs_mod_id ON public.download_logs(mod_id);
CREATE INDEX idx_download_logs_date ON public.download_logs(download_date); 