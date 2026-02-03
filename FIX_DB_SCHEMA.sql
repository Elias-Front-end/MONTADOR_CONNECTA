-- SCRIPT DE CORREÇÃO DE ESQUEMA (FIX_DB_SCHEMA.sql)
-- Execute este script no SQL Editor do Supabase para corrigir o erro "Could not find column"

-- 1. Garantir que a tabela services existe
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar TODAS as colunas necessárias (Idempotente: só adiciona se não existir)
DO $$ 
BEGIN 
    -- Colunas da Fase 3
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'owner_id') THEN
        ALTER TABLE public.services ADD COLUMN owner_id UUID REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'montador_id') THEN
        ALTER TABLE public.services ADD COLUMN montador_id UUID REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'title') THEN
        ALTER TABLE public.services ADD COLUMN title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'description') THEN
        ALTER TABLE public.services ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'scheduled_for') THEN
        ALTER TABLE public.services ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
        ALTER TABLE public.services ADD COLUMN duration_hours NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'price') THEN
        ALTER TABLE public.services ADD COLUMN price DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'client_name') THEN
        ALTER TABLE public.services ADD COLUMN client_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'client_phone') THEN
        ALTER TABLE public.services ADD COLUMN client_phone TEXT;
    END IF;

    -- O ERRO REPORTADO ESTÁ AQUI: address_full
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'address_full') THEN
        ALTER TABLE public.services ADD COLUMN address_full TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'status') THEN
        ALTER TABLE public.services ADD COLUMN status TEXT DEFAULT 'open';
    END IF;

    -- Colunas da Fase 6 (Novas)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'category') THEN
        ALTER TABLE public.services ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'is_urgent') THEN
        ALTER TABLE public.services ADD COLUMN is_urgent BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'client_info') THEN
        ALTER TABLE public.services ADD COLUMN client_info JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_details') THEN
        ALTER TABLE public.services ADD COLUMN service_details JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'documents') THEN
        ALTER TABLE public.services ADD COLUMN documents TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- 3. Recarregar o cache do Schema (Importante para o PostgREST reconhecer as mudanças)
NOTIFY pgrst, 'reload config';
