'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Leaf, Droplet, Snowflake, Clock } from 'lucide-react'

const TABS = [
  { href: '/vesolje', label: 'Domov', icon: Home },
  { href: '/vesolje/rastje', label: 'Rastje', icon: Leaf },
  { href: '/vesolje/planinsko-polje', label: 'Planinsko polje', icon: Droplet },
  { href: '/vesolje/sneg', label: 'Sneg', icon: Snowflake },
  { href: '/vesolje/casovni-pregled', label: 'Časovni pregled', icon: Clock },
] as const

export function VesoljeNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2 -mx-1 scrollbar-none">
          {TABS.map((tab) => {
            const active = pathname === tab.href
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
