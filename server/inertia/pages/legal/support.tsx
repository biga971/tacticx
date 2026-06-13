import DocShell from '~/components/landing/doc_shell'
import { IconMail, IconChevronDown, IconX_Social } from '~/components/landing/icons'

const FAQ = [
  {
    q: 'Quand sort l\'application ?',
    a: "La bêta fermée VGC France est en cours. Le lancement mobile public est prévu pour juin 2026, en même temps que Pokémon Champions. Inscris-toi à la liste d'attente pour un accès prioritaire.",
  },
  {
    q: 'Tacticx est-il gratuit ?',
    a: "Oui, gratuit au lancement avec des publicités. Un abonnement VIP (3,99 €/mois ou 14,99 €/an) retire la publicité et débloque des fonctionnalités avancées.",
  },
  {
    q: 'Le calculateur de dégâts fonctionne-t-il sans réseau ?',
    a: 'Oui. Le calculateur embarque la formule exacte de Champions et fonctionne à 100 % hors-ligne — idéal en plein tournoi, sans connexion.',
  },
  {
    q: 'Puis-je utiliser Tacticx sans créer de compte ?',
    a: "Oui, via le mode invité. Tu peux consulter la méta, construire des équipes et utiliser le calc. La synchronisation entre appareils et la publication d'équipes nécessitent un compte.",
  },
  {
    q: 'Comment importer une équipe depuis Pokémon Showdown ?',
    a: "Depuis l'écran Builder, ouvre la page d'import et colle ton format Showdown / Poképaste. Tacticx reconstruit l'équipe, EV et objets compris.",
  },
  {
    q: 'Comment supprimer mon compte et mes données ?',
    a: "Profil → Paramètres → Supprimer le compte. Toutes tes données associées sont effacées. Tu peux aussi nous écrire à privacy@tacticx.app.",
  },
  {
    q: 'Tacticx est-il affilié à Nintendo ou The Pokémon Company ?',
    a: "Non. Tacticx est un projet indépendant, non affilié ni soutenu par Nintendo, Creatures Inc., GAME FREAK ou The Pokémon Company.",
  },
]

export default function Support() {
  return (
    <DocShell
      title="Aide & support — Tacticx"
      metaDescription="Questions fréquentes et contact pour l'application Tacticx."
      heading="Aide & support"
      updated="12 juin 2026"
    >
      <section>
        <p>
          Une question, un bug, une suggestion ? Consulte la FAQ ci-dessous. Si tu ne trouves pas ta
          réponse, écris-nous directement — on répond vite.
        </p>
        <div className="doc-contact">
          <a href="mailto:support@tacticx.app">
            <IconMail />
            support@tacticx.app
          </a>
          <a href="#" aria-label="X (Twitter)">
            <IconX_Social />
            @tacticx_app
          </a>
        </div>
      </section>

      <section>
        <h2>
          <span className="ix">FAQ</span>Questions fréquentes
        </h2>
        <div className="faq">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <span className="chev">
                  <IconChevronDown />
                </span>
              </summary>
              <div className="faq-a">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2>
          <span className="ix">→</span>Signaler un problème
        </h2>
        <p>
          Pour un bug, précise ton modèle d'appareil, ta version d'OS et les étapes pour reproduire.
          Une capture d'écran aide énormément. Envoie le tout à{' '}
          <a href="mailto:support@tacticx.app">support@tacticx.app</a>.
        </p>
      </section>
    </DocShell>
  )
}
