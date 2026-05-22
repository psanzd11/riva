import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-n-700">{children}</label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      {...rest}
      className={`w-full border-b border-n-300 bg-transparent px-0 py-2 text-[14px] text-n-900 outline-none transition focus:border-riva-black ${className}`}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', ...rest } = props
  return (
    <select
      {...rest}
      className={`w-full border-b border-n-300 bg-transparent px-0 py-2 text-[14px] text-n-900 outline-none transition focus:border-riva-black ${className}`}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return (
    <textarea
      {...rest}
      className={`w-full border border-n-300 bg-transparent px-3 py-2 text-[14px] text-n-900 outline-none transition focus:border-riva-black ${className}`}
    />
  )
}

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <div className="mb-5">
      <FieldLabel>{label}</FieldLabel>
      {children}
      {hint && <div className="mt-1 text-[11px] text-n-500">{hint}</div>}
    </div>
  )
}
