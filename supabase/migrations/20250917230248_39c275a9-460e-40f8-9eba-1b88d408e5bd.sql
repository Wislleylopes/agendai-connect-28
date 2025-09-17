-- Corrigir políticas RLS que causam recursão infinita

-- Remover a política problemática que causa recursão
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar nova política para admins sem recursão
-- Usar auth.jwt() para verificar user_role diretamente dos metadados do JWT
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  COALESCE(
    (auth.jwt() ->> 'user_role')::text = 'admin',
    false
  )
  OR auth.uid() = user_id
);