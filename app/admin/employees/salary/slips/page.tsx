'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SalarySlipFinal(){
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
  const [slips,setSlips]=useState<any[]>([])
  const [emps,setEmps]=useState<any[]>([])
  const [sel,setSel]=useState<any>(null)
  const [utr,setUtr]=useState('')

  const load=async()=>{
    const {data:s}=await supabase.from('employee_salary_slip').select('*').eq('month',month).order('created_at',{ascending:false})
    if(s) setSlips(s)
    const {data:e}=await supabase.from('employees').select('*')
    if(e) setEmps(e)
  }
  useEffect(()=>{load()},[month])

  const markPaid=async(slip:any)=>{
    if(!utr){alert('UTR No likho — bank ne jo diya');return}
    await supabase.from('employee_salary_slip').update({status:'paid', utr_no:utr, paid_date:new Date().toISOString().split('T')[0]}).eq('id',slip.id)
    setUtr(''); setSel(null); load(); alert('✅ Paid mark ho gaya — UTR save')
  }

  const printSlip=(slip:any)=>{
    const emp=emps.find(x=>x.employee_code===slip.employee_code)
    const w=window.open('','','width=800,height=900')
    if(!w) return
    w.document.write(`
      <html><head><title>Salary Slip ${slip.month}</title>
      <style>body{font-family:Arial;padding:30px;color:#000}.box{border:3px solid #000;border-radius:16px;padding:20px;max-width:600px;margin:auto}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ccc}.head{font-weight:900;text-align:center;font-size:18px;margin-bottom:10px}.total{font-weight:900;font-size:20px;background:#000;color:#fff;padding:10px;border-radius:10px;text-align:center;margin-top:15px}.small{font-size:11px;opacity:0.7}</style>
      </head><body>
      <div class="box">
        <div class="head">ARIHANT ANCHAL — SALARY SLIP</div>
        <div style="text-align:center" class="small">${slip.month} • ${emp?.employee_code} • ${emp?.name}</div>
        <div style="text-align:center;margin:10px"><img src="${emp?.photo_url||''}" style="width:70px;height:70px;border-radius:50%;object-fit:cover"/></div>
        <div class="row"><span>Employee</span><b>${emp?.name} (${emp?.employee_code})</b></div>
        <div class="row"><span>Job / Mobile</span><b>${emp?.job_title} • ${emp?.mobile}</b></div>
        <div class="row"><span>Bank</span><b>${emp?.bank_name||''} • ${emp?.account_no||''} • ${emp?.ifsc_code||''}</b></div>
        <div class="row"><span>Present / Half</span><b>${slip.present_days} / ${slip.half_days}</b></div>
        <div class="row"><span>Basic Salary</span><b>₹${slip.basic_salary}</b></div>
        <div class="row"><span>Bonus</span><b>+ ₹${slip.bonus}</b></div>
        <div class="row"><span>Deduction / CPF</span><b>- ₹${slip.deduction} / - ₹${slip.cpf_deduction}</b></div>
        <div class="row"><span>Complaint Deduction (${slip.complaint_deduction/100} complaints)</span><b>- ₹${slip.complaint_deduction}</b></div>
        <div class="row"><span>Advance Deducted</span><b>- ₹${slip.advance_deducted}</b></div>
        <div class="total">NET PAYABLE: ₹${slip.net_payable}</div>
        <div class="row"><span>Status</span><b>${slip.status?.toUpperCase()}</b></div>
        <div class="row"><span>UTR No</span><b>${slip.utr_no||'—'}</b></div>
        <div class="row"><span>Bank Txn</span><b>${slip.bank_txn_id||'—'}</b></div>
        <div class="small" style="text-align:center;margin-top:15px">This is computer generated slip — Arihant Anchal Society, Jaipur</div>
      </div>
      <script>window.print()</script>
      </body></html>
    `)
    w.document.close()
  }

  const downloadAllPdf=()=>{
    alert('Har slip ka Print button dabao — Browser se Save as PDF kar sakte ho. Bank ke liye CSV already Step 2 me hai.')
  }

  const total=slips.reduce((s,x)=>s+Number(x.net_payable||0),0)
  const paid=slips.filter(s=>s.status==='paid').reduce((s,x)=>s+Number(x.net_payable||0),0)

  return(
    <div className="min-h-screen bg-[#f6f7fb] text-black p-3">
      <div className="max-w- mx-auto space-y-3">
        <div className="bg-white rounded-2xl border p-4 flex flex-wrap justify-between gap-3">
          <div><h1 className="font-black text-lg">🧾 Step 3: Payroll Slip + Bank UTR</h1><div className="text-xs opacity-60">PDF banao + Bank UTR daalo = Paid</div></div>
          <div className="flex gap-2">
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="h-10 rounded-xl border px-3 font-bold"/>
            <button onClick={downloadAllPdf} className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold">All PDF</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border p-4"><div className="text-xs opacity-60">TOTAL PAYABLE {month}</div><div className="text-2xl font-black">₹{total}</div></div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4"><div className="text-xs font-bold">PAID</div><div className="text-2xl font-black text-emerald-700">₹{paid}</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><div className="text-xs font-bold">PENDING</div><div className="text-2xl font-black text-amber-700">₹{total-paid}</div></div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-auto max-h-">
            <table className="w-full text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-900 text-white"><tr><th className="p-3 text-left">Emp</th><th className="p-3">Net</th><th className="p-3">Status</th><th className="p-3">Bank / UTR</th><th className="p-3">PDF + UTR Update</th></tr></thead>
              <tbody>
                {slips.map(s=>{
                  const emp=emps.find(e=>e.employee_code===s.employee_code)
                  return(
                    <tr key={s.id} className="border-b hover:bg-blue-50">
                      <td className="p-3"><div className="font-black">{s.employee_code} • {emp?.name}</div><div className="text- opacity-60">{emp?.account_no} • {emp?.ifsc_code}</div></td>
                      <td className="p-3 font-black text-emerald-700">₹{s.net_payable}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text- font-black ${s.status==='paid'?'bg-emerald-600 text-white':s.status==='bank_sent'?'bg-blue-600 text-white':'bg-slate-200'}`}>{s.status.toUpperCase()}</span></td>
                      <td className="p-3 text-"><div>Txn: {s.bank_txn_id||'—'}</div><div>UTR: <b>{s.utr_no||'—'}</b></div></td>
                      <td className="p-3 flex gap-1">
                        <button onClick={()=>printSlip(s)} className="h-8 px-3 rounded-full bg-black text-white text- font-bold">🧾 PDF Slip</button>
                        <button onClick={()=>setSel(s)} className="h-8 px-3 rounded-full bg-emerald-600 text-white text- font-black">UTR Update</button>
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
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <div className="font-black">Bank UTR Update — {sel.employee_code} ₹{sel.net_payable}</div>
            <div className="text-xs opacity-60 mt-1">Bank ne paisa bhejne ke baad jo UTR diya wo daalo</div>
            <input value={utr} onChange={e=>setUtr(e.target.value)} placeholder="UTR No — 123456789012" className="mt-3 w-full h-11 rounded-xl border px-4 font-bold tracking-wider"/>
            <button onClick={()=>markPaid(sel)} className="mt-3 w-full h-11 rounded-full bg-emerald-600 text-white font-black">✅ Paid Mark Karo</button>
            <button onClick={()=>setSel(null)} className="mt-2 w-full h-10 rounded-full bg-slate-100 font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
