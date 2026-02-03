-- SCRIPT DE CORREÇÃO FINAL V2 (FIX_MISSING_COLUMNS.sql)
-- Executar no SQL Editor para garantir TODAS as colunas que o frontend usa

DO $$ 
BEGIN 
    -- 1. documents (Array de Texto)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'documents') THEN
        ALTER TABLE public.services ADD COLUMN documents TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- 2. service_details (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_details') THEN
        ALTER TABLE public.services ADD COLUMN service_details JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 3. client_info (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'client_info') THEN
        ALTER TABLE public.services ADD COLUMN client_info JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 4. category (Texto)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'category') THEN
        ALTER TABLE public.services ADD COLUMN category TEXT;
    END IF;

    -- 5. is_urgent (Booleano)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'is_urgent') THEN
        ALTER TABLE public.services ADD COLUMN is_urgent BOOLEAN DEFAULT FALSE;
    END IF;

    -- 6. required_skills (Array de Texto)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'required_skills') THEN
        ALTER TABLE public.services ADD COLUMN required_skills TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- 7. duration_hours (Numerico) - O erro atual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
        ALTER TABLE public.services ADD COLUMN duration_hours NUMERIC DEFAULT 1.0;
    END IF;

    -- 8. price (Decimal) - Garantia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'price') THEN
        ALTER TABLE public.services ADD COLUMN price DECIMAL(10,2);
    END IF;

    -- 9. scheduled_for (Timestamp) - Garantia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'scheduled_for') THEN
        ALTER TABLE public.services ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE;
    END IF;

END $$;

-- Forçar recarregamento do cache de esquema do Supabase
NOTIFY pgrst, 'reload config';
