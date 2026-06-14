# Feature : Signalement & Blocage utilisateur — Tacticx

## Contexte

Tacticx est une app mobile Expo/React Native (SDK 56, RN 0.85) avec un backend AdonisJS v7.
La feature commentaires sur les teams existe déjà. On ajoute le **signalement de commentaire** et le **blocage d'utilisateur** pour conformité Google Play (exigence UGC).

**Règles du projet :**
- AdonisJS v7 uniquement (jamais de patterns v6)
- pnpm exclusivement
- Controllers via `import { controllers } from '#generated/controllers'`
- Models étendent le SchemaClass généré (`#database/schema`)
- Toujours utiliser les Transformers pour les réponses API
- Dark mode only, toutes les valeurs depuis `theme.ts`
- FlashList jamais FlatList
- Shimmer pour les états de chargement
- Ionicons `-outline` variants uniquement

---

## Ce qu'on construit

### 1. Signalement de commentaire
Un utilisateur peut signaler un commentaire qu'il juge inapproprié. Le signalement est enregistré en base. Pas de modération manuelle requise — juste stocker les signalements.

### 2. Blocage d'utilisateur
Un utilisateur peut bloquer un autre utilisateur. Les commentaires d'un utilisateur bloqué ne s'affichent plus pour celui qui a bloqué. L'utilisateur bloqué ne sait pas qu'il est bloqué.

---

## Backend — AdonisJS v7

### Migrations à créer

```bash
node ace make:migration create_comment_reports
node ace make:migration create_user_blocks
```

**`comment_reports`**
```
id (uuid, PK)
comment_id (uuid, FK → team_comments.id, onDelete: cascade)
reporter_id (uuid, FK → users.id, onDelete: cascade)
reason (enum: 'spam' | 'harassment' | 'inappropriate' | 'other')
created_at
UNIQUE(comment_id, reporter_id)  ← un user ne peut signaler qu'une fois le même comment
```

**`user_blocks`**
```
id (uuid, PK)
blocker_id (uuid, FK → users.id, onDelete: cascade)
blocked_id (uuid, FK → users.id, onDelete: cascade)
created_at
UNIQUE(blocker_id, blocked_id)
CHECK(blocker_id != blocked_id)  ← on ne peut pas se bloquer soi-même
```

### Models

Étendre les schemas générés après migration. Ajouter uniquement les relations :

**`CommentReport`** — relations : `comment()`, `reporter()`

**`UserBlock`** — relations : `blocker()`, `blocked()`

Sur le model `User` existant, ajouter :
```typescript
hasMany(() => UserBlock, { foreignKey: 'blocker_id' })  // blocks émis
hasMany(() => UserBlock, { foreignKey: 'blocked_id' })   // blocks reçus
```

Sur le model `TeamComment` existant, ajouter :
```typescript
hasMany(() => CommentReport)
```

### Controllers à créer

```bash
node ace make:controller CommentReports
node ace make:controller UserBlocks
```

**`CommentReportsController`**

`store` — POST `/comments/:commentId/report`
- Auth requise
- Valider `reason` (enum)
- Vérifier que le commentaire existe
- Vérifier que le user ne signale pas son propre commentaire (403)
- Upsert ou insert — si déjà signalé, retourner 200 sans erreur (idempotent)
- Réponse : `{ reported: true }`

**`UserBlocksController`**

`store` — POST `/users/:userId/block`
- Auth requise
- Vérifier que l'userId cible existe
- Vérifier que userId !== auth.user.id (400)
- Upsert — si déjà bloqué, retourner 200 (idempotent)
- Réponse : `{ blocked: true }`

`destroy` — DELETE `/users/:userId/block`
- Auth requise
- Supprimer le bloc s'il existe
- Réponse : `{ unblocked: true }`

### Modifier la route/query des commentaires existante

Dans le controller qui charge les commentaires d'une team, ajouter un filtre :

```typescript
// Récupérer les IDs bloqués par l'utilisateur connecté
const blockedIds = auth.user
  ? await UserBlock.query()
      .where('blocker_id', auth.user.id)
      .select('blocked_id')
      .then(rows => rows.map(r => r.blockedId))
  : []

// Appliquer le filtre sur la query des commentaires
const comments = await TeamComment.query()
  .where('team_id', params.teamId)
  .whereNotIn('user_id', blockedIds)  // ← filtre les bloqués
  .preload('user')
  .orderBy('created_at', 'desc')
```

### Routes à ajouter dans `start/routes.ts`

```typescript
import { controllers } from '#generated/controllers'

router.group(() => {
  // Signalement
  router.post('/comments/:commentId/report', [controllers.CommentReports, 'store'])

  // Blocage
  router.post('/users/:userId/block', [controllers.UserBlocks, 'store'])
  router.delete('/users/:userId/block', [controllers.UserBlocks, 'destroy'])
}).middleware(['auth'])
```

### Transformer

```bash
node ace make:transformer CommentReport
node ace make:transformer UserBlock
```

Les deux retournent uniquement `{ id, createdAt }` — pas besoin d'exposer plus.

---

## Frontend — Expo / React Native

### Composant `CommentCard` (modifier l'existant)

Ajouter un bouton "..." (Ionicons `ellipsis-horizontal-outline`) en haut à droite de chaque commentaire. Il ouvre une `ActionSheet` (bottom sheet natif via `@expo/react-native-action-sheet` ou équivalent déjà utilisé dans le projet).

**Options dans l'ActionSheet :**

Si le commentaire n'appartient PAS à l'utilisateur connecté :
- "Signaler ce commentaire" → ouvre un second sheet pour choisir la raison
- "Bloquer cet utilisateur" → confirmation inline, puis appel API

Si le commentaire appartient à l'utilisateur connecté :
- Ne pas afficher le "..."

**Sheet de signalement — raisons à afficher :**
- Spam
- Harcèlement
- Contenu inapproprié
- Autre

### Flow UX

**Signalement :**
1. Tap "..." → ActionSheet
2. Tap "Signaler ce commentaire" → Sheet raisons
3. Tap une raison → appel `POST /comments/:id/report` → toast de confirmation "Commentaire signalé" → sheet se ferme
4. En cas d'erreur réseau → toast d'erreur discret

**Blocage :**
1. Tap "..." → ActionSheet
2. Tap "Bloquer cet utilisateur" → confirmation inline dans le sheet ("Bloquer @username ? Ses commentaires ne seront plus visibles.")
3. Confirmer → appel `POST /users/:id/block` → le commentaire disparaît immédiatement de la liste (retirer localement de la state sans recharger) → toast "Utilisateur bloqué"

### Gestion locale de l'état

Dans le composant parent qui gère la liste de commentaires, maintenir un Set `blockedUserIds` en state local. Quand un blocage est confirmé, ajouter l'ID au Set et filtrer la liste affichée. Pas besoin de recharger depuis l'API.

### Styles

- Bouton "..." : `color: theme.colors.textSecondary`, 24x24
- Toast : utiliser le système de toast déjà en place dans l'app
- ActionSheet : dark mode, fond `theme.colors.surface`, texte `theme.colors.text`
- "Bloquer cet utilisateur" en `theme.colors.error` (rouge) pour signaler l'action destructive
- "Signaler ce commentaire" en `theme.colors.text` normal

---

## Ce qu'on ne fait PAS

- Pas d'interface admin de modération
- Pas d'email de notification
- Pas de limite de signalements par user
- Pas de suppression automatique des commentaires signalés
- Pas de système d'appel ou de ban

L'objectif est uniquement la conformité Google Play. Simple, robuste, minimal.
