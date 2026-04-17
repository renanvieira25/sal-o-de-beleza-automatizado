'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const specialties = ['Cabeleireira', 'Manicure e Pedicure', 'Designer de Sobrancelhas', 'Maquiadora', 'Esteticista', 'Depiladora', 'Outra']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', specialty: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
          specialty: form.specialty,
          role: 'autonoma',
        },
      },
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'Este e-mail já está cadastrado.' : error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
          <h1 className="font-playfair text-2xl font-semibold text-[#1a1a1a] mb-1">Crie sua conta</h1>
          <p className="text-sm text-[#7a6b6b] mb-6">Cadastro gratuito · Sem taxa de adesão</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Nome completo</label>
              <Input placeholder="Maria da Silva" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">E-mail</label>
              <Input type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Telefone</label>
              <Input placeholder="(85) 99999-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Especialidade</label>
              <select
                className="w-full rounded-xl border border-[#ede4e4] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/30 focus:border-[#e91e8c] transition-all"
                value={form.specialty}
                onChange={e => set('specialty', e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Senha</label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Confirmar senha</label>
              <Input type="password" placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta gratuita'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7a6b6b] mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-[#e91e8c] font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
