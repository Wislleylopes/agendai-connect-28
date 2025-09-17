-- Corrigir recursão infinita de uma vez por todas
-- Remover todas as políticas problemáticas e recriar corretamente

-- Desativar RLS temporariamente para limpar as políticas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas atuais
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recriar políticas sem recursão
-- Política para visualizar perfil próprio
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para inserir perfil próprio
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para atualizar perfil próprio
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para admins usando JWT diretamente
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.jwt() ->> 'user_role')::text = 'admin'
);

-- Reativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;