'use client'

type PasswordFieldProps = {
  label: string
  value: string
  placeholder: string
  visible: boolean
  onToggle: () => void
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  autoComplete?: string
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.5 10.5 0 0 0 2.25 12s3.75 6.75 9.75 6.75c1.02 0 1.99-.14 2.91-.4m3.08-1.47A10.47 10.47 0 0 0 21.75 12s-3.75-6.75-9.75-6.75c-1.13 0-2.2.17-3.19.48" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 4.5 15 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 9.879A3 3 0 1 0 14.12 14.12" />
    </svg>
  )
}

export default function PasswordField({
  label,
  value,
  placeholder,
  visible,
  onToggle,
  onChange,
  disabled = false,
  error,
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  const inputId = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  )
}
