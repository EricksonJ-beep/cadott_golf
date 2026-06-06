'use server'

import { db } from '@/db'
import { rounds, roundHoles, users, seasons } from '@/db/schema'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'

type SeasonRecord = {
  userId: number
  name: string
  seasonId: number
  seasonName: string
  value: number
}

type CareerRecord = {
  userId: number
  name: string
  value: number
}

type RecordsSnapshot = {
  mostBirdiesSeason: SeasonRecord[]
  mostParsSeason: SeasonRecord[]
  mostEaglesSeason: SeasonRecord[]
  mostBirdiesCareer: CareerRecord[]
  mostParsCareer: CareerRecord[]
  mostEaglesCareer: CareerRecord[]
  lowestRoundSeason: SeasonRecord[]
  lowestRoundCareer: CareerRecord[]
}

export async function getSeasonRecords(seasonId: number): Promise<RecordsSnapshot> {
  // Most birdies in season
  const mostBirdiesSeason = await db
    .select({
      userId: users.id,
      name: users.name,
      seasonId: seasons.id,
      seasonName: seasons.name,
      value: sql<number>`count(case when ${roundHoles.score} - ${roundHoles.par} = -1 then 1 end)::int`.as('count'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(roundHoles.roundId, rounds.id))
    .innerJoin(users, eq(rounds.userId, users.id))
    .innerJoin(seasons, eq(rounds.seasonId, seasons.id))
    .where(and(eq(rounds.seasonId, seasonId), isNull(rounds.seasonId) ? undefined : eq(rounds.seasonId, seasonId)))
    .groupBy(users.id, users.name, seasons.id, seasons.name)
    .orderBy(desc(sql`count(case when ${roundHoles.score} - ${roundHoles.par} = -1 then 1 end)`))
    .limit(5)

  // Most pars in season
  const mostParsSeason = await db
    .select({
      userId: users.id,
      name: users.name,
      seasonId: seasons.id,
      seasonName: seasons.name,
      value: sql<number>`count(case when ${roundHoles.score} = ${roundHoles.par} then 1 end)::int`.as('count'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(roundHoles.roundId, rounds.id))
    .innerJoin(users, eq(rounds.userId, users.id))
    .innerJoin(seasons, eq(rounds.seasonId, seasons.id))
    .where(eq(rounds.seasonId, seasonId))
    .groupBy(users.id, users.name, seasons.id, seasons.name)
    .orderBy(desc(sql`count(case when ${roundHoles.score} = ${roundHoles.par} then 1 end)`))
    .limit(5)

  // Most eagles in season
  const mostEaglesSeason = await db
    .select({
      userId: users.id,
      name: users.name,
      seasonId: seasons.id,
      seasonName: seasons.name,
      value: sql<number>`count(case when ${roundHoles.score} - ${roundHoles.par} <= -2 then 1 end)::int`.as('count'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(roundHoles.roundId, rounds.id))
    .innerJoin(users, eq(rounds.userId, users.id))
    .innerJoin(seasons, eq(rounds.seasonId, seasons.id))
    .where(eq(rounds.seasonId, seasonId))
    .groupBy(users.id, users.name, seasons.id, seasons.name)
    .orderBy(desc(sql`count(case when ${roundHoles.score} - ${roundHoles.par} <= -2 then 1 end)`))
    .limit(5)

  // Lowest round in season
  const lowestRoundSeason = await db
    .select({
      userId: users.id,
      name: users.name,
      seasonId: seasons.id,
      seasonName: seasons.name,
      value: sql<number>`min(${rounds.totalScore})::int`.as('lowest'),
    })
    .from(rounds)
    .innerJoin(users, eq(rounds.userId, users.id))
    .innerJoin(seasons, eq(rounds.seasonId, seasons.id))
    .where(eq(rounds.seasonId, seasonId))
    .groupBy(users.id, users.name, seasons.id, seasons.name)
    .orderBy(sql`min(${rounds.totalScore})`)
    .limit(5)

  // Career records
  const mostBirdiesCareer = await db
    .select({
      userId: users.id,
      name: users.name,
      value: sql<number>`count(case when ${roundHoles.score} - ${roundHoles.par} = -1 then 1 end)::int`.as('count'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(roundHoles.roundId, rounds.id))
    .innerJoin(users, eq(rounds.userId, users.id))
    .groupBy(users.id, users.name)
    .orderBy(desc(sql`count(case when ${roundHoles.score} - ${roundHoles.par} = -1 then 1 end)`))
    .limit(5)

  const mostParsCareer = await db
    .select({
      userId: users.id,
      name: users.name,
      value: sql<number>`count(case when ${roundHoles.score} = ${roundHoles.par} then 1 end)::int`.as('count'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(roundHoles.roundId, rounds.id))
    .innerJoin(users, eq(rounds.userId, users.id))
    .groupBy(users.id, users.name)
    .orderBy(desc(sql`count(case when ${roundHoles.score} = ${roundHoles.par} then 1 end)`))
    .limit(5)

  const mostEaglesCareer = await db
    .select({
      userId: users.id,
      name: users.name,
      value: sql<number>`count(case when ${roundHoles.score} - ${roundHoles.par} <= -2 then 1 end)::int`.as('count'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(roundHoles.roundId, rounds.id))
    .innerJoin(users, eq(rounds.userId, users.id))
    .groupBy(users.id, users.name)
    .orderBy(desc(sql`count(case when ${roundHoles.score} - ${roundHoles.par} <= -2 then 1 end)`))
    .limit(5)

  const lowestRoundCareer = await db
    .select({
      userId: users.id,
      name: users.name,
      value: sql<number>`min(${rounds.totalScore})::int`.as('lowest'),
    })
    .from(rounds)
    .innerJoin(users, eq(rounds.userId, users.id))
    .groupBy(users.id, users.name)
    .orderBy(sql`min(${rounds.totalScore})`)
    .limit(5)

  return {
    mostBirdiesSeason: mostBirdiesSeason as SeasonRecord[],
    mostParsSeason: mostParsSeason as SeasonRecord[],
    mostEaglesSeason: mostEaglesSeason as SeasonRecord[],
    mostBirdiesCareer: mostBirdiesCareer as CareerRecord[],
    mostParsCareer: mostParsCareer as CareerRecord[],
    mostEaglesCareer: mostEaglesCareer as CareerRecord[],
    lowestRoundSeason: lowestRoundSeason as SeasonRecord[],
    lowestRoundCareer: lowestRoundCareer as CareerRecord[],
  }
}
