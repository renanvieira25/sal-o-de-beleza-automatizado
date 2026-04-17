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
-- Resultado visual:
--   Hoje       → Cadeira 1 parcial (10–12h), Cadeira 2 parcial (14–16h), Cadeira 3 livre
--   +2 dias    → Cadeira 1 parcial (09–11h)
--   +5 dias    → Cadeira 2 parcial (13–15h)
--   +8 dias    → Cadeira 1 parcial (10–12h), Cadeira 3 parcial (15–17h)
--   Demais dias → verdes (livres)
DO $$
DECLARE
  demo_uid uuid;
BEGIN
  SELECT id INTO demo_uid FROM auth.users WHERE email = 'admin@espacoela.com.br' LIMIT 1;
  IF demo_uid IS NULL THEN
    RAISE NOTICE 'Usuário admin não encontrado — seed de demo ignorado.';
    RETURN;
  END IF;

  DELETE FROM bookings WHERE notes = '[DEMO]';

  INSERT INTO bookings (space_id, user_id, start_datetime, end_datetime, booking_type, status, total_price, notes) VALUES
    -- Hoje: Cadeira 1 — 10h–12h (parcial)
    ('a1000000-0000-0000-0000-000000000001', demo_uid,
     (CURRENT_DATE + interval '10 hours'), (CURRENT_DATE + interval '12 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- Hoje: Cadeira 2 — 14h–16h (parcial)
    ('a1000000-0000-0000-0000-000000000002', demo_uid,
     (CURRENT_DATE + interval '14 hours'), (CURRENT_DATE + interval '16 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- +2 dias: Cadeira 1 — 09h–11h
    ('a1000000-0000-0000-0000-000000000001', demo_uid,
     (CURRENT_DATE + interval '2 days' + interval '9 hours'),
     (CURRENT_DATE + interval '2 days' + interval '11 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- +5 dias: Cadeira 2 — 13h–15h
    ('a1000000-0000-0000-0000-000000000002', demo_uid,
     (CURRENT_DATE + interval '5 days' + interval '13 hours'),
     (CURRENT_DATE + interval '5 days' + interval '15 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- +8 dias: Cadeira 1 — 10h–12h
    ('a1000000-0000-0000-0000-000000000001', demo_uid,
     (CURRENT_DATE + interval '8 days' + interval '10 hours'),
     (CURRENT_DATE + interval '8 days' + interval '12 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]'),
    -- +8 dias: Cadeira 3 — 15h–17h
    ('a1000000-0000-0000-0000-000000000003', demo_uid,
     (CURRENT_DATE + interval '8 days' + interval '15 hours'),
     (CURRENT_DATE + interval '8 days' + interval '17 hours'),
     'hourly', 'confirmed', 50.00, '[DEMO]');

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
