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
      // UNIQUE Flat No only - duplicate hatao
      const uniqueMap = new Map()
      data.forEach((r:any)=>{
        if(!uniqueMap.has(r.flat_no)) uniqueMap.set(r.flat_no, r)
      })
      setFlats(Array.from(uniqueMap.values()))
      if(!selectedFlat) setSelectedFlat(Array.from(uniqueMap.values())[0]?.flat_no || 'B-302')
    }
  }
  const loadData = async ()=>{
    if(!selectedFlat) return
    const { data: res } = await supabase.from('residents').select('*').eq('flat_no', selectedFlat).maybeSingle()
    if(res) setResident(res)
    else setResident({flat_no:selectedFlat, name:'Resident', mobile:'-', tower:selectedFlat.split('-')[0]})

    let qb = supabase.from('bills').select('*').eq('flat_no', selectedFlat).order('created_at',{ascending:false})
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

  // FILTER - UNIQUE ONLY
  const filtered = flats.filter(f=>{
    const matchFlat = fFlat? f.flat_no.toLowerCase().includes(fFlat.toLowerCase()) : true
    const matchMob = fMobile? (f.mobile||'').toString().includes(fMobile) : true
    return matchFlat && matchMob
  })

  const pending = bills.filter(b=>b.status==='pending')
  const totalDue = pending.reduce((s,b)=>s+Number(b.amount),0)
  const totalCollection = ledger.filter(l=>l.type==='credit').reduce((s,l)=>s+Number(l.amount),0)

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
    <div className="min-h-screen bg-[#f5f5f5] p-2 text-black">
      <div className="max-w-7xl mx-auto space-y-3">

        {/* FIXED TABS */}
        <div className="bg-white rounded- border p-3 sticky top-2 z-20">
          <div className="flex justify-between items-center">
            <h1 className="font-black text-sm">Admin - Resident Bills & Ledger (Fixed Total)</h1>
            <div className="flex gap-2">
              <button onClick={()=>setMode('CASH')} className={`px-4 h-9 rounded-full text-xs font-black ${mode==='CASH'?'bg-emerald-600 text-white':'bg-slate-100 border'}`}>💵 CASH DEPOSIT</button>
              <button onClick={()=>setMode('DUE')} className={`px-4 h-9 rounded-full text-xs font-black ${mode==='DUE'?'bg-black text-white':'bg-slate-100 border'}`}>➕ ADD NEW DUE</button>
            </div>
          </div>
          <div className="mt-3">
            {mode==='CASH'? (
              <div className="grid grid-cols-6 gap-2">
                <input value={selectedFlat} onChange={e=>setSelectedFlat(e.target.value.toUpperCase())} className="h-10 rounded-xl border bg-slate-50 px-3 text-xs font-bold" placeholder="Flat" />
                <input value={cashForm.amount} onChange={e=>setCashForm({...cashForm, amount:e.target.value})} type="number" className="h-10 rounded-xl border bg-slate-50 px-3 text-xs font-bold" placeholder="Amount*" />
                <input type="date" value={cashForm.date} onChange={e=>setCashForm({...cashForm, date:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-2 text-xs" />
                <input value={cashForm.receipt_no} onChange={e=>setCashForm({...cashForm, receipt_no:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-3 text-xs" placeholder="Receipt" />
                <input value={cashForm.depositor} onChange={e=>setCashForm({...cashForm, depositor:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-3 text-xs" placeholder="Depositor" />
                <button onClick={cashDeposit} className="h-10 rounded-xl bg-emerald-600 text-white text-xs font-black">DEPOSIT</button>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                <input value={newBill.flat_no} onChange={e=>setNewBill({...newBill, flat_no:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-3 text-xs" placeholder="Flat" />
                <select value={newBill.type} onChange={e=>setNewBill({...newBill, type:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-2 text-xs"><option value="monthly">Monthly</option><option value="old_due">Old Due</option><option value="other">Other</option></select>
                <input type="date" value={newBill.due_date} onChange={e=>setNewBill({...newBill, due_date:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-2 text-xs" />
                <input value={newBill.amount} onChange={e=>setNewBill({...newBill, amount:e.target.value})} type="number" className="h-10 rounded-xl border bg-slate-50 px-3 text-xs" placeholder="Amount" />
                <input value={newBill.title} onChange={e=>setNewBill({...newBill, title:e.target.value})} className="h-10 rounded-xl border bg-slate-50 px-3 text-xs" placeholder="Title" />
                <button onClick={addBill} className="h-10 rounded-xl bg-black text-white text-xs font-black">ADD BILL</button>
              </div>
            )}
          </div>
        </div>

        {/* FILTER - UNIQUE FLAT ONLY */}
        <div className="bg-white rounded- border p-3">
          <div className="text- font-black">SEARCH / FILTER - Flat No, Mobile, Date From & To</div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            <input value={fFlat} onChange={e=>setFFlat(e.target.value)} placeholder="Flat No B-302" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold" />
            <input value={fMobile} onChange={e=>setFMobile(e.target.value)} placeholder="Mobile No" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold" />
            <input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs" />
            <input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-2 text-xs" />
            <button onClick={()=>{setFFlat(''); setFMobile(''); setFFrom(''); setFTo('')}} className="h-11 rounded-xl bg-black text-white text-xs font-bold">Clear</button>
          </div>
          {/* AB SIRF UNIQUE FLAT DIKHEGA - DUPLICATE HATA DIYA */}
          <div className="mt-3 flex flex-wrap gap-1">
            {filtered.slice(0,20).map(f=><button key={f.flat_no} onClick={()=>setSelectedFlat(f.flat_no)} className={`px-3 py-1.5 rounded-full border text-xs font-bold ${selectedFlat===f.flat_no?'bg-black text-white':'bg-slate-50'}`}>{f.flat_no}</button>)}
            {filtered.length>20 && <span className="text- px-2 py-1">+{filtered.length-20} more...</span>}
          </div>
        </div>

        {/* COMPLETE FLAT DETAILS - 6 TABS HATA DIYE */}
        <div className="bg-white rounded- border p-4">
          <div className="flex justify-between items-center">
            <div className="font-bold text-sm">Complete Flat Details - {selectedFlat} <span className="ml-2 text- px-2 py-1 rounded-full bg-black text-white">{resident?.owner_type||'Owner'}</span></div>
            <div className="text-xs font-bold">Due: ₹{totalDue} | Ledger: ₹{totalCollection} | {resident?.name||''} • {resident?.mobile||''}</div>
          </div>
          {/* SIRF 1 LINE SUMMARY - 6 TABS HATA DIYA */}
          <div className="mt-2 text- p-2 rounded-xl bg-slate-50 border">
            Flat: <b>{selectedFlat}</b> | Name: <b>{resident?.name||'-'}</b> | Mobile: <b>{resident?.mobile||'-'}</b> | Tower: <b>{resident?.tower||selectedFlat.split('-')[0]}</b> | Email: <b>{resident?.email||'-'}</b>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded- border p-3">
          <div className="font-bold text-sm flex justify-between"><span>Complete Flat + Ledger Table - {selectedFlat}</span><span className="text- bg-black text-white px-2 py-1 rounded-full">{bills.length+ledger.length} rows</span></div>
          <div className="mt-3 border rounded-2xl overflow-hidden">
            <div className="max-h- overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-black text-white text-"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Flat</th><th className="p-3 text-left">Title/Type</th><th className="p-3 text-right">Amount</th><th className="p-3 text-center">Status</th><th className="p-3 text-left">Receipt/PayMode</th><th className="p-3 text-center">Ledger</th></tr></thead>
                <tbody>
                  {[...bills,...ledger].sort((a:any,b:any)=>new Date(b.created_at||b.due_date).getTime()-new Date(a.created_at||a.due_date).getTime()).map((r:any)=>(
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">{new Date(r.created_at||r.due_date).toLocaleDateString()}<div className="text- opacity-50">{new Date(r.created_at||r.due_date).toLocaleTimeString()}</div></td>
                      <td className="p-3 font-bold">{r.flat_no}</td>
                      <td className="p-3"><div className="font-bold truncate max-w-">{r.title}</div><div className="text- opacity-60">{r.type||''}</div></td>
                      <td className="p-3 text-right font-black">₹{r.amount}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text- font-bold ${r.status==='paid'||r.type==='credit'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{r.status||r.type}</span></td>
                      <td className="p-3"><div className="text- font-bold">{r.pay_mode|| (r.title?.includes('CASH')?'CASH':'-')}</div><div className="text-">{r.receipt_no||''}</div></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-black text-white text-">{r.bill_id?'BILL': r.type==='credit'?'CREDIT':'PENDING'}</span></td>
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
