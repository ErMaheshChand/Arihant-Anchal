'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [flatNo, setFlatNo] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showGuard, setShowGuard] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search).get('flat')
    if(p){ setFlatNo(p); setShowLoginModal(true) }
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

  const CardStyle = "bg-white rounded- border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 min-w- cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all"

  return (
    <div className="min-h-screen bg-[#F6F6F7] text-black relative overflow-hidden">
      {/* TOP NAVBAR - CLEAN LIGHT */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">A</div>
            <div className="font-bold text-">Arihant Anchal</div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text- font-medium text-black/60">
            <Link href="/" className="text-black font-bold">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/amenities">Amenities</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="w-6"></div>
        </div>
      </header>

      {/* RIGHT SIDE - IMAGE STYLE CARDS - PROFESSIONAL AUTO-ADJUST */}
      <div className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">

        {/* RESIDENT - Gold */}
        <div onClick={()=>setShowLoginModal(true)} className={CardStyle}>
          <div className="text- tracking-widest text-black/40 font-bold">RESIDENT</div>
          <div className="text- font-black mt-1">Login</div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#D4AF37]"></div>
          </div>
        </div>

        {/* GUARD LOGIN */}
        <div className={CardStyle} onClick={()=>setShowGuard(!showGuard)}>
          <div className="text- tracking-widest text-black/40 font-bold">GUARD LOGIN</div>
          <div className="text- font-black mt-1">Gate 1-5</div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-black"></div>
          </div>
        </div>

        {showGuard && (
          <div className="bg-white rounded- border shadow-xl p-2 grid grid-cols-2 gap-2 animate-in">
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>go(`/guard?gate=${n}`)} className="h-10 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-[#D4AF37] hover:text-black">Gate {n}</button>
            ))}
          </div>
        )}

        {/* ADMIN */}
        <div onClick={()=>go('/admin')} className={CardStyle}>
          <div className="text- tracking-widest text-black/40 font-bold">ADMIN</div>
          <div className="text- font-black mt-1">Login</div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#FF3B30]"></div>
          </div>
        </div>

        {/* CLUB HOUSE */}
        <div onClick={()=>go('/clubhouse')} className={CardStyle}>
          <div className="text- tracking-widest text-black/40 font-bold">CLUB HOUSE</div>
          <div className="text- font-black mt-1">Login</div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-emerald-500"></div>
          </div>
        </div>

        {/* MAINTENANCE */}
        <div onClick={()=>go('/maintenance')} className={CardStyle}>
          <div className="text- tracking-widest text-black/40 font-bold">MAINTENANCE</div>
          <div className="text- font-black mt-1">Login</div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-blue-500"></div>
          </div>
        </div>

        {/* REGISTRATION - Extra Gold */}
        <div onClick={()=>go('/register')} className={`${CardStyle} bg-[#0B1120] text-white border-white/10`}>
          <div className="text- tracking-widest text-[#D4AF37]/70 font-bold">NEW RESIDENT</div>
          <div className="text- font-black mt-1 text-white">Registration</div>
          <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#D4AF37]"></div>
          </div>
        </div>

      </div>

      {/* CENTER HERO - BIG STYLISH */}
      <section className="relative min-h- flex items-center justify-center text-center px-6 pr-">
        <div className="max-w-5xl">
          <h1 className="font-serif font-black tracking-tight leading-[0.85]">
            <span className="block font-sans font-light text-black/40 text- md:text- tracking-[0.4em] uppercase mb-6">Welcome to</span>
            <span className="block text-black text- md:text- lg:text-">Arihant Anchal</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#8B6F1F] via-[#D4AF37] to-[#8B6F1F] text- md:text- lg:text- mt-3 font-light italic">Society & Club House</span>
          </h1>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-black rounded- p-6 shadow-2xl border">
            <div className="flex justify-between items-center">
              <div className="font-black text-lg">🔐 Resident Login</div>
              <button onClick={()=>setShowLoginModal(false)} className="w-8 h-8 rounded-full bg-slate-100">✕</button>
            </div>
            <div className="mt-6 space-y-3">
              <input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="Flat No ex: B-302" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 font-bold text-sm"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 font-bold text-sm"/>
              <button onClick={handleLogin} disabled={loading} className="w-full h-12 rounded-full bg-black text-white font-bold text-sm">{loading?'Checking...':'Login → Resident'}</button>
              <div className="text-center text-xs text-slate-400">New ho? <Link href="/register" className="text-black font-bold underline">Registration karo</Link></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
