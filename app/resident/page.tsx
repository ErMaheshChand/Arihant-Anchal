'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])

  useEffect(()=>{
    const saved = localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302'
    setFlatNo(saved.toUpperCase())
  },[])

  useEffect(()=>{
    const load = async () => {
      // FIX: resident_flat OR flat_no dono se check
      const { data: pend } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).eq('status','pending').order('entry_time',{ascending:false})
      if(pend) setPending(pend)

      const todayStr = new Date().toISOString().split('T')[0]
      const { data: today } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).gte('entry_time', todayStr).order('entry_time',{ascending:false}).limit(20)
      if(today) setTodayVisitors(today)
    }
    load()

    const ch = supabase.channel('resident-'+flatNo)
    .on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, (payload)=>{
        if(payload.eventType==='INSERT' && payload.new.status==='pending'){
          setPending(p=>[payload.new,...p])
          setTodayVisitors(p=>[payload.new,...p])
        }
        if(payload.eventType==='UPDATE'){
          setPending(p=>p.filter(v=>v.id!==payload.new.id))
          setTodayVisitors(p=>p.map(v=>v.id===payload.new.id?payload.new:v))
        }
      })
    .on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`flat_no=eq.${flatNo}`}, (payload)=>{
        if(payload.eventType==='INSERT' && payload.new.status==='pending'){
          setPending(p=>p.find(x=>x.id===payload.new.id)?p:[payload.new,...p])
        }
      }).subscribe()

    return ()=>{ supabase.removeChannel(ch) }
  },[flatNo])

  const handleAction = async (id:string, status:'approved'|'rejected'|'inside')=>{
    // approved = inside for Guard/Admin compatibility
    const finalStatus = status==='approved'? 'inside' : status
    await supabase.from('visitors').update({status: finalStatus}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      {/* TOP BAR - ROUND */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">A</div>
          <div className="leading-tight">
            <div className="font-bold text-sm">{flatNo} • Aarav Sharma</div>
            <div className="text- text-slate-500">Owner • Tower {flatNo.split('-')[0]} • Intercom {flatNo.split('-')[1]}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setTab('home')} className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
            🔔
            {pending.length>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text- rounded-full flex items-center justify-center animate-pulse font-bold">{pending.length}</span>}
          </button>
          <button className="w-9 h-9 rounded-full bg-slate-100">👤</button>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">

        {tab==='home' && (
          <>
            {pending.length>0 && (
              <div className="mb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">🔔 Visitor Approval Required</span>
                  <span className="px-2.5 py-0.5 bg-red-500 text-white rounded-full text- animate-pulse font-bold">{pending.length} New</span>
                </div>
                {pending.map(v=>(
                  <div key={v.id} className="p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-sm">
                    <div className="flex gap-3">
                      {v.photo_url? <img src={v.photo_url} className="w-16 h-16 rounded-2xl object-cover" /> : <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">👤</div>}
                      <div className="flex-1">
                        <div className="font-bold text-sm">{v.name || v.visitor_name} • {v.mobile}</div>
                        <div className="text-xs text-slate-600 mt-0.5">🚗 {v.vehicle_no || 'No Vehicle'} • {v.purpose}</div>
                        <div className="text- text-slate-400 mt-1">Gate 1 • {new Date(v.entry_time || v.created_at).toLocaleTimeString()} • {v.guard_id}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      <button onClick={()=>handleAction(v.id,'rejected')} className="h-11 rounded-full bg-slate-100 border border-slate-200 text-sm font-bold">❌ Reject</button>
                      <button onClick={()=>handleAction(v.id,'approved')} className="h-11 rounded-full bg-emerald-600 text-white text-sm font-bold shadow">✅ Approve Entry</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BALANCE CARD - ROUND 3XL */}
            <div className="rounded-3xl bg-slate-900 text-white p-5 relative overflow-hidden shadow-sm">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-400/20" />
              <div className="text- tracking-widest opacity-60 font-bold">MAINTENANCE DUE</div>
              <div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-serif font-bold">₹2,450</span><span className="text-xs opacity-60">Due 10 Sep</span></div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 h-10 rounded-full bg-white text-black text-xs font-bold">Pay Now →</button>
                <button className="flex-1 h-10 rounded-full bg-white/10 text-white text-xs">History</button>
              </div>
            </div>

            {/* QUICK ACTIONS - LIGHT COLORS */}
            <div className="mt-5 grid grid-cols-4 gap-3">
              <button onClick={()=>setTab('visitors')} className="flex flex-col items-center gap-1.5"><div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm flex items-center justify-center text-xl">👤</div><span className="text- font-medium text-center leading-tight">Add Visitor</span></button>
              <button onClick={()=>setTab('visitors')} className="flex flex-col items-center gap-1.5"><div className="w-14 h-14 rounded-3xl bg-amber-50 border border-amber-100 shadow-sm flex items-center justify-center text-xl">📦</div><span className="text- font-medium">Delivery</span></button>
              <button onClick={()=>setTab('book')} className="flex flex-col items-center gap-1.5"><div className="w-14 h-14 rounded-3xl bg-violet-50 border border-violet-100 shadow-sm flex items-center justify-center text-xl">🎭</div><span className="text- font-medium">Club Book</span></button>
              <button onClick={()=>setTab('more')} className="flex flex-col items-center gap-1.5"><div className="w-14 h-14 rounded-3xl bg-cyan-50 border border-cyan-100 shadow-sm flex items-center justify-center text-xl">🚗</div><span className="text- font-medium">My Vehicles</span></button>
            </div>

            {/* TODAY - REAL + LIGHT */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">Today at Anchal</div>
                <div className="text- px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold">Live • {todayVisitors.length}</div>
              </div>
              <div className="mt-3 space-y-3">
                <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <div className="text-sm font-bold">Visitors Today • {todayVisitors.length}</div>
                  <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {todayVisitors.length===0? <div className="text-xs text-slate-400">Koi visitor nahi aaya aaj</div> :
                    todayVisitors.map((v:any)=>(
                      <div key={v.id} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border ${v.status==='inside' || v.status==='approved'?'bg-emerald-50 border-emerald-100 text-emerald-700': v.status==='pending'?'bg-amber-50 border-amber-100 text-amber-800':'bg-slate-50 border-slate-100'}`}>
                        {v.name || v.visitor_name} {v.status==='inside' || v.status==='approved'?'✓': v.status==='pending'?'⏳':'✕'} • {new Date(v.entry_time || v.created_at).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
              <div className="text-sm font-bold">Society Notices</div>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="p-2.5 rounded-2xl bg-slate-50">🔧 Lift B maintenance - 9 Sep 10am-2pm</div>
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100">🎉 Ganesh Utsav meeting - Clubhouse 8 PM</div>
              </div>
            </div>
          </>
        )}

        {tab==='visitors' && (
          <div>
            <h2 className="text-lg font-bold font-serif">Pre-Approve Visitor</h2>
            <div className="mt-5 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <input placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none focus:border-blue-200 focus:bg-blue-50/30" />
              <input placeholder="Mobile Number" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm" />
              <button className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm shadow">Generate QR & Notify Guard →</button>
            </div>
            <div className="mt-4 p-4 rounded-3xl bg-amber-50 border border-amber-100 text-xs text-amber-800">💡 Guard jab entry karega to aapko yaha approval notification ayega - Real-time ✅</div>
          </div>
        )}

        {tab==='bills' && <div className="p-6 rounded-3xl bg-white border text-sm font-bold">Bills tab - next step me banayenge</div>}
        {tab==='book' && <div className="p-6 rounded-3xl bg-white border text-sm font-bold">Book tab - next step</div>}
        {tab==='more' && <div className="p-6 rounded-3xl bg-white border text-sm">More tab - Flat: {flatNo}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">
          {[
            {id:'home', icon:'🏠', label:'Home'},
            {id:'visitors', icon:'👤', label:'Visitors'},
            {id:'book', icon:'🎭', label:'Book'},
            {id:'bills', icon:'💳', label:'Bills'},
            {id:'more', icon:'☰', label:'More'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`h-14 rounded-2xl flex flex-col items-center justify-center transition ${tab===t.id?'bg-slate-900 text-white shadow':'text-slate-400'}`}>
              <span>{t.icon}</span>
              <span className="text- mt-0.5 font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  )
}
