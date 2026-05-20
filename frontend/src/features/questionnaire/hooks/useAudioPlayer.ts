import { useEffect, useRef, useState } from 'react'

export function useAudioPlayer(audioSrc?: string) {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)

	useEffect(() => {
		audioRef.current = new Audio()

		const audio = audioRef.current

		const handleEnded = () => {
			setIsPlaying(false)
		}

		audio.addEventListener('ended', handleEnded)

		return () => {
			audio.pause()
			audio.removeEventListener('ended', handleEnded)
			audioRef.current = null
		}
	}, [])

	useEffect(() => {
		stop()
	}, [audioSrc])

	function stop() {
		if (!audioRef.current) return

		audioRef.current.pause()
		audioRef.current.currentTime = 0
		setIsPlaying(false)
	}

	async function play() {
		if (!audioRef.current || !audioSrc) return

		audioRef.current.src = audioSrc
		audioRef.current.currentTime = 0

		try {
			await audioRef.current.play()
			setIsPlaying(true)
		} catch (error) {
			console.error('Audio playback failed:', error)
			setIsPlaying(false)
		}
	}

	function toggle() {
		if (isPlaying) {
			stop()
			return
		}

		play()
	}

	return {
		isPlaying,
		play,
		stop,
		toggle,
		hasAudio: Boolean(audioSrc),
	}
}