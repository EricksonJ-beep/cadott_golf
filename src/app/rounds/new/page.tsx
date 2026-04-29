import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RoundForm from '@/components/rounds/RoundForm'

export default async function NewRoundPage() {
  const session = await auth()
  if (!session?.user) redirect('/')

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=rounds" className="text-[#FFD700] text-sm font-medium">
          ← Cancel
        </Link>
        <span className="text-sm font-medium">New Round</span>
      </header>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <RoundForm />
      </div>
    </div>
  )
}
