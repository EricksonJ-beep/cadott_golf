export type BadgeGroup =
  | 'scoring_18'
  | 'scoring_9'
  | 'pars'
  | 'birdies'
  | 'participation'
  | 'streaks'
  | 'feats'
  | 'greens_fairways'
  | 'putting_milestones'

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
  { id: 'two_birdies',   name: '2 Birdies',  emoji: '🕊️', description: 'Make 2 birdies in a single round',   group: 'birdies' },
  { id: 'three_birdies', name: '3 Birdies',  emoji: '🦜', description: 'Make 3 birdies in a single round',   group: 'birdies' },

  // Participation
  { id: 'rounds_5',  name: '5 Rounds Logged',   emoji: '🗓️', description: 'Log 5 rounds',  group: 'participation' },
  { id: 'rounds_10', name: '10 Rounds Logged',  emoji: '📘', description: 'Log 10 rounds', group: 'participation' },
  { id: 'rounds_20', name: '20 Rounds Logged',  emoji: '📗', description: 'Log 20 rounds', group: 'participation' },
  { id: 'rounds_30', name: '30 Rounds Logged',  emoji: '📕', description: 'Log 30 rounds', group: 'participation' },

  // Streaks
  { id: 'birdie_streak_2', name: 'Birdie Streak x2', emoji: '🔥', description: 'Record a birdie in 2 straight rounds', group: 'streaks' },
  { id: 'birdie_streak_3', name: 'Birdie Streak x3', emoji: '🚀', description: 'Record a birdie in 3 straight rounds', group: 'streaks' },
  { id: 'par_streak_3',    name: 'Par Streak x3',    emoji: '⚡', description: 'Make at least one par in 3 straight rounds', group: 'streaks' },
  { id: 'par_streak_5',    name: 'Par Streak x5',    emoji: '🌟', description: 'Make at least one par in 5 straight rounds', group: 'streaks' },

  // Single feats
  { id: 'eagle',            name: 'Eagle',        emoji: '🦅', description: 'Make an eagle (or better)',              group: 'feats' },
  { id: 'no_three_putts',   name: 'No 3-Putts',   emoji: '🎯', description: 'Complete a round with no 3-putts',       group: 'feats' },
  { id: 'no_double_bogeys', name: 'No Doubles',   emoji: '🛡️', description: 'Complete a round with no doubles+',      group: 'feats' },
  { id: 'no_triples',       name: 'No Triples',   emoji: '💎', description: 'Complete a round with no triple bogeys+', group: 'feats' },

  // Greens & Fairways
  { id: 'gir_1',    name: '1 Green in Reg',  emoji: '⛳', description: 'Hit at least 1 green in regulation in a round',  group: 'greens_fairways' },
  { id: 'gir_3',    name: '3 Greens in Reg', emoji: '🎯', description: 'Hit at least 3 greens in regulation in a round', group: 'greens_fairways' },
  { id: 'gir_5',    name: '5 Greens in Reg', emoji: '🌟', description: 'Hit at least 5 greens in regulation in a round', group: 'greens_fairways' },
  { id: 'fir_30',   name: '30% Fairways',    emoji: '🌿', description: 'Hit 30%+ of fairways in a round',                group: 'greens_fairways' },
  { id: 'fir_50',   name: '50% Fairways',    emoji: '🟩', description: 'Hit 50%+ of fairways in a round',                group: 'greens_fairways' },
  { id: 'fir_70',   name: '70% Fairways',    emoji: '🏹', description: 'Hit 70%+ of fairways in a round',                group: 'greens_fairways' },

  // Putting milestones
  { id: 'putts_36_18', name: '≤36 Putts (18)', emoji: '🎱', description: 'Average 2 putts per hole over 18 holes',                   group: 'putting_milestones' },
  { id: 'putts_32_18', name: '≤32 Putts (18)', emoji: '✨', description: 'Finish an 18-hole round with 32 or fewer total putts',      group: 'putting_milestones' },
  { id: 'putts_28_18', name: '≤28 Putts (18)', emoji: '💫', description: 'Finish an 18-hole round with 28 or fewer total putts',      group: 'putting_milestones' },
  { id: 'putts_18_9',  name: '≤18 Putts (9)',  emoji: '🎱', description: 'Average 2 putts per hole over 9 holes',                    group: 'putting_milestones' },
  { id: 'putts_15_9',  name: '≤15 Putts (9)',  emoji: '✨', description: 'Finish a 9-hole round with 15 or fewer total putts',        group: 'putting_milestones' },
]

export type RoundForBadges = {
  date: string // ISO date
  holesPlayed: number
  totalScore: number | null
  holes: { par: number; score: number; putts: number; gir: boolean; fairwayHit: boolean | null }[]
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
    const triples = r.holes.filter((h) => h.score - h.par >= 3).length
    const maxPutts = r.holes.reduce((m, h) => Math.max(m, h.putts), 0)
    const totalPutts = r.holes.reduce((s, h) => s + h.putts, 0)
    const girCount = r.holes.filter((h) => h.gir).length
    const firHoles = r.holes.filter((h) => h.par >= 4 && h.fairwayHit !== null)
    const firHit = firHoles.filter((h) => h.fairwayHit === true).length
    const firPct = firHoles.length > 0 ? firHit / firHoles.length : null

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
    if (triples === 0) award('no_triples', r.date)

    // Greens & Fairways
    if (girCount >= 1) award('gir_1', r.date)
    if (girCount >= 3) award('gir_3', r.date)
    if (girCount >= 5) award('gir_5', r.date)
    if (firPct !== null && firPct >= 0.30) award('fir_30', r.date)
    if (firPct !== null && firPct >= 0.50) award('fir_50', r.date)
    if (firPct !== null && firPct >= 0.70) award('fir_70', r.date)

    // Putting milestones
    if (r.holesPlayed === 18) {
      if (totalPutts <= 36) award('putts_36_18', r.date)
      if (totalPutts <= 32) award('putts_32_18', r.date)
      if (totalPutts <= 28) award('putts_28_18', r.date)
    }
    if (r.holesPlayed === 9) {
      if (totalPutts <= 18) award('putts_18_9', r.date)
      if (totalPutts <= 15) award('putts_15_9', r.date)
    }
  }

  // Participation milestones
  if (sorted.length >= 5) award('rounds_5', sorted[4].date)
  if (sorted.length >= 10) award('rounds_10', sorted[9].date)
  if (sorted.length >= 20) award('rounds_20', sorted[19].date)
  if (sorted.length >= 30) award('rounds_30', sorted[29].date)

  // Streak milestones by round sequence
  let birdieRun = 0
  let parRun = 0
  for (const r of sorted) {
    const birdies = r.holes.filter((h) => h.score - h.par === -1).length
    const pars = r.holes.filter((h) => h.score === h.par).length

    birdieRun = birdies >= 1 ? birdieRun + 1 : 0
    parRun = pars >= 1 ? parRun + 1 : 0

    if (birdieRun >= 2) award('birdie_streak_2', r.date)
    if (birdieRun >= 3) award('birdie_streak_3', r.date)
    if (parRun >= 3) award('par_streak_3', r.date)
    if (parRun >= 5) award('par_streak_5', r.date)
  }

  return earned
}
