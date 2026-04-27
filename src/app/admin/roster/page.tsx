import { getRoster } from '@/app/actions/admin'
import CreatePlayerForm from '@/components/admin/CreatePlayerForm'
import RosterTable from '@/components/admin/RosterTable'

export default async function RosterPage() {
  const roster = await getRoster()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Roster</h1>
      </div>
      <CreatePlayerForm />
      <RosterTable roster={roster} />
    </div>
  )
}
