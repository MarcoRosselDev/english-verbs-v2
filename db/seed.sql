-- Datos de ejemplo para probar. Orden de columnas:
-- infinitive, past_simple, past_participle, present_participle,
-- third_person_singular, spanish_translation, is_regular
INSERT INTO verbs
  (infinitive, past_simple, past_participle, present_participle, third_person_singular, spanish_translation, is_regular)
VALUES
  ('go',     'went',    'gone',    'going',    'goes',    'ir',        false),
  ('eat',    'ate',     'eaten',   'eating',   'eats',    'comer',     false),
  ('run',    'ran',     'run',     'running',  'runs',    'correr',    false),
  ('swim',   'swam',    'swum',    'swimming', 'swims',   'nadar',     false),
  ('write',  'wrote',   'written', 'writing',  'writes',  'escribir',  false),
  ('speak',  'spoke',   'spoken',  'speaking', 'speaks',  'hablar',    false),
  ('take',   'took',    'taken',   'taking',   'takes',   'tomar',     false),
  ('see',    'saw',     'seen',    'seeing',   'sees',    'ver',       false),
  ('work',   'worked',  'worked',  'working',  'works',   'trabajar',  true),
  ('play',   'played',  'played',  'playing',  'plays',   'jugar',     true),
  ('study',  'studied', 'studied', 'studying', 'studies', 'estudiar',  true),
  ('live',   'lived',   'lived',   'living',   'lives',   'vivir',     true)
ON CONFLICT ON CONSTRAINT verbs_unique_entry DO NOTHING;