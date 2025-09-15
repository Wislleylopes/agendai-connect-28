-- Update the handle_new_user function to also create a company record for professionals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, user_role, full_name, phone, address)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'client')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  );

  -- If it's a professional, also create a company record
  IF COALESCE(NEW.raw_user_meta_data->>'user_role', 'client') = 'professional' THEN
    INSERT INTO public.companies (
      professional_id, 
      company_name, 
      cnpj, 
      company_address
    )
    VALUES (
      (SELECT id FROM public.profiles WHERE user_id = NEW.id),
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      NEW.raw_user_meta_data->>'cnpj',
      COALESCE(NEW.raw_user_meta_data->>'company_address', '')
    );
  END IF;

  RETURN NEW;
END;
$function$