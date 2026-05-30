# Tacticx — Guide de construction MVP pour Claude Code

> **Lis ce fichier entièrement avant d'écrire la moindre ligne de code.**
> Coche chaque tâche `[ ]` → `[x]` au fur et à mesure.
> En cas de doute sur une mécanique de jeu, cherche sur le web avant de coder.

---

## Structure du projet

```
/
├── server/          ← Boilerplate AdonisJS v7 Netzil — lire et s'en imprégner avant de coder
├── tacticx/         ← Code Expo 56 par défaut (point de départ mobile)
└── model/           ← Fichiers Claude Design (wireframes) + theme.ts (tokens)
```

---

## PHASE 0 — Lecture et préparation

- [ ] **Lire le skill AdonisJS v7** avant d'écrire la moindre ligne backend
- [ ] **Lire le skill Reacticx** avant d'écrire la moindre ligne mobile
- [ ] Lire tous les fichiers dans `model/` pour comprendre chaque écran
- [ ] Lire intégralement le boilerplate `server/` pour identifier :
  - Les modèles déjà existants (User, Token, etc.)
  - Les middlewares déjà configurés (auth, throttle, etc.)
  - Les helpers et services disponibles
  - La structure des réponses API (format, pagination, erreurs)
  - Les conventions de nommage utilisées dans le projet
- [ ] S'imprégner des conventions du boilerplate — tout le nouveau code doit suivre le même style
- [ ] Copier `model/theme.ts` vers `tacticx/lib/theme.ts`
- [ ] Identifier les variables d'environnement nécessaires (voir Phase 1)

---

## PHASE 1 — Configuration environnement

### Fichiers `.env`

- [ ] Créer `server/.env` à partir de `server/.env.example` avec :
  ```
  TZ=UTC
  PORT=3333
  HOST=0.0.0.0
  LOG_LEVEL=info
  APP_KEY=           # générer via: node ace generate:key
  NODE_ENV=development
  DB_CONNECTION=pg
  PG_HOST=localhost
  PG_PORT=5432
  PG_USER=tacticx
  PG_PASSWORD=
  PG_DB_NAME=tacticx_dev
  REVENUECAT_WEBHOOK_SECRET=
  ```

- [ ] Créer `tacticx/.env` avec :
  ```
  EXPO_PUBLIC_API_URL=http://localhost:3333
  EXPO_PUBLIC_REVENUECAT_IOS_KEY=
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
  ```

---

## PHASE 2 — Installation des dépendances

### Backend `server/`

- [ ] `pnpm install` dans `server/`
- [ ] Vérifier que `@adonisjs/lucid`, `pg`, `@adonisjs/auth` sont présents (boilerplate)
- [ ] Si manquants, les installer en respectant la syntaxe AdonisJS v7 (voir skill)

### Mobile `tacticx/`

- [ ] `pnpm install` dans `tacticx/`

**Dépendances à ajouter :**
- [ ] `pnpm add @tanstack/react-query`
- [ ] `pnpm add zustand`
- [ ] `pnpm add @shopify/flash-list`
- [ ] `pnpm add expo-image`
- [ ] `pnpm add expo-haptics`
- [ ] `pnpm add expo-secure-store`
- [ ] `pnpm add @react-native-async-storage/async-storage`
- [ ] `pnpm add react-native-purchases` (RevenueCat)
- [ ] `pnpm add @expo/vector-icons` (Ionicons)

**Reacticx — installer chaque composant (voir skill Reacticx pour la procédure exacte) :**
- [ ] `pnpm dlx reacticx add segmented-control`
- [ ] `pnpm dlx reacticx add search-bar`
- [ ] `pnpm dlx reacticx add animated-input-bar`
- [ ] `pnpm dlx reacticx add tabs`
- [ ] `pnpm dlx reacticx add progress`
- [ ] `pnpm dlx reacticx add circular-progress`
- [ ] `pnpm dlx reacticx add rolling-counter`
- [ ] `pnpm dlx reacticx add picker`
- [ ] `pnpm dlx reacticx add dropdown`
- [ ] `pnpm dlx reacticx add toast`
- [ ] `pnpm dlx reacticx add shimmer`
- [ ] `pnpm dlx reacticx add badge`
- [ ] `pnpm dlx reacticx add accordion`
- [ ] `pnpm dlx reacticx add morphing-tabbar`
- [ ] `pnpm dlx reacticx add radial-intro`

**Configuration Babel obligatoire :**
- [ ] Vérifier que `babel.config.js` contient `react-native-reanimated/plugin` **en dernier** dans les plugins
- [ ] Vérifier que le layout racine enveloppe tout dans `<GestureHandlerRootView style={{ flex: 1 }}>`

---

## PHASE 3 — Stratégie données Pokémon (buffer PostgreSQL)

> **Contexte important :** PokeAPI ne contient pas encore les données spécifiques à Pokémon Champions
> (issue GitHub #1484 ouverte le 10 avril 2026, non traitée). Les Pokémon de Champions sont issus
> des Gen 1-9, donc leurs stats de base existent sur PokeAPI, mais les mécaniques Champions
> (SP, Mégas Legends Z-A, régulations, disponibilité) doivent être patchées manuellement.
>
> PokeAPI encourage explicitement le cache dans sa fair use policy.
> Les sprites GitHub sont stables et utilisés par tous les concurrents (zone grise assumée).
>
> **Décision architecturale : buffer PostgreSQL.**
> L'application ne requête JAMAIS PokeAPI au runtime. Tout est pré-seedé en base.
> Avantage : pas de dépendance externe en production, changement de regulation = simple update BDD.

### Table buffer `pokemon_data`

- [ ] Créer migration `pokemon_data` :
  ```
  id integer PRIMARY KEY,        ← ID PokeAPI (= ID home sprite)
  name_fr varchar(100),
  name_en varchar(100),
  type_1 varchar(20),
  type_2 varchar(20) nullable,
  base_hp integer,
  base_atk integer,
  base_def integer,
  base_spa integer,
  base_spd integer,
  base_spe integer,
  abilities jsonb,               ← ["Blaze", "Solar Power"]
  moves jsonb,                   ← liste des moves apprenables
  sprite_url varchar(255),       ← URL home sprite pré-construite
  is_mega boolean default false,
  mega_of integer nullable,      ← ID du Pokémon de base si forme Mega
  in_reg_ma boolean default false,  ← disponible Regulation M-A (jusqu'au 16 juin 2026)
  regulation_notes text nullable,   ← ex: "nécessite transfert HOME"
  updated_at timestamp
  ```

### Table buffer `move_data`

- [ ] Créer migration `move_data` :
  ```
  id integer PRIMARY KEY,
  name_fr varchar(100),
  name_en varchar(100),
  type varchar(20),
  category varchar(20),          ← 'physical' | 'special' | 'status'
  power integer nullable,
  accuracy integer nullable,
  pp integer,
  description_fr text nullable
  ```

### Table buffer `item_data`

- [ ] Créer migration `item_data` :
  ```
  id integer PRIMARY KEY,
  slug varchar(100),             ← pour l'URL sprite PokeAPI
  name_fr varchar(100),
  name_en varchar(100),
  sprite_url varchar(255)
  ```

### Scripts de seed

- [ ] Créer `server/database/seeders/PokemonSeeder.ts`
  - Fetch PokeAPI `https://pokeapi.co/api/v2/pokemon?limit=1025` pour la liste
  - Pour chaque Pokémon : fetch `/pokemon/{id}` et `/pokemon-species/{id}`
  - Extraire stats de base, types, abilities
  - Construire `sprite_url` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/{id}.png`
  - Patcher manuellement `in_reg_ma` selon la liste Bulbapedia : https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_in_Pok%C3%A9mon_Champions
  - Chercher sur le web et ajouter les Mégas Champions (Legends Z-A) non présents dans PokeAPI

- [ ] Créer `server/database/seeders/MoveSeeder.ts`
  - Fetch PokeAPI `/move?limit=1000`
  - Extraire power, accuracy, pp, type, damage_class
  - Noms FR depuis PokeAPI `names` field (langue `fr`)

- [ ] Créer `server/database/seeders/ItemSeeder.ts`
  - Liste manuelle des items compétitifs Champions (chercher sur Bulbapedia/Serebii)
  - Construire slug pour l'URL sprite

- [ ] Lancer les seeders : `node ace db:seed`

### Endpoint de rafraîchissement

- [ ] Créer route admin `POST /admin/sync-pokemon` (protégée par token admin)
  - Permet de re-synchroniser les données sans redéploiement
  - Utile lors des changements de regulation (prochain : 16 juin 2026)

---

## PHASE 4 — Base de données utilisateurs (AdonisJS v7)

> Consulter le boilerplate et le skill AdonisJS v7 pour la syntaxe exacte.

### Migrations à créer (vérifier d'abord ce qui existe dans le boilerplate)

- [ ] **users** — vérifier si dans le boilerplate, ne pas dupliquer
  ```
  id, email, password_hash, username, created_at, updated_at
  ```

- [ ] **profiles**
  ```
  id, user_id (FK), level enum('casual','competitive','tryhard'),
  format enum('vgc','3v3','both'), style enum('offense','control','balance'),
  objective enum('learn','rankup','tournament'), created_at, updated_at
  ```

- [ ] **teams**
  ```
  id, user_id (FK), name, format enum('vgc','3v3'),
  style varchar(20) nullable,
  is_public boolean default false,
  likes_count integer default 0,
  description text nullable,
  regulation varchar(20) nullable,
  created_at, updated_at
  ```

- [ ] **team_slots**
  ```
  id, team_id (FK), slot_index integer (0-5),
  pokemon_id integer (FK → pokemon_data.id),
  nickname varchar(50) nullable,
  nature varchar(20),
  ability varchar(100),
  item varchar(100) nullable,
  move_1 varchar(100) nullable,
  move_2 varchar(100) nullable,
  move_3 varchar(100) nullable,
  move_4 varchar(100) nullable,
  sp_hp integer default 0,
  sp_atk integer default 0,
  sp_def integer default 0,
  sp_spa integer default 0,
  sp_spd integer default 0,
  sp_spe integer default 0,
  -- Contrainte CHECK : sp_hp+sp_atk+sp_def+sp_spa+sp_spd+sp_spe <= 66
  -- Contrainte CHECK : chaque sp_* BETWEEN 0 AND 32
  created_at, updated_at
  ```

- [ ] **subscriptions**
  ```
  id, user_id (FK), revenuecat_user_id varchar,
  plan enum('monthly','annual'),
  status enum('active','expired','cancelled'),
  expires_at timestamp nullable,
  created_at, updated_at
  ```

- [ ] **team_likes**
  ```
  id, user_id (FK), team_id (FK), created_at
  -- Index unique sur (user_id, team_id)
  ```

- [ ] **comments**
  ```
  id, user_id (FK), team_id (FK), content varchar(500),
  created_at, updated_at
  ```

- [ ] Lancer les migrations : `node ace migration:run`

---

## PHASE 5 — Backend AdonisJS v7 (Models + Controllers + Routes)

> Lire le skill AdonisJS v7 pour la syntaxe exacte des models, relations et controllers.
> Suivre les conventions du boilerplate pour les réponses API et la gestion des erreurs.

### Models

- [ ] `User` — vérifier et étendre si dans le boilerplate
- [ ] `Profile` — `belongsTo(User)`
- [ ] `PokemonData` — model read-only (les données viennent du seeder)
- [ ] `Team` — `belongsTo(User)`, `hasMany(TeamSlot)`
- [ ] `TeamSlot` — `belongsTo(Team)`, `belongsTo(PokemonData, { foreignKey: 'pokemon_id' })`
- [ ] `Subscription` — `belongsTo(User)`
- [ ] `Comment` — `belongsTo(User)`, `belongsTo(Team)`

### Controllers

- [ ] `AuthController` — login, register, logout, refresh token
- [ ] `ProfileController` — show, update
- [ ] `PokemonController`
  - `index` — liste avec filtres (type, inRegMa, search FR+EN), paginée
  - `show` — détail d'un Pokémon avec moves, abilities
- [ ] `TeamController`
  - `index` — équipes de l'utilisateur (filtrable par format)
  - `show`, `store`, `update`, `destroy`
  - `publish` — rendre publique (premium only)
- [ ] `CommunityController`
  - `index` — feed public (filtre format, style, regulation, pokemonIds, tri)
  - `show` — fiche équipe publique avec slots + pokemon_data
  - `like` — toggle like
- [ ] `CommentController` — `index`, `store` (premium only)
- [ ] `SubscriptionController` — `status`
- [ ] `WebhookController`
  - `revenuecat` — POST `/webhooks/revenuecat`
  - Events à gérer : `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`
  - Vérifier le header `Authorization: Bearer REVENUECAT_WEBHOOK_SECRET`

### Routes

- [ ] Routes publiques : `POST /auth/register`, `POST /auth/login`
- [ ] Routes authentifiées (middleware auth) :
  - `GET /pokemon`, `GET /pokemon/:id`
  - `GET|PUT /profile`
  - `GET|POST|PUT|DELETE /teams/:id`, `GET /teams`
  - `POST /teams/:id/publish`
  - `GET /community`, `GET /community/:id`
  - `POST /community/:id/like`
  - `GET|POST /community/:id/comments`
  - `GET /subscription/status`
- [ ] Route webhook : `POST /webhooks/revenuecat` (sans middleware auth)
- [ ] Route admin : `POST /admin/sync-pokemon` (token admin dans header)

### Middleware Premium

- [ ] Créer middleware `CheckPremium` — vérifie `subscriptions.status === 'active'`
- [ ] Appliquer sur : `POST /teams/:id/publish`, `POST /community/:id/comments`

---

## PHASE 6 — Données statiques offline (mobile)

> Ces fichiers sont embarqués dans l'app et ne font aucun appel réseau au runtime.
> Ils sont synchronisés depuis la BDD via un script de génération.

- [ ] Créer `tacticx/lib/data/natures.ts` — 25 natures avec stat+/stat- :
  ```typescript
  export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'
  export const NATURES: Record<string, { plus: StatKey | null; minus: StatKey | null }> = {
    Hardy:   { plus: null,  minus: null },
    Lonely:  { plus: 'atk', minus: 'def' },
    Brave:   { plus: 'atk', minus: 'spe' },
    Adamant: { plus: 'atk', minus: 'spa' },
    Naughty: { plus: 'atk', minus: 'spd' },
    Bold:    { plus: 'def', minus: 'atk' },
    Docile:  { plus: null,  minus: null },
    Relaxed: { plus: 'def', minus: 'spe' },
    Impish:  { plus: 'def', minus: 'spa' },
    Lax:     { plus: 'def', minus: 'spd' },
    Timid:   { plus: 'spe', minus: 'atk' },
    Hasty:   { plus: 'spe', minus: 'def' },
    Serious: { plus: null,  minus: null },
    Jolly:   { plus: 'spe', minus: 'spa' },
    Naive:   { plus: 'spe', minus: 'spd' },
    Modest:  { plus: 'spa', minus: 'atk' },
    Mild:    { plus: 'spa', minus: 'def' },
    Quiet:   { plus: 'spa', minus: 'spe' },
    Bashful: { plus: null,  minus: null },
    Rash:    { plus: 'spa', minus: 'spd' },
    Calm:    { plus: 'spd', minus: 'atk' },
    Gentle:  { plus: 'spd', minus: 'def' },
    Sassy:   { plus: 'spd', minus: 'spe' },
    Careful: { plus: 'spd', minus: 'spa' },
    Quirky:  { plus: null,  minus: null },
  }
  ```

- [ ] Créer `tacticx/lib/data/typeChart.ts` — table 18×18 multiplicateurs
  - 18 types : Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground,
    Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy
  - Chercher la table exacte sur Bulbapedia si nécessaire
  - Format : `TYPE_CHART[attackType][defenseType] = multiplier`

---

## PHASE 7 — Formules de calcul (offline, TypeScript pur)

> **Chercher sur le web la formule exacte de Pokémon Champions avant de coder.**
> Sources : https://porygonlabs.com · https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/
> Tester les résultats contre ces calculateurs de référence pour valider.

### `tacticx/lib/calc/statFormula.ts`

- [ ] Chercher et confirmer la formule stat Champions sur le web
- [ ] Formule attendue (à valider) — SP remplace EVs+IVs, 1 SP = +1 directement :
  ```
  HP    : floor((2 × base + sp) × 50 / 100) + 50 + 10
  Autres: (floor((2 × base + sp) × 50 / 100) + 5) × natureMult
  natureMult : 1.1 si stat boostée / 0.9 si diminuée / 1.0 sinon
  Level : 50 fixe pour tous les calculs
  ```
- [ ] Valider la formule avec des exemples réels depuis pikalytics.com/champions
- [ ] Exporter `calcStat(base, sp, nature, statKey): number`
- [ ] Exporter `calcAllStats(slot: PokemonSlot, baseStats: BaseStats): Record<StatKey, number>`

### `tacticx/lib/calc/damageFormula.ts`

- [ ] Chercher et lire le code source de porygonlabs.com (GitHub si disponible) pour la formule exacte
- [ ] Chercher sur https://bulbapedia.bulbagarden.net la formule de dégâts Champions
- [ ] Implémenter la formule (base Gen 9, applicable Champions) :
  ```
  Damage = floor(floor(floor(2 × 50 / 5 + 2) × Power × AtkStat / DefStat) / 50 + 2) × Modifier
  ```
- [ ] Implémenter tous les modificateurs :
  ```typescript
  interface DamageParams {
    attacker: { stats: Record<StatKey, number>; types: string[]; ability: string; item: string }
    defender: { stats: Record<StatKey, number>; types: string[]; ability: string; item: string }
    move: { power: number; type: string; category: 'physical' | 'special' }
    attackerStatStage: number   // -6 → +6
    defenderStatStage: number   // -6 → +6
    weather: 'sun' | 'rain' | 'sand' | 'snow' | 'none'
    terrain: 'electric' | 'grassy' | 'psychic' | 'misty' | 'none'
    helpingHand: boolean        // ×1.5 (VGC)
    isSpreadMove: boolean       // ×0.75 si 2 cibles (VGC)
    reflect: boolean            // ×0.5 physique (×0.66 doubles)
    lightScreen: boolean        // ×0.5 spécial (×0.66 doubles)
    auroraVeil: boolean         // ×0.5 tous (×0.66 doubles)
    intimidateApplied: boolean  // -1 Atk physique attaquant
    isCriticalHit: boolean      // ×1.5, ignore stat drops et screens
    isDoubles: boolean          // pour calcul multiplicateurs screens
  }
  ```
- [ ] Modificateurs météo :
  - Soleil : ×1.5 Feu, ×0.5 Eau
  - Pluie : ×1.5 Eau, ×0.5 Feu
- [ ] Retourner les **16 rolls** (facteurs 0.85 → 1.00 par pas de 0.01) :
  ```typescript
  export function calcAllRolls(params: DamageParams): number[]
  // Retourne 16 valeurs HP entières
  ```
- [ ] Exporter `calcKOChances(rolls: number[], defHP: number): { ohko: number; twohko: number }`
  - `ohko` = % de rolls >= defHP
  - `twohko` = % de paires (roll1+roll2) >= defHP

### `tacticx/lib/calc/typeCoverage.ts`

- [ ] `getDefensiveMultiplier(attackType, defenderTypes[]): number` — gère dual-type et immunités
- [ ] `getTeamWeaknesses(slots[]): WeaknessMap` — 18 types → tableau 6 multiplicateurs
- [ ] `getOffensiveCoverage(slots[]): CoverageMap` — types couverts offensivement (STAB + moves)
- [ ] `getMostDangerousTypes(weaknessMap): Type[]` — triés par danger décroissant

---

## PHASE 8 — State management Zustand

- [ ] `tacticx/lib/store/formatStore.ts`
  ```typescript
  { format: 'vgc' | '3v3', setFormat }
  ```

- [ ] `tacticx/lib/store/profileStore.ts`
  ```typescript
  {
    level: 'casual' | 'competitive' | 'tryhard' | null,
    format: 'vgc' | '3v3' | 'both' | null,
    style: 'offense' | 'control' | 'balance' | null,
    objective: 'learn' | 'rankup' | 'tournament' | null,
    hasCompletedOnboarding: boolean,
    isPremium: boolean,
    setProfile, setPremium
  }
  // Persistance AsyncStorage via zustand/middleware persist
  ```

- [ ] `tacticx/lib/store/teamStore.ts`
  ```typescript
  {
    teams: Team[],
    activeTeamId: string | null,
    addTeam, updateTeam, deleteTeam, setActiveTeam
  }
  // Persistance AsyncStorage
  ```

- [ ] `tacticx/lib/store/authStore.ts`
  ```typescript
  { token: string | null, userId: string | null, setAuth, clearAuth }
  // Token persisté dans expo-secure-store
  ```

---

## PHASE 9 — Client API TanStack Query

- [ ] Créer `tacticx/lib/api/client.ts` — fetch wrapper avec :
  - Base URL depuis `EXPO_PUBLIC_API_URL`
  - Injection automatique du token depuis `authStore`
  - Gestion des erreurs 401 (clear auth + redirect login)

- [ ] Hooks TanStack Query dans `tacticx/lib/api/hooks/` :
  - [ ] `usePokemonList(filters?)` — liste Pokémon depuis le backend buffer
  - [ ] `usePokemon(id)` — détail
  - [ ] `useTeams(format?)` — équipes utilisateur
  - [ ] `useTeam(id)` — détail équipe
  - [ ] `useCommunityFeed(filters)` — feed public
  - [ ] `useCommunityTeam(id)` — fiche équipe publique
  - [ ] `useSubscriptionStatus()` — statut premium

---

## PHASE 10 — Navigation Expo Router

- [ ] Nettoyer le dossier `app/` Expo par défaut
- [ ] Créer la structure :

```
tacticx/app/
├── _layout.tsx                    ← GestureHandlerRootView + QueryClientProvider + Toast
├── index.tsx                      ← Redirect onboarding ou tabs selon profil
├── (onboarding)/
│   ├── _layout.tsx
│   ├── niveau.tsx
│   ├── format.tsx
│   ├── style.tsx
│   ├── objectif.tsx
│   └── result.tsx
└── (tabs)/
    ├── _layout.tsx                ← Morphing Tabbar Reacticx (5 onglets)
    ├── meta/index.tsx
    ├── pokedex/
    │   ├── index.tsx
    │   └── [id].tsx
    ├── teams/
    │   ├── index.tsx              ← "Mes équipes" + "Communauté" via Segmented Control
    │   ├── builder.tsx
    │   ├── community/
    │   │   ├── [id].tsx
    │   │   └── submit.tsx
    │   └── [id]/audit.tsx
    ├── calc/index.tsx
    └── profile/index.tsx
```

- [ ] Morphing Tabbar (5 onglets) : Meta (`stats-chart-outline`) · Pokédex (`search-outline`) · Teams (`people-outline`) · Calc (`calculator-outline`) · Profil (`person-outline`)
- [ ] Redirection initiale dans `index.tsx` : onboarding si pas complété, tabs/meta sinon

---

## PHASE 11 — Composants partagés

- [ ] `components/shared/PokemonSprite.tsx`
  - Props : `pokemonId: number, size: number`
  - `expo-image` avec cache persistant + Shimmer pendant chargement

- [ ] `components/shared/TypeBadge.tsx`
  - Props : `type: string, size?: 'xs' | 'sm' | 'md'`
  - Badge Reacticx avec couleur type depuis `theme.ts`

- [ ] `components/shared/PremiumLock.tsx`
  - Si `!isPremium` : blur sur les children + `lock-closed-outline` centré
  - Tap → ouvre `PaywallSheet`

- [ ] `components/paywall/PaywallSheet.tsx`
  - Bottom sheet 85%, contextuel (featureName + featureIcon en props)
  - Segmented Control Mensuel/Annuel (annuel par défaut, badge "-37%")
  - Bouton "Commencer" → RevenueCat purchase

- [ ] `components/teams/TypeCoverageTable.tsx`
  - Props : `slots: (PokemonSlot | null)[], readonly?: boolean`
  - 18 lignes × 8 colonnes, utilise `getTeamWeaknesses()`
  - Cellules colorées : 4× rouge / 2× orange / 1× neutre / ½ vert / IMM bleu
  - Alertes DANGER si ≥ 4 expositions sur un type
  - Tap sur ligne si `!readonly` → highlight sprites concernés

---

## PHASE 12 — Écrans

### 12.1 Onboarding

- [ ] `niveau.tsx` — 3 cards + Radial Intro Reacticx
- [ ] `format.tsx` — 3 cards
- [ ] `style.tsx` — 3 cards
- [ ] `objectif.tsx` — 3 cards
- [ ] `result.tsx` — récap 4 choix + bouton "Commencer" → `hasCompletedOnboarding = true`
- [ ] Chaque étape : barre Progress 4 segments, stockage `profileStore`, auto-navigation

### 12.2 Meta

- [ ] `meta/index.tsx`
  - Header + Segmented Control VGC/Singles
  - Bande tendances scroll horizontal
  - Tabs Usage / Winrate / Cores
  - FlashList top 20 : sprite + nom + types + Progress usage
  - Tap → bottom sheet détail : stats, spreads SP, moves, items, partenaires, counters
  - Sparkline historique → PremiumLock

### 12.3 Pokédex

- [ ] `pokedex/index.tsx`
  - Animated Input Bar recherche FR+EN
  - Bouton filtres + Badge compteur
  - Chips filtres actifs supprimables
  - FlashList : sprite + numéro + nom + TypeBadge + tier + rang

- [ ] `pokedex/[id].tsx`
  - Sprite 96pt + types + tier + favoris
  - Fond radial couleur type (8% opacité)
  - Segmented Control Doubles/Singles sticky
  - Stats Rolling Counter + Progress
  - Accordion faiblesses/résistances (utilise `getDefensiveMultiplier`)
  - Section méta (spreads, moves, items, partenaires, counters)
  - FAB "Ajouter à une équipe"

### 12.4 Team Builder

- [ ] `teams/index.tsx`
  - Segmented Control "Mes équipes / Communauté"
  - Vue Mes équipes : FlashList + swipe actions + état vide
  - Vue Communauté : feed avec filtres (voir spec communauté)

- [ ] `teams/builder.tsx`
  - Header sticky : nom éditable + Segmented Control + options
  - Grille 6 slots (2×3 VGC, 1×6 Singles selon formatStore)
  - Overlay recherche Pokémon
  - Tabs analyse : TypeCoverageTable + offensif + speed tiers
  - Speed tiers avec Rolling Counter + toggles Tailwind/Trick Room
  - Footer sticky : sauvegarder / exporter / calc / budget VP

- [ ] `components/teams/PokemonEditorSheet.tsx`
  - Ability (Dropdown) + Item (Picker) + Nature (Dropdown) + 4 moves
  - 6 sliders SP (0-32, snap entier, haptic expo-haptics)
  - Rolling Counter valeur stat finale en temps réel (utilise `calcStat`)
  - Coloration nature (bleu boost / rouge diminution)
  - Progress barre budget SP "X/66"
  - Accordion presets : top 3 spreads depuis API, animation spring des sliders
  - Accordion IVs masqué (31 par défaut, non pertinent Champions mais gardé pour flexibilité)

- [ ] `teams/community/[id].tsx`
  - 6 cards Pokémon scrollables, tap → bottom sheet détail SP read-only
  - Raisonnement stratégique + Accordion commentaires
  - Footer : "Ouvrir dans le builder" + Import Pokepaste

- [ ] `teams/community/submit.tsx` — PremiumLock total si free

- [ ] `teams/[id]/audit.tsx` — TypeCoverageTable complet + speed tiers + menaces méta

### 12.5 Damage Calculator

- [ ] `calc/index.tsx`
  - Scroll vertical unique, résultat mis à jour en temps réel à chaque changement
  - Header : Segmented Control VGC/Singles + swap + bookmark (PremiumLock)
  - Section Attaquant : Pokémon + item + ability + move + slider SP stat offensive + nature + Accordion modificateurs + bouton "Depuis mon équipe"
  - Section Défenseur : même structure + modificateurs défensifs
  - Conditions terrain : météo + terrain (Segmented Control)
  - Section Résultat :
    - Rolling Counter HP range + %
    - Badge KO (OHKO / OHKO probable X% / 2HKO / Survit)
    - Histogramme 16 rolls (barres colorées, ligne HP défenseur)
    - Lien "Tester en inverse"

### 12.6 Profil

- [ ] `profile/index.tsx`
  - Avatar initiales + nom éditable + badges profil
  - Segmented Control VGC/Singles
  - Rang + Progress palier + Rolling Counter W/L/Winrate
  - Sparkline → PremiumLock
  - Top 5 Pokémon joués + Circular Progress winrate individuel
  - Objectifs + Progress (PremiumLock si > 3)
  - 4 rows éditables (bottom sheet même UI que onboarding)
  - Section abonnement (état free / premium)
  - Footer mention légale

### 12.7 Paywall

- [ ] `components/paywall/PaywallSheet.tsx` — voir Phase 11

---

## PHASE 13 — RevenueCat

- [ ] Initialiser dans `app/_layout.tsx` au démarrage
- [ ] Implémenter achat dans `PaywallSheet.tsx`
- [ ] Après achat : `profileStore.setPremium(true)` + sync backend
- [ ] "Restaurer les achats" dans `profile/index.tsx`
- [ ] Webhook backend : `POST /webhooks/revenuecat` met à jour `subscriptions`

---

## PHASE 14 — Polish final

- [ ] Tous les éléments premium : **visibles + floutés + `lock-closed-outline`** (jamais cachés)
- [ ] **Segmented Control VGC/Singles** présent dans chaque écran principal
- [ ] **FlashList** partout (jamais FlatList)
- [ ] **Shimmer** Reacticx sur tous les loadings
- [ ] **Touch targets ≥ 44×44pt** — sliders SP en particulier
- [ ] **Safe area** haut et bas sur tous les écrans
- [ ] **Aucune valeur en dur** — tout depuis `theme.ts`
- [ ] **Aucun emoji** — Ionicons `-outline` uniquement
- [ ] **Dark mode** testé iOS et Android
- [ ] Mention légale dans `profile/index.tsx` : `"Pokémon © Nintendo/Creatures Inc./GAME FREAK inc."`
- [ ] Note légale dans les settings : `"Tacticx n'est pas affilié à Nintendo ou The Pokémon Company"`

---

## Règles absolues

| Règle | Détail |
|---|---|
| Stack mobile | Expo SDK 56 + React Native 0.85 + **pnpm exclusivement** |
| Navigation | Expo Router (file-based) |
| UI | **Reacticx** pour tous les composants listés (voir skill) |
| Icônes | **Ionicons `-outline`** — zéro emoji, zéro SF Symbol |
| Listes | **FlashList** — jamais FlatList |
| Loading | **Shimmer Reacticx** — jamais ActivityIndicator |
| Thème | Tokens `theme.ts` — **zéro valeur en dur** |
| Mode | **Dark mode uniquement** pour le MVP |
| Backend | **AdonisJS v7** — lire le skill avant de coder, ne pas utiliser de patterns v6 |
| Package manager | **pnpm** — jamais npm ou yarn |
| Données Pokémon | **Jamais PokeAPI au runtime** — tout passe par le buffer PostgreSQL |
| SP système | 0-32 par stat, total max **66**, 1 SP = +1 stat directement |
| Level | **50 fixe** pour tous les calculs Champions |

---

## Sources utiles pour les recherches web

| Sujet | URL |
|---|---|
| Formule dégâts Champions | https://porygonlabs.com |
| Formule dégâts (calc open source) | https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/ |
| Données méta / spreads SP | https://pikalytics.com/champions |
| SP system expliqué | https://www.switchbladegaming.com/pokemon-champions/sp-system-explained/ |
| Liste Pokémon Champions (Reg MA) | https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_in_Pokémon_Champions |
| Liste Pokémon Champions (Serebii) | https://www.serebii.net/pokemonchampions/pokemon.shtml |
| Sprites home | `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/{id}.png` |
| Sprites items | `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{slug}.png` |
| PokeAPI (seed seulement) | https://pokeapi.co/api/v2/ |
| Table de types Gen 9 | https://bulbapedia.bulbagarden.net/wiki/Type |
