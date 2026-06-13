import { useState, FormEvent } from 'react'
import { IconCheckSuccess } from './icons'

// Placeholder endpoint — swap for the real Formspree id (or an internal route).
const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  variant: 'hero' | 'cta'
  buttonLabel: string
  successText: string
}

export default function WaitlistForm({ variant, buttonLabel, successText }: Props) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    setError(false)
    if (!EMAIL_RE.test(email.trim())) {
      setError(true)
      return
    }
    const data = new FormData()
    data.append('email', email.trim())
    data.append('format', 'both')
    // optimistic — show success regardless of placeholder endpoint result
    fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .catch(() => {})
      .finally(() => setDone(true))
    setDone(true)
  }

  if (done) {
    return (
      <div className="form-success show">
        <span className="ok">
          <IconCheckSuccess />
          {successText}
        </span>
      </div>
    )
  }

  return (
    <>
      <form className={variant === 'hero' ? 'hero-form' : undefined} onSubmit={onSubmit} noValidate>
        <input
          type="email"
          name="email"
          placeholder="ton@email.fr"
          aria-label="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </form>
      {error && <div className="form-err show">Adresse email invalide. Vérifie et réessaie.</div>}
    </>
  )
}
