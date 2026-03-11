-- ================================================================
-- InvisibleWatts — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT 'User',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_kwh_target       NUMERIC(8,2) NOT NULL DEFAULT 60,
  monthly_budget_dollars NUMERIC(8,2) NOT NULL DEFAULT 300,
  notifications          JSONB NOT NULL DEFAULT '{
    "peak_usage":    true,
    "daily_summary": true,
    "weekly_report": false,
    "device_offline": true,
    "maintenance":   false
  }'::jsonb,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.devices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  device_type  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'offline',
  last_sync_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hourly_readings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  hour_label  TEXT NOT NULL,
  kw_usage    NUMERIC(6,2) NOT NULL,
  kw_target   NUMERIC(6,2) NOT NULL DEFAULT 2.5
);

CREATE TABLE IF NOT EXISTS public.daily_readings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  kwh_total    NUMERIC(8,2) NOT NULL,
  cost_dollars NUMERIC(8,2) NOT NULL,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.monthly_readings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_label  TEXT NOT NULL,
  sort_order   SMALLINT NOT NULL,
  kwh_total    NUMERIC(8,2) NOT NULL,
  cost_dollars NUMERIC(8,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.category_breakdown (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  kwh_total       NUMERIC(8,2) NOT NULL,
  percentage      NUMERIC(5,2) NOT NULL,
  cost_dollars    NUMERIC(8,2) NOT NULL,
  trend_direction TEXT NOT NULL DEFAULT 'flat',
  trend_percent   NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.activity_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name  TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'System'
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hourly_readings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_readings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_readings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can access own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own devices"
  ON public.devices FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own hourly readings"
  ON public.hourly_readings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own daily readings"
  ON public.daily_readings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own monthly readings"
  ON public.monthly_readings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own category breakdown"
  ON public.category_breakdown FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own activity events"
  ON public.activity_events FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED TRIGGER
-- Fires on every new auth.users row. Seeds realistic data.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid   UUID := NEW.id;
  umail TEXT := NEW.email;
  today DATE := CURRENT_DATE;
BEGIN
  -- Profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (uid, umail, SPLIT_PART(umail, '@', 1));

  -- Preferences (column defaults apply)
  INSERT INTO public.user_preferences (user_id) VALUES (uid);

  -- Devices
  INSERT INTO public.devices (user_id, name, device_type, status, last_sync_at) VALUES
    (uid, 'Main Smart Meter',      'smart_meter', 'online',  NOW() - INTERVAL '2 minutes'),
    (uid, 'HVAC Smart Thermostat', 'thermostat',  'online',  NOW() - INTERVAL '5 minutes'),
    (uid, 'Smart Plug #1',         'smart_plug',  'online',  NOW() - INTERVAL '1 hour'),
    (uid, 'Smart Plug #3',         'smart_plug',  'offline', NOW() - INTERVAL '2 days');

  -- Hourly readings for today (24-hour load curve, peak at 16:00-20:00)
  INSERT INTO public.hourly_readings (user_id, recorded_at, hour_label, kw_usage, kw_target) VALUES
    (uid, today + INTERVAL '0 hours',  '00:00', 1.8, 2.5),
    (uid, today + INTERVAL '1 hour',   '01:00', 1.5, 2.5),
    (uid, today + INTERVAL '2 hours',  '02:00', 1.3, 2.5),
    (uid, today + INTERVAL '3 hours',  '03:00', 1.2, 2.5),
    (uid, today + INTERVAL '4 hours',  '04:00', 1.3, 2.5),
    (uid, today + INTERVAL '5 hours',  '05:00', 1.6, 2.5),
    (uid, today + INTERVAL '6 hours',  '06:00', 2.1, 2.5),
    (uid, today + INTERVAL '7 hours',  '07:00', 2.8, 2.5),
    (uid, today + INTERVAL '8 hours',  '08:00', 3.1, 2.5),
    (uid, today + INTERVAL '9 hours',  '09:00', 2.9, 2.5),
    (uid, today + INTERVAL '10 hours', '10:00', 2.7, 2.5),
    (uid, today + INTERVAL '11 hours', '11:00', 2.5, 2.5),
    (uid, today + INTERVAL '12 hours', '12:00', 3.8, 2.5),
    (uid, today + INTERVAL '13 hours', '13:00', 3.5, 2.5),
    (uid, today + INTERVAL '14 hours', '14:00', 3.2, 2.5),
    (uid, today + INTERVAL '15 hours', '15:00', 3.4, 2.5),
    (uid, today + INTERVAL '16 hours', '16:00', 4.4, 2.5),
    (uid, today + INTERVAL '17 hours', '17:00', 4.8, 2.5),
    (uid, today + INTERVAL '18 hours', '18:00', 4.2, 2.5),
    (uid, today + INTERVAL '19 hours', '19:00', 3.9, 2.5),
    (uid, today + INTERVAL '20 hours', '20:00', 3.5, 2.5),
    (uid, today + INTERVAL '21 hours', '21:00', 2.8, 2.5),
    (uid, today + INTERVAL '22 hours', '22:00', 2.2, 2.5),
    (uid, today + INTERVAL '23 hours', '23:00', 1.9, 2.5);

  -- Daily readings (last 7 days)
  INSERT INTO public.daily_readings (user_id, date, kwh_total, cost_dollars) VALUES
    (uid, today - 6, 245, 30.6),
    (uid, today - 5, 268, 33.5),
    (uid, today - 4, 278, 34.8),
    (uid, today - 3, 255, 31.9),
    (uid, today - 2, 290, 36.3),
    (uid, today - 1, 310, 38.8),
    (uid, today,     285, 35.6);

  -- Monthly readings (8 months)
  INSERT INTO public.monthly_readings (user_id, month_label, sort_order, kwh_total, cost_dollars) VALUES
    (uid, 'Jan', 1, 1200, 150),
    (uid, 'Feb', 2, 1100, 137),
    (uid, 'Mar', 3,  950, 119),
    (uid, 'Apr', 4,  890, 111),
    (uid, 'May', 5, 1050, 131),
    (uid, 'Jun', 6, 1280, 160),
    (uid, 'Jul', 7, 1350, 169),
    (uid, 'Aug', 8, 1320, 165);

  -- Category breakdown
  INSERT INTO public.category_breakdown
    (user_id, category, kwh_total, percentage, cost_dollars, trend_direction, trend_percent) VALUES
    (uid, 'HVAC',          560, 45, 70,  'up',   5),
    (uid, 'Water Heating', 250, 20, 31,  'down',  2),
    (uid, 'Lighting',      190, 15, 24,  'flat',  0),
    (uid, 'Appliances',    250, 20, 31,  'up',    3);

  -- Activity events
  INSERT INTO public.activity_events
    (user_id, occurred_at, event_name, description, event_type, device_name) VALUES
    (uid, NOW() - INTERVAL '90 minutes',                  'Peak Usage Detected', 'Usage exceeded 3 kW for 15 minutes',       'alert',   'HVAC System'),
    (uid, NOW() - INTERVAL '3 hours',                     'Device Connected',    'Smart meter successfully synchronized',     'success', 'Smart Meter'),
    (uid, NOW() - INTERVAL '7 hours',                     'Energy Goal Met',     'Daily usage 8% below target',              'success', 'System'),
    (uid, NOW() - INTERVAL '1 day' - INTERVAL '1 hour',   'Unusual Pattern',     'Usage pattern differs from usual by 12%',  'warning', 'Water Heater'),
    (uid, NOW() - INTERVAL '1 day' - INTERVAL '5 hours',  'Device Offline',      'Connection lost with smart plug',          'alert',   'Smart Plug #3'),
    (uid, NOW() - INTERVAL '1 day' - INTERVAL '7 hours',  'Maintenance Alert',   'Scheduled maintenance completed',          'info',    'System'),
    (uid, NOW() - INTERVAL '3 days',                      'Settings Updated',    'Energy targets adjusted',                  'info',    'System'),
    (uid, NOW() - INTERVAL '4 days',                      'Report Generated',    'Monthly energy report available',          'success', 'System');

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
