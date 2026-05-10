-- ==========================================
-- FAMILY TREE PRO - CONSOLIDATED SCHEMA
-- ==========================================

-- 0. CLEAN UP (Dọn dẹp trước khi tạo mới)
DROP TABLE IF EXISTS public.relationships CASCADE;
DROP TABLE IF EXISTS public.persons CASCADE;
DROP TABLE IF EXISTS public.family_trees CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.check_circular_parent CASCADE;
DROP FUNCTION IF EXISTS public.link_person_relation CASCADE;
DROP FUNCTION IF EXISTS public.unlink_person_relation CASCADE;
DROP FUNCTION IF EXISTS public.create_tree_with_root CASCADE;

-- Dọn dẹp Policies của Storage (không bị CASCADE theo bảng)
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
CREATE TABLE public.family_trees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  share_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.persons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_id UUID REFERENCES public.family_trees(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT 'Khuyết Danh' NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) DEFAULT 'male',
  birth_date DATE,
  death_date DATE,
  avatar_url TEXT,
  bio TEXT,
  occupation TEXT,
  address TEXT,
  father_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  nickname TEXT,
  sibling_order INTEGER DEFAULT 0 CHECK (sibling_order >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_id UUID REFERENCES public.family_trees(id) ON DELETE CASCADE,
  person1_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  person2_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('spouse')) DEFAULT 'spouse',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(person1_id, person2_id)
);

-- 3. FUNCTIONS & TRIGGERS

-- Helper to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_persons_updated_at BEFORE UPDATE ON public.persons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_trees_updated_at BEFORE UPDATE ON public.family_trees FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Recursive Circularity Check
CREATE OR REPLACE FUNCTION public.check_circular_parent()
RETURNS TRIGGER AS $$
DECLARE
  current_parent UUID;
BEGIN
  IF NEW.father_id IS NULL AND NEW.mother_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check Father
  IF NEW.father_id IS NOT NULL THEN
    IF NEW.father_id = NEW.id THEN
      RAISE EXCEPTION 'Cannot be your own father' USING ERRCODE = '23514';
    END IF;
    
    WITH RECURSIVE ancestors AS (
      SELECT father_id, mother_id FROM public.persons WHERE id = NEW.father_id
      UNION ALL
      SELECT p.father_id, p.mother_id FROM public.persons p 
      JOIN ancestors a ON p.id = a.father_id OR p.id = a.mother_id
    )
    SELECT 1 FROM ancestors WHERE father_id = NEW.id OR mother_id = NEW.id INTO current_parent;
    
    IF FOUND THEN
      RAISE EXCEPTION 'Circular relationship detected: Ancestor cannot be a child' USING ERRCODE = '23514';
    END IF;
  END IF;

  -- Check Mother
  IF NEW.mother_id IS NOT NULL THEN
    IF NEW.mother_id = NEW.id THEN
      RAISE EXCEPTION 'Cannot be your own mother' USING ERRCODE = '23514';
    END IF;
    
    WITH RECURSIVE ancestors AS (
      SELECT father_id, mother_id FROM public.persons WHERE id = NEW.mother_id
      UNION ALL
      SELECT p.father_id, p.mother_id FROM public.persons p 
      JOIN ancestors a ON p.id = a.father_id OR p.id = a.mother_id
    )
    SELECT 1 FROM ancestors WHERE father_id = NEW.id OR mother_id = NEW.id INTO current_parent;
    
    IF FOUND THEN
      RAISE EXCEPTION 'Circular relationship detected: Ancestor cannot be a child' USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_circular_parent BEFORE UPDATE OF father_id, mother_id OR INSERT ON public.persons
FOR EACH ROW EXECUTE FUNCTION public.check_circular_parent();

-- Transactional Relation Linking
CREATE OR REPLACE FUNCTION public.link_person_relation(
  relation_type TEXT,
  source_id UUID,
  target_id UUID
)
RETURNS VOID AS $$
DECLARE
  p1_gender TEXT;
  p2_gender TEXT;
  p1_tree UUID;
  p2_tree UUID;
BEGIN
  SELECT gender, tree_id INTO p1_gender, p1_tree FROM public.persons WHERE id = source_id;
  SELECT gender, tree_id INTO p2_gender, p2_tree FROM public.persons WHERE id = target_id;

  IF p1_tree <> p2_tree THEN
    RAISE EXCEPTION 'Must be in the same tree' USING ERRCODE = '23514';
  END IF;

  IF relation_type = 'father' THEN
    IF p2_gender <> 'male' THEN RAISE EXCEPTION 'Father must be male' USING ERRCODE = '23514'; END IF;
    UPDATE public.persons SET father_id = target_id WHERE id = source_id;
  ELSIF relation_type = 'mother' THEN
    IF p2_gender <> 'female' THEN RAISE EXCEPTION 'Mother must be female' USING ERRCODE = '23514'; END IF;
    UPDATE public.persons SET mother_id = target_id WHERE id = source_id;
  ELSIF relation_type = 'spouse' THEN
    IF p1_gender = p2_gender THEN RAISE EXCEPTION 'Spouses must have different genders' USING ERRCODE = '23514'; END IF;
    -- Symmetric insert
    INSERT INTO public.relationships (tree_id, person1_id, person2_id, relationship_type)
    VALUES (p1_tree, LEAST(source_id, target_id), GREATEST(source_id, target_id), 'spouse')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transactional Relation Unlinking
CREATE OR REPLACE FUNCTION public.unlink_person_relation(
  relation_type TEXT,
  source_id UUID,
  target_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF relation_type = 'father' THEN
    UPDATE public.persons SET father_id = NULL WHERE id = source_id;
  ELSIF relation_type = 'mother' THEN
    UPDATE public.persons SET mother_id = NULL WHERE id = source_id;
  ELSIF relation_type = 'spouse' THEN
    DELETE FROM public.relationships 
    WHERE (person1_id = source_id AND person2_id = target_id)
       OR (person1_id = target_id AND person2_id = source_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transactional Tree Creation with Root Person
CREATE OR REPLACE FUNCTION public.create_tree_with_root(
  p_owner_id UUID,
  p_name TEXT
)
RETURNS public.family_trees AS $$
DECLARE
  new_tree public.family_trees;
  root_person public.persons;
BEGIN
  -- 1. Create Tree
  INSERT INTO public.family_trees (owner_id, name)
  VALUES (p_owner_id, p_name)
  RETURNING * INTO new_tree;

  -- 2. Create Root Person
  INSERT INTO public.persons (tree_id, full_name, gender, sibling_order)
  VALUES (new_tree.id, 'Người Gốc', 'male', 0)
  RETURNING * INTO root_person;

  RETURN new_tree;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. STORAGE SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- 5. RLS POLICIES
ALTER TABLE public.family_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trees View" ON public.family_trees FOR SELECT USING (true);
CREATE POLICY "Trees Manage" ON public.family_trees FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Persons View" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Persons Manage" ON public.persons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.family_trees WHERE id = tree_id AND owner_id = auth.uid())
);

CREATE POLICY "Relations View" ON public.relationships FOR SELECT USING (true);
CREATE POLICY "Relations Manage" ON public.relationships FOR ALL USING (
  EXISTS (SELECT 1 FROM public.family_trees WHERE id = tree_id AND owner_id = auth.uid())
);
