import type { ReactNode } from 'react'
import { appStyles } from '../../../design'

type DetailPageShellProps = {
  children: ReactNode
  sidebar?: ReactNode
}

function DetailPageShell({ children, sidebar }: DetailPageShellProps) {
  return (
    <main className={appStyles.page.base}>
      <div className={appStyles.layout.fullWidthPanel}>
        <section className={appStyles.page.content}>
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