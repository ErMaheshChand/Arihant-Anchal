'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminBillsPage(){
  const [flats, setFlats] = useState<any[]>([])
  const [selectedFlat, setSelectedFlat] = useState('')
  const [resident, setResident] = useState<any>(null)
  const [bills, setBills] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [searchFlat, setSearchFlat] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [newBill, setNewBill] = useState({flat_no:'', title:'', amount:'', type:'monthly', due_date: new Date().toISOString().split('T')[0]})
  const [cashForm, setCashForm] = useState({amount:'', date: new Date().toISOString().split('T')[0], receipt_no:`RCP-CASH-${Date.now()}`, depositor:'', remarks:''})

  const loadFlats = async ()=>{
    const { data } = await supabase.from('residents').select('*').order('flat_no')
    if(data && data.length>0) {
      setFlats(data);
      if(data[0] &&!selectedFlat) setSelectedFlat(data[0].flat_no)
    } else {
      const { data: b } = await supabase.from('bills').select('flat_no').order('flat_no')
      const uniq = Array.from(new Set((b||[]).map((x:any)=>x.flat_no))) as string[]
      setFlats(uniq.map(f=>({flat_no:f, name:'Resident', mobile:'-'})))
      if(uniq[0] &&!selectedFlat) setSelectedFlat(uniq[0])
    }
  }

  const loadData = async ()=>{
    if(!selectedFlat) return
    const { data: res } = await supabase.from('residents').select('*').eq('flat_no', selectedFlat).single()
    if(res) setResident(res)
    else setResident({flat_no:selectedFlat, name:'Resident '+selectedFlat, mobile:'-', email:'-', tower:selectedFlat.split('-')[0], owner_type:'Owner'})

    let q = supabase.from('bills').select('*').eq('flat_no', selectedFlat).order('due_date',{ascending:false})
    if(fromDate) q = q.gte('due_date', fromDate)
    if(toDate) q = q.lte('due_date', toDate)
    const { data: b } = await q
    if(b) setBills(b)

    const { data: l } = await supabase.from('society_ledger').select('*').eq('flat_no', selectedFlat).order('created_at',{ascending:false})
    if(l) setLedger(l)
  }

  useEffect(()=>{ loadFlats() },[])
  useEffect(()=>{ loadData() },[selectedFlat, fromDate, toDate])

  const addBill = async ()=>{
    if(!newBill.flat_no ||!newBill.amount){ alert('Flat + Amount bharo'); return }
    const { error } = await supabase.from('bills').insert({
      flat_no: newBill.flat_no.toUpperCase(),
      title: newBill.title || `${newBill.type} - ${newBill.due_date}`,
      amount: Number(newBill.amount),
      type: newBill.type,
      due_date: newBill.due_date,
      status:'pending'
    })
    if(!error){ alert('✅ Bill Added'); setNewBill({...newBill, amount:'', title:''}); loadData() } else alert(error.message)
  }

  const handleCashDeposit = async ()=>{
    if(!selectedFlat ||!cashForm.amount ||!cashForm.receipt_no){ alert('Amount + Receipt No bharo'); return }
    const amt = Number(cashForm.amount)

    const { error: e1 } = await supabase.from('cash_deposits').insert({
      flat_no: selectedFlat,
      amount: amt,
      deposit_date: cashForm.date,
      receipt_no: cashForm.receipt_no,
      depositor_name: cashForm.depositor || resident?.name || 'Cash',
      pay_mode: 'CASH',
      remarks: cashForm.remarks
    })
    if(e1){ alert(e1.message); return }

    await supabase.from('society_ledger').insert({
      flat_no: selectedFlat,
      amount: amt,
      type: 'credit',
      title: `CASH DEPOSIT - ${cashForm.receipt_no} - ${cashForm.depositor}`,
    })

    let remaining = amt
    const sortedPending = [...bills.filter(b=>b.status==='pending')].sort((a,b)=> new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    for(const bill of sortedPending){
      if(remaining<=0) break
      const billAmt = Number(bill.amount)
      if(remaining >= billAmt){
        await supabase.from('bills').update({status:'paid', paid_at: new Date().toISOString(), pay_mode:'CASH', receipt_no: cashForm.receipt_no}).eq('id', bill.id)
        remaining -= billAmt
      } else {
        // Partial payment case
        await supabase.from('bills').update({amount: billAmt - remaining}).eq('id', bill.id)
        await supabase.from('bills').insert({
          flat_no: selectedFlat,
          title: bill.title + ' (Partial Paid)',
          amount: remaining,
          type: bill.type,
          due_date: bill.due_date,
          status:'paid',
          paid_at: new Date().toISOString(),
          pay_mode:'CASH',
          receipt_no: cashForm.receipt_no
        })
        remaining = 0
      }
    }

    alert(`✅ CASH DEPOSIT ₹${amt} - ${selectedFlat} - Ledger Updated`)
    setCashForm({amount:'', date: new Date().toISOString().split('T')[0], receipt_no:`RCP-CASH-${Date.now()}`, depositor:'', remarks:''})
    loadData()
  }

  // FIXED TOTALS - Ledger = Final Truth (Cash + Online)
  const pending = bills.filter(b=>b.status==='pending')
  const paid = bills.filter(b=>b.status==='paid')
  const totalDue = pending.reduce((s,b)=>s+Number(b.amount),0)
  const totalPaidFromBills = paid.reduce((s,b)=>s+Number(b.amount),0)
  const totalCollection = ledger.filter(l=>l.type==='credit').reduce((s,l)=>s+Number(l.amount),0)
  const oldDue = pending.filter(b=>b.type==='old_due').reduce((s,b)=>s+Number(b.amount),0)
  const monthlyDue = pending.filter(b=>b.type==='monthly').reduce((s,b)=>s+Number(b.amount),0)
  const otherDue = pending.filter(b=>b.type==='other').reduce((s,b)=>s+Number(b.amount),0)
  const filteredFlats = flats.filter(f=> f.flat_no.toLowerCase().includes(searchFlat.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-black">Admin - Resident Bills & Ledger (Fixed Total)</h1>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white border">
            <div className="text-xs font-bold">Search Flat</div>
            <input value={searchFlat} onChange={e=>setSearchFlat(e.target.value)} placeholder="B-302 search" className="mt-2 w-full h-10 rounded-xl bg-slate-50 border px-3 text-sm" />
            <div className="mt-3 max-h- overflow-y-auto space-y-1">
              {filteredFlats.map(f=>(
                <button key={f.flat_no} onClick={()=>setSelectedFlat(f.flat_no)} className={`w-full text-left p-2.5 rounded-xl text-sm flex justify-between ${selectedFlat===f.flat_no?'bg-black text-white':'bg-slate-50 border'}`}>
                  <span className="font-bold">{f.flat_no}</span><span className="text-xs opacity-60">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl bg-white border">
            <div className="text-sm font-bold">Add New Due (Maintenance / Old / Other)</div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
              <input value={newBill.flat_no} onChange={e=>setNewBill({...newBill, flat_no:e.target.value})} placeholder="Flat No B-302" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
              <select value={newBill.type} onChange={e=>setNewBill({...newBill, type:e.target.value})} className="h-10 rounded-xl bg-slate-50 border px-2 text-xs">
                <option value="monthly">Monthly</option><option value="old_due">Old Due</option><option value="other">Other</option>
              </select>
              <input type="date" value={newBill.due_date} onChange={e=>setNewBill({...newBill, due_date:e.target.value})} className="h-10 rounded-xl bg-slate-50 border px-2 text-xs" />
              <input value={newBill.amount} onChange={e=>setNewBill({...newBill, amount:e.target.value})} placeholder="Amount" type="number" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
              <button onClick={addBill} className="h-10 rounded-xl bg-black text-white text-xs font-bold">Add Bill</button>
            </div>
            <input value={newBill.title} onChange={e=>setNewBill({...newBill, title:e.target.value})} placeholder="Title (optional) Ex: Water Charges Sep" className="mt-2 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
          </div>
        </div>

        {selectedFlat && (
          <div className="mt-4 p-5 rounded-3xl bg-white border-2 border-emerald-300">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-sm">💵 CASH DEPOSIT - {selectedFlat} <span className="ml-2 text-xs px-2 py-1 rounded-full bg-amber-400 text-black">OLD DUE: ₹{oldDue} | TOTAL DUE: ₹{totalDue}</span></h2>
              <span className="text- px-2 py-1 rounded-full bg-black text-white">LEDGER TOTAL: ₹{totalCollection}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div><div className="text- font-bold opacity-60">FLAT NO</div><input value={selectedFlat} onChange={e=>setSelectedFlat(e.target.value.toUpperCase())} className="mt-1 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs font-bold" /></div>
              <div><div className="text- font-bold opacity-60">AMOUNT *</div><input value={cashForm.amount} onChange={e=>setCashForm({...cashForm, amount:e.target.value})} type="number" placeholder="5000" className="mt-1 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs font-bold" /></div>
              <div><div className="text- font-bold opacity-60">DATE</div><input type="date" value={cashForm.date} onChange={e=>setCashForm({...cashForm, date:e.target.value})} className="mt-1 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs" /></div>
              <div><div className="text- font-bold opacity-60">RECEIPT NO *</div><input value={cashForm.receipt_no} onChange={e=>setCashForm({...cashForm, receipt_no:e.target.value})} className="mt-1 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs font-bold" /></div>
              <div><div className="text- font-bold opacity-60">DEPOSITOR</div><input value={cashForm.depositor} onChange={e=>setCashForm({...cashForm, depositor:e.target.value})} placeholder="Name" className="mt-1 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs" /></div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <input value={cashForm.remarks} onChange={e=>setCashForm({...cashForm, remarks:e.target.value})} placeholder="Remarks - Old due clear etc" className="col-span-3 w-full h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
              <button onClick={handleCashDeposit} className="h-10 rounded-xl bg-emerald-600 text-white text-xs font-black">💵 DEPOSIT & UPDATE LEDGER</button>
            </div>
          </div>
        )}

        {resident && (
          <div className="mt-4 p-5 rounded-3xl bg-white border">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Resident Registration Details - {resident.flat_no}</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">{resident.owner_type || 'Owner'}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Name</div><div className="font-bold text-sm">{resident.name}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Flat No</div><div className="font-bold text-sm">{resident.flat_no}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Mobile</div><div className="font-bold text-sm">{resident.mobile}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Tower</div><div className="font-bold text-sm">{resident.tower || resident.flat_no?.split('-')[0]}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Email</div><div className="font-bold text-sm">{resident.email || '-'}</div></div>
              <div className="p-3 rounded-2xl bg-slate-900 text-white"><div className="opacity-60">Total Due (Pending)</div><div className="font-bold text-sm">₹{totalDue}</div></div>
              <div className="p-3 rounded-2xl bg-emerald-600 text-white"><div className="opacity-80">Total Paid (Bills)</div><div className="font-bold text-sm">₹{totalPaidFromBills}</div></div>
              <div className="p-3 rounded-2xl bg-black text-white border-2 border-emerald-400"><div className="opacity-70">Ledger Collection (Cash+Online)</div><div className="font-bold text-sm">₹{totalCollection}</div></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white border-2 border-slate-900"><div className="opacity-60">Monthly Due</div><div className="font-black text-sm">₹{monthlyDue}</div></div>
              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300"><div className="opacity-60">Old Due</div><div className="font-black text-sm">₹{oldDue}</div></div>
              <div className="p-3 rounded-2xl bg-white border-2 border-blue-300"><div className="opacity-60">Other Charges</div><div className="font-black text-sm">₹{otherDue}</div></div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-3xl bg-white border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm">Complete Bills + Ledger - Scroll Table with Date Search</h3>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center bg-slate-50 border rounded-full px-2 py-1">
                <span className="text- font-bold">From</span><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="bg-transparent text-xs w-" />
              </div>
              <div className="flex gap-1 items-center bg-slate-50 border rounded-full px-2 py-1">
                <span className="text- font-bold">To</span><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="bg-transparent text-xs w-" />
              </div>
              {(fromDate||toDate) && <button onClick={()=>{setFromDate(''); setToDate('')}} className="h-8 px-3 rounded-full bg-black text-white text-xs">Clear</button>}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border overflow-hidden">
            <div className="max-h- overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900 text-white text-">
                  <tr><th className="text-left p-3">Date/Time</th><th className="text-left p-3">Flat</th><th className="text-left p-3">Title / Type</th><th className="text-right p-3">Amount</th><th className="text-center p-3">Status</th><th className="text-left p-3">Pay Mode / Receipt</th><th className="text-left p-3">Ledger</th></tr>
                </thead>
                <tbody>
                  {bills.map(b=>(
                    <tr key={b.id} className="border-b hover:bg-slate-50">
                      <td className="p-3"><div className="font-bold">{b.paid_at? new Date(b.paid_at).toLocaleDateString() : b.due_date}</div><div className="text- opacity-60">{b.paid_at? new Date(b.paid_at).toLocaleTimeString() : b.created_at? new Date(b.created_at).toLocaleString() : ''}</div></td>
                      <td className="p-3 font-bold">{b.flat_no}</td>
                      <td className="p-3"><div className="font-medium">{b.title}</div><div className="text- opacity-60">{b.type}</div></td>
                      <td className="p-3 text-right font-black">₹{b.amount}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text- font-bold ${b.status==='paid'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{b.status}</span></td>
                      <td className="p-3"><div>{b.pay_mode || '-'}</div><div className="text-">{b.receipt_no || ''}</div></td>
                      <td className="p-3">{ledger.find(l=>l.bill_id===b.id || l.title.includes(b.receipt_no||'XXX'))? <span className="text- bg-black text-white px-2 py-1 rounded-full">Credit OK</span> : <span className="text- opacity-40">-</span>}</td>
                    </tr>
                  ))}
                  {bills.length===0 && <tr><td colSpan={7} className="p-8 text-center opacity-40">No bills in this date range</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">Total Due in Filter: ₹{totalDue}</div>
            <div className="p-3 rounded-2xl bg-emerald-600 text-white">Total Paid: ₹{totalPaidFromBills} | Ledger: ₹{totalCollection}</div>
            <div className="p-3 rounded-2xl bg-white border">Total Bills: {bills.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
