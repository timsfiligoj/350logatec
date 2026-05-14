'use client'

import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function ForGeeksDialog({
  title,
  description,
  variant = 'default',
  children,
}: {
  title: string
  description?: string
  /** "overlay" gives a glass button that reads over satellite imagery. */
  variant?: 'default' | 'overlay'
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          'inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors',
          variant === 'overlay'
            ? 'bg-background/85 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-1.5 text-foreground hover:bg-background'
            : 'border border-input bg-background px-3 py-1.5 hover:bg-muted',
        )}
      >
        <FlaskConical className="h-4 w-4" />
        Za geeke
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div
          className="
            text-sm text-foreground leading-relaxed
            [&_p]:mb-3 [&_p:last-child]:mb-0
            [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5
            [&_li]:leading-relaxed
            [&_strong]:font-semibold [&_strong]:text-foreground
            [&_em]:italic
          "
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
