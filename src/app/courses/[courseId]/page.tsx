import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { COURSE_SCORECARDS } from '@/lib/course-scorecards'
import {
  getCoachGuide,
  getMyNotesForCourse,
  type CoachGuide,
  type PlayerNote,
} from '@/app/actions/course-guide'
import AddNoteForm from '@/components/courses/AddNoteForm'
import PlayerNoteItem from '@/components/courses/PlayerNoteItem'

type Props = { params: Promise<{ courseId: string }> }

const FIELDS: { key: keyof CoachGuide; label: string }[] = [
  { key: 'teeShotNotes', label: 'Tee shot' },
  { key: 'approachNotes', label: 'Approach' },
  { key: 'aroundGreenNotes', label: 'Around the green' },
  { key: 'missAvoidNotes', label: 'Avoid / miss' },
  { key: 'generalStrategy', label: 'General strategy' },
]

function CoachGuideBlock({ guide }: { guide?: CoachGuide }) {
  if (!guide) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No coach guide for this hole yet.
      </p>
    )
  }
  const filled = FIELDS.filter((f) => {
    const v = guide[f.key]
    return typeof v === 'string' && v.trim().length > 0
  })
  if (filled.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No coach guide for this hole yet.
      </p>
    )
  }
  return (
    <div className="space-y-2">
      {filled.map((f) => (
        <div key={f.key}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {f.label}
          </p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {guide[f.key] as string}
          </p>
        </div>
      ))}
    </div>
  )
}

export default async function CourseGuidePage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { courseId } = await params
  const course = COURSE_SCORECARDS.find((c) => c.id === courseId)
  if (!course) notFound()

  const [coachGuide, myNotes] = await Promise.all([
    getCoachGuide(courseId),
    getMyNotesForCourse(courseId),
  ])

  const guideByHole = new Map<number, CoachGuide>()
  for (const g of coachGuide) guideByHole.set(g.holeNumber, g)

  const notesByHole = new Map<number, PlayerNote[]>()
  for (const n of myNotes) {
    const arr = notesByHole.get(n.holeNumber) ?? []
    arr.push(n)
    notesByHole.set(n.holeNumber, arr)
  }

  const holeNumbers = Array.from({ length: course.holes }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=courses" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium truncate">{course.name}</span>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold">{course.name}</h1>
          <p className="text-sm text-muted-foreground">
            {course.city} · {course.holes} holes
          </p>
        </div>

        {course.generalTips && (
          <Card className="border-[#FFD700]/40 bg-[#FFD700]/5">
            <CardContent>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                General strategy
              </p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {course.generalTips}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {holeNumbers.map((n) => {
            const par = course.parByHole?.[n - 1] ?? null
            const yardage = course.yardageByTee?.white?.[n - 1] ?? null
            const guide = guideByHole.get(n)
            const notes = notesByHole.get(n) ?? []

            return (
              <Card key={n}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold tabular-nums">Hole {n}</span>
                      {par != null && (
                        <span className="text-xs text-muted-foreground">Par {par}</span>
                      )}
                      {yardage != null && (
                        <span className="text-xs text-muted-foreground">· {yardage}y</span>
                      )}
                    </div>
                    {guide && (
                      <Badge variant="secondary" className="text-[10px]">
                        Coach guide
                      </Badge>
                    )}
                  </div>

                  <CoachGuideBlock guide={guide} />

                  <div className="border-t pt-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      My notes ({notes.length})
                    </p>
                    {notes.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No notes yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {notes.map((note) => (
                          <PlayerNoteItem
                            key={note.id}
                            id={note.id}
                            noteText={note.noteText}
                            noteDate={note.noteDate}
                            updatedAt={note.updatedAt}
                            canEdit={true}
                          />
                        ))}
                      </div>
                    )}
                    <AddNoteForm courseId={courseId} holeNumber={n} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
