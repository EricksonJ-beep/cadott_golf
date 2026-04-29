import { getAllChallenges } from '@/app/actions/challenges'
import CreateChallengeForm from '@/components/admin/CreateChallengeForm'
import ChallengeList from '@/components/admin/ChallengeList'

export default async function AdminChallengesPage() {
  const challenges = await getAllChallenges()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Challenges</h1>
      </div>
      <CreateChallengeForm />
      <ChallengeList challenges={challenges} />
    </div>
  )
}
