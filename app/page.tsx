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
  const [loginRole, setLoginRole] = useState('resident')
  const [loading, setLoading] = useState(false)
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null)

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search).get('flat')
    if(p){ setFlatNo(p); setShowLoginModal(true) }
  },[])

  useEffect(()=>{
    const ch = supabase.channel('emergency-home')
   .on('postgres_changes', {event:'INSERT', schema:'public', table:'emergency_broadcasts'}, payload=>{
        const data = payload.new as any
        if(data.target === 'ALL'){
          setEmergencyAlert(data)
          setTimeout(()=>setEmergencyAlert(null), 30000)
        }
      }).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  },[])

  const handleLogin = async ()=>{
    if(!flatNo||!password) return alert('Flat + Password bharo')
    setLoading(true)
    const { data: ok } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).eq('password',password).eq('status','approved').maybeSingle()
    if(ok){
      localStorage.setItem('resident', JSON.stringify(ok));
      if(ok.role === 'admin') window.location.href='/admin';
      else window.location.href='/resident';
      return
    }
    const { data: emp } = await supabase.from('employees').select('*').eq('employee_id',flatNo.toUpperCase()).eq('password',password).maybeSingle()
    if(emp){
      localStorage.setItem('employee', JSON.stringify(emp));
      window.location.href='/employee';
      return
    }
    setLoading(false)
    const { data: anyData } = await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).maybeSingle()
    if(!anyData) alert('❌ Registration nahi mila - Pehle Registration karo')
    else if(anyData.password!==password) alert('❌ Password galat')
    else if(anyData.status==='pending') alert(`⏳ Flat ${flatNo} approval pending hai`)
    else alert('Login fail')
  }

  const go = (path:string)=>{
    setShowLoginMenu(false); setShowResidentMenu(false); setShowGuardSub(false)
    window.location.href=path
  }

  return (
    <div className="min-h-screen bg-[#080C18] text-white selection:bg-[#D4AF37]/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#080C18]/80 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded- bg-gradient-to-br from-[#F5E6A3] to-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center">
              <span className="font-serif font-black text- text-black tracking-tighter">AΛ</span>
            </div>
            <div className="leading-none">
              <div className="font-serif font-bold text- tracking-wide">Arihant Anchal</div>
              <div className="text- tracking-[0.32em] text-[#D4AF37] uppercase font-bold mt-1 opacity-80">Society & Club House</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <Link href="/" className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold shadow">Home</Link>
            <Link href="/about" className="px-5 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition">About</Link>
            <Link href="/amenities" className="px-5 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition">Amenities</Link>
            <Link href="/contact" className="px-5 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition">Contact</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button onClick={()=>{ setShowResidentMenu(!showResidentMenu); setShowLoginMenu(false) }} className="px-5 h-10 rounded-full bg-white text-black text- font-bold flex items-center gap-1.5 hover:bg-white/90 transition">Resident <span className="text-">{showResidentMenu?'▲':'▼'}</span></button>
              {showResidentMenu && (
                <div className="absolute top-12 right-0 w-64 bg-[#111A2E] border border-white/10 rounded- shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button onClick={()=>go('/register')} className="w-full text-left px-4 py-3.5 rounded- hover:bg-white/[0.06] flex gap-3 transition">
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-sm">✦</div>
                    <div><div className="text- font-bold">New Registration</div><div className="text- text-white/50">Compulsory for Login</div></div>
                  </button>
                  <button onClick={()=>{ setShowResidentMenu(false); setLoginRole('resident'); setShowLoginModal(true) }} className="w-full text-left px-4 py-3.5 rounded- hover:bg-white/[0.06] flex gap-3 transition">
                    <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center text-sm">↗</div>
                    <div><div className="text- font-bold">Resident Login</div><div className="text- text-white/50">Flat No + Password</div></div>
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={()=>{ setShowLoginMenu(!showLoginMenu); setShowResidentMenu(false) }} className="px-5 h-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black text- font-black shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-1.5">Login <span className="text-">{showLoginMenu?'▲':'▼'}</span></button>
              {showLoginMenu && (
                <div className="absolute top-12 right-0 w- bg-[#111A2E] border border-[#D4AF37]/20 rounded- shadow-2xl p-2 z-50">
                  <div className="px-4 py-2 text- tracking-[0.2em] text-[#D4AF37]/70 font-bold">SELECT PORTAL</div>
                  <button onClick={()=>{ setShowLoginMenu(false); setLoginRole('resident'); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded- hover:bg-white/10 flex gap-3"><div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center">👤</div><div><div className="text-sm font-bold">Resident</div><div className="text- text-white/50">Owner / Tenant</div></div></button>
                  <button onClick={()=>{ setLoginRole('employee'); setShowLoginMenu(false); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded- hover:bg-white/10 flex gap-3"><div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center">💼</div><div><div className="text-sm font-bold">Employee</div><div className="text- text-white/50">Staff Login</div></div></button>
                  <div className="relative"><button onClick={()=>setShowGuardSub(!showGuardSub)} className="w-full text-left px-4 py-3 rounded- hover:bg-white/10 flex gap-3"><div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">🛡</div><div className="flex-1"><div className="text-sm font-bold">Guard</div><div className="text- text-white/50">Gate 1-5</div></div><span className="text-xs">{showGuardSub?'▲':'▼'}</span></button>{showGuardSub && (<div className="ml-4 mr-2 my-1 p-2 rounded-xl bg-black/40 border border-white/10 grid grid-cols-3 gap-2">{[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>go(`/guard/login?gate=${n}`)} className="h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-black text- font-bold transition">Gate {n}</button>))}</div>)}</div>
                  <button onClick={()=>go('/admin')} className="w-full text-left px-4 py-3 rounded- hover:bg-white/10 flex gap-3"><div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">⚙</div><div><div className="text-sm font-bold">Admin</div><div className="text- text-white/50">Approval & Reports</div></div></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#121C33] to-[#080C18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.15),_transparent_60%)]" />
        <div className="absolute -top-32 -right-32 w- h- bg-[#D4AF37]/10 blur- rounded-full" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text- tracking-widest text-[#D4AF37] font-bold uppercase"><span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"/> Live Society Management</div>
            <h1 className="mt-6 font-serif font-black tracking-tight leading-[0.9]"><span className="block text-white/40 font-sans font-light text- tracking-[0.4em] uppercase mb-4">Jodhpur&apos;s Premium</span><span className="block text-white text- md:text-">Arihant<br/>Anchal</span><span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text- md:text- mt-2 font-light italic">Society &<br/>Club House</span></h1>
            <p className="mt-6 text- leading-7 text-white/60 max-w-xl">Ek hi app me Resident, Guard, Employee aur Admin — Complaint se leke Maintenance, Gate Entry se leke Emergency Broadcast tak sab kuch.</p>
            <div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>go('/register')} className="h-12 px-7 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition">New Registration →</button><button onClick={()=>{ setLoginRole('resident'); setShowLoginModal(true) }} className="h-12 px-7 rounded-full bg-white/[0.06] border border-white/10 text-white font-bold text-sm hover:bg-white/[0.1] transition">Login to Portal</button></div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 max-w-md"><div><div className="text-2xl font-black">500+</div><div className="text- text-white/50 uppercase tracking-widest mt-1">Flats</div></div><div><div className="text-2xl font-black">24/7</div><div className="text- text-white/50 uppercase tracking-widest mt-1">Security</div></div><div><div className="text-2xl font-black text-[#D4AF37]">100%</div><div className="text- text-white/50 uppercase tracking-widest mt-1">Digital</div></div></div>
          </div>
          <div className="relative lg:h-"><div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded- backdrop-blur-xl p-3"><div className="w-full h-full rounded- bg-[#0B1120] border border-white/5 overflow-hidden relative"><div className="h-12 border-b border-white/10 flex items-center px-5 gap-2"><div className="w-3 h-3 rounded-full bg-red-500/80"/><div className="w-3 h-3 rounded-full bg-yellow-500/80"/><div className="w-3 h-3 rounded-full bg-green-500/80"/><div className="ml-auto text- text-white/30">arihant-anchal.vercel.app</div></div><div className="p-8"><div className="text- tracking-widest text-[#D4AF37] font-bold uppercase">Quick Access</div><div className="mt-4 grid grid-cols-2 gap-3"><div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10"><div className="text-2xl">🏠</div><div className="text-sm font-bold mt-2">Resident</div><div className="text- text-white/40">Complaints • Bills</div></div><div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20"><div className="text-2xl">🛡</div><div className="text-sm font-bold mt-2">Guard</div><div className="text- text-white/40">Entry • Patrol</div></div><div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10"><div className="text-2xl">💼</div><div className="text-sm font-bold mt-2">Employee</div><div className="text- text-white/40">Attendance • Salary</div></div><div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"><div className="text-2xl">⚙</div><div className="text-sm font-bold mt-2">Admin</div><div className="text- text-white/40">Approvals</div></div></div></div></div></div></div>
        </div>
      </section>

      {/* MODALS */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111A2E] border border-white/10 rounded- p-7 shadow-2xl">
            <div className="flex justify-between items-center"><div className="font-bold text-">🔐 {loginRole.toUpperCase()} Login</div><button onClick={()=>setShowLoginModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20">✕</button></div>
            <div className="mt-1 text- text-white/40">Registration compulsory — pehle register karo fir login</div>
            <div className="mt-6 space-y-3"><input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder={loginRole==='employee'? "Employee ID ex: EMP-01" : "Flat No ex: B-302"} className="w-full h- rounded-2xl bg-white/[0.06] border border-white/10 px-4 font-bold text-sm outline-none focus:border-[#D4AF37]/50"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h- rounded-2xl bg-white/[0.06] border border-white/10 px-4 font-bold text-sm outline-none focus:border-[#D4AF37]/50"/><button onClick={handleLogin} disabled={loading} className="w-full h- rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black font-black text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]">{loading?'Checking...':'Login → Dashboard'}</button><button onClick={()=>go('/register')} className="w-full text-center text- text-white/50 hover:text-[#D4AF37]">No account? Register here (Compulsory)</button></div>
          </div>
        </div>
      )}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-md bg-white border-4 border-red-600 rounded- p-6 shadow-[0_0_50px_rgba(255,0,0,0.5)]"><div className="text-4xl text-center">🚨</div><h2 className="font-black text-2xl text-center text-red-600 mt-2">EMERGENCY ALERT</h2><div className="text-center mt-2 text- font-bold bg-red-600 text-white px-3 py-1 rounded-full inline-block">{emergencyAlert.emergency_type} • Gate-{emergencyAlert.gate_no}</div><div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-black text-sm">{emergencyAlert.message}</div><button onClick={()=>setEmergencyAlert(null)} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">OK</button></div></div>
      )}
    </div>
  )
}
