import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AppHeader() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center justify-between px-4 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
          <Image
            src="/logo/hornet.png"
            alt="Cadott Hornets"
            width={32}
            height={32}
            className="w-7 h-7 object-contain"
            priority
          />
        </div>
        <span className="font-bold text-base tracking-tight">Cadott Golf</span>
      </Link>
      <div className="flex items-center gap-3">
        {session?.user?.role === 'coach' && (
          <Link href="/admin" className="text-xs text-zinc-400 hover:text-white px-2">
            Admin
          </Link>
        )}
        <span className="text-sm text-zinc-400 hidden sm:block">
          {session?.user?.name}
        </span>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 px-2 text-xs"
          >
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  )
}
