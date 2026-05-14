import { cn } from '@/lib/utils'

export type LegendStop = {
  color: string
  label: string
}

export function ColorLegend({
  stops,
  caption,
  className,
}: {
  stops: LegendStop[]
  caption?: string
  className?: string
}) {
  const gradient = `linear-gradient(to right, ${stops
    .map((s) => s.color)
    .join(', ')})`

  return (
    <div className={cn('rounded-2xl border bg-card p-4 md:p-5', className)}>
      {caption ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          {caption}
        </p>
      ) : null}
      <div
        className="h-3 w-full rounded-full"
        style={{ backgroundImage: gradient }}
        aria-hidden
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {stops.map((s) => (
          <span key={s.label} className="font-medium text-foreground/80">
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
