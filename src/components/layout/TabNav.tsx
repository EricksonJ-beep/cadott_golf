'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const tabs = [
  { id: 'info',       label: 'My Info',   icon: '👤' },
  { id: 'practice',  label: 'Practice',  icon: '📋' },
  { id: 'challenges',label: 'Challenges',icon: '🎯' },
  { id: 'leaderboard',label: 'Board',    icon: '🏆' },
  { id: 'stats',     label: 'Stats',     icon: '📊' },
  { id: 'rounds',    label: 'Rounds',    icon: '⛳' },
  { id: 'courses',   label: 'Courses',   icon: '🗺️' },
  { id: 'rules',     label: 'Rules',     icon: '📖' },
]

export default function TabNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab')

  if (!pathname.startsWith('/dashboard')) return null
  if (!activeTab) return null

  return (
    <nav className="sticky top-14 z-30 bg-white border-b border-zinc-200">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors ${
                isActive
                  ? 'text-black border-b-2 border-[#FFD700]'
                  : 'text-zinc-500 border-b-2 border-transparent'
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
