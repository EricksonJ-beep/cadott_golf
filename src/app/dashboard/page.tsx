import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MyInfoTab from '@/components/dashboard/MyInfoTab'
import PracticeTab from '@/components/dashboard/PracticeTab'
import ChallengesTab from '@/components/dashboard/ChallengesTab'
import LeaderboardTab from '@/components/dashboard/LeaderboardTab'
import StatsTab from '@/components/dashboard/StatsTab'
import RoundsTab from '@/components/dashboard/RoundsTab'
import CourseGuideTab from '@/components/dashboard/CourseGuideTab'
import RulesTab from '@/components/dashboard/RulesTab'
import HomeTab from '@/components/dashboard/HomeTab'

type Props = {
  searchParams: Promise<{ tab?: string; view?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { tab, view } = await searchParams
  const userId = Number(session.user.id)

  if (!tab) return <HomeTab />

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto w-full">
      {tab === 'info'        && <MyInfoTab userId={userId} />}
      {tab === 'practice'    && <PracticeTab />}
      {tab === 'challenges'  && <ChallengesTab userId={userId} />}
      {tab === 'leaderboard' && <LeaderboardTab userId={userId} view={view} />}
      {tab === 'stats'       && <StatsTab userId={userId} />}
      {tab === 'rounds'      && <RoundsTab />}
      {tab === 'courses'     && <CourseGuideTab />}
      {tab === 'rules'       && <RulesTab />}
    </div>
  )
}
