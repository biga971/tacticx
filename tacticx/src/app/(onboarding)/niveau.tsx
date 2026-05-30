import { useRouter } from 'expo-router'
import { ChoiceStep, type ChoiceOption } from '@/components/onboarding/ChoiceStep'
import { useProfileStore, type Level } from '@/lib/store/profileStore'

const OPTIONS: ChoiceOption<Level>[] = [
  { value: 'casual', label: 'Casual', description: 'Je joue pour le fun, sans pression.', icon: 'happy-outline' },
  {
    value: 'competitive',
    label: 'Compétitif',
    description: 'Je grimpe le ladder et vise le top.',
    icon: 'trophy-outline',
  },
  {
    value: 'tryhard',
    label: 'Tryhard',
    description: 'Tournois, théorycraft, optimisation max.',
    icon: 'flame-outline',
  },
]

export default function NiveauScreen() {
  const router = useRouter()
  const { level, setProfile } = useProfileStore()

  return (
    <ChoiceStep
      step={1}
      totalSteps={4}
      eyebrow="Étape 1 sur 4"
      title="Ton niveau de jeu ?"
      options={OPTIONS}
      value={level}
      onSelect={(v) => {
        setProfile({ level: v })
        router.push('/(onboarding)/format')
      }}
    />
  )
}
