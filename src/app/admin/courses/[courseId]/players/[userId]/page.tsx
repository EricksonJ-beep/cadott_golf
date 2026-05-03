import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { COURSE_SCORECARDS } from '@/lib/course-scorecards'
import {
  getCoachGuide,
  getPlayerNotesForCourse,
  type CoachGuide,
  type PlayerNote,
} from '@/app/actions/course-guide'
import PlayerNoteItem from '@/components/courses/PlayerNoteItem'
import CoachAddPlayerNoteForm from '@/components/admin/CoachAddPlayerNoteForm'

type Props = { params: Promise<{ courseId: string; userId: string }> }

const FIELDS: { key: keyof CoachGuide; label: string }[] = [
  { key: 'teeShotNotes', label: 'Tee shot' },
  { key: 'approachNotes', label: 'Approach' },
  { key: 'aroundGreenNotes', label: 'Around the green' },
  { key: 'missAvoidNotes', label: 'Avoid / miss' },
  { key: 'generalStrategy', label: 'General strategy' },
]

export default async function AdminPlayerCourseNotesPage({ params }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')

  const { courseId, userId: userIdRaw } = await params
  const userId = Number(userIdRaw)

  const course = COURSE_SCORECARDS.find((c) => c.id === courseId)
  if (!course) notFound()

  const [player] = await db
    .select({ id: users.id, name: users.name, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!player) notFound()

  const [coachGuide, notes] = await Promise.all([
    getCoachGuide(courseId),
    getPlayerNotesForCourse(userId, courseId),
  ])

  const guideByHole = new Map<number, CoachGuide>()
  for (const g of coachGuide) guideByHole.set(g.holeNumber, g)

  const notesByHole = new Map<number, PlayerNote[]>()
  for (const n of notes) {
    const arr = notesByHole.get(n.holeNumber) ?? []
    arr.push(n)
    notesByHole.set(n.holeNumber, arr)
  }

  const holeNumbers = Array.from({ length: course.holes }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      <Link href={`/admin/courses/${courseId}`} className="text-sm text-zinc-500">
        ← {course.name}
      </Link>

      <div>
        <h1 className="text-xl font-bold">{player.name}&rsquo;s notes</h1>
        <p className="text-xs text-muted-foreground">
          @{player.username} · {course.name}
        </p>
      </div>

      <p className="text-xs text-muted-foreground rounded-lg bg-zinc-50 p-3">
        You can add, edit, or delete this player&rsquo;s personal hole notes. They will see your
        edits the next time they open the course.
      </p>

      <div className="space-y-3">
        {holeNumbers.map((n) => {
          const par = course.parByHole?.[n - 1] ?? null
          const yardage = course.yardageByTee?.white?.[n - 1] ?? null
          const guide = guideByHole.get(n)
          const playerNotes = notesByHole.get(n) ?? []

          const filledGuide = guide
            ? FIELDS.filter((f) => {
                const v = guide[f.key]
                return typeof v === 'string' && v.trim().length > 0
              })
            : []

          return (
            <div key={n} className="rounded-xl ring-1 ring-foreground/10 bg-card p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold">Hole {n}</span>
                {par != null && <span className="text-xs text-muted-foreground">Par {par}</span>}
                {yardage != null && (
                  <span className="text-xs text-muted-foreground">· {yardage}y</span>
                )}
              </div>

              {filledGuide.length > 0 && (
                <details className="rounded-lg bg-zinc-50 p-2">
                  <summary className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                    Coach guide ({filledGuide.length})
                  </summary>
                  <div className="space-y-1.5 pt-2">
                    {filledGuide.map((f) => (
                      <div key={f.key as string}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {f.label}
                        </p>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {guide?.[f.key] as string}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Player notes ({playerNotes.length})
                </p>
                {playerNotes.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No notes for this hole.</p>
                ) : (
                  <div className="space-y-2">
                    {playerNotes.map((note) => (
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
                <CoachAddPlayerNoteForm
                  userId={userId}
                  courseId={courseId}
                  holeNumber={n}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
