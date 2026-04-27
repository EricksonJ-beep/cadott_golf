export default function ChallengesTab({ userId }: { userId: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-5xl">🎯</span>
      <h2 className="text-xl font-bold">Challenges</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Range and course challenges are coming in Phase 2. Check back soon.
      </p>
    </div>
  )
}
