"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin(){
  const [tab, setTab] = useState<'pending'|'approved'|'rejected'>('pending')
  const [reqs, setReqs] = useState<any[]>([])

  const load = async (status: string) => {
    const { data } = await supabase.from('residents').select('*').eq('status', status).order('created_at',{ascending:false})
    if(data) setReqs(data)
  }

  useEffect(()=>{ load(tab) },[tab])

  const approve = async (r:any) => {
    await supabase.from('residents').update({
      status:'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'Admin - 8769909700'
    }).eq('id', r.id)
    setReqs(s=>s.filter(x=>x.id!==r.id))
    alert(`${r.flat_no} - ${r.name} Approved & Saved!`)
  }

  const reject = async (r:any) => {
    await supabase.from('residents').update({
      status:'rejected',
      approved_at: new Date().toISOString()
    }).eq('id', r.id)
    setReqs(s=>s.filter(x=>x.id!==r.id))
    alert('Rejected - Record save rahega')
  }

  return (
    <div className="p-4 max-w- mx-auto bg-[#F8FAFC] min-h-screen">
      <h1 className="text- font-bold">Arihant Anchal - Admin Panel</h1>
      <p className="text- text-black/60">Sab data future ke liye save hota rahega</p>

      <div className="mt-4 grid grid-cols-3 p-1 bg-[#E2E8F0] rounded-full">
        <button onClick={()=>setTab('pending')} className={`h-9 rounded-full text- font-bold ${tab==='pending'?'bg-[#0B1120] text-white':''}`}>Pending</button>
        <button onClick={()=>setTab('approved')} className={`h-9 rounded-full text- font-bold ${tab==='approved'?'bg-[#0B1120] text-white':''}`}>Approved</button>
        <button onClick={()=>setTab('rejected')} className={`h-9 rounded-full text- font-bold ${tab==='rejected'?'bg-[#0B1120] text-white':''}`}>Rejected</button>
      </div>

      <div className="mt-4 text- font-bold text-black/60">{tab.toUpperCase()} : {reqs.length} Records</div>

      <div className="mt-3 space-y-3">
        {reqs.map(r=>(
          <div key={r.id} className="p-4 bg-white rounded- border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-">{r.flat_no} - {r.name}</div>
                <div className="text- mt-1">📱 {r.mobile} | {r.role?.toUpperCase()}</div>
                <div className="text- text-black/60">📧 {r.email || 'No email'} | 📅 {new Date(r.created_at).toLocaleDateString('en-IN')}</div>
                {r.approved_at && <div className="text- text-green-600 mt-1">✅ {tab} on {new Date(r.approved_at).toLocaleString('en-IN')}</div>}
              </div>
              <span className={`px-2 py-1 rounded-full text- font-bold h-fit ${r.role==='owner'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{r.role}</span>
            </div>

            {tab==='pending' && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={()=>reject(r)} className="h- rounded-full bg-red-50 text-red-600 font-bold border border-red-200">❌ Reject</button>
                <button onClick={()=>approve(r)} className="h- rounded-full bg-[#0B1120] text-white font-bold">✅ Approve & Save</button>
              </div>
            )}
          </div>
        ))}
        {reqs.length===0 && <div className="p-8 bg-white rounded- text-center text-black/50">Koi {tab} record nahi hai</div>}
      </div>

      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded- text-">
        <b>Future ke liye:</b> Saare residents approved/rejected sabhi isi table me hamesha save rahenge. Delete kabhi nahi hoga. Aap kabhi bhi Pending / Approved / Rejected tab se dekh sakte ho.
      </div>
    </div>
  )
}
