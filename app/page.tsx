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

  const facilities = [
    { icon: "🏊", title: "Swimming Pool", desc: "Olympic Size Pool with Kids Section", color: "from-cyan-100 to-blue-100" },
    { icon: "🏋", title: "Gymnasium", desc: "Modern Equipment & Trainer Facility", color: "from-orange-100 to-red-100" },
    { icon: "🏢", title: "Club House", desc: "Banquet Hall, Party & Events", color: "from-amber-100 to-yellow-100" },
    { icon: "🌳", title: "Garden & Kids Park", desc: "Green Park, Play Area & Jogging", color: "from-green-100 to-emerald-100" },
    { icon: "🛡", title: "24/7 Security", desc: "5 Gate Entry, CCTV & Guard Patrol", color: "from-slate-100 to-gray-100" },
    { icon: "🅿", title: "Parking", desc: "Covered Parking for All Flats", color: "from-purple-100 to-pink-100" },
  ]

  const circleImages = [
    { label: "Club House", icon: "🏢" },
    { label: "Pool", icon: "🏊" },
    { label: "Garden", icon: "🌳" },
    { label: "Building", icon: "🏘" },
    { label: "Gym", icon: "🏋" },
    { label: "Security", icon: "🛡" },
    { label: "Parking", icon: "🅿" },
    { label: "Play Area", icon: "🎠" },
  ]

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#1A1A1A] selection:bg-[#C6A25A]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700;900&display=swap');
       .font-serif{font-family:'Playfair Display',serif}
       .font-sans{font-family:'Inter',sans-serif}
        @keyframes rotateCircle { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes counterRotate { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
       .rotating-circle{ animation: rotateCircle 40s linear infinite; }
       .rotating-circle:hover{ animation-play-state: paused; }
       .counter-rotate{ animation: counterRotate 40s linear infinite; }
       .rotating-circle:hover.counter-rotate{ animation-play-state: paused; }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded- bg-gradient-to-br from-[#1A3C34] to-[#2A5A4A] flex items-center justify-center">
              <span className="font-serif font-black text- text-[#C6A25A]">AA</span>
            </div>
            <div className="leading-none">
              <div className="font-serif font-black text- text-[#122620]">Arihant Anchal</div>
              <div className="text- tracking-[0.32em] text-[#C6A25A] uppercase font-bold mt-1">Society & Club House</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-black/[0.04] border border-black/[0.06]">
            <Link href="/" className="px-5 py-2 rounded-full bg-[#122620] text-white text-sm font-bold shadow">Home</Link>
            <Link href="/about" className="px-5 py-2 rounded-full text-sm text-black/60 hover:text-black">About</Link>
            <Link href="/amenities" className="px-5 py-2 rounded-full text-sm text-black/60 hover:text-black">Amenities</Link>
            <Link href="/contact" className="px-5 py-2 rounded-full text-sm text-black/60 hover:text-black">Contact</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            {/* ====== FINAL 4 SUB TAB - NEW REGISTRATION ====== */}
            <div className="relative">
              <button onClick={()=>{ setShowResidentMenu(!showResidentMenu); setShowLoginMenu(false) }} className="px-5 h-10 rounded-full bg-white border border-black/10 text-black text- font-bold flex items-center gap-1.5 shadow-sm">New Registration <span className="text-">{showResidentMenu?'▲':'▼'}</span></button>
              {showResidentMenu && (
                <div className="absolute top-12 right-0 w- bg-white border border-black/10 rounded- shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-2 z-50">
                  <div className="px-4 py-2 text- tracking-[0.2em] text-[#C6A25A] font-bold">SELECT REGISTRATION TYPE</div>

                  <button onClick={()=>go('/resident/register')} className="w-full text-left px-4 py-3 rounded- hover:bg-black/[0.04] flex gap-3 transition border border-transparent hover:border-black/10">
                    <div className="w-10 h-10 rounded-xl bg-[#122620] text-white flex items-center justify-center">🏠</div>
                    <div className="flex-1"><div className="text-sm font-bold text-black">Resident</div><div className="text- text-black/50 break-all">/resident/register</div></div>
                    <div className="text-black/20">→</div>
                  </button>

                  <button onClick={()=>go('/guard/register')} className="w-full text-left px-4 py-3 rounded- hover:bg-black/[0.04] flex gap-3 transition border border-transparent hover:border-black/10">
                    <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center">🛡</div>
                    <div className="flex-1"><div className="text-sm font-bold text-black">Guard</div><div className="text- text-black/50 break-all">/guard/register</div></div>
                    <div className="text-black/20">→</div>
                  </button>

                  <button onClick={()=>go('/employee/register')} className="w-full text-left px-4 py-3 rounded- hover:bg-[#C6A25A]/10 flex gap-3 transition border border-transparent hover:border-[#C6A25A]/20">
                    <div className="w-10 h-10 rounded-xl bg-[#C6A25A] text-white flex items-center justify-center">💼</div>
                    <div className="flex-1"><div className="text-sm font-bold text-black">Employee</div><div className="text- text-black/50 break-all">/employee/register</div></div>
                    <div className="text-black/20">→</div>
                  </button>

                  <button onClick={()=>go('/admin')} className="w-full text-left px-4 py-3 rounded- hover:bg-red-50 flex gap-3 transition border border-transparent hover:border-red-100">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">⚙</div>
                    <div className="flex-1"><div className="text-sm font-bold text-black">Admin</div><div className="text- text-black/50">ID: ARI9700 - Direct Login</div></div>
                    <div className="text-black/20">→</div>
                  </button>

                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={()=>{ setShowLoginMenu(!showLoginMenu); setShowResidentMenu(false) }} className="px-5 h-10 rounded-full bg-[#122620] text-white text- font-black flex items-center gap-1.5">Login <span className="text-">{showLoginMenu?'▲':'▼'}</span></button>
              {showLoginMenu && (
                <div className="absolute top-12 right-0 w- bg-white border border-black/10 rounded- shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-2 z-50">
                  <div className="px-4 py-2 text- tracking-[0.2em] text-[#C6A25A] font-bold">SELECT PORTAL</div>
                  <button onClick={()=>{ setShowLoginMenu(false); setLoginRole('resident'); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded- hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-[#122620] text-white flex items-center justify-center">👤</div><div><div className="text-sm font-bold text-black">Resident</div><div className="text- text-black/50">Flat No + Password</div></div></button>
                  <button onClick={()=>{ setLoginRole('employee'); setShowLoginMenu(false); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded- hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-[#C6A25A] text-white flex items-center justify-center">💼</div><div><div className="text-sm font-bold text-black">Employee</div><div className="text- text-black/50">Staff Login</div></div></button>
                  <div className="relative"><button onClick={()=>setShowGuardSub(!showGuardSub)} className="w-full text-left px-4 py-3 rounded- hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-black/5 border flex items-center justify-center">🛡</div><div className="flex-1"><div className="text-sm font-bold text-black">Guard</div><div className="text- text-black/50">Gate 1-5</div></div><span className="text-xs">{showGuardSub?'▲':'▼'}</span></button>{showGuardSub && (<div className="ml-4 mr-2 my-1 p-2 rounded-xl bg-black/[0.03] border border-black/10 grid grid-cols-3 gap-2">{[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>go(`/guard/login?gate=${n}`)} className="h-9 rounded-full bg-white border border-black/10 hover:bg-[#122620] hover:text-white text- font-bold">Gate {n}</button>))}</div>)}</div>
                  <button onClick={()=>go('/admin')} className="w-full text-left px-4 py-3 rounded- hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">⚙</div><div><div className="text-sm font-bold text-black">Admin</div><div className="text- text-black/50">ARI9700 / ARI#9700</div></div></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative pt-12 pb-20 px-6 overflow-hidden bg-[#FFFBF2]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#122620] text-[#C6A25A] text- tracking-widest font-bold uppercase"><span className="w-2 h-2 rounded-full bg-[#C6A25A] animate-pulse"/> Jodhpur&apos;s Premium Living</div>
            <h1 className="mt-6 font-serif font-black tracking-tight leading-[0.85]"><span className="block text-[#122620] text- md:text-">Arihant</span><span className="block text-[#122620] text- md:text- -mt-2">Anchal</span><span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C6A25A] to-[#8B6F1F] text- md:text- mt-3 font-light italic">Society & Club House</span></h1>
            <p className="mt-6 text- leading-7 text-black/60 max-w-xl">Jodhpur ki sabse advanced society management system — Resident, Guard, Employee aur Admin sab ek hi app me.</p>
            <div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>go('/resident/register')} className="h-12 px-8 rounded-full bg-[#122620] text-white font-bold text-sm">New Registration →</button><button onClick={()=>{ setLoginRole('resident'); setShowLoginModal(true) }} className="h-12 px-8 rounded-full bg-white border border-black/10 text-black font-bold text-sm">Login to Portal</button></div>
          </div>
          <div className="order-1 lg:order-2 relative flex items-center justify-center h-">
            <div className="absolute w- h- md:w- md:h- rounded-full border border-dashed border-[#C6A25A]/30"></div>
            <div className="absolute w- h- md:w- md:h- rounded-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.04] flex items-center justify-center">
               <div className="text-center"><div className="w-20 h-20 mx-auto rounded-2xl bg-[#122620] flex items-center justify-center text-3xl">🏢</div><div className="font-serif font-black text-xl mt-4 text-[#122620]">Arihant<br/>Anchal</div></div>
            </div>
            <div className="absolute w- h- md:w- md:h- rotating-circle">
              {circleImages.map((item, i)=>{
                const angle = (i * 360) / circleImages.length;
                return (<div key={i} className="absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10" style={{ transform: `rotate(${angle}deg) translate(190px) rotate(-${angle}deg)` } as any}><div className="counter-rotate w-full h-full"><div className="w-20 h-20 rounded-2xl bg-white border border-black/10 shadow flex flex-col items-center justify-center"><div className="text-2xl">{item.icon}</div><div className="text- font-bold mt-1">{item.label}</div></div></div></div>)
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#122620] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#C6A25A] flex items-center justify-center font-black text-black">AA</div><div className="font-serif font-black text-lg">Arihant Anchal</div></div>
              <p className="text-white/50 text-sm mt-4 max-w-sm">Jodhpur&apos;s most advanced digital society management system.</p>
            </div>
            <div><div className="text- tracking-widest text-[#C6A25A] font-bold uppercase">Quick Links</div><div className="mt-4 space-y-2.5 text-sm text-white/60"><div><Link href="/about">About</Link></div><div><Link href="/amenities">Amenities</Link></div></div></div>
            <div><div className="text- tracking-widest text-[#C6A25A] font-bold uppercase">Support</div><div className="mt-4 space-y-2.5 text-sm text-white/60"><div>Gate 1: 24/7 Security</div><div>Admin Office: B-Block</div></div></div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 justify-between">
            <div className="text- leading-6 text-white/70">
              <div className="font-bold text-white">Designed by Er. Mahesh Chand</div>
              <div>Address - B-2-304 Arihant Anchal, Jodhpur - 342005</div>
              <div className="flex flex-wrap gap-4 mt-1"><span>Contact @ <a href="mailto:er.maheshchand.dd@gmail.com" className="text-[#C6A25A]">er.maheshchand.dd@gmail.com</a></span><span>Mobile No - <a href="tel:+918769909700" className="text-[#C6A25A]">8769909700</a></span></div>
            </div>
            <div className="text- text-white/30">© {new Date().getFullYear()} Arihant Anchal Society. All Rights Reserved.</div>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded- p-7 shadow-xl">
            <div className="flex justify-between items-center"><div className="font-bold text- text-black">🔐 {loginRole.toUpperCase()} Login</div><button onClick={()=>setShowLoginModal(false)} className="w-8 h-8 rounded-full bg-black/5">✕</button></div>
            <div className="mt-6 space-y-3"><input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="Flat No / Employee ID" className="w-full h- rounded-2xl bg-black/[0.04] border border-black/10 px-4 font-bold text-sm text-black"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h- rounded-2xl bg-black/[0.04] border border-black/10 px-4 font-bold text-sm text-black"/><button onClick={handleLogin} disabled={loading} className="w-full h- rounded-full bg-[#122620] text-white font-black text-sm">{loading?'Checking...':'Login → Dashboard'}</button></div>
          </div>
        </div>
      )}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-md bg-white border-4 border-red-600 rounded- p-6"><div className="text-4xl text-center">🚨</div><h2 className="font-black text-2xl text-center text-red-600 mt-2">EMERGENCY ALERT</h2><div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-black text-sm">{emergencyAlert.message}</div><button onClick={()=>setEmergencyAlert(null)} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">OK</button></div></div>
      )}
    </div>
  )
}
