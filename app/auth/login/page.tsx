'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', (await supabase.auth.getUser()).data.user!.id).single()
    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fdf8f8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-9 h-9 rounded-full bg-[#e91e8c] flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </span>
          <span className="font-playfair text-2xl font-semibold text-[#1a1a1a]">Espaço Ela</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#ede4e4] shadow-sm p-8">
          <h1 className="font-playfair text-2xl font-semibold text-[#1a1a1a] mb-1">Bem-vinda de volta!</h1>
          <p className="text-sm text-[#7a6b6b] mb-6">Entre com sua conta para gerenciar suas reservas.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">E-mail</label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Senha</label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6b6b] hover:text-[#e91e8c]" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-[#e91e8c] hover:underline">Esqueceu a senha?</Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7a6b6b] mt-6">
          Ainda não tem conta?{' '}
          <Link href="/auth/register" className="text-[#e91e8c] font-medium hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}
