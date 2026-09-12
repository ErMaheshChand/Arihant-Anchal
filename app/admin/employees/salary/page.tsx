'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SalaryLockPage(){
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
  const [list,setList]=useState<any[]>([])
  const [attAll,setAttAll]=useState<any[]>([])
  const [comps,setComps]=useState<any[]>([])
  const [advLed,setAdvLed]=useState<any[]>([])
  const [slips,setSlips]=useState<any[]>([])
  const [loading,setLoading]=useState(false)

  const load=async()=>{
    const {data:e}=await supabase.from('employees').select('*').eq('status','approved')
    if(e) setList(e)
    const {data:a}=await supabase.from('employee_attendance').select('*').gte('date',`${month}-01`).lte('date',`${month}-31`)
    if(a) setAttAll(a)
    const {data:c}=await supabase.from('employee_complaints').select('*')
    if(c) setComps(c)
    const {data:l}=await supabase.from('employee_advance_ledger').select('*')
    if(l) setAdvLed(l)
    const {data:s}=await supabase.from('employee_salary_slip').select('*').eq('month',month)
    if(s) setSlips(s)
  }
  useEffect(()=>{load()},[month])

  const calc=(emp:any)=>{
    const myAtt=attAll.filter(x=>x.employee_code===emp.employee_code)
    const present=myAtt.filter(x=>x.status==='present').length
    const half=myAtt.filter(x=>x.status==='half').length
    const absent=myAtt.filter(x=>x.status==='absent').length
    const complaints=comps.filter(x=>x.employee_code===emp.employee_code && x.created_at.slice(0,7)===month).length
    const advPending=advLed.filter(x=>x.employee_code===emp.employee_code && x.type==='advance').reduce((s,x)=>s+Number(x.amount),0) - advLed.filter(x=>x.employee_code===emp.employee_code && x.type==='repayment').reduce((s,x)=>s+Number(x.amount),0)
    // complaint se -100 per complaint (change kar sakte ho)
    const complaintDed=complaints*100
    const basic=Math.round(present*Number(emp.salary_per_day||0) + half*Number(emp.salary_per_day||0)/2)
    const net=basic + Number(emp.bonus||0) - Number(emp.deduction||0) - Number(emp.cpf_deduction||0) - advPending - complaintDed
    return {present,half,absent,complaints,advPending,complaintDed,basic,net: net>0?net:0}
  }

  const lockSalary=async(emp:any)=>{
    const c=calc(emp)
    const payload={employee_code:emp.employee_code, month, present_days:c.present, half_days:c.half, basic_salary:c.basic, bonus:Number(emp.bonus||0), deduction:Number(emp.deduction||0), cpf_deduction:Number(emp.cpf_deduction||0), advance_deducted:c.advPending, complaint_deduction:c.complaintDed, net_payable:c.net, status:'locked'}
    const {error}=await supabase.from('employee_salary_slip').upsert(payload, {onConflict:'employee_code,month'})
    if(error){alert(error.message);return}
    // Expense me add karo
    await supabase.from('society_ledger').insert({flat_no:'SOCIETY', amount:c.net, type:'debit', title:`Salary ${emp.employee_code} ${emp.name} - ${month} (P:${c.present} C:${c.complaints} Adv:${c.advPending})`})
    // Advance repayment entry
    if(c.advPending>0){
      await supabase.from('employee_advance_ledger').insert({employee_code:emp.employee_code, amount:c.advPending, type:'repayment', reason:`Salary deduction ${month}`, given_date:new Date().toISOString().split('T')[0]})
      await supabase.from('employees').update({advance_payment:0}).eq('id',emp.id)
    }
    alert(`✅ Locked! ₹${c.net} — Expense me add ho gaya`); load()
  }

  const lockAll=async()=>{
    if(!confirm(`${month} ki sabki salary lock kar du? Expense me jayegi`)) return
    setLoading(true)
    for(const emp of list){ await lockSalary(emp) }
    setLoading(false); load()
  }

  const downloadBankExcel=()=>{
    const rows=slips.filter(s=>s.status==='locked'||s.status==='bank_sent').map(s=>{
      const emp=list.find(e=>e.employee_code===s.employee_code)
      return {code:s.employee_code, name:emp?.name||'', acc:emp?.account_no||'', ifsc:emp?.ifsc_code||'', bank:emp?.bank_name||'', amount:s.net_payable}
    })
    if(rows.length===0){alert('Pehle Lock karo');return}
    const headers=['Sr','Emp Code','Name','Account No','IFSC','Bank','Amount','Narration']
    const csv=[headers.join(','),...rows.map((r,i)=>[i+1,r.code,r.name,r.acc,r.ifsc,r.bank,r.amount,`Salary ${month}`].join(','))].join('\n')
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob)
    const a=document.createElement('a'); a.href=url; a.download=`BANK_SALARY_${month}.csv`; a.click()
    // status bank_sent
    rows.forEach(async r=>{
      await supabase.from('employee_salary_slip').update({status:'bank_sent', bank_txn_id:`BANK-${month}-${Date.now()}`}).eq('employee_code',r.code).eq('month',month)
    })
    alert('✅ Bank Excel download — Bank ko bhejo, auto debit hoga')
  }

  const totalPayable=slips.reduce((s,x)=>s+Number(x.net_payable||0),0)

  return(
    <div className="min-h-screen bg-[#f6f7fb] text-black p-3">
      <div className="max-w- mx-auto space-y-3">
        <div className="bg-white rounded-2xl border p-4 flex flex-wrap justify-between gap-3">
          <div><h1 className="font-black text-lg">💰 Step 2: Salary Lock + Expense + Bank Excel</h1><div className="text-xs opacity-60">Month {month} — Lock karte hi Expense + Advance cut + Bank file ready</div></div>
          <div className="flex gap-2">
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="h-10 rounded-xl border px-3 font-bold"/>
            <button onClick={lockAll} disabled={loading} className="h-10 px-5 rounded-xl bg-slate-900 text-white font-black text-sm">{loading?'Locking...':'🔒 Lock All Salary'}</button>
            <button onClick={downloadBankExcel} className="h-10 px-5 rounded-xl bg-emerald-600 text-white font-black text-sm">🏦 Bank Excel Download</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border p-4"><div className="text-xs opacity-60">TOTAL LOCKED</div><div className="text-2xl font-black">₹{totalPayable}</div><div className="text-">Expense me gayi amount</div></div>
          <div className="bg-white rounded-2xl border p-4"><div className="text-xs opacity-60">EMPLOYEES</div><div className="text-2xl font-black">{list.length} / {slips.length} Locked</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><div className="text-xs font-bold">Bank Format</div><div className="text- mt-1">Account No + IFSC jaruri hai — Employee form me add karo, nahi to bank fail hogi</div></div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-auto max-h-">
            <table className="w-full text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-900 text-white">
                <tr><th className="p-3 text-left">Emp Code / Bank</th><th className="p-3">Present/Half</th><th className="p-3">Basic</th><th className="p-3">Bonus</th><th className="p-3">Deduction/CPF</th><th className="p-3">Complaint -₹100</th><th className="p-3">Advance Cut</th><th className="p-3">Net Payable</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
              </thead>
              <tbody>
                {list.map(emp=>{
                  const c=calc(emp)
                  const slip=slips.find(s=>s.employee_code===emp.employee_code)
                  return(
                    <tr key={emp.id} className="border-b hover:bg-blue-50">
                      <td className="p-3"><div className="font-black">{emp.employee_code} • {emp.name}</div><div className="text- opacity-60">{emp.account_no||'No Acc'} • {emp.ifsc_code||'No IFSC'} • {emp.bank_name||''}</div><input value={emp.account_no||''} onChange={async e=>{await supabase.from('employees').update({account_no:e.target.value}).eq('id',emp.id); load()}} placeholder="Account No" className="mt-1 w-32 h-7 rounded border px-2 text-"/><input value={emp.ifsc_code||''} onChange={async e=>{await supabase.from('employees').update({ifsc_code:e.target.value}).eq('id',emp.id); load()}} placeholder="IFSC" className="ml-1 w-20 h-7 rounded border px-2 text-"/></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-emerald-100 font-black">{c.present}</span> + {c.half} half</td>
                      <td className="p-3 text-center">₹{c.basic}</td>
                      <td className="p-3"><span className="text-emerald-700 font-bold">+₹{emp.bonus||0}</span></td>
                      <td className="p-3"><span className="text-red-700">-₹{Number(emp.deduction||0)+Number(emp.cpf_deduction||0)}</span><div className="text-">Ded {emp.deduction||0} + CPF {emp.cpf_deduction||0}</div></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">{c.complaints} × -₹100 = -₹{c.complaintDed}</span></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-amber-100 font-bold">-₹{c.advPending}</span></td>
                      <td className="p-3 font-black text-emerald-700 text-sm">₹{c.net}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text- font-black ${slip?.status==='locked'?'bg-emerald-600 text-white':slip?.status==='bank_sent'?'bg-blue-600 text-white':'bg-slate-100'}`}>{slip?.status?.toUpperCase()||'DRAFT'}</span></td>
                      <td className="p-3"><button onClick={()=>lockSalary(emp)} className="h-8 px-4 rounded-full bg-slate-900 text-white text- font-black">🔒 Lock + Expense</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
