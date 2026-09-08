'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResidentVisitorApproval({ flatNo }: {flatNo: string}){
  const [pending, setPending] = useState<any[]>([])

  useEffect(()=>{
    const load = async () => {
      const { data } = await supabase.from('visitors')
       .select('*')
       .eq('resident_flat', flatNo.toUpperCase())
       .eq('status','pending')
       .order('entry_time',{ascending:false})
      if(data) setPending(data)
    }
    load()

    // Realtime: Guard ne naya bheja to turant dikhega
    const ch = supabase.channel('visitor-approval-'+flatNo)
     .on('postgres_changes', {event:'INSERT', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo.toUpperCase()}`},
      (payload)=>{
        if(payload.new.status==='pending') setPending(p=>[payload.new,...p])
      })
     .subscribe()

    return ()=>{ supabase.removeChannel(ch) }
  },[flatNo])

  const action = async (id:string, status:'approved'|'rejected')=>{
    await supabase.from('visitors').update({status}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  if(pending.length===0) return <div className="p-4 text-center text-sm text-black/40 bg-white rounded-2xl border">No pending visitors ✅</div>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">🔔 Visitor Approval Required</span>
        <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text- animate-pulse">{pending.length} New</span>
      </div>

      {pending.map(v=>(
        <div key={v.id} className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm animate-in">
          <div className="flex gap-3">
            {v.photo_url? <img src={v.photo_url} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl">👤</div>}
            <div className="flex-1">
              <div className="font-bold text-sm">{v.name} • {v.mobile}</div>
              <div className="text-xs text-black/60 mt-0.5">🚗 {v.vehicle_no || 'No Vehicle'} • {v.purpose}</div>
              <div className="text- text-black/40 mt-1">Gate 1 • {new Date(v.entry_time).toLocaleTimeString()} • Guard: {v.guard_id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={()=>action(v.id,'rejected')} className="h-11 rounded-full bg-[#F1F5F9] border text-sm font-bold">❌ Reject</button>
            <button onClick={()=>action(v.id,'approved')} className="h-11 rounded-full bg-[#0B1120] text-white text-sm font-bold">✅ Approve Entry</button>
          </div>
        </div>
      ))}
    </div>
  )
}
