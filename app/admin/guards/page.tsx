'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminGuardsLight(){
  const [guards,setGuards]=useState<any[]>([])
  const [search,setSearch]=useState('')

  useEffect(()=>{ supabase.from('guards').select('*').order('created_at',{ascending:false}).then(r=>setGuards(r.data||[])) },[])

  const filtered = guards.filter(g=>
   !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.mobile.includes(search)
  )

  return(
    <div className="min-h-screen bg-[#FAFAFB] p-3 md:p-6">
      {/* Stats - 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-7xl mx-auto">
        {[
          {l:'TOTAL',v:guards.length,bg:'bg-white'},
          {l:'PENDING',v:guards.filter(g=>g.status==='pending').length,bg:'bg-[#FFFBEB]'},
          {l:'INSIDE / APPROVED',v:guards.filter(g=>g.status==='approved').length,bg:'bg-[#ECFDF5]'},
          {l:'EXITED / REJECTED',v:guards.filter(g=>g.status==='rejected').length,bg:'bg-[#FEF2F2]'},
        ].map(c=>(
          <div key={c.l} className={`${c.bg} rounded- border border-black/5 p-5 shadow-sm`}>
            <div className="text- tracking-widest text-black/40">{c.l}</div>
            <div className="text- font-black mt-1">{c.v}</div>
          </div>
        ))}
      </div>

      {/* Search - Light */}
      <div className="max-w-7xl mx-auto mt-4 bg-white rounded- border border-black/5 p-4 shadow-sm flex gap-2 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Name / Mobile / Aadhaar" className="flex-1 min-w- h-11 rounded-full bg-[#F8FAFC] border border-black/5 px-5 text-sm outline-none"/>
        <button className="h-11 px-6 rounded-full bg-[#FEF3C7] border border-amber-100 text-sm font-bold">Apply</button>
        <button className="h-11 px-6 rounded-full bg-[#F1F5F9] border text-sm font-bold">Reset</button>
      </div>

      {/* Table - Center Shrink on Mobile */}
      <div className="max-w-7xl mx-auto mt-4">
        <div className="bg-white rounded- border border-black/5 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#F8FAFC] border-b flex justify-between">
            <span className="text-xs font-bold">Guard List • Only this scrolls</span>
            <span className="text-xs bg-white border px-3 py-1 rounded-full">{filtered.length} rows</span>
          </div>
          <div className="overflow-auto max-h- mx-auto">
            <div className="min-w- md:min-w-0">
              <table className="w-full text-">
                <thead className="sticky top-0 bg-[#F8FAFC] text-black/60 z-10">
                  <tr className="text-left border-b">
                    <th className="p-4 font-semibold">Photo</th>
                    <th className="p-4 font-semibold">Visitor Name</th>
                    <th className="p-4 font-semibold">Mobile</th>
                    <th className="p-4 font-semibold">Gate/Flat</th>
                    <th className="p-4 font-semibold">Aadhaar No</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g,i)=>(
                    <tr key={g.id} className={`${i%2===0?'bg-white':'bg-[#FBFCFE]'} hover:bg-[#F1F5F9] border-b border-black/[0.04]`}>
                      <td className="p-4"><img src={g.photo_url} className="w-10 h-10 rounded- object-cover border"/></td>
                      <td className="p-4 font-bold">{g.name}</td>
                      <td className="p-4 text-black/60">{g.mobile}</td>
                      <td className="p-4 font-medium">Gate {g.gate_no}</td>
                      <td className="p-4 text-black/60">XXXX-XXXX-{g.mobile?.slice(-4)}</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text- font-bold ${g.status==='approved'?'bg-[#ECFDF5] text-[#065F46]':'bg-[#FEF9E8] text-[#92400E]'}`}>{g.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
