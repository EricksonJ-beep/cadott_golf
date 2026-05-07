import Link from 'next/link'
import { Playfair_Display, Libre_Baskerville } from 'next/font/google'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { COURSE_SCORECARDS, type CourseScorecard } from '@/lib/course-scorecards'
import {
  getCoachGuide,
  getMyNotesForCourse,
  type CoachGuide,
  type PlayerNote,
} from '@/app/actions/course-guide'
import AddNoteForm from '@/components/courses/AddNoteForm'
import PlayerNoteItem from '@/components/courses/PlayerNoteItem'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-display',
})
const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
})

type Props = { params: Promise<{ courseId: string }> }

const FIELDS: { key: keyof CoachGuide; label: string }[] = [
  { key: 'teeShotNotes', label: 'Tee Shot' },
  { key: 'approachNotes', label: 'Approach' },
  { key: 'aroundGreenNotes', label: 'Around the Green' },
  { key: 'missAvoidNotes', label: 'Avoid / Miss' },
  { key: 'generalStrategy', label: 'General Strategy' },
]

function sum(arr: number[] | null | undefined, from = 0, to?: number) {
  if (!arr) return null
  const slice = to != null ? arr.slice(from, to) : arr.slice(from)
  return slice.reduce((s, n) => s + n, 0)
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

  const totalPar = sum(course.parByHole)
  const totalYards = sum(course.yardageByTee?.white)
  const frontPar = sum(course.parByHole, 0, 9)
  const backPar = sum(course.parByHole, 9, 18)
  const frontYds = sum(course.yardageByTee?.white, 0, 9)
  const backYds = sum(course.yardageByTee?.white, 9, 18)

  const isEighteen = course.holes === 18

  return (
    <div className={`${playfair.variable} ${baskerville.variable} min-h-screen bg-white pb-10`}>
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=courses" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium truncate">{course.name}</span>
      </header>

      {/* Hero */}
      <section className="bg-black text-white border-b-4 border-[#FFD700] px-5 py-10 text-center">
        <p
          className="text-[10px] tracking-[0.22em] uppercase text-[#FFD700] mb-3 italic"
          style={{ fontFamily: 'var(--font-body), serif' }}
        >
          Course Strategy
        </p>
        <h1
          className="font-black text-3xl sm:text-4xl leading-[1.05] mb-1"
          style={{ fontFamily: 'var(--font-display), serif' }}
        >
          {course.name}
        </h1>
        <p
          className="text-sm italic text-zinc-300 mb-7"
          style={{ fontFamily: 'var(--font-body), serif' }}
        >
          {course.city}
        </p>

        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          <Stat label="Par" value={totalPar != null ? String(totalPar) : '—'} />
          <Stat
            label="Yardage"
            value={totalYards != null ? totalYards.toLocaleString() : '—'}
            suffix={totalYards != null ? 'White' : undefined}
          />
          <Stat label="Holes" value={String(course.holes)} />
        </div>
      </section>

      <main
        className="max-w-2xl mx-auto"
        style={{ fontFamily: 'var(--font-body), Georgia, serif' }}
      >
        {course.generalTips && (
          <section className="px-5 py-6">
            <div className="border-l-4 border-[#FFD700] pl-4 italic text-sm leading-relaxed">
              {course.generalTips}
            </div>
          </section>
        )}

        <NineSection
          label="Front Nine"
          subtotal="Out"
          subtotalLabel="Front Nine Total"
          sub={frontPar != null && frontYds != null ? `Par ${frontPar} · ${frontYds.toLocaleString()} yards` : null}
          holes={Array.from({ length: 9 }, (_, i) => i + 1)}
          course={course}
          guideByHole={guideByHole}
          notesByHole={notesByHole}
          courseId={courseId}
          par={frontPar}
          yards={frontYds}
        />

        {isEighteen && (
          <NineSection
            label="Back Nine"
            subtotal="In"
            subtotalLabel="Back Nine Total"
            sub={backPar != null && backYds != null ? `Par ${backPar} · ${backYds.toLocaleString()} yards` : null}
            holes={Array.from({ length: 9 }, (_, i) => i + 10)}
            course={course}
            guideByHole={guideByHole}
            notesByHole={notesByHole}
            courseId={courseId}
            par={backPar}
            yards={backYds}
          />
        )}

        {totalPar != null && totalYards != null && (
          <div className="bg-black text-white border-t-4 border-[#FFD700] px-5 py-7 text-center mt-8">
            <p className="font-black text-2xl" style={{ fontFamily: 'var(--font-display), serif' }}>
              {totalPar}
              <span className="text-[#FFD700] mx-3 opacity-60">·</span>
              {totalYards.toLocaleString()}
            </p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-400 mt-2 italic">
              Par &nbsp;·&nbsp; Total Yardage
            </p>
          </div>
        )}

        <footer className="text-center px-5 py-9 text-zinc-500 text-sm">
          <div className="w-12 h-px bg-[#FFD700] mx-auto mb-3" />
          <p className="font-bold text-base text-black" style={{ fontFamily: 'var(--font-display), serif' }}>
            {course.name}
          </p>
          <p className="italic">{course.city}</p>
          <div className="w-12 h-px bg-[#FFD700] mx-auto mt-3" />
        </footer>
      </main>
    </div>
  )
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="border border-[#FFD700]/40 bg-white/5 rounded-sm px-3 py-3">
      <p className="text-[10px] tracking-[0.22em] uppercase text-[#FFD700] mb-1">{label}</p>
      <p className="font-bold text-xl leading-tight" style={{ fontFamily: 'var(--font-display), serif' }}>
        {value}
        {suffix && <span className="block text-[10px] font-normal text-zinc-300 mt-0.5">{suffix}</span>}
      </p>
    </div>
  )
}

