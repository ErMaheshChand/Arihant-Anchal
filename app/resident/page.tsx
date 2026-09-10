'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null) // ✅ andar

  useEffect(()=>{
    const saved = localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302'
    setFlatNo(saved.toUpperCase())
  },[])

  useEffect(()=>{
    const load = async () => {
      const { data: pend } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).eq('status','pending').order('entry_time',{ascending:false})
      if(pend) setPending(pend)
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: today } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).gte('entry_time', todayStr).order('entry_time',{ascending:false}).limit(20)
      if(today) setTodayVisitors(today)
    }
    load()

    const ch1 = supabase.channel('resident-'+flatNo)
   .on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, (payload)=>{
        if(payload.eventType==='INSERT' && payload.new.status==='pending'){
          setPending(p=>[payload.new,...p])
          setTodayVisitors(p=>[payload.new,...p])
        }
        if(payload.eventType==='UPDATE'){
          setPending(p=>p.filter(v=>v.id!==payload.new.id))
          setTodayVisitors(p=>p.map(v=>v.id===payload.new.id?payload.new:v))
        }
      }).subscribe()

    // ✅ EMERGENCY LISTENER - RESIDENT
    const ch2 = supabase.channel('emergency-resident')
   .on('postgres_changes', {event:'INSERT', schema:'public', table:'emergency_broadcasts'}, payload=>{
        const data = payload.new as any
        if(data.target === 'ALL'){
          setEmergencyAlert(data)
        }
      }).subscribe()

    return ()=>{ supabase.removeChannel(ch1); supabase.removeChannel(ch2) }
  },[flatNo])

  const handleAction = async (id:string, status:'approved'|'rejected'|'inside')=>{
    const finalStatus = status==='approved'? 'inside' : status
    await supabase.from('visitors').update({status: finalStatus}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      {/* ✅ EMERGENCY POPUP - RESIDENT */}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-red-600 rounded-3xl p-6 animate-pulse">
            <div className="text-4xl text-center">🚨</div>
            <h2 className="font-black text-2xl text-center text-red-600">EMERGENCY ALERT</h2>
            <div className="text-center mt-1"><span className="text- font-bold bg-red-600 text-white px-3 py-1 rounded-full">{emergencyAlert.emergency_type} • Gate-{emergencyAlert.gate_no} • {emergencyAlert.guard_id}</span></div>
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-black text-sm">{emergencyAlert.message}</div>
            <button onClick={()=>setEmergencyAlert(null)} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">OK - Samajh Gaya</button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">A</div>
          <div className="leading-tight">
            <div className="font-bold text-sm">{flatNo} • Aarav Sharma</div>
            <div className="text- text-slate-500">Owner • Tower {flatNo.split('-')[0]}</div>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">🔔{pending.length>0 && <span className="absolute w-5 h-5 bg-red-500 text-white text- rounded-full flex items-center justify-center">{pending.length}</span>}</div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        {tab==='home' && (
          <>
            {pending.length>0 && (
              <div className="mb-5 space-y-3">
                <div className="font-bold text-sm">🔔 Visitor Approval Required <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-">{pending.length} New</span></div>
                {pending.map(v=>(
                  <div key={v.id} className="p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-sm">
                    <div className="font-bold text-sm">{v.name || v.visitor_name} • {v.mobile}</div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button onClick={()=>handleAction(v.id,'rejected')} className="h-11 rounded-full bg-slate-100 font-bold text-sm">❌ Reject</button>
                      <button onClick={()=>handleAction(v.id,'approved')} className="h-11 rounded-full bg-emerald-600 text-white font-bold text-sm">✅ Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-3xl bg-slate-900 text-white p-5">Maintenance Due ₹2,450</div>
            <div className="mt-4 p-4 rounded-3xl bg-white border">Today {todayVisitors.length} visitors</div>
          </>
        )}
        {tab!=='home' && <div className="p-6 rounded-3xl bg-white border text-sm font-bold">{tab} tab</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-3xl">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">
          {[{id:'home',icon:'🏠',label:'Home'},{id:'visitors',icon:'👤',label:'Visitors'},{id:'book',icon:'🎭',label:'Book'},{id:'bills',icon:'💳',label:'Bills'},{id:'more',icon:'☰',label:'More'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`h-14 rounded-2xl flex flex-col items-center justify-center ${tab===t.id?'bg-slate-900 text-white':'text-slate-400'}`}><span>{t.icon}</span><span className="text-">{t.label}</span></button>
          ))}
        </div>
      </div>
    </div>
  )
}
