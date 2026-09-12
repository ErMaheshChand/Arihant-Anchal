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
    { icon: "🏋️", title: "Gymnasium", desc: "Modern Equipment & Trainer Facility", color: "from-orange-100 to-red-100" },
    { icon: "🏢", title: "Club House", desc: "Banquet Hall, Party & Events", color: "from-amber-100 to-yellow-100" },
    { icon: "🌳", title: "Garden & Kids Park", desc: "Green Park, Play Area & Jogging", color: "from-green-100 to-emerald-100" },
    { icon: "🛡️", title: "24/7 Security", desc: "5 Gate Entry, CCTV & Guard Patrol", color: "from-slate-100 to-gray-100" },
    { icon: "🅿️", title: "Parking", desc: "Covered Parking for All Flats", color: "from-purple-100 to-pink-100" },
  ]

  const circleImages = [
    { label: "Club House", icon: "🏢" },
    { label: "Pool", icon: "🏊" },
    { label: "Garden", icon: "🌳" },
    { label: "Building", icon: "🏘️" },
    { label: "Gym", icon: "🏋️" },
    { label: "Security", icon: "🛡️" },
    { label: "Parking", icon: "🅿️" },
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
        .rotating-circle:hover .counter-rotate{ animation-play-state: paused; }
      `}</style>

      {/* HEADER - LIGHT */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#1A3C34] to-[#2A5A4A] shadow-[0_4px_12px_rgba(26,60,52,0.3)] flex items-center justify-center">
              <span className="font-serif font-black text-[20px] text-[#C6A25A] tracking-tighter">AA</span>
            </div>
            <div className="leading-none">
              <div className="font-serif font-black text-[17px] tracking-wide text-[#122620]">Arihant Anchal</div>
              <div className="text-[10px] tracking-[0.32em] text-[#C6A25A] uppercase font-bold mt-1">Society & Club House</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-black/[0.04] border border-black/[0.06]">
            <Link href="/" className="px-5 py-2 rounded-full bg-[#122620] text-white text-sm font-bold shadow">Home</Link>
            <Link href="/about" className="px-5 py-2 rounded-full text-sm text-black/60 hover:text-black hover:bg-black/5 transition">About</Link>
            <Link href="/amenities" className="px-5 py-2 rounded-full text-sm text-black/60 hover:text-black hover:bg-black/5 transition">Amenities</Link>
            <Link href="/contact" className="px-5 py-2 rounded-full text-sm text-black/60 hover:text-black hover:bg-black/5 transition">Contact</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button onClick={()=>{ setShowResidentMenu(!showResidentMenu); setShowLoginMenu(false) }} className="px-5 h-10 rounded-full bg-white border border-black/10 text-black text-[13px] font-bold flex items-center gap-1.5 hover:bg-black/[0.02] transition shadow-sm">Resident <span className="text-[10px]">{showResidentMenu?'▲':'▼'}</span></button>
              {showResidentMenu && (
                <div className="absolute top-12 right-0 w-64 bg-white border border-black/10 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-2 z-50">
                  <button onClick={()=>go('/register')} className="w-full text-left px-4 py-3.5 rounded-[14px] hover:bg-black/[0.04] flex gap-3 transition">
                    <div className="w-9 h-9 rounded-full bg-[#122620] text-white flex items-center justify-center text-sm">✦</div>
                    <div><div className="text-[13px] font-bold text-black">New Registration</div><div className="text-[11px] text-black/50">Compulsory for Login</div></div>
                  </button>
                  <button onClick={()=>{ setShowResidentMenu(false); setLoginRole('resident'); setShowLoginModal(true) }} className="w-full text-left px-4 py-3.5 rounded-[14px] hover:bg-black/[0.04] flex gap-3 transition">
                    <div className="w-9 h-9 rounded-full bg-[#C6A25A] text-white flex items-center justify-center text-sm">↗</div>
                    <div><div className="text-[13px] font-bold text-black">Resident Login</div><div className="text-[11px] text-black/50">Flat No + Password</div></div>
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={()=>{ setShowLoginMenu(!showLoginMenu); setShowResidentMenu(false) }} className="px-5 h-10 rounded-full bg-[#122620] text-white text-[13px] font-black shadow-[0_4px_12px_rgba(18,38,32,0.25)] flex items-center gap-1.5">Login <span className="text-[10px]">{showLoginMenu?'▲':'▼'}</span></button>
              {showLoginMenu && (
                <div className="absolute top-12 right-0 w-[300px] bg-white border border-black/10 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-2 z-50">
                  <div className="px-4 py-2 text-[10px] tracking-[0.2em] text-[#C6A25A] font-bold">SELECT PORTAL</div>
                  <button onClick={()=>{ setShowLoginMenu(false); setLoginRole('resident'); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded-[14px] hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-[#122620] text-white flex items-center justify-center">👤</div><div><div className="text-sm font-bold text-black">Resident</div><div className="text-[11px] text-black/50">Owner / Tenant</div></div></button>
                  <button onClick={()=>{ setLoginRole('employee'); setShowLoginMenu(false); setShowLoginModal(true) }} className="w-full text-left px-4 py-3 rounded-[14px] hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-[#C6A25A] text-white flex items-center justify-center">💼</div><div><div className="text-sm font-bold text-black">Employee</div><div className="text-[11px] text-black/50">Staff Login</div></div></button>
                  <div className="relative"><button onClick={()=>setShowGuardSub(!showGuardSub)} className="w-full text-left px-4 py-3 rounded-[14px] hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center">🛡</div><div className="flex-1"><div className="text-sm font-bold text-black">Guard</div><div className="text-[11px] text-black/50">Gate 1-5</div></div><span className="text-xs text-black">{showGuardSub?'▲':'▼'}</span></button>{showGuardSub && (<div className="ml-4 mr-2 my-1 p-2 rounded-xl bg-black/[0.03] border border-black/10 grid grid-cols-3 gap-2">{[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>go(`/guard/login?gate=${n}`)} className="h-9 rounded-full bg-white border border-black/10 hover:bg-[#122620] hover:text-white text-[11px] font-bold transition shadow-sm">Gate {n}</button>))}</div>)}</div>
                  <button onClick={()=>go('/admin')} className="w-full text-left px-4 py-3 rounded-[14px] hover:bg-black/[0.04] flex gap-3"><div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">⚙</div><div><div className="text-sm font-bold text-black">Admin</div><div className="text-[11px] text-black/50">Approval & Reports</div></div></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO LIGHT WITH ROTATING CIRCLE */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden bg-[#FFFBF2]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#122620] text-[#C6A25A] text-[11px] tracking-widest font-bold uppercase"><span className="w-2 h-2 rounded-full bg-[#C6A25A] animate-pulse"/> Jodhpur&apos;s Premium Living</div>
            <h1 className="mt-6 font-serif font-black tracking-tight leading-[0.85]"><span className="block text-[#122620] text-[54px] md:text-[72px]">Arihant</span><span className="block text-[#122620] text-[54px] md:text-[72px] -mt-2">Anchal</span><span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C6A25A] to-[#8B6F1F] text-[36px] md:text-[44px] mt-3 font-light italic">Society & Club House</span></h1>
            <p className="mt-6 text-[15px] leading-7 text-black/60 max-w-xl font-sans">Jodhpur ki sabse advanced society management system — Resident, Guard, Employee aur Admin sab ek hi app me. Digital complaint, maintenance, entry, emergency broadcast.</p>
            <div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>go('/register')} className="h-12 px-8 rounded-full bg-[#122620] text-white font-bold text-sm shadow-[0_8px_20px_rgba(18,38,32,0.25)] hover:bg-black transition">New Registration →</button><button onClick={()=>{ setLoginRole('resident'); setShowLoginModal(true) }} className="h-12 px-8 rounded-full bg-white border border-black/10 text-black font-bold text-sm hover:bg-black/[0.03] transition">Login to Portal</button></div>
            <div className="mt-12 flex gap-8 border-t border-black/10 pt-8 max-w-md">
              <div><div className="text-3xl font-black font-serif text-[#122620]">500+</div><div className="text-[11px] text-black/40 uppercase tracking-widest mt-1 font-bold">Flats</div></div>
              <div className="w-px bg-black/10"></div>
              <div><div className="text-3xl font-black font-serif text-[#122620]">24/7</div><div className="text-[11px] text-black/40 uppercase tracking-widest mt-1 font-bold">Security</div></div>
              <div className="w-px bg-black/10"></div>
              <div><div className="text-3xl font-black font-serif text-[#C6A25A]">5</div><div className="text-[11px] text-black/40 uppercase tracking-widest mt-1 font-bold">Gates</div></div>
            </div>
          </div>

          {/* ROTATING CIRCLE */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center h-[520px]">
            <div className="absolute w-[380px] h-[380px] md:w-[480px] md:h-[480px] rounded-full border border-dashed border-[#C6A25A]/30"></div>
            <div className="absolute w-[300px] h-[300px] md:w-[360px] md:h-[360px] rounded-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.04] flex items-center justify-center">
               <div className="text-center">
                 <div className="w-20 h-20 mx-auto rounded-2xl bg-[#122620] flex items-center justify-center text-3xl shadow-lg">🏢</div>
                 <div className="font-serif font-black text-xl mt-4 text-[#122620]">Arihant<br/>Anchal</div>
                 <div className="text-[10px] tracking-widest text-[#C6A25A] font-bold mt-1">PREMIUM LIVING</div>
               </div>
            </div>
            {/* ROTATING ITEMS */}
            <div className="absolute w-[380px] h-[380px] md:w-[480px] md:h-[480px] rotating-circle">
              {circleImages.map((item, i)=>{
                const angle = (i * 360) / circleImages.length;
                return (
                  <div key={i} className="absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10" style={{ transform: `rotate(${angle}deg) translate(190px) rotate(-${angle}deg)` } as any}>
                    <div className="counter-rotate w-full h-full group cursor-pointer">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center hover:scale-[1.4] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] hover:border-[#C6A25A]/50 transition-all duration-300">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="text-[9px] font-bold mt-1 text-black/60 uppercase tracking-wide">{item.label}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* BUILDING PHOTOS & FACILITIES */}
      <section className="px-6 py-16 bg-white border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><div className="text-[11px] tracking-[0.3em] text-[#C6A25A] font-black uppercase">Our Infrastructure</div><h2 className="font-serif font-black text-4xl md:text-5xl text-[#122620] mt-2 leading-[0.9]">World-Class<br/><span className="text-[#C6A25A] italic font-light">Facilities</span></h2></div>
            <div className="text-sm text-black/50 max-w-sm">Arihant Anchal me har facility DLF / Lodha standard ki hai - Security se leke Recreation tak.</div>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 h-[320px] rounded-[24px] bg-gradient-to-br from-[#122620] to-[#1A3C34] p-8 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C6A25A]/10 blur-[60px] rounded-full"/>
              <div className="absolute top-8 right-8 text-7xl opacity-20">🏢</div>
              <div className="relative z-10"><div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] text-white/70 tracking-widest font-bold">MAIN BUILDING</div><h3 className="font-serif font-black text-3xl text-white mt-3">Arihant Anchal Towers</h3><p className="text-white/60 text-sm mt-2 max-w-sm">500+ flats, 5 gates, modern architecture with premium elevation and ample sunlight.</p></div>
            </div>
            <div className="h-[320px] rounded-[24px] bg-gradient-to-br from-[#FFF8E7] to-[#F5E6C8] border border-[#C6A25A]/20 p-8 flex flex-col justify-between">
              <div className="text-5xl">🏊</div><div><h3 className="font-bold text-xl text-[#122620]">Swimming Pool</h3><p className="text-sm text-black/60 mt-2">Olympic size pool with separate kids pool and lifeguard.</p></div>
            </div>
          </div>
          <div className="mt-5 grid md:grid-cols-3 lg:grid-cols-6 gap-5">
            {facilities.map((f,i)=>(
              <div key={i} className="rounded-[20px] bg-[#FFFBF2] border border-black/[0.06] p-5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-[#C6A25A]/30 transition group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl group-hover:scale-110 transition`}>{f.icon}</div>
                <div className="font-bold text-sm mt-4 text-[#122620]">{f.title}</div>
                <div className="text-[11px] text-black/50 mt-1 leading-5">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER WITH YOUR DETAILS */}
      <footer className="bg-[#122620] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#C6A25A] flex items-center justify-center font-black text-black">AA</div><div className="font-serif font-black text-lg">Arihant Anchal</div></div>
              <p className="text-white/50 text-sm mt-4 max-w-sm leading-6">Jodhpur&apos;s most advanced digital society management system. Complaint, Maintenance, Visitor Entry, Emergency Broadcast — sab ek jagah.</p>
              <div className="mt-6 flex gap-3"><button onClick={()=>go('/register')} className="h-10 px-5 rounded-full bg-[#C6A25A] text-black text-xs font-bold">Register Now</button><button onClick={()=>go('/contact')} className="h-10 px-5 rounded-full bg-white/10 border border-white/10 text-xs font-bold">Contact Us</button></div>
            </div>
            <div><div className="text-[11px] tracking-widest text-[#C6A25A] font-bold uppercase">Quick Links</div><div className="mt-4 space-y-2.5 text-sm text-white/60"><div><Link href="/about" className="hover:text-white">About Society</Link></div><div><Link href="/amenities" className="hover:text-white">Amenities</Link></div><div><Link href="/gallery" className="hover:text-white">Gallery</Link></div><div><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></div><div><Link href="/rules" className="hover:text-white">Society Rules</Link></div><div><Link href="/emergency" className="hover:text-white">Emergency Contacts</Link></div></div></div>
            <div><div className="text-[11px] tracking-widest text-[#C6A25A] font-bold uppercase">Support</div><div className="mt-4 space-y-2.5 text-sm text-white/60"><div>Gate 1: 24/7 Security</div><div>Maintenance: 9AM-6PM</div><div>Admin Office: B-Block</div><div>Emergency: 112 / 102</div></div></div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="text-[12px] leading-6 text-white/70">
              <div className="font-bold text-white">Designed by Er. Mahesh Chand</div>
              <div>Address - B-2-304 Arihant Anchal, Jodhpur, Rajasthan - 342005</div>
              <div className="flex flex-wrap gap-4 mt-1"><span>Contact @ <a href="mailto:er.maheshchand.dd@gmail.com" className="text-[#C6A25A] hover:underline">er.maheshchand.dd@gmail.com</a></span><span>Mobile No - <a href="tel:+918769909700" className="text-[#C6A25A] hover:underline">8769909700</a></span></div>
            </div>
            <div className="text-[11px] text-white/30">© {new Date().getFullYear()} Arihant Anchal Society. All Rights Reserved.</div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-black/10 rounded-[28px] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center"><div className="font-bold text-[16px] text-black">🔐 {loginRole.toUpperCase()} Login</div><button onClick={()=>setShowLoginModal(false)} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-black">✕</button></div>
            <div className="mt-1 text-[11px] text-black/40">Registration compulsory — pehle register karo fir login</div>
            <div className="mt-6 space-y-3"><input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder={loginRole==='employee'? "Employee ID ex: EMP-01" : "Flat No ex: B-302"} className="w-full h-[52px] rounded-2xl bg-black/[0.04] border border-black/10 px-4 font-bold text-sm text-black outline-none focus:border-[#C6A25A]"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-[52px] rounded-2xl bg-black/[0.04] border border-black/10 px-4 font-bold text-sm text-black outline-none focus:border-[#C6A25A]"/><button onClick={handleLogin} disabled={loading} className="w-full h-[52px] rounded-full bg-[#122620] text-white font-black text-sm shadow-[0_8px_20px_rgba(18,38,32,0.25)]">{loading?'Checking...':'Login → Dashboard'}</button><button onClick={()=>go('/register')} className="w-full text-center text-[12px] text-black/50 hover:text-[#C6A25A]">No account? Register here (Compulsory)</button></div>
          </div>
        </div>
      )}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-md bg-white border-4 border-red-600 rounded-[28px] p-6 shadow-[0_0_50px_rgba(255,0,0,0.3)]"><div className="text-4xl text-center">🚨</div><h2 className="font-black text-2xl text-center text-red-600 mt-2">EMERGENCY ALERT</h2><div className="text-center mt-2 text-[11px] font-bold bg-red-600 text-white px-3 py-1 rounded-full inline-block">{emergencyAlert.emergency_type} • Gate-{emergencyAlert.gate_no}</div><div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-black text-sm">{emergencyAlert.message}</div><button onClick={()=>setEmergencyAlert(null)} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">OK</button></div></div>
      )}
    </div>
  )
}
