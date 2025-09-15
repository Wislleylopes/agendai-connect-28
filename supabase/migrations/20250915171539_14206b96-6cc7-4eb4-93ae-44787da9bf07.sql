-- Create test user directly in database
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'teste@teste.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"user_role": "client", "full_name": "Usuario Teste"}',
  false,
  'authenticated'
);

-- Create corresponding profile
INSERT INTO profiles (
  user_id,
  user_role,
  full_name,
  phone,
  address
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'teste@teste.com'),
  'client',
  'Usuario Teste',
  '(11) 99999-9999',
  'Rua Teste, 123'
);