import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const CVGA_EVENTS = [
  {
    date: 'Friday, June 26th',
    location: 'Chippewa Falls',
    course: 'Lake Wissota Golf Course',
  },
  {
    date: 'Thursday, July 2nd',
    location: 'Colfax',
    course: 'Whitetail Golf Course',
  },
  {
    date: 'Tuesday, July 7th',
    location: 'Osseo',
    course: 'Osseo Golf Club',
  },
  {
    date: 'Thursday, July 9th',
    location: 'Bloomer',
    course: 'Bloomer Memorial Golf Course',
  },
  {
    date: 'Tuesday, July 21st',
    location: 'Eau Claire',
    course: 'Lake Hallie Golf Course',
  },
  {
    date: 'Thursday, July 23rd',
    location: 'Eau Claire',
    course: 'Hickory Hills Golf Course',
  },
  {
    date: 'Tuesday, July 28th',
    location: 'Eau Claire',
    course: 'Mill Run Golf Course',
  },
]

export default function CvgaScheduleWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">2026 CVGA Junior Tour</CardTitle>
          <span className="text-2xl">🏆</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Compete in regional tournaments</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {CVGA_EVENTS.map((event, idx) => (
            <div key={idx} className="text-sm p-2 rounded-md border border-gray-100 hover:bg-blue-50 transition-colors">
              <div className="font-semibold text-gray-900">{event.date}</div>
              <div className="text-xs text-gray-600 mt-1">{event.location}</div>
              <div className="text-xs text-gray-500">{event.course}</div>
            </div>
          ))}
        </div>
        <Link
          href="https://www.cvga.com/juniors.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
        >
          View on CVGA.com →
        </Link>
      </CardContent>
    </Card>
  )
}
