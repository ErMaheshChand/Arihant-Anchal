'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function AdminEmp(){
  const [list,setList]=useState<any[]>([])
  const [att,setAtt]=useState<any[]>([])
  const [sel,setSel]=useState<any>(null)
  const load=async()=>{
    const {data}=await supabase.from('employees').select('*').order('created_at',{ascending:false})
    if(data) setList(data)
    const {data:a}=await supabase.from('employee_attendance').select('*').eq('date',new Date().toISOString().split('T')[0])
    if(a) setAtt(a)
  }
  useEffect(()=>{load()},[])
  const approve=async(emp:any)=>{
    const code='EMP'+String(Math.floor(1000+Math.random()*9000))
    const {error}=await supabase.from('employees').update({status:'approved',employee_code:code,password:'1234'}).eq('id',emp.id)
    if(!error){alert(`✅ Approved! Login ID: ${code} / Pass: 1234`);load()} else alert(error.message)
  }
  const markAtt=async(code:string,status:string)=>{
    const today=new Date().toISOString().split('T')[0]
    await supabase.from('employee_attendance').delete().eq('employee_code',code).eq('date',today)
    await supabase.from('employee_attendance').insert({employee_code:code,date:today,status})
    load()
  }
  const monthSal=(code:string,perDay:number)=>{
    // is month ke present days
    return `₹${perDay}/day — Attendance se calculate hoga`
  }
  const approved=list.filter(e=>e.status==='approved')
  const pending=list.filter(e=>e.status==='pending')
  const totalExp=approved.reduce((s,e)=>{ const days=att.filter(a=>a.employee_code===e.employee_code&&a.status==='present').length; return s+(days*(Number(e.salary_per_day)||0)) },0)

  return(
    <div className="min-h-screen bg-slate-50 p-4 text-black"><div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border p-4 flex justify-between items-center">
        <h1 className="font-black text-lg">👷 Employees — {approved.length} Approved / {pending.length} Pending</h1>
        <div className="text-xs font-black bg-red-100 px-3 py-2 rounded-full">💸 Aaj ka Expense: ₹{totalExp}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-4">
          <div className="font-bold mb-2">Pending Approval</div>
          <div className="space-y-2 max-h- overflow-y-auto">
            {pending.map(e=>(
              <div key={e.id} className="p-3 rounded-2xl border flex gap-3">
                {e.photo_url?<img src={e.photo_url} className="w-16 h-16 rounded-2xl object-cover"/>:<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">👤</div>}
                <div className="flex-1"><div className="font-bold text-sm">{e.name} • {e.mobile}</div><div className="text-xs opacity-60">{e.job_title} • Age {e.age} • {e.experience}</div><div className="text-xs opacity-60">{e.address}</div>
                <div className="mt-2 flex gap-2"><button onClick={()=>setSel(e)} className="px-3 h-8 rounded-full bg-slate-100 text-xs font-bold">ID Card Dekho</button><button onClick={()=>approve(e)} className="px-3 h-8 rounded-full bg-emerald-600 text-white text-xs font-black">✅ Approve + ID Banao</button></div></div>
              </div>
            ))}
            {pending.length===0&&<div className="text-xs opacity-40 text-center p-6">Koi pending nahi</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="font-bold mb-2">Approved — Daily Attendance (Salary ke liye)</div>
          <div className="space-y-2 max-h- overflow-y-auto">
            {approved.map(e=>{
              const today=att.find(a=>a.employee_code===e.employee_code)
              return(
              <div key={e.id} className="p-3 rounded-2xl border">
                <div className="flex justify-between"><div className="font-bold text-sm">{e.employee_code} • {e.name}</div><div className="text-xs font-bold">₹{e.salary_per_day}/day</div></div>
                <div className="text-xs opacity-60">{e.job_title} • {e.mobile}</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button onClick={()=>markAtt(e.employee_code,'present')} className={`h-9 rounded-full text-xs font-black ${today?.status==='present'?'bg-emerald-600 text-white':'bg-slate-100'}`}>Present</button>
                  <button onClick={()=>markAtt(e.employee_code,'absent')} className={`h-9 rounded-full text-xs font-black ${today?.status==='absent'?'bg-red-600 text-white':'bg-slate-100'}`}>Absent</button>
                  <button onClick={()=>markAtt(e.employee_code,'half')} className={`h-9 rounded-full text-xs font-black ${today?.status==='half'?'bg-amber-500 text-white':'bg-slate-100'}`}>Half Day</button>
                </div>
              </div>)
            })}
          </div>
        </div>
      </div>
      {sel&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setSel(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <div className="text-center border-4 border-slate-900 rounded-2xl p-4">
              <div className="font-black">ARIHANT ANCHAL — EMPLOYEE ID</div>
              {sel.photo_url&&<img src={sel.photo_url} className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"/>}
              <div className="font-black mt-2">{sel.name}</div><div className="text-xs">{sel.job_title} • {sel.mobile}</div><div className="text-xs">Age {sel.age} • {sel.address}</div><div className="text-xs">Exp: {sel.experience}</div>
              {sel.idproof_url&&<img src={sel.idproof_url} className="w-full h-32 object-cover rounded-xl mt-2"/>}
            </div>
            <button onClick={()=>setSel(null)} className="mt-4 w-full h-11 rounded-full bg-black text-white font-bold">Close</button>
          </div>
        </div>
      )}
    </div></div>
  )
}
