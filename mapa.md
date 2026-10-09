```terminal
english-verbs-v2/
├── db/
│   ├── schema.sql                  ✅ 1
│   └── seed.sql                    ✅ 1
├── public/                         (viene con Next.js)
├── src/
│   ├── app/                        ← aquí viven las PÁGINAS y la API (rutas = carpetas)
│   │   ├── layout.tsx              🔧 2  (reemplaza el generado)
│   │   ├── page.tsx                🔧 2  (temporal) → versión final en la 4
│   │   ├── globals.css             🔧 2  (reemplaza el generado)
│   │   ├── login/page.tsx          🔜 5
│   │   ├── register/page.tsx       🔜 5
│   │   └── api/
│   │       ├── health/route.ts     ✅ 1  (temporal)
│   │       ├── verbs/
│   │       │   ├── route.ts        🔜 3  (GET lista y búsqueda, POST crear)
│   │       │   └── [id]/route.ts   🔜 3  (GET, PUT, DELETE de un verbo)
│   │       └── auth/
│   │           ├── register/route.ts   🔜 5
│   │           ├── login/route.ts      🔜 5
│   │           ├── logout/route.ts     🔜 5
│   │           └── me/route.ts         🔜 5
│   ├── components/                 ← piezas de interfaz reutilizables
│   │   ├── Header.tsx              🔧 2
│   │   ├── ThemeToggle.tsx         🔧 2
│   │   ├── SearchBar.tsx           🔜 4
│   │   ├── VerbCard.tsx            🔜 4
│   │   ├── VerbList.tsx            🔜 4
│   │   ├── VerbForm.tsx            🔜 4
│   │   └── LoginForm.tsx           🔜 5
│   ├── hooks/
│   │   └── useDebounce.ts          🔜 4
│   ├── lib/                        ← lógica que NO es interfaz
│   │   ├── db.ts                   ✅ 1
│   │   ├── theme.ts                🔧 2
│   │   ├── verbs.ts                🔜 3  (consultas SQL de verbos)
│   │   ├── api-client.ts           🔜 4  (fetch tipado hacia nuestra API)
│   │   └── auth.ts                 🔜 5  (hash, JWT, cookies)
│   ├── types/
│   │   ├── verb.ts                 ✅ 1
│   │   └── user.ts                 🔜 5
│   └── proxy.ts                    🔜 5  (antes "middleware"; protege rutas)
├── tests/                          🔜 7
├── .env.local                      ✅ 1  (no se sube a git)
└── package.json, tsconfig.json, next.config.ts   (generados por Next.js)

```