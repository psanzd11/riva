import type { ReactNode } from 'react'
import { money } from '../../../lib/format'

/**
 * Classical financial reports — line-by-line, no charts. Designed to print
 * to PDF via window.print() (parent renders inside [data-print="report"]).
 */

interface Line {
  label: string
  value: number
  indent?: number
  /** Render in bold; usually for subtotals/totals. */
  bold?: boolean
  /** Show a top border (used for subtotal lines after a group). */
  ruleTop?: boolean
  /** Show a double-line top border (final totals). */
  doubleTop?: boolean
  /** Right-side annotation, eg. "55,4%". */
  note?: string
  /** Tint the value: positive => success, negative => error. */
  signed?: boolean
}

function ReportFrame({
  title,
  period,
  children,
  comparison,
}: {
  title: string
  period: string
  children: ReactNode
  comparison?: string
}) {
  return (
    <div className="bg-riva-white">
      <div className="border-b border-n-300 px-8 py-6">
        <div className="eyebrow !mb-1.5">The RIVA Company · estados financieros</div>
        <h2 className="font-display text-[28px] font-light tracking-[0.04em] text-n-900">{title}</h2>
        <div className="mt-1 text-[12px] uppercase tracking-[0.1em] text-n-700">
          {period}
          {comparison && <span className="text-n-500"> · vs {comparison}</span>}
        </div>
      </div>
      {children}
      <div className="border-t border-n-300 px-8 py-3 text-[10px] uppercase tracking-[0.12em] text-n-500">
        Cifras en EUR · auditado internamente · sin auditar por terceros
      </div>
    </div>
  )
}

