import { useRouter } from 'expo-router'
import { ChoiceStep, type ChoiceOption } from '@/components/onboarding/ChoiceStep'
import { useProfileStore, type ProfileFormat } from '@/lib/store/profileStore'

const OPTIONS: ChoiceOption<ProfileFormat>[] = [
  { value: 'vgc', label: 'VGC (Doubles)', description: 'Le format officiel 4v4, combats doubles.', icon: 'people-outline' },
  { value: '3v3', label: 'Singles 3v3', description: 'Combats simples, 3 Pokémon par équipe.', icon: 'person-outline' },
  { value: 'both', label: 'Les deux', description: 'Je touche aux deux formats.', icon: 'shuffle-outline' },
]

export default function FormatScreen() {
  const router = useRouter()
  const { format, setProfile } = useProfileStore()

  return (
    <ChoiceStep
      step={2}
      totalSteps={4}
      eyebrow="Étape 2 sur 4"
      title="Ton format préféré ?"
      options={OPTIONS}
      value={format}
      onSelect={(v) => {
        setProfile({ format: v })
        router.push('/(onboarding)/style')
      }}
    />
  )
}
