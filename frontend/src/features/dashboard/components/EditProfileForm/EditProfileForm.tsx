import { useState } from 'react'
import { Save } from 'lucide-react'

import { updateUser } from '../../../../services/user-service'
import type { UserResponse } from '../../../../types/user'

type EditProfileFormProps = {
  localUser: UserResponse
  onProfileUpdated: (updatedUser: UserResponse) => void
  onCancel: () => void
}

export default function EditProfileForm({
  localUser,
  onProfileUpdated,
  onCancel,
}: EditProfileFormProps) {
  const [name, setName] = useState(localUser.name ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setErrorMessage('Vnosno polje ne sme biti prazno.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      const updatedUser = await updateUser(localUser._id, {
        name: trimmedName,
      })

      setSuccessMessage('Profil je bil uspešno posodobljen.')
      onProfileUpdated(updatedUser)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Profila ni bilo mogoče posodobiti.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="dashboard-profile-name"
          className="text-sm font-bold text-[#504639]"
        >
          Ime in priimek
        </label>
        <input
          id="dashboard-profile-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eadfce]/80 bg-[#fffdf8]/75 px-4 py-3 text-sm font-semibold text-[#2C2417] outline-none transition-all duration-300 placeholder:text-[#c2b49e] focus:border-[#31583b]/50 focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(49,88,59,0.08)]"
          placeholder="Vnesi ime in priimek"
          disabled={isSubmitting}
        />
      </div>

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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#31583b] px-5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#294b32] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Shranjevanje...' : 'Shrani spremembe'}
        </button>
      </div>
    </form>
  )
}