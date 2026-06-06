import Link from 'next/link'
import { getLeaderboardSnapshot, getAvailableSeasons } from '@/app/actions/birdie-board'
import { getSeasonRecords } from '@/app/actions/records'
import BoardCard from '@/components/birdie-board/BoardCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  userId: number
  view?: string
  season?: string
}

type RoundScoreRow = {
  roundId: number
  userId: number
  name: string
  totalScore: number
  courseName: string
  date: string
}

type ChallengeBoard = {
  challengeId: number
  challengeName: string
  scoringType: 'score_out_of' | 'makes_in_a_row' | 'pass_fail' | 'count'
  unit: string | null
  maxScore: number | null
  higherIsBetter: boolean
  rows: Array<{
    userId: number
    name: string
    bestScore: number
  }>
}

function formatChallengeScore(challenge: ChallengeBoard, score: number): string {
  if (challenge.scoringType === 'pass_fail') return score === 1 ? 'Pass' : 'Fail'
  if (challenge.scoringType === 'score_out_of' && challenge.maxScore) return `${score} / ${challenge.maxScore}`
  if (challenge.scoringType === 'count' && challenge.unit) return `${score} ${challenge.unit}`
  return String(score)
}

function LowestScoresTable({
  title,
  rows,
  currentUserId,
}: {
  title: string
  rows: RoundScoreRow[]
  currentUserId: number
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No rounds logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-2 font-medium">Rank</th>
                  <th className="text-left py-2 pr-2 font-medium">Player</th>
                  <th className="text-left py-2 pr-2 font-medium">Course</th>
                  <th className="text-right py-2 pr-2 font-medium">Score</th>
                  <th className="text-right py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const isMe = row.userId === currentUserId
                  return (
                    <tr
                      key={row.roundId}
                      className={`border-b last:border-b-0 ${isMe ? 'bg-[#FFD700]/15' : ''}`}
                    >
                      <td className="py-2 pr-2">{index + 1}</td>
                      <td className="py-2 pr-2 font-medium">
                        {row.name}
                        {isMe && <span className="text-xs ml-1">(you)</span>}
                      </td>
                      <td className="py-2 pr-2">{row.courseName}</td>
                      <td className="py-2 pr-2 text-right tabular-nums font-semibold">{row.totalScore}</td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChallengeLeaderboardsTable({
  boards,
  currentUserId,
}: {
  boards: ChallengeBoard[]
  currentUserId: number
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Challenges Leaderboard (Top 5 Each)</CardTitle>
      </CardHeader>
      <CardContent>
        {boards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No active challenges yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-2 font-medium">Challenge</th>
                  <th className="text-left py-2 pr-2 font-medium">Rank</th>
                  <th className="text-left py-2 pr-2 font-medium">Player</th>
                  <th className="text-right py-2 font-medium">Best</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board) => {
                  if (board.rows.length === 0) {
                    return (
                      <tr key={`${board.challengeId}-empty`} className="border-b last:border-b-0">
                        <td className="py-2 pr-2 font-medium">{board.challengeName}</td>
                        <td className="py-2 pr-2 text-muted-foreground" colSpan={3}>
                          No entries yet.
                        </td>
                      </tr>
                    )
                  }

                  return board.rows.map((row, index) => {
                    const isMe = row.userId === currentUserId
                    return (
                      <tr
                        key={`${board.challengeId}-${row.userId}`}
                        className={`border-b last:border-b-0 ${isMe ? 'bg-[#FFD700]/15' : ''}`}
                      >
                        <td className="py-2 pr-2 font-medium">
                          {index === 0 ? board.challengeName : ''}
                          {index === 0 && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              ({board.higherIsBetter ? 'higher is better' : 'lower is better'})
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-2">{index + 1}</td>
                        <td className="py-2 pr-2">
                          {row.name}
                          {isMe && <span className="text-xs ml-1">(you)</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums font-semibold">
                          {formatChallengeScore(board, row.bestScore)}
                        </td>
                      </tr>
                    )
                  })
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function LeaderboardTab({ userId, view, season }: Props) {
  const isAllTime = view === 'alltime'
  const specificSeasonId = season ? Number(season) : undefined

  const [availableSeasons, leaderboard] = await Promise.all([
    getAvailableSeasons(),
    getLeaderboardSnapshot(isAllTime ? 'alltime' : 'season', specificSeasonId),
  ])

  const { board, seasonName, challenges, lowest9Hole, lowest18Hole } = leaderboard

  // Get records for the selected season (if viewing a specific season)
  const records = specificSeasonId ? await getSeasonRecords(specificSeasonId) : null

  const heading = isAllTime
    ? 'All-Time Leaderboard'
    : specificSeasonId
    ? seasonName
    : `${seasonName ?? 'Season'} Leaderboard`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{heading}</h2>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/dashboard?tab=leaderboard"
            className={`text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${
              !isAllTime && !specificSeasonId
                ? 'bg-black text-[#FFD700]'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Current Season
          </Link>
          <Link
            href="/dashboard?tab=leaderboard&view=alltime"
            className={`text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${
              isAllTime
                ? 'bg-black text-[#FFD700]'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All-Time
          </Link>
        </div>

        {!isAllTime && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Archive Seasons</p>
            <div className="grid grid-cols-2 gap-2">
              {availableSeasons.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard?tab=leaderboard&season=${s.id}`}
                  className={`p-2 rounded-md text-xs font-medium transition-colors text-center ${
                    specificSeasonId === s.id
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BoardCard
        title="Most Pars"
        icon="🎯"
        rows={board.pars}
        unit="pars"
        currentUserId={userId}
        emptyText="No pars logged yet."
      />

      <BoardCard
        title="Most Birdies"
        icon="🐦"
        rows={board.birdies}
        unit="birdies"
        currentUserId={userId}
        emptyText="No birdies yet. Log a round to get on the board."
      />

      <BoardCard
        title="Most Eagles"
        icon="🦅"
        rows={board.eagles}
        unit="eagles"
        currentUserId={userId}
        emptyText="No eagles yet. Be the first to make one."
      />

      <LowestScoresTable
        title="Top 10 Lowest 9-Hole Scores"
        rows={lowest9Hole}
        currentUserId={userId}
      />

      <LowestScoresTable
        title="Top 10 Lowest 18-Hole Scores"
        rows={lowest18Hole}
        currentUserId={userId}
      />

      <ChallengeLeaderboardsTable
        boards={challenges}
        currentUserId={userId}
      />

      {records && (
        <>
          <div className="pt-4 border-t">
            <h3 className="text-lg font-bold mb-4">Season Records</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <RecordCard title="Most Birdies" icon="🐦" rows={records.mostBirdiesSeason} />
            <RecordCard title="Most Pars" icon="🎯" rows={records.mostParsSeason} />
            <RecordCard title="Most Eagles" icon="🦅" rows={records.mostEaglesSeason} span2 />
            <RecordCard title="Lowest Round" icon="⛳" rows={records.lowestRoundSeason} span2 />
          </div>
        </>
      )}
    </div>
  )
}

function RecordCard({
  title,
  icon,
  rows,
  span2,
}: {
  title: string
  icon: string
  rows: any[]
  span2?: boolean
}) {
  return (
    <Card className={span2 ? 'col-span-2' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>{icon}</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-1">
            {rows.map((row, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-medium">{idx + 1}. {row.name}</span>
                <span className="text-muted-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

