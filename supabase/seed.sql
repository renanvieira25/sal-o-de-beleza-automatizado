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
