'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GuardEntryPage(){
  const [guards,setGuards]=useState<any[]>([])
  const [search,setSearch]=useState('')
  const [status,setStatus]=useState('all')

  useEffect(()=>{ fetchData() },[])
  const fetchData=async()=>{
    const { data } = await supabase.from('guards').select('*').order('created_at',{ascending:false})
    setGuards(data||[])
  }
  const filtered = guards.filter(g=>{
    const s = search.toLowerCase()
    const match =!s || g.name.toLowerCase().includes(s) || g.mobile.includes(s) || g.guard_id.toLowerCase().includes(s)
    const statusMatch = status==='all' || g.status===status
    return match && statusMatch
  })
  const total = guards.length
  const pending = guards.filter(g=>g.status==='pending').length
  const inside = guards.filter(g=>g.status==='approved').length
  const exited = guards.filter(g=>g.status==='rejected').length

  return(
    <div className="min-h-screen bg-[#F6F7FB] p-4">
      {/* FIXED DASHBOARD */}
      <div className="sticky top-0 z-20 bg-[#F6F7FB] pb-3">
        <div className="grid grid-cols-4 gap-3">
          {[
            {l:'TOTAL',v:total,bg:'bg-white'},
            {l:'PENDING',v:pending,bg:'bg-[#FFFBEB]'},
            {l:'INSIDE',v:inside,bg:'bg-[#ECFDF5]'},
            {l:'EXITED',v:exited,bg:'bg-[#F5F5F5]'},
          ].map(c=>(
            <div key={c.l} className={`${c.bg} rounded- border border-black/5 p-4`}>
              <div className="text- tracking-widest text-black/40">{c.l}</div>
              <div className="text- font-black mt-1">{c.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-white rounded- border p-3 flex gap-2 flex-wrap shadow-sm">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Name/Flat/Mobile/Vehicle" className="flex-1 min-w- h-10 rounded-full bg-black/5 px-4 text-sm outline-none"/>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="h-10 rounded-full bg-black/5 px-4 text-sm">
            <option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
          <button className="h-10 px-5 rounded-full bg-[#FDE68A] text-sm font-bold">Apply</button>
          <button className="h-10 px-5 rounded-full bg-black text-white text-sm font-bold">CSV</button>
        </div>
        <div className="mt-3 bg-[#EFF6FF] border border-blue-100 rounded-full px-4 py-2 flex justify-between items-center">
          <span className="text- font-bold text-blue-900">➕ Sirf ye list scroll hogi • Dashboard fix hai</span>
          <span className="text- bg-white border px-2 py-1 rounded-full">{filtered.length} rows</span>
        </div>
      </div>

      {/* SCROLL ONLY LIST */}
      <div className="mt-3 bg-white rounded- border overflow-hidden shadow-sm">
        <div className="overflow-auto max-h- custom-scroll">
          <table className="w-full text-">
            <thead className="sticky top-0 bg-[#0F172A] text-white">
              <tr className="text-left">
                <th className="p-3">Date/Time</th><th className="p-3">Photo</th><th className="p-3">Visitor + Mobile</th><th className="p-3">Flat</th><th className="p-3">Status</th><th className="p-3">Entry / Exit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g=>(
                <tr key={g.id} className="border-t hover:bg-black/5">
                  <td className="p-3"><div className="font-bold">{new Date(g.created_at).toLocaleDateString()}</div><div className="text-black/40 text-">Gate {g.gate_no}</div></td>
                  <td className="p-3"><img src={g.photo_url||'https://i.pravatar.cc/100'} className="w-9 h-9 rounded-xl object-cover"/></td>
                  <td className="p-3"><div className="font-bold uppercase">{g.name}</div><div className="text-black/40 text-">{g.mobile}</div></td>
                  <td className="p-3 font-bold">Gate {g.gate_no}</td>
                  <td className="p-3"><span className={`px-2.5 py-1 rounded-full text- font-bold ${g.status==='approved'?'bg-[#D1FAE5] text-[#065F46]':g.status==='pending'?'bg-[#FEF3C7] text-[#92400E]':'bg-gray-200'}`}>{g.status}</span></td>
                  <td className="p-3 text-">ID: {g.guard_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