function NineSection({
  label,
  subtotal,
  subtotalLabel,
  sub,
  holes,
  course,
  guideByHole,
  notesByHole,
  courseId,
  par,
  yards,
}: {
  label: string
  subtotal: string
  subtotalLabel: string
  sub: string | null
  holes: number[]
  course: CourseScorecard
  guideByHole: Map<number, CoachGuide>
  notesByHole: Map<number, PlayerNote[]>
  courseId: string
  par: number | null
  yards: number | null
}) {
  return (
    <section className="px-5 pt-6">
      <header className="text-center mb-3">
        <h2 className="font-bold text-2xl text-black" style={{ fontFamily: 'var(--font-display), serif' }}>
          {label}
        </h2>
        {sub && <p className="italic text-sm text-zinc-500 mt-1">{sub}</p>}
      </header>
      <p className="text-center text-[11px] italic text-zinc-500 mb-2">
        — Tap any hole to expand strategy &amp; tips —
      </p>
      <div className="border-t border-zinc-200">
        {holes.map((n) => (
          <HoleRow
            key={n}
            n={n}
            par={course.parByHole?.[n - 1] ?? null}
            hcp={course.hcpByHole?.[n - 1] ?? null}
            yards={course.yardageByTee?.white?.[n - 1] ?? null}
            guide={guideByHole.get(n)}
            notes={notesByHole.get(n) ?? []}
            courseId={courseId}
          />
        ))}
      </div>

      <div className="bg-black text-white grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4 mt-px">
        <p className="font-bold text-base" style={{ fontFamily: 'var(--font-display), serif' }}>
          {subtotal}
          <span className="block text-[10px] italic font-normal text-[#FFD700]/80 mt-0.5">
            {subtotalLabel}
          </span>
        </p>
        <p className="font-bold text-base text-center" style={{ fontFamily: 'var(--font-display), serif' }}>
          {par ?? '—'}
          <span className="block text-[9px] uppercase tracking-[0.18em] text-[#FFD700]/80 mt-0.5">
            Par
          </span>
        </p>
        <p className="font-bold text-base text-right" style={{ fontFamily: 'var(--font-display), serif' }}>
          {yards != null ? yards.toLocaleString() : '—'}
          <span className="block text-[9px] uppercase tracking-[0.18em] text-[#FFD700]/80 mt-0.5">
            Yards
          </span>
        </p>
      </div>
    </section>
  )
}

function HoleRow({
  n,
  par,
  hcp,
  yards,
  guide,
  notes,
  courseId,
}: {
  n: number
  par: number | null
  hcp: number | null
  yards: number | null
  guide?: CoachGuide
  notes: PlayerNote[]
  courseId: string
}) {
  return (
    <details className="border-b border-zinc-200 group">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="grid grid-cols-[44px_1fr_auto_auto_18px] sm:grid-cols-[52px_1fr_56px_56px_72px_18px] items-center gap-x-3 py-3 hover:bg-zinc-50 transition-colors">
          <span
            className="font-black text-2xl sm:text-3xl text-center leading-none"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {n}
          </span>
          <span className="min-w-0">
            <span
              className="font-bold text-base block leading-tight truncate"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              Hole {n}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {par != null ? `Par ${par}` : ''}
              {hcp != null ? ` · Hdcp ${hcp}` : ''}
            </span>
          </span>
          <span
            className="hidden sm:block text-center font-bold text-base"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {par ?? '—'}
            <span className="block text-[9px] uppercase tracking-[0.18em] text-zinc-400 mt-0.5 font-normal">
              Par
            </span>
          </span>
          <span
            className="hidden sm:block text-center font-bold text-base"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {hcp ?? '—'}
            <span className="block text-[9px] uppercase tracking-[0.18em] text-zinc-400 mt-0.5 font-normal">
              Hdcp
            </span>
          </span>
          <span
            className="text-right font-bold text-base"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {yards != null ? yards : '—'}
            <span className="block text-[9px] uppercase tracking-[0.18em] text-zinc-400 mt-0.5 font-normal">
              Yards
            </span>
          </span>
          <span className="text-[#FFD700] text-lg leading-none transition-transform group-open:rotate-90">
            ›
          </span>
        </div>
      </summary>

      <div className="bg-zinc-50 -mt-px border-t-2 border-[#FFD700] px-4 sm:px-5 py-4">
        <CoachGuideBlock guide={guide} />
        <div className="border-t border-zinc-200 mt-4 pt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            My notes ({notes.length})
          </p>
          {notes.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No notes yet.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <PlayerNoteItem
                  key={note.id}
                  id={note.id}
                  noteText={note.noteText}
                  noteDate={note.noteDate}
                  updatedAt={note.updatedAt}
                  canEdit
                />
              ))}
            </div>
          )}
          <AddNoteForm courseId={courseId} holeNumber={n} />
        </div>
      </div>
    </details>
  )
}

function CoachGuideBlock({ guide }: { guide?: CoachGuide }) {
  if (!guide) {
    return <p className="text-xs italic text-zinc-500">No coach guide for this hole yet.</p>
  }
  const filled = FIELDS.filter((f) => {
    const v = guide[f.key]
    return typeof v === 'string' && v.trim().length > 0
  })
  if (filled.length === 0) {
    return <p className="text-xs italic text-zinc-500">No coach guide for this hole yet.</p>
  }
  return (
    <div className="space-y-3 border-l-[3px] border-[#FFD700] bg-white px-4 py-3 rounded-sm shadow-sm">
      {filled.map((f) => (
        <div key={f.key}>
          <p
            className="font-bold text-[11px] uppercase tracking-[0.06em] text-black mb-0.5"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {f.label}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
            {guide[f.key] as string}
          </p>
        </div>
      ))}
    </div>
  )
}
