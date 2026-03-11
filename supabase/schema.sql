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
-- SIGNUP TRIGGER
-- Fires on every new auth.users row.
-- Seeds only structural data (profile, preferences, devices).
-- Chart data (hourly/daily/monthly/category/activity) is NOT
-- seeded — users see empty states until real devices are connected.
-- Use the Demo Mode toggle in the sidebar to explore with sample data.
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
BEGIN
  -- Profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (uid, umail, SPLIT_PART(umail, '@', 1));

  -- Preferences (column defaults apply)
  INSERT INTO public.user_preferences (user_id) VALUES (uid);

  -- Default devices (placeholders until user connects real hardware)
  INSERT INTO public.devices (user_id, name, device_type, status, last_sync_at) VALUES
    (uid, 'Main Smart Meter',      'smart_meter', 'offline', NULL),
    (uid, 'HVAC Smart Thermostat', 'thermostat',  'offline', NULL),
    (uid, 'Smart Plug #1',         'smart_plug',  'offline', NULL),
    (uid, 'Smart Plug #3',         'smart_plug',  'offline', NULL);

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
