-- database_setup.sql
-- 
-- SCHEMA COMPLETO E OTIMIZADO - MONTADOR CONECTA (v2.0 Clean Slate)
-- Data: 2026-02-02
-- 
-- Este script recria toda a estrutura do banco de dados do zero, seguindo as melhores práticas
-- de normalização, segurança (RLS) e performance.
-- 
-- ORDEM DE EXECUÇÃO:
-- 1. Extensões e Configurações
-- 2. Tipos (Enums)
-- 3. Tabelas Principais (Profiles, Companies)
-- 4. Tabelas de Negócio (Services, Partnerships, etc.)
-- 5. Tabelas Auxiliares (Reviews, Availability)
-- 6. Views de Segurança
-- 7. Triggers e Funções
-- 8. Políticas de Segurança (RLS)

-- ==========================================
-- 1. EXTENSÕES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. TIPOS (ENUMS)
-- ==========================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('montador', 'partner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_status AS ENUM (
        'draft',        -- Rascunho
        'published',    -- Disponível para montadores (Pull Model)
        'scheduled',    -- Aceito/Agendado
        'in_progress',  -- Em execução
        'completed',    -- Finalizado
        'cancelled',    -- Cancelado
        'disputed'      -- Em disputa
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partnership_status AS ENUM ('pending', 'active', 'rejected', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 3. TABELAS PRINCIPAIS
-- ==========================================

-- 3.1 PROFILES (Perfil Unificado)
-- Vinculado 1:1 com auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'montador',
    
    -- Dados Pessoais
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Dados de Montador
    cpf TEXT UNIQUE,
    skills TEXT[] DEFAULT '{}', -- Array de habilidades
    experience_years INTEGER,
    region TEXT, -- Cidade/Estado de atuação principal
    
    -- Dados de Empresa (Se for partner)
    company_id UUID, -- FK para tabela companies (definida abaixo)
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 COMPANIES (Empresas/Marcenarias)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id), -- Quem criou a empresa
    
    -- Dados Comerciais
    trading_name TEXT NOT NULL, -- Nome Fantasia
    corporate_name TEXT, -- Razão Social
    cnpj TEXT UNIQUE,
    phone TEXT,
    email_contact TEXT,
    
    -- Endereço
    address_full TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    
    -- Configurações
    settings JSONB DEFAULT '{}'::jsonb, -- Preferências, Branding
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar FK de profiles -> companies agora que companies existe
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- ==========================================
-- 4. TABELAS DE NEGÓCIO
-- ==========================================

-- 4.1 PARTNERSHIPS (Vínculo Marcenaria <-> Montador)
-- Define quem pode ver serviços privados de quem
CREATE TABLE IF NOT EXISTS public.partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    montador_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    status partnership_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, montador_id)
);

-- 4.2 SERVICES (Ordens de Serviço)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Vínculos
    company_id UUID REFERENCES public.companies(id) NOT NULL, -- Dono do serviço
    creator_id UUID REFERENCES public.profiles(id), -- Quem cadastrou (pode ser funcionário)
    montador_id UUID REFERENCES public.profiles(id), -- Quem aceitou/foi alocado
    
    -- Dados do Serviço
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Cozinha, Quarto, etc.
    status service_status DEFAULT 'draft',
    complexity complexity_level DEFAULT 'medium',
    is_urgent BOOLEAN DEFAULT FALSE,
    
    -- Cliente Final
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_info JSONB DEFAULT '{}'::jsonb, -- Dados extras
    
    -- Local e Data
    address_full TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    duration_hours NUMERIC(4,1), -- Ex: 2.5 horas
    
    -- Financeiro
    price DECIMAL(10,2),
    
    -- Técnico
    required_skills TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}', -- URLs de plantas/manuais
    service_details JSONB DEFAULT '{}'::jsonb, -- Itens, ambientes detalhados
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4.3 SERVICE TEAM (Equipe Alocada)
-- Permite que o montador líder adicione ajudantes
CREATE TABLE IF NOT EXISTS public.service_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL, -- Nome do ajudante (ou FK se tiver conta)
    role TEXT DEFAULT 'helper',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. TABELAS AUXILIARES
-- ==========================================

-- 5.1 REVIEWS (Avaliações)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) NOT NULL,
    
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL, -- Quem avaliou
    target_id UUID REFERENCES public.profiles(id) NOT NULL, -- Quem foi avaliado (Empresa ou Montador)
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB DEFAULT '{}'::jsonb, -- { punctuality: 5, quality: 4 }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 AVAILABILITY (Agenda/Indisponibilidade)
CREATE TABLE IF NOT EXISTS public.availability_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    montador_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT, -- 'vacation', 'sick', 'busy'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. VIEWS DE SEGURANÇA (SECURITY DEFINER)
-- ==========================================
-- Estas views são essenciais para evitar "Infinite Recursion" em RLS
-- Elas permitem consultar dados sensíveis (como company_id) sem disparar RLS recursivo

