'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const links = [
  { href: '/', label: 'Sentiment' },
  { href: '/journal', label: 'Journal' },
  { href: '/news', label: 'News' },
]

export default function NavBar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="glass border-b border-white/5 px-6 py-0 flex items-center gap-6 shrink-0">
      <Link href="/" className="flex items-center gap-2 py-3.5 shrink-0">
        <h1 className="text-lg font-bold text-[#f1f5f9] tracking-tight">
          <span className="text-[#14f5c7]">Raw</span>FX
        </h1>
      </Link>
      <div className="flex items-center gap-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              pathname === link.href
                ? 'text-[#14f5c7] border-[#14f5c7]'
                : 'text-[#475569] border-transparent hover:text-[#94a3b8]'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {session?.user ? (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-7 h-7 rounded-full ring-1 ring-white/10"
              />
            )}
            <button
              onClick={() => signOut()}
              className="text-xs text-[#475569] hover:text-[#f43f5e] transition-colors font-medium cursor-pointer"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-wider text-[#14f5c7] hover:text-white transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
