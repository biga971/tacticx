import { useRouter } from 'expo-router'
import { ChoiceStep, type ChoiceOption } from '@/components/onboarding/ChoiceStep'
import { useProfileStore, type Style } from '@/lib/store/profileStore'

const OPTIONS: ChoiceOption<Style>[] = [
  { value: 'offense', label: 'Offensif', description: 'Pression constante, KO rapides.', icon: 'flash-outline' },
  { value: 'control', label: 'Contrôle', description: 'Statut, météo, gestion du tempo.', icon: 'shield-outline' },
  { value: 'balance', label: 'Équilibré', description: 'Un mix adaptable à chaque match.', icon: 'scale-outline' },
]

export default function StyleScreen() {
  const router = useRouter()
  const { style, setProfile } = useProfileStore()

  return (
    <ChoiceStep
      step={3}
      totalSteps={4}
      eyebrow="Étape 3 sur 4"
      title="Ton style de jeu ?"
      options={OPTIONS}
      value={style}
      onSelect={(v) => {
        setProfile({ style: v })
        router.push('/(onboarding)/objectif')
      }}
    />
  )
}
