-- ─── PRICING SEED ─────────────────────────────────────────────────────────────
insert into pricing (booking_type, price_per_unit, unit_label) values
  ('hourly',  25.00,  'por hora'),
  ('daily',   120.00, 'por dia'),
  ('weekly',  350.00, 'por semana'),
  ('monthly', 900.00, 'por mês')
on conflict (booking_type) do update set price_per_unit = excluded.price_per_unit;

-- ─── SPACES SEED ──────────────────────────────────────────────────────────────
insert into spaces (id, name, description, amenities) values
  ('a1000000-0000-0000-0000-000000000001', 'Cadeira 1 — Rosa',
   'Estação premium com cadeira ergonômica e espelho iluminado com LED.',
   array['Espelho iluminado', 'Lavatório privativo', 'Tomadas 110V e 220V', 'Bancada ampla', 'Wi-Fi']),
  ('a1000000-0000-0000-0000-000000000002', 'Cadeira 2 — Dourada',
   'Estação central com iluminação natural e bancada extra-larga.',
   array['Espelho panorâmico', 'Bancada extra-larga', 'Tomadas 110V e 220V', 'Luz natural', 'Wi-Fi']),
  ('a1000000-0000-0000-0000-000000000003', 'Cadeira 3 — Pérola',
   'Estação aconchegante com lavatório e ambiente climatizado.',
   array['Espelho iluminado', 'Lavatório', 'Ar-condicionado', 'Tomadas 110V e 220V', 'Wi-Fi'])
on conflict (id) do nothing;

-- ─── DEMO BOOKINGS (execute APÓS criar o usuário admin) ──────────────────────
-- Popula reservas de demonstração para hoje e os próximos 3 dias.
-- Cadeira 1: ocupada 09–11 e 14–16 hoje
-- Cadeira 2: ocupada 08–12 hoje
-- Cadeira 3: livre hoje (para mostrar os 3 estados)
DO $$
DECLARE
  demo_uid uuid;
BEGIN
  SELECT id INTO demo_uid FROM auth.users WHERE email = 'admin@espacoela.com.br' LIMIT 1;
  IF demo_uid IS NULL THEN
    RAISE NOTICE 'Usuário admin não encontrado — seed de demo ignorado.';
    RETURN;
  END IF;

  -- Limpa demos anteriores para poder re-executar com segurança
  DELETE FROM bookings WHERE notes = '[DEMO]';

  INSERT INTO bookings (space_id, user_id, start_datetime, end_datetime, booking_type, status, total_price, notes) VALUES
    -- Hoje: Cadeira 1 — 09h–11h
    ('a1000000-0000-0000-0000-000000000001', demo_uid,
     (CURRENT_DATE + interval '9 hours'), (CURRENT_DATE + interval '11 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- Hoje: Cadeira 1 — 14h–16h
    ('a1000000-0000-0000-0000-000000000001', demo_uid,
     (CURRENT_DATE + interval '14 hours'), (CURRENT_DATE + interval '16 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- Hoje: Cadeira 2 — 08h–12h
    ('a1000000-0000-0000-0000-000000000002', demo_uid,
     (CURRENT_DATE + interval '8 hours'), (CURRENT_DATE + interval '12 hours'),
     'hourly', 'confirmed', 100.00, '[DEMO]'),
    -- Amanhã: Cadeira 1 — 10h–14h
    ('a1000000-0000-0000-0000-000000000001', demo_uid,
     (CURRENT_DATE + interval '1 day' + interval '10 hours'),
     (CURRENT_DATE + interval '1 day' + interval '14 hours'),
     'hourly', 'confirmed', 100.00, '[DEMO]'),
    -- Amanhã: Cadeira 2 — 13h–17h
    ('a1000000-0000-0000-0000-000000000002', demo_uid,
     (CURRENT_DATE + interval '1 day' + interval '13 hours'),
     (CURRENT_DATE + interval '1 day' + interval '17 hours'),
     'hourly', 'confirmed', 100.00, '[DEMO]'),
    -- Depois de amanhã: Cadeira 3 — diária completa
    ('a1000000-0000-0000-0000-000000000003', demo_uid,
     (CURRENT_DATE + interval '2 days' + interval '8 hours'),
     (CURRENT_DATE + interval '2 days' + interval '20 hours'),
     'daily', 'confirmed', 120.00, '[DEMO]');

  RAISE NOTICE 'Seed de demo inserido com sucesso.';
END $$;

-- ─── NOTE: User/booking seeds must be created via Supabase Auth UI or API ─────
-- Run the following after creating the users in Supabase Auth dashboard:
--
-- Admin: admin@espacoela.com.br / Admin@123456
-- Autônoma 1: ana@autonoma.com / Ana@123456 (Cabeleireira)
-- Autônoma 2: bia@autonoma.com / Bia@123456 (Manicure)
-- Autônoma 3: carol@autonoma.com / Carol@123456 (Designer de sobrancelhas)
--
-- After creating them in Auth, run:
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@espacoela.com.br');
