'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [flatNo, setFlatNo] = useState('')
  const [password, setPassword] = useState('')
  const [showResidentMenu, setShowResidentMenu] = useState(false)
  const [showLoginMenu, setShowLoginMenu] = useState(false)
  const [showGuardSub, setShowGuardSub] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
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

  const go = (path:string)=>{
    setShowLoginMenu(false); setShowResidentMenu(false); setShowGuardSub(false)
    window.location.href=path
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white relative">
      {/* TOP NAVBAR - CLEAN, Resident/Login HATA DIYA */}
      <header className="sticky top-0 z-40 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8B6F1F] flex items-center justify-center font-serif font-black text-black">A</div>
            <div className="leading-tight">
              <div className="font-bold text- tracking-wide">Arihant Anchal</div>
              <div className="text- tracking-[0.2em] text-[#D4AF37]/70 uppercase">Society & Club House</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/[0.06] border border-white/10">
            <Link href="/" className="px-5 py-2 rounded-full bg-[#D4AF37] text-black text- font-bold">Home</Link>
            <Link href="/about" className="px-4 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10">About</Link>
            <Link href="/amenities" className="px-4 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10">Amenities</Link>
            <Link href="/gallery" className="px-4 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10">Gallery</Link>
            <Link href="/contact" className="px-4 py-2 rounded-full text- text-white/70 hover:text-white hover:bg-white/10">Contact</Link>
          </nav>
          <div className="w-10"></div>
        </div>
      </header>

      {/* RIGHT SIDE VERTICAL TABS */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {/* RESIDENT VERTICAL TAB */}
        <div className="relative">
          <button
            onClick={()=>{ setShowResidentMenu(!showResidentMenu); setShowLoginMenu(false) }}
            className="w-12 md:w-14 py-4 rounded-l-2xl bg-white text-black font-black text- md:text-xs shadow-2xl flex flex-col items-center gap-1 hover:bg-[#D4AF37] transition-all border-r-0 border border-white/20"
            style={{writingMode:'vertical-rl', textOrientation:'mixed'}}
          >
            <span className="text-lg">👤</span>
            <span className="tracking-widest">RESIDENT</span>
          </button>

          {showResidentMenu && (
            <div className="absolute right- md:right- top-0 w-64 bg-[#141E32] border border-[#D4AF37]/20 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 text- tracking-widest text-[#D4AF37]/60 font-bold">RESIDENT ACCESS</div>
              <button onClick={()=>go('/register')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs">📝</div>
                <div><div className="text-sm font-bold">Registration</div><div className="text- text-white/50">New Flat Register</div></div>
              </button>
              <button onClick={()=>{ setShowResidentMenu(false); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs">🔐</div>
                <div><div className="text-sm font-bold">Resident Login</div><div className="text- text-white/50">Flat + Password</div></div>
              </button>
            </div>
          )}
        </div>

        {/* LOGIN VERTICAL TAB */}
        <div className="relative">
          <button
            onClick={()=>{ setShowLoginMenu(!showLoginMenu); setShowResidentMenu(false) }}
            className="w-12 md:w-14 py-4 rounded-l-2xl bg-gradient-to-b from-[#D4AF37] to-[#8B6F1F] text-black font-black text- md:text-xs shadow-[0_0_25px_rgba(212,175,55,0.4)] flex flex-col items-center gap-1 hover:brightness-110 transition-all border border-[#D4AF37]/30"
            style={{writingMode:'vertical-rl', textOrientation:'mixed'}}
          >
            <span className="text-lg">🔑</span>
            <span className="tracking-widest">LOGIN</span>
          </button>

          {showLoginMenu && (
            <div className="absolute right- md:right- top-0 w- bg-[#141E32] border border-[#D4AF37]/20 rounded- shadow-2xl p-2 z-50 max-h- overflow-auto">
              <div className="px-3 py-2 text- tracking-widest text-[#D4AF37]/60 font-bold">SELECT LOGIN TYPE</div>

              <button onClick={()=>{ setShowLoginMenu(false); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center">👤</div>
                <div className="flex-1"><div className="text-sm font-bold">Resident Login</div><div className="text- text-white/50">Flat No + Password</div></div>
              </button>

              <div>
                <button onClick={()=>setShowGuardSub(!showGuardSub)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center">🛡️</div>
                  <div className="flex-1"><div className="text-sm font-bold">Guard Login</div><div className="text- text-white/50">Gate 1-5</div></div>
                  <div className="text-xs">{showGuardSub?'▲':'▼'}</div>
                </button>
                {showGuardSub && (
                  <div className="mx-2 my-1 p-2 rounded-xl bg-black/30 border border-white/10 grid grid-cols-3 gap-2">
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>go(`/guard?gate=${n}`)} className="h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-black text-xs font-bold">Gate {n}</button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={()=>go('/admin')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">⚙️</div>
                <div><div className="text-sm font-bold">Admin Login</div><div className="text- text-white/50">Approval • Reports</div></div>
              </button>

              <button onClick={()=>go('/clubhouse')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">🏊</div>
                <div><div className="text-sm font-bold">Club House</div><div className="text- text-white/50">Booking • Events</div></div>
              </button>

              <button onClick={()=>go('/maintenance')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">💰</div>
                <div><div className="text-sm font-bold">Maintenance</div><div className="text- text-white/50">Due • Advance</div></div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HERO - ONLY BIG STYLISH WELCOME */}
      <section className="relative min-h- flex items-center justify-center text-center px-6 pr-">
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
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141E32] border border-white/10 text-white rounded- p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">🔐 Resident Login</div>
              <button onClick={()=>setShowLoginModal(false)} className="w-8 h-8 rounded-full bg-white/10">✕</button>
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
