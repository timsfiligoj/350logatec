import Image from 'next/image'
import { Cloud, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AcquisitionWithUrl } from '@/lib/space/db'

const SI_MONTHS = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december',
] as const

function formatSlovenianMonth(isoTimestamp: string): string {
  const [year, monthStr] = isoTimestamp.slice(0, 7).split('-')
  const month = SI_MONTHS[Number(monthStr) - 1]
  return `${month} ${year}`
}

export function ViewHero({
  acquisition,
  alt,
  actions,
  className,
}: {
  acquisition: AcquisitionWithUrl
  alt: string
  /** Optional element rendered absolutely in the image's top-right corner. */
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <figure
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-muted flex flex-col',
        className,
      )}
    >
      <div className="relative w-full bg-black/5 flex-1 min-h-0">
        <Image
          src={acquisition.public_url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-contain"
          priority
          unoptimized
        />
        {actions ? (
          <div className="absolute top-3 right-3 z-10">{actions}</div>
        ) : null}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t bg-background px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {formatSlovenianMonth(acquisition.captured_at)}
          </span>
          <span className="text-xs hidden sm:inline">
            ({new Date(acquisition.captured_at).toISOString().slice(0, 10)})
          </span>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Cloud className="h-3 w-3" />
          {acquisition.cloud_cover_pct.toFixed(1)}% oblačnost
        </Badge>
      </figcaption>
    </figure>
  )
}
