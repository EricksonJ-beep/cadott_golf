type ChallengeScoringConfig = {
  name: string
  category: string
  scoringType: 'score_out_of' | 'makes_in_a_row' | 'pass_fail' | 'count'
  unit?: string | null
}

const LOWER_BETTER_HINTS =
  /(low|lowest|fewest|least|fewer|under|shortest|fastest|time|second|minute|putt|stroke|shot|miss|penalt|bogey|double)/i

export function isHigherScoreBetter(challenge: ChallengeScoringConfig): boolean {
  if (challenge.scoringType === 'makes_in_a_row') return true
  if (challenge.scoringType === 'pass_fail') return true
  if (challenge.scoringType === 'score_out_of') return true

  const text = `${challenge.name} ${challenge.unit ?? ''}`
  if (LOWER_BETTER_HINTS.test(text)) return false

  // Course stat challenges are often score/time based where lower is better.
  if (challenge.category === 'course_stats') return false

  return true
}

export function pickBestScore(
  scores: number[],
  higherIsBetter: boolean,
): number | null {
  if (scores.length === 0) return null
  return higherIsBetter ? Math.max(...scores) : Math.min(...scores)
}
