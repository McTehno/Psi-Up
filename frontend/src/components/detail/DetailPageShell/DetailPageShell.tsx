import type { ReactNode } from 'react'

type DetailPageShellProps = {
	children: ReactNode
	sidebar?: ReactNode
}

function DetailPageShell({ children, sidebar }: DetailPageShellProps) {
	return (
		<main className="relative min-h-screen bg-[#f3eadc] px-4 pb-14 pt-24 sm:px-6 lg:px-8">
			<div
				className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,_#fff6eb_0%,_#f4eadc_38%,_#eef6ec_70%,_#fffdf8_100%)]"
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none fixed -left-24 top-20 h-[420px] w-[420px] rounded-full bg-[#d07a12]/18 blur-[90px]"
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none fixed right-[-120px] top-44 h-[460px] w-[460px] rounded-full bg-[#31583b]/18 blur-[100px]"
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none fixed bottom-[-140px] left-[30%] h-[420px] w-[560px] rounded-full bg-white/55 blur-[100px]"
				aria-hidden="true"
			/>

			<div className="relative mx-auto max-w-[1800px] rounded-[34px] border border-white/55 bg-[#fffdf8]/58 shadow-[0_28px_90px_rgba(57,47,35,0.16)]">
				<div
					className="pointer-events-none absolute inset-0 rounded-[34px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.55)_0%,_rgba(255,253,248,0.24)_42%,_rgba(255,246,235,0.20)_100%)]"
					aria-hidden="true"
				/>

				<div
					className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/80"
					aria-hidden="true"
				/>

				<section className="relative rounded-[34px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
					<div className="mx-auto max-w-[1180px]">
						{sidebar ? (
							<div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
								<div className="min-w-0 space-y-8">{children}</div>

								<aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
									{sidebar}
								</aside>
							</div>
						) : (
							<div className="space-y-8">{children}</div>
						)}
					</div>
				</section>
			</div>
		</main>
	)
}

export default DetailPageShell

