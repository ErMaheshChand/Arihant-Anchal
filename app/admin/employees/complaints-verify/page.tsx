'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ComplaintVerify(){
  const [comps,setComps]=useState<any[]>([])
  const [filter,setFilter]=useState<'pending'|'verified'|'all'>('pending')

  const load=async()=>{
    const {data}=await supabase.from('employee_complaints').select('*').order('created_at',{ascending:false})
    if(data) setComps(data)
  }
  useEffect(()=>{load()},[])

  const verify=async(c:any, approved:boolean, amt:number)=>{
    if(approved){
      await supabase.from('employee_complaints').update({status:'verified', verified_by:'MANAGER', verified_at:new Date().toISOString(), deduction_amount:amt}).eq('id',c.id)
      // employee ki total deduction me add
      const {data:emp}=await supabase.from('employees').select('*').eq('employee_code',c.employee_code).single()
      if(emp){
        const newDed=Number(emp.deduction||0)+amt
        await supabase.from('employees').update({deduction:newDed}).eq('id',emp.id)
      }
      alert(`✅ Verified — ₹${amt} deduction lagega salary me`)
    }else{
      await supabase.from('employee_complaints').update({status:'rejected', verified_by:'MANAGER', verified_at:new Date().toISOString(), deduction_amount:0}).eq('id',c.id)
      alert('❌ Rejected — No deduction')
    }
    load()
  }

  const filtered=filter==='all'?comps:comps.filter(x=>x.status===filter)

  return(
    <div className="min-h-screen bg-[#f6f7fb] text-black p-3">
      <div className="max-w- mx-auto space-y-3">
        <div className="bg-white rounded-2xl border p-4 flex justify-between flex-wrap gap-2">
          <div><h1 className="font-black text-lg">🛡️ Manager Verify — Employee Complaints</h1><div className="text-xs opacity-60">Resident complaint → Manager verify → Tabhi deduction</div></div>
          <div className="flex gap-2">
            <button onClick={()=>setFilter('pending')} className={`h-10 px-4 rounded-xl text-sm font-bold border ${filter==='pending'?'bg-amber-500 text-white border-amber-500':'bg-white'}`}>Pending ({comps.filter(c=>c.status==='pending').length})</button>
            <button onClick={()=>setFilter('verified')} className={`h-10 px-4 rounded-xl text-sm font-bold border ${filter==='verified'?'bg-emerald-600 text-white border-emerald-600':'bg-white'}`}>Verified</button>
            <button onClick={()=>setFilter('all')} className={`h-10 px-4 rounded-xl text-sm font-bold border ${filter==='all'?'bg-black text-white':'bg-white'}`}>All</button>
          </div>
        </div>

        <div className="grid gap-2">
          {filtered.map(c=>(
            <div key={c.id} className={`bg-white rounded-2xl border p-4 flex flex-col md:flex-row justify-between gap-3 ${c.status==='pending'?'border-amber-300':c.status==='verified'?'border-emerald-200 bg-emerald-50/50':''}`}>
              <div className="flex-1">
                <div className="font-black text-sm">{c.employee_code} • {c.category} • Flat {c.complaint_by_flat}</div>
                <div className="text-sm mt-1">{c.description}</div>
                <div className="text- opacity-60 mt-1">{new Date(c.created_at).toLocaleString()} • Status: <b>{c.status.toUpperCase()}</b> {c.verified_by&&`• Verified by ${c.verified_by}`}</div>
              </div>
              {c.status==='pending'&&(
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex gap-1">
                    <button onClick={()=>verify(c,true,100)} className="h-9 px-4 rounded-full bg-red-600 text-white text-xs font-black">Verify -₹100</button>
                    <button onClick={()=>verify(c,true,200)} className="h-9 px-4 rounded-full bg-red-700 text-white text-xs font-black">-₹200</button>
                    <button onClick={()=>verify(c,true,500)} className="h-9 px-4 rounded-full bg-black text-white text-xs font-black">-₹500</button>
                  </div>
                  <button onClick={()=>verify(c,false,0)} className="h-9 px-4 rounded-full bg-slate-100 text-xs font-bold">❌ Reject</button>
                </div>
              )}
              {c.status!=='pending'&&(
                <div className="text-right"><div className={`text-sm font-black ${c.status==='verified'?'text-red-700':'text-slate-500'}`}>{c.status==='verified'?`-₹${c.deduction_amount}`:'Rejected'}</div><div className="text- opacity-60">Deduction</div></div>
              )}
            </div>
          ))}
          {filtered.length===0&&<div className="bg-white rounded-2xl border p-10 text-center text-xs opacity-40">Koi complaint nahi</div>}
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs">
          <div className="font-bold">Flow:</div>
          <div className="opacity-70 mt-1">1. Resident / Security / Admin complaint dalega (complaints table me) → Pending</div>
          <div className="opacity-70">2. Manager yaha verify karega → Approve = Deduction employee ke account me add</div>
          <div className="opacity-70">3. Salary Lock ke time auto cut hoga → Salary Slip me dikhega</div>
        </div>
      </div>
    </div>
  )
}
