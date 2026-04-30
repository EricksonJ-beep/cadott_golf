import Link from 'next/link'
import { getActivityFeed, type FeedEvent } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TYPE_LABEL: Record<FeedEvent['type'], string> = {
  round: 'Round',
  challenge: 'Challenge',
  user_created: 'New Account',
  password_reset: 'Password Reset',
  club_distance: 'Club Distance',
}

const TYPE_COLOR: Record<FeedEvent['type'], string> = {
  round: 'bg-emerald-100 text-emerald-800',
  challenge: 'bg-sky-100 text-sky-800',
  user_created: 'bg-purple-100 text-purple-800',
  password_reset: 'bg-amber-100 text-amber-800',
  club_distance: 'bg-zinc-100 text-zinc-700',
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.round((now - then) / 1000))

  if (diffSec < 60) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`

  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function ActivityFeed() {
  const events = await getActivityFeed(20)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nothing here yet — rounds, challenges, and roster changes will show up here as they happen.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {events.map((e) => {
              const inner = (
                <div className="flex items-start gap-3 py-2.5 px-1">
                  <span
                    className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${TYPE_COLOR[e.type]}`}
                  >
                    {TYPE_LABEL[e.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(e.timestamp)}</p>
                  </div>
                </div>
              )

              return (
                <li key={e.id}>
                  {e.href ? (
                    <Link href={e.href} className="block hover:bg-zinc-50 rounded -mx-1 px-1">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
