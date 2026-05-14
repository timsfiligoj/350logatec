import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function MetricCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  accent = 'emerald',
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
  icon?: LucideIcon
  accent?: 'emerald' | 'blue' | 'amber' | 'slate'
}) {
  const accentClasses = {
    emerald: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-900 ring-blue-100',
    amber: 'bg-amber-50 text-amber-900 ring-amber-100',
    slate: 'bg-slate-50 text-slate-900 ring-slate-100',
  }[accent]
  const iconAccent = {
    emerald: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
    amber: 'bg-amber-500 text-white',
    slate: 'bg-slate-500 text-white',
  }[accent]

  return (
    <Card className={cn('border-0 ring-1', accentClasses)}>
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {Icon ? (
            <div
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shadow-sm shrink-0',
                iconAccent,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
          <p className="text-sm font-medium text-current/80 leading-tight">
            {label}
          </p>
        </div>
        <p className="font-display text-4xl font-bold tracking-tight">
          {value}
          {unit ? (
            <span className="text-2xl font-semibold text-current/70 ml-1">
              {unit}
            </span>
          ) : null}
        </p>
        {hint ? <p className="text-sm text-current/70">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
