-- Criar dados de teste para usuário profissional de podologia
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'podologia@teste.com',
  '$2a$10$YourHashedPasswordHere', -- senha: 123456789
  now(),
  now(),
  now(),
  '{"user_role": "professional", "full_name": "Dr. Maria Silva", "phone": "(11) 99999-1234", "company_name": "Clínica de Podologia Silva", "company_address": "Rua das Flores, 123 - São Paulo, SP"}',
  'authenticated',
  'authenticated'
);

-- Criar perfil do profissional
INSERT INTO public.profiles (
  id,
  user_id,
  user_role,
  full_name,
  phone,
  address,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'professional',
  'Dr. Maria Silva',
  '(11) 99999-1234',
  'Rua das Flores, 123 - São Paulo, SP',
  now(),
  now()
);

-- Criar empresa de podologia
INSERT INTO public.companies (
  id,
  professional_id,
  company_name,
  cnpj,
  company_address,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid),
  'Clínica de Podologia Silva',
  '12.345.678/0001-90',
  'Rua das Flores, 123 - São Paulo, SP',
  now(),
  now()
);

-- Criar categoria de podologia se não existir
INSERT INTO public.service_categories (
  id,
  name,
  description,
  color,
  icon_name,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Podologia',
  'Cuidados com os pés e unhas',
  '#10b981',
  'activity',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Criar serviços de podologia
INSERT INTO public.services (
  id,
  professional_id,
  name,
  description,
  price,
  duration,
  category_id,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid),
  'Pedicure Terapêutica',
  'Cuidado completo dos pés com corte de unhas, remoção de calosidades e hidratação',
  85.00,
  60,
  (SELECT id FROM public.service_categories WHERE name = 'Podologia'),
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid),
  'Tratamento de Unha Encravada',
  'Procedimento especializado para tratamento de unhas encravadas',
  120.00,
  45,
  (SELECT id FROM public.service_categories WHERE name = 'Podologia'),
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid),
  'Limpeza de Pele dos Pés',
  'Esfoliação e hidratação profunda dos pés',
  65.00,
  40,
  (SELECT id FROM public.service_categories WHERE name = 'Podologia'),
  true,
  now(),
  now()
);

-- Criar disponibilidade do profissional (Segunda a Sexta, 8h às 17h)
INSERT INTO public.professional_availability (
  id,
  professional_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at,
  updated_at
) VALUES 
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid), 1, '08:00', '17:00', true, now(), now()),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid), 2, '08:00', '17:00', true, now(), now()),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid), 3, '08:00', '17:00', true, now(), now()),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid), 4, '08:00', '17:00', true, now(), now()),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid), 5, '08:00', '17:00', true, now(), now());