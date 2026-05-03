import Link from 'next/link'
import { notFound } from 'next/navigation'
import { COURSE_SCORECARDS } from '@/lib/course-scorecards'
import { getCoachGuide, getRosterForCoach, type CoachGuide } from '@/app/actions/course-guide'
import CoachGuideHoleForm from '@/components/admin/CoachGuideHoleForm'

type Props = { params: Promise<{ courseId: string }> }

export default async function AdminCourseGuidePage({ params }: Props) {
  const { courseId } = await params
  const course = COURSE_SCORECARDS.find((c) => c.id === courseId)
  if (!course) notFound()

  const [guides, roster] = await Promise.all([
    getCoachGuide(courseId),
    getRosterForCoach(),
  ])

  const guideByHole = new Map<number, CoachGuide>()
  for (const g of guides) guideByHole.set(g.holeNumber, g)

  const players = roster.filter((u) => u.role === 'player')
  const holeNumbers = Array.from({ length: course.holes }, (_, i) => i + 1)

  return (
    <div className="space-y-5">
      <Link href="/admin/courses" className="text-sm text-zinc-500">
        ← All courses
      </Link>

      <div>
        <h1 className="text-xl font-bold">{course.name}</h1>
        <p className="text-xs text-muted-foreground">
          {course.city} · {course.holes} holes
        </p>
      </div>

      <section className="rounded-xl bg-zinc-50 p-3 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Edit a player&rsquo;s notes
        </h2>
        {players.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active players.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <Link
                key={p.id}
                href={`/admin/courses/${courseId}/players/${p.id}`}
                className="text-xs rounded-md border border-zinc-300 bg-white px-2.5 py-1 hover:border-[#FFD700]"
              >
                {p.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-3">
        {holeNumbers.map((n) => (
          <CoachGuideHoleForm
            key={n}
            courseId={courseId}
            holeNumber={n}
            par={course.parByHole?.[n - 1] ?? null}
            yardage={course.yardageByTee?.white?.[n - 1] ?? null}
            guide={guideByHole.get(n)}
          />
        ))}
      </div>
    </div>
  )
}
