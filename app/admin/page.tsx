"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin(){
  const [reqs, setReqs] = useState<any[]>([])

  const load = async () => {
    const { data } = await supabase.from('residents').select('*').eq('status','pending').order('created_at',{ascending:false})
    if(data) setReqs(data)
  }

  useEffect(()=>{ load() },[])

  const approve = async (r:any) => {
    await supabase.from('residents').update({status:'approved'}).eq('id', r.id)
    await supabase.from('admin_requests').update({status:'approved'}).eq('flat_no', r.flat_no).eq('mobile', r.mobile)
    setReqs(s=>s.filter(x=>x.id!==r.id))
    alert(r.flat_no + ' Approved!')
  }
  const reject = async (r:any) => {
    await supabase.from('residents').update({status:'rejected'}).eq('id', r.id)
    setReqs(s=>s.filter(x=>x.id!==r.id))
  }

  return (
    <div className="p-4 max-w- mx-auto bg-[#F8FAFC] min-h-screen">
      <h1 className="text- font-bold">🔔 Pending Requests ({reqs.length})</h1>

      <div className="mt-4 space-y-3">
        {reqs.length===0 && <div className="p-6 bg-white rounded- text-center text-black/50">Koi pending request nahi hai</div>}
        {reqs.map(r=>(
          <div key={r.id} className="p-4 bg-white rounded- border shadow-sm">
            <div className="flex justify-between">
              <span className="font-bold text-">{r.flat_no}</span>
              <span className={`px-2 py-1 rounded-full text- font-bold ${r.role==='owner'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{r.role?.toUpperCase()}</span>
            </div>
            <div className="mt-2 text-"><b>Naam:</b> {r.name}</div>
            <div className="text-"><b>Mobile:</b> {r.mobile}</div>
            <div className="text- text-black/60">{r.email || 'Email nahi diya'}</div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={()=>reject(r)} className="h- rounded-full bg-gray-100 font-bold">❌ Reject</button>
              <button onClick={()=>approve(r)} className="h- rounded-full bg-[#0B1120] text-white font-bold">✅ Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
