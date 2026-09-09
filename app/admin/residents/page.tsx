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
    if(res) setData(res as Resident[])
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
    // maintenance auto create
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
    <div className="h-screen flex flex-col bg-slate-50 text-black overflow-hidden">
      {/* HEADER FIXED */}
      <div className="shrink-0 bg-white border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">←</Link>
          <div>
            <div className="font-bold text-sm">Admin • Resident Approval</div>
            <div className="text- text-slate-500">{filtered.length} Records • Separate Columns</div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text- font-bold">● LIVE</span>
      </div>

      {/* STATS FIXED */}
      <div className="shrink-0 max-w-7xl w-full mx-auto p-3 space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white border"><div className="text- text-slate-500">TOTAL</div><div className="text-lg font-bold">{stats.total}</div></div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100"><div className="text- text-amber-700">PENDING</div><div className="text-lg font-bold">{stats.pending}</div></div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100"><div className="text- text-emerald-700">APPROVED</div><div className="text-lg font-bold">{stats.approved}</div></div>
          <div className="p-3 rounded-2xl bg-red-50 border border-red-100"><div className="text- text-red-700">REJECTED</div><div className="text-lg font-bold">{stats.rejected}</div></div>
        </div>

        <div className="p-4 rounded-3xl bg-white border shadow-sm flex flex-col md:flex-row gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile / Vehicle" className="h-10 rounded-2xl bg-slate-50 border px-4 text-sm flex-1"/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm font-bold w-full md:w-40">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <button onClick={load} className="px-5 h-10 rounded-full bg-amber-400 text-black text-sm font-bold">🔍 Apply</button>
        </div>
      </div>

      {/* TABLE SCROLL ONLY */}
      <div className="flex-1 overflow-hidden max-w-7xl w-full mx-auto px-3 pb-3">
        <div className="h-full bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
          <div className="shrink-0 p-3 text- font-bold text-slate-500 flex justify-between border-b bg-slate-50">
            <span>↕ Sirf ye table scroll hogi</span>
            <span className="px-2 py-1 rounded-full bg-white border">{filtered.length} rows</span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm min-w-">
              <thead className="sticky top-0 bg-slate-900 text-white text- z-10">
                <tr>
                  <th className="p-3 text-left whitespace-nowrap">📅 Date</th>
                  <th className="p-3 text-left">📷 Photo</th>
                  <th className="p-3 text-left">🏠 Flat</th>
                  <th className="p-3 text-left">👤 Name</th>
                  <th className="p-3 text-left">📱 Mobile</th>
                  <th className="p-3 text-left">👨‍👩‍👧 Family</th>
                  <th className="p-3 text-left">🚗 Vehicle</th>
                  <th className="p-3 text-left">🐾 Pet</th>
                  <th className="p-3 text-left">🔘 Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} className="border-t hover:bg-amber-50/60">
                    <td className="p-3 text-xs whitespace-nowrap">
                      <div className="font-bold">{new Date(r.created_at).toLocaleDateString('en-IN')}</div>
                      <div className="text- text-slate-500">{new Date(r.created_at).toLocaleTimeString('en-IN')}</div>
                    </td>
                    <td className="p-3">
                      {r.photo_url? (
                        <img src={r.photo_url} className="w-10 h-10 rounded-xl object-cover border" alt="photo" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">👤</div>
                      )}
                    </td>
                    <td className="p-3 font-bold whitespace-nowrap">{r.flat_no}</td>
                    <td className="p-3 whitespace-nowrap">{r.name}</td>
                    <td className="p-3 whitespace-nowrap text-xs">{r.mobile}<div className="text- text-slate-400">Pass: {r.password}</div></td>
                    <td className="p-3 text-center font-bold">{r.family_size}</td>
                    <td className="p-3 whitespace-nowrap text-xs font-bold">{r.vehicle_no || '-'}</td>
                    <td className="p-3 whitespace-nowrap text-xs">{r.pet || 'No'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text- font-bold whitespace-nowrap ${r.status==='approved'?'bg-emerald-100 text-emerald-700': r.status==='pending'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{r.status}</span>
                    </td>
                    <td className="p-3">
                      <button onClick={()=>setSelected(r)} className="px-3 py-1 rounded-full bg-slate-900 text-white text- font-bold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && <div className="p-10 text-center text-slate-400 text-sm">{loading?'Loading...':'No records'}</div>}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded- p-6 shadow-2xl">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {selected.photo_url? <img src={selected.photo_url} className="w-full h-full object-cover" alt="photo"/> : '👤'}
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
                <button onClick={()=>approve(selected.id, selected.flat_no)} className="h-11 rounded-full bg-emerald-600 text-white font-bold text-sm">✓ Approve</button>
                <button onClick={()=>reject(selected.id)} className="h-11 rounded-full bg-red-100 text-red-700 font-bold text-sm">✕ Reject</button>
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
