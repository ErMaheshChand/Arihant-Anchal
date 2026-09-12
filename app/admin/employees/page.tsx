'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminEmpStep1(){
  const [list,setList]=useState<any[]>([])
  const [attAll,setAttAll]=useState<any[]>([])
  const [comps,setComps]=useState<any[]>([])
  const [advLedger,setAdvLedger]=useState<any[]>([])
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
  const [search,setSearch]=useState('')
  const [sel,setSel]=useState<any>(null)
  const [showAdv,setShowAdv]=useState<any>(null)
  const [showComp,setShowComp]=useState<any>(null)
  const [advAmt,setAdvAmt]=useState('')
  const [advReason,setAdvReason]=useState('')
  const [compDesc,setCompDesc]=useState('')

  const load=async()=>{
    const {data}=await supabase.from('employees').select('*').order('created_at',{ascending:false})
    if(data) setList(data)
    const {data:a}=await supabase.from('employee_attendance').select('*').gte('date',`${month}-01`).lte('date',`${month}-31`)
    if(a) setAttAll(a)
    const {data:c}=await supabase.from('employee_complaints').select('*').order('created_at',{ascending:false})
    if(c) setComps(c)
    const {data:l}=await supabase.from('employee_advance_ledger').select('*').order('created_at',{ascending:false})
    if(l) setAdvLedger(l)
  }
  useEffect(()=>{load()},[month])

  const getPresent=(code:string)=> attAll.filter(a=>a.employee_code===code && a.status==='present').length
  const getComplaints=(code:string)=> comps.filter(c=>c.employee_code===code).length
  const getAdvance=(code:string)=> advLedger.filter(a=>a.employee_code===code && a.type==='advance').reduce((s,a)=>s+Number(a.amount),0) - advLedger.filter(a=>a.employee_code===code && a.type==='repayment').reduce((s,a)=>s+Number(a.amount),0)

  const addAdvance=async()=>{
    if(!showAdv||!advAmt) return
    await supabase.from('employee_advance_ledger').insert({employee_code:showAdv.employee_code, amount:Number(advAmt), type:'advance', reason:advReason, given_date:new Date().toISOString().split('T')[0]})
    // employees table me bhi update taaki salary me kate
    const newAdv=getAdvance(showAdv.employee_code)+Number(advAmt)
    await supabase.from('employees').update({advance_payment:newAdv}).eq('id',showAdv.id)
    setShowAdv(null); setAdvAmt(''); setAdvReason(''); load(); alert('✅ Advance ledger me add ho gaya')
  }
  const addComplaint=async()=>{
    if(!showComp||!compDesc) return
    await supabase.from('employee_complaints').insert({employee_code:showComp.employee_code, complaint_by_flat:'ADMIN', category:'Work', description:compDesc, status:'pending'})
    setShowComp(null); setCompDesc(''); load(); alert('✅ Complaint add ho gayi')
  }

  const filtered=list.filter(e=> e.name?.toLowerCase().includes(search.toLowerCase()) || e.employee_code?.toLowerCase().includes(search.toLowerCase()))

  return(
    <div className="min-h-screen bg-[#f6f7fb] text-black p-3">
      <div className="max-w- mx-auto space-y-3">
        <div className="bg-white rounded-2xl border p-4 flex flex-wrap justify-between gap-3 sticky top-0 z-20">
          <h1 className="font-black text-lg">👷 Step 1: Employees + Complaint + Advance Ledger</h1>
          <div className="flex gap-2">
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="h-10 rounded-xl border px-3 font-bold"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search EMP / Name" className="h-10 rounded-xl border px-4 text-sm w-48"/>
            <button onClick={load} className="h-10 px-4 rounded-xl bg-black text-white text-sm">Refresh</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-auto max-h-">
            <table className="w-full text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-900 text-white z-10">
                <tr><th className="p-3 text-left">Emp</th><th className="p-3">Present {month}</th><th className="p-3">Complaints</th><th className="p-3">Advance Pending</th><th className="p-3">Advance Ledger</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(e=>(
                  <tr key={e.id} className="border-b hover:bg-amber-50">
                    <td className="p-3"><div className="font-black">{e.employee_code||'No Code'} • {e.name}</div><div className="text- opacity-60">{e.job_title} • {e.mobile} • ₹{e.salary_per_day}/day</div></td>
                    <td className="p-3 text-center"><span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black">{getPresent(e.employee_code)}</span></td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full font-black ${getComplaints(e.employee_code)>0?'bg-red-100 text-red-700':'bg-slate-100'}`}>{getComplaints(e.employee_code)} complaints</span>
                      <button onClick={()=>setShowComp(e)} className="ml-2 h-7 px-3 rounded-full bg-red-600 text-white text-">+ Add Complaint</button>
                    </td>
                    <td className="p-3 text-center font-black text-amber-700">₹{getAdvance(e.employee_code)}</td>
                    <td className="p-3">
                      <div className="max-h-20 overflow-y-auto space-y-1 w-48">
                        {advLedger.filter(a=>a.employee_code===e.employee_code).slice(0,3).map(a=>(
                          <div key={a.id} className={`p-1 rounded text- ${a.type==='advance'?'bg-amber-50':'bg-emerald-50'}`}>{a.type.toUpperCase()} ₹{a.amount} • {a.reason} • {a.given_date}</div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 flex gap-1">
                      <button onClick={()=>setShowAdv(e)} className="h-8 px-3 rounded-full bg-amber-500 text-white text- font-black">+ Advance</button>
                      <button onClick={()=>setSel(e)} className="h-8 px-3 rounded-full bg-slate-900 text-white text-">View ID</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border p-4"><div className="font-black text-sm mb-2">Recent Complaints</div><div className="space-y-1 max-h-64 overflow-y-auto">{comps.slice(0,20).map(c=><div key={c.id} className="p-2 rounded-xl bg-red-50 border text-xs flex justify-between"><span>{c.employee_code} • {c.description}</span><span className="opacity-60">{new Date(c.created_at).toLocaleDateString()}</span></div>)}</div></div>
          <div className="bg-white rounded-2xl border p-4"><div className="font-black text-sm mb-2">Recent Advance Ledger</div><div className="space-y-1 max-h-64 overflow-y-auto">{advLedger.slice(0,20).map(a=><div key={a.id} className="p-2 rounded-xl bg-amber-50 border text-xs flex justify-between"><span>{a.employee_code} • {a.type} ₹{a.amount} • {a.reason}</span><span className="opacity-60">{a.given_date}</span></div>)}</div></div>
        </div>
      </div>

      {showAdv&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setShowAdv(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <div className="font-black">Advance do — {showAdv.employee_code}</div>
            <div className="text-xs opacity-60">Pending: ₹{getAdvance(showAdv.employee_code)}</div>
            <input type="number" value={advAmt} onChange={e=>setAdvAmt(e.target.value)} placeholder="Amount 2000" className="mt-3 w-full h-11 rounded-xl border px-4 font-bold"/>
            <input value={advReason} onChange={e=>setAdvReason(e.target.value)} placeholder="Reason — festival advance" className="mt-2 w-full h-11 rounded-xl border px-4 text-sm"/>
            <button onClick={addAdvance} className="mt-3 w-full h-11 rounded-full bg-amber-500 text-white font-black">Save to Ledger → Salary se katega</button>
          </div>
        </div>
      )}
      {showComp&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setShowComp(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <div className="font-black">Complaint add — {showComp.employee_code}</div>
            <textarea value={compDesc} onChange={e=>setCompDesc(e.target.value)} placeholder="Kaam sahi nahi kiya..." rows={3} className="mt-3 w-full rounded-xl border p-3 text-sm"/>
            <button onClick={addComplaint} className="mt-3 w-full h-11 rounded-full bg-red-600 text-white font-black">Add Complaint</button>
          </div>
        </div>
      )}
      {sel&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setSel(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-center" onClick={e=>e.stopPropagation()}>
            <div className="font-black">{sel.employee_code} • {sel.name}</div><div className="text-xs">{sel.job_title}</div>
            {sel.photo_url&&<img src={sel.photo_url} className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"/>}
            <div className="mt-2 text-xs">Complaints: {getComplaints(sel.employee_code)} • Advance: ₹{getAdvance(sel.employee_code)}</div>
            <button onClick={()=>setSel(null)} className="mt-4 w-full h-11 rounded-full bg-black text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
