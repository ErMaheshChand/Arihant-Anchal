'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminResidentsLogStyle(){
  const [data, setData] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [maintenance, setMaintenance] = useState<any>(null)
  const [complaints, setComplaints] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])

  const load = async ()=>{
    setLoading(true)
    let q = supabase.from('residents').select('*').order('created_at',{ascending:false}).limit(1000)
    if(filterStatus!=='all') q = q.eq('status', filterStatus)
    if(dateFrom) q = q.gte('created_at', dateFrom)
    if(dateTo) q = q.lte('created_at', dateTo+'T23:59:59')
    const { data } = await q
    if(data) setData(data)
    setLoading(false)
  }

  const loadFull = async (r:any)=>{
    setSelected(r)
    const { data: m } = await supabase.from('maintenance').select('*').eq('flat_no',r.flat_no).maybeSingle()
    setMaintenance(m)
    const { data: c } = await supabase.from('complaints').select('*').eq('flat_no',r.flat_no).order('created_at',{ascending:false}).limit(10)
    setComplaints(c||[])
    const { data: v } = await supabase.from('visitors').select('*').eq('flat_no',r.flat_no).order('created_at',{ascending:false}).limit(10)
    setVisitors(v||[])
  }

  useEffect(()=>{ load() },[])

  const filtered = data.filter(v=>
   !search ||
    v.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.mobile?.includes(search) ||
    v.vehicle_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.role?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: filtered.length,
    pending: filtered.filter(v=>v.status==='pending').length,
    approved: filtered.filter(v=>v.status==='approved').length,
    rejected: filtered.filter(v=>v.status==='rejected').length,
  }

  const approve = async ()=>{
    if(!selected) return
    await supabase.from('residents').update({status:'approved'}).eq('id',selected.id)
    await supabase.from('maintenance').upsert({flat_no:selected.flat_no, due_amount:2500, advance_amount:0, status:'due'})
    setSelected(null); load()
  }
  const reject = async ()=>{
    if(!selected) return
    await supabase.from('residents').update({status:'rejected'}).eq('id',selected.id)
    setSelected(null); load()
  }

  const downloadCSV = ()=>{
    const headers = ['Date','Flat','Name','Mobile','Role','FamilySize','Vehicle','Pet','Password','Status','Due','Advance','Photo']
    const rows = filtered.map(v=>[
      new Date(v.created_at).toLocaleDateString('en-IN'),
      v.flat_no||'', v.name||'', v.mobile||'', v.role||'', v.family_size||'',
      v.vehicle_no||'', v.pet||'', v.password||'', v.status||'',
      maintenance?.due_amount||'', maintenance?.advance_amount||'', v.photo_url||''
    ].map(x=>`"${(x||'').toString().replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','),...rows].join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`RESIDENTS_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-black overflow-hidden">
      {/* FIXED HEADER */}
      <div className="shrink-0 bg-white border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">←</Link>
          <div><div className="font-bold text-sm">Resident Approval • Full Records Dashboard</div><div className="text- text-slate-500">{filtered.length} Records • Flat • Family • Vehicle • Pet • Maintenance • Complaints • Visitors</div></div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text- font-bold">● LIVE ADMIN</span>
      </div>

      {/* FIXED STATS + FILTERS - UPAR COMMON */}
      <div className="shrink-0 max-w-7xl w-full mx-auto p-3 space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white border"><div className="text- text-slate-500 tracking-widest">TOTAL</div><div className="text-lg font-bold">{stats.total}</div></div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100"><div className="text- text-amber-700 tracking-widest">PENDING</div><div className="text-lg font-bold">{stats.pending}</div></div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100"><div className="text- text-emerald-700 tracking-widest">APPROVED</div><div className="text-lg font-bold">{stats.approved}</div></div>
          <div className="p-3 rounded-2xl bg-red-50 border border-red-100"><div className="text- text-red-700 tracking-widest">REJECTED</div><div className="text-lg font-bold">{stats.rejected}</div></div>
        </div>

        <div className="p-4 rounded-3xl bg-white border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile / Vehicle" className="h-10 rounded-2xl bg-slate-50 border px-4 text-sm md:col-span-2"/>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm"/>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm"/>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={load} className="px-5 h-9 rounded-full bg-amber-400 text-black text-sm font-bold">🔍 Apply Filter</button>
            <button onClick={downloadCSV} className="px-5 h-9 rounded-full bg-slate-900 text-white text-sm font-bold">⬇ CSV Export</button>
            <button onClick={()=>{ setSearch(''); setFilterStatus('pending'); setDateFrom(''); setDateTo(''); load() }} className="px-5 h-9 rounded-full bg-slate-100 border text-sm font-bold">Reset</button>
          </div>
        </div>
      </div>

      {/* ONLY LIST SCROLL */}
      <div className="flex-1 overflow-hidden max-w-7xl w-full mx-auto px-3 pb-3">
        <div className="h-full bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
          <div className="shrink-0 p-3 text- font-bold text-slate-500 flex justify-between border-b bg-slate-50">
            <span>↕ Sirf ye list scroll hogi • Click for full record • Dashboard fixed</span>
            <span className="px-2 py-1 rounded-full bg-white border">{filtered.length} rows • {loading?'Loading...':'Live'}</span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-w-">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900 text-white text- z-20">
                  <tr>
                    <th className="p-3 text-left">📅 Date</th>
                    <th className="p-3 text-left">📷 Photo</th>
                    <th className="p-3 text-left">🏠 Flat + Name + Mobile</th>
                    <th className="p-3 text-left">👨‍👩‍👧 Family / Vehicle / Pet</th>
                    <th className="p-3 text-left">💰 Maint. Due / Adv.</th>
                    <th className="p-3 text-left">⚠️ Complaints / Visitors</th>
                    <th className="p-3 text-left">🔘 Status</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v=>(
                    <tr key={v.id} className="border-t hover:bg-amber-50/60 cursor-pointer" onClick={()=>loadFull(v)}>
                      <td className="p-3 text-xs whitespace-nowrap"><div className="font-bold">{new Date(v.created_at).toLocaleDateString('en-IN')}</div><div className="text- text-slate-500">{new Date(v.created_at).toLocaleTimeString('en-IN')}</div></td>
                      <td className="p-3">{v.photo_url? <img src={v.photo_url} className="w-10 h-10 rounded-xl object-cover border"/> : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">👤</div>}</td>
                      <td className="p-3"><div className="font-bold text-sm">{v.flat_no}</div><div className="text-xs">{v.name}</div><div className="text- text-slate-500">{v.mobile} • Pass: {v.password}</div></td>
                      <td className="p-3 text-xs"><div>Family: <b>{v.family_size}</b></div><div>Vehicle: <b>{v.vehicle_no||'-'}</b></div><div>Pet: <b>{v.pet||'No'}</b></div></td>
                      <td className="p-3 text-xs"><div>Due: <b>₹{v.due_amount||2500}</b></div><div>Adv: <b>₹{v.advance_amount||0}</b></div></td>
                      <td className="p-3 text-xs"><div>Complaints: <b>{v.complaint_count||0}</b></div><div>Visitors Today: <b>{v.visitor_today||0}</b></div></td>
                      <td className="p-3"><span className={`px-2.5 py-1 rounded-full text- font-bold whitespace-nowrap ${v.status==='approved'?'bg-emerald-100 text-emerald-700': v.status==='pending'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{v.status}</span></td>
                      <td className="p-3"><button className="px-3 py-1 rounded-full bg-slate-900 text-white text- font-bold">View Full →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FULL DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h- overflow-auto bg-white rounded- p-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">{selected.photo_url?<img src={selected.photo_url} className="w-full h-full object-cover"/>:'👤'}</div>
                <div><div className="font-black text-lg">{selected.flat_no} • {selected.name}</div><div className="text-xs text-slate-500">{selected.mobile} • {selected.role} • Family {selected.family_size}</div><div className="mt-1 px-3 py-1 rounded-full bg-amber-100 text- font-bold inline-block">Status: {selected.status} • Pass: {selected.password}</div></div>
              </div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-full bg-slate-100">✕</button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-2xl border p-4">
                <div className="font-bold text- tracking-widest mb-2">🏠 FLAT & FAMILY DETAILS</div>
                <div>Flat: <b>{selected.flat_no}</b></div>
                <div>Name: <b>{selected.name}</b></div>
                <div>Mobile: <b>{selected.mobile}</b></div>
                <div>Family Size: <b>{selected.family_size}</b></div>
                <div>Vehicle No: <b>{selected.vehicle_no||'-'}</b></div>
                <div>Pet: <b>{selected.pet||'No'}</b></div>
                <div>Members JSON: <b>{JSON.stringify(selected.family_members||[])}</b></div>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                <div className="font-bold text- tracking-widest mb-2">💰 MAINTENANCE RECORDS</div>
                {maintenance? <><div>Due: ₹{maintenance.due_amount}</div><div>Advance: ₹{maintenance.advance_amount}</div><div>Status: {maintenance.status}</div><div>Last Paid: {maintenance.last_paid_date||'-'}</div></> : <div className="text-slate-500 text-xs">No record — Approve par auto create hoga</div>}
                <div className="mt-3 font-bold text-">⚠️ COMPLAINTS: {complaints.length}</div>
                {complaints.map(c=><div key={c.id} className="text-xs border-b py-1">{c.title} • {c.status}</div>)}
              </div>
            </div>

            <div className="mt-4 bg-emerald-50 rounded-2xl border p-4 text-xs">
              <div className="font-bold text- tracking-widest mb-2">🚶 VISITOR HISTORY ({visitors.length})</div>
              {visitors.length===0? <div>No visitors</div> : visitors.map(v=><div key={v.id} className="border-b py-1">{v.name||v.visitor_name} • {v.mobile} • {v.purpose} • {new Date(v.created_at).toLocaleString('en-IN')}</div>)}
            </div>

            {selected.status==='pending' && (
              <div className="mt-6 flex gap-3">
                <button onClick={approve} className="flex-1 h-12 rounded-full bg-emerald-600 text-white font-bold">✓ APPROVE & CREATE MAINTENANCE</button>
                <button onClick={reject} className="flex-1 h-12 rounded-full bg-red-100 text-red-700 font-bold">✕ REJECT</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
     .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
     .custom-scrollbar::-webkit-scrollbar-thumb { background: #0f172a; border-radius: 10px; }
     .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
      `}</style>
    </div>
  )
}
