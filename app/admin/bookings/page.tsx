'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminBookingDashboard(){
  const [bookings, setBookings] = useState<any[]>([])
  const [fFlat, setFFlat] = useState('')
  const [fFacility, setFFacility] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fFrom, setFFrom] = useState('')
  const [fTo, setFTo] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [dueInfo, setDueInfo] = useState<any>(null)

  const load = async ()=>{
    const { data } = await supabase.from('bookings').select('*').order('created_at',{ascending:false}).limit(500)
    if(data) setBookings(data)
  }
  useEffect(()=>{ load(); const ch=supabase.channel('admin-book').on('postgres_changes',{event:'*',schema:'public',table:'bookings'},()=>load()).subscribe(); return ()=>{supabase.removeChannel(ch)} },[])

  const checkDue = async (b:any)=>{
    setSelected(b)
    const { data: bills } = await supabase.from('bills').select('amount,status').eq('flat_no', b.flat_no).eq('status','pending')
    const { data: led } = await supabase.from('society_ledger').select('amount').eq('flat_no', b.flat_no).eq('type','credit')
    const totalDue = (bills||[]).reduce((s,x)=>s+Number(x.amount),0)
    const totalPaid = (led||[]).reduce((s,x)=>s+Number(x.amount),0)
    const { data: res } = await supabase.from('residents').select('name,mobile,advance_amount').eq('flat_no', b.flat_no).maybeSingle()
    setDueInfo({ totalDue, totalPaid, advance: res?.advance_amount||0, name: res?.name||'-', mobile: res?.mobile||'-', bills: bills||[] })
  }

  const approve = async ()=>{
    if(!selected) return
    if(dueInfo?.totalDue > 5000){
      const ok = confirm(`⚠️ ${selected.flat_no} ka Due ₹${dueInfo.totalDue} hai (>5000). Phir bhi Approve karna hai?`)
      if(!ok) return
    }
    // FIX: sirf status update karo, approved_at hata diya
    const { data: up, error: e1 } = await supabase.from('bookings').update({ status:'approved' }).eq('id', selected.id).select('id')
    if(e1){ alert('Update Error: '+e1.message); return }
    if(!up || up.length===0){
      // id match na ho to flat+date se
      await supabase.from('bookings').update({ status:'approved' }).eq('flat_no', selected.flat_no).eq('booking_date', selected.booking_date).eq('facility_name', selected.facility_name).eq('status','pending')
    }
    await supabase.from('bills').insert({ flat_no: selected.flat_no, title: `${selected.facility_name} Booking ${selected.booking_date}`, amount: selected.amount, type:'other', due_date: selected.booking_date, status:'pending' })
    try { await supabase.from('booking_history').insert({ booking_id: selected.id, flat_no: selected.flat_no, action:'approved', by:'admin', note:`Due Rs.${dueInfo?.totalDue} checked - OK` }) } catch(e){}
    alert(`✅ Approved ${selected.flat_no} - Bill ₹${selected.amount} Added`)
    setSelected(null); setDueInfo(null); load()
  }

  const reject = async ()=>{
    if(!selected) return
    const reason = prompt('Reject reason likho:')||'Rejected by admin'
    await supabase.from('bookings').update({ status:'rejected' }).eq('id', selected.id)
    try { await supabase.from('booking_history').insert({ booking_id: selected.id, flat_no: selected.flat_no, action:'rejected', by:'admin', note: reason }) } catch(e){}
    alert('Rejected'); setSelected(null); setDueInfo(null); load()
  }

  const filtered = bookings.filter(b=>{
    if(fFlat &&!b.flat_no.toLowerCase().includes(fFlat.toLowerCase())) return false
    if(fFacility &&!b.facility_name.toLowerCase().includes(fFacility.toLowerCase())) return false
    if(fStatus && b.status!==fStatus) return false
    if(fFrom && b.booking_date < fFrom) return false
    if(fTo && b.booking_date > fTo) return false
    return true
  })

  const downloadExcel = ()=>{
    const header = ['Date','Flat No','Facility','Booking Date','Time','Hours','Amount','Status','Created At']
    const rows = filtered.map(b=>[new Date(b.created_at).toLocaleString(), b.flat_no, b.facility_name, b.booking_date, `${b.start_time}-${b.end_time}`, b.hours, b.amount, b.status, b.created_at])
    const csv = [header,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob(["\ufeff"+csv], {type:'text/csv;charset=utf-8;'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`Bookings_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const pendingCount = bookings.filter(b=>b.status==='pending').length

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-4 text-black">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="font-black text-lg">🏛️ Clubhouse & Lawn Booking Dashboard</h1>
            <div className="text-xs opacity-60 mt-1">Total {bookings.length} • <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{pendingCount} Pending</span> <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">{bookings.filter(b=>b.status==='approved').length} Approved</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="px-4 h-10 rounded-full bg-slate-100 border text-xs font-bold">🔄 Refresh</button>
            <button onClick={downloadExcel} className="px-4 h-10 rounded-full bg-emerald-600 text-white text-xs font-black">📥 Excel Download ({filtered.length})</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <div className="text-xs font-black tracking-widest opacity-60">MULTIPLE SEARCH - BADI LIST SHORT KARO</div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-2">
            <input value={fFlat} onChange={e=>setFFlat(e.target.value)} placeholder="🔍 Flat No (B-302)" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold" />
            <input value={fFacility} onChange={e=>setFFacility(e.target.value)} placeholder="🔍 Facility (Club/Lawn)" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm" />
            <select value={fStatus} onChange={e=>setFStatus(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs font-bold">
              <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
            <input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs" />
            <input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs" />
            <button onClick={()=>{setFFlat(''); setFFacility(''); setFStatus(''); setFFrom(''); setFTo('')}} className="h-11 rounded-xl bg-black text-white text-xs font-bold">Clear</button>
          </div>
          <div className="mt-2 text-xs font-bold">Showing {filtered.length} / {bookings.length} bookings</div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <div className="font-bold text-sm mb-3">All Requests - Resident se aayi hui</div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.map(b=>(
              <div key={b.id} onClick={()=>checkDue(b)} className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition ${selected?.id===b.id?'border-black border-2 bg-slate-50':'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm">{b.facility_name} • <span className="text-blue-600">{b.flat_no}</span></div>
                    <div className="text-xs opacity-60 mt-0.5">📅 {b.booking_date} ⏰ {b.start_time}-{b.end_time} • {b.hours}hr • <b className="text-black">₹{b.amount}</b></div>
                    <div className="text-[10px] opacity-40">Request: {new Date(b.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-black ${b.status==='pending'?'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse':b.status==='approved'?'bg-emerald-100 text-emerald-700 border border-emerald-200':'bg-red-100 text-red-700 border'}`}>{b.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
            {filtered.length===0 && <div className="p-8 text-center text-xs opacity-40">Koi booking nahi mili - Search clear karo</div>}
          </div>
          <div className="mt-2 p-2 bg-slate-50 rounded-xl text-xs text-center font-bold">↕️ Scroll karo • Click karke Due check karo</div>
        </div>
        {selected && (
          <div className="bg-white rounded-2xl border-2 border-black shadow-lg p-4 sticky bottom-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-black">{selected.facility_name} - {selected.flat_no}</div>
                <div className="text-xs opacity-60">{selected.booking_date} {selected.start_time}-{selected.end_time} • ₹{selected.amount}</div>
              </div>
              <button onClick={()=>{setSelected(null); setDueInfo(null)}} className="w-8 h-8 rounded-full bg-slate-100 font-bold">✕</button>
            </div>
            {dueInfo? (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className={`p-3 rounded-2xl border ${dueInfo.totalDue>0?'bg-red-50 border-red-200':'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-[10px] font-bold opacity-60">TOTAL DUE</div><div className={`font-black ${dueInfo.totalDue>0?'text-red-600':'text-emerald-600'}`}>₹{dueInfo.totalDue}</div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] font-bold opacity-60">TOTAL PAID</div><div className="font-black text-blue-700">₹{dueInfo.totalPaid}</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-bold opacity-60">ADVANCE</div><div className="font-black">₹{dueInfo.advance}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border">
                  <div className="text-[10px] font-bold opacity-60">RESIDENT</div><div className="font-bold text-xs">{dueInfo.name}<div className="opacity-60">{dueInfo.mobile}</div></div>
                </div>
              </div>
            ) : <div className="mt-3 text-xs">Checking due...</div>}
            <div className="mt-3 p-3 rounded-2xl bg-slate-900 text-white text-xs">
              <b>Rule:</b> Due ₹0 = ✅ Auto OK | Due ₹1-5000 = ⚠️ Warning | Due &gt;5000 = ❌ Confirm chahiye
              {dueInfo && <div className="mt-1 font-bold">{dueInfo.totalDue===0?'✅ SAB OK HAI - Approve kar sakte ho':dueInfo.totalDue>5000?'❌ JYADA DUE HAI - Soch ke approve karo':'⚠️ THODA DUE HAI - Dekh lo'}</div>}
            </div>
            {selected.status==='pending'? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={reject} className="h-12 rounded-full bg-red-50 text-red-700 border border-red-200 font-black text-sm">❌ Reject</button>
                <button onClick={approve} className="h-12 rounded-full bg-emerald-600 text-white font-black text-sm">✅ Approve + Bill Add</button>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-2xl bg-slate-100 text-center text-xs font-bold">Already {selected.status.toUpperCase()} - History me saved hai</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
