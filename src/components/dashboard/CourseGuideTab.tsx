import Link from 'next/link'
import { COURSE_SCORECARDS } from '@/lib/course-scorecards'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CourseGuideTab() {
  const courses = [...COURSE_SCORECARDS].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Course Strategy</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Coach strategy + your own notes for each hole. Pick a course to view.
        </p>
      </div>
      <div className="space-y-3">
        {courses.map((c) => (
          <Link key={c.id} href={`/courses/${c.id}`}>
            <Card className="active:bg-zinc-50 transition-colors cursor-pointer hover:border-[#FFD700]">
              <CardContent className="py-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.city}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {c.holes} holes
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
