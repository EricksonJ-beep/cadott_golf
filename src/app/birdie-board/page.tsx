import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSeasonBoard, getAllTimeBoard } from '@/app/actions/birdie-board'
import BoardCard from '@/components/birdie-board/BoardCard'

type Props = {
  searchParams: Promise<{ view?: string }>
}

export default async function BirdieBoardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { view } = await searchParams
  const isAllTime = view === 'alltime'

  const userId = Number(session.user.id)

  const { board, seasonName } = isAllTime
    ? { ...(await getAllTimeBoard()), seasonName: null }
    : await getSeasonBoard()

  const heading = isAllTime ? 'All-Time Leaderboard' : `${seasonName ?? 'Season'} Leaderboard`

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=leaderboard" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium">Leaderboard</span>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{heading}</h1>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/birdie-board"
            className={`text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${
              !isAllTime
                ? 'bg-black text-[#FFD700]'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Season
          </Link>
          <Link
            href="/birdie-board?view=alltime"
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
    </div>
  )
}
