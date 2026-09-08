'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])

  // Flat No localStorage se lo
  useEffect(()=>{
    const saved = localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302'
    setFlatNo(saved.toUpperCase())
  },[])

  // Pending + Today visitors fetch + Realtime
  useEffect(()=>{
    const load = async () => {
      const { data: pend } = await supabase.from('visitors').select('*').eq('resident_flat', flatNo).eq('status','pending').order('entry_time',{ascending:false})
      if(pend) setPending(pend)

      const { data: today } = await supabase.from('visitors').select('*').eq('resident_flat', flatNo).gte('entry_time', new Date().toISOString().split('T')[0]).order('entry_time',{ascending:false}).limit(10)
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
      }).subscribe()

    return ()=>{ supabase.removeChannel(ch) }
  },[flatNo])

  const handleAction = async (id:string, status:'approved'|'rejected')=>{
    await supabase.from('visitors').update({status}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black flex flex-col">
      {/* TOP BAR */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0B1120] text-[#D4AF37] flex items-center justify-center font-bold">A</div>
          <div className="leading-tight">
            <div className="font-bold text-sm">{flatNo} • Aarav Sharma</div>
            <div className="text- text-black/50">Owner • Tower {flatNo.split('-')[0]} • Intercom {flatNo.split('-')[1]}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setTab('home')} className="relative w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            🔔
            {pending.length>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text- rounded-full flex items-center justify-center animate-pulse">{pending.length}</span>}
          </button>
          <button className="w-9 h-9 rounded-full bg-[#F1F5F9]">👤</button>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">

        {tab==='home' && (
          <>
            {/* 🔔 APPROVAL REQUIRED - REAL SUPABASE */}
            {pending.length>0 && (
              <div className="mb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">🔔 Visitor Approval Required</span>
                  <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text- animate-pulse">{pending.length} New</span>
                </div>
                {pending.map(v=>(
                  <div key={v.id} className="p-4 bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-md">
                    <div className="flex gap-3">
                      {v.photo_url? <img src={v.photo_url} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl">👤</div>}
                      <div className="flex-1">
                        <div className="font-bold text-sm">{v.name} • {v.mobile}</div>
                        <div className="text-xs text-black/60 mt-0.5">🚗 {v.vehicle_no || 'No Vehicle'} • {v.purpose}</div>
                        <div className="text- text-black/40 mt-1">Gate 1 • {new Date(v.entry_time).toLocaleTimeString()} • {v.guard_id}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button onClick={()=>handleAction(v.id,'rejected')} className="h-11 rounded-full bg-[#F1F5F9] border text-sm font-bold">❌ Reject</button>
                      <button onClick={()=>handleAction(v.id,'approved')} className="h-11 rounded-full bg-green-600 text-white text-sm font-bold">✅ Approve Entry</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BALANCE CARD */}
            <div className="rounded-2xl bg-[#0B1120] text-white p-5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#D4AF37]/20" />
              <div className="text- tracking-widest opacity-60">MAINTENANCE DUE</div>
              <div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-serif font-bold">₹2,450</span><span className="text-xs opacity-60">Due 10 Sep</span></div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 h-10 rounded-full bg-white text-black text-xs font-bold">Pay Now →</button>
                <button className="flex-1 h-10 rounded-full bg-white/10 text-white text-xs">History</button>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                {icon:'👤', label:'Add Visitor', id:'visitors'},
                {icon:'📦', label:'Delivery', id:'visitors'},
                {icon:'🎭', label:'Club Book', id:'book'},
                {icon:'🚗', label:'My Vehicles', id:'more'},
              ].map(a=>(
                <button key={a.label} onClick={()=>setTab(a.id as any)} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center text-xl">{a.icon}</div>
                  <span className="text- font-medium text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>

            {/* TODAY - REAL DATA */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">Today at Anchal</div>
                <div className="text- px-2 py-1 rounded-full bg-[#DCFCE7]">Live • {todayVisitors.length}</div>
              </div>
              <div className="mt-3 space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-black/5">
                  <div className="text-sm font-bold">Visitors Today • {todayVisitors.length}</div>
                  <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {todayVisitors.length===0? <div className="text-xs text-black/40">Koi visitor nahi aaya aaj</div> :
                    todayVisitors.map((v:any)=>(
                      <div key={v.id} className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${v.status==='approved'?'bg-[#DCFCE7]': v.status==='pending'?'bg-[#FEF9C3]':'bg-[#F1F5F9]'}`}>
                        {v.name} {v.status==='approved'?'✓': v.status==='pending'?'⏳':'✕'} • {new Date(v.entry_time).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white border border-black/5">
              <div className="text-sm font-bold">Society Notices</div>
              <div className="mt-3 space-y-2 text-xs">
                <div>🔧 Lift B maintenance - 9 Sep 10am-2pm</div>
                <div>🎉 Ganesh Utsav meeting - Clubhouse 8 PM</div>
              </div>
            </div>
          </>
        )}

        {tab==='visitors' && (
          <div>
            <h2 className="text-lg font-bold font-serif">Pre-Approve Visitor</h2>
            <div className="mt-5 p-4 rounded-2xl bg-white border border-black/5 space-y-3">
              <input placeholder="Visitor Name *" className="w-full h-12 rounded-xl bg-[#F8FAFC] border px-4 text-sm" />
              <input placeholder="Mobile Number" className="w-full h-12 rounded-xl bg-[#F8FAFC] border px-4 text-sm" />
              <button className="w-full h-12 rounded-full bg-[#0B1120] text-white font-bold text-sm">Generate QR & Notify Guard →</button>
            </div>
          </div>
        )}

        {tab==='bills' && <div className="text-sm font-bold">Bills tab - same as before</div>}
        {tab==='book' && <div className="text-sm font-bold">Book tab - same as before</div>}
        {tab==='more' && <div className="text-sm">More tab</div>}
      </div>

      {/* BOTTOM TAB */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-black/5">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">
          {[
            {id:'home', icon:'🏠', label:'Home'},
            {id:'visitors', icon:'👤', label:'Visitors'},
            {id:'book', icon:'🎭', label:'Book'},
            {id:'bills', icon:'💳', label:'Bills'},
            {id:'more', icon:'☰', label:'More'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`h-14 rounded-xl flex flex-col items-center justify-center transition ${tab===t.id?'bg-[#0B1120] text-white':'text-black/50'}`}>
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
