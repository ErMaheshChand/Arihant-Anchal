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

  // Amenities jaisa card style
  const amenityCard = "bg-[#151A27] border border-white/10 rounded- p-5 hover:border-[#D4AF37]/30 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      {/* HEADER - Amenities Theme */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8B6F1F] flex items-center justify-center font-black text-black">A</div>
            <div className="font-bold text-">Arihant Anchal <span className="text-[#D4AF37] font-normal">Society</span></div>
          </div>
          <Link href="/" className="text- text-[#D4AF37]">← Back to Home</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* BIG WELCOME - Landing Page jaisa bada */}
        <div className="text-center py-10 md:py-16">
          <h1 className="font-serif font-black tracking-tight leading-[0.85]">
            <span className="block font-sans font-light text-white/50 text- md:text- tracking-[0.4em] uppercase mb-4">Welcome to</span>
            <span className="block text-white text- md:text- lg:text-">Arihant Anchal</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text- md:text- lg:text- mt-2 font-light italic">Society & Club House</span>
          </h1>
        </div>

        {/* LOGIN TABS - Amenities wale cards jaisa */}
        <div>
          <div className="mb-4">
            <h2 className="text- font-bold">Login at <span className="text-[#D4AF37]">Arihant Anchal</span></h2>
            <p className="text- text-white/50 mt-1">Premium living with everything you need inside campus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* RESIDENT */}
            <div onClick={()=>setShowLogin(true)} className={amenityCard}>
              <div className="text-2xl">👤</div>
              <div className="font-bold text- mt-3">Resident Login</div>
              <div className="text- text-white/50 mt-1">Flat No + Password for residents.</div>
            </div>

            {/* GUARD */}
            <div className={amenityCard}>
              <div onClick={()=>setShowGuard(!showGuard)} className="cursor-pointer">
                <div className="text-2xl">🛡️</div>
                <div className="font-bold text- mt-3">Guard Login</div>
                <div className="text- text-white/50 mt-1">Gate 1 to 5 • Visitor entry system.</div>
              </div>
              {showGuard && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>go(`/guard?gate=${n}`)} className="h-8 rounded-full bg-white text-black text- font-bold hover:bg-[#D4AF37]">Gate {n}</button>
                  ))}
                </div>
              )}
            </div>

            {/* ADMIN */}
            <div onClick={()=>go('/admin')} className={amenityCard}>
              <div className="text-2xl">⚙️</div>
              <div className="font-bold text- mt-3">Admin Login</div>
              <div className="text- text-white/50 mt-1">Approval, residents & full reports.</div>
            </div>

            {/* CLUB HOUSE */}
            <div onClick={()=>go('/clubhouse')} className={amenityCard}>
              <div className="text-2xl">🎭</div>
              <div className="font-bold text- mt-3">Club House Login</div>
              <div className="text- text-white/50 mt-1">AC hall, booking & event space.</div>
            </div>

            {/* MAINTENANCE */}
            <div onClick={()=>go('/maintenance')} className={amenityCard}>
              <div className="text-2xl">💰</div>
              <div className="font-bold text- mt-3">Maintenance Login</div>
              <div className="text- text-white/50 mt-1">Due, advance & receipt management.</div>
            </div>

            {/* REGISTRATION - Gold highlight */}
            <div onClick={()=>go('/register')} className="bg-gradient-to-br from-[#D4AF37]/20 to-[#8B6F1F]/20 border border-[#D4AF37]/30 rounded- p-5 hover:border-[#D4AF37]/60 hover:-translate-y-1 transition-all cursor-pointer">
              <div className="text-2xl">📝</div>
              <div className="font-bold text- mt-3 text-[#D4AF37]">New Registration</div>
              <div className="text- text-white/60 mt-1">New flat resident registration.</div>
            </div>

            {/* PARKING / EXTRA - To match your amenity image theme */}
            <div onClick={()=>go('/visitors')} className={amenityCard}>
              <div className="text-2xl">🅿️</div>
              <div className="font-bold text- mt-3">Visitor Parking</div>
              <div className="text- text-white/50 mt-1">Covered & open parking for visitors.</div>
            </div>

            <div onClick={()=>go('/security')} className={amenityCard}>
              <div className="text-2xl">🛡️</div>
              <div className="font-bold text- mt-3">24×7 Security</div>
              <div className="text- text-white/50 mt-1">Gated society, CCTV & guards.</div>
            </div>

          </div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#151A27] border border-white/10 text-white rounded- p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">🔐 Resident Login</div>
              <button onClick={()=>setShowLogin(false)} className="w-8 h-8 rounded-full bg-white/10">✕</button>
            </div>
            <div className="mt-6 space-y-3">
              <input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="Flat No ex: B-302" className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 font-bold text-sm placeholder:text-white/30"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 font-bold text-sm placeholder:text-white/30"/>
              <button onClick={handleLogin} disabled={loading} className="w-full h-12 rounded-full bg-[#D4AF37] text-black font-bold text-sm">{loading?'Checking...':'Login → Resident Page'}</button>
              <div className="text-center text-xs text-white/40">New ho? <Link href="/register" className="text-[#D4AF37] font-bold underline">Registration karo</Link></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
