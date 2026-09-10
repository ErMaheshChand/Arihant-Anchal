 'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])
  const [allVisitors, setAllVisitors] = useState<any[]>([]) // history
  const [searchDate, setSearchDate] = useState('') // date filter
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [vName, setVName] = useState('')
  const [vMobile, setVMobile] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const beepInterval = useRef<any>(null)

  useEffect(()=>{
    const saved = localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302'
    setFlatNo(saved.toUpperCase())
    if(localStorage.getItem('sound_enabled')==='1') setSoundEnabled(true)
    if("Notification" in window && Notification.permission==="default") Notification.requestPermission()
  },[])

  const enableSound = async ()=>{
    try{ await audioRef.current?.play(); audioRef.current?.pause(); if(audioRef.current) audioRef.current.currentTime=0 }catch{}
    localStorage.setItem('sound_enabled','1'); setSoundEnabled(true)
  }

  const startBeep = ()=>{
    if(beepInterval.current) clearInterval(beepInterval.current)
    let c=0
    beepInterval.current = setInterval(()=>{
      c++; if(c>10){ clearInterval(beepInterval.current); return }
      try{ const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); const o=ctx.createOscillator(); o.frequency.value=c%2?900:600; o.type='square'; o.connect(ctx.destination); o.start(); setTimeout(()=>o.stop(),250) }catch{}
      if("vibrate" in navigator) navigator.vibrate(300)
      audioRef.current?.play().catch(()=>{})
    },450)
  }

  // Load + History
  const loadVisitors = async (dateFilter?:string)=>{
    const { data: pend } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).eq('status','pending').order('entry_time',{ascending:false})
    if(pend) setPending(pend)

    const todayStr = new Date().toISOString().split('T')[0]
    const { data: today } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).gte('entry_time', todayStr).order('entry_time',{ascending:false}).limit(20)
    if(today) setTodayVisitors(today)

    if(dateFilter){
      const { data } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).gte('entry_time', dateFilter).lt('entry_time', dateFilter+'T23:59:59').order('entry_time',{ascending:false})
      if(data) setAllVisitors(data)
    }else{
      const { data } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).order('entry_time',{ascending:false}).limit(50)
      if(data) setAllVisitors(data)
    }
  }

  useEffect(()=>{
    loadVisitors(searchDate || undefined)

    const ch = supabase.channel('resident-'+flatNo)
.on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, (payload)=>{
        if(payload.eventType==='INSERT' && payload.new.status==='pending'){
          setPending(p=>[payload.new,...p]); setTodayVisitors(p=>[payload.new,...p]); setAllVisitors(p=>[payload.new,...p])
        }
        if(payload.eventType==='UPDATE'){
          setPending(p=>p.filter(v=>v.id!==payload.new.id))
          setTodayVisitors(p=>p.map(v=>v.id===payload.new.id?payload.new:v))
          setAllVisitors(p=>p.map(v=>v.id===payload.new.id?payload.new:v))
        }
      }).subscribe()

    const ch2 = supabase.channel('emergency-resident')
.on('postgres_changes', {event:'INSERT', schema:'public', table:'emergency_broadcasts'}, payload=>{
        const data = payload.new as any
        if(data.target === 'ALL'){ setEmergencyAlert(data); startBeep() }
      }).subscribe()

    return ()=>{ supabase.removeChannel(ch); supabase.removeChannel(ch2); if(beepInterval.current) clearInterval(beepInterval.current) }
  },[flatNo])

  useEffect(()=>{ if(flatNo) loadVisitors(searchDate || undefined) },[searchDate])

  const handleAction = async (id:string, status:'approved'|'rejected'|'inside')=>{
    const finalStatus = status==='approved'? 'inside' : status
    await supabase.from('visitors').update({status: finalStatus}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  const handlePreApprove = async ()=>{
    if(!vName.trim()){ alert('Naam likho bhai'); return }
    const { error } = await supabase.from('visitors').insert({
      visitor_name: vName, name: vName, mobile: vMobile,
      flat_no: flatNo, resident_flat: flatNo,
      status: 'pre_approved', purpose: 'Pre-approved by resident', guard_id: 'RESIDENT-APP'
    })
    if(!error){ alert('✅ Pre-approved ho gaya'); setVName(''); setVMobile(''); loadVisitors(searchDate||undefined) }
    else alert(error.message)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col" onClick={()=>{ if(!soundEnabled) enableSound() }}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3" preload="auto" />
      {!soundEnabled && (
        <div className="sticky top-0 z-[100] bg-amber-400 text-black px-4 py-2 text-xs font-bold flex justify-between items-center">
          <span>🔊 Tap to Enable Sound</span><button onClick={enableSound} className="px-3 py-1 bg-black text-white rounded-full text-xs">Enable 🔊</button>
        </div>
      )}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-red-600 rounded-3xl p-6 animate-pulse">
            <div className="text-4xl text-center">🚨</div><h2 className="font-black text-2xl text-center text-red-600">EMERGENCY ALERT</h2>
            <div className="text-center mt-1 text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full inline-block">{emergencyAlert.emergency_type} • {emergencyAlert.guard_id}</div>
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-sm">{emergencyAlert.message}</div>
            <button onClick={()=>{ if(beepInterval.current) clearInterval(beepInterval.current); audioRef.current?.pause(); setEmergencyAlert(null) }} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">Stop Sound & OK</button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">A</div><div className="leading-tight"><div className="font-bold text-sm">{flatNo} • Aarav Sharma</div><div className="text- text-slate-500">Owner • Tower {flatNo.split('-')[0]}</div></div></div>
        <button onClick={()=>setTab('home')} className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">🔔{pending.length>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text- rounded-full flex items-center justify-center animate-pulse font-bold">{pending.length}</span>}</button>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        {tab==='home' && (
          <>
            {pending.length>0 && (
              <div className="mb-5 space-y-3">
                <div className="flex items-center gap-2"><span className="text-sm font-bold">🔔 Pending Approval</span><span className="px-2.5 py-0.5 bg-red-500 text-white rounded-full text- animate-pulse font-bold">{pending.length} New</span></div>
                {pending.map(v=>(
                  <div key={v.id} className="p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-sm">
                    <div className="flex gap-3">
                      {v.photo_url? <img src={v.photo_url} className="w-16 h-16 rounded-2xl object-cover" /> : <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">👤</div>}
                      <div className="flex-1"><div className="font-bold text-sm">{v.name || v.visitor_name} • {v.mobile}</div><div className="text-xs text-slate-600 mt-0.5">🚗 {v.vehicle_no || 'No Vehicle'} • {v.purpose}</div><div className="text- text-slate-400 mt-1">Status: {v.status} • {new Date(v.entry_time || v.created_at).toLocaleTimeString()}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      <button onClick={()=>handleAction(v.id,'rejected')} className="h-11 rounded-full bg-slate-100 border text-sm font-bold">❌ Reject</button>
                      <button onClick={()=>handleAction(v.id,'approved')} className="h-11 rounded-full bg-emerald-600 text-white text-sm font-bold">✅ Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-3xl bg-slate-900 text-white p-5"><div className="text- tracking-widest opacity-60 font-bold">MAINTENANCE DUE</div><div className="mt-1 text-2xl font-bold">₹2,450</div></div>
          </>
        )}

        {tab==='visitors' && (
          <div>
            <h2 className="text-lg font-bold font-serif">Pre-Approve Visitor</h2>
            <div className="mt-3 p-5 rounded-3xl bg-white border shadow-sm space-y-3">
              <input value={vName} onChange={e=>setVName(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm" />
              <input value={vMobile} onChange={e=>setVMobile(e.target.value)} placeholder="Mobile Number" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm" />
              <button onClick={handlePreApprove} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">Add Pre-Approved →</button>
            </div>

            {/* DATE SEARCH */}
            <div className="mt-6 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold">Visitor History</h3>
              <input type="date" value={searchDate} onChange={e=>setSearchDate(e.target.value)} className="h-9 px-3 rounded-full bg-white border text-xs font-bold" />
            </div>
            {searchDate && <button onClick={()=>setSearchDate('')} className="mt-2 text-xs px-3 py-1 bg-slate-100 rounded-full">Clear filter ✕ {searchDate}</button>}

            <div className="mt-3 space-y-2">
              {allVisitors.length===0? <div className="p-6 rounded-3xl bg-white border text-xs text-slate-400 text-center">Koi record nahi mila</div> :
              allVisitors.map((v:any)=>(
                <div key={v.id} className="p-3.5 rounded-2xl bg-white border flex justify-between items-center">
                  <div><div className="font-bold text-sm">{v.name || v.visitor_name} <span className="text-xs text-slate-400">• {v.mobile}</span></div><div className="text- text-slate-500">{new Date(v.entry_time || v.created_at).toLocaleString()} • Gate {v.gate_no||'1'}</div></div>
                  <div className={`px-3 py-1 rounded-full text- font-black border ${v.status==='inside' || v.status==='approved'?'bg-emerald-50 border-emerald-200 text-emerald-700': v.status==='pending'?'bg-amber-50 border-amber-200 text-amber-700': v.status==='pre_approved'?'bg-blue-50 border-blue-200 text-blue-700': v.status==='rejected'?'bg-red-50 border-red-200 text-red-700':'bg-slate-50'}`}>{v.status.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='bills' && <div className="p-6 rounded-3xl bg-white border text-sm font-bold">Bills tab - next step</div>}
        {tab==='book' && <div className="p-6 rounded-3xl bg-white border text-sm font-bold">Book tab - next step</div>}
        {tab==='more' && <div className="p-6 rounded-3xl bg-white border text-sm">More tab - Flat: {flatNo}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t rounded-t-3xl">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">
          {[{id:'home',icon:'🏠',label:'Home'},{id:'visitors',icon:'👤',label:'Visitors'},{id:'book',icon:'🎭',label:'Book'},{id:'bills',icon:'💳',label:'Bills'},{id:'more',icon:'☰',label:'More'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`h-14 rounded-2xl flex flex-col items-center justify-center ${tab===t.id?'bg-slate-900 text-white':'text-slate-400'}`}><span>{t.icon}</span><span className="text- mt-0.5">{t.label}</span></button>
          ))}
        </div>
      </div>
    </div>
  )
}