function StatementLines({ lines }: { lines: Line[] }) {
  return (
    <div className="px-8 py-6">
      <table className="w-full text-[13px]">
        <tbody>
          {lines.map((l, i) => {
            const isHeader = l.value === 0 && l.bold && !l.ruleTop && !l.doubleTop
            const valueColor =
              l.signed && l.value > 0 ? 'var(--success)' : l.signed && l.value < 0 ? 'var(--error)' : 'var(--n-900)'
            return (
              <tr key={i}>
                <td
                  className={`py-1.5 ${l.bold ? 'font-medium text-n-900' : 'text-n-700'}`}
                  style={{
                    paddingLeft: `${(l.indent ?? 0) * 16}px`,
                    borderTop: l.ruleTop ? '1px solid var(--n-300)' : l.doubleTop ? '3px double var(--n-700)' : undefined,
                    textTransform: isHeader ? 'uppercase' : undefined,
                    letterSpacing: isHeader ? '0.1em' : undefined,
                    fontSize: isHeader ? '11px' : undefined,
                    color: isHeader ? 'var(--n-500)' : undefined,
                  }}
                >
                  {l.label}
                </td>
                <td
                  className={`py-1.5 text-right font-display ${l.bold ? 'font-medium' : 'font-normal'}`}
                  style={{
                    borderTop: l.ruleTop ? '1px solid var(--n-300)' : l.doubleTop ? '3px double var(--n-700)' : undefined,
                    color: valueColor,
                  }}
                >
                  {l.value === 0 && isHeader ? '' : money(Math.abs(l.value), 'EUR')}
                  {l.value < 0 && !isHeader && <span className="text-error"> ·</span>}
                </td>
                <td
                  className="py-1.5 pl-4 text-right text-[11px] text-n-500"
                  style={{
                    borderTop: l.ruleTop ? '1px solid var(--n-300)' : l.doubleTop ? '3px double var(--n-700)' : undefined,
                  }}
                >
                  {l.note}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ====================================================================
// INCOME STATEMENT (P&L clásico)
// ====================================================================
export function IncomeStatement({ period, comparison }: { period: string; comparison?: string }) {
  const lines: Line[] = [
    { label: 'Ingresos', value: 0, bold: true },
    { label: 'RIVA Spain partners', value: 1380000, indent: 1 },
    { label: 'TIERRA partners', value: 980000, indent: 1 },
    { label: 'Flagship Miami', value: 480000, indent: 1 },
    { label: 'Total ingresos', value: 2840000, bold: true, ruleTop: true, indent: 0 },

    { label: 'Coste de ventas (COGS)', value: 0, bold: true },
    { label: 'Materia prima · madera', value: 1080000, indent: 1 },
    { label: 'Producción · fábrica ES', value: 380000, indent: 1 },
    { label: 'Logística internacional', value: 220000, indent: 1 },
    { label: 'Total COGS', value: 1680000, bold: true, ruleTop: true, indent: 0 },

    { label: 'Margen bruto', value: 1160000, bold: true, ruleTop: true, note: '40,8%', signed: true },

    { label: 'Gastos operativos', value: 0, bold: true },
    { label: 'Nóminas', value: 480000, indent: 1 },
    { label: 'Marketing', value: 180000, indent: 1 },
    { label: 'Tech · cloud', value: 82000, indent: 1 },
    { label: 'Comisiones comerciales', value: 142000, indent: 1 },
    { label: 'G&A', value: 88000, indent: 1 },
    { label: 'Total OpEx', value: 972000, bold: true, ruleTop: true, indent: 0 },

    { label: 'Operating income (EBIT)', value: 188000, bold: true, ruleTop: true, note: '6,6%', signed: true },
    { label: 'Impuestos', value: 47000, indent: 1 },
    { label: 'Net income', value: 141000, bold: true, doubleTop: true, note: '4,9%', signed: true },
  ]

  return (
    <ReportFrame title="Income statement · cuenta de pérdidas y ganancias" period={period} comparison={comparison}>
      <StatementLines lines={lines} />
    </ReportFrame>
  )
}

// ====================================================================
// BALANCE SHEET
// ====================================================================
export function BalanceSheet({ period }: { period: string }) {
  const lines: Line[] = [
    { label: 'Activos', value: 0, bold: true },
    { label: 'Activos corrientes', value: 0, bold: true, indent: 1 },
    { label: 'Caja y bancos', value: 580000, indent: 2 },
    { label: 'Cuentas por cobrar', value: 142000, indent: 2 },
    { label: 'Inventario · ES + USA', value: 1240000, indent: 2 },
    { label: 'Otros activos corrientes', value: 38000, indent: 2 },
    { label: 'Total corrientes', value: 2000000, bold: true, ruleTop: true, indent: 1 },

    { label: 'Activos no corrientes', value: 0, bold: true, indent: 1 },
    { label: 'Equipos e instalaciones', value: 320000, indent: 2 },
    { label: 'Intangibles · marca', value: 180000, indent: 2 },
    { label: 'Total no corrientes', value: 500000, bold: true, ruleTop: true, indent: 1 },

    { label: 'Total activos', value: 2500000, bold: true, doubleTop: true },

    { label: 'Pasivos', value: 0, bold: true },
    { label: 'Pasivos corrientes', value: 0, bold: true, indent: 1 },
    { label: 'Cuentas por pagar', value: 380000, indent: 2 },
    { label: 'Depósitos clientes · anticipos', value: 220000, indent: 2 },
    { label: 'Impuestos a pagar', value: 47000, indent: 2 },
    { label: 'Total corrientes', value: 647000, bold: true, ruleTop: true, indent: 1 },

    { label: 'Pasivos no corrientes', value: 0, bold: true, indent: 1 },
    { label: 'Deuda largo plazo', value: 200000, indent: 2 },
    { label: 'Total no corrientes', value: 200000, bold: true, ruleTop: true, indent: 1 },

    { label: 'Total pasivos', value: 847000, bold: true, ruleTop: true },

    { label: 'Patrimonio', value: 0, bold: true },
    { label: 'Capital social', value: 1000000, indent: 1 },
    { label: 'Reservas y beneficios retenidos', value: 653000, indent: 1 },
    { label: 'Total patrimonio', value: 1653000, bold: true, ruleTop: true },

    { label: 'Total pasivos + patrimonio', value: 2500000, bold: true, doubleTop: true },
  ]

  return (
    <ReportFrame title="Balance sheet · balance de situación" period={period}>
      <StatementLines lines={lines} />
    </ReportFrame>
  )
}

// ====================================================================
// CASH FLOW STATEMENT
// ====================================================================
export function CashFlowStatement({ period }: { period: string }) {
  const lines: Line[] = [
    { label: 'Actividades operativas', value: 0, bold: true },
    { label: 'Net income', value: 141000, indent: 1 },
    { label: 'Depreciación', value: 28000, indent: 1 },
    { label: 'Variación cuentas por cobrar', value: -42000, indent: 1, signed: true },
    { label: 'Variación inventario', value: -78000, indent: 1, signed: true },
    { label: 'Variación cuentas por pagar', value: 36000, indent: 1, signed: true },
    { label: 'Depósitos clientes recibidos', value: 220000, indent: 1, signed: true },
    { label: 'Flujo operativo', value: 305000, bold: true, ruleTop: true, signed: true },

    { label: 'Actividades de inversión', value: 0, bold: true },
    { label: 'CapEx · equipos', value: -64000, indent: 1, signed: true },
    { label: 'Inversión Flagship Miami', value: -48000, indent: 1, signed: true },
    { label: 'Flujo inversión', value: -112000, bold: true, ruleTop: true, signed: true },

    { label: 'Actividades de financiación', value: 0, bold: true },
    { label: 'Amortización deuda', value: -24000, indent: 1, signed: true },
    { label: 'Dividendos pagados', value: 0, indent: 1 },
    { label: 'Flujo financiación', value: -24000, bold: true, ruleTop: true, signed: true },

    { label: 'Variación neta de caja', value: 169000, bold: true, doubleTop: true, signed: true },
    { label: 'Caja al inicio', value: 411000, indent: 1 },
    { label: 'Caja al final', value: 580000, bold: true, ruleTop: true },
  ]

  return (
    <ReportFrame title="Cash flow statement · estado de flujos de efectivo" period={period}>
      <StatementLines lines={lines} />
    </ReportFrame>
  )
}
