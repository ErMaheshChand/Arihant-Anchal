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

  useEffect(()=>{ const p=new URLSearchParams(window.location.search).get('flat'); if(p){ setFlatNo(p); setShowLoginModal(true) } },[])
  useEffect(()=>{ const ch=supabase.channel('emergency-home').on('postgres_changes',{event:'INSERT',schema:'public',table:'emergency_broadcasts'},payload=>{ const d=payload.new as any; if(d.target==='ALL'){ setEmergencyAlert(d); setTimeout(()=>setEmergencyAlert(null),30000)} }).subscribe(); return ()=>{supabase.removeChannel(ch)} },[])

  const go=(path:string)=>{ setShowResidentMenu(false); setShowLoginMenu(false); setShowGuardSub(false); window.location.href=path }

  const handleLogin=async()=>{
    if(!flatNo||!password) return alert('ID + Password bharo')
    setLoading(true)
    const {data:ok}=await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).eq('password',password).eq('status','approved').maybeSingle()
    if(ok){ localStorage.setItem('resident',JSON.stringify(ok)); window.location.href=ok.role==='admin'?'/admin':'/resident'; return }
    const {data:emp}=await supabase.from('employees').select('*').eq('employee_id',flatNo.toUpperCase()).eq('password',password).maybeSingle()
    if(emp){ localStorage.setItem('employee',JSON.stringify(emp)); window.location.href='/employee'; return }
    setLoading(false); alert('Login fail - approval check karo')
  }

  const facilities=[
    {icon:"🏊",title:"Swimming Pool",desc:"Olympic Pool with Kids Section",color:"from-cyan-50 to-blue-50 border-cyan-100"},
    {icon:"🏋",title:"Gymnasium",desc:"Modern Equipment & Trainer",color:"from-orange-50 to-red-50 border-orange-100"},
    {icon:"🏢",title:"Club House",desc:"Banquet Hall & Events",color:"from-amber-50 to-yellow-50 border-amber-100"},
    {icon:"🌳",title:"Garden Park",desc:"Green Park & Play Area",color:"from-green-50 to-emerald-50 border-green-100"},
    {icon:"🛡",title:"24/7 Security",desc:"5 Gate CCTV & Guard",color:"from-slate-50 to-gray-50 border-slate-200"},
    {icon:"🅿",title:"Parking",desc:"Covered Parking All Flats",color:"from-purple-50 to-pink-50 border-purple-100"},
  ]

  const circleImages=[{label:"Club",icon:"🏢"},{label:"Pool",icon:"🏊"},{label:"Garden",icon:"🌳"},{label:"Tower",icon:"🏘"},{label:"Gym",icon:"🏋"},{label:"Security",icon:"🛡"},{label:"Parking",icon:"🅿"},{label:"Play",icon:"🎠"}]

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#1A1A1A]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap');.font-serif{font-family:'Playfair Display',serif} @keyframes rotateCircle{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes counterRotate{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}.rotating-circle{animation:rotateCircle 40s linear infinite}.counter-rotate{animation:counterRotate 40s linear infinite}`}</style>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 h-">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-[#122620] flex items-center justify-center text-[#C6A25A] font-black">AA</div><div><div className="font-serif font-black text-">Arihant Anchal</div><div className="text- tracking-widest text-[#C6A25A] font-bold uppercase">Society & Club House</div></div></div>
          <div className="flex items-center gap-2">
            {/* NEW REGISTRATION - LITE COLOR 4 TABS */}
            <div className="relative">
              <button onClick={()=>{setShowResidentMenu(!showResidentMenu);setShowLoginMenu(false)}} className="px-4 h-9 rounded-full bg-white border border-black/10 text- font-bold">New Registration ▼</button>
              {showResidentMenu && (
                <div className="absolute top-11 right-0 w- bg-white border border-black/10 rounded- shadow-xl p-2 z-50">
                  <button onClick={()=>go('/resident/register')} className="w-full text-left px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm">🏠</div><span className="text- font-bold text-blue-900">Resident</span></button>
                  <button onClick={()=>go('/guard/register')} className="w-full mt-1.5 text-left px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-100 hover:bg-teal-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm">🛡</div><span className="text- font-bold text-teal-900">Guard</span></button>
                  <button onClick={()=>go('/employee/register')} className="w-full mt-1.5 text-left px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm">💼</div><span className="text- font-bold text-amber-900">Employee</span></button>
                  <button onClick={()=>go('/admin')} className="w-full mt-1.5 text-left px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm">⚙</div><span className="text- font-bold text-red-700">Admin</span></button>
                </div>
              )}
            </div>
            {/* LOGIN - LITE COLOR */}
            <div className="relative">
              <button onClick={()=>{setShowLoginMenu(!showLoginMenu);setShowResidentMenu(false)}} className="px-4 h-9 rounded-full bg-[#122620] text-white text- font-bold">Login ▼</button>
              {showLoginMenu && (
                <div className="absolute top-11 right-0 w- bg-white border border-black/10 rounded- shadow-xl p-2 z-50">
                  <button onClick={()=>{setShowLoginMenu(false);setLoginRole('resident');setShowLoginModal(true)}} className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">👤</div><span className="text- font-bold">Resident</span></button>
                  <button onClick={()=>{setLoginRole('employee');setShowLoginMenu(false);setShowLoginModal(true)}} className="w-full mt-1.5 text-left px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">💼</div><span className="text- font-bold text-amber-900">Employee</span></button>
                  <div className="relative mt-1.5"><button onClick={()=>setShowGuardSub(!showGuardSub)} className="w-full text-left px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-100 hover:bg-teal-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">🛡</div><span className="text- font-bold text-teal-900">Guard</span><span className="ml-auto text-">{showGuardSub?'▲':'▼'}</span></button>{showGuardSub && <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border grid grid-cols-3 gap-1.5">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>go(`/guard/login?gate=${n}`)} className="h-8 rounded-full bg-white border text- font-bold hover:bg-[#122620] hover:text-white">Gate {n}</button>)}</div>}</div>
                  <button onClick={()=>go('/admin')} className="w-full mt-1.5 text-left px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">⚙</div><span className="text- font-bold text-red-700">Admin</span></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="pt-10 pb-10 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 items-center">
          <div><div className="inline-flex px-3 py-1 rounded-full bg-[#122620] text-[#C6A25A] text- font-bold tracking-widest">JODHPUR PREMIUM LIVING</div><h1 className="mt-4 font-serif font-black text- md:text- leading-[0.9] text-[#122620]">Arihant Anchal<br/><span className="text-[#C6A25A] italic font-light text- md:text-">Society & Club House</span></h1><p className="mt-3 text- text-black/50 max-w-md leading-6">Resident, Guard, Employee, Admin — sab ek hi portal me. Auto-adjust mobile view.</p><div className="mt-5 flex gap-2"><button onClick={()=>go('/resident/register')} className="h-10 px-5 rounded-full bg-[#122620] text-white text-xs font-bold">New Registration →</button><button onClick={()=>{setLoginRole('resident');setShowLoginModal(true)}} className="h-10 px-5 rounded-full bg-white border text-xs font-bold">Login</button></div></div>
          <div className="relative flex items-center justify-center h- md:h-">
            <div className="absolute w- h- md:w- md:h- rounded-full border border-dashed border-[#C6A25A]/30"></div>
            <div className="absolute w- h- rounded-full bg-white shadow-lg border flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-[#122620] flex items-center justify-center text-xl">🏢</div><div className="font-serif font-black text-sm mt-2">Arihant Anchal</div></div></div>
            <div className="absolute w- h- md:w- md:h- rotating-circle">{circleImages.map((it,i)=>{const a=(i*360)/circleImages.length;return <div key={i} className="absolute top-1/2 left-1/2 w-14 h-14 -ml-7 -mt-7" style={{transform:`rotate(${a}deg) translate(150px) rotate(-${a}deg)`} as any}><div className="counter-rotate w-full h-full"><div className="w-14 h-14 rounded-xl bg-white border shadow flex flex-col items-center justify-center text-"><div className="text-lg">{it.icon}</div><div className="font-bold text-">{it.label}</div></div></div></div>})}</div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">{facilities.map((f,i)=><div key={i} className={`rounded- border p-4 bg-gradient-to-br ${f.color}`}><div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center">{f.icon}</div><div className="font-bold text- mt-3 truncate">{f.title}</div><div className="text- text-black/50 mt-1 leading-4 line-clamp-2">{f.desc}</div></div>)}</div></div>
      </section>

      <footer className="bg-[#122620] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-">
          <div className="text-white/70 text-center md:text-left leading-5"><span className="font-bold text-white">Designed by Er. Mahesh Chand</span> | B-2-304 Arihant Anchal, Jodhpur | <a href="mailto:er.maheshchand.dd@gmail.com" className="text-[#C6A25A]">er.maheshchand.dd@gmail.com</a> | <a href="tel:8769909700" className="text-[#C6A25A]">8769909700</a></div>
          <div className="text-white/30">© {new Date().getFullYear()} Arihant Anchal</div>
        </div>
      </footer>

      {showLoginModal && <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur flex items-center justify-center p-4"><div className="w-full max-w-sm bg-white rounded- p-6"><div className="flex justify-between"><div className="font-bold text-sm">🔐 {loginRole.toUpperCase()} Login</div><button onClick={()=>setShowLoginModal(false)} className="w-7 h-7 rounded-full bg-black/5">✕</button></div><div className="mt-4 space-y-2.5"><input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="ID / Flat No" className="w-full h-11 rounded-xl bg-black/5 border px-3 text-sm font-bold"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-11 rounded-xl bg-black/5 border px-3 text-sm"/><button onClick={handleLogin} disabled={loading} className="w-full h-11 rounded-full bg-[#122620] text-white font-bold text-sm">{loading?'Checking...':'Login'}</button></div></div></div>}
      {emergencyAlert && <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"><div className="w-full max-w-sm bg-white border-4 border-red-600 rounded- p-5"><div className="text-3xl text-center">🚨</div><h2 className="font-black text-xl text-center text-red-600">EMERGENCY</h2><div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-center">{emergencyAlert.message}</div><button onClick={()=>setEmergencyAlert(null)} className="mt-3 w-full h-10 bg-red-600 text-white rounded-full font-bold">OK</button></div></div>}
    </div>
  )
}
