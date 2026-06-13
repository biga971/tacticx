import { Link } from '@inertiajs/react'
import { IconX_Social, IconTikTok } from './icons'

/** Shared landing / legal footer. */
export default function LandingFooter({ home = false }: { home?: boolean }) {
  const anchor = (a: string) => (home ? `#${a}` : `/#${a}`)

  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="logo">
              Tactic<b>x</b>
            </div>
            <p>
              Le compagnon stratégique pour Pokémon Champions. Méta, builder &amp; calc — sur
              mobile, en français.
            </p>
            <div className="foot-socials" style={{ marginTop: 22 }}>
              <a href="#" aria-label="X (Twitter)">
                <IconX_Social />
              </a>
              <a href="#" aria-label="TikTok">
                <IconTikTok />
              </a>
            </div>
          </div>
          <div className="foot-col">
            <h5>Produit</h5>
            <a href={anchor('features')}>Features</a>
            <a href={anchor('apropos')}>Pourquoi Tacticx</a>
            <a href={anchor('waitlist')}>Liste d'attente</a>
            <Link href="/support">Aide &amp; support</Link>
          </div>
          <div className="foot-col">
            <h5>Légal</h5>
            <Link href="/confidentialite">Politique de confidentialité</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/support">Contact</Link>
          </div>
        </div>
        <div className="foot-legal">
          <p className="mention">
            Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc. Tacticx n'est pas affilié à
            Nintendo ou The Pokémon Company, ni soutenu par eux. Tous les noms de Pokémon et marques
            associées appartiennent à leurs détenteurs respectifs.
          </p>
          <p className="copy">© 2026 Tacticx · Netzil · Enrick Bilba — Guadeloupe</p>
        </div>
      </div>
    </footer>
  )
}
