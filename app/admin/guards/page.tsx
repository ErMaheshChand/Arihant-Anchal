'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Guard = { id:string, guard_id:string, name:string, mobile:string, gate_no:number, shift:string, salary_per_day:number, photo_url:string, id_proof_url:string, status:string, created_at:string }

export default function AdminGuards(){
  const [guards,setGuards]=useState<Guard[]>([])
  const [filter,setFilter]=useState<'pending'|'approved'|'all'>('pending')
  const [loading,setLoading]=useState(true)

  const fetchGuards=async()=>{
    setLoading(true)
    let q = supabase.from('guards').select('*').order('created_at',{ascending:false})
    if(filter!=='all') q = q.eq('status',filter)
    const { data } = await q
    setGuards((data as any)||[])
    setLoading(false)
  }
  useEffect(()=>{fetchGuards()},[filter])

  const updateStatus=async(id:string,status:'approved'|'rejected')=>{
    // Approve time par bhi 3 per gate check
    const guard = guards.find(g=>g.id===id)
    if(status==='approved' && guard){
      const { data: countData } = await supabase.from('guards').select('id').eq('gate_no',guard.gate_no).eq('status','approved')
      if(countData && countData.length>=3){
        alert(`❌ Gate ${guard.gate_no} par already 3 approved guards hain.`)
        return
      }
    }
    const { error } = await supabase.from('guards').update({status}).eq('id',id)
    if(!error) fetchGuards()
  }

  const gateCount = (gateNo:number)=> guards.filter(g=>g.gate_no===gateNo && g.status!=='rejected').length
  const approvedCount = (gateNo:number)=> guards.filter(g=>g.gate_no===gateNo && g.status==='approved').length

  return(
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      <header className="max-w-7xl mx-auto px-6 h- flex items-center justify-between border-b border-white/10">
        <Link href="/admin" className="text-[#D4AF37] text-sm">← Admin Dashboard</Link>
        <div className="font-bold">Guard Approval <span className="text-white/40 font-normal text-sm">(3 per Gate Locked)</span></div>
        <Link href="/" className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Home</Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Gate Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[1,2,3,4,5].map(gate=>(
            <div key={gate} className="bg-[#151A27] border border-white/10 rounded-2xl p-4">
              <div className="text- text-white/40 tracking-widest">GATE {gate}</div>
              <div className="mt-1 text- font-bold">{guards.filter(g=>g.gate_no===gate && g.status==='approved').length}/3 <span className="text-white/30 text-sm font-normal">Approved</span></div>
              <div className="mt-1 text- text-white/30">{guards.filter(g=>g.gate_no===gate).length} total (pending+approved)</div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#D4AF37]" style={{width:`${(guards.filter(g=>g.gate_no===gate && g.status==='approved').length/3)*100}%`}}></div></div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mt-6 flex gap-2">
          {(['pending','approved','all'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 h-9 rounded-full text-xs font-bold capitalize border ${filter===f?'bg-[#D4AF37] text-black border-[#D4AF37]':'bg-white/5 border-white/10 text-white/60'}`}>{f}</button>
          ))}
          <button onClick={fetchGuards} className="ml-auto px-4 h-9 rounded-full text-xs bg-white/5 border border-white/10">Refresh</button>
        </div>

        {/* List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading? <div className="text-white/40 text-sm">Loading...</div> : guards.length===0? <div className="text-white/40 text-sm">No guards found</div> :
          guards.map(g=>(
            <div key={g.id} className="bg-[#151A27] border border-white/10 rounded- p-4 flex gap-4">
              <img src={g.photo_url} alt="" className="w- h- rounded-2xl object-cover bg-white/5"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{g.name}</span>
                  <span className={`text- px-2 py-0.5 rounded-full ${g.status==='approved'?'bg-green-500/20 text-green-300':g.status==='pending'?'bg-[#D4AF37]/20 text-[#D4AF37]':'bg-red-500/20 text-red-300'}`}>{g.status}</span>
                </div>
                <div className="text- text-white/50 mt-1">{g.guard_id} • {g.mobile} • Gate {g.gate_no} • {g.shift} • ₹{g.salary_per_day}/day</div>
                <div className="flex gap-2 mt-3">
                  <a href={g.id_proof_url} target="_blank" className="text- bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">ID Proof</a>
                  {g.status==='pending' && <>
                    <button onClick={()=>updateStatus(g.id,'approved')} className="text- bg-[#D4AF37] text-black font-bold px-3 py-1.5 rounded-full">Approve</button>
                    <button onClick={()=>updateStatus(g.id,'rejected')} className="text- bg-red-500/20 text-red-300 border border-red-500/20 px-3 py-1.5 rounded-full">Reject</button>
                  </>}
                  {g.status==='approved' && <button onClick={()=>updateStatus(g.id,'rejected')} className="text- bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Revoke</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
