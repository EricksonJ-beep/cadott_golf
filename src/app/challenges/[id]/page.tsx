import {
  getChallenge,
  getMyChallengeResults,
  getSeasonLeaderboard,
  getAllTimeRecord,
  getActiveSeason,
} from '@/app/actions/challenges'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LogResultForm from '@/components/challenges/LogResultForm'
import Leaderboard from '@/components/challenges/Leaderboard'

type Props = { params: Promise<{ id: string }> }

const CATEGORY_LABEL: Record<string, string> = {
  putting: 'Putting',
  chipping: 'Chipping',
  bunker: 'Bunker',
  driving: 'Driving',
  approach: 'Approach',
  wedges: 'Wedges',
  course_stats: 'Course Stats',
}

export default async function ChallengeDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { id } = await params
  const challengeId = Number(id)
  if (!challengeId) notFound()

  const [challenge, season, seasonRows, allTime, myResults] = await Promise.all([
    getChallenge(challengeId),
    getActiveSeason(),
    getSeasonLeaderboard(challengeId),
    getAllTimeRecord(challengeId),
    getMyChallengeResults(challengeId),
  ])

  if (!challenge) notFound()

  const userId = Number(session.user.id)

  const formatScore = (n: number): string => {
    if (challenge.scoringType === 'pass_fail') return n === 1 ? '✓ Pass' : '✗ Fail'
    if (challenge.scoringType === 'score_out_of' && challenge.maxScore) return `${n} / ${challenge.maxScore}`
    if (challenge.scoringType === 'count' && challenge.unit) return `${n} ${challenge.unit}`
    return String(n)
  }

  const myBest = myResults.length > 0 ? Math.max(...myResults.map((r) => r.score)) : null

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=challenges" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium truncate">{challenge.name}</span>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold">{challenge.name}</h1>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Badge variant="secondary">
              {challenge.type === 'range' ? 'Range' : 'Course'}
            </Badge>
            <Badge variant="outline">{CATEGORY_LABEL[challenge.category]}</Badge>
            {myBest !== null && (
              <Badge className="bg-[#FFD700] text-black hover:bg-[#FFD700]">
                Your best: {formatScore(myBest)}
              </Badge>
            )}
          </div>
          {challenge.description && (
            <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap leading-relaxed">
              {challenge.description}
            </p>
          )}
        </div>

        <LogResultForm
          challengeId={challenge.id}
          scoringType={challenge.scoringType}
          maxScore={challenge.maxScore}
          unit={challenge.unit}
        />

        <Leaderboard
          seasonName={season?.name ?? null}
          seasonRows={seasonRows}
          allTime={allTime}
          formatScore={formatScore}
          currentUserId={userId}
        />

        {myResults.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your History</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {myResults.slice(0, 10).map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="tabular-nums font-medium">{formatScore(r.score)}</p>
                      {r.notes && (
                        <p className="text-xs text-muted-foreground truncate">{r.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.dateLogged).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              {myResults.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing 10 most recent of {myResults.length}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
