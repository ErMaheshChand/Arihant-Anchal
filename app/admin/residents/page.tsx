'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminResidentsFull(){
  const [filter, setFilter] = useState('pending')
  const [list, setList] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [maintenance, setMaintenance] = useState<any>(null)
  const [complaints, setComplaints] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])

  const load = async ()=>{
    const { data } = await supabase.from('residents').select('*').eq('status',filter).order('created_at',{ascending:false})
    if(data) setList(data)
  }

  const loadFullDetails = async (resident:any)=>{
    setSelected(resident)
    const { data: m } = await supabase.from('maintenance').select('*').eq('flat_no',resident.flat_no).maybeSingle()
    setMaintenance(m)
    const { data: c } = await supabase.from('complaints').select('*').eq('flat_no',resident.flat_no).order('created_at',{ascending:false}).limit(5)
    setComplaints(c||[])
    const { data: v } = await supabase.from('visitors').select('*').eq('flat_no',resident.flat_no).order('entry_time',{ascending:false}).limit(10)
    setVisitors(v||[])
  }

  useEffect(()=>{ load() },[filter])

  const approve = async (id:string)=>{
    await supabase.from('residents').update({status:'approved'}).eq('id',id)
    await supabase.from('maintenance').insert({flat_no: selected.flat_no, due_amount: 2500, advance_amount: 0, status:'due'}).select().single().then(()=>{})
    setSelected(null); load()
  }
  const reject = async (id:string)=>{
    await supabase.from('residents').update({status:'rejected'}).eq('id',id)
    setSelected(null); load()
  }

  return(
    <div className="min-h-screen bg-[#0B1120] text-white">
      <div className="h- px-6 flex items-center justify-between bg-[#141E32] border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">←</Link>
          <div className="font-bold text-sm">ADMIN • RESIDENT APPROVAL & FULL RECORDS</div>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-9 rounded-full bg-[#D4AF37] text-black px-4 text-xs font-bold">
          <option value="pending">Pending Requests</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT LIST */}
        <div className="space-y-3">
          <div className="text- tracking-widest text-white/40">TOTAL {filter.toUpperCase()}: {list.length}</div>
          {list.map(r=>(
            <button key={r.id} onClick={()=>loadFullDetails(r)} className={`w-full text-left bg-[#141E32] border rounded-2xl p-4 flex gap-3 hover:border-[#D4AF37]/50 transition ${selected?.id===r.id?'border-[#D4AF37]':''}`}>
              <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center">{r.photo_url?<img src={r.photo_url} className="w-full h-full object-cover"/>:'👤'}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{r.flat_no} • {r.name}</div>
                <div className="text- text-white/50">{r.mobile} • {r.role} • Family: {r.family_size}</div>
                <div className="text- text-amber-300 mt-1">{new Date(r.created_at).toLocaleString('en-IN')}</div>
              </div>
              <div className={`w-2 h-2 rounded-full mt-2 ${r.status==='pending'?'bg-amber-400':r.status==='approved'?'bg-emerald-400':'bg-red-400'}`}></div>
            </button>
          ))}
        </div>

        {/* RIGHT FULL DETAILS */}
        <div className="bg-white text-black rounded- p-6 shadow-2xl min-h-">
          {!selected? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Left se koi Resident select karo → Full Details dekho</div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">{selected.photo_url?<img src={selected.photo_url} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}</div>
                  <div>
                    <div className="font-black text-xl">{selected.flat_no} • {selected.name}</div>
                    <div className="text-sm text-slate-500">{selected.mobile} • {selected.role} • {selected.family_size} Members</div>
                    <div className="mt-2 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white text- font-bold">{selected.status.toUpperCase()}</span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-black text- font-bold">Pass: {selected.password}</span>
                    </div>
                  </div>
                </div>
                {filter==='pending' && (
                  <div className="flex gap-2">
                    <button onClick={()=>approve(selected.id)} className="px-6 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs">✓ Approve</button>
                    <button onClick={()=>reject(selected.id)} className="px-6 h-10 rounded-full bg-red-100 text-red-700 font-bold text-xs">✕ Reject</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="bg-slate-50 rounded-2xl border p-4 space-y-2">
                  <div className="font-bold text- tracking-widest">🏠 FLAT DETAILS</div>
                  <div className="text-sm"><b>Flat No:</b> {selected.flat_no}</div>
                  <div className="text-sm"><b>Name:</b> {selected.name}</div>
                  <div className="text-sm"><b>Mobile:</b> {selected.mobile}</div>
                  <div className="text-sm"><b>Role:</b> {selected.role}</div>
                  <div className="text-sm"><b>Family Members:</b> {selected.family_size}</div>
                  <div className="text-sm"><b>Family List:</b> {selected.family_members? JSON.stringify(selected.family_members) : '—'}</div>
                  <div className="text-sm"><b>Vehicle No:</b> {selected.vehicle_no || '—'}</div>
                  <div className="text-sm"><b>Pet:</b> {selected.pet || 'No'}</div>
                </div>

                {/* Maintenance */}
                <div className="bg-[#FFF7ED] rounded-2xl border border-amber-200 p-4 space-y-2">
                  <div className="font-bold text- tracking-widest">💰 MAINTENANCE RECORD</div>
                  {maintenance? (
                    <>
                      <div className="text-sm"><b>Due:</b> ₹{maintenance.due_amount}</div>
                      <div className="text-sm"><b>Advance:</b> ₹{maintenance.advance_amount}</div>
                      <div className="text-sm"><b>Status:</b> <span className={`px-2 py-1 rounded-full text- font-bold ${maintenance.status==='due'?'bg-red-100 text-red-700':'bg-emerald-100 text-emerald-700'}`}>{maintenance.status}</span></div>
                      <div className="text-sm"><b>Last Paid:</b> {maintenance.last_paid_date || '—'}</div>
                    </>
                  ) : <div className="text-sm text-slate-500">No maintenance record yet. Approve par auto create hoga.</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FEF2F2] rounded-2xl border p-4">
                  <div className="font-bold text- tracking-widest mb-2">⚠️ COMPLAINTS ({complaints.length})</div>
                  {complaints.length===0? <div className="text-xs text-slate-500">No complaints</div> : complaints.map(c=><div key={c.id} className="text-xs border-b py-2"><b>{c.title}</b> — {c.status} • {new Date(c.created_at).toLocaleDateString()}</div>)}
                </div>
                <div className="bg-[#F0FDF4] rounded-2xl border p-4">
                  <div className="font-bold text- tracking-widest mb-2">🚶 VISITORS TODAY ({visitors.length})</div>
                  {visitors.length===0? <div className="text-xs text-slate-500">No visitors today</div> : visitors.map(v=><div key={v.id} className="text-xs border-b py-2">{v.name} • {v.mobile} • {v.purpose} • {new Date(v.entry_time).toLocaleTimeString()}</div>)}
                </div>
              </div>

              {/* Action History */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 text-">
                <div className="tracking-widest font-bold">📜 RECORD HISTORY</div>
                <div className="mt-2 text-white/60">Registered: {new Date(selected.created_at).toLocaleString('en-IN')}</div>
                <div className="text-white/60">Flat: {selected.flat_no} | Password: {selected.password} | Status: {selected.status}</div>
                <div className="mt-2 text-amber-300">→ After Approval, Resident can Login with Flat + Password and go to /resident</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
