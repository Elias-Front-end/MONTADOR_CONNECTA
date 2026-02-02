import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.INTERNAL_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Em produção idealmente usaria SERVICE_ROLE_KEY, mas para DDL simples via dashboard anon as vezes não rola.
// PERA! Para alterar tabela (DDL), precisamos da SERVICE_ROLE_KEY ou rodar via SQL Editor.
// O Client Anon não tem permissão de ALTER TABLE.

console.log("ATENÇÃO: Para criar colunas novas, você PRECISA rodar o SQL no Painel do Supabase.");
console.log("O Cliente Anonimo do Frontend não tem permissão de 'Super Admin' para alterar a estrutura do banco.");

// Vou tentar usar uma função RPC se existir, mas o ideal é SQL Editor.
// Como fallback, vou apenas logar o que precisa ser feito.

console.log(`
--- COPIE E RODE ISSO NO SQL EDITOR DO SUPABASE ---

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS video_presentation TEXT,
ADD COLUMN IF NOT EXISTS experience_years TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS phone_secondary TEXT;

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('photo', 'video')) NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem portfolio de todos" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Usuários gerenciam seu próprio portfolio" ON public.portfolio_items FOR ALL USING (auth.uid() = profile_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar Images public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Portfolio Images public" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Portfolio Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio');

---------------------------------------------------
`);
