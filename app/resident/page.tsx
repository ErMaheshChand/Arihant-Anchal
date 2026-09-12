'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'complaint'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
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
  const [cashDeposits, setCashDeposits] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [payingId, setPayingId] = useState<string|null>(null)
  const [bookForm, setBookForm] = useState({facility:'', price:0, date: new Date().toISOString().split('T')[0], start:'10:00', end:'12:00'})
  const [myBookings, setMyBookings] = useState<any[]>([])
  // COMPLAINT STATE
  const [complaints, setComplaints] = useState<any[]>([])
  const [cCat, setCCat] = useState('Safai')
  const [cTitle, setCTitle] = useState('')
  const [cDesc, setCDesc] = useState('')
  const [cPhoto, setCPhoto] = useState<File|null>(null)
  const [cUploading, setCUploading] = useState(false)
  const [cFeedback, setCFeedback] = useState<{[k:string]:string}>({})
  const [cRating, setCRating] = useState<{[k:string]:number}>({})
  const audioRef = useRef<HTMLAudioElement>(null)
  const beepInterval = useRef<any>(null)
  const SOCIETY_UPI = 'anchalsociety@okicici'

  useEffect(()=>{
    const saved = localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302'
    setFlatNo(saved.toUpperCase())
    if(localStorage.getItem('sound_enabled')==='1') setSoundEnabled(true)
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
    const { data: cash } = await supabase.from('cash_deposits').select('*').eq('flat_no', flatNo).order('deposit_date',{ascending:false})
    if(cash) setCashDeposits(cash)
    const { data: led } = await supabase.from('society_ledger').select('*').eq('flat_no', flatNo).order('created_at',{ascending:false})
    if(led) setLedger(led)
  }
  const loadBookings = async ()=>{
    const { data } = await supabase.from('bookings').select('*').eq('flat_no', flatNo).order('created_at',{ascending:false})
    if(data) setMyBookings(data)
  }
  const loadComplaints = async ()=>{
    const { data } = await supabase.from('complaints').select('*').eq('flat_no', flatNo).order('created_at',{ascending:false})
    if(data) setComplaints(data)
  }

  useEffect(()=>{
    if(!flatNo) return
    loadVisitors(); loadBills(); loadBookings(); loadComplaints()
    const ch = supabase.channel('resident-'+flatNo).on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, ()=>loadVisitors()).subscribe()
    const ch2 = supabase.channel('emergency-resident').on('postgres_changes', {event:'INSERT', schema:'public', table:'emergency_broadcasts'}, payload=>{ const data = payload.new as any; if(data.target === 'ALL'){ setEmergencyAlert(data); startBeep() } }).subscribe()
    const ch3 = supabase.channel('bills-'+flatNo).on('postgres_changes',{event:'*', schema:'public', table:'bills', filter:`flat_no=eq.${flatNo}`},()=>loadBills()).subscribe()
    const ch6 = supabase.channel('book-'+flatNo).on('postgres_changes',{event:'*', schema:'public', table:'bookings', filter:`flat_no=eq.${flatNo}`},()=>loadBookings()).subscribe()
    const ch7 = supabase.channel('comp-'+flatNo).on('postgres_changes',{event:'*', schema:'public', table:'complaints', filter:`flat_no=eq.${flatNo}`},()=>loadComplaints()).subscribe()
    return ()=>{ supabase.removeChannel(ch); supabase.removeChannel(ch2); supabase.removeChannel(ch3); supabase.removeChannel(ch6); supabase.removeChannel(ch7); if(beepInterval.current) clearInterval(beepInterval.current) }
  },[flatNo])
  useEffect(()=>{ if(flatNo) loadVisitors() },[fromDate,toDate])
  useEffect(()=>{ if(flatNo) loadBills() },[billFrom,billTo])

  const handleBooking = async ()=>{
    if(!bookForm.facility) return alert('Facility select karo bhai')
    const s=parseInt(bookForm.start.split(':')[0]||'0'); const e=parseInt(bookForm.end.split(':')[0]||'0'); const hrs=Math.max(1,e-s); const amt=hrs*bookForm.price
    const { error } = await supabase.from('bookings').insert({ flat_no:flatNo, facility_name:bookForm.facility, booking_date:bookForm.date, start_time:bookForm.start, end_time:bookForm.end, hours:hrs, amount:amt, status:'pending' })
    if(!error){ alert(`✅ Booking Sent - ₹${amt} - Admin approve karega`); setBookForm({...bookForm, facility:'', price:0}); loadBookings() } else alert(error.message)
  }

  const handleComplaintSubmit = async ()=>{
    if(!cTitle.trim()){ alert('Shikayat ka title likho bhai'); return }
    setCUploading(true)
    let photoUrl = ''
    try{
      if(cPhoto){
        const fname = `${flatNo}_${Date.now()}_${cPhoto.name}`
        const { error: upErr } = await supabase.storage.from('complaint-photos').upload(fname, cPhoto)
        if(upErr) throw upErr
        const { data } = supabase.storage.from('complaint-photos').getPublicUrl(fname)
        photoUrl = data.publicUrl
      }
      const { error } = await supabase.from('complaints').insert({ flat_no: flatNo, category: cCat, title: cTitle, description: cDesc, photo_url: photoUrl, status:'pending' })
      if(error) throw error
      alert('✅ Shikayat darj ho gayi - Admin dekhega')
      setCTitle(''); setCDesc(''); setCPhoto(null); loadComplaints()
    }catch(e:any){ alert('Error: '+e.message) }
    setCUploading(false)
  }

  const handleThankYou = async (id:string)=>{
    const fb = cFeedback[id]||''
    const rt = cRating[id]||5
    if(!fb.trim()){ alert('Thank you message likho bhai'); return }
    const { error } = await supabase.from('complaints').update({ feedback: fb, rating: rt, status:'closed' }).eq('id', id)
    if(!error){ alert('🙏 Dhanyavaad! Feedback bhej diya'); loadComplaints() } else alert(error.message)
  }

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

  const downloadReceipt = async (bill:any)=>{
    // @ts-ignore
    if(!(window as any).jspdf){
      await new Promise((res,rej)=>{
        const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=()=>res(0); s.onerror=rej; document.body.appendChild(s)
      })
    }
    const { jsPDF } = (window as any).jspdf
    const doc = new jsPDF()
    doc.setFontSize(18); doc.text('Anchal Society - Payment Receipt', 20, 20)
    doc.setFontSize(11)
    doc.text(`Receipt No: ${bill.receipt_no || 'N/A'}`, 20, 30)
    doc.text(`Flat No: ${bill.flat_no || flatNo}`, 20, 38)
    doc.text(`Title: ${bill.title}`, 20, 46)
    doc.text(`Amount: Rs. ${bill.amount}`, 20, 54)
    doc.text(`Pay Mode: ${bill.pay_mode || 'CASH'} (${SOCIETY_UPI})`, 20, 62)
    doc.text(`Paid At: ${bill.created_at? new Date(bill.created_at).toLocaleString() : new Date().toLocaleString()}`, 20, 70)
    doc.text(`Status: PAID`, 20, 78)
    doc.setFontSize(10); doc.text(`Thank you!`, 20, 90)
    doc.save(`${bill.receipt_no || bill.id}_${flatNo}.pdf`)
  }

  const handlePay = async (bill:any)=>{
    setPayingId(bill.id)
    const upiLink = `upi://pay?pa=${SOCIETY_UPI}&pn=AnchalSociety&am=${bill.amount}&cu=INR&tn=${encodeURIComponent(bill.title+' '+flatNo)}`
    window.location.href = upiLink
    setTimeout(async()=>{
      const ok = confirm(`₹${bill.amount} ka payment kiya kya? OK karo to Receipt + Admin Balance update ho jayega`)
      if(!ok){ setPayingId(null); return }
      const receiptNo = `RCP-${Date.now()}`
      await supabase.from('bills').update({ status:'paid', paid_at: new Date().toISOString(), pay_mode:'UPI', receipt_no: receiptNo }).eq('id',bill.id)
      await supabase.from('society_ledger').insert({ flat_no: flatNo, amount: bill.amount, type: 'credit', title: bill.title, bill_id: bill.id })
      const paidBill = {...bill, status:'paid', paid_at: new Date().toISOString(), pay_mode:'UPI', receipt_no: receiptNo, flat_no: flatNo}
      await downloadReceipt(paidBill)
      loadBills()
      alert(`✅ Paid + Receipt Downloaded`)
      setPayingId(null)
    },2500)
  }

  const pendingBills = bills.filter(b=>b.status==='pending')
  const monthlyDue = pendingBills.filter(b=>b.type==='monthly').reduce((s,b)=>s+Number(b.amount),0)
  const oldDue = pendingBills.filter(b=>b.type==='old_due').reduce((s,b)=>s+Number(b.amount),0)
  const otherDue = pendingBills.filter(b=>b.type==='other').reduce((s,b)=>s+Number(b.amount),0)
  const totalDue = pendingBills.reduce((s,b)=>s+Number(b.amount),0)
  const totalCollection = ledger.filter(l=>l.type==='credit').reduce((s,l)=>s+Number(l.amount),0)
  const totalCash = cashDeposits.reduce((s,c)=>s+Number(c.amount),0)

  const combinedHistory = ledger.map(l=>{
    const receipt = l.title.includes(' - ')? l.title.split(' - ')[1] : ''
    const isCash = l.title.toUpperCase().includes('CASH')
    return { id:l.id, title:l.title, amount:l.amount, created_at:l.created_at, pay_mode:isCash?'CASH':'ONLINE', receipt_no:receipt }
  })

  const facilities = [
    {name:'Club House', price:1000},
    {name:'Garden Area', price:1500},
    {name:'Party Hall', price:2000},
    {name:'Gym Hall', price:500}
  ]
  const categories = ['Light','Pani','Safai','Parking','Lift','Security','Gardening','Noise','Other']

  const statusColor = (s:string)=> s==='pending'?'bg-amber-100 text-amber-700 border-amber-200':s==='in_progress'?'bg-blue-100 text-blue-700 border-blue-200':s==='resolved'?'bg-emerald-100 text-emerald-700 border-emerald-200':'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col" onClick={()=>{ if(!soundEnabled) enableSound() }}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3" preload="auto" />
      {!soundEnabled && (<div className="sticky top-0 z-[100] bg-amber-400 text-black px-4 py-2 text-xs font-bold flex justify-between items-center"><span>🔊 Tap to Enable Sound</span><button onClick={enableSound} className="px-3 py-1 bg-black text-white rounded-full text-xs">Enable 🔊</button></div>)}
      {emergencyAlert && (<div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white border-4 border-red-600 rounded-3xl p-6 animate-pulse"><div className="text-4xl text-center">🚨</div><h2 className="font-black text-2xl text-center text-red-600">EMERGENCY ALERT</h2><div className="text-center mt-1 text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full inline-block">{emergencyAlert.emergency_type} • {emergencyAlert.guard_id}</div><div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-sm">{emergencyAlert.message}</div><button onClick={()=>{ if(beepInterval.current) clearInterval(beepInterval.current); audioRef.current?.pause(); setEmergencyAlert(null) }} className="mt-4 w-full h-12 bg-red-600 text-white rounded-full font-black">Stop Sound & OK</button></div></div>)}

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">A</div><div className="leading-tight"><div className="font-bold text-sm">{flatNo} • Aarav Sharma</div><div className="text-xs text-slate-500">Owner • Tower {flatNo.split('-')[0]}</div></div></div>
        <button onClick={()=>setTab('home')} className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">🔔{pending.length>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">{pending.length}</span>}</button>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        {tab==='home' && (
          <>
            {pending.length>0 && (
              <div className="mb-5 space-y-3">
                <div className="flex items-center gap-2"><span className="text-sm font-bold">🔔 Pending Approval</span><span className="px-2.5 py-0.5 bg-red-500 text-white rounded-full text-xs animate-pulse font-bold">{pending.length} New</span></div>
                {pending.map(v=>(
                  <div key={v.id} className="p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-sm">
                    <div className="flex gap-3">
                      {v.photo_url? <img src={v.photo_url} className="w-16 h-16 rounded-2xl object-cover" /> : <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">👤</div>}
                      <div className="flex-1"><div className="font-bold text-sm">{v.name || v.visitor_name} • {v.mobile}</div><div className="text-xs text-slate-600 mt-0.5">🚗 {v.vehicle_no || 'No Vehicle'} • {v.purpose}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      <button onClick={()=>handleAction(v.id,'rejected')} className="h-11 rounded-full bg-slate-100 border text-sm font-bold">❌ Reject</button>
                      <button onClick={()=>handleAction(v.id,'approved')} className="h-11 rounded-full bg-emerald-600 text-white text-sm font-bold">✅ Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-3xl bg-slate-900 text-white p-5">
              <div className="text-xs tracking-widest opacity-60 font-bold">TOTAL PENDING DUE</div>
              <div className="mt-1 text-2xl font-bold">₹{totalDue || 0}</div>
              <div className="text-xs opacity-60 mt-1">Monthly ₹{monthlyDue} + Old ₹{oldDue} + Other ₹{otherDue}</div>
              <div className="text-xs mt-2 bg-white/10 rounded-full px-3 py-1 inline-block">Ledger Paid (Cash+Online): ₹{totalCollection} (Cash ₹{totalCash})</div>
              <button onClick={()=>setTab('bills')} className="mt-3 w-full h-10 rounded-full bg-white text-black text-xs font-bold">View & Pay →</button>
            </div>
          </>
        )}

        {tab==='visitors' && (
          <div>
            <h2 className="text-lg font-bold">Pre-Approve Visitor</h2>
            <div className="mt-3 p-5 rounded-3xl bg-white border shadow-sm space-y-3">
              <input value={vName} onChange={e=>setVName(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm" />
              <input value={vMobile} onChange={e=>setVMobile(e.target.value)} placeholder="Mobile Number" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm" />
              <button onClick={handlePreApprove} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">Add Pre-Approved →</button>
            </div>
            <div className="mt-6"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Visitor History</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{allVisitors.length} records</span></div>
              <div className="mt-3 space-y-2">{allVisitors.map((v:any)=>(<div key={v.id} className="p-3.5 rounded-2xl bg-white border flex justify-between items-center"><div><div className="font-bold text-sm">{v.name || v.visitor_name}</div><div className="text-xs text-slate-500">{new Date(v.entry_time || v.created_at).toLocaleString()}</div></div><div className="text-xs font-black px-2 py-1 rounded-full bg-slate-100">{v.status.toUpperCase()}</div></div>))}</div>
            </div>
          </div>
        )}

        {tab==='bills' && (
          <div>
            <h2 className="text-lg font-bold">Bills & Maintenance</h2>
            <div className="mt-3 rounded-3xl bg-slate-900 text-white p-5">
              <div className="text-xs tracking-widest opacity-60 font-bold">TOTAL PENDING DUE</div>
              <div className="mt-1 text-3xl font-bold">₹{totalDue}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-white/10"><div className="opacity-60">Monthly</div><div className="font-bold text-sm">₹{monthlyDue}</div></div>
                <div className="p-2.5 rounded-2xl bg-white/10"><div className="opacity-60">Old Due</div><div className="font-bold text-sm">₹{oldDue}</div></div>
                <div className="p-2.5 rounded-2xl bg-white/10"><div className="opacity-60">Other</div><div className="font-bold text-sm">₹{otherDue}</div></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold">Pending Bills</div>
              <div className="mt-2 space-y-2">{pendingBills.length===0? <div className="p-4 rounded-2xl bg-white border text-xs text-center">No dues 🎉</div> : pendingBills.map(b=>(<div key={b.id} className="p-4 rounded-2xl bg-white border flex justify-between items-center"><div><div className="font-bold text-sm">{b.title}</div><div className="text-xs text-slate-500">Due: {b.due_date} • {b.type}</div></div><div className="text-right"><div className="font-black text-sm">₹{b.amount}</div><button disabled={payingId===b.id} onClick={()=>handlePay(b)} className="mt-1 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold">{payingId===b.id?'...':'Pay UPI'}</button></div></div>))}</div>
            </div>
          </div>
        )}

        {tab==='book' && (
          <div>
            <h2 className="text-lg font-bold">Book Facility 🎭</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {facilities.map((f,i)=>(
                <button key={i} onClick={()=>setBookForm({...bookForm, facility:f.name, price:f.price})}
                  className={`p-4 rounded-3xl border-2 text-left ${bookForm.facility===f.name?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200'}`}>
                  <div className="font-bold text-sm">{f.name}</div>
                  <div className="text-xs opacity-60">₹{f.price}/hr</div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-3xl bg-white border space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input type="date" value={bookForm.date} onChange={e=>setBookForm({...bookForm, date:e.target.value})} className="h-11 rounded-xl bg-slate-50 border px-2 text-xs" />
                <input type="time" value={bookForm.start} onChange={e=>setBookForm({...bookForm, start:e.target.value})} className="h-11 rounded-xl bg-slate-50 border px-2 text-xs" />
                <input type="time" value={bookForm.end} onChange={e=>setBookForm({...bookForm, end:e.target.value})} className="h-11 rounded-xl bg-slate-50 border px-2 text-xs" />
              </div>
              <button onClick={handleBooking} className="w-full h-12 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-bold text-sm">Book Now → Admin Approval</button>
            </div>
            <div className="mt-5">
              <div className="text-sm font-bold flex justify-between"><span>My Bookings</span><span className="text-xs bg-black text-white px-2 py-1 rounded-full">{myBookings.length}</span></div>
              <div className="mt-2 space-y-2">
                {myBookings.map((b:any)=>(
                  <div key={b.id} className="p-3 rounded-2xl bg-white border flex justify-between items-center">
                    <div><div className="font-bold text-sm">{b.facility_name}</div><div className="text-xs opacity-60">{b.booking_date} {b.start_time}-{b.end_time} • ₹{b.amount}</div></div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${b.status==='approved'?'bg-emerald-50 text-emerald-700 border border-emerald-200':b.status==='pending'?'bg-amber-50 text-amber-700 border border-amber-200':'bg-red-50 text-red-700 border'}`}>{b.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='complaint' && (
          <div>
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 text-white p-5">
              <h2 className="text-lg font-black">📝 Shikayat / Complaint</h2>
              <div className="text-xs opacity-70 mt-1">Light • Pani • Safai • Parking • Lift — photo ke saath bhejo, track karo</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="px-2 py-1 bg-amber-400 text-black rounded-full font-bold">{complaints.filter(c=>c.status==='pending').length} Pending</span>
                <span className="px-2 py-1 bg-blue-400 text-white rounded-full font-bold">{complaints.filter(c=>c.status==='in_progress').length} Kaam chal raha</span>
                <span className="px-2 py-1 bg-emerald-400 text-black rounded-full font-bold">{complaints.filter(c=>c.status==='resolved'||c.status==='closed').length} Solved</span>
              </div>
            </div>

            <div className="mt-4 p-5 rounded-3xl bg-white border shadow-sm space-y-3">
              <div className="text-sm font-black">➕ Nayi Shikayat Darj Karo</div>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat=>(
                  <button key={cat} onClick={()=>setCCat(cat)} className={`h-10 rounded-full text-xs font-bold border ${cCat===cat?'bg-slate-900 text-white border-slate-900':'bg-slate-50'}`}>{cat==='Light'?'💡 Light':cat==='Pani'?'💧 Pani':cat==='Safai'?'🧹 Safai':cat==='Parking'?'🚗 Parking':cat}</button>
                ))}
              </div>
              <input value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="Title * (jaise: Corridor light kharab)" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold" />
              <textarea value={cDesc} onChange={e=>setCDesc(e.target.value)} placeholder="Detail likho... (floor, location)" rows={3} className="w-full rounded-2xl bg-slate-50 border px-4 py-3 text-sm" />
              <label className="block p-4 rounded-2xl border-2 border-dashed border-slate-200 text-center cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={e=>setCPhoto(e.target.files?.[0]||null)} />
                <div className="text-2xl">📸</div>
                <div className="text-xs font-bold mt-1">{cPhoto? cPhoto.name : 'Photo upload karo (saboot ke liye)'}</div>
              </label>
              <button disabled={cUploading} onClick={handleComplaintSubmit} className="w-full h-12 rounded-full bg-red-600 text-white font-black text-sm">{cUploading?'Upload ho raha...':'🚨 Shikayat Bhejo'}</button>
            </div>

            <div className="mt-5">
              <div className="text-sm font-black">📋 Meri Shikayatein — Track karo</div>
              <div className="mt-2 space-y-3">
                {complaints.map(c=>(
                  <div key={c.id} className="p-4 rounded-3xl bg-white border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div><div className="font-bold text-sm">{c.category} • {c.title}</div><div className="text-xs opacity-60 mt-0.5">{new Date(c.created_at).toLocaleString()} • {c.description}</div></div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black border ${statusColor(c.status)}`}>{c.status==='pending'?'⏳ PENDING':c.status==='in_progress'?'🔧 KAAM CHAL RAHA':c.status==='resolved'?'✅ SOLVED':'🙏 CLOSED'}</span>
                    </div>
                    {c.photo_url && <img src={c.photo_url} className="mt-2 w-full h-40 object-cover rounded-2xl" />}
                    {c.status==='resolved' && (
                      <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="text-xs font-black text-emerald-700">🎉 Kaam ho gaya! Thank you bolo:</div>
                        <div className="mt-2 flex gap-1">{[1,2,3,4,5].map(s=>(<button key={s} onClick={()=>setCRating({...cRating, [c.id]:s})} className="text-xl">{(cRating[c.id]||5)>=s?'⭐':'☆'}</button>))}</div>
                        <input value={cFeedback[c.id]||''} onChange={e=>setCFeedback({...cFeedback, [c.id]:e.target.value})} placeholder="Dhanyavaad likho..." className="mt-2 w-full h-10 rounded-xl border px-3 text-xs" />
                        <button onClick={()=>handleThankYou(c.id)} className="mt-2 w-full h-10 rounded-full bg-emerald-600 text-white text-xs font-black">🙏 Thank You + Feedback Bhejo</button>
                      </div>
                    )}
                    {c.feedback && <div className="mt-2 p-2 rounded-xl bg-slate-50 text-xs">⭐ {c.rating}/5 — "{c.feedback}"</div>}
                  </div>
                ))}
                {complaints.length===0 && <div className="p-8 text-center text-xs opacity-40 bg-white rounded-3xl border">Koi shikayat nahi — upar se darj karo</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t rounded-t-3xl"><div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">{[{id:'home',icon:'🏠',label:'Home'},{id:'visitors',icon:'👤',label:'Visitors'},{id:'book',icon:'🎭',label:'Book'},{id:'bills',icon:'💳',label:'Bills'},{id:'complaint',icon:'📝',label:'Shikayat'}].map(t=>(<button key={t.id} onClick={()=>setTab(t.id as any)} className={`h-14 rounded-2xl flex flex-col items-center justify-center ${tab===t.id?'bg-slate-900 text-white':'text-slate-400'}`}><span>{t.icon}</span><span className="text-[10px] mt-0.5 font-bold">{t.label}</span></button>))}</div></div>
    </div>
  )
}
