-- ATUALIZAÇÃO FASE 3 - SERVIÇOS E VÍNCULOS

-- 1. Tabela de Vínculos (Marcenaria <-> Montador)
-- Regra de Negócio 7: "Somente montadores aprovados... podem visualizar"
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  marcenaria_id UUID REFERENCES public.profiles(id) NOT NULL,
  montador_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(marcenaria_id, montador_id)
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Políticas de Vínculo
CREATE POLICY "Marcenaria ver seus montadores" ON public.partnerships
  FOR SELECT USING (auth.uid() = marcenaria_id);

CREATE POLICY "Montador ver suas parcerias" ON public.partnerships
  FOR SELECT USING (auth.uid() = montador_id);

CREATE POLICY "Marcenaria criar convite" ON public.partnerships
  FOR INSERT WITH CHECK (auth.uid() = marcenaria_id);

-- 2. Atualizar Tabela de Serviços (Garantir estrutura)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL, -- Quem criou (Marcenaria)
  montador_id UUID REFERENCES public.profiles(id), -- Quem aceitou (Montador)
  
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours NUMERIC,
  price DECIMAL(10,2),
  
  client_name TEXT,
  client_phone TEXT,
  address_full TEXT,
  
  status TEXT CHECK (status IN ('open', 'accepted', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Políticas de Serviços
-- 1. Marcenaria vê e gerencia seus próprios serviços
CREATE POLICY "Marcenaria manage own services" ON public.services
  FOR ALL USING (auth.uid() = owner_id);

-- 2. Montador vê serviços APENAS se tiver parceria ATIVA com o dono do serviço
-- Regra 7: "Somente montadores aprovados..."
CREATE POLICY "Montador view allowed services" ON public.services
  FOR SELECT USING (
    status = 'open' 
    AND 
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE montador_id = auth.uid() 
      AND marcenaria_id = services.owner_id
      AND status = 'active'
    )
  );

-- 3. Montador pode aceitar serviço (UPDATE montador_id e status)
CREATE POLICY "Montador accept service" ON public.services
  FOR UPDATE USING (
    status = 'open'
    AND
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE montador_id = auth.uid() 
      AND marcenaria_id = services.owner_id
      AND status = 'active'
    )
  );
