'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [flatNo, setFlatNo] = useState('')
  const [password, setPassword] = useState('')
  const [showReg, setShowReg] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showGuardSub, setShowGuardSub] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [role, setRole] = useState('resident')
  const [loading, setLoading] = useState(false)
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null)

  // QR / flat param auto login
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search).get('flat')
    if(p){ setFlatNo(p); setShowModal(true) }
  },[])

  // ===== ALERT WALI LINE - JARURI =====
  useEffect(()=>{
    const ch = supabase.channel('emergency-home')
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'emergency_broadcasts'},payload=>{
      const d = payload.new as any
      if(d.target==='ALL' || d.target==='all'){
        setEmergencyAlert(d)
        setTimeout(()=>setEmergencyAlert(null), 30000)
      }
    }).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  },[])

  const go = (p:string)=>{ setShowReg(false); setShowLogin(false); window.location.href=p }

  const handleLogin = async()=>{
    if(!flatNo||!password) return alert('ID + Password bharo')
    setLoading(true)
    const {data:ok}=await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).eq('password',password).eq('status','approved').maybeSingle()
    if(ok){ localStorage.setItem('resident',JSON.stringify(ok)); window.location.href=ok.role==='admin'?'/admin':'/resident'; return }
    const {data:emp}=await supabase.from('employees').select('*').eq('employee_id',flatNo.toUpperCase()).eq('password',password).maybeSingle()
    if(emp){ localStorage.setItem('employee',JSON.stringify(emp)); window.location.href='/employee'; return }
    setLoading(false)
    const {data:anyData}=await supabase.from('residents').select('*').eq('flat_no',flatNo.toUpperCase()).maybeSingle()
    if(!anyData) alert('❌ Registration nahi mila')
    else if(anyData.password!==password) alert('❌ Password galat')
    else if(anyData.status==='pending') alert(`⏳ Flat ${flatNo} approval pending hai`)
    else alert('Login fail')
  }

  const quick = [
    {icon:"🏢",label:"Club House",bg:"bg-amber-50 border-amber-100"},
    {icon:"🏊",label:"Pool",bg:"bg-cyan-50 border-cyan-100"},
    {icon:"🌳",label:"Garden",bg:"bg-green-50 border-green-100"},
    {icon:"🏘",label:"Tower",bg:"bg-slate-50 border-slate-200"},
    {icon:"🏋",label:"Gym",bg:"bg-orange-50 border-orange-100"},
    {icon:"🛡",label:"Security",bg:"bg-teal-50 border-teal-100"},
    {icon:"🅿",label:"Parking",bg:"bg-purple-50 border-purple-100"},
    {icon:"🎠",label:"Play Area",bg:"bg-pink-50 border-pink-100"},
  ]

  const facilities=[
    {icon:"🏊",title:"Swimming Pool",desc:"Olympic Pool with Kids Section"},
    {icon:"🏋",title:"Gymnasium",desc:"Modern Equipment & Trainer"},
    {icon:"🏢",title:"Club House",desc:"Banquet Hall & Events"},
    {icon:"🌳",label:"Garden Park",icon2:"🌳",title:"Garden Park",desc:"Green Park & Play Area"},
    {icon:"🛡",title:"24/7 Security",desc:"5 Gate CCTV & Guard"},
    {icon:"🅿",title:"Parking",desc:"Covered Parking"},
  ]

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#1A1A1A] max-w-md mx-auto md:max-w-7xl">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
        <div className="px-3 h- flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#122620] flex items-center justify-center text-[#C6A25A] font-black text-sm">AA</div>
            <div className="leading-tight min-w-0">
              <div className="font-black text- truncate">Arihant Anchal</div>
              <div className="text- tracking-[0.2em] text-[#C6A25A] font-bold uppercase">Society & Club House</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <button onClick={()=>{setShowReg(!showReg);setShowLogin(false)}} className="px-3 h-9 rounded-full bg-white border border-black/10 text- font-bold whitespace-nowrap">New Registration ▾</button>
              {showReg && (
                <div className="absolute top-11 right-0 w- bg-white border rounded-2xl shadow-xl p-1.5 z-50">
                  <button onClick={()=>go('/resident/register')} className="w-full px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2.5"><span>🏠</span><span className="text- font-bold text-blue-900">Resident</span></button>
                  <button onClick={()=>go('/guard/register')} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-100 flex items-center gap-2.5"><span>🛡</span><span className="text- font-bold text-teal-900">Guard</span></button>
                  <button onClick={()=>go('/employee/register')} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2.5"><span>💼</span><span className="text- font-bold text-amber-900">Employee</span></button>
                  <button onClick={()=>go('/admin')} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5"><span>⚙</span><span className="text- font-bold text-red-700">Admin</span></button>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={()=>{setShowLogin(!showLogin);setShowReg(false)}} className="px-4 h-9 rounded-full bg-[#122620] text-white text- font-bold whitespace-nowrap">Login ▾</button>
              {showLogin && (
                <div className="absolute top-11 right-0 w- bg-white border rounded-2xl shadow-xl p-1.5 z-50">
                  <button onClick={()=>{setShowLogin(false);setRole('resident');setShowModal(true)}} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border flex items-center gap-2.5"><span>👤</span><span className="text- font-bold">Resident</span></button>
                  <button onClick={()=>{setRole('employee');setShowLogin(false);setShowModal(true)}} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2.5"><span>💼</span><span className="text- font-bold">Employee</span></button>
                  <button onClick={()=>setShowGuardSub(!showGuardSub)} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-100 flex items-center gap-2.5"><span>🛡</span><span className="text- font-bold">Guard</span><span className="ml-auto text-">{showGuardSub?'▲':'▼'}</span></button>
                  {showGuardSub && <div className="grid grid-cols-3 gap-1 mt-1 p-1">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>go(`/guard/login?gate=${n}`)} className="h-8 rounded-full bg-white border text- font-bold">G{n}</button>)}</div>}
                  <button onClick={()=>go('/admin')} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5"><span>⚙</span><span className="text- font-bold text-red-700">Admin</span></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 pt-6 pb-4">
        <div className="bg-[#122620] rounded- p-5 text-white relative overflow-hidden">
          <div className="text- tracking-[0.25em] text-[#C6A25A] font-bold">JODHPUR PREMIUM LIVING</div>
          <h1 className="mt-2 text- font-black leading-tight">Arihant Anchal<br/><span className="text-[#C6A25A] font-light italic text-">Society & Club House</span></h1>
          <p className="mt-2 text- text-white/60 leading-5">Resident, Guard, Employee, Admin — sab ek hi app me</p>
          <div className="mt-4 flex gap-2">
            <button onClick={()=>go('/resident/register')} className="flex-1 h-11 rounded-full bg-[#C6A25A] text-black text- font-black">New Registration →</button>
            <button onClick={()=>{setRole('resident');setShowModal(true)}} className="flex-1 h-11 rounded-full bg-white/10 border border-white/20 text- font-bold">Login</button>
          </div>
        </div>
      </section>

      <section className="px-4 py-2">
        <div className="text- font-bold tracking-widest text-black/40 uppercase mb-2">Facilities</div>
        <div className="grid grid-cols-4 gap-2">
          {quick.map((q,i)=>(
            <div key={i} className={`rounded-2xl border ${q.bg} p-2.5 flex flex-col items-center justify-center aspect-square`}>
              <div className="text-">{q.icon}</div>
              <div className="text- font-bold mt-1 text-center leading-tight">{q.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#122620] mt-4">
        <div className="px-4 py-4 text-center">
          <div className="text- font-bold text-white">Designed by Er. Mahesh Chand</div>
          <div className="text- text-white/50 mt-1">B-2-304 Arihant Anchal, Jodhpur | er.maheshchand.dd@gmail.com | 8769909700</div>
          <div className="text- text-white/25 mt-2">© {new Date().getFullYear()} Arihant Anchal</div>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end md:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t- md:rounded- p-5 pb-8">
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-4"/>
            <div className="flex justify-between items-center"><div className="font-bold text-">🔐 {role.toUpperCase()} Login</div><button onClick={()=>setShowModal(false)} className="w-8 h-8 rounded-full bg-black/5">✕</button></div>
            <div className="mt-4 space-y-2.5">
              <input value={flatNo} onChange={e=>setFlatNo(e.target.value.toUpperCase())} placeholder="ID / Flat No" className="w-full h-12 rounded-2xl bg-black/5 border-0 px-4 text-sm font-bold"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-2xl bg-black/5 border-0 px-4 text-sm"/>
              <button onClick={handleLogin} disabled={loading} className="w-full h-12 rounded-full bg-[#122620] text-white font-bold text-sm">{loading?'Checking...':'Login →'}</button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY ALERT - JARURI WALI LINE */}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border-4 border-red-600 rounded- p-5 shadow-[0_0_50px_rgba(255,0,0,0.3)]">
            <div className="text-3xl text-center">🚨</div>
            <h2 className="font-black text-xl text-center text-red-600 mt-1">EMERGENCY ALERT</h2>
            <div className="text-center mt-2"><span className="text- font-bold bg-red-600 text-white px-3 py-1 rounded-full">{emergencyAlert.emergency_type} • Gate-{emergencyAlert.gate_no}</span></div>
            <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl font-bold text-center text-black text-sm">{emergencyAlert.message}</div>
            <button onClick={()=>setEmergencyAlert(null)} className="mt-3 w-full h-11 bg-red-600 text-white rounded-full font-black text-sm">OK - I Understand</button>
          </div>
        </div>
      )}
    </div>
  )
}
