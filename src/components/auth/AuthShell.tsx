import type { ReactNode } from 'react'

type AuthShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute bottom-10 right-6 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
          </div>

          <div className="relative space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                TechMap
              </div>
              <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Technical issue reporting made simple.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 xl:text-base">
                Log in or create an account to submit reports, track status, and view issues on the map in one clean workspace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Fast reporting</p>
                <p className="mt-1 text-sm text-slate-300">Capture issue details quickly with a simple form.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Map visibility</p>
                <p className="mt-1 text-sm text-slate-300">See where each issue was reported on the map.</p>
              </div>
            </div>
          </div>

          <div className="relative text-sm text-slate-400">
            Built for the TechMap issue reporting workflow.
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                TechMap
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="mb-8 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Account Access</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
                <p className="text-sm leading-6 text-slate-500 sm:text-base">{subtitle}</p>
              </div>

              {children}

              <div className="mt-6 border-t border-slate-200 pt-5 text-sm text-slate-600">
                {footer}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
