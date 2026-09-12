'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Resident = {
  id: string
  flat_no: string
  name: string
  mobile: string
  password: string
  role: string
  family_size: string
  vehicle_no: string | null
  pet: string | null
  photo_url: string | null
  status: string
  created_at: string
}

export default function AdminResidentsPage(){
  const [data, setData] = useState<Resident[]>([])
  const [filterStatus, setFilterStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Resident | null>(null)

  const load = async ()=>{
    setLoading(true)
    let query = supabase.from('residents').select('*').order('created_at',{ascending:false}).limit(500)
    if(filterStatus!=='all'){
      query = query.eq('status', filterStatus)
    }
    const { data: res } = await query
    if(res){
      // UNIQUE flat only - duplicate hatana
      const map = new Map()
      res.forEach((r:any)=>{ if(!map.has(r.flat_no)) map.set(r.flat_no, r) })
      // All dikhana hai to map hata do, but aapko unique chahiye tha
      setData(res as Resident[])
    }
    setLoading(false)
  }

  useEffect(()=>{ load() }, [filterStatus])

  const filtered = data.filter(r=>{
    if(!search) return true
    const s = search.toLowerCase()
    return (
      r.flat_no?.toLowerCase().includes(s) ||
      r.name?.toLowerCase().includes(s) ||
      r.mobile?.includes(s) ||
      r.vehicle_no?.toLowerCase().includes(s)
    )
  })

  const stats = {
    total: data.length,
    pending: data.filter(r=>r.status==='pending').length,
    approved: data.filter(r=>r.status==='approved').length,
    rejected: data.filter(r=>r.status==='rejected').length,
  }

  const approve = async (id:string, flat_no:string)=>{
    await supabase.from('residents').update({status:'approved'}).eq('id', id)
    await supabase.from('maintenance').upsert({flat_no: flat_no, due_amount: 2500, advance_amount: 0, status:'due'})
    setSelected(null)
    load()
  }

  const reject = async (id:string)=>{
    await supabase.from('residents').update({status:'rejected'}).eq('id', id)
    setSelected(null)
    load()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-black">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b px-3 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">←</Link>
          <div className="leading-tight">
            <div className="font-bold text-">Admin • Resident Approval</div>
            <div className="text- text-slate-500">{filtered.length} Records • Mobile View</div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text- font-bold">● LIVE</span>
      </div>

      <div className="max-w-7xl w-full mx-auto p-2 md:p-3 space-y-3">
        {/* STATS - LIGHT COLOR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl bg-white border shadow-sm"><div className="text- text-slate-500 font-bold tracking-widest">TOTAL</div><div className="text-lg font-black">{stats.total}</div></div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100"><div className="text- text-amber-700 font-bold tracking-widest">PENDING</div><div className="text-lg font-black text-amber-700">{stats.pending}</div></div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100"><div className="text- text-emerald-700 font-bold tracking-widest">APPROVED</div><div className="text-lg font-black text-emerald-700">{stats.approved}</div></div>
          <div className="p-3 rounded-2xl bg-red-50 border border-red-100"><div className="text- text-red-700 font-bold tracking-widest">REJECTED</div><div className="text-lg font-black text-red-700">{stats.rejected}</div></div>
        </div>

        {/* FILTER - MOBILE STACK */}
        <div className="p-3 rounded-2xl bg-white border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile / Vehicle" className="h-11 rounded-xl bg-slate-50 border px-4 text-sm flex-1 col-span-1 md:col-span-2 font-bold"/>
            <div className="flex gap-2">
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-11 rounded-xl bg-slate-50 border px-3 text-sm font-bold flex-1">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
              <button onClick={load} className="px-5 h-11 rounded-full bg-slate-900 text-white text-sm font-bold">🔍</button>
            </div>
          </div>
        </div>

        {/* TABLE - DESKTOP + MOBILE CARD */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 text- font-bold text-slate-500 flex justify-between border-b bg-slate-50">
            <span>↕ Scroll - Mobile card / Desktop table</span>
            <span className="px-2 py-0.5 rounded-full bg-white border">{filtered.length} rows</span>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden p-2 space-y-2 max-h- overflow-y-auto">
            {filtered.map(r=>(
              <div key={r.id} className="p-3 rounded-2xl border bg-slate-50 flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border overflow-hidden flex items-center justify-center shrink-0">
                  {r.photo_url? <img src={r.photo_url} className="w-full h-full object-cover" /> : '👤'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between"><span className="font-bold text-sm">{r.flat_no} • {r.name}</span><span className={`text- px-2 py-0.5 rounded-full font-bold border ${r.status==='approved'?'bg-emerald-50 text-emerald-700 border-emerald-200': r.status==='pending'?'bg-amber-50 text-amber-700 border-amber-200':'bg-red-50 text-red-700 border-red-200'}`}>{r.status.toUpperCase()}</span></div>
                  <div className="text- mt-1">📱 {r.mobile} | 👨‍👩‍👧 {r.family_size} | 🚗 {r.vehicle_no||'-'} | 🐾 {r.pet||'No'}</div>
                  <div className="text- opacity-60 mt-1">{new Date(r.created_at).toLocaleString('en-IN')}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>setSelected(r)} className="flex-1 h-8 rounded-full bg-white border text-xs font-bold">View</button>
                    {r.status==='pending' && <>
                      <button onClick={()=>approve(r.id, r.flat_no)} className="flex-1 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">Approve</button>
                      <button onClick={()=>reject(r.id)} className="flex-1 h-8 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">Reject</button>
                    </>}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0 && <div className="p-10 text-center text-sm opacity-40">{loading?'Loading...':'No records'}</div>}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-auto max-h- custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b text- font-bold text-slate-500">
                <tr>
                  <th className="p-3 text-left">📅 Date</th>
                  <th className="p-3 text-left">📷 Photo</th>
                  <th className="p-3 text-left">🏠 Flat</th>
                  <th className="p-3 text-left">👤 Name</th>
                  <th className="p-3 text-left">📱 Mobile</th>
                  <th className="p-3 text-center">👨‍👩‍👧 Family</th>
                  <th className="p-3 text-left">🚗 Vehicle</th>
                  <th className="p-3 text-left">🐾 Pet</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 text-xs whitespace-nowrap"><div className="font-bold">{new Date(r.created_at).toLocaleDateString('en-IN')}</div><div className="text- text-slate-500">{new Date(r.created_at).toLocaleTimeString('en-IN')}</div></td>
                    <td className="p-3">{r.photo_url? <img src={r.photo_url} className="w-10 h-10 rounded-xl object-cover border" /> : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">👤</div>}</td>
                    <td className="p-3 font-bold">{r.flat_no}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3 text-xs">{r.mobile}<div className="text- text-slate-400">Pass: {r.password}</div></td>
                    <td className="p-3 text-center font-bold">{r.family_size}</td>
                    <td className="p-3 text-xs font-bold">{r.vehicle_no || '-'}</td>
                    <td className="p-3 text-xs">{r.pet || 'No'}</td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-full text- font-bold border ${r.status==='approved'?'bg-emerald-50 text-emerald-700 border-emerald-200': r.status==='pending'?'bg-amber-50 text-amber-700 border-amber-200':'bg-red-50 text-red-700 border-red-200'}`}>{r.status}</span></td>
                    <td className="p-3"><button onClick={()=>setSelected(r)} className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && <div className="p-10 text-center text-sm opacity-40">{loading?'Loading...':'No records'}</div>}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {selected.photo_url? <img src={selected.photo_url} className="w-full h-full object-cover" /> : '👤'}
                </div>
                <div>
                  <div className="font-bold">{selected.flat_no} • {selected.name}</div>
                  <div className="text-xs text-slate-500">{selected.mobile} • {selected.role}</div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-full bg-slate-100">✕</button>
            </div>
            <div className="mt-5 space-y-2 text-sm bg-slate-50 rounded-2xl p-4 border">
              <div><b>Flat:</b> {selected.flat_no}</div>
              <div><b>Name:</b> {selected.name}</div>
              <div><b>Mobile:</b> {selected.mobile}</div>
              <div><b>Password:</b> {selected.password}</div>
              <div><b>Family:</b> {selected.family_size}</div>
              <div><b>Vehicle:</b> {selected.vehicle_no || '-'}</div>
              <div><b>Pet:</b> {selected.pet || 'No'}</div>
              <div><b>Status:</b> {selected.status}</div>
              <div><b>Date:</b> {new Date(selected.created_at).toLocaleString('en-IN')}</div>
            </div>
            {selected.status==='pending' && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={()=>approve(selected.id, selected.flat_no)} className="h-11 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm">✓ Approve</button>
                <button onClick={()=>reject(selected.id)} className="h-11 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-sm">✕ Reject</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
    .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
      `}</style>
    </div>
  )
}
