
-- Create a table for email system settings
CREATE TABLE IF NOT EXISTS public.email_system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a trigger to update the updated_at column
CREATE TRIGGER set_updated_at_timestamp_email_system_settings
BEFORE UPDATE ON public.email_system_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for email processing schedule
INSERT INTO public.email_system_settings (key, value)
VALUES ('processing_schedule', '{"enabled": false, "cron": "*/30 * * * *"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
