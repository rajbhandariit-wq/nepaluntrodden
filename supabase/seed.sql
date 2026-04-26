-- ══════════════════════════════════════════════════════════════
-- Nepal Untrodden — Seed Data
-- Run AFTER schema.sql in the Supabase SQL editor
-- ══════════════════════════════════════════════════════════════

-- ── Guides ────────────────────────────────────────────────────
insert into guides (id, name, avatar_url, bio, rating, review_count, experience_years, languages, trips_completed, badge_gov_id, badge_first_aid, badge_cooperative, badge_police_check) values
(
  '11111111-1111-1111-1111-111111111111',
  'Ram Bahadur Thapa',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop',
  'Born in Sindhupalchok, I have guided treks to Panch Pokhari and surrounding sacred valleys for 8 years. I know every trail, spring, and shrine.',
  4.9, 142, 8,
  array['English','Nepali','Hindi'],
  320, true, true, true, true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Mingma Sherpa',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
  'Raised in a Sherpa family in the Khumbu valley, I specialize in remote high-altitude routes away from the Everest crowds.',
  4.8, 98, 12,
  array['English','Nepali','Tibetan'],
  480, true, true, true, false
),
(
  '33333333-3333-3333-3333-333333333333',
  'Sita Gurung',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop',
  'I run my family homestay on Khopra Ridge and offer stays with home-cooked meals, mountain views, and stories passed through generations.',
  4.9, 89, 6,
  array['English','Nepali'],
  0, true, true, true, true
)
on conflict (id) do nothing;

