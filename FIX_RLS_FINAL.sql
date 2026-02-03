-- SCRIPT DE CORREÇÃO FINAL V2 (FIX_RLS_FINAL.sql)
-- Adaptado para o esquema fornecido pelo usuário (tabelas profiles, services, companies)
-- 1. Garante que profiles tenha company_id
-- 2. Configura RLS usando profiles como fonte de verdade para o usuário logado

DO $$ 
BEGIN 
    -- A. Atualizar tabela PROFILES
    -- Adiciona company_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
        ALTER TABLE public.profiles ADD COLUMN company_id UUID;
        -- Para parceiros existentes, se não tiver company_id, vamos assumir temporariamente NULL
        -- Idealmente deveria haver uma tabela companies e um vínculo, mas para o RLS funcionar vamos garantir a coluna
    END IF;

    -- B. Atualizar tabela SERVICES
    -- Adiciona company_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'company_id') THEN
        ALTER TABLE public.services ADD COLUMN company_id UUID;
    END IF;

    -- Adiciona montador_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'montador_id') THEN
        ALTER TABLE public.services ADD COLUMN montador_id UUID REFERENCES public.profiles(id);
    END IF;

END $$;

-- C. Habilitar RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- D. Policies de Segurança

-- 1. INSERT: O usuário só pode criar serviços se enviar o company_id correto (igual ao do seu perfil)
DROP POLICY IF EXISTS "Company users can create services" ON public.services;
CREATE POLICY "Company users can create services" 
ON public.services 
FOR INSERT 
WITH CHECK ( 
   company_id = ( 
     SELECT company_id 
     FROM public.profiles 
     WHERE id = auth.uid() 
   ) 
);

-- 2. SELECT: Ver serviços da própria empresa
DROP POLICY IF EXISTS "Company users can read services" ON public.services;
CREATE POLICY "Company users can read services" 
ON public.services 
FOR SELECT 
USING ( 
   -- Regra 1: Usuário da empresa vê serviços da empresa
   (
     company_id IS NOT NULL 
     AND 
     company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
   )
   OR 
   -- Regra 2: Montador vê serviços abertos ou atribuídos a ele (sem restrição de empresa por enquanto para MVP)
   (
     (auth.uid() = montador_id) 
     OR 
     (status = 'open' OR status = 'published')
   )
);

-- 3. UPDATE: Atualizar serviços
DROP POLICY IF EXISTS "Company users can update services" ON public.services;
CREATE POLICY "Company users can update services" 
ON public.services 
FOR UPDATE 
USING ( 
   -- Dono da empresa pode editar
   (
     company_id IS NOT NULL 
     AND 
     company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
   )
   OR 
   -- Montador pode aceitar (update montador_id) se estiver aberto
   (montador_id IS NULL AND (status = 'open' OR status = 'published'))
   OR
   -- Montador pode editar se for o dono da tarefa (ex: mudar status para in_progress)
   montador_id = auth.uid()
);

-- 4. DELETE: Deletar serviços da própria empresa
DROP POLICY IF EXISTS "Company users can delete services" ON public.services;
CREATE POLICY "Company users can delete services" 
ON public.services 
FOR DELETE 
USING ( 
   company_id IS NOT NULL 
   AND 
   company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
);

-- Forçar recarregamento
NOTIFY pgrst, 'reload config';
