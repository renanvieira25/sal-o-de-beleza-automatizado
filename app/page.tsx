import Link from 'next/link'
import { Scissors, Calendar, Star, CheckCircle2, Clock, Building2, Wifi, Zap, Wind, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  { icon: <Scissors className="w-6 h-6" />, title: 'Cadastre-se', desc: 'Crie sua conta gratuita em menos de 2 minutos.' },
  { icon: <Calendar className="w-6 h-6" />, title: 'Escolha seu horário', desc: 'Veja a disponibilidade em tempo real e reserve o espaço ideal.' },
  { icon: <Star className="w-6 h-6" />, title: 'Atenda suas clientes', desc: 'Chegue, trabalhe e encante. Nós cuidamos do resto.' },
]

const pricingPlans = [
  { type: 'Por hora', price: 'R$ 25', period: '/hora', desc: 'Ideal para atendimentos rápidos ou experimentar o espaço.', highlight: false },
  { type: 'Diária', price: 'R$ 120', period: '/dia', desc: 'Para quem precisa de um dia completo de atendimentos.', highlight: true },
  { type: 'Semanal', price: 'R$ 350', period: '/semana', desc: 'A escolha mais popular entre as profissionais fixas.', highlight: false },
  { type: 'Mensal', price: 'R$ 900', period: '/mês', desc: 'Máxima economia para quem trabalha todos os dias.', highlight: false },
]

const testimonials = [
  { name: 'Ana Beatriz Silva', role: 'Cabeleireira', text: 'Desde que comecei a usar o Espaço Ela, minhas clientes adoraram o ambiente. Super recomendo!' },
  { name: 'Bia Fontenele', role: 'Manicure e Pedicure', text: 'Flexibilidade total. Alugou quando precisei, sem contratos longos. Perfeito para quem é autônoma.' },
  { name: 'Carol Menezes', role: 'Designer de Sobrancelhas', text: 'O espaço é lindo, bem equipado e o sistema de reservas é muito fácil de usar.' },
]

const amenities = [
  { icon: <Zap className="w-5 h-5" />, label: 'Tomadas 110V e 220V' },
  { icon: <Wifi className="w-5 h-5" />, label: 'Wi-Fi de alta velocidade' },
  { icon: <Wind className="w-5 h-5" />, label: 'Ar-condicionado' },
  { icon: <Building2 className="w-5 h-5" />, label: 'Lavatório privativo' },
  { icon: <Star className="w-5 h-5" />, label: 'Espelhos iluminados' },
  { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Ambiente higienizado' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#fdf8f8] via-[#fce4f3]/40 to-[#fdf8f8] py-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#e91e8c]/5 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#fce4f3] text-[#e91e8c] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Scissors className="w-3.5 h-3.5" />
            Fortaleza-CE — 3 cadeiras disponíveis
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight mb-6">
            Seu espaço no salão,<br />
            <span className="text-[#e91e8c]">no seu horário.</span>
          </h1>
          <p className="text-lg text-[#7a6b6b] mb-10 max-w-xl mx-auto leading-relaxed">
            Alugue uma cadeira profissional por hora, dia ou mês. Sem vínculo, sem burocracia. Foque no que você faz de melhor — atender suas clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Alugue seu espaço agora <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/#como-funciona">
              <Button size="lg" variant="outline">Como funciona</Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#7a6b6b]">✨ Cadastro gratuito · Sem taxa de adesão</p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-semibold text-[#1a1a1a] mb-3">Como funciona</h2>
            <p className="text-[#7a6b6b]">Em 3 passos simples você já pode trabalhar no espaço.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-[#fce4f3] text-[#e91e8c] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#e91e8c] group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-[#e91e8c] uppercase tracking-widest mb-1">Passo {i + 1}</div>
                <h3 className="font-playfair text-xl font-semibold text-[#1a1a1a] mb-2">{step.title}</h3>
                <p className="text-sm text-[#7a6b6b] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="py-20 px-4 bg-[#fdf8f8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-semibold text-[#1a1a1a] mb-3">Preços transparentes</h2>
            <p className="text-[#7a6b6b]">Escolha o plano que se encaixa na sua rotina.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pricingPlans.map((plan) => (
              <Card key={plan.type} className={plan.highlight ? 'border-[#e91e8c] ring-2 ring-[#e91e8c]/20 relative' : ''}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e91e8c] text-white text-xs px-3 py-0.5 rounded-full font-medium">
                    Mais popular
                  </div>
                )}
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#7a6b6b] mb-3">{plan.type}</p>
                  <div className="flex items-end justify-center gap-1 mb-1">
                    <span className="font-playfair text-4xl font-bold text-[#1a1a1a]">{plan.price}</span>
                    <span className="text-sm text-[#7a6b6b] mb-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-[#7a6b6b] mt-3 leading-relaxed">{plan.desc}</p>
                  <Link href="/auth/register" className="block mt-5">
                    <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'} size="sm">
                      Reservar agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* O ESPAÇO */}
      <section id="espaco" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-semibold text-[#1a1a1a] mb-3">O Espaço</h2>
            <p className="text-[#7a6b6b]">Um ambiente pensado para você trabalhar com conforto e profissionalismo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl overflow-hidden bg-[#fce4f3] aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <Scissors className="w-16 h-16 text-[#e91e8c] mx-auto mb-4 opacity-40" />
                <p className="text-[#e91e8c]/60 text-sm">Foto do espaço em breve</p>
              </div>
            </div>
            <div>
              <h3 className="font-playfair text-2xl font-semibold text-[#1a1a1a] mb-2">3 cadeiras profissionais</h3>
              <p className="text-[#7a6b6b] mb-6 leading-relaxed">
                Cada estação foi projetada para dar tudo que você precisa. O espaço fica localizado em Fortaleza-CE, com fácil acesso e estacionamento próximo.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {amenities.map((a) => (
                  <li key={a.label} className="flex items-center gap-2 text-sm text-[#5a3a4a]">
                    <span className="text-[#e91e8c]">{a.icon}</span>
                    {a.label}
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-sm text-[#7a6b6b] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#e91e8c]" />
                Horário: Segunda a Sábado, 08h às 20h
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-4 bg-[#fdf8f8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-semibold text-[#1a1a1a] mb-3">O que dizem nossas profissionais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#e91e8c] text-[#e91e8c]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#5a3a4a] italic leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-sm text-[#1a1a1a]">{t.name}</p>
                    <p className="text-xs text-[#7a6b6b]">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-[#e91e8c]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-bold text-white mb-4">Pronta para começar?</h2>
          <p className="text-white/80 mb-8">Cadastre-se hoje e faça sua primeira reserva em minutos.</p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-[#e91e8c] hover:bg-[#fce4f3] focus:ring-white/40">
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
