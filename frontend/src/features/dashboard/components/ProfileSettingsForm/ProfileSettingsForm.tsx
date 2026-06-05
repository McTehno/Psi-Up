import { useState } from 'react'
import { KeyRound, Save } from 'lucide-react'

import { supabase } from '../../../../services/supabase-client'
import { updateUser } from '../../../../services/user-service'
import type { UserResponse } from '../../../../types/user'

type ProfileSettingsFormProps = {
	localUser: UserResponse
	displayEmail: string
	onProfileUpdated: (updatedUser: UserResponse) => void
	onOpenPasswordChange: () => void
	onCancel: () => void
}

export default function ProfileSettingsForm({
	localUser,
	displayEmail,
	onProfileUpdated,
	onOpenPasswordChange,
	onCancel,
}: ProfileSettingsFormProps) {
	const [name, setName] = useState(localUser.name ?? '')
	const [email, setEmail] = useState(displayEmail)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const trimmedName = name.trim()
		const trimmedEmail = email.trim()

		if (!trimmedName) {
			setErrorMessage('Vnosno polje ne sme biti prazno.')
			setSuccessMessage('')
			return
		}

		if (!trimmedEmail) {
			setErrorMessage('Email ne sme biti prazen.')
			setSuccessMessage('')
			return
		}

		try {
			setIsSubmitting(true)
			setErrorMessage('')
			setSuccessMessage('')

			const shouldUpdateName = trimmedName !== (localUser.name ?? '')
			const shouldRequestEmailChange = trimmedEmail !== displayEmail

			if (shouldUpdateName) {
				const updatedUser = await updateUser(localUser._id, {
					name: trimmedName,
				})

				onProfileUpdated(updatedUser)
			}

			if (shouldRequestEmailChange) {
				const { error } = await supabase.auth.updateUser({
					email: trimmedEmail,
				})

				if (error) {
					throw error
				}
			}

			if (shouldRequestEmailChange) {
				setSuccessMessage(
					'Profil je bil posodobljen. Za spremembo emaila preveri potrditveni email.'
				)
			} else if (shouldUpdateName) {
				setSuccessMessage('Profil je bil uspešno posodobljen.')
			} else {
				setSuccessMessage('Ni sprememb za shranjevanje.')
			}
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
		<div className="space-y-5">
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

				<div>
					<label
						htmlFor="dashboard-profile-email"
						className="text-sm font-bold text-[#504639]"
					>
						Email
					</label>
					<input
						id="dashboard-profile-email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="mt-2 w-full rounded-2xl border border-[#eadfce]/80 bg-[#fffdf8]/75 px-4 py-3 text-sm font-semibold text-[#2C2417] outline-none transition-all duration-300 placeholder:text-[#c2b49e] focus:border-[#d07a12]/50 focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(208,122,18,0.08)]"
						placeholder="email@example.com"
						disabled={isSubmitting}
					/>
					<p className="mt-2 text-xs leading-5 text-[#a89880]">
						Če spremeniš email, bo treba spremembo potrditi prek emaila.
					</p>
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
						{isSubmitting ? 'Shranjevanje...' : 'Shrani profil'}
					</button>
				</div>
			</form>

			<div className="border-t border-[#eadfce]/70 pt-4">
				<button
					type="button"
					onClick={onOpenPasswordChange}
					className="flex w-full items-center justify-between rounded-2xl border border-[#eadfce]/80 bg-[#faf7f2]/60 px-4 py-3 text-left shadow-sm transition-all duration-300 hover:border-[#d07a12]/30 hover:bg-[#fff6eb]/80 hover:shadow-md active:scale-[0.99]"
				>
					<span>
						<span className="flex items-center gap-2 text-sm font-bold text-[#504639]">
							<KeyRound className="h-4 w-4 text-[#d07a12]" />
							Spremeni geslo
						</span>
						<span className="mt-1 block text-xs leading-5 text-[#a89880]">
							Odpre se ločeno okno za nastavitev novega gesla.
						</span>
					</span>

					<span className="text-lg font-bold text-[#d07a12]">›</span>
				</button>
			</div>
		</div>
	)
}

