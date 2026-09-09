'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function VisitorsLogPage(){
  const [data, setData] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async ()=>{
    setLoading(true)
    let q = supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(1000)
    if(filterStatus!=='all') q = q.eq('status', filterStatus)
    if(dateFrom) q = q.gte('created_at', dateFrom)
    if(dateTo) q = q.lte('created_at', dateTo+'T23:59:59')
    const { data } = await q
    if(data) setData(data)
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const filtered = data.filter(v=>
 !search ||
    v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.mobile?.includes(search) ||
    v.vehicle_no?.toLowerCase().includes(search.toLowerCase())
  )

  const downloadCSV = ()=>{
    const headers = ['Date','Time','Visitor','Mobile','Vehicle','Flat','Purpose','Status','Guard','Entry','Exit','Photo']
    const rows = filtered.map(v=>[
      new Date(v.created_at).toLocaleDateString('en-IN'),
      new Date(v.created_at).toLocaleTimeString('en-IN'),
      v.visitor_name||v.name||'',
      v.mobile||'',
      v.vehicle_no||'',
      v.flat_no||'',
      v.purpose||'',
      v.status||'',
      v.guard_id||'',
      v.entry_time? new Date(v.entry_time).toLocaleString('en-IN'):'',
      v.exit_time? new Date(v.exit_time).toLocaleString('en-IN'):'',
      v.photo_url||''
    ].map(x=>`"${(x||'').toString().replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','),...rows].join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `VISITORS_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const stats = {
    total: filtered.length,
    inside: filtered.filter(v=>v.status==='inside').length,
    pending: filtered.filter(v=>v.status==='pending').length,
    exited: filtered.filter(v=>v.status==='exited').length,
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-black overflow-hidden">
      {/* FIXED HEADER */}
      <div className="shrink-0 bg-white border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">←</Link>
          <div><div className="font-bold text-sm">Visitors Log • Fixed Dashboard</div><div className="text- text-slate-500">{filtered.length} Records • Dashboard fix</div></div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text- font-bold">● LIVE</span>
      </div>

      {/* FIXED STATS + FILTERS */}
      <div className="shrink-0 max-w-7xl w-full mx-auto p-3 space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white border"><div className="text- text-slate-500">TOTAL</div><div className="text-lg font-bold">{stats.total}</div></div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100"><div className="text- text-amber-700">PENDING</div><div className="text-lg font-bold">{stats.pending}</div></div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100"><div className="text- text-emerald-700">INSIDE</div><div className="text-lg font-bold">{stats.inside}</div></div>
          <div className="p-3 rounded-2xl bg-slate-100 border"><div className="text- text-slate-600">EXITED</div><div className="text-lg font-bold">{stats.exited}</div></div>
        </div>

        <div className="p-4 rounded-3xl bg-white border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Name/Flat/Mobile/Vehicle" className="h-10 rounded-2xl bg-slate-50 border px-4 text-sm md:col-span-2"/>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="inside">Inside</option><option value="exited">Exited</option><option value="rejected">Rejected</option>
            </select>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm"/>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="h-10 rounded-2xl bg-slate-50 border px-3 text-sm"/>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={load} className="px-5 h-9 rounded-full bg-amber-400 text-black text-sm font-bold">🔍 Apply</button>
            <button onClick={downloadCSV} className="px-5 h-9 rounded-full bg-slate-900 text-white text-sm font-bold">⬇ CSV</button>
            <button onClick={()=>{ setSearch(''); setFilterStatus('all'); setDateFrom(''); setDateTo(''); load() }} className="px-5 h-9 rounded-full bg-slate-100 border text-sm font-bold">Reset</button>
          </div>
        </div>
      </div>

      {/* ONLY ENTRIES SCROLL - YEHI PART SCROLL HOGA */}
      <div className="flex-1 overflow-hidden max-w-7xl w-full mx-auto px-3 pb-3">
        <div className="h-full bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
          <div className="shrink-0 p-3 text- font-bold text-slate-500 flex justify-between border-b bg-slate-50">
            <span>↕️ Sirf ye list scroll hogi • Dashboard fix hai</span>
            <span className="px-2 py-1 rounded-full bg-white border">{filtered.length} rows</span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-w-">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900 text-white text- z-20">
                  <tr>
                    <th className="p-3 text-left whitespace-nowrap">📅 Date/Time</th>
                    <th className="p-3 text-left">📷 Photo</th>
                    <th className="p-3 text-left">👤 Visitor + Mobile</th>
                    <th className="p-3 text-left">🏠 Flat</th>
                    <th className="p-3 text-left">🚗 Vehicle</th>
                    <th className="p-3 text-left">📝 Purpose</th>
                    <th className="p-3 text-left">🔘 Status</th>
                    <th className="p-3 text-left">⏰ Entry / Exit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v=>(
                    <tr key={v.id} className="border-t hover:bg-amber-50/60">
                      <td className="p-3 text-xs whitespace-nowrap"><div className="font-bold">{new Date(v.created_at).toLocaleDateString('en-IN')}</div><div className="text- text-slate-500">{new Date(v.created_at).toLocaleTimeString('en-IN')}</div><div className="text- text-slate-400 mt-1">{v.guard_id||'Gate 1'}</div></td>
                      <td className="p-3">{v.photo_url? <img src={v.photo_url} className="w-10 h-10 rounded-xl object-cover border"/> : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">👤</div>}</td>
                      <td className="p-3"><div className="font-bold text-sm whitespace-nowrap">{v.visitor_name||v.name||'-'}</div><div className="text-xs text-slate-600">{v.mobile||'-'}</div></td>
                      <td className="p-3 font-bold whitespace-nowrap">{v.flat_no||'-'}</td>
                      <td className="p-3 text-xs font-bold whitespace-nowrap">{v.vehicle_no||'-'}</td>
                      <td className="p-3 text-xs max-w- truncate">{v.purpose||'-'}</td>
                      <td className="p-3"><span className={`px-2.5 py-1 rounded-full text- font-bold whitespace-nowrap ${v.status==='inside'?'bg-emerald-100 text-emerald-700': v.status==='pending'?'bg-amber-100 text-amber-700': v.status==='exited'?'bg-slate-200': 'bg-red-100 text-red-700'}`}>{v.status}</span></td>
                      <td className="p-3 text-xs whitespace-nowrap"><div>IN: {v.entry_time? new Date(v.entry_time).toLocaleTimeString('en-IN'):'-'}</div><div className="text- text-slate-500">OUT: {v.exit_time? new Date(v.exit_time).toLocaleTimeString('en-IN'):'-'}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
      .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #0f172a; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
      `}</style>
    </div>
  )
}
