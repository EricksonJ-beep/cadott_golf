import { getMyClubs, initializePlayerClubs } from '@/app/actions/clubs'
import { getProfile } from '@/app/actions/profile'
import ClubDistancesClient from './ClubDistancesClient'
import ProfileCard from './ProfileCard'

export default async function MyInfoTab({ userId }: { userId: number }) {
  await initializePlayerClubs(userId)
  const [clubs, profile] = await Promise.all([getMyClubs(), getProfile()])

  return (
    <div className="space-y-6">
      <ProfileCard profile={profile} />
      <ClubDistancesClient clubs={clubs} />
    </div>
  )
}
