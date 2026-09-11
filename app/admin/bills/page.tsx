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
  const lastPaid = ledger.length>0? ledger[0]?.created_at : null

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

  // New table data as per requirement
  const tableRows = bills.map(b=>{
    const month = b.due_date? new Date(b.due_date).toLocaleString('en-IN',{month:'short', year:'2-digit'}) : '-'
    const lastP = b.paid_at? new Date(b.paid_at).toLocaleDateString() : lastPaid? new Date(lastPaid).toLocaleDateString() : '-'
    return { month, flat_no: b.flat_no, title: b.title, total_due: totalDue, total_paid: totalCollection, last_paid: lastP, status: b.status, receipt: b.receipt_no||'', paymode: b.pay_mode||'', ledger: b.status==='paid'?'CREDIT':'PENDING', id: b.id, amount: b.amount, due_date: b.due_date }
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 text-black">
      <div className="max-w-7xl mx-auto space-y-3">

        {/* HEADER + LIGHT COLOR TABS */}
        <div className="bg-white rounded-2xl md:rounded- border shadow-sm p-3 sticky top-2 z-20">
          <h1 className="font-black text- md:text-sm">Admin - Resident Bills & Ledger (Fixed Total)</h1>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>setMode('CASH')} className={`flex-1 md:flex-none px-4 h-10 rounded-full text-xs font-bold border transition ${mode==='CASH'?'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm':'bg-slate-50 text-slate-600 border-slate-200'}`}>💵 CASH DEPOSIT</button>
            <button onClick={()=>setMode('DUE')} className={`flex-1 md:flex-none px-4 h-10 rounded-full text-xs font-bold border transition ${mode==='DUE'?'bg-blue-50 text-blue-700 border-blue-200 shadow-sm':'bg-slate-50 text-slate-600 border-slate-200'}`}>➕ ADD NEW DUE</button>
          </div>

          {/* MOBILE VIEW - STACK */}
          <div className="mt-3">
            {mode==='CASH'? (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input value={selectedFlat} onChange={e=>setSelectedFlat(e.target.value.toUpperCase())} className="h-11 rounded-xl border bg-emerald-50/50 border-emerald-100 px-3 text-xs font-bold" placeholder="Flat No" />
                <input value={cashForm.amount} onChange={e=>setCashForm({...cashForm, amount:e.target.value})} type="number" className="h-11 rounded-xl border bg-white px-3 text-xs font-bold" placeholder="Amount*" />
                <input type="date" value={cashForm.date} onChange={e=>setCashForm({...cashForm, date:e.target.value})} className="h-11 rounded-xl border bg-white px-2 text-xs" />
                <input value={cashForm.receipt_no} onChange={e=>setCashForm({...cashForm, receipt_no:e.target.value})} className="h-11 rounded-xl border bg-white px-3 text-xs" placeholder="Receipt" />
                <input value={cashForm.depositor} onChange={e=>setCashForm({...cashForm, depositor:e.target.value})} className="h-11 rounded-xl border bg-white px-3 text-xs" placeholder="Depositor" />
                <button onClick={cashDeposit} className="h-11 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black">DEPOSIT</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input value={newBill.flat_no} onChange={e=>setNewBill({...newBill, flat_no:e.target.value})} className="h-11 rounded-xl border bg-blue-50/50 border-blue-100 px-3 text-xs" placeholder="Flat No" />
                <select value={newBill.type} onChange={e=>setNewBill({...newBill, type:e.target.value})} className="h-11 rounded-xl border bg-white px-2 text-xs"><option value="monthly">Monthly</option><option value="old_due">Old Due</option><option value="other">Other</option></select>
                <input type="date" value={newBill.due_date} onChange={e=>setNewBill({...newBill, due_date:e.target.value})} className="h-11 rounded-xl border bg-white px-2 text-xs" />
                <input value={newBill.amount} onChange={e=>setNewBill({...newBill, amount:e.target.value})} type="number" className="h-11 rounded-xl border bg-white px-3 text-xs" placeholder="Amount" />
                <input value={newBill.title} onChange={e=>setNewBill({...newBill, title:e.target.value})} className="h-11 rounded-xl border bg-white px-3 text-xs" placeholder="Title" />
                <button onClick={addBill} className="h-11 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black">ADD BILL</button>
              </div>
            )}
          </div>
        </div>

        {/* FILTER - MOBILE VIEW */}
        <div className="bg-white rounded-2xl border shadow-sm p-3">
          <div className="text- font-black tracking-widest opacity-60">SEARCH / FILTER</div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
            <input value={fFlat} onChange={e=>setFFlat(e.target.value)} placeholder="Flat No" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold col-span-1" />
            <input value={fMobile} onChange={e=>setFMobile(e.target.value)} placeholder="Mobile No" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold col-span-1" />
            <input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs col-span-1" />
            <input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs col-span-1" />
            <button onClick={()=>{setFFlat(''); setFMobile(''); setFFrom(''); setFTo('')}} className="h-11 rounded-xl bg-slate-900 text-white text-xs font-bold col-span-2 md:col-span-1">Clear Filter</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filtered.slice(0,15).map(f=><button key={f.flat_no} onClick={()=>setSelectedFlat(f.flat_no)} className={`px-3 py-1.5 rounded-full border text-xs font-bold ${selectedFlat===f.flat_no?'bg-slate-900 text-white border-slate-900':'bg-slate-50 text-slate-700 border-slate-200'}`}>{f.flat_no}</button>)}
          </div>
        </div>

        {/* FLAT DETAILS - LIGHT */}
        <div className="bg-white rounded-2xl border shadow-sm p-3">
          <div className="text- font-bold">Complete Flat Details - {selectedFlat} <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-">{resident?.name||''} {resident?.mobile?`• ${resident.mobile}`:''}</span></div>
          <div className="mt-2 text- p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <b>{selectedFlat}</b> | {resident?.name||'-'} | {resident?.mobile||'-'} | Due <b className="text-red-600">₹{totalDue}</b> | Paid <b className="text-emerald-600">₹{totalCollection}</b> | Last Paid {lastPaid? new Date(lastPaid).toLocaleDateString() : '-'}
          </div>
        </div>

        {/* NEW TABLE AS PER REQUIREMENT */}
        <div className="bg-white rounded-2xl border shadow-sm p-3">
          <div className="flex justify-between items-center">
            <div className="font-bold text-">Complete Flat + Ledger Table</div>
            <div className="text- bg-slate-900 text-white px-2 py-1 rounded-full">{tableRows.length} rows</div>
          </div>

          {/* MOBILE CARD VIEW + DESKTOP TABLE */}
          {/* Mobile Cards */}
          <div className="md:hidden mt-3 space-y-2 max-h- overflow-y-auto">
            {tableRows.map(r=>(
              <div key={r.id} className="p-3 rounded-2xl border bg-slate-50">
                <div className="flex justify-between"><span className="text- font-bold">{r.month} • {r.flat_no}</span><span className={`text- px-2 py-0.5 rounded-full font-bold ${r.status==='paid'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{r.status.toUpperCase()}</span></div>
                <div className="mt-1 text-xs font-bold truncate">{r.title}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-">
                  <div className="bg-white p-2 rounded-xl border"><div className="opacity-60">Total Due</div><div className="font-black">₹{r.total_due}</div></div>
                  <div className="bg-white p-2 rounded-xl border"><div className="opacity-60">Total Paid</div><div className="font-black text-emerald-600">₹{r.total_paid}</div></div>
                  <div className="bg-white p-2 rounded-xl border"><div className="opacity-60">Last Paid</div><div className="font-bold">{r.last_paid}</div></div>
                  <div className="bg-white p-2 rounded-xl border"><div className="opacity-60">PayMode / Receipt</div><div className="font-bold">{r.paymode||'-'}<div className="text- opacity-60 truncate">{r.receipt}</div></div></div>
                </div>
                <div className="mt-2 flex justify-between text-"><span>Ledger: <b>{r.ledger}</b></span><span>₹{r.amount}</span></div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block mt-3 border rounded-2xl overflow-hidden">
            <div className="max-h- overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b text- font-bold text-slate-500"><tr><th className="p-3 text-left">Month</th><th className="p-3 text-left">Flat No</th><th className="p-3 text-left">Title</th><th className="p-3 text-right">Total Due</th><th className="p-3 text-right">Total Paid</th><th className="p-3 text-left">Last Paid</th><th className="p-3 text-center">Status</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">PayMode</th><th className="p-3 text-center">Ledger</th></tr></thead>
                <tbody>
                  {tableRows.map(r=>(
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{r.month}</td>
                      <td className="p-3 font-bold">{r.flat_no}</td>
                      <td className="p-3"><div className="font-medium truncate max-w-">{r.title}</div><div className="text- opacity-60">₹{r.amount}</div></td>
                      <td className="p-3 text-right font-black text-red-600">₹{r.total_due}</td>
                      <td className="p-3 text-right font-black text-emerald-600">₹{r.total_paid}</td>
                      <td className="p-3 text-">{r.last_paid}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text- font-bold ${r.status==='paid'?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>{r.status.toUpperCase()}</span></td>
                      <td className="p-3 text- truncate max-w-">{r.receipt||'-'}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text- font-bold ${r.paymode==='CASH'?'bg-amber-50 text-amber-700 border border-amber-200':'bg-blue-50 text-blue-700 border border-blue-200'}`}>{r.paymode||'-'}</span></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-slate-900 text-white text-">{r.ledger}</span></td>
                    </tr>
                  ))}
                  {tableRows.length===0 && <tr><td colSpan={10} className="p-8 text-center opacity-40">No data - Filter clear karo</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 p-2 bg-slate-50 rounded-xl text- text-center font-bold">↕️ Mobile pe card view • Desktop pe table view • Scroll karo</div>
        </div>

      </div>
    </div>
  )
}
