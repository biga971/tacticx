import { useEffect } from 'react'

/**
 * Staggered scroll-reveal. Adds `.in` to every `.reveal` element as it
 * enters the viewport, with a small per-sibling delay. Elements already
 * visible on mount reveal immediately, and a failsafe snaps everything
 * to its final state so content is never left hidden.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    const showNow = (el: HTMLElement) => {
      if (el.classList.contains('in')) return
      const parent = el.parentNode as HTMLElement | null
      const sibs = parent
        ? Array.from(parent.children).filter((c) => c.classList.contains('reveal'))
        : [el]
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 60}ms`
      el.classList.add('in')
    }

    // reveal anything already in view on mount
    const h = window.innerHeight || document.documentElement.clientHeight
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < h * 0.92) showNow(el)
    })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            showNow(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))

    // failsafe — never leave content hidden
    const t = window.setTimeout(() => {
      els.forEach((el) => {
        showNow(el)
        el.style.transition = 'none'
      })
    }, 900)

    return () => {
      io.disconnect()
      window.clearTimeout(t)
    }
  }, [])
}
