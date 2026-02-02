-- ATUALIZAÇÃO FASE 2 - PERFIL COMPLETO

-- 1. Adicionar colunas extras ao perfil
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS video_presentation TEXT,
ADD COLUMN IF NOT EXISTS experience_years TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS phone_secondary TEXT;

-- 2. Tabela para Portfólio (Fotos e Vídeos extras)
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('photo', 'video')) NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para Portfolio
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para portfolio
CREATE POLICY "Usuários veem portfolio de todos" ON public.portfolio_items
  FOR SELECT USING (true);

CREATE POLICY "Usuários gerenciam seu próprio portfolio" ON public.portfolio_items
  FOR ALL USING (auth.uid() = profile_id);

-- 3. Buckets de Storage (Se não existirem)
-- Nota: A criação de buckets geralmente é feita via API ou Dashboard, 
-- mas inserimos na tabela storage.buckets se o Supabase permitir via SQL direto.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (simplificadas para MVP)
CREATE POLICY "Avatar Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Portfolio Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Anyone can upload portfolio" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio');