CREATE OR REPLACE VIEW public.vw_profile_structure AS
SELECT 
    p.id, 
    p.role, 
    p.company_id,
    c.owner_id as company_owner_id
FROM public.profiles p
LEFT JOIN public.companies c ON p.company_id = c.id;

-- ==========================================
-- 7. TRIGGERS E FUNÇÕES
-- ==========================================

-- 7.1 Auto-Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name, avatar_url)
    VALUES (
        new.id, 
        new.email, 
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'montador'),
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger only if not exists (safe mechanism)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7.2 Update Updated_At Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 8. POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES
-- Ver: Todo mundo pode ver perfil básico (para listagens), mas idealmente restringir
-- Aqui vamos permitir leitura pública autenticada para simplificar o discovery
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

-- Editar: Apenas o dono
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 8.2 COMPANIES
-- Ver: Público autenticado
CREATE POLICY "Companies viewable by authenticated" 
ON public.companies FOR SELECT TO authenticated USING (true);

-- Criar: Qualquer parceiro sem empresa
CREATE POLICY "Partners can create company" 
ON public.companies FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.vw_profile_structure 
        WHERE id = auth.uid() AND role = 'partner' AND company_id IS NULL
    )
);

-- Editar: Apenas membros da empresa (simplificado para owner por enquanto)
CREATE POLICY "Company owner can update" 
ON public.companies FOR UPDATE 
USING (owner_id = auth.uid());

-- 8.3 SERVICES (Coração do Sistema)
-- INSERT: Apenas membros de empresa
CREATE POLICY "Company members can create services" 
ON public.services FOR INSERT 
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.vw_profile_structure WHERE id = auth.uid()
    )
);

-- SELECT: 
-- 1. Membros da empresa dona
-- 2. Montador atribuído
-- 3. Montador parceiro (se status = published)
CREATE POLICY "Service Visibility" 
ON public.services FOR SELECT 
USING (
    -- É da minha empresa?
    company_id IN (SELECT company_id FROM public.vw_profile_structure WHERE id = auth.uid())
    OR
    -- Sou o montador alocado?
    montador_id = auth.uid()
    OR
    -- Sou parceiro e está disponível? (Pull Model)
    (
        status = 'published' 
        AND 
        EXISTS (
            SELECT 1 FROM public.partnerships 
            WHERE montador_id = auth.uid() 
            AND company_id = services.company_id 
            AND status = 'active'
        )
    )
    OR
    -- Fallback: Se for 'open' público (opcional)
    (status = 'published' AND montador_id IS NULL)
);

-- UPDATE:
-- 1. Empresa: Pode editar tudo
-- 2. Montador: Pode aceitar (update montador_id e status)
CREATE POLICY "Service Update" 
ON public.services FOR UPDATE 
USING (
    -- Empresa
    company_id IN (SELECT company_id FROM public.vw_profile_structure WHERE id = auth.uid())
    OR
    -- Montador aceitando
    (
        status = 'published' 
        AND montador_id IS NULL 
        -- E precisa ser parceiro? Se sim, descomentar:
        -- AND EXISTS (SELECT 1 FROM public.partnerships WHERE montador_id = auth.uid() AND company_id = services.company_id)
    )
    OR
    -- Montador atualizando status (ex: in_progress -> completed)
    montador_id = auth.uid()
);

-- 8.4 PARTNERSHIPS
-- Ver: Membros do vínculo
CREATE POLICY "Partnership Visibility" 
ON public.partnerships FOR SELECT 
USING (
    montador_id = auth.uid() 
    OR 
    company_id IN (SELECT company_id FROM public.vw_profile_structure WHERE id = auth.uid())
);

-- Criar: Empresa convida
CREATE POLICY "Company creates partnership" 
ON public.partnerships FOR INSERT 
WITH CHECK (
    company_id IN (SELECT company_id FROM public.vw_profile_structure WHERE id = auth.uid())
);

-- Atualizar: Montador aceita/rejeita
CREATE POLICY "Montador updates partnership" 
ON public.partnerships FOR UPDATE 
USING (montador_id = auth.uid());

-- 8.5 REVIEWS
CREATE POLICY "Reviews visibility" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ==========================================
-- FIM DO SETUP
-- ==========================================
