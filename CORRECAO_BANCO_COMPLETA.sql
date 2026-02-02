-- SETUP COMPLETO DO BANCO DE DADOS
-- Rode este script no SQL Editor do Supabase para corrigir todos os problemas de tabela/colunas

-- 1. Garantir que a extensão de UUID existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis (Base)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('montador', 'partner', 'admin')),
  company_name TEXT,
  city TEXT,
  state TEXT,
  bio TEXT
);

-- 3. Adicionar Colunas Extras (Se faltarem)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS video_presentation TEXT,
ADD COLUMN IF NOT EXISTS experience_years TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS phone_secondary TEXT;

-- 4. Habilitar RLS em Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Perfis (Recriando para garantir)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Tabela de Portfólio
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('photo', 'video')) NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem portfolio de todos" ON public.portfolio_items;
CREATE POLICY "Usuários veem portfolio de todos" ON public.portfolio_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários gerenciam seu próprio portfolio" ON public.portfolio_items;
CREATE POLICY "Usuários gerenciam seu próprio portfolio" ON public.portfolio_items FOR ALL USING (auth.uid() = profile_id);

-- 7. Buckets de Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;

-- 8. Permissões de Storage (Removemos antigas para evitar duplicação/conflito)
DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public View" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio Upload" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio Public View" ON storage.objects;

CREATE POLICY "Avatar Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatar Public View" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Portfolio Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio');
CREATE POLICY "Portfolio Public View" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');

-- 9. Trigger para criar perfil automaticamente ao cadastrar (Opcional, mas recomendado)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
