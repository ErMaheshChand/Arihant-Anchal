'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({name:'', mobile:'', purpose:'Meeting'})

  useEffect(()=>{
    const saved = (localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302').toUpperCase()
    setFlatNo(saved)
  },[])

  useEffect(()=>{
    if(!flatNo) return
    const startDay = new Date(); startDay.setHours(0,0,0,0)
    const load = async()=>{
      setLoading(true)
      const {data:pend} = await supabase.from('visitors').select('*').eq('resident_flat',flatNo).eq('status','pending').order('entry_time',{ascending:false})
      const {data:today} = await supabase.from('visitors').select('*').eq('resident_flat',flatNo).gte('entry_time', startDay.toISOString()).order('entry_time',{ascending:false}).limit(20)
      if(pend) setPending(pend)
      if(today) setTodayVisitors(today)
      setLoading(false)
    }
    load()
    const ch = supabase.channel('res-'+flatNo).on('postgres_changes',{event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, (pl:any)=>{
      if(pl.eventType==='INSERT' && pl.new.status==='pending'){ setPending(p=>[pl.new,...p]); setTodayVisitors(t=>[pl.new,...t]) }
      if(pl.eventType==='UPDATE'){ setPending(p=>p.filter(v=>v.id!==pl.new.id)); setTodayVisitors(t=>t.map(v=>v.id===pl.new.id?pl.new:v)) }
    }).subscribe()
    return()=>{ supabase.removeChannel(ch) }
  },[flatNo])

  const action = async(id:string,status:'approved'|'rejected')=>{
    await supabase.from('visitors').update({status}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  const preApprove = async()=>{
    if(!form.name.trim()) return alert('Naam likho')
    const {data} = await supabase.from('visitors').insert({ name:form.name, mobile:form.mobile, purpose:form.purpose, resident_flat:flatNo, status:'pre-approved', entry_time:new Date().toISOString(), guard_id:'RESIDENT' }).select().single()
    if(data){ alert('QR Generate ho gaya! Guard ko notify kiya'); setForm({name:'',mobile:'',purpose:'Meeting'}); setTab('home') }
  }

  return (
    <div className="min-h- bg-[#F8FAFC] text-black flex flex-col">
      {/* TOP BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-4 h- flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full bg-[#0B1120] text-[#D4AF37] grid place-items-center font-bold text-">A</Link>
          <div className="leading-tight">
            <div className="font-bold text-">{flatNo} • Aarav Sharma</div>
            <div className="text- text-black/50">Owner • Tower {flatNo.split('-')[0]} • Intercom {flatNo.split('-')[1]}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative w-11 h-11 rounded-full bg-[#F1F5F9] grid place-items-center text-">🔔{pending.length>0 && <span className="absolute -top-1 -right-1 min-w- h-5 px-1 bg-red-500 text-white text- font-bold rounded-full grid place-items-center animate-pulse">{pending.length}</span>}</div>
        </div>
      </div>

      <div className="flex-1 w-full max-w- mx-auto px-4 pt-4 pb-">
        {loading? <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mx-auto"/><p className="text- opacity-60 mt-3">Loading visitors...</p></div> : tab==='home' && (
          <>
            {pending.length>0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2"><h3 className="text- font-bold">🔔 Approval Required</h3><span className="px-2.5 py-1 bg-red-500 text-white rounded-full text- font-bold animate-pulse">{pending.length} New</span></div>
                {pending.map(v=>(
                  <div key={v.id} className="p-4 bg-white rounded- border-2 border-[#D4AF37]/40 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded- bg-[#F1F5F9] grid place-items-center text-xl overflow-hidden shrink-0">{v.photo_url? <img src={v.photo_url} className="w-full h-full object-cover"/> : '👤'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text- truncate">{v.name} • {v.mobile}</div>
                        <div className="text- text-black/60 mt-0.5 truncate">🚗 {v.vehicle_no||'No Vehicle'} • {v.purpose}</div>
                        <div className="text- text-black/40 mt-1">Gate 1 • {new Date(v.entry_time).toLocaleTimeString()} • {v.guard_id}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button onClick={()=>action(v.id,'rejected')} className="h- rounded-full bg-[#F1F5F9] border border-black/10 text- font-bold active:scale-[0.98]">❌ Reject</button>
                      <button onClick={()=>action(v.id,'approved')} className="h- rounded-full bg-green-600 text-white text- font-bold shadow-md active:scale-[0.98]">✅ Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded- bg-[#0B1120] text-white p-5"><div className="text- tracking-widest opacity-60">MAINTENANCE DUE</div><div className="mt-1 flex gap-2 items-baseline"><span className="text- font-bold">₹2,450</span><span className="text- opacity-60">Due 10 Sep</span></div><div className="mt-4 grid grid-cols-2 gap-3"><button className="h- rounded-full bg-white text-black text- font-bold">Pay Now →</button><button className="h- rounded-full bg-white/10 text-white text-">History</button></div></div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              {[{ic:'👤',lb:'Add\nVisitor',id:'visitors'},{ic:'📦',lb:'Delivery',id:'visitors'},{ic:'🎭',lb:'Club\nBook',id:'book'},{ic:'🚗',lb:'My\nVehicles',id:'more'}].map(b=>(
                <button key={b.lb} onClick={()=>setTab(b.id as any)} className="flex flex-col items-center gap-2 active:scale-95"><div className="w- h- rounded- bg-white border border-black/5 shadow-sm grid place-items-center text-">{b.ic}</div><span className="text- leading-[1.1] whitespace-pre text-center">{b.lb}</span></button>
              ))}
            </div>

            <div className="mt-7"><div className="flex justify-between items-center"><h3 className="text- font-bold">Today at Anchal</h3><span className="text- px-2.5 py-1 rounded-full bg-[#DCFCE7] font-bold">Live • {todayVisitors.length}</span></div><div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">{todayVisitors.length===0? <span className="text- opacity-50 py-2">Koi visitor nahi</span> : todayVisitors.map((v:any)=><div key={v.id} className={`shrink-0 px-3.5 py-2 rounded-full text- font-medium ${v.status==='approved'?'bg-[#DCFCE7]':'bg-[#FEF9C3]'}`}>{v.name} {v.status==='approved'?'✓':'⏳'}</div>)}</div></div>

            <div className="mt-6 p-4 rounded- bg-white border border-black/5"><div className="text- font-bold">Society Notices</div><div className="mt-2 space-y-1.5 text-"><div>🔧 Lift B maintenance - 9 Sep 10am-2pm</div><div>🎉 Ganesh Utsav meeting - Clubhouse 8 PM</div></div></div>
          </>
        )}

        {tab==='visitors' && (
          <div><h2 className="text- font-bold">Pre-Approve Visitor</h2><div className="mt-4 p-4 rounded- bg-white border border-black/5 space-y-3"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Visitor Name *" className="w-full h- rounded- bg-[#F8FAFC] border border-black/10 px-4 text- outline-none focus:border-black"/><input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} inputMode="numeric" placeholder="Mobile Number" className="w-full h- rounded- bg-[#F8FAFC] border border-black/10 px-4 text-"/><button onClick={preApprove} className="w-full h- rounded-full bg-[#0B1120] text-white font-bold text- active:scale-[0.98]">Generate QR & Notify Guard →</button></div></div>
        )}

        {tab!=='home' && tab!=='visitors' && <div className="py-24 text-center text- opacity-40">{tab} tab - coming soon</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/5 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w- mx-auto grid grid-cols-5 gap-1 px-2 pt-2 pb-2">
          {[{id:'home',ic:'🏠',lb:'Home'},{id:'visitors',ic:'👤',lb:'Visitors'},{id:'book',ic:'🎭',lb:'Book'},{id:'bills',ic:'💳',lb:'Bills'},{id:'more',ic:'☰',lb:'More'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`h- rounded- flex flex-col items-center justify-center active:scale-95 ${tab===t.id?'bg-[#0B1120] text-white shadow-lg':'text-black/50'}`}><span className="text-">{t.ic}</span><span className="text- mt-1 font-medium">{t.lb}</span></button>
          ))}
        </div>
      </div>
      <style>{`.scrollbar-none::-webkit-scrollbar{display:none} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  )
}
