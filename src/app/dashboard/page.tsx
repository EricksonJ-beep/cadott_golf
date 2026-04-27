import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MyInfoTab from '@/components/dashboard/MyInfoTab'
import PracticeTab from '@/components/dashboard/PracticeTab'
import ChallengesTab from '@/components/dashboard/ChallengesTab'
import StatsTab from '@/components/dashboard/StatsTab'
import RoundsTab from '@/components/dashboard/RoundsTab'

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { tab } = await searchParams
  const activeTab = tab ?? 'info'
  const userId = Number(session.user.id)

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto w-full">
      {activeTab === 'info'        && <MyInfoTab userId={userId} />}
      {activeTab === 'practice'   && <PracticeTab />}
      {activeTab === 'challenges' && <ChallengesTab userId={userId} />}
      {activeTab === 'stats'      && <StatsTab userId={userId} />}
      {activeTab === 'rounds'     && <RoundsTab userId={userId} />}
    </div>
  )
}
