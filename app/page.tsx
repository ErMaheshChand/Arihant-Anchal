'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [flatNo, setFlatNo] = useState('')
  const [password, setPassword] = useState('')
  const [showResidentMenu, setShowResidentMenu] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search).get('flat')
    if(p){ setFlatNo(p); setShowLogin(true) }
    const r=localStorage.getItem('resident')
    if(r){ try{ const d=JSON.parse(r); if(d.status==='approved') window.location.href='/resident' }catch{} }
  },[])

  const handleLogin = async ()=>{
    if(!flatNo||!password) return alert('Flat + Password bharo')
    setLoading(true)
    const { data: ok } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).eq('password',password).eq('status','approved').maybeSingle()
    if(ok){ localStorage.setItem('resident', JSON.stringify(ok)); window.location.href='/resident'; return }
    const { data: any } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).maybeSingle()
    setLoading(false)
    if(!any) alert('❌ Registration nahi mila')
    else if(any.password!==password) alert('❌ Password galat')
    else if(any.status==='pending') alert(`⏳ Flat ${flatNo} approval pending hai`)
    else alert('Login fail')
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* NAVBAR - THEME MATCH DARK + GOLD */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h- flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8B6F1F] flex items-center justify-center font-serif font-black text-black text-lg">A</div>
            <div className="leading-tight">
              <div className="font-bold text- tracking-wide">Arihant Anchal</div>
              <div className="text- tracking-[0.2em] text-[#D4AF37]/70 uppercase">Society & Club House</div>
            </div>
          </div>

          {/* Tabs - Theme Match */}
          <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur">
            <Link href="/" className="px-5 py-2 rounded-full bg-[#D4AF37] text-black text- font-bold">Home</Link>
            <Link href="/about" className="px-5 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10 transition">About</Link>
            <Link href="/amenities" className="px-5 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10 transition">Amenities</Link>
            <Link href="/gallery" className="px-5 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10 transition">Gallery</Link>
            <Link href="/contact" className="px-5 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10 transition">Contact</Link>

            {/* Resident Tab Gold */}
            <div className="relative ml-2">
              <button onClick={()=>setShowResidentMenu(!showResidentMenu)} className="px-5 py-2 rounded-full bg-white text-black text- font-bold flex items-center gap-1.5 hover:bg-[#D4AF37] transition">
                Resident <span className="text-">{showResidentMenu?'▲':'▼'}</span>
              </button>
              {showResidentMenu && (
                <div className="absolute top-12 right-0 w-60 bg-[#141E32] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden">
                  <button onClick={()=>{ setShowResidentMenu(false); window.location.href='/register' }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3 transition">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs">📝</div>
                    <div><div className="text-sm font-bold">Registration</div><div className="text- text-white/50">New Flat Register</div></div>
                  </button>
                  <button onClick={()=>{ setShowResidentMenu(false); setShowLogin(true) }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3 transition">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs">🔐</div>
                    <div><div className="text-sm font-bold">Login</div><div className="text- text-white/50">Flat + Password</div></div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Resident */}
          <button onClick={()=>setShowResidentMenu(!showResidentMenu)} className="lg:hidden px-4 h-9 rounded-full bg-[#D4AF37] text-black text-xs font-bold">Resident</button>
        </div>
      </header>

      {/* HERO - ONLY BIG STYLISH WELCOME */}
      <section className="relative min-h- flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#121E35] to-[#0B1120]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.18),_transparent_65%)]" />

        <div className="relative z-10 max-w-5xl">
          <h1 className="font-serif font-black tracking-tight leading-[0.85]">
            <span className="block font-sans font-light text-white/50 text- md:text- tracking-[0.4em] uppercase mb-6">Welcome to</span>
            <span className="block text-white text- md:text- lg:text-">Arihant Anchal</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text- md:text- lg:text- mt-3 font-light italic">Society & Club House</span>
          </h1>
          <div className="mt-10 w-24 h- bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-60"></div>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141E32] border border-white/10 text-white rounded- p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">🔐 Resident Login</div>
              <button onClick={()=>setShowLogin(false)} className="w-8 h-8 rounded-full bg-white/10">✕</button>
            </div>
            <div className="mt-6 space-y-3">
              <input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="Flat No ex: B-302" className="w-full h-12 rounded-2xl bg-white/10 border border-white/10 px-4 font-bold text-sm placeholder:text-white/40"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-2xl bg-white/10 border border-white/10 px-4 font-bold text-sm placeholder:text-white/40"/>
              <button onClick={handleLogin} disabled={loading} className="w-full h-12 rounded-full bg-[#D4AF37] text-black font-bold text-sm">{loading?'Checking...':'Login → Resident Page'}</button>
              <div className="text-center text-xs text-white/40">New ho? <Link href="/register" className="text-[#D4AF37] font-bold underline">Registration karo</Link></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
