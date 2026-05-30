import { useRouter } from 'expo-router'
import { ChoiceStep, type ChoiceOption } from '@/components/onboarding/ChoiceStep'
import { useProfileStore, type Objective } from '@/lib/store/profileStore'

const OPTIONS: ChoiceOption<Objective>[] = [
  { value: 'learn', label: 'Apprendre', description: 'Comprendre la méta et progresser.', icon: 'school-outline' },
  { value: 'rankup', label: 'Monter en rang', description: 'Optimiser mon ladder.', icon: 'trending-up-outline' },
  { value: 'tournament', label: 'Tournois', description: 'Préparer des compétitions.', icon: 'medal-outline' },
]

export default function ObjectifScreen() {
  const router = useRouter()
  const { objective, setProfile } = useProfileStore()

  return (
    <ChoiceStep
      step={4}
      totalSteps={4}
      eyebrow="Étape 4 sur 4"
      title="Ton objectif ?"
      options={OPTIONS}
      value={objective}
      onSelect={(v) => {
        setProfile({ objective: v })
        router.push('/(onboarding)/result')
      }}
    />
  )
}
