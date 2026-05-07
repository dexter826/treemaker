-- Run this in your Supabase SQL Editor

-- 1. Create family_trees table
CREATE TABLE public.family_trees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  share_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for family_trees
ALTER TABLE public.family_trees ENABLE ROW LEVEL SECURITY;

-- 2. Create persons table
CREATE TABLE public.persons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_id UUID REFERENCES public.family_trees(id) ON DELETE CASCADE,
  first_name TEXT DEFAULT '' NOT NULL,
  last_name TEXT DEFAULT '' NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')) DEFAULT 'other',
  birth_date DATE,
  death_date DATE,
  avatar_url TEXT,
  bio TEXT,
  occupation TEXT,
  address TEXT,
  father_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  spouse_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In a real app we might want to ensure symmetry (if A is spouse of B, B is spouse of A),
-- but for UI this can be enforced in frontend logic or Edge Functions/Triggers.

-- Enable RLS for persons
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Public viewing via share token
-- Anyone can view a tree if they have the share_token (we check this in the API/Frontend logic,
-- but for RLS we can either allow public read and hide it, or just allow read for all if the tree exists).
-- Since the frontend will fetch trees by share_token, we can allow true public read for tables if we want, or scoped.
-- To keep it secure but allow sharing:
CREATE POLICY "Public profiles are viewable by everyone" ON public.family_trees FOR SELECT USING (true);
CREATE POLICY "Persons are viewable by everyone" ON public.persons FOR SELECT USING (true);

-- Owners can do everything on their trees
CREATE POLICY "Owners can insert trees" ON public.family_trees FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their trees" ON public.family_trees FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their trees" ON public.family_trees FOR DELETE USING (auth.uid() = owner_id);

-- Owners can do everything on persons in their trees
CREATE POLICY "Owners can insert persons into their trees" ON public.persons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.family_trees WHERE id = tree_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can update persons in their trees" ON public.persons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.family_trees WHERE id = tree_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can delete persons in their trees" ON public.persons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.family_trees WHERE id = tree_id AND owner_id = auth.uid())
);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_trees_modtime BEFORE UPDATE ON public.family_trees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_persons_modtime BEFORE UPDATE ON public.persons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
