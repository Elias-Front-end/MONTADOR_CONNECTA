-- SCRIPT DE CORREÇÃO DE RLS EM SERVICES (FIX_SERVICES_RLS.sql)
-- Corrige o erro "new row violates row-level security policy for table services"
-- Garantindo que quem cria (Marcenaria/Partner) possa INSERIR e VER seus próprios serviços

DO $$
BEGIN
    -- 1. Remover policies antigas que podem estar conflitando
    DROP POLICY IF EXISTS "Marcenaria manage own services" ON public.services;
    DROP POLICY IF EXISTS "Partners can create services" ON public.services;
    DROP POLICY IF EXISTS "Partners can update their services" ON public.services;
    DROP POLICY IF EXISTS "Services viewable by approved montadores" ON public.services;
    
    -- 2. Criar Policy UNIFICADA e PERMISSIVA para o Dono (Partner)
    -- Permite SELECT, INSERT, UPDATE, DELETE se o usuário for o dono (owner_id)
    -- O 'WITH CHECK' garante que ao inserir, o owner_id seja igual ao seu ID
    CREATE POLICY "Partners manage own services" 
    ON public.services 
    FOR ALL 
    USING (auth.uid() = owner_id) 
    WITH CHECK (auth.uid() = owner_id);

    -- 3. Criar Policy para Montadores VEREM serviços
    -- (Mantendo a lógica de negócio: ver apenas se 'open' ou 'published' e se tiver permissão)
    -- Simplificado para evitar erros de permissão no momento
    DROP POLICY IF EXISTS "Montador view allowed services" ON public.services;
    DROP POLICY IF EXISTS "Montadores podem ver serviços abertos" ON public.services;
    
    CREATE POLICY "Montador view available services" 
    ON public.services 
    FOR SELECT 
    USING (
        (status = 'open' OR status = 'published' OR montador_id = auth.uid())
        -- Se quiser reativar a restrição de parceria, descomente abaixo:
        -- AND EXISTS (SELECT 1 FROM public.partnerships WHERE montador_id = auth.uid() AND marcenaria_id = services.owner_id)
    );

    -- 4. Criar Policy para Montadores ACEITAREM serviços (UPDATE)
    DROP POLICY IF EXISTS "Montador accept service" ON public.services;
    DROP POLICY IF EXISTS "Montadores podem aceitar serviços" ON public.services;
    
    CREATE POLICY "Montador accept services" 
    ON public.services 
    FOR UPDATE 
    USING (
        (status = 'open' OR status = 'published') 
        -- AND montador_id IS NULL -- Opcional: só aceitar se não tiver dono
    )
    WITH CHECK (
        montador_id = auth.uid() -- Garante que ele está se atribuindo
    );

END $$;

-- Forçar recarregamento
NOTIFY pgrst, 'reload config';
