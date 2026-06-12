# Brief — Intégration RevenueCat dans Tacticx

## Contexte

App React Native / Expo (`com.netzil.tacticx`) — companion app Pokémon Champions.
Stack : React Native + Expo, Reacticx UI, AdonisJS v7 backend, RevenueCat pour la monétisation.
Package manager : **pnpm exclusivement**.

---

## Ce qui est déjà configuré (ne pas recréer)

| Élément | Valeur |
|---------|--------|
| App RevenueCat | `app1a2f0a0474` |
| Projet RevenueCat | `projc12ed521` |
| Entitlement | `premium` |
| Offering | `default_premium` (ID: `ofrng3274d6649c`) |
| Package Monthly | `$rc_monthly` — `com.netzil.tacticx.premium.monthly` — $4.99/mois |
| Package Annual | `$rc_annual` — `com.netzil.tacticx.premium.yearly` — $14.99/an |
| Package Lifetime | `$rc_lifetime` — `com.netzil.tacticx.premium.lifetime` — $34.99 |
| Public API Key iOS | Récupérer via `Purchases.configure({ apiKey: 'appl_XXXX' })` — visible dans RevenueCat Dashboard → Apps → Tacticx |

---

## Tâches à implémenter

### 1. Installation SDK

```bash
pnpm add react-native-purchases react-native-purchases-ui
npx pod-install
```

### 2. Initialisation (app entry point)

Dans `app/_layout.tsx` ou équivalent :

```ts
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

const RC_API_KEY_IOS = 'appl_XXXXXXXXXXXXXXXX' // depuis RC Dashboard

if (Platform.OS === 'ios') {
  Purchases.configure({ apiKey: RC_API_KEY_IOS })
}

if (__DEV__) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG)
}
```

### 3. Hook `usePremium`

Créer `hooks/usePremium.ts` :

```ts
import Purchases, { CustomerInfo } from 'react-native-purchases'
import { useEffect, useState } from 'react'

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const info = await Purchases.getCustomerInfo()
      setIsPremium(!!info.entitlements.active['premium'])
      setLoading(false)
    }
    check()

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setIsPremium(!!info.entitlements.active['premium'])
    })

    return () => listener.remove()
  }, [])

  return { isPremium, loading }
}
```

### 4. Hook `useOffering`

Créer `hooks/useOffering.ts` :

```ts
import Purchases, { PurchasesPackage } from 'react-native-purchases'
import { useEffect, useState } from 'react'

export function useOffering() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const offerings = await Purchases.getOfferings()
      const current = offerings.current
      if (current) {
        setPackages(current.availablePackages)
      }
      setLoading(false)
    }
    load()
  }, [])

  return { packages, loading }
}
```

### 5. Écran Paywall `screens/PaywallScreen.tsx`

Logique d'achat pour les 3 packages :

```ts
import Purchases, { PurchasesPackage } from 'react-native-purchases'

const handlePurchase = async (pkg: PurchasesPackage) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    if (customerInfo.entitlements.active['premium']) {
      // Succès → fermer le paywall, afficher contenu premium
    }
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error('Purchase error', e)
    }
  }
}

const handleRestore = async () => {
  const info = await Purchases.restorePurchases()
  if (info.entitlements.active['premium']) {
    // Restored
  }
}
```

UI à construire avec **Reacticx** — utiliser `pnpm dlx reacticx add` pour les composants adaptés (BottomSheet, Toggle, animations).

Les 3 packages à afficher dans l'ordre :
1. `$rc_annual` — mis en avant (meilleur rapport qualité/prix)
2. `$rc_monthly`
3. `$rc_lifetime`

### 6. Gating des pubs AdMob

Dans le composant qui gère l'affichage des pubs :

```ts
const { isPremium } = usePremium()

// N'afficher la pub que si non premium
if (!isPremium) {
  // show AdMob ad
}
```

### 7. Sync backend AdonisJS (optionnel mais recommandé)

Configurer un webhook RevenueCat → endpoint AdonisJS pour tracker les événements (`initial_purchase`, `renewal`, `cancellation`, `expiration`).

Endpoint à créer : `POST /api/revenuecat/webhook`

Valider le header `Authorization` avec la clé définie dans RevenueCat Dashboard → Integrations → Webhooks.

---

## Règles importantes

- **pnpm uniquement** — jamais npm ou yarn
- **Reacticx** pour tous les composants UI animés — utiliser `pnpm dlx reacticx add <component>`
- Ne pas créer de nouveaux produits RevenueCat ou App Store — tout est déjà configuré
- L'entitlement à vérifier est toujours `'premium'`
- L'offering à utiliser est `offerings.current` (configuré comme default dans RC Dashboard)
- Toujours ajouter un bouton "Restore Purchases" visible sur le paywall (obligation Apple)
- Tester en sandbox avec un compte Apple Sandbox avant de soumettre

---

## IDs de référence rapide

```
RC Project     : projc12ed521
RC App iOS     : app1a2f0a0474
Entitlement    : premium
Offering       : default_premium
Monthly ID     : com.netzil.tacticx.premium.monthly
Yearly ID      : com.netzil.tacticx.premium.yearly
Lifetime ID    : com.netzil.tacticx.premium.lifetime
```
