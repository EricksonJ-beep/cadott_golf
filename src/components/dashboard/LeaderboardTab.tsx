import Link from 'next/link'
import { getSeasonBoard, getAllTimeBoard } from '@/app/actions/birdie-board'
import BoardCard from '@/components/birdie-board/BoardCard'

type Props = {
  userId: number
  view?: string
}

export default async function LeaderboardTab({ userId, view }: Props) {
  const isAllTime = view === 'alltime'

  const { board, seasonName } = isAllTime
    ? { ...(await getAllTimeBoard()), seasonName: null }
    : await getSeasonBoard()

  const heading = isAllTime ? 'All-Time Leaderboard' : `${seasonName ?? 'Season'} Leaderboard`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{heading}</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/dashboard?tab=leaderboard"
          className={`text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${
            !isAllTime
              ? 'bg-black text-[#FFD700]'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          Season
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

      <BoardCard
        title="Most Eagles"
        icon="🦅"
        rows={board.eagles}
        unit="eagles"
        currentUserId={userId}
        emptyText="No eagles yet. Be the first to make one."
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
        title="Most Pars"
        icon="🎯"
        rows={board.pars}
        unit="pars"
        currentUserId={userId}
        emptyText="No pars logged yet."
      />
    </div>
  )
}
