import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from '../../data/store'

interface SearchCommandProps {
  open: boolean
  onClose: () => void
}

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const navigate = useNavigate()
  const partners = useStore((s) => s.partners)
  const deals = useStore((s) => s.deals)
  const invoices = useStore((s) => s.invoices)
  const skus = useStore((s) => s.skus)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] border border-n-300 bg-riva-white"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="bg-riva-white" loop>
          <div className="border-b border-n-300 px-4 py-3">
            <Command.Input
              placeholder="Buscar partner, deal, factura, SKU…"
              className="w-full border-none bg-transparent text-[14px] text-n-900 outline-none placeholder:text-n-500"
              autoFocus
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-center text-[13px] text-n-500">
              Sin resultados
            </Command.Empty>

            <Command.Group heading="Partners">
              <div className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.15em] text-n-500">Partners</div>
              {partners.slice(0, 20).map((p) => (
                <Command.Item
                  key={p.id}
                  value={`partner ${p.name} ${p.sede} ${p.address}`}
                  onSelect={() => go('/partners')}
                  className="cursor-pointer px-4 py-2 text-[13px] text-n-900 aria-selected:bg-n-100"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-n-500">
                    {p.sede.toUpperCase()} · {p.type}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Deals">
              <div className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.15em] text-n-500">Deals</div>
              {deals.slice(0, 20).map((d) => (
                <Command.Item
                  key={d.id}
                  value={`deal ${d.clientName} ${d.stage}`}
                  onSelect={() => go('/dept/ventas')}
                  className="cursor-pointer px-4 py-2 text-[13px] text-n-900 aria-selected:bg-n-100"
                >
                  <span className="font-medium">{d.clientName}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-n-500">{d.stage}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Facturas">
              <div className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.15em] text-n-500">Facturas</div>
              {invoices.slice(0, 15).map((i) => (
                <Command.Item
                  key={i.id}
                  value={`invoice ${i.number} ${i.status}`}
                  onSelect={() => go('/dept/accounting')}
                  className="cursor-pointer px-4 py-2 text-[13px] text-n-900 aria-selected:bg-n-100"
                >
                  <span className="font-medium">#{i.number}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-n-500">{i.status}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="SKUs">
              <div className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.15em] text-n-500">SKUs</div>
              {skus.slice(0, 15).map((s) => (
                <Command.Item
                  key={s.id}
                  value={`sku ${s.name} ${s.collection} ${s.finish}`}
                  onSelect={() => go('/dept/supply-chain')}
                  className="cursor-pointer px-4 py-2 text-[13px] text-n-900 aria-selected:bg-n-100"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-n-500">
                    {s.collection} · {s.finish}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
