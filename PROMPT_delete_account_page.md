# Page Delete Account — tacticx.fr/delete-account

## Contexte

Ajouter une page publique `https://tacticx.fr/delete-account` sur le backend AdonisJS v7.
Cette page est exigée par Google Play pour toute app avec comptes utilisateurs.

**Réutiliser exactement les patterns de la page `/privacy` déjà en production** — même structure de route, même controller pattern, même composant React/Inertia, même layout, même styles.

---

## Informations légales à utiliser

| Champ | Valeur |
|-------|--------|
| Nom de l'app | Tacticx |
| Éditeur | Enrick Bilba — Netzil |
| Contact | contact@netzil.fr |
| URL cible | `https://tacticx.fr/delete-account` |
| Dernière mise à jour | Juin 2026 |

---

## Backend — AdonisJS v7

### Route à ajouter dans `start/routes.ts`

```typescript
import { controllers } from '#generated/controllers'

router.get('/delete-account', [controllers.Legal, 'deleteAccount'])
```

Si un controller `Legal` existe déjà (pour la page privacy), ajouter simplement la méthode `deleteAccount`. Sinon créer le controller :

```bash
node ace make:controller Legal
```

### Méthode controller

```typescript
async deleteAccount({ inertia }: HttpContext) {
  return inertia.render('legal/delete_account')
}
```

Route publique, aucune auth requise — Google et Apple testent l'URL directement.

---

## Frontend — Inertia + React

### Fichier à créer

Créer `resources/pages/legal/delete_account.tsx` en réutilisant exactement la même structure que `resources/pages/legal/privacy.tsx`.

### Contenu de la page

**Titre :** Suppression de compte — Tacticx

**Introduction :**
Conformément au RGPD et aux règles de Google Play, vous pouvez demander la suppression de votre compte Tacticx et de toutes les données associées.

---

**Section 1 — Comment demander la suppression de votre compte**

Pour supprimer votre compte, envoyez un email à **contact@netzil.fr** avec :
- Objet : `Suppression de compte Tacticx`
- L'adresse email associée à votre compte
- La mention "Je souhaite supprimer mon compte et toutes mes données"

Nous traiterons votre demande dans un délai de **30 jours**.

---

**Section 2 — Données supprimées**

Lors de la suppression de votre compte, les données suivantes sont **définitivement supprimées** :
- Votre profil utilisateur (nom d'utilisateur, email)
- Vos équipes créées et sauvegardées
- Vos commentaires sur les équipes de la communauté
- Votre historique d'activité dans l'app

---

**Section 3 — Données conservées**

Certaines données peuvent être conservées temporairement pour des raisons légales :
- Les données de transaction (achats, abonnements) sont conservées **5 ans** conformément aux obligations comptables françaises — elles sont gérées par RevenueCat et ne contiennent pas vos données personnelles identifiables
- Les données publicitaires sont gérées par Google AdMob et supprimées selon leur propre politique de confidentialité

---

**Section 4 — Suppression partielle des données**

Si vous souhaitez supprimer uniquement certaines données sans supprimer votre compte (par exemple vos équipes ou vos commentaires), vous pouvez le faire directement depuis l'application Tacticx.

---

**Section 5 — Contact**

Pour toute question relative à vos données personnelles :
- Email : contact@netzil.fr
- Éditeur : Enrick Bilba — Netzil, Les Abymes, Guadeloupe, France

---

## Contraintes techniques

- Page **publique** — aucune authentification requise
- Accessible sans redirection à l'URL exacte `https://tacticx.fr/delete-account`
- **Responsive** — Google vérifie sur mobile
- Même layout, même typographie, même palette que la page `/privacy`
- Français uniquement (même langue que la page privacy existante)
- Date de mise à jour visible en haut : `Dernière mise à jour : juin 2026`
- Pas de dépendances supplémentaires — réutiliser ce qui existe déjà
