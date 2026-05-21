import type { ReactNode } from 'react'

type DetailPageShellProps = {
  children: ReactNode
  sidebar?: ReactNode
}

function DetailPageShell({ children, sidebar }: DetailPageShellProps) {
  return (
    <div className="min-h-screen bg-sand-50 px-4 py-10 text-brown-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-8">{children}</main>

        {sidebar && (
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  )
}

export default DetailPageShell