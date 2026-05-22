export type Currency = 'EUR' | 'USD'

const NF_EUR_FULL = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const NF_USD_FULL = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const COMPACT_ES = new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 })

/** Format money following demo conventions: `€ 384.200`, `$ 412.800`. */
export function money(amount: number, currency: Currency = 'EUR'): string {
  if (!Number.isFinite(amount)) return '—'
  if (currency === 'USD') {
    return NF_USD_FULL.format(amount).replace('$', '$ ').replace('$  ', '$ ')
  }
  return NF_EUR_FULL.format(amount).replace('€', '€ ').replace('€  ', '€ ')
}

/** Compact money: `€ 2,84M`, `$ 412k`. */
export function moneyCompact(amount: number, currency: Currency = 'EUR'): string {
  if (!Number.isFinite(amount)) return '—'
  const sym = currency === 'USD' ? '$' : '€'
  const compact = COMPACT_ES.format(amount).replace('mil', 'k').replace('M', 'M').replace('mill.', 'M')
  return `${sym} ${compact}`
}

export function percent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(digits).replace('.', ',')}%`
}

export function pp(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  const sign = value > 0 ? '↑ ' : value < 0 ? '↓ ' : '— '
  return `${sign}${Math.abs(value).toFixed(digits).replace('.', ',')} pp`
}

export function dateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function dateRelative(iso: string, now: Date = new Date()): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const diffMs = now.getTime() - d.getTime()
  const min = Math.round(diffMs / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return `Hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `Hace ${h} h`
  const days = Math.round(h / 24)
  if (days === 1) return 'Ayer'
  if (days < 7) return `${days} días`
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
}
