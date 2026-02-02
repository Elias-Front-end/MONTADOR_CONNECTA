-- ATUALIZAÇÃO FASE 4 - CONTROLE DE ACESSO E QUALIFICAÇÕES

-- 1. Adicionar colunas de Qualificações
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';

-- 2. Atualizar Políticas de Segurança da Tabela PROFILES
-- Regra: Montadores não podem ver lista de outros montadores.
-- Apenas Partners e Admins podem ver todos os perfis. Montadores veem apenas o seu e os de partners (para ver detalhes da empresa).

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can see own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Partners and Admins can see all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('partner', 'admin')
    )
  );

CREATE POLICY "Montadores can see Partners" ON public.profiles
  FOR SELECT USING (
    role = 'partner'
  );

-- 3. Atualizar Políticas de Segurança da Tabela SERVICES
-- Regra: Montador só vê serviço se tiver as qualificações necessárias E (opcionalmente) o vínculo.
-- Vamos assumir que a regra de Vínculo (Fase 3) continua valendo, e adicionamos a de Qualificação.

DROP POLICY IF EXISTS "Montador view allowed services" ON public.services;

CREATE POLICY "Montador view qualified services" ON public.services
  FOR SELECT USING (
    status = 'open' 
    AND 
    (
      -- O serviço não exige skills OU o montador tem TODAS as skills exigidas
      required_skills IS NULL 
      OR 
      required_skills = '{}'
      OR
      required_skills <@ (SELECT skills FROM public.profiles WHERE id = auth.uid())
    )
    AND 
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE montador_id = auth.uid() 
      AND marcenaria_id = services.owner_id
      AND status = 'active'
    )
  );

-- Atualizar política de aceite também
DROP POLICY IF EXISTS "Montador accept service" ON public.services;

CREATE POLICY "Montador accept qualified service" ON public.services
  FOR UPDATE USING (
    status = 'open'
    AND
    (
      required_skills IS NULL 
      OR 
      required_skills = '{}'
      OR
      required_skills <@ (SELECT skills FROM public.profiles WHERE id = auth.uid())
    )
    AND
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE montador_id = auth.uid() 
      AND marcenaria_id = services.owner_id
      AND status = 'active'
    )
  );
