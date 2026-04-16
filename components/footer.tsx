import Link from 'next/link'
import { Scissors, Instagram, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-[#e91e8c] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </span>
            <span className="font-playfair text-xl font-semibold">Espaço Ela</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Plataforma de locação de cadeiras para profissionais autônomas de beleza em Fortaleza-CE.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-[#e91e8c] mb-4">Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/#como-funciona" className="hover:text-white transition-colors">Como funciona</Link></li>
            <li><Link href="/#precos" className="hover:text-white transition-colors">Preços</Link></li>
            <li><Link href="/#espaco" className="hover:text-white transition-colors">O Espaço</Link></li>
            <li><Link href="/auth/register" className="hover:text-white transition-colors">Cadastre-se</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-[#e91e8c] mb-4">Contato</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /> Fortaleza, CE</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" /> (85) 99999-0000</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" /> contato@espacoela.com.br</li>
            <li className="flex items-center gap-2"><Instagram className="w-4 h-4 flex-shrink-0" /> @espacoela.for</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Espaço Ela. Todos os direitos reservados.
      </div>
    </footer>
  )
}
