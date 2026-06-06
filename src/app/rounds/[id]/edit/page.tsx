import { getRound } from '@/app/actions/rounds'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RoundForm from '@/components/rounds/RoundForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditRoundPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { id } = await params
  const round = await getRound(Number(id))
  if (!round) notFound()

  // Only the owner or a coach can edit
  if (round.userId !== Number(session.user.id) && session.user.role !== 'coach') redirect('/dashboard')

  const initialData = {
    roundId: round.id,
    courseName: round.courseName,
    date: round.date,
    holesPlayed: round.holesPlayed as 9 | 18,
    holes: round.holes.map((h) => ({
      holeNumber: h.holeNumber,
      par: h.par,
      score: h.score,
      fairwayHit: h.fairwayHit ?? null,
      gir: h.gir,
      putts: h.putts,
    })),
    weatherNotes: round.weatherNotes ?? null,
    freeTextNotes: round.freeTextNotes ?? null,
    hasDetailedScores: round.hasDetailedScores,
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href={`/rounds/${round.id}`} className="text-[#FFD700] text-sm font-medium">
          ← Cancel
        </Link>
        <span className="text-sm font-medium truncate">Edit Round · {round.courseName}</span>
      </header>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <RoundForm initialData={initialData} />
      </div>
    </div>
  )
}
