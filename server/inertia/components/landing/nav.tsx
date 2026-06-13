import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { IconHamburger } from './icons'

/**
 * Fixed landing nav. On the home page, the section links scroll smoothly
 * to in-page anchors; on other pages they navigate back to `/#anchor`.
 */
export default function LandingNav({ home = false }: { home?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const href = (anchor: string) => (home ? `#${anchor}` : `/#${anchor}`)

  return (
    <nav className={scrolled ? 'scrolled' : undefined}>
      <div className="nav-inner">
        <Link href="/" className="logo">
          Tactic<b>x</b>
        </Link>
        <div className="nav-links">
          <a href={href('features')} className="link">
            Features
          </a>
          <a href={href('apropos')} className="link">
            À propos
          </a>
          <a href={href('waitlist')} className="btn btn-primary">
            Rejoindre la liste
          </a>
        </div>
        <button
          className="hamburger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <IconHamburger />
        </button>
      </div>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <a href={href('features')} onClick={() => setOpen(false)}>
          Features
        </a>
        <a href={href('apropos')} onClick={() => setOpen(false)}>
          À propos
        </a>
        <a href={href('waitlist')} className="btn btn-primary" onClick={() => setOpen(false)}>
          Rejoindre la liste
        </a>
      </div>
    </nav>
  )
}
