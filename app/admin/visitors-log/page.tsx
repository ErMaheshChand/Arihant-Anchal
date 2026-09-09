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

  const load = async ()=>{
    let q = supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(1000)
    if(filterStatus!=='all') q = q.eq('status', filterStatus)
    if(dateFrom) q = q.gte('created_at', dateFrom)
    if(dateTo) q = q.lte('created_at', dateTo+'T23:59:59')
    const { data } = await q
    if(data) setData(data)
  }
  useEffect(()=>{ load() },[])

  const filtered = data.filter(v=>
 !search ||
    v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.mobile?.includes(search)
  )

  const downloadCSV = ()=>{
    const headers = ['Date','Time','Visitor','Mobile','Vehicle','Flat','Purpose','Status','Entry','Exit']
    const rows = filtered.map(v=>[
      new Date(v.created_at).toLocaleDateString('en-IN'),
      new Date(v.created_at).toLocaleTimeString('en-IN'),
      v.visitor_name||v.name||'',
      v.mobile||'',
      v.vehicle_no||'',
      v.flat_no||'',
      v.purpose||'',
      v.status||'',
      v.entry_time? new Date(v.entry_time).toLocaleString('en-IN'):'',
      v.exit_time? new Date(v.exit_time).toLocaleString('en-IN'):''
    ].map(x=>`"${(x||'').toString().replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','),...rows].join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `VISITORS_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-black overflow-hidden">
      {/* FIXED HEADER - Kabhi scroll nahi hoga */}
      <div className="shrink-0 bg-white border-b px-4 h-14 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">←</Link>
          <div><div className="font-bold text-sm">Visitors Log • Fixed Dashboard</div><div className="text- text-slate-500">{filtered.length} Records • Dashboard fix, sirf entries scroll</div></div>
        </div>
        <button onClick={downloadCSV} className="px-4 h-8 rounded-full bg-slate-900 text-white text-xs font-bold">⬇️ CSV</button>
      </div>

      {/* FIXED FILTERS - Kabhi scroll nahi hoga */}
      <div className="shrink-0 p-3 bg-white border-b space-y-3 z-40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-900 text-white"><div className="opacity-70 text-">TOTAL</div><div className="font-bold text-sm">{filtered.length}</div></div>
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800"><div className="text-">PENDING</div><div className="font-bold text-sm">{filtered.filter(v=>v.status==='pending').length}</div></div>
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800"><div className="text-">INSIDE</div><div className="font-bold text-sm">{filtered.filter(v=>v.status==='inside').length}</div></div>
          <div className="p-2.5 rounded-2xl bg-slate-100"><div className="text-">EXITED</div><div className="font-bold text-sm">{filtered.filter(v=>v.status==='exited').length}</div></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Name/Flat/Mobile" className="h-9 rounded-full bg-slate-50 border px-4 text-xs w-48"/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-9 rounded-full bg-slate-50 border px-3 text-xs font-bold">
            <option value="all">All Status</option><option value="pending">Pending</option><option value="inside">Inside</option><option value="exited">Exited</option><option value="rejected">Rejected</option>
          </select>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-9 rounded-full bg-slate-50 border px-3 text-xs"/>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="h-9 rounded-full bg-slate-50 border px-3 text-xs"/>
          <button onClick={load} className="h-9 px-4 rounded-full bg-amber-400 text-black text-xs font-bold">Apply</button>
        </div>
      </div>

      {/* SCROLLABLE TABLE - Sirf ye scroll hoga */}
      <div className="flex-1 overflow-hidden p-3">
        <div className="h-full bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
          {/* TABLE HEADER - FIXED */}
          <div className="shrink-0 overflow-x-auto overflow-y-hidden border-b bg-slate-900 text-white text-">
            <div className="min-w- flex">
              <div className="p-3 w- shrink-0 font-bold">📅 Date/Time</div>
              <div className="p-3 w- shrink-0">📷</div>
              <div className="p-3 w- shrink-0">👤 Visitor</div>
              <div className="p-3 w- shrink-0">🏠 Flat</div>
              <div className="p-3 w- shrink-0">🚗 Vehicle</div>
              <div className="p-3 w- shrink-0">📝 Purpose</div>
              <div className="p-3 w- shrink-0">🔘 Status</div>
              <div className="p-3 w- shrink-0">⏰ Entry/Exit</div>
            </div>
          </div>

          {/* TABLE BODY - SCROLLABLE */}
          <div className="flex-1 overflow-auto custom-scroll">
            <div className="min-w-">
              {filtered.map(v=>(
                <div key={v.id} className="flex border-b hover:bg-amber-50/50 text-sm">
                  <div className="p-3 w- shrink-0 text-xs border-r bg-white sticky left-0 z-10">
                    <div className="font-bold">{new Date(v.created_at).toLocaleDateString('en-IN')}</div>
                    <div className="text- text-slate-500">{new Date(v.created_at).toLocaleTimeString('en-IN')}</div>
                    <div className="text- text-slate-400">{v.guard_id||'Gate 1'}</div>
                  </div>
                  <div className="p-3 w- shrink-0">{v.photo_url? <img src={v.photo_url} className="w-9 h-9 rounded-xl object-cover border"/> : <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs">👤</div>}</div>
                  <div className="p-3 w- shrink-0"><div className="font-bold text-sm truncate">{v.visitor_name||v.name||'-'}</div><div className="text-xs text-slate-600">{v.mobile||'-'}</div></div>
                  <div className="p-3 w- shrink-0 font-bold">{v.flat_no||'-'}</div>
                  <div className="p-3 w- shrink-0 text-xs font-bold truncate">{v.vehicle_no||'-'}</div>
                  <div className="p-3 w- shrink-0 text-xs truncate">{v.purpose||'-'}</div>
                  <div className="p-3 w- shrink-0"><span className={`px-2 py-1 rounded-full text- font-bold ${v.status==='inside'?'bg-emerald-100 text-emerald-700': v.status==='pending'?'bg-amber-100 text-amber-700': v.status==='exited'?'bg-slate-200': 'bg-red-100 text-red-700'}`}>{v.status}</span></div>
                  <div className="p-3 w- shrink-0 text-xs"><div>IN: {v.entry_time? new Date(v.entry_time).toLocaleTimeString('en-IN'):'-'}</div><div className="text- text-slate-500">OUT: {v.exit_time? new Date(v.exit_time).toLocaleTimeString('en-IN'):'-'}</div></div>
                </div>
              ))}
              {filtered.length===0 && <div className="p-10 text-center text-slate-400">Koi record nahi</div>}
            </div>
          </div>

          {/* FOOTER - FIXED */}
          <div className="shrink-0 p-2 bg-slate-50 border-t text- text-center text-slate-500">
            ↕️ Sirf entries scroll hongi • Dashboard fix hai • {filtered.length} rows • Left-right bhi scroll karo
          </div>
        </div>
      </div>

      <style>{`
       .custom-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
       .custom-scroll::-webkit-scrollbar-thumb { background: #0f172a; border-radius: 10px; }
       .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
      `}</style>
    </div>
  )
}
