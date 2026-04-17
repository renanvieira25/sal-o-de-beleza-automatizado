'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/login` })
    setSent(true)
    setLoading(false)
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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#fce4f3] flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-6 h-6 text-[#e91e8c]" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-[#1a1a1a] mb-2">E-mail enviado!</h2>
              <p className="text-sm text-[#7a6b6b] mb-6">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <Link href="/auth/login"><Button className="w-full">Voltar ao login</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="font-playfair text-2xl font-semibold text-[#1a1a1a] mb-1">Redefinir senha</h1>
              <p className="text-sm text-[#7a6b6b] mb-6">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">E-mail</label>
                  <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#7a6b6b] mt-6">
          <Link href="/auth/login" className="text-[#e91e8c] font-medium hover:underline">← Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
