-- SCRIPT DE CORREÇÃO DE LOOP INFINITO (FIX_INFINITE_RECURSION.sql)
-- Remove policies recursivas na tabela users e aplica a correção segura conforme solicitado.
-- ATENÇÃO: Este script assume que a tabela se chama 'public.users'. 
-- Se sua tabela de perfis for 'public.profiles', substitua 'public.users' por 'public.profiles' antes de rodar.

DO $$
BEGIN
    -- 1. Remover as policies problemáticas (se existirem)
    -- O erro 'infinite recursion' vem daqui
    BEGIN
        DROP POLICY IF EXISTS "Users can only see their company data" ON public.users;
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela public.users não encontrada. Tentando public.profiles...';
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can see company users" ON public.users;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;

    -- 2. Criar policy simples e segura (Acesso ao próprio registro)
    -- Garante que o usuário sempre consiga ler/editar seus próprios dados sem travar
    BEGIN
        CREATE POLICY "User can access own row" 
        ON public.users 
        FOR ALL 
        USING (id = auth.uid()) 
        WITH CHECK (id = auth.uid());
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela public.users não existe. Pulando criação de policy.';
        -- Se quiser aplicar em profiles, descomente abaixo:
        -- CREATE POLICY "User can access own row" ON public.profiles ...
    END;

    -- 3. (Opcional/Recomendado) View para leitura por empresa sem recursão
    -- Isso permite filtrar por company_id sem causar o loop users -> policy -> users
    BEGIN
        CREATE OR REPLACE VIEW public.user_company AS 
        SELECT id, company_id 
        FROM public.users;
        
        -- Policy de leitura segura via View
        CREATE POLICY "Users can see company users" 
        ON public.users 
        FOR SELECT 
        USING ( 
          company_id = ( 
            SELECT company_id 
            FROM public.user_company 
            WHERE id = auth.uid() 
          ) 
        );
    EXCEPTION WHEN undefined_table THEN
        NULL; -- Ignora se a tabela não existir
    WHEN undefined_column THEN
        RAISE NOTICE 'Coluna company_id não encontrada em public.users.';
    END;

END $$;

-- Forçar recarregamento do cache de esquema do Supabase
NOTIFY pgrst, 'reload config';