-- ── Listings ──────────────────────────────────────────────────
insert into listings (id, type, title, slug, region, district, description, images, guide_id, rating, review_count, difficulty, duration_days, max_group_size, max_altitude_m, price_per_person, currency, included, excluded, cultural_note, best_months, tags, is_hidden_gem, is_featured, latitude, longitude) values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'trek',
  'Panch Pokhari Trek',
  'panch-pokhari-trek',
  'Bagmati', 'Sindhupalchok',
  'A remote 6-day trek to five sacred glacial lakes nestled above 4,000m in the hills of Sindhupalchok. Very few tourists reach this valley — you will share it only with yak herders and pilgrims. The trail winds through rhododendron forests, high alpine meadows, and past ancient stone shrines.',
  array[
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop'
  ],
  '11111111-1111-1111-1111-111111111111',
  4.9, 142, 'moderate', 6, 6, 4100, 350, 'USD',
  array['Licensed guide','Trekking permits','Teahouse accommodation','Breakfast & dinner'],
  array['Travel insurance','Personal gear','Drinks & snacks','Tips'],
  'These are sacred Hindu-Buddhist lakes. No swimming, no littering near the shrines. Cover shoulders when passing temples.',
  array['Oct','Nov','Mar','Apr'],
  array['Sacred sites','High altitude','Remote','Pilgrimage'],
  true, true, 27.93, 85.77
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'homestay',
  'Sita''s Homestay — Khopra Ridge',
  'sitas-homestay-khopra-ridge',
  'Gandaki', 'Kaski',
  'Stay with Sita''s family in a traditional stone house perched on Khopra Ridge at 3,660m. Wake to direct views of Dhaulagiri and Nilgiri. Sita prepares all meals from her garden — organic dal bhat, seasonal vegetables, and fresh milk from the family''s cows.',
  array[
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=500&fit=crop'
  ],
  '33333333-3333-3333-3333-333333333333',
  4.8, 89, null, null, null, null, 12, 'USD',
  array['Private room','Breakfast & dinner','Hot shower','Village walk'],
  array['Alcohol','Laundry','Tips'],
  'Remove shoes before entering the house. Ask before photographing family members. Meals are served at set times.',
  array['Oct','Nov','Dec','Mar','Apr','May'],
  array['Mountain views','Family stay','Organic food','Peaceful'],
  true, false, 28.53, 83.69
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'trek',
  'Tamang Heritage Trail',
  'tamang-heritage-trail',
  'Bagmati', 'Rasuwa',
  'A 5-day cultural immersion through Tamang villages in Rasuwa district. Visit ancient gompas, watch traditional weaving, share meals with Tamang families, and cross high passes with views of Langtang Himal.',
  array[
    'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518544866330-95a2ab4e7482?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1498659911133-a2353fdc1468?w=800&h=500&fit=crop'
  ],
  '22222222-2222-2222-2222-222222222222',
  4.7, 56, 'easy', 5, 8, 3750, 280, 'USD',
  array['Licensed guide','Homestay nights','All meals','Cultural program'],
  array['Transport to trailhead','Personal gear','Insurance'],
  'Clockwise around mani walls and stupas. Ask permission before entering a gompa. Dress modestly in villages.',
  array['Mar','Apr','May','Oct','Nov'],
  array['Culture','Villages','Gompa','Easy terrain'],
  true, false, 28.19, 85.31
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'experience',
  'Organic Farm Lunch & Cooking Class — Tansen',
  'organic-farm-lunch-tansen',
  'Lumbini', 'Palpa',
  'Spend a morning on an organic hilltop farm in the medieval town of Tansen. Help harvest seasonal vegetables, grind spices on a traditional stone mill, and cook a full Newari meal from scratch.',
  array[
    'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop'
  ],
  '33333333-3333-3333-3333-333333333333',
  5.0, 34, null, 1, 4, null, 35, 'USD',
  array['Farm tour','Cooking class','Full Newari lunch','Recipe booklet'],
  array['Transport','Drinks'],
  'Wash hands before cooking. Shoes off inside the kitchen. The family may offer raksi (local spirit) — politely declining is fine.',
  array['Jan','Feb','Mar','Sep','Oct','Nov','Dec'],
  array['Food','Culture','Day trip','Newari'],
  false, false, 27.87, 83.54
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'trek',
  'Upper Dolpa Hidden Lakes Trek',
  'upper-dolpa-hidden-lakes',
  'Karnali', 'Dolpa',
  'One of Nepal''s most remote and least visited trekking regions. Upper Dolpa shares the Tibetan plateau landscape — dramatic eroded cliffs, turquoise lakes, ancient Bon monasteries, and sky-blue skies 365 days a year.',
  array[
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=500&fit=crop'
  ],
  '22222222-2222-2222-2222-222222222222',
  4.9, 21, 'hard', 12, 4, 5360, 1200, 'USD',
  array['Experienced guide','Porter','All permits','Accommodation','All meals'],
  array['Flights to Juphal','Insurance','Personal gear'],
  'Upper Dolpa is a restricted area with special permits. Bon monastery etiquette differs from Buddhist — circle shrines anticlockwise. No photos inside monasteries.',
  array['Jun','Jul','Aug','Sep'],
  array['Remote','Tibet-like','Expert','Restricted area','Monastery'],
  true, false, 29.17, 82.96
)
on conflict (id) do nothing;

-- ── Reviews ───────────────────────────────────────────────────
insert into reviews (id, listing_id, traveler_name, traveler_country, rating, comment, avatar_url, review_date) values
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sarah Chen',   'UK',      5, 'Incredible offbeat trek. Ram knew every shrine and story. The lakes at sunset were beyond words. No other tourists the entire trip!', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop', 'Mar 2026'),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tom Eriksen',  'Norway',  5, 'Ram is the best guide I''ve had in 20 years of trekking. Organised, knowledgeable, great cook. Panch Pokhari is a hidden gem.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop', 'Feb 2026'),
('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Priya Nair',   'India',   5, 'As a solo female traveler I was slightly nervous, but Ram made me feel completely safe. The daily log feature so my parents could see I was ok was reassuring.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop', 'Jan 2026'),
('b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Marco Russo',  'Italy',   5, 'Sita''s dal bhat changed my life. The views of Dhaulagiri from the bedroom window every morning. Simple, pure, perfect.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop', 'Nov 2025'),
('b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Anna Kowalski','Poland',  5, 'Best accommodation decision of my Nepal trip. Khopra Ridge feels like a secret the internet hasn''t found yet.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop', 'Oct 2025'),
('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'James Wu',     'USA',     5, 'Mingma was excellent. The Tamang Heritage Trail had more cultural depth than anything we saw on the Annapurna Circuit.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop', 'Apr 2026')
on conflict (id) do nothing;
