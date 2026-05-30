import { useState } from 'react'
import { Mail } from 'lucide-react'

import { supabase } from '../../../../services/supabase-client'

type ChangeEmailFormProps = {
  currentEmail: string
  onCancel: () => void
}

export default function ChangeEmailForm({
  currentEmail,
  onCancel,
}: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = newEmail.trim()

    if (!trimmedEmail) {
      setErrorMessage('Vnesi novi email naslov.')
      setSuccessMessage('')
      return
    }

    if (trimmedEmail === currentEmail) {
      setErrorMessage('Novi email mora biti drugačen od trenutnega.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      const { error } = await supabase.auth.updateUser({
        email: trimmedEmail,
      })

      if (error) {
        throw error
      }

      setNewEmail('')
      setSuccessMessage(
        'Zahteva za spremembo emaila je bila poslana. Preveri svoj email in potrdi spremembo.'
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Emaila ni bilo mogoče spremeniti.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-bold text-[#504639]">Trenutni email</p>
        <div className="mt-2 rounded-2xl border border-[#eadfce]/70 bg-[#faf7f2]/60 px-4 py-3">
          <p className="truncate text-sm font-semibold text-[#8b7c65]">
            {currentEmail || 'Email ni na voljo'}
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="dashboard-new-email"
          className="text-sm font-bold text-[#504639]"
        >
          Novi email
        </label>
        <input
          id="dashboard-new-email"
          type="email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eadfce]/80 bg-[#fffdf8]/75 px-4 py-3 text-sm font-semibold text-[#2C2417] outline-none transition-all duration-300 placeholder:text-[#c2b49e] focus:border-[#d07a12]/50 focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(208,122,18,0.08)]"
          placeholder="novi@email.com"
          disabled={isSubmitting}
        />
      </div>

      <p className="rounded-2xl border border-[#eadfce]/70 bg-[#faf7f2]/60 px-4 py-3 text-xs leading-5 text-[#8b7c65]">
        Po oddaji bo Supabase poslal potrditveni email. Email v aplikaciji se
        posodobi šele po uspešni potrditvi.
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
          <Mail className="h-4 w-4" />
          {isSubmitting ? 'Pošiljanje...' : 'Pošlji zahtevo'}
        </button>
      </div>
    </form>
  )
}