import Link from 'next/link'
import { getMyRounds } from '@/app/actions/rounds'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CvgaScheduleWidget from './CvgaScheduleWidget'

export default async function RoundsTab() {
  const rounds = await getMyRounds()

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Rounds</h2>

      <Link href="/rounds/new">
        <Button className="w-full h-12 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
          + Log a Round
        </Button>
      </Link>

      <CvgaScheduleWidget />

      {rounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <span className="text-4xl">⛳</span>
          <p className="text-sm text-muted-foreground max-w-xs">
            No rounds logged yet. Tap &ldquo;Log a Round&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Rounds
          </h3>
          {rounds.map((r) => (
            <Link key={r.id} href={`/rounds/${r.id}`}>
              <Card className="active:bg-zinc-50 cursor-pointer hover:border-[#FFD700]">
                <CardContent className="py-3 px-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()} · {r.holesPlayed} holes
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold tabular-nums">{r.totalScore ?? '—'}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
