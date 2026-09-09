'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [flatNo, setFlatNo] = useState('')
  const [password, setPassword] = useState('')
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
    if(ok){
      localStorage.setItem('resident', JSON.stringify(ok))
      window.location.href='/resident'
      return
    }
    const { data: any } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).maybeSingle()
    setLoading(false)
    if(!any) alert('❌ Registration nahi mila. Pehle Register karo')
    else if(any.password!==password) alert('❌ Password galat')
    else if(any.status==='pending') alert(`⏳ Flat ${flatNo} approval pending hai. Admin se approve karwao.\nName: ${any.name}`)
    else if(any.status==='rejected') alert('❌ Rejected hai')
    else alert('Login fail')
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white selection:bg-[#D4AF37]/30">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.96] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B1120] flex items-center justify-center font-serif font-bold text-[#D4AF37]">A</div>
            <div className="leading-tight">
              <div className="font-bold text- text-[#0B1120]">Arihant Anchal</div>
              <div className="text- text-black/60 -mt-1">Society & Club House • 530 Flats</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#F1F5F9]">
            <Link href="/" className="px-4 py-1.5 rounded-full bg-[#0B1120] text-white text-xs font-medium">Home</Link>
            <Link href="/about" className="px-3 py-1.5 rounded-full text-xs text-black/70">About</Link>
            <Link href="/amenities" className="px-3 py-1.5 rounded-full text-xs text-black/70">Amenities</Link>
            <Link href="/gallery" className="px-3 py-1.5 rounded-full text-xs text-black/70">Gallery</Link>
            <Link href="/contact" className="px-3 py-1.5 rounded-full text-xs text-black/70">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/register" className="px-4 h-9 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center">New Resident? Register</Link>
            <button onClick={()=>setShowLogin(true)} className="px-4 h-9 rounded-full bg-[#0B1120] text-white text-xs font-bold flex items-center">Login</button>
          </div>
        </div>
      </header>

      {/* HERO - AAPKA PURANA DESIGN SAME */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8A8B6A]/40 via-[#0B1120]/80 to-[#0F766E]/30" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text- tracking-widest uppercase">Near Dali Bai Circle • Jodhpur • 19 Towers</div>
            <h1 className="mt-5 text- md:text- leading-[0.95] font-serif font-bold tracking-tight">
              Welcome to Arihant Anchal <br /> Society & Club House
            </h1>
            <p className="mt-4 text- leading-relaxed text-white/70 max-w-">
              Smart Community • Better Living • Connected Neighbourhood — <span className="text-white">530</span> premium residences.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button onClick={()=>setShowLogin(true)} className="px-5 h-10 rounded-full bg-white text-black text-xs font-medium">Resident Login</button>
              <Link href="/register" className="px-5 h-10 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center">Flat Registration</Link>
              <Link href="/visitor" className="px-5 h-10 rounded-full bg-white text-black text-xs font-medium flex items-center">Visitor Entry</Link>
            </div>
          </div>

          <div className="relative h- md:h-">
            <div className="absolute right-0 top-0 w-[92%] h-[72%] rounded-3xl bg-[#CBD5E1] overflow-hidden border border-white/20 shadow-2xl rotate-[-2deg]">
              <div className="w-full h-full bg-slate-300 opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL - YAHI APPROVAL CHECK KAREGA */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-black rounded- p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div><div className="font-bold text-lg">🔐 Resident Login</div><div className="text-xs text-slate-500">Flat No + Password → Approval Check → /resident</div></div>
              <button onClick={()=>setShowLogin(false)} className="w-8 h-8 rounded-full bg-slate-100">✕</button>
            </div>
            <div className="mt-6 space-y-3">
              <input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="Flat No ex: B-302" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 font-bold text-sm"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 font-bold text-sm"/>
              <button onClick={handleLogin} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">{loading?'Checking Approval...':'🚀 Login & Check Approval'}</button>
              <div className="grid grid-cols-3 gap-2 text- text-center">
                <div className="p-2 rounded-xl bg-slate-50 border">Flat+Pass</div>
                <div className="p-2 rounded-xl bg-amber-50 border font-bold">Approval?</div>
                <div className="p-2 rounded-xl bg-emerald-50 border font-bold">/resident</div>
              </div>
              <Link href="/register" className="block text-center text-xs text-slate-500 underline">New? Flat Registration Karo →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
