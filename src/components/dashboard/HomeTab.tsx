import Link from 'next/link'

const tiles = [
  { id: 'info',        label: 'My Info',       icon: '👤' },
  { id: 'practice',    label: 'Practice',      icon: '📋' },
  { id: 'challenges',  label: 'Challenges',    icon: '🎯' },
  { id: 'leaderboard', label: 'Leaderboard',   icon: '🏆' },
  { id: 'stats',       label: 'Stats',         icon: '📊' },
  { id: 'rounds',      label: 'Rounds',        icon: '⛳' },
  { id: 'courses',     label: 'Course Strategy', icon: '🗺️' },
  { id: 'rules',       label: 'Rules',         icon: '📖' },
]

export default function HomeTab() {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 h-[calc(100dvh-3.5rem)] max-w-md mx-auto w-full">
      {tiles.map((t) => (
        <Link
          key={t.id}
          href={`/dashboard?tab=${t.id}`}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-foreground/10 hover:ring-[#FFD700] active:bg-zinc-50 transition-colors text-center"
        >
          <span className="text-[clamp(2.75rem,12vw,4.5rem)] leading-none">
            {t.icon}
          </span>
          <span className="text-sm font-semibold">{t.label}</span>
        </Link>
      ))}
    </div>
  )
}
