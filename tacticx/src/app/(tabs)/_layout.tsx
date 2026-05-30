import { Tabs } from 'expo-router'
import { MorphingTabbar, type TabIconMap } from '@/components/ui/morphing-tabbar'

const ICONS: TabIconMap = {
  meta: 'stats-chart-outline',
  pokedex: 'search-outline',
  teams: 'people-outline',
  calc: 'calculator-outline',
  profile: 'person-outline',
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MorphingTabbar {...props} icons={ICONS} />}
    >
      <Tabs.Screen name="meta" options={{ title: 'Meta' }} />
      <Tabs.Screen name="pokedex" options={{ title: 'Pokédex' }} />
      <Tabs.Screen name="teams" options={{ title: 'Teams' }} />
      <Tabs.Screen name="calc" options={{ title: 'Calc' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  )
}
