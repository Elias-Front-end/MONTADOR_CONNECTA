-- ATUALIZAÇÃO FASE 6 - SISTEMA SAAS CORPORATIVO COMPLETO
-- Baseado em docs/CORPORATE_SAAS_SPEC.md e docs/PRD_MARCENARIA_GESTAO.md

-- 1. ATUALIZAÇÃO DE PERFIS (CORPORATE_PROFILES)
-- Adiciona campos faltantes para empresas
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trading_name TEXT, -- Nome Fantasia
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb; -- Preferências, Branding, Notificações

-- 2. ATUALIZAÇÃO DA TABELA DE SERVIÇOS (SERVICE_ORDERS)
-- Evoluindo a tabela 'services' existente para suportar a nova estrutura robusta
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS client_info JSONB DEFAULT '{}'::jsonb, -- { name, phone, address, coordinates }
ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '{}'::jsonb, -- { environments, items, complexity }
ADD COLUMN IF NOT EXISTS documents TEXT[] DEFAULT ARRAY[]::TEXT[], -- URLs de plantas/manuais
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS category TEXT; -- Cozinha, Quarto, etc.

-- Adicionar novos status se não existirem
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_status_check;
ALTER TABLE public.services ADD CONSTRAINT services_status_check 
CHECK (status IN ('draft', 'published', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed', 'open', 'accepted'));
-- Nota: 'open' e 'accepted' mantidos para retrocompatibilidade, mas 'published' e 'scheduled' são os novos padrões.

-- 3. TABELA DE ALOCAÇÃO DE EQUIPE (TEAM ALLOCATION)
CREATE TABLE IF NOT EXISTS public.service_team_allocation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL, -- Nome do ajudante ou montador extra
  role TEXT DEFAULT 'helper', -- 'lead', 'helper', 'specialist'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.service_team_allocation ENABLE ROW LEVEL SECURITY;

-- Políticas de Equipe:
-- Montador aceitante vê e gerencia sua equipe
CREATE POLICY "Montador manage team" ON public.service_team_allocation
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_team_allocation.service_id 
      AND services.montador_id = auth.uid()
    )
  );

-- Empresa vê a equipe alocada
CREATE POLICY "Company view team" ON public.service_team_allocation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_team_allocation.service_id 
      AND services.owner_id = auth.uid()
    )
  );

-- 4. TABELA DE AVALIAÇÕES (REVIEWS)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL, -- Quem avaliou
  target_id UUID REFERENCES public.profiles(id) NOT NULL, -- Quem foi avaliado
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  categories JSONB DEFAULT '{}'::jsonb, -- { punctuality: 5, quality: 4 }
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de Reviews:
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users create reviews for their services" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = reviews.service_id 
      AND (services.owner_id = auth.uid() OR services.montador_id = auth.uid())
    )
  );

-- 5. TABELA DE INDISPONIBILIDADE (AVAILABILITY_BLOCKS)
CREATE TABLE IF NOT EXISTS public.availability_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  montador_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT, -- 'vacation', 'sick_leave', 'personal'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Montador manage own availability" ON public.availability_blocks
  FOR ALL USING (auth.uid() = montador_id);

CREATE POLICY "Partners view availability" ON public.availability_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE (partnerships.montador_id = availability_blocks.montador_id AND partnerships.marcenaria_id = auth.uid())
      AND status = 'active'
    )
  );

-- 6. ATUALIZAÇÃO DE POLÍTICAS DE SERVIÇOS (REFLETIR MODELO PULL)
-- O Montador deve ser capaz de fazer UPDATE no serviço para se auto-atribuir

-- Política para Montador aceitar serviço (Refinamento)
-- Permite que o montador atualize 'montador_id' e 'status' SE:
-- 1. O serviço está 'published' (ou 'open')
-- 2. Ninguém aceitou ainda (montador_id IS NULL)
-- 3. Existe parceria ativa
DROP POLICY IF EXISTS "Montador accept service" ON public.services;

CREATE POLICY "Montador accept service" ON public.services
  FOR UPDATE
  USING (
    (status = 'open' OR status = 'published')
    AND montador_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE montador_id = auth.uid() 
      AND marcenaria_id = services.owner_id
      AND status = 'active'
    )
  )
  WITH CHECK (
    montador_id = auth.uid() -- Garante que ele só pode atribuir a si mesmo
    AND (status = 'scheduled' OR status = 'accepted') -- Novo status deve ser agendado
  );

-- 7. STORAGE BUCKETS (Script Auxiliar - Rodar no SQL Editor se a extensão storage estiver ativa)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('service-docs', 'service-docs', false) ON CONFLICT DO NOTHING;
-- CREATE POLICY "Company upload docs" ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'service-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "View docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'service-docs');
