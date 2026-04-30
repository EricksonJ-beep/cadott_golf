export type BadgeGroup = 'scoring_18' | 'scoring_9' | 'pars' | 'birdies' | 'feats'

export type BadgeDef = {
  id: string
  name: string
  emoji: string
  description: string
  group: BadgeGroup
}

export const BADGE_DEFS: BadgeDef[] = [
  // 18-hole scoring
  { id: 'break_100_18', name: 'Break 100', emoji: '💯', description: 'Shoot under 100 for 18 holes', group: 'scoring_18' },
  { id: 'break_90_18',  name: 'Break 90',  emoji: '9️⃣', description: 'Shoot under 90 for 18 holes',  group: 'scoring_18' },
  { id: 'break_80_18',  name: 'Break 80',  emoji: '8️⃣', description: 'Shoot under 80 for 18 holes',  group: 'scoring_18' },
  { id: 'break_75_18',  name: 'Break 75',  emoji: '🔥', description: 'Shoot under 75 for 18 holes',  group: 'scoring_18' },
  { id: 'even_par_18',  name: 'Even Par 18', emoji: '👑', description: 'Shoot even par or better for 18 holes', group: 'scoring_18' },

  // 9-hole scoring
  { id: 'break_50_9', name: 'Break 50', emoji: '5️⃣', description: 'Shoot under 50 for 9 holes', group: 'scoring_9' },
  { id: 'break_40_9', name: 'Break 40', emoji: '4️⃣', description: 'Shoot under 40 for 9 holes', group: 'scoring_9' },
  { id: 'even_par_9', name: 'Even Par 9', emoji: '⭐', description: 'Shoot even par or better for 9 holes', group: 'scoring_9' },

  // Pars in a round
  { id: 'two_pars',   name: '2 Pars',   emoji: '🟢', description: 'Make 2 pars in a single round', group: 'pars' },
  { id: 'three_pars', name: '3 Pars',   emoji: '🟢', description: 'Make 3 pars in a single round', group: 'pars' },
  { id: 'four_pars',  name: '4 Pars',   emoji: '🟢', description: 'Make 4 pars in a single round', group: 'pars' },
  { id: 'five_pars',  name: '5 Pars',   emoji: '🟢', description: 'Make 5 pars in a single round', group: 'pars' },

  // Birdies in a round
  { id: 'one_birdie',    name: 'Birdie',     emoji: '🐦', description: 'Make a birdie in a round',           group: 'birdies' },
  { id: 'two_birdies',   name: '2 Birdies',  emoji: '🐦', description: 'Make 2 birdies in a single round',   group: 'birdies' },
  { id: 'three_birdies', name: '3 Birdies',  emoji: '🐦', description: 'Make 3 birdies in a single round',   group: 'birdies' },

  // Single feats
  { id: 'eagle',           name: 'Eagle',           emoji: '🦅', description: 'Make an eagle (or better)',        group: 'feats' },
  { id: 'no_three_putts',  name: 'No 3-Putts',      emoji: '🎯', description: 'Complete a round with no 3-putts', group: 'feats' },
  { id: 'no_double_bogeys', name: 'No Doubles',     emoji: '🛡️', description: 'Complete a round with no doubles+', group: 'feats' },
]

export type RoundForBadges = {
  date: string // ISO date
  holesPlayed: number
  totalScore: number | null
  holes: { par: number; score: number; putts: number }[]
}

export type EarnedMap = Record<string, string | null> // badgeId -> earnedAt ISO date

export function computeEarnedBadges(rounds: RoundForBadges[]): EarnedMap {
  const earned: EarnedMap = {}
  for (const def of BADGE_DEFS) earned[def.id] = null

  const sorted = [...rounds].sort((a, b) => a.date.localeCompare(b.date))

  function award(id: string, date: string) {
    if (earned[id] === null) earned[id] = date
  }

  for (const r of sorted) {
    if (r.holes.length === 0) continue

    const sumPar = r.holes.reduce((s, h) => s + h.par, 0)
    const total = r.totalScore ?? r.holes.reduce((s, h) => s + h.score, 0)
    const pars = r.holes.filter((h) => h.score === h.par).length
    const birdies = r.holes.filter((h) => h.score - h.par === -1).length
    const eagles = r.holes.filter((h) => h.score - h.par <= -2).length
    const doubles = r.holes.filter((h) => h.score - h.par >= 2).length
    const maxPutts = r.holes.reduce((m, h) => Math.max(m, h.putts), 0)

    // Scoring 18
    if (r.holesPlayed === 18) {
      if (total < 100) award('break_100_18', r.date)
      if (total < 90)  award('break_90_18',  r.date)
      if (total < 80)  award('break_80_18',  r.date)
      if (total < 75)  award('break_75_18',  r.date)
      if (total <= sumPar) award('even_par_18', r.date)
    }

    // Scoring 9
    if (r.holesPlayed === 9) {
      if (total < 50) award('break_50_9', r.date)
      if (total < 40) award('break_40_9', r.date)
      if (total <= sumPar) award('even_par_9', r.date)
    }

    // Pars
    if (pars >= 2) award('two_pars',   r.date)
    if (pars >= 3) award('three_pars', r.date)
    if (pars >= 4) award('four_pars',  r.date)
    if (pars >= 5) award('five_pars',  r.date)

    // Birdies
    if (birdies >= 1) award('one_birdie',    r.date)
    if (birdies >= 2) award('two_birdies',   r.date)
    if (birdies >= 3) award('three_birdies', r.date)

    // Feats
    if (eagles >= 1) award('eagle', r.date)
    if (maxPutts < 3) award('no_three_putts', r.date)
    if (doubles === 0) award('no_double_bogeys', r.date)
  }

  return earned
}
