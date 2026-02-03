-- SCRIPT DE CORREÇÃO DE LOOP INFINITO EM PROFILES V2 (FIX_PROFILES_RECURSION.sql)
-- Adiciona DROP POLICY antes de criar para evitar erro de duplicidade

DO $$
BEGIN
    -- 1. Limpar policies antigas/problemáticas de PROFILES
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles; -- Variação de nome comum
    DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Partners and Admins can see all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Montadores can see Partners" ON public.profiles;
    DROP POLICY IF EXISTS "Users can only see their company data" ON public.profiles;
    DROP POLICY IF EXISTS "Users can see company users" ON public.profiles;
    DROP POLICY IF EXISTS "Users can see company profiles" ON public.profiles;

    -- 2. Criar VIEW auxiliar para leitura segura de company_id (EVITA O LOOP)
    CREATE OR REPLACE VIEW public.profile_company_view AS 
    SELECT id, company_id, role 
    FROM public.profiles;

    -- 3. Recriar Policies de PROFILES de forma segura

    -- A. Ver o próprio perfil
    CREATE POLICY "Users can see own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

    -- B. Editar o próprio perfil
    CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

    -- C. Ver perfis da MESMA EMPRESA (Usando a View!)
    CREATE POLICY "Users can see company profiles" 
    ON public.profiles FOR SELECT 
    USING (
        company_id IS NOT NULL 
        AND 
        company_id = (
            SELECT company_id 
            FROM public.profile_company_view 
            WHERE id = auth.uid()
        )
    );
    
    -- 4. Atualizar Policy de SERVICES para usar a View também (Segurança Extra)
    
    -- INSERT (Seguro)
    DROP POLICY IF EXISTS "Company users can create services" ON public.services;
    CREATE POLICY "Company users can create services" ON public.services FOR INSERT 
    WITH CHECK ( 
       company_id = (SELECT company_id FROM public.profile_company_view WHERE id = auth.uid()) 
    );

    -- SELECT (Seguro)
    DROP POLICY IF EXISTS "Company users can read services" ON public.services;
    CREATE POLICY "Company users can read services" ON public.services FOR SELECT 
    USING ( 
       (
         company_id IS NOT NULL 
         AND 
         company_id = (SELECT company_id FROM public.profile_company_view WHERE id = auth.uid())
       )
       OR 
       ((auth.uid() = montador_id) OR (status = 'open' OR status = 'published'))
    );

    -- UPDATE (Seguro)
    DROP POLICY IF EXISTS "Company users can update services" ON public.services;
    CREATE POLICY "Company users can update services" ON public.services FOR UPDATE 
    USING ( 
       (
         company_id IS NOT NULL 
         AND 
         company_id = (SELECT company_id FROM public.profile_company_view WHERE id = auth.uid())
       )
       OR 
       (montador_id IS NULL AND (status = 'open' OR status = 'published'))
       OR
       montador_id = auth.uid()
    );

END $$;

NOTIFY pgrst, 'reload config';
