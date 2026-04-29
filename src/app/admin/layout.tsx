import Image from 'next/image'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/hornet.png"
            alt="Cadott Hornets"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-base">Cadott Golf</span>
          <span className="text-zinc-500 text-sm hidden sm:block">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-white px-2">
            My Dashboard
          </Link>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 px-2 text-xs">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <nav className="bg-zinc-50 border-b px-4 flex gap-1 overflow-x-auto">
        {[
          { href: '/admin', label: 'Overview' },
          { href: '/admin/roster', label: 'Roster' },
          { href: '/admin/practice-plans', label: 'Practice Plans' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-3 text-sm font-medium text-zinc-600 hover:text-black whitespace-nowrap"
          >
            {label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-4 py-5 max-w-3xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
