-- ATUALIZAÇÃO FASE 5 - PERFIL CORPORATIVO E RANKING

-- 1. Adicionar colunas corporativas ao Profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS commercial_address TEXT,
ADD COLUMN IF NOT EXISTS description TEXT; -- Sobre a empresa

-- 2. Garantir colunas de endereço (City/State) para filtros
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- 3. Índices para busca rápida de montadores (Ranking)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
-- Índice GIN para busca eficiente dentro do array de skills
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN (skills);
