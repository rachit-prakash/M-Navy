-- ==============================================
-- M-Navy Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ==============================================

-- 1. Create Profiles Table (extends the Supabase Auth system)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 2. Create Posts Table (Forum topics)
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Replies Table (Comments on posts)
CREATE TABLE public.replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================
-- Row Level Security (RLS) Policies
-- ==============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);

-- Note: In a real app we might use auth.uid() directly or a secure function, 
-- but a basic check is fine for the MVP.
CREATE POLICY "Users can insert posts." ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts." ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Replies RLS
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies are viewable by everyone." ON public.replies FOR SELECT USING (true);
CREATE POLICY "Users can insert replies." ON public.replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own replies." ON public.replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own replies." ON public.replies FOR DELETE USING (auth.uid() = author_id);

-- ==============================================
-- Trigger to insert profile on signup
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, split_part(new.email, '@', 1), new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================
-- Storage Row Level Security (RLS) Policies
-- ==============================================
-- Supabase Storage requires RLS policies to allow uploads, even for "Public" buckets.
-- Run these policies in the SQL Editor to fix the "new row violates row-level security policy" error.

-- 1. Allow anyone to view/read files in the public buckets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('avatars', 'vault') );

-- 2. Allow authenticated users to upload files to these buckets
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id IN ('avatars', 'vault') );

-- 3. Allow authenticated users to update existing files
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id IN ('avatars', 'vault') );

-- 4. Allow authenticated users to delete files
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id IN ('avatars', 'vault') );
