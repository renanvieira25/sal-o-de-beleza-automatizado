'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const dashboardHref = profile?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#ede4e4]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-[#e91e8c] flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </span>
          <span className="font-playfair text-xl font-semibold text-[#1a1a1a] group-hover:text-[#e91e8c] transition-colors">
            Espaço Ela
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#5a3a4a]">
          <Link href="/#como-funciona" className="hover:text-[#e91e8c] transition-colors">Como funciona</Link>
          <Link href="/#precos" className="hover:text-[#e91e8c] transition-colors">Preços</Link>
          <Link href="/#espaco" className="hover:text-[#e91e8c] transition-colors">O Espaço</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm">Painel</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <>
              <Link href="/auth/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link href="/auth/register"><Button size="sm">Cadastrar</Button></Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-[#5a3a4a]" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#ede4e4] px-4 py-4 space-y-3">
          <Link href="/#como-funciona" className="block text-sm text-[#5a3a4a] hover:text-[#e91e8c]" onClick={() => setOpen(false)}>Como funciona</Link>
          <Link href="/#precos" className="block text-sm text-[#5a3a4a] hover:text-[#e91e8c]" onClick={() => setOpen(false)}>Preços</Link>
          <Link href="/#espaco" className="block text-sm text-[#5a3a4a] hover:text-[#e91e8c]" onClick={() => setOpen(false)}>O Espaço</Link>
          <div className="flex gap-2 pt-2">
            {profile ? (
              <>
                <Link href={dashboardHref} className="flex-1"><Button className="w-full" size="sm">Painel</Button></Link>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>Sair</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Entrar</Button></Link>
                <Link href="/auth/register" className="flex-1"><Button className="w-full" size="sm">Cadastrar</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
