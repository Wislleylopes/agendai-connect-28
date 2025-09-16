-- Adicionar dados de demonstração aos serviços criados
WITH demo_professionals AS (
  SELECT p.id as professional_id, p.full_name
  FROM profiles p
  WHERE p.user_role = 'professional'
  LIMIT 3
),
demo_categories AS (
  SELECT id, name FROM service_categories
)
INSERT INTO services (professional_id, name, description, price, duration, category_id, is_active)
SELECT 
  dp.professional_id,
  CASE 
    WHEN dp.full_name = 'Dra. Ana Silva' THEN 
      CASE 
        WHEN dc.name = 'Saúde e Bem-estar' THEN 'Consulta Clínica Geral'
        WHEN dc.name = 'Beleza e Estética' THEN 'Dermatologia Estética'
      END
    WHEN dp.full_name = 'Prof. Carlos Santos' THEN
      CASE 
        WHEN dc.name = 'Consultoria' THEN 'Consultoria Empresarial'
        WHEN dc.name = 'Educação' THEN 'Mentoria Executiva'
      END
    WHEN dp.full_name = 'João Desenvolvedor' THEN
      CASE 
        WHEN dc.name = 'Tecnologia' THEN 'Desenvolvimento Web'
        WHEN dc.name = 'Consultoria' THEN 'Consultoria em TI'
      END
  END as service_name,
  CASE 
    WHEN dp.full_name = 'Dra. Ana Silva' THEN 
      CASE 
        WHEN dc.name = 'Saúde e Bem-estar' THEN 'Consulta médica completa com exames e orientações'
        WHEN dc.name = 'Beleza e Estética' THEN 'Tratamentos estéticos e cuidados com a pele'
      END
    WHEN dp.full_name = 'Prof. Carlos Santos' THEN
      CASE 
        WHEN dc.name = 'Consultoria' THEN 'Consultoria estratégica para empresas de todos os portes'
        WHEN dc.name = 'Educação' THEN 'Desenvolvimento de lideranças e soft skills'
      END
    WHEN dp.full_name = 'João Desenvolvedor' THEN
      CASE 
        WHEN dc.name = 'Tecnologia' THEN 'Desenvolvimento de sites e sistemas web modernos'
        WHEN dc.name = 'Consultoria' THEN 'Análise e implementação de soluções tecnológicas'
      END
  END as description,
  CASE 
    WHEN dp.full_name = 'Dra. Ana Silva' THEN 
      CASE 
        WHEN dc.name = 'Saúde e Bem-estar' THEN 150.00
        WHEN dc.name = 'Beleza e Estética' THEN 200.00
      END
    WHEN dp.full_name = 'Prof. Carlos Santos' THEN
      CASE 
        WHEN dc.name = 'Consultoria' THEN 250.00
        WHEN dc.name = 'Educação' THEN 180.00
      END
    WHEN dp.full_name = 'João Desenvolvedor' THEN
      CASE 
        WHEN dc.name = 'Tecnologia' THEN 120.00
        WHEN dc.name = 'Consultoria' THEN 200.00
      END
  END as price,
  CASE 
    WHEN dp.full_name = 'Dra. Ana Silva' THEN 
      CASE 
        WHEN dc.name = 'Saúde e Bem-estar' THEN 60
        WHEN dc.name = 'Beleza e Estética' THEN 90
      END
    WHEN dp.full_name = 'Prof. Carlos Santos' THEN
      CASE 
        WHEN dc.name = 'Consultoria' THEN 120
        WHEN dc.name = 'Educação' THEN 90
      END
    WHEN dp.full_name = 'João Desenvolvedor' THEN
      CASE 
        WHEN dc.name = 'Tecnologia' THEN 60
        WHEN dc.name = 'Consultoria' THEN 90
      END
  END as duration,
  dc.id as category_id,
  true as is_active
FROM demo_professionals dp
CROSS JOIN demo_categories dc
WHERE 
  (dp.full_name = 'Dra. Ana Silva' AND dc.name IN ('Saúde e Bem-estar', 'Beleza e Estética')) OR
  (dp.full_name = 'Prof. Carlos Santos' AND dc.name IN ('Consultoria', 'Educação')) OR
  (dp.full_name = 'João Desenvolvedor' AND dc.name IN ('Tecnologia', 'Consultoria'))
ON CONFLICT DO NOTHING;

-- Adicionar disponibilidade para os profissionais demo
WITH demo_professionals AS (
  SELECT p.id as professional_id, p.full_name
  FROM profiles p
  WHERE p.user_role = 'professional'
  LIMIT 3
)
INSERT INTO professional_availability (professional_id, day_of_week, start_time, end_time, is_available)
SELECT 
  dp.professional_id,
  generate_series(1, 5) as day_of_week, -- Segunda a sexta
  '08:00'::time as start_time,
  '18:00'::time as end_time,
  true as is_available
FROM demo_professionals dp
ON CONFLICT DO NOTHING;