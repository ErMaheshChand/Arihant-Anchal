  'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])
  const [allVisitors, setAllVisitors] = useState<any[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [billFrom, setBillFrom] = useState('')
  const [billTo, setBillTo] = useState('')
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [vName, setVName] = useState('')
  const [vMobile, setVMobile] = useState('')
  const [bills, setBills] = useState<any[]>([])
  const [payingId, setPayingId] = useState<string|null>(null)
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

  const loadVisitors = async ()=>{
    const { data: pend } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).eq('status','pending').order('entry_time',{ascending:false})
    if(pend) setPending(pend)
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: today } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).gte('entry_time', todayStr).order('entry_time',{ascending:false}).limit(20)
    if(today) setTodayVisitors(today)

    let q = supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).order('entry_time',{ascending:false}).limit(100)
    if(fromDate) q = q.gte('entry_time', fromDate)
    if(toDate) q = q.lte('entry_time', toDate+'T23:59:59')
    const { data } = await q
    if(data) setAllVisitors(data)
  }

  const loadBills = async ()=>{
    let q = supabase.from('bills').select('*').eq('flat_no', flatNo).order('due_date',{ascending:false})
    if(billFrom) q = q.gte('due_date', billFrom)
    if(billTo) q = q.lte('due_date', billTo)
    const { data } = await q
    if(data) setBills(data)
  }

  useEffect(()=>{
    if(!flatNo) return
    loadVisitors(); loadBills()
    const ch = supabase.channel('resident-'+flatNo).on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, (payload)=>{
        if(payload.eventType==='INSERT' && payload.new.status==='pending'){ setPending(p=>[payload.new,...p]) }
        loadVisitors()
      }).subscribe()
    const ch2 = supabase.channel('emergency-resident').on('postgres_changes', {event:'INSERT', schema:'public', table:'emergency_broadcasts'}, payload=>{ const data = payload.new as any; if(data.target === 'ALL'){ setEmergencyAlert(data); startBeep() } }).subscribe()
    const ch3 = supabase.channel('bills-'+flatNo).on('postgres_changes',{event:'*', schema:'public', table:'bills', filter:`flat_no=eq.${flatNo}`},()=>loadBills()).subscribe()
    return ()=>{ supabase.removeChannel(ch); supabase.removeChannel(ch2); supabase.removeChannel(ch3); if(beepInterval.current) clearInterval(beepInterval.current) }
  },[flatNo])

  useEffect(()=>{ if(flatNo) loadVisitors() },[fromDate,toDate])
  useEffect(()=>{ if(flatNo) loadBills() },[billFrom,billTo])

  const handleAction = async (id:string, status:'approved'|'rejected'|'inside')=>{
    const finalStatus = status==='approved'? 'inside' : status
    await supabase.from('visitors').update({status: finalStatus}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }
  const handlePreApprove = async ()=>{
    if(!vName.trim()){ alert('Naam likho bhai'); return }
    const { error } = await supabase.from('visitors').insert({ visitor_name: vName, name: vName, mobile: vMobile, flat_no: flatNo, resident_flat: flatNo, status: 'pre_approved', purpose: 'Pre-approved by resident', guard_id: 'RESIDENT-APP' })
    if(!error){ alert('✅ Pre-approved ho gaya'); setVName(''); setVMobile(''); loadVisitors() } else alert(error.message)
  }
  const handlePay = async (bill:any)=>{
    setPayingId(bill.id)
    const upiId = 'society@upi'
    const upiLink = `upi://pay?pa=${upiId}&pn=AnchalSociety&am=${bill.amount}&cu=INR&tn=${encodeURIComponent(bill.title+' '+flatNo)}`
    window.location.href = upiLink
    setTimeout(async()=>{
      const ok = confirm(`₹${bill.amount} ka payment kiya kya? OK karo to Paid mark kar dunga`)
      if(ok){ await supabase.from('bills').update({status:'paid', paid_at: new Date().toISOString(), pay_mode:'UPI'}).eq('id',bill.id); loadBills() }
      setPayingId(null)
    },2500)
  }

  const pendingBills = bills.filter(b=>b.status==='pending')
  const monthlyDue = pendingBills.filter(b=>b.type==='monthly').reduce((s,b)=>s+Number(b.amount),0)
  const oldDue = pendingBills.filter(b=>b.type==='old_due').reduce((s,b)=>s+Number(b.amount),0)
  const otherDue = pendingBills.filter(b=>b.type==='other').reduce((s,b)=>s+Number(b.amount),0)
  const totalDue = pendingBills.reduce((s,b)=>s+Number(b.amount),0)

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col" onClick={()=>{ if(!soundEnabled) enableSound() }}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3" preload="auto" />
      {!soundEnabled && (<div className="sticky top-0 z-[100] bg-amber-400 text-black px-4 py-2 text-xs font-bold flex justify-between items-center"><span>🔊 Tap to Enable Sound</span><button onClick={enableSound} className="px-3 py-1 bg-black text-white rounded-full text-xs">Enable 🔊</button></div>)}
      {emergencyAlert && (<div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white border-4 border-red-600 rounded-3xl p-6 animate-pulse"><div className="text-4xl text-center">🚨</div><h2 className="font-black text-2xl text-center text-red-600">EMERGENCY ALERT</h2><div className="text-center mt-1 text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full inline-block">{emergencyAlert.emergency_type} • {emergencyAlert.guard_id}</div><div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-sm">{emergencyAlert.message}</div><button onClick={()=>{ if(beepInterval.current) clearInterval(beepInterval.current); audioRef.current?.pause(); setEmergencyAlert(null) }} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">Stop Sound & OK</button></div></div>)}

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">A</div><div className="leading-tight"><div className="font-bold text-sm">{flatNo} • Aarav Sharma</div><div className="text- text-slate-500">Owner • Tower {flatNo.split('-')[0]}</div></div></div>
        <button onClick={()=>setTab('home')} className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">🔔{pending.length>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text- rounded-full flex items-center justify-center animate-pulse font-bold">{pending.length}</span>}</button>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        {tab==='visitors' && (
          <div>
            <h2 className="text-lg font-bold font-serif">Pre-Approve Visitor</h2>
            <div className="mt-3 p-5 rounded-3xl bg-white border shadow-sm space-y-3">
              <input value={vName} onChange={e=>setVName(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm" />
              <input value={vMobile} onChange={e=>setVMobile(e.target.value)} placeholder="Mobile Number" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm" />
              <button onClick={handlePreApprove} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">Add Pre-Approved →</button>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Visitor History</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{allVisitors.length} records</span></div>
              <div className="mt-3 p-3 rounded-2xl bg-white border flex gap-2">
                <div className="flex-1"><div className="text- font-bold text-slate-500">From Date</div><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="w-full h-9 rounded-xl bg-slate-50 border px-2 text-xs font-bold" /></div>
                <div className="flex-1"><div className="text- font-bold text-slate-500">To Date</div><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="w-full h-9 rounded-xl bg-slate-50 border px-2 text-xs font-bold" /></div>
                {(fromDate||toDate) && <button onClick={()=>{setFromDate(''); setToDate('')}} className="self-end h-9 px-3 rounded-xl bg-black text-white text-xs">Clear</button>}
              </div>
              <div className="mt-3 space-y-2 max-h- overflow-y-auto">{allVisitors.map((v:any)=>(<div key={v.id} className="p-3.5 rounded-2xl bg-white border flex justify-between items-center"><div><div className="font-bold text-sm">{v.name || v.visitor_name}</div><div className="text- text-slate-500">{new Date(v.entry_time || v.created_at).toLocaleString()}</div></div><div className="text- font-black px-2 py-1 rounded-full bg-slate-100">{v.status.toUpperCase()}</div></div>))}</div>
            </div>
          </div>
        )}

        {tab==='bills' && (
          <div>
            <h2 className="text-lg font-bold font-serif">Bills & Maintenance</h2>
            <div className="mt-3 rounded-3xl bg-slate-900 text-white p-5"><div className="text- tracking-widest opacity-60 font-bold">TOTAL PENDING DUE</div><div className="mt-1 text-3xl font-bold">₹{totalDue}</div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div className="p-2.5 rounded-2xl bg-white/10"><div className="opacity-60">Monthly</div><div className="font-bold">₹{monthlyDue}</div></div><div className="p-2.5 rounded-2xl bg-white/10"><div className="opacity-60">Old Due</div><div className="font-bold">₹{oldDue}</div></div><div className="p-2.5 rounded-2xl bg-white/10"><div className="opacity-60">Other</div><div className="font-bold">₹{otherDue}</div></div></div></div>

            <div className="mt-5 p-3 rounded-2xl bg-white border flex gap-2">
              <div className="flex-1"><div className="text- font-bold text-slate-500">From Date</div><input type="date" value={billFrom} onChange={e=>setBillFrom(e.target.value)} className="w-full h-9 rounded-xl bg-slate-50 border px-2 text-xs font-bold" /></div>
              <div className="flex-1"><div className="text- font-bold text-slate-500">To Date</div><input type="date" value={billTo} onChange={e=>setBillTo(e.target.value)} className="w-full h-9 rounded-xl bg-slate-50 border px-2 text-xs font-bold" /></div>
              {(billFrom||billTo) && <button onClick={()=>{setBillFrom(''); setBillTo('')}} className="self-end h-9 px-3 rounded-xl bg-black text-white text-xs">Clear</button>}
            </div>

            <div className="mt-4 space-y-2">{pendingBills.map(b=>(<div key={b.id} className="p-4 rounded-2xl bg-white border flex justify-between items-center"><div><div className="font-bold text-sm">{b.title}</div><div className="text- text-slate-500">Due: {b.due_date} • {b.type}</div></div><div className="text-right"><div className="font-black text-sm">₹{b.amount}</div><button disabled={payingId===b.id} onClick={()=>handlePay(b)} className="mt-1 px-4 py-1.5 rounded-full bg-emerald-600 text-white text- font-bold">{payingId===b.id?'...':'Pay UPI'}</button></div></div>))}</div>

            <div className="mt-6"><div className="text-sm font-bold">Payment History</div><div className="mt-3 rounded-3xl bg-white border overflow-hidden"><div className="max-h- overflow-y-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-slate-50 border-b text- font-bold"><tr><th className="text-left p-3">Date/Time</th><th className="text-left p-3">Title</th><th className="text-right p-3">Amt</th><th className="text-right p-3">Mode</th></tr></thead><tbody>{bills.map(b=>(<tr key={b.id} className="border-b last:border-0"><td className="p-3"><div className="font-bold">{b.paid_at? new Date(b.paid_at).toLocaleDateString() : b.due_date}</div><div className="text- text-slate-400">{b.paid_at? new Date(b.paid_at).toLocaleTimeString() : 'Pending'}</div></td><td className="p-3">{b.title}<div className={`text- px-1.5 py-0.5 rounded-full inline-block ml-1 ${b.status==='paid'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{b.status}</div></td><td className="p-3 text-right font-bold">₹{b.amount}</td><td className="p-3 text-right">{b.pay_mode||'-'}</td></tr>))}</tbody></table></div></div></div>
          </div>
        )}

        {tab==='home' && (<div className="rounded-3xl bg-slate-900 text-white p-5"><div className="text- tracking-widest opacity-60 font-bold">TOTAL DUE</div><div className="mt-1 text-2xl font-bold">₹{totalDue || 2450}</div><button onClick={()=>setTab('bills')} className="mt-3 w-full h-10 rounded-full bg-white text-black text-xs font-bold">View & Pay →</button></div>)}
        {tab==='book' && <div className="p-6 rounded-3xl bg-white border text-sm font-bold">Book tab - next step</div>}
        {tab==='more' && <div className="p-6 rounded-3xl bg-white border text-sm">More tab - Flat: {flatNo}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t rounded-t-3xl"><div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">{[{id:'home',icon:'🏠',label:'Home'},{id:'visitors',icon:'👤',label:'Visitors'},{id:'book',icon:'🎭',label:'Book'},{id:'bills',icon:'💳',label:'Bills'},{id:'more',icon:'☰',label:'More'}].map(t=>(<button key={t.id} onClick={()=>setTab(t.id as any)} className={`h-14 rounded-2xl flex flex-col items-center justify-center ${tab===t.id?'bg-slate-900 text-white':'text-slate-400'}`}><span>{t.icon}</span><span className="text- mt-0.5">{t.label}</span></button>))}</div></div>
    </div>
  )
}
