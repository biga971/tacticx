import '~/css/landing.css'
import { ReactNode } from 'react'
import { Head, Link } from '@inertiajs/react'
import LandingNav from './nav'
import LandingFooter from './footer'
import { useReveal } from './use_reveal'
import { IconArrowLeft } from './icons'

interface Props {
  title: string
  metaDescription?: string
  heading: string
  updated: string
  children: ReactNode
}

/** Shared shell for legal / support documents: nav + back link + footer. */
export default function DocShell({ title, metaDescription, heading, updated, children }: Props) {
  useReveal()

  return (
    <div className="lp">
      <Head title={title}>
        {metaDescription ? <meta name="description" content={metaDescription} /> : null}
      </Head>

      <div className="grain" />
      <LandingNav />

      <main className="doc">
        <div className="doc-glow" />
        <div className="wrap">
          <div className="doc-inner">
            <Link href="/" className="doc-back">
              <IconArrowLeft />
              Retour à l'accueil
            </Link>
            <h1>{heading}</h1>
            <div className="doc-updated">Dernière mise à jour · {updated}</div>
            <div className="doc-body">{children}</div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
