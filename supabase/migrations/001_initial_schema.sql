-- ============================================================
-- Stratifyr — Updated Migration matching ACTUAL schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.channel_enum AS ENUM ('Ads','Content','Tools','Events','SEO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.activity_status_enum AS ENUM ('Planned','Completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.plan_type_enum AS ENUM ('free','pro','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 1. users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text          NOT NULL DEFAULT '',
  email       text          NOT NULL DEFAULT '',
  plan_type   plan_type_enum NOT NULL DEFAULT 'free',
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- Auto-create user row on Supabase Auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── 2. businesses ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name  text        NOT NULL,
  industry_type  text        NOT NULL DEFAULT '',
  monthly_budget numeric     NOT NULL DEFAULT 0,
  goal           text        NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);

-- ── 3. marketing_plans ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_plans (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  month        int4        NOT NULL CHECK (month BETWEEN 1 AND 12),
  year         int4        NOT NULL CHECK (year >= 2020),
  total_budget numeric     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_marketing_plans_business_id ON public.marketing_plans(business_id);

-- ── 4. budget_allocations ────────────────────────────────────
-- Linked to business (not plan) — represents the overall channel split
CREATE TABLE IF NOT EXISTS public.budget_allocations (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      uuid         NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel          channel_enum NOT NULL,
  percentage       numeric      NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  allocated_amount numeric      NOT NULL DEFAULT 0,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (business_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_budget_allocations_business_id ON public.budget_allocations(business_id);

-- ── 5. activities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id            uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       uuid                  NOT NULL REFERENCES public.marketing_plans(id) ON DELETE CASCADE,
  title         text                  NOT NULL,
  channel       channel_enum          NOT NULL,
  activity_date date                  NOT NULL,
  budget_used   numeric               NOT NULL DEFAULT 0,
  status        activity_status_enum  NOT NULL DEFAULT 'Planned',
  created_at    timestamptz           NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_plan_id    ON public.activities(plan_id);
CREATE INDEX IF NOT EXISTS idx_activities_channel    ON public.activities(channel);
CREATE INDEX IF NOT EXISTS idx_activities_status     ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_date       ON public.activities(activity_date);

-- ── 6. templates ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text        NOT NULL,
  industry_type        text        NOT NULL DEFAULT '',
  description          text        NOT NULL DEFAULT '',
  default_allocations  jsonb       NOT NULL DEFAULT '{}',
  default_activities   jsonb       NOT NULL DEFAULT '[]',
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates          ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY IF NOT EXISTS "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- businesses: owned by user
CREATE POLICY IF NOT EXISTS "businesses_select_own" ON public.businesses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "businesses_insert_own" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "businesses_update_own" ON public.businesses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "businesses_delete_own" ON public.businesses FOR DELETE USING (auth.uid() = user_id);

-- marketing_plans: via business ownership
CREATE POLICY IF NOT EXISTS "plans_select_own" ON public.marketing_plans FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "plans_insert_own" ON public.marketing_plans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "plans_update_own" ON public.marketing_plans FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "plans_delete_own" ON public.marketing_plans FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);

-- budget_allocations: via business ownership
CREATE POLICY IF NOT EXISTS "alloc_select_own" ON public.budget_allocations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "alloc_insert_own" ON public.budget_allocations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "alloc_update_own" ON public.budget_allocations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "alloc_delete_own" ON public.budget_allocations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);

-- activities: via plan → business ownership
CREATE POLICY IF NOT EXISTS "activities_select_own" ON public.activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.marketing_plans mp
    JOIN public.businesses b ON b.id = mp.business_id
    WHERE mp.id = plan_id AND b.user_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "activities_insert_own" ON public.activities FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.marketing_plans mp
    JOIN public.businesses b ON b.id = mp.business_id
    WHERE mp.id = plan_id AND b.user_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "activities_update_own" ON public.activities FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.marketing_plans mp
    JOIN public.businesses b ON b.id = mp.business_id
    WHERE mp.id = plan_id AND b.user_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "activities_delete_own" ON public.activities FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.marketing_plans mp
    JOIN public.businesses b ON b.id = mp.business_id
    WHERE mp.id = plan_id AND b.user_id = auth.uid()
  )
);

-- templates: readable by all authenticated users
CREATE POLICY IF NOT EXISTS "templates_select_all" ON public.templates FOR SELECT USING (auth.role() = 'authenticated');
