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
    const headers = ['Date','Time','Visitor Name','Mobile','Vehicle No','Flat No','Resident Flat','Purpose','Status','Guard ID','Entry Time','Exit Time','Photo URL']
    const rows = filtered.map(v=>[
      new Date(v.created_at).toLocaleDateString('en-IN'),
      new Date(v.created_at).toLocaleTimeString('en-IN'),
      v.visitor_name||v.name||'',
      v.mobile||'',
      v.vehicle_no||'',
      v.flat_no||'',
      v.resident_flat||'',
      v.purpose||'',
      v.status||'',
      v.guard_id||'Gate 1',
      v.entry_time? new Date(v.entry_time).toLocaleString('en-IN') : '',
      v.exit_time? new Date(v.exit_time).toLocaleString('en-IN') : '',
      v.photo_url||''
    ].map(x=>`"${(x||'').toString().replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','),...rows].join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `ARIHANT_VISITORS_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadExcelHTML = ()=>{
    const tableHtml = `
      <table border="1">
        <tr><th>Date</th><th>Visitor</th><th>Mobile</th><th>Vehicle</th><th>Flat</th><th>Purpose</th><th>Status</th><th>Entry</th><th>Exit</th></tr>
        ${filtered.map(v=>`<tr><td>${new Date(v.created_at).toLocaleString('en-IN')}</td><td>${v.visitor_name||v.name}</td><td>${v.mobile}</td><td>${v.vehicle_no||''}</td><td>${v.flat_no}</td><td>${v.purpose}</td><td>${v.status}</td><td>${v.entry_time? new Date(v.entry_time).toLocaleString('en-IN'):''}</td><td>${v.exit_time? new Date(v.exit_time).toLocaleString('en-IN'):''}</td></tr>`).join('')}
      </table>`
    const blob = new Blob([tableHtml], {type:'application/vnd.ms-excel'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `VISITORS_${new Date().toISOString().split('T')[0]}.xls`; a.click()
  }

  const stats = {
    total: filtered.length,
    inside: filtered.filter(v=>v.status==='inside').length,
    pending: filtered.filter(v=>v.status==='pending').length,
    exited: filtered.filter(v=>v.status==='exited').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <div className="sticky top-0 z-30 bg-white border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">←</Link>
          <div><div className="font-bold text-sm">Visitors Log • Separate Page</div><div className="text- text-slate-500">Permanent Records • Supabase</div></div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text- font-bold">● LIVE</span>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-4 rounded-3xl bg-white border shadow-sm"><div className="text- text-slate-500">TOTAL</div><div className="text-xl font-bold">{stats.total}</div></div>
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100"><div className="text- text-amber-700">PENDING</div><div className="text-xl font-bold">{stats.pending}</div></div>
          <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100"><div className="text- text-emerald-700">INSIDE</div><div className="text-xl font-bold">{stats.inside}</div></div>
          <div className="p-4 rounded-3xl bg-slate-100 border"><div className="text- text-slate-600">EXITED</div><div className="text-xl font-bold">{stats.exited}</div></div>
        </div>

        {/* FILTERS */}
        <div className="mt-4 p-5 rounded-3xl bg-white border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Name/Flat/Mobile/Vehicle" className="h-11 rounded-2xl bg-slate-50 border px-4 text-sm md:col-span-2"/>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-11 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="inside">Inside</option><option value="exited">Exited</option><option value="rejected">Rejected</option>
            </select>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-11 rounded-2xl bg-slate-50 border px-3 text-sm"/>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="h-11 rounded-2xl bg-slate-50 border px-3 text-sm"/>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={load} disabled={loading} className="px-5 h-10 rounded-full bg-amber-400 text-black text-sm font-bold shadow">{loading?'Loading...':'🔍 Filter Apply'}</button>
            <button onClick={downloadCSV} className="px-5 h-10 rounded-full bg-slate-900 text-white text-sm font-bold">⬇️ CSV Download</button>
            <button onClick={downloadExcelHTML} className="px-5 h-10 rounded-full bg-emerald-600 text-white text-sm font-bold">📊 Excel Download</button>
            <button onClick={()=>{ setSearch(''); setFilterStatus('all'); setDateFrom(''); setDateTo(''); load() }} className="px-5 h-10 rounded-full bg-slate-100 border text-sm font-bold">Reset</button>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-4 p-2 rounded-3xl bg-white border shadow-sm overflow-hidden">
          <div className="overflow-auto max-h- rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-900 text-white text-xs z-10">
                <tr><th className="p-3 text-left whitespace-nowrap">Date/Time</th><th className="p-3 text-left">Photo</th><th className="p-3 text-left">Visitor</th><th className="p-3 text-left">Flat</th><th className="p-3 text-left">Vehicle</th><th className="p-3 text-left">Purpose</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Entry/Exit</th></tr>
              </thead>
              <tbody>
                {filtered.map(v=>(
                  <tr key={v.id} className="border-t hover:bg-amber-50/50">
                    <td className="p-3 text-xs whitespace-nowrap">{new Date(v.created_at).toLocaleString('en-IN')}<div className="text- text-slate-400">{v.guard_id}</div></td>
                    <td className="p-3">{v.photo_url? <img src={v.photo_url} className="w-10 h-10 rounded-xl object-cover border"/> : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs">👤</div>}</td>
                    <td className="p-3"><div className="font-bold text-sm">{v.visitor_name||v.name}</div><div className="text-xs text-slate-500">{v.mobile}</div></td>
                    <td className="p-3 font-bold">{v.flat_no}<div className="text- text-slate-400">{v.resident_flat}</div></td>
                    <td className="p-3 text-xs font-bold">{v.vehicle_no||'-'}</td>
                    <td className="p-3 text-xs">{v.purpose}</td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-full text- font-bold ${v.status==='inside'?'bg-emerald-100 text-emerald-700': v.status==='pending'?'bg-amber-100 text-amber-700': v.status==='exited'?'bg-slate-200 text-slate-700': 'bg-red-100 text-red-700'}`}>{v.status}</span></td>
                    <td className="p-3 text-xs"><div>{v.entry_time? new Date(v.entry_time).toLocaleTimeString('en-IN'):''}</div><div className="text- text-slate-500">{v.exit_time? `Exit: ${new Date(v.exit_time).toLocaleTimeString('en-IN')}` : '-'}</div></td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={8} className="p-10 text-center text-slate-400">Koi record nahi mila</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-3xl bg-slate-900 text-white text-xs">
          <div className="font-bold">📌 PLAN:</div>
          <div className="mt-2 opacity-80">• Abhi alag page: <span className="font-bold text-amber-300">/admin/visitors-log</span> — pura data yahi dekho, download karo</div>
          <div className="opacity-80">• Data Supabase me permanent save hai — 1000 records limit, date filter se pura history</div>
          <div className="opacity-80">• Baad me isko `/admin` dashboard me tab ke roop me merge kar denge — confusion nahi hoga</div>
        </div>
      </div>
    </div>
  )
}
