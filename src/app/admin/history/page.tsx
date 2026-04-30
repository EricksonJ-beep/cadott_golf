import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPlayersBasic, getHistoricalStatsForPlayer } from '@/app/actions/admin'
import HistoricalStatsForm from '@/components/admin/HistoricalStatsForm'

type Props = { searchParams: Promise<{ userId?: string }> }

export default async function HistoryPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')

  const { userId: userIdParam } = await searchParams
  const players = await getPlayersBasic()
  const playersList = players.filter((p) => p.role === 'player')

  const selectedUserId = userIdParam
    ? Number(userIdParam)
    : (playersList[0]?.id ?? null)

  const existingStats = selectedUserId
    ? await getHistoricalStatsForPlayer(selectedUserId)
    : []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Historical Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter pre-app season data for each player — birdies, lowest round, scoring averages, etc.
          These feed into each player&apos;s all-time records on their Stats tab.
        </p>
      </div>

      {playersList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No players on the roster yet.</p>
      ) : (
        <HistoricalStatsForm
          players={players}
          initialStats={existingStats}
          initialUserId={selectedUserId}
        />
      )}
    </div>
  )
}
