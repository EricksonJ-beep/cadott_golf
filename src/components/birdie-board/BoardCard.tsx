import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Row = { userId: number; name: string; count: number }

type Props = {
  title: string
  icon: string
  rows: Row[]
  unit: string
  currentUserId: number
  emptyText: string
}

export default function BoardCard({ title, icon, rows, unit, currentUserId, emptyText }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <span>{icon}</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{emptyText}</p>
        ) : (
          <ol className="space-y-1.5">
            {rows.map((row, i) => {
              const isMe = row.userId === currentUserId
              return (
                <li
                  key={row.userId}
                  className={`flex items-center justify-between text-sm py-1.5 px-2 rounded ${
                    isMe ? 'bg-[#FFD700]/15 font-semibold' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                        i === 0
                          ? 'bg-[#FFD700] text-black'
                          : i === 1
                          ? 'bg-zinc-300 text-black'
                          : i === 2
                          ? 'bg-orange-300 text-black'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span>
                      {row.name}
                      {isMe && <span className="ml-1 text-xs">(you)</span>}
                    </span>
                  </span>
                  <span className="tabular-nums text-sm">
                    {row.count} {unit}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
