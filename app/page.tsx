'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [flatNo, setFlatNo] = useState('')
  const [password, setPassword] = useState('')
  const [showGuard, setShowGuard] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search).get('flat')
    if(p){ setFlatNo(p); setShowLogin(true) }
  },[])

  const handleLogin = async ()=>{
    if(!flatNo||!password) return alert('Flat + Password bharo')
    setLoading(true)
    const { data: ok } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).eq('password',password).eq('status','approved').maybeSingle()
    if(ok){ localStorage.setItem('resident', JSON.stringify(ok)); window.location.href='/resident'; return }
    const { data: anyData } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).maybeSingle()
    setLoading(false)
    if(!anyData) alert('❌ Registration nahi mila')
    else if(anyData.password!==password) alert('❌ Password galat')
    else if(anyData.status==='pending') alert(`⏳ Flat ${flatNo} approval pending hai`)
    else alert('Login fail')
  }

  const go = (path:string)=> window.location.href=path

  // Common Card Style - Image jaisa
  const cardBase = "bg-white rounded- border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.15)] px-4 py-3 min-w- cursor-pointer hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-200"

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* HEADER - DARK THEME + IMAGE STYLE CARDS */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-auto md:h- py-3 md:py-0 flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Logo Left */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8B6F1F] flex items-center justify-center font-serif font-black text-black text-lg">A</div>
              <div className="leading-tight">
                <div className="font-bold text- tracking-wide">Arihant Anchal</div>
                <div className="text- tracking-[0.2em] text-[#D4AF37]/70 uppercase">Society & Club House</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - IMAGE STYLE TABS - AUTO ADJUST */}
          <div className="flex flex-wrap items-center gap-2.5 justify-center md:justify-end w-full md:w-auto">

            {/* RESIDENT - Gold */}
            <div onClick={()=>setShowLogin(true)} className={cardBase}>
              <div className="text- tracking-[0.15em] text-black/40 font-bold">RESIDENT</div>
              <div className="text- font-black mt-1 text-black">Login</div>
              <div className="mt-2.5 h- w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-[#D4AF37]"></div>
              </div>
            </div>

            {/* GUARD */}
            <div className="relative">
              <div onClick={()=>setShowGuard(!showGuard)} className={cardBase}>
                <div className="text- tracking-[0.15em] text-black/40 font-bold">GUARD</div>
                <div className="text- font-black mt-1 text-black">Gate 1-5</div>
                <div className="mt-2.5 h- w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-black"></div>
                </div>
              </div>
              {showGuard && (
                <div className="absolute top- right-0 w- bg-white rounded- border shadow-2xl p-2 grid grid-cols-2 gap-2 z-[100]">
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>go(`/guard?gate=${n}`)} className="h-10 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black">Gate {n}</button>
                  ))}
                </div>
              )}
            </div>

            {/* ADMIN - Red */}
            <div onClick={()=>go('/admin')} className={cardBase}>
              <div className="text- tracking-[0.15em] text-black/40 font-bold">ADMIN</div>
              <div className="text- font-black mt-1 text-black">Login</div>
              <div className="mt-2.5 h- w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-[#FF3B30]"></div>
              </div>
            </div>

            {/* CLUB HOUSE - Green */}
            <div onClick={()=>go('/clubhouse')} className={cardBase}>
              <div className="text- tracking-[0.15em] text-black/40 font-bold">CLUB HOUSE</div>
              <div className="text- font-black mt-1 text-black">Login</div>
              <div className="mt-2.5 h- w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-emerald-500"></div>
              </div>
            </div>

            {/* MAINTENANCE - Blue */}
            <div onClick={()=>go('/maintenance')} className={cardBase}>
              <div className="text- tracking-[0.15em] text-black/40 font-bold">MAINTENANCE</div>
              <div className="text- font-black mt-1 text-black">Login</div>
              <div className="mt-2.5 h- w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-blue-500"></div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* HERO - BIG STYLISH */}
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
          <div className="mt-8 flex justify-center gap-2">
            <button onClick={()=>go('/register')} className="px-6 h-10 rounded-full bg-[#D4AF37] text-black text-xs font-bold">📝 New Registration</button>
          </div>
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
