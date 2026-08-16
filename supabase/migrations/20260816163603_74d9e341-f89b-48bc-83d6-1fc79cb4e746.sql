CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text NOT NULL DEFAULT 'Anonymous',
  username text NOT NULL UNIQUE,
  is_hall_of_fame_editor boolean NOT NULL DEFAULT false,
  tier text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  hashtags text[] NOT NULL DEFAULT '{}',
  cover_url text,
  cover integer NOT NULL DEFAULT 0,
  pages integer NOT NULL DEFAULT 1,
  upvotes_count integer NOT NULL DEFAULT 0,
  reads_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published books are public" ON public.books FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can read own books" ON public.books FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert own books" ON public.books FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own books" ON public.books FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own books" ON public.books FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE TABLE public.upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT ON public.upvotes TO anon;
GRANT SELECT, INSERT, DELETE ON public.upvotes TO authenticated;
GRANT ALL ON public.upvotes TO service_role;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Upvotes are viewable by everyone" ON public.upvotes FOR SELECT USING (true);
CREATE POLICY "Users can add own upvotes" ON public.upvotes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own upvotes" ON public.upvotes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.books SET upvotes_count = upvotes_count + 1 WHERE id = NEW.book_id;
    RETURN NEW;
  ELSE
    UPDATE public.books SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = OLD.book_id;
    RETURN OLD;
  END IF;
END;
$$;
CREATE TRIGGER upvotes_sync_count
AFTER INSERT OR DELETE ON public.upvotes
FOR EACH ROW EXECUTE FUNCTION public.sync_upvote_count();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_handle text;
  final_handle text;
  n integer := 0;
BEGIN
  base_handle := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), '[^a-z0-9._]', '', 'g'));
  IF length(base_handle) < 3 THEN
    base_handle := 'reader' || substr(NEW.id::text, 1, 6);
  END IF;
  final_handle := base_handle;
  WHILE EXISTS (SELECT 1 FROM public.profiles p WHERE p.username = final_handle) LOOP
    n := n + 1;
    final_handle := base_handle || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, email, name, username)
  VALUES (NEW.id, NEW.email, coalesce(NEW.raw_user_meta_data->>'name', 'Anonymous'), final_handle);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.redeem_hof_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  editors integer;
  already boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not signed in.');
  END IF;
  IF _code IS DISTINCT FROM 'thof1856!' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'That secret access code is not valid.');
  END IF;
  SELECT is_hall_of_fame_editor INTO already FROM public.profiles WHERE id = auth.uid();
  IF already THEN
    RETURN jsonb_build_object('ok', true);
  END IF;
  SELECT count(*) INTO editors FROM public.profiles WHERE is_hall_of_fame_editor;
  IF editors >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'All 5 Hall of Fame editor seats are filled.');
  END IF;
  UPDATE public.profiles SET is_hall_of_fame_editor = true WHERE id = auth.uid();
  RETURN jsonb_build_object('ok', true);
END;
$$;
REVOKE ALL ON FUNCTION public.redeem_hof_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.redeem_hof_code(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.username_available(_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = lower(_username));
$$;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated;