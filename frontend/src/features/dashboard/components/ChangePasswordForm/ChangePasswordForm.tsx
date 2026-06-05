import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

import { supabase } from '../../../../services/supabase-client'

type ChangePasswordFormProps = {
  onCancel: () => void
  onPasswordChanged: () => Promise<void>
}

export default function ChangePasswordForm({
  onCancel,
  onPasswordChanged,
}: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (newPassword.length < 6) {
      setErrorMessage('Geslo mora imeti vsaj 6 znakov.')
      setSuccessMessage('')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Gesli se ne ujemata.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      setNewPassword('')
      setConfirmPassword('')
      setSuccessMessage(
        'Geslo je bilo uspešno posodobljeno. Preusmerjeni boste na prijavo.'
      )

      await onPasswordChanged()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gesla ni bilo mogoče posodobiti.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="dashboard-new-password"
          className="text-sm font-bold text-[#504639]"
        >
          Novo geslo
        </label>

        <div className="relative mt-2">
          <input
            id="dashboard-new-password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-2xl border border-[#eadfce]/80 bg-[#fffdf8]/75 px-4 py-3 pr-12 text-sm font-semibold text-[#2C2417] outline-none transition-all duration-300 placeholder:text-[#c2b49e] focus:border-[#d07a12]/50 focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(208,122,18,0.08)]"
            placeholder="Vnesi novo geslo"
            disabled={isSubmitting}
          />

          <button
            type="button"
            onClick={() => setShowNewPassword((current) => !current)}
            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8b7c65] transition-all duration-300 hover:bg-[#fff6eb] hover:text-[#d07a12] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            aria-label={showNewPassword ? 'Skrij novo geslo' : 'Prikaži novo geslo'}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="dashboard-confirm-password"
          className="text-sm font-bold text-[#504639]"
        >
          Potrdi novo geslo
        </label>

        <div className="relative mt-2">
          <input
            id="dashboard-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-[#eadfce]/80 bg-[#fffdf8]/75 px-4 py-3 pr-12 text-sm font-semibold text-[#2C2417] outline-none transition-all duration-300 placeholder:text-[#c2b49e] focus:border-[#d07a12]/50 focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(208,122,18,0.08)]"
            placeholder="Ponovno vnesi novo geslo"
            disabled={isSubmitting}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8b7c65] transition-all duration-300 hover:bg-[#fff6eb] hover:text-[#d07a12] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            aria-label={
              showConfirmPassword
                ? 'Skrij potrditveno geslo'
                : 'Prikaži potrditveno geslo'
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <p className="rounded-2xl border border-[#eadfce]/70 bg-[#faf7f2]/60 px-4 py-3 text-xs leading-5 text-[#8b7c65]">
        Po uspešni spremembi gesla boš odjavljena in preusmerjena na prijavo.
      </p>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-[#c3d4c0]/80 bg-[#f2f8f1]/80 px-4 py-3 text-sm font-semibold text-[#31583b]">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#eadfce]/90 bg-[#fffdf8]/70 px-5 text-sm font-bold text-[#6e614f] shadow-sm transition-all duration-300 hover:border-[#d07a12]/30 hover:bg-[#fff6eb] hover:text-[#d07a12] active:scale-95"
          disabled={isSubmitting}
        >
          Prekliči
        </button>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d07a12] px-5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#b3660f] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          <KeyRound className="h-4 w-4" />
          {isSubmitting ? 'Shranjevanje...' : 'Spremeni geslo'}
        </button>
      </div>
    </form>
  )
}

