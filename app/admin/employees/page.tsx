'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminEmpPro(){
  const [list,setList]=useState<any[]>([])
  const [attAll,setAttAll]=useState<any[]>([])
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7)) // YYYY-MM
  const [search,setSearch]=useState('')
  const [jobFilter,setJobFilter]=useState('All')
  const [statusFilter,setStatusFilter]=useState('all')
  const [sel,setSel]=useState<any>(null)
  const [topTab,setTopTab]=useState<'all'|'present'|'absent'|'pending'>('all')

  const load=async()=>{
    const {data}=await supabase.from('employees').select('*').order('created_at',{ascending:false})
    if(data) setList(data)
    const start=`${month}-01`; const end=`${month}-31`
    const {data:a}=await supabase.from('employee_attendance').select('*').gte('date',start).lte('date',end)
    if(a) setAttAll(a)
  }
  useEffect(()=>{load()},[month])

  const today=new Date().toISOString().split('T')[0]
  const todayAtt=attAll.filter(a=>a.date===today)

  const stats=useMemo(()=>{
    const total=list.length
    const approved=list.filter(e=>e.status==='approved').length
    const pending=list.filter(e=>e.status==='pending').length
    const presentToday=todayAtt.filter(a=>a.status==='present'||a.status==='half').length
    const absentToday=approved - presentToday
    return {total,approved,pending,presentToday,absentToday}
  },[list,todayAtt])

  const filtered=useMemo(()=>{
    let f=[...list]
    if(topTab==='pending') f=f.filter(e=>e.status==='pending')
    if(topTab==='present') f=f.filter(e=> todayAtt.find(a=>a.employee_code===e.employee_code && (a.status==='present'||a.status==='half')))
    if(topTab==='absent') f=f.filter(e=> e.status==='approved' &&!todayAtt.find(a=>a.employee_code===e.employee_code && (a.status==='present'||a.status==='half')))
    if(statusFilter!=='all') f=f.filter(e=>e.status===statusFilter)
    if(jobFilter!=='All') f=f.filter(e=>e.job_title===jobFilter)
    if(search) f=f.filter(e=> e.name?.toLowerCase().includes(search.toLowerCase()) || e.employee_code?.toLowerCase().includes(search.toLowerCase()) || e.mobile?.includes(search))
    return f
  },[list,search,jobFilter,statusFilter,topTab,todayAtt])

  const getMonthData=(code:string)=>{
    const my=attAll.filter(a=>a.employee_code===code)
    const present=my.filter(a=>a.status==='present').length
    const half=my.filter(a=>a.status==='half').length
    const absent=my.filter(a=>a.status==='absent').length
    return {present,half,absent,total:present+half*0.5}
  }

  const updateField=async(id:string,field:string,val:any)=>{
    await supabase.from('employees').update({[field]:val}).eq('id',id)
    setList(l=>l.map(e=>e.id===id?{...e,[field]:val}:e))
  }

  const approve=async(emp:any)=>{
    const code='EMP'+Math.floor(1000+Math.random()*9000)
    await supabase.from('employees').update({status:'approved',employee_code:code,password:'1234'}).eq('id',emp.id)
    load()
  }

  const downloadExcel=()=>{
    const headers=['Emp Code','Name','Mobile','Job','Salary/Day','Present','Half','Absent','Bonus','Deduction','CPF','Advance','Promotion','Net Salary']
    const rows=filtered.map(e=>{
      const m=getMonthData(e.employee_code)
      const net=Math.round(m.present*Number(e.salary_per_day||0)+m.half*Number(e.salary_per_day||0)/2+Number(e.bonus||0)-Number(e.deduction||0)-Number(e.cpf_deduction||0)-Number(e.advance_payment||0))
      return [e.employee_code||'',e.name,e.mobile,e.job_title,e.salary_per_day,m.present,m.half,m.absent,e.bonus||0,e.deduction||0,e.cpf_deduction||0,e.advance_payment||0,e.promotion||'',net]
    })
    const csv=[headers.join(','),...rows.map(r=>r.join(','))].join('\n')
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob)
    const a=document.createElement('a'); a.href=url; a.download=`Employees_${month}.csv`; a.click()
  }

  const jobs=['All',...Array.from(new Set(list.map(e=>e.job_title).filter(Boolean)))]

  return(
    <div className="min-h-screen bg-[#f6f7fb] text-black">
      {/* FIXED TOP TABS */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w- mx-auto p-3 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button onClick={()=>setTopTab('all')} className={`p-4 rounded-2xl border-2 text-left ${topTab==='all'?'bg-slate-900 text-white border-slate-900':'bg-white'}`}><div className="text-xs opacity-60">TOTAL REGISTER</div><div className="text-2xl font-black">{stats.total}</div><div className="text- mt-1">All employees</div></button>
            <button onClick={()=>setTopTab('present')} className={`p-4 rounded-2xl border-2 text-left ${topTab==='present'?'bg-emerald-600 text-white border-emerald-600':'bg-emerald-50 border-emerald-200'}`}><div className="text-xs opacity-80">TOTAL PRESENT</div><div className="text-2xl font-black">{stats.presentToday}</div><div className="text- mt-1">Aaj {today}</div></button>
            <button onClick={()=>setTopTab('absent')} className={`p-4 rounded-2xl border-2 text-left ${topTab==='absent'?'bg-red-600 text-white border-red-600':'bg-red-50 border-red-200'}`}><div className="text-xs opacity-80">TOTAL ABSENT</div><div className="text-2xl font-black">{stats.absentToday}</div><div className="text- mt-1">Approved - Present</div></button>
            <button onClick={()=>setTopTab('pending')} className={`p-4 rounded-2xl border-2 text-left ${topTab==='pending'?'bg-amber-500 text-white border-amber-500':'bg-amber-50 border-amber-200'}`}><div className="text-xs opacity-80">PENDING APPROVAL</div><div className="text-2xl font-black">{stats.pending}</div><div className="text- mt-1">Need action</div></button>
            <div className="p-4 rounded-2xl bg-slate-900 text-white"><div className="text-xs opacity-60">MONTH EXPENSE</div><div className="text-xl font-black">₹{filtered.reduce((s,e)=>{const m=getMonthData(e.employee_code); return s+Math.round(m.present*Number(e.salary_per_day||0)+m.half*Number(e.salary_per_day||0)/2+Number(e.bonus||0)-Number(e.deduction||0)-Number(e.cpf_deduction||0)-Number(e.advance_payment||0))},0)}</div><div className="text- mt-1">{month} salary total</div></div>
          </div>

          <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-2xl border">
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="h-10 rounded-xl border px-3 text-sm font-bold bg-white"/>
            <select value={jobFilter} onChange={e=>setJobFilter(e.target.value)} className="h-10 rounded-xl border px-3 text-sm bg-white"><option value="All">All Jobs</option>{jobs.filter(j=>j!=='All').map(j=><option key={j}>{j}</option>)}</select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-10 rounded-xl border px-3 text-sm bg-white"><option value="all">All Status</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name / code / mobile" className="h-10 rounded-xl border px-4 text-sm bg-white flex-1 min-w-"/>
            <button onClick={downloadExcel} className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-sm font-black">⬇️ Excel Download</button>
            <button onClick={()=>load()} className="h-10 px-4 rounded-xl bg-black text-white text-sm font-bold">Refresh</button>
          </div>
        </div>
      </div>

      {/* SCROLLABLE TABLE */}
      <div className="max-w- mx-auto p-3">
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-auto max-h- border-t">
            <table className="w-full text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-900 text-white z-10">
                <tr>
                  <th className="p-3 text-left">Photo</th>
                  <th className="p-3 text-left">Emp Code / Login</th>
                  <th className="p-3 text-left">Name / Mobile / Age / Address</th>
                  <th className="p-3">Job / Exp</th>
                  <th className="p-3">Salary/Day</th>
                  <th className="p-3">Present</th>
                  <th className="p-3">Absent / Half</th>
                  <th className="p-3">Complaints</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">Deduction</th>
                  <th className="p-3">CPF</th>
                  <th className="p-3">Advance</th>
                  <th className="p-3">Promotion</th>
                  <th className="p-3">Net Salary {month}</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e,i)=>{
                  const m=getMonthData(e.employee_code)
                  const net=Math.round(m.present*Number(e.salary_per_day||0)+m.half*Number(e.salary_per_day||0)/2+Number(e.bonus||0)-Number(e.deduction||0)-Number(e.cpf_deduction||0)-Number(e.advance_payment||0))
                  const rowColor=i%2===0?'bg-white':'bg-blue-50/50'
                  return(
                    <tr key={e.id} className={`border-b hover:bg-amber-50 ${rowColor}`}>
                      <td className="p-2">{e.photo_url?<img src={e.photo_url} className="w-10 h-10 rounded-full object-cover"/>:<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">👤</div>}</td>
                      <td className="p-2"><div className="font-black">{e.employee_code||'—'}</div><div className="text- opacity-60">Pass: {e.password||'1234'}</div><div className={`text- px-2 py-0.5 rounded-full inline-block font-bold mt-1 ${e.status==='approved'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{e.status?.toUpperCase()}</div></td>
                      <td className="p-2"><div className="font-bold">{e.name}</div><div>{e.mobile} • Age {e.age}</div><div className="text- opacity-60 max-w- truncate">{e.address}</div></td>
                      <td className="p-2 text-center"><div className="font-bold">{e.job_title}</div><div className="text-">{e.experience}</div></td>
                      <td className="p-2"><input type="number" value={e.salary_per_day||0} onChange={ev=>updateField(e.id,'salary_per_day',ev.target.value)} className="w-20 h-8 rounded-lg border px-2 font-bold"/></td>
                      <td className="p-2 text-center"><span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black">{m.present}</span><div className="text-">+ {m.half} half</div></td>
                      <td className="p-2 text-center"><span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">{m.absent}</span></td>
                      <td className="p-2 text-center"><span className="px-2 py-1 rounded-full bg-slate-100 font-bold">0</span><div className="text- opacity-60">complaints</div></td>
                      <td className="p-2"><input type="number" value={e.bonus||0} onChange={ev=>updateField(e.id,'bonus',ev.target.value)} className="w-20 h-8 rounded-lg border px-2 bg-emerald-50"/></td>
                      <td className="p-2"><input type="number" value={e.deduction||0} onChange={ev=>updateField(e.id,'deduction',ev.target.value)} className="w-20 h-8 rounded-lg border px-2 bg-red-50"/></td>
                      <td className="p-2"><input type="number" value={e.cpf_deduction||0} onChange={ev=>updateField(e.id,'cpf_deduction',ev.target.value)} className="w-20 h-8 rounded-lg border px-2 bg-blue-50"/></td>
                      <td className="p-2"><input type="number" value={e.advance_payment||0} onChange={ev=>updateField(e.id,'advance_payment',ev.target.value)} className="w-20 h-8 rounded-lg border px-2 bg-amber-50"/></td>
                      <td className="p-2"><input value={e.promotion||''} onChange={ev=>updateField(e.id,'promotion',ev.target.value)} placeholder="Senior" className="w-24 h-8 rounded-lg border px-2"/></td>
                      <td className="p-2 font-black text-emerald-700">₹{net}</td>
                      <td className="p-2 flex gap-1">
                        {e.status==='pending'&&<button onClick={()=>approve(e)} className="h-8 px-3 rounded-full bg-emerald-600 text-white text- font-black">Approve</button>}
                        <button onClick={()=>setSel(e)} className="h-8 px-3 rounded-full bg-slate-900 text-white text- font-bold">View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {sel&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setSel(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <div className="text-center border-4 border-slate-900 rounded-2xl p-4">
              <div className="font-black text-xs">ID CARD — {sel.employee_code}</div>
              {sel.photo_url&&<img src={sel.photo_url} className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"/>}
              <div className="font-black mt-2">{sel.name} • {sel.job_title}</div>
              <div className="text-xs">{sel.mobile} • Age {sel.age}</div>
              <div className="text-xs opacity-60">{sel.address} • Exp {sel.experience}</div>
              {sel.idproof_url&&<img src={sel.idproof_url} className="w-full h-32 object-cover rounded-xl mt-2"/>}
            </div>
            <button onClick={()=>setSel(null)} className="mt-4 w-full h-11 rounded-full bg-black text-white font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
