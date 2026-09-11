'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminBillsPage(){
  const [flats, setFlats] = useState<any[]>([])
  const [selectedFlat, setSelectedFlat] = useState('B-302')
  const [resident, setResident] = useState<any>(null)
  const [bills, setBills] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [cashDeposits, setCashDeposits] = useState<any[]>([])
  const [mode, setMode] = useState<'CASH'|'DUE'>('CASH')
  const [fFlat, setFFlat] = useState('')
  const [fMobile, setFMobile] = useState('')
  const [fFrom, setFFrom] = useState('')
  const [fTo, setFTo] = useState('')
  const [newBill, setNewBill] = useState({flat_no:'B-302', title:'', amount:'', type:'monthly', due_date: new Date().toISOString().split('T')[0]})
  const [cashForm, setCashForm] = useState({amount:'', date: new Date().toISOString().split('T')[0], receipt_no:`RCP-${Date.now()}`, depositor:'', remarks:''})

  const loadFlats = async ()=>{
    const { data } = await supabase.from('residents').select('flat_no,name,mobile').order('flat_no')
    if(data){
      const unique = new Map()
      data.forEach((r:any)=>{ if(!unique.has(r.flat_no)) unique.set(r.flat_no, r) })
      setFlats(Array.from(unique.values()))
    }
  }
  const loadData = async ()=>{
    if(!selectedFlat) return
    const { data: res } = await supabase.from('residents').select('*').eq('flat_no', selectedFlat).maybeSingle()
    setResident(res || {flat_no:selectedFlat, name:'Resident', mobile:'-', tower:selectedFlat.split('-')[0]})
    let qb = supabase.from('bills').select('*').eq('flat_no', selectedFlat).order('due_date',{ascending:false})
    if(fFrom) qb = qb.gte('due_date', fFrom)
    if(fTo) qb = qb.lte('due_date', fTo)
    const { data: b } = await qb
    if(b) setBills(b)
    const { data: l } = await supabase.from('society_ledger').select('*').eq('flat_no', selectedFlat).order('created_at',{ascending:false})
    if(l) setLedger(l)
    const { data: c } = await supabase.from('cash_deposits').select('*').eq('flat_no', selectedFlat).order('created_at',{ascending:false})
    if(c) setCashDeposits(c)
  }

  useEffect(()=>{ loadFlats() },[])
  useEffect(()=>{ loadData() },[selectedFlat, fFrom, fTo])

  const filtered = flats.filter(f=>{
    const m1 = fFlat? f.flat_no.toLowerCase().includes(fFlat.toLowerCase()) : true
    const m2 = fMobile? (f.mobile||'').toString().includes(fMobile) : true
    return m1 && m2
  })

  const pending = bills.filter(b=>b.status==='pending')
  const totalDue = pending.reduce((s,b)=>s+Number(b.amount),0)
  const totalCollection = ledger.filter(l=>l.type==='credit').reduce((s,l)=>s+Number(l.amount),0)
  const totalCash = cashDeposits.reduce((s,c)=>s+Number(c.amount),0)
  const lastPaid = ledger.length>0? ledger[0]?.created_at : null

  const tableRows = bills.map(b=>{
    const month = b.due_date? new Date(b.due_date).toLocaleString('en-IN',{month:'short', year:'2-digit'}) : '-'
    const lastP = b.paid_at? new Date(b.paid_at).toLocaleDateString() : lastPaid? new Date(lastPaid).toLocaleDateString() : '-'
    return { month, flat_no: b.flat_no, title: b.title, total_due: totalDue, total_paid: totalCollection, last_paid: lastP, status: b.status, receipt: b.receipt_no||'', paymode: b.pay_mode||'', ledger: b.status==='paid'?'CREDIT':'PENDING', id: b.id, amount: b.amount }
  })

  const exportPDF = async ()=>{
    // @ts-ignore
    if(!(window as any).jspdf){
      await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=()=>res(0); s.onerror=rej; document.body.appendChild(s) })
    }
    // @ts-ignore
    const { jsPDF } = (window as any).jspdf
    const doc = new jsPDF('l','mm','a4')
    doc.setFontSize(14); doc.text(`Anchal Society - Complete Flat + Ledger Report`, 14, 15)
    doc.setFontSize(10); doc.text(`Flat: ${selectedFlat} | Name: ${resident?.name||''} | Mobile: ${resident?.mobile||''} | Date: ${new Date().toLocaleString()}`, 14, 22)
    doc.text(`Filter: Flat:${fFlat||selectedFlat} Mobile:${fMobile||'-'} From:${fFrom||'-'} To:${fTo||'-'} | Total Due: Rs.${totalDue} | Total Paid: Rs.${totalCollection} (Cash Rs.${totalCash} Online Rs.${totalCollection-totalCash}) | Records: ${tableRows.length}`, 14, 28)

    // Header
    let y=35
    doc.setFontSize(8); doc.setFillColor(0,0,0); doc.setTextColor(255,255,255)
    doc.rect(14, y, 270, 8, 'F')
    doc.text('Month',15,y+5); doc.text('Flat No',30,y+5); doc.text('Title',45,y+5); doc.text('Amt',95,y+5); doc.text('Total Due',110,y+5); doc.text('Total Paid',130,y+5); doc.text('Last Paid',150,y+5); doc.text('Status',170,y+5); doc.text('Receipt',185,y+5); doc.text('PayMode',215,y+5); doc.text('Ledger',235,y+5)
    doc.setTextColor(0,0,0); y+=10
    tableRows.forEach((r:any)=>{
      if(y>190){ doc.addPage(); y=15 }
      doc.text(String(r.month),15,y); doc.text(String(r.flat_no),30,y); doc.text(String(r.title).substring(0,30),45,y); doc.text(String(r.amount),95,y); doc.text(String(r.total_due),110,y); doc.text(String(r.total_paid),130,y); doc.text(String(r.last_paid),150,y); doc.text(String(r.status),170,y); doc.text(String(r.receipt).substring(0,20),185,y); doc.text(String(r.paymode),215,y); doc.text(String(r.ledger),235,y)
      y+=6
    })
    doc.save(`${selectedFlat}_Ledger_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const addBill = async ()=>{
    if(!newBill.flat_no ||!newBill.amount) return alert('Flat + Amount')
    await supabase.from('bills').insert({ flat_no: newBill.flat_no.toUpperCase(), title: newBill.title||`${newBill.type}-${newBill.due_date}`, amount: Number(newBill.amount), type: newBill.type, due_date: newBill.due_date, status:'pending' })
    alert('Bill Added'); loadData()
  }
  const cashDeposit = async ()=>{
    if(!cashForm.amount) return alert('Amount bharo')
    const amt = Number(cashForm.amount)
    await supabase.from('cash_deposits').insert({ flat_no: selectedFlat, amount: amt, deposit_date: cashForm.date, receipt_no: cashForm.receipt_no, depositor_name: cashForm.depositor, pay_mode:'CASH', remarks: cashForm.remarks })
    await supabase.from('society_ledger').insert({ flat_no: selectedFlat, amount: amt, type:'credit', title:`CASH DEPOSIT - ${cashForm.receipt_no}` })
    let rem = amt
    for(const bill of pending.sort((a,b)=>new Date(a.due_date).getTime()-new Date(b.due_date).getTime())){
      if(rem<=0) break
      if(rem>=Number(bill.amount)){ await supabase.from('bills').update({status:'paid', paid_at:new Date().toISOString(), pay_mode:'CASH', receipt_no:cashForm.receipt_no}).eq('id',bill.id); rem-=Number(bill.amount) }
    }
    alert('Cash Done'); setCashForm({...cashForm, amount:'', receipt_no:`RCP-${Date.now()}`}); loadData()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 text-black">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="bg-white rounded-2xl border shadow-sm p-3 sticky top-2 z-20">
          <div className="flex justify-between items-center">
            <h1 className="font-black text-">Admin - Resident Bills & Ledger (Fixed Total)</h1>
            <div className="flex gap-2">
              <button onClick={()=>setMode('CASH')} className={`px-4 h-9 rounded-full text-xs font-bold border ${mode==='CASH'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-50'}`}>💵 CASH</button>
              <button onClick={()=>setMode('DUE')} className={`px-4 h-9 rounded-full text-xs font-bold border ${mode==='DUE'?'bg-blue-50 text-blue-700 border-blue-200':'bg-slate-50'}`}>➕ DUE</button>
              <button onClick={exportPDF} className="px-4 h-9 rounded-full text-xs font-black bg-black text-white">📄 PDF Export</button>
            </div>
          </div>
          <div className="mt-3">
            {mode==='CASH'? (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input value={selectedFlat} onChange={e=>setSelectedFlat(e.target.value.toUpperCase())} className="h-11 rounded-xl border bg-emerald-50/50 px-3 text-xs font-bold" placeholder="Flat" />
                <input value={cashForm.amount} onChange={e=>setCashForm({...cashForm, amount:e.target.value})} type="number" className="h-11 rounded-xl border px-3 text-xs" placeholder="Amount*" />
                <input type="date" value={cashForm.date} onChange={e=>setCashForm({...cashForm, date:e.target.value})} className="h-11 rounded-xl border px-2 text-xs" />
                <input value={cashForm.receipt_no} onChange={e=>setCashForm({...cashForm, receipt_no:e.target.value})} className="h-11 rounded-xl border px-3 text-xs" placeholder="Receipt" />
                <input value={cashForm.depositor} onChange={e=>setCashForm({...cashForm, depositor:e.target.value})} className="h-11 rounded-xl border px-3 text-xs" placeholder="Depositor" />
                <button onClick={cashDeposit} className="h-11 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-black">DEPOSIT</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input value={newBill.flat_no} onChange={e=>setNewBill({...newBill, flat_no:e.target.value})} className="h-11 rounded-xl border px-3 text-xs" placeholder="Flat" />
                <select value={newBill.type} onChange={e=>setNewBill({...newBill, type:e.target.value})} className="h-11 rounded-xl border px-2 text-xs"><option value="monthly">Monthly</option><option value="old_due">Old Due</option><option value="other">Other</option></select>
                <input type="date" value={newBill.due_date} onChange={e=>setNewBill({...newBill, due_date:e.target.value})} className="h-11 rounded-xl border px-2 text-xs" />
                <input value={newBill.amount} onChange={e=>setNewBill({...newBill, amount:e.target.value})} type="number" className="h-11 rounded-xl border px-3 text-xs" placeholder="Amount" />
                <input value={newBill.title} onChange={e=>setNewBill({...newBill, title:e.target.value})} className="h-11 rounded-xl border px-3 text-xs" placeholder="Title" />
                <button onClick={addBill} className="h-11 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 text-xs font-black">ADD</button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-3">
          <div className="text- font-black opacity-60">SEARCH / FILTER - Flat No, Mobile, Date</div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
            <input value={fFlat} onChange={e=>setFFlat(e.target.value)} placeholder="Flat No" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold" />
            <input value={fMobile} onChange={e=>setFMobile(e.target.value)} placeholder="Mobile No" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold" />
            <input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs" />
            <input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs" />
            <button onClick={()=>{setFFlat(''); setFMobile(''); setFFrom(''); setFTo('')}} className="h-11 rounded-xl bg-slate-900 text-white text-xs font-bold">Clear</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filtered.slice(0,15).map(f=><button key={f.flat_no} onClick={()=>setSelectedFlat(f.flat_no)} className={`px-3 py-1.5 rounded-full border text-xs font-bold ${selectedFlat===f.flat_no?'bg-slate-900 text-white':'bg-slate-50'}`}>{f.flat_no}</button>)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-3">
          <div className="text- font-bold">Complete Flat Details - {selectedFlat} <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-">{resident?.name||''} {resident?.mobile?`• ${resident.mobile}`:''}</span> <span className="ml-2 text-">Due ₹{totalDue} | Paid ₹{totalCollection} | Cash ₹{totalCash}</span></div>
        </div>

        <div className="bg-white rounded-2xl border p-3">
          <div className="flex justify-between items-center">
            <div className="font-bold text-">Complete Flat + Ledger Table</div>
            <div className="flex gap-2"><span className="text- bg-slate-900 text-white px-2 py-1 rounded-full">{tableRows.length} rows</span><button onClick={exportPDF} className="text- bg-black text-white px-3 py-1 rounded-full font-black">📄 Download PDF</button></div>
          </div>

          <div className="md:hidden mt-3 space-y-2 max-h- overflow-y-auto">
            {tableRows.map(r=>(
              <div key={r.id} className="p-3 rounded-2xl border bg-slate-50">
                <div className="flex justify-between"><span className="text- font-bold">{r.month} • {r.flat_no}</span><span className={`text- px-2 py-0.5 rounded-full font-bold ${r.status==='paid'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{r.status.toUpperCase()}</span></div>
                <div className="mt-1 text-xs font-bold truncate">{r.title}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-">
                  <div className="bg-white p-2 rounded-xl border">Due <b>₹{r.total_due}</b></div>
                  <div className="bg-white p-2 rounded-xl border">Paid <b>₹{r.total_paid}</b></div>
                  <div className="bg-white p-2 rounded-xl border">Last <b>{r.last_paid}</b></div>
                  <div className="bg-white p-2 rounded-xl border">{r.paymode||'-'}<div className="text- truncate">{r.receipt}</div></div>
                </div>
                <div className="mt-1 text- flex justify-between"><span>Ledger {r.ledger}</span><span>₹{r.amount}</span></div>
              </div>
            ))}
          </div>

          <div className="hidden md:block mt-3 border rounded-2xl overflow-hidden">
            <div className="max-h- overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b text-"><tr><th className="p-3 text-left">Month</th><th className="p-3 text-left">Flat No</th><th className="p-3 text-left">Title</th><th className="p-3 text-right">Total Due</th><th className="p-3 text-right">Total Paid</th><th className="p-3 text-left">Last Paid</th><th className="p-3 text-center">Status</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">PayMode</th><th className="p-3 text-center">Ledger</th></tr></thead>
                <tbody>
                  {tableRows.map(r=>(
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{r.month}</td><td className="p-3">{r.flat_no}</td><td className="p-3"><div className="truncate max-w-">{r.title}</div><div className="text- opacity-60">₹{r.amount}</div></td><td className="p-3 text-right font-black text-red-600">₹{r.total_due}</td><td className="p-3 text-right font-black text-emerald-600">₹{r.total_paid}</td><td className="p-3">{r.last_paid}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text- font-bold ${r.status==='paid'?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-amber-50 text-amber-700 border'}`}>{r.status.toUpperCase()}</span></td><td className="p-3 truncate max-w-">{r.receipt||'-'}</td><td className="p-3"><span className={`px-2 py-1 rounded-full text- ${r.paymode==='CASH'?'bg-amber-50 text-amber-700':'bg-blue-50 text-blue-700'}`}>{r.paymode||'-'}</span></td><td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-black text-white text-">{r.ledger}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
