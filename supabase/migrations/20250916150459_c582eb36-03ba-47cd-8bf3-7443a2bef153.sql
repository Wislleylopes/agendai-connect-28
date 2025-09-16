-- Correções de segurança: Ajustar políticas RLS para restringir visibilidade de dados sensíveis

-- 1. Atualizar política de visualização de serviços para usuários autenticados apenas
DROP POLICY IF EXISTS "Everyone can view active services" ON public.services;

CREATE POLICY "Authenticated users can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

-- 2. Atualizar política de disponibilidade profissional para usuários autenticados
DROP POLICY IF EXISTS "Everyone can view professional availability" ON public.professional_availability;

CREATE POLICY "Authenticated users can view available times" 
ON public.professional_availability 
FOR SELECT 
USING (is_available = true AND auth.uid() IS NOT NULL);

-- 3. Atualizar política de slots de tempo para usuários autenticados
DROP POLICY IF EXISTS "Everyone can view non-blocked time slots" ON public.time_slots;

CREATE POLICY "Authenticated users can view non-blocked time slots" 
ON public.time_slots 
FOR SELECT 
USING (is_blocked = false AND auth.uid() IS NOT NULL);

-- 4. Criar tabela para categorias de serviços
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Adicionar coluna de categoria aos serviços
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.service_categories(id);

-- 6. Criar tabela para avaliações de serviços
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  service_id UUID NOT NULL,
  appointment_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id) -- Uma avaliação por agendamento
);

-- 7. Enable RLS para as novas tabelas
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas para categorias (público para leitura)
CREATE POLICY "Everyone can view service categories" 
ON public.service_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 9. Criar políticas para avaliações
CREATE POLICY "Clients can create reviews for their appointments" 
ON public.service_reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = service_reviews.client_id 
    AND user_id = auth.uid() 
    AND user_role = 'client'
  )
  AND EXISTS (
    SELECT 1 FROM appointments 
    WHERE id = service_reviews.appointment_id 
    AND client_id = service_reviews.client_id
    AND professional_id = service_reviews.professional_id
    AND service_id = service_reviews.service_id
    AND status = 'completed'
  )
);

CREATE POLICY "Users can view relevant reviews" 
ON public.service_reviews 
FOR SELECT 
USING (
  -- Clientes podem ver suas próprias avaliações
  client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR 
  -- Profissionais podem ver avaliações dos seus serviços
  professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  -- Todos usuários autenticados podem ver avaliações para escolher serviços
  (auth.uid() IS NOT NULL)
);

CREATE POLICY "Clients can update their own reviews" 
ON public.service_reviews 
FOR UPDATE 
USING (
  client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- 10. Criar triggers para updated_at
CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at
BEFORE UPDATE ON public.service_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Inserir categorias padrão
INSERT INTO public.service_categories (name, description, icon_name, color) VALUES
('Saúde e Bem-estar', 'Serviços relacionados à saúde física e mental', 'Heart', '#ef4444'),
('Beleza e Estética', 'Cuidados com a aparência e estética', 'Sparkles', '#ec4899'),
('Consultoria', 'Serviços de consultoria e assessoria', 'Briefcase', '#3b82f6'),
('Educação', 'Aulas particulares e cursos', 'GraduationCap', '#10b981'),
('Tecnologia', 'Serviços de TI e desenvolvimento', 'Code', '#8b5cf6'),
('Casa e Serviços', 'Manutenção e serviços domésticos', 'Home', '#f59e0b'),
('Jurídico', 'Serviços advocatícios e jurídicos', 'Scale', '#6b7280'),
('Financeiro', 'Consultoria financeira e contábil', 'Calculator', '#059669')
ON CONFLICT DO NOTHING;

-- 12. Criar dados de demonstração para profissionais
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
(gen_random_uuid(), 'dra.silva@exemplo.com', crypt('senha123', gen_salt('bf')), now(), now(), now(), 
 '{"user_role": "professional", "full_name": "Dra. Ana Silva", "phone": "(11) 99999-1111", "company_name": "Clínica Silva", "company_address": "Rua das Flores, 123 - São Paulo, SP"}'),
(gen_random_uuid(), 'prof.santos@exemplo.com', crypt('senha123', gen_salt('bf')), now(), now(), now(), 
 '{"user_role": "professional", "full_name": "Prof. Carlos Santos", "phone": "(11) 99999-2222", "company_name": "Santos Consultoria", "company_address": "Av. Paulista, 456 - São Paulo, SP"}'),
(gen_random_uuid(), 'joao.dev@exemplo.com', crypt('senha123', gen_salt('bf')), now(), now(), now(), 
 '{"user_role": "professional", "full_name": "João Desenvolvedor", "phone": "(11) 99999-3333", "company_name": "TechSolutions", "company_address": "Rua dos Programadores, 789 - São Paulo, SP"}')
ON CONFLICT DO NOTHING;