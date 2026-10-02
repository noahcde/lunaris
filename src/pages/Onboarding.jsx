import { useState } from 'react'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { cx, sunSign } from '../lib/astro'
import Logo from '../components/Logo'

const inputClass = cx(
  'w-full rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-[15px] text-white placeholder:text-zinc-600',
  'transition-all duration-300 ease-in-out',
  'focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600',
  'disabled:opacity-40',
)

function Field({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-400">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  )
}

export default function Onboarding({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    firstName: initial.firstName ?? '',
    lastName: initial.lastName ?? '',
    birthDate: initial.birthDate ?? '',
    birthTime: initial.birthTime ?? '',
    birthTimeUnknown: initial.birthTimeUnknown ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const sign = sunSign(form.birthDate)
  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.birthDate &&
    (form.birthTime || form.birthTimeUnknown)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: form.birthDate,
        birthTime: form.birthTimeUnknown ? null : form.birthTime,
        birthTimeUnknown: form.birthTimeUnknown,
      })
    } catch {
      setError('L’enregistrement a échoué. Réessayez dans un instant.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-clarity-mask="true" className="flex min-h-screen flex-col pb-10 pt-8">
      <Logo size="sm" className="mb-6" />
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 flex w-fit items-center gap-1.5 rounded-lg py-1 text-sm text-zinc-400 transition-all duration-300 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
      )}

      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-white">
        {onCancel ? 'Votre profil' : 'Votre thème natal'}
        <span className="text-blue-600">.</span>
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Ces informations servent à calculer vos insights et vos jours fastes. Elles restent liées à
        votre compte.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstName" label="Prénom">
            <input id="firstName" className={inputClass} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required />
          </Field>
          <Field id="lastName" label="Nom">
            <input id="lastName" className={inputClass} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" required />
          </Field>
        </div>

        <Field id="birthDate" label="Date de naissance">
          <input
            id="birthDate"
            type="date"
            className={inputClass}
            value={form.birthDate}
            onChange={set('birthDate')}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </Field>

        <Field id="birthTime" label="Heure de naissance" hint="Elle permet de calculer votre ascendant.">
          <input
            id="birthTime"
            type="time"
            className={inputClass}
            value={form.birthTimeUnknown ? '' : form.birthTime}
            onChange={set('birthTime')}
            disabled={form.birthTimeUnknown}
          />
        </Field>

        <label htmlFor="birthTimeUnknown" className="-mt-2 flex cursor-pointer items-center gap-2.5 text-sm text-zinc-400">
          <input
            id="birthTimeUnknown"
            type="checkbox"
            checked={form.birthTimeUnknown}
            onChange={set('birthTimeUnknown')}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-blue-600"
          />
          Je ne connais pas mon heure de naissance
        </label>

        <div
          className={cx(
            'flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all duration-300 ease-in-out',
            sign ? 'border-purple-500/30 bg-purple-500/[0.06]' : 'border-zinc-900 bg-zinc-950',
          )}
        >
          <Sparkles className={cx('h-4 w-4', sign ? 'text-purple-500' : 'text-zinc-600')} strokeWidth={2} />
          <span className="text-sm text-zinc-400">
            {sign ? (
              <>
                Soleil en <span className="font-medium text-white">{sign}</span>
              </>
            ) : (
              'Votre signe s’affichera ici.'
            )}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-10">
        {error && (
          <p role="alert" className="mb-3 text-center text-xs text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!valid || saving}
          className={cx(
            'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-[15px] font-semibold text-white',
            'transition-all duration-300 ease-in-out hover:bg-blue-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            valid && !saving && 'shadow-[0_0_18px_rgba(37,99,235,0.45)]',
            'disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600',
          )}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {onCancel ? 'Enregistrer' : 'Continuer'}
        </button>
      </div>
    </form>
  )
}
