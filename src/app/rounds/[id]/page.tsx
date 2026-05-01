import { getRound, deleteRound } from '@/app/actions/rounds'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteRoundButton } from '@/components/rounds/DeleteRoundButton'

type Props = { params: Promise<{ id: string }> }

function scoreLabel(diff: number): string {
  if (diff <= -3) return 'Albatross'
  if (diff === -2) return 'Eagle'
  if (diff === -1) return 'Birdie'
  if (diff === 0) return 'Par'
  if (diff === 1) return 'Bogey'
  if (diff === 2) return 'Double'
  return `+${diff}`
}

function diffClass(diff: number): string {
  if (diff <= -2) return 'text-amber-600 font-bold'
  if (diff === -1) return 'text-red-600 font-semibold'
  if (diff === 0) return 'text-zinc-900'
  return 'text-zinc-500'
}

export default async function RoundDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { id } = await params
  const round = await getRound(Number(id))
  if (!round) notFound()

  const totalPar = round.holes.reduce((s, h) => s + h.par, 0)
  const totalPutts = round.holes.reduce((s, h) => s + h.putts, 0)
  const fwyOpps = round.holes.filter((h) => h.par > 3).length
  const fwyHit = round.holes.filter((h) => h.fairwayHit === true).length
  const girHit = round.holes.filter((h) => h.gir).length
  const totalDiff = (round.totalScore ?? 0) - totalPar
  const canEdit = round.userId === Number(session.user!.id) || session.user!.role === 'coach'

  async function handleDelete() {
    'use server'
    await deleteRound(round!.id)
    redirect('/dashboard?tab=rounds')
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=rounds" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium truncate">{round.courseName}</span>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{round.courseName}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(round.date).toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <Link href={`/rounds/${round.id}/edit`}>
                <Button variant="outline" size="sm" className="h-8 text-xs">Edit</Button>
              </Link>
              <form action={handleDelete}>
                <DeleteRoundButton />
              </form>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="pt-5 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold tabular-nums">{round.totalScore}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Score</div>
            </div>
            <div>
              <div className={`text-2xl font-bold tabular-nums ${totalDiff > 0 ? 'text-zinc-700' : totalDiff < 0 ? 'text-red-600' : ''}`}>
                {totalDiff >= 0 ? '+' : ''}{totalDiff}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">vs Par {totalPar}</div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">{totalPutts}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Putts</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-[36px_36px_44px_44px_36px_36px_44px] gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              <span>#</span>
              <span>Par</span>
              <span>Score</span>
              <span></span>
              <span className="text-center">Fwy</span>
              <span className="text-center">GIR</span>
              <span>Putts</span>
            </div>
            <div className="divide-y">
              {round.holes.map((h) => {
                const diff = h.score - h.par
                return (
                  <div
                    key={h.id}
                    className="grid grid-cols-[36px_36px_44px_44px_36px_36px_44px] gap-1.5 items-center py-2 text-sm"
                  >
                    <span className="font-semibold tabular-nums">{h.holeNumber}</span>
                    <span className="tabular-nums">{h.par}</span>
                    <span className={`tabular-nums ${diffClass(diff)}`}>{h.score}</span>
                    <span className={`text-[10px] ${diffClass(diff)}`}>{scoreLabel(diff)}</span>
                    <span className="text-center text-xs">
                      {h.fairwayHit === true ? '✓' : h.fairwayHit === false ? '✗' : '—'}
                    </span>
                    <span className="text-center text-xs">{h.gir ? '✓' : '·'}</span>
                    <span className="tabular-nums">{h.putts}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {fwyOpps > 0 && (
            <Badge variant="secondary">
              Fairways: {fwyHit}/{fwyOpps} ({Math.round((fwyHit / fwyOpps) * 100)}%)
            </Badge>
          )}
          <Badge variant="secondary">
            GIR: {girHit}/{round.holesPlayed} ({Math.round((girHit / round.holesPlayed) * 100)}%)
          </Badge>
        </div>

        {(round.weatherNotes || round.freeTextNotes) && (
          <Card>
            <CardContent className="pt-4 space-y-2 text-sm">
              {round.weatherNotes && (
                <p><strong className="text-xs text-muted-foreground uppercase">Weather:</strong> {round.weatherNotes}</p>
              )}
              {round.freeTextNotes && (
                <p className="whitespace-pre-wrap leading-relaxed">{round.freeTextNotes}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
