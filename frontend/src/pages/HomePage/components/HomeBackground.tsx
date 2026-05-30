function HomeBackground() {
	return (
		<>
			<div
				className="pointer-events-none fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top_left,_rgba(208,122,18,0.10),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(49,88,59,0.10),_transparent_24%),radial-gradient(circle_at_90%_80%,_rgba(234,223,206,0.45),_transparent_32%),linear-gradient(180deg,_#fffdf8,_#fff6eb)]"
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none fixed left-0 top-36 -z-40 h-72 w-72 rounded-full bg-[#fff4e6] blur-3xl"
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none fixed right-0 top-24 -z-40 h-96 w-96 rounded-full bg-[#f2f8f1] blur-3xl"
				aria-hidden="true"
			/>
		</>
	)
}

export default HomeBackground