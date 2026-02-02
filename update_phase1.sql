-- ATUALIZAÇÃO FASE 1 - MVP

-- Garantir que a tabela de perfis tenha todos os campos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Tabela de Bloqueios de Agenda (Para o Montador bloquear dias manualmente)
CREATE TABLE IF NOT EXISTS public.agenda_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  montador_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT, -- 'personal', 'vacation', etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para Agenda
ALTER TABLE public.agenda_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Montador ver e gerenciar sua agenda" ON public.agenda_blocks
  FOR ALL USING (auth.uid() = montador_id);

-- Atualizar tabela de serviços para ter mais detalhes
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2), -- Valor do serviço (opcional)
ADD COLUMN IF NOT EXISTS address_full TEXT, -- Endereço completo da montagem
ADD COLUMN IF NOT EXISTS client_name TEXT, -- Nome do cliente final
ADD COLUMN IF NOT EXISTS client_phone TEXT; -- Contato do cliente final

-- Política para Montadores verem serviços APENAS se tiverem vínculo com a Marcenaria
-- Esta é uma política avançada. Para o MVP, vamos permitir ver se o status for 'open'
-- E futuramente restringimos com base na tabela service_links
CREATE POLICY "Montadores podem ver serviços abertos" ON public.services
  FOR SELECT USING (
    status = 'open' 
    AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'montador'
    )
  );

CREATE POLICY "Montadores podem aceitar serviços" ON public.services
  FOR UPDATE USING (
    status = 'open'
    AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'montador'
    )
  );
