-- Create test user with unique data
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users
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
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'teste@exemplo.com',
    crypt('teste123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"user_role": "client", "full_name": "Usuario Teste"}',
    false,
    'authenticated'
  );

  -- Insert into profiles
  INSERT INTO profiles (
    user_id,
    user_role,
    full_name,
    phone,
    address
  ) VALUES (
    new_user_id,
    'client',
    'Usuario Teste',
    '(11) 99999-9999',
    'Rua Teste, 123'
  );
END $$;