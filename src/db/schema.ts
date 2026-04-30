import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  serial,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const roleEnum = pgEnum('role', ['coach', 'player'])
export const swingTypeEnum = pgEnum('swing_type', ['full', 'three_quarter', 'half', 'quarter'])
export const clubTypeEnum = pgEnum('club_type', ['driver', 'wood', 'hybrid', 'iron', 'wedge', 'putter'])
export const challengeTypeEnum = pgEnum('challenge_type', ['range', 'course'])
export const challengeCategoryEnum = pgEnum('challenge_category', [
  'putting', 'chipping', 'bunker', 'driving', 'approach', 'wedges', 'course_stats',
])
export const scoringTypeEnum = pgEnum('scoring_type', ['score_out_of', 'makes_in_a_row', 'pass_fail', 'count'])

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('player'),
  name: text('name').notNull(),
  grade: integer('grade'),
  yearJoined: integer('year_joined'),
  photoUrl: text('photo_url'),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  passwordResetAt: timestamp('password_reset_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Seasons ───────────────────────────────────────────────────────────────────
export const seasons = pgTable('seasons', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').notNull().default(false),
})

// ── Roster entries ────────────────────────────────────────────────────────────
export const rosterEntries = pgTable('roster_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  seasonId: integer('season_id').notNull().references(() => seasons.id),
  jerseyNumber: integer('jersey_number'),
})

// ── Default clubs (system reference) ─────────────────────────────────────────
export const clubsDefault = pgTable('clubs_default', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: clubTypeEnum('type').notNull(),
  defaultOrder: integer('default_order').notNull(),
})

// ── Player clubs ──────────────────────────────────────────────────────────────
export const playerClubs = pgTable('player_clubs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  clubId: integer('club_id').references(() => clubsDefault.id),
  customName: text('custom_name'),
  isHidden: boolean('is_hidden').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
})

// ── Club distances ────────────────────────────────────────────────────────────
export const clubDistances = pgTable('club_distances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  playerClubId: integer('player_club_id').notNull().references(() => playerClubs.id),
  swingType: swingTypeEnum('swing_type').notNull().default('full'),
  carryYards: integer('carry_yards'),
  totalYards: integer('total_yards'),
  typicalMiss: text('typical_miss'),
  isGoTo: boolean('is_go_to').notNull().default(false),
  isAvoid: boolean('is_avoid').notNull().default(false),
  dateLogged: date('date_logged').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Practice plans ────────────────────────────────────────────────────────────
export const practicePlans = pgTable('practice_plans', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  theme: text('theme'),
  focusArea: text('focus_area'),
  totalDurationMinutes: integer('total_duration_minutes').notNull(),
  equipmentList: text('equipment_list'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
})

// ── Practice plan blocks ──────────────────────────────────────────────────────
export const practicePlanBlocks = pgTable('practice_plan_blocks', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => practicePlans.id, { onDelete: 'cascade' }),
  startMinute: integer('start_minute').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  blockName: text('block_name').notNull(),
  drillDescription: text('drill_description'),
  orderIndex: integer('order_index').notNull().default(0),
})

// ── Challenges ────────────────────────────────────────────────────────────────
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: challengeTypeEnum('type').notNull(),
  category: challengeCategoryEnum('category').notNull(),
  scoringType: scoringTypeEnum('scoring_type').notNull().default('score_out_of'),
  unit: text('unit'),
  description: text('description'),
  maxScore: integer('max_score'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: integer('created_by').references(() => users.id),
})

// ── Challenge results ─────────────────────────────────────────────────────────
export const challengeResults = pgTable('challenge_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  challengeId: integer('challenge_id').notNull().references(() => challenges.id),
  score: integer('score').notNull(),
  scoreDetails: jsonb('score_details'),
  dateLogged: date('date_logged').notNull().defaultNow(),
  seasonId: integer('season_id').references(() => seasons.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Rounds ────────────────────────────────────────────────────────────────────
export const rounds = pgTable('rounds', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: date('date').notNull(),
  courseName: text('course_name').notNull(),
  holesPlayed: integer('holes_played').notNull().default(18),
  totalScore: integer('total_score'),
  weatherNotes: text('weather_notes'),
  freeTextNotes: text('free_text_notes'),
  seasonId: integer('season_id').references(() => seasons.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Round holes ───────────────────────────────────────────────────────────────
export const roundHoles = pgTable('round_holes', {
  id: serial('id').primaryKey(),
  roundId: integer('round_id').notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  holeNumber: integer('hole_number').notNull(),
  par: integer('par').notNull(),
  score: integer('score').notNull(),
  fairwayHit: boolean('fairway_hit'),
  gir: boolean('gir').notNull().default(false),
  putts: integer('putts').notNull().default(0),
})

// ── Stats chart preferences ───────────────────────────────────────────────────
export const statsChartPreferences = pgTable('stats_chart_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  chartType: text('chart_type').notNull(),
  isVisible: boolean('is_visible').notNull().default(true),
  orderIndex: integer('order_index').notNull().default(0),
})

// ── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  rosterEntries: many(rosterEntries),
  playerClubs: many(playerClubs),
  clubDistances: many(clubDistances),
  challengeResults: many(challengeResults),
  rounds: many(rounds),
}))

export const seasonsRelations = relations(seasons, ({ many }) => ({
  rosterEntries: many(rosterEntries),
  challengeResults: many(challengeResults),
  rounds: many(rounds),
}))

export const practicePlansRelations = relations(practicePlans, ({ many }) => ({
  blocks: many(practicePlanBlocks),
}))

export const practicePlanBlocksRelations = relations(practicePlanBlocks, ({ one }) => ({
  plan: one(practicePlans, { fields: [practicePlanBlocks.planId], references: [practicePlans.id] }),
}))

export const playerClubsRelations = relations(playerClubs, ({ one, many }) => ({
  user: one(users, { fields: [playerClubs.userId], references: [users.id] }),
  defaultClub: one(clubsDefault, { fields: [playerClubs.clubId], references: [clubsDefault.id] }),
  distances: many(clubDistances),
}))

export const roundsRelations = relations(rounds, ({ one, many }) => ({
  user: one(users, { fields: [rounds.userId], references: [users.id] }),
  season: one(seasons, { fields: [rounds.seasonId], references: [seasons.id] }),
  holes: many(roundHoles),
}))

export const clubDistancesRelations = relations(clubDistances, ({ one }) => ({
  user: one(users, { fields: [clubDistances.userId], references: [users.id] }),
  playerClub: one(playerClubs, { fields: [clubDistances.playerClubId], references: [playerClubs.id] }),
}))

export const challengeResultsRelations = relations(challengeResults, ({ one }) => ({
  user: one(users, { fields: [challengeResults.userId], references: [users.id] }),
  challenge: one(challenges, { fields: [challengeResults.challengeId], references: [challenges.id] }),
  season: one(seasons, { fields: [challengeResults.seasonId], references: [seasons.id] }),
}))

export const challengesRelations = relations(challenges, ({ many }) => ({
  results: many(challengeResults),
}))

export const roundHolesRelations = relations(roundHoles, ({ one }) => ({
  round: one(rounds, { fields: [roundHoles.roundId], references: [rounds.id] }),
}))

export const rosterEntriesRelations = relations(rosterEntries, ({ one }) => ({
  user: one(users, { fields: [rosterEntries.userId], references: [users.id] }),
  season: one(seasons, { fields: [rosterEntries.seasonId], references: [seasons.id] }),
}))
