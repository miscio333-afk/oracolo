# L'Oracolo di Belline Mobile

App React Native + Expo per iOS e Android. La versione web nella directory
principale resta separata e continua a usare Lemon Squeezy.

## Avvio

```bash
npm install
cp .env.example .env
npm start
```

Per usare Supabase, compilare `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_ANON_KEY` nel file `.env`. La chiave deve essere solo
publishable/anon: service role e segreti non devono mai entrare nell'app.

Il magic link usa lo scheme `belline://auth/callback`. Inserire questo URL tra
i Redirect URLs consentiti in Supabase Auth prima di testare l'accesso.

## Verifica

```bash
npm run typecheck
npx expo config --json
npx expo export --platform web
```

## Build

I profili EAS sono in `eas.json`:

- `development`: development client per test locali;
- `preview`: build interna per TestFlight/Android internal testing;
- `production`: build per gli store.

## Vercel preview

La directory `mobile/` è configurata come progetto Vercel separato. Impostare
la root del progetto Vercel su `mobile`; `mobile/vercel.json` esegue l'export
Expo web in `dist`. Configurare nel progetto Vercel le variabili
`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` per Preview e
Production. La versione native verrà gestita in seguito con EAS.

RevenueCat verrà inizializzato solo dopo la creazione dei prodotti mobile e
dell'entitlement Club/Esperto. L'app non concede accesso da una chiave o da uno
stato locale: l'entitlement finale deve arrivare dal backend Supabase.
