'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const tabs = [
  { id: 'info',       label: 'My Info',   icon: '👤' },
  { id: 'practice',  label: 'Practice',  icon: '📋' },
  { id: 'challenges',label: 'Challenges',icon: '🎯' },
  { id: 'stats',     label: 'Stats',     icon: '📊' },
  { id: 'rounds',    label: 'Rounds',    icon: '⛳' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'info'

  if (!pathname.startsWith('/dashboard')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors ${
                isActive
                  ? 'text-black border-t-2 border-[#FFD700]'
                  : 'text-zinc-500 border-t-2 border-transparent'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
