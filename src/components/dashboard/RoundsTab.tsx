export default function RoundsTab({ userId }: { userId: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-5xl">⛳</span>
      <h2 className="text-xl font-bold">Rounds</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Round logging and history are coming in Phase 3.
      </p>
    </div>
  )
}
