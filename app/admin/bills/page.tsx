'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminBillsPage(){
  const [flats, setFlats] = useState<any[]>([])
  const [selectedFlat, setSelectedFlat] = useState('')
  const [resident, setResident] = useState<any>(null)
  const [bills, setBills] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [cashDeposits, setCashDeposits] = useState<any[]>([])
  const [tabMode, setTabMode] = useState<'cash'|'due'>('cash')
  const [searchFlat, setSearchFlat] = useState('')
  const [searchMobile, setSearchMobile] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [newBill, setNewBill] = useState({flat_no:'', title:'', amount:'', type:'monthly', due_date: new Date().toISOString().split('T')[0]})
  const [cashForm, setCashForm] = useState({amount:'', date: new Date().toISOString().split('T')[0], receipt_no:`RCP-CASH-${Date.now()}`, depositor:'', remarks:''})

  const loadFlats = async ()=>{
    const { data } = await supabase.from('residents').select('*').order('flat_no')
    if(data && data.length>0) setFlats(data)
    else {
      const { data: b } = await supabase.from('bills').select('flat_no').order('flat_no')
      const uniq = Array.from(new Set((b||[]).map((x:any)=>x.flat_no))) as string[]
      setFlats(uniq.map(f=>({flat_no:f, name:'Resident', mobile:'-'})))
    }
  }

  const loadData = async ()=>{
    if(!selectedFlat) return
    const { data: res } = await supabase.from('residents').select('*').eq('flat_no', selectedFlat).single()
    setResident(res || {flat_no:selectedFlat, name:'Resident '+selectedFlat, mobile:'-', email:'-', tower:selectedFlat.split('-')[0]})

    let q = supabase.from('bills').select('*').eq('flat_no', selectedFlat).order('due_date',{ascending:false})
    if(fromDate) q = q.gte('due_date', fromDate)
    if(toDate) q = q.lte('due_date', toDate)
    const { data: b } = await q
    if(b) setBills(b)

    let q2 = supabase.from('society_ledger').select('*').eq('flat_no', selectedFlat).order('created_at',{ascending:false})
    if(fromDate) q2 = q2.gte('created_at', fromDate)
    if(toDate) q2 = q2.lte('created_at', toDate+'T23:59:59')
    const { data: l } = await q2
    if(l) setLedger(l)

    let q3 = supabase.from('cash_deposits').select('*').eq('flat_no', selectedFlat).order('deposit_date',{ascending:false})
    if(fromDate) q3 = q3.gte('deposit_date', fromDate)
    if(toDate) q3 = q3.lte('deposit_date', toDate)
    const { data: c } = await q3
    if(c) setCashDeposits(c)
  }

  useEffect(()=>{ loadFlats() },[])
  useEffect(()=>{ loadData() },[selectedFlat, fromDate, toDate])
  useEffect(()=>{ if(flats.length>0 &&!selectedFlat) setSelectedFlat(flats[0].flat_no) },[flats])

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
    if(!selectedFlat ||!cashForm.amount ||!cashForm.receipt_no){ alert('Amount + Receipt bharo'); return }
    const amt = Number(cashForm.amount)
    await supabase.from('cash_deposits').insert({
      flat_no: selectedFlat, amount: amt, deposit_date: cashForm.date,
      receipt_no: cashForm.receipt_no, depositor_name: cashForm.depositor || resident?.name || 'Cash',
      pay_mode: 'CASH', remarks: cashForm.remarks
    })
    await supabase.from('society_ledger').insert({
      flat_no: selectedFlat, amount: amt, type: 'credit', title: `CASH DEPOSIT - ${cashForm.receipt_no} - ${cashForm.depositor}`,
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
        await supabase.from('bills').update({amount: billAmt - remaining}).eq('id', bill.id)
        await supabase.from('bills').insert({ flat_no: selectedFlat, title: bill.title + ' (Partial Paid)', amount: remaining, type: bill.type, due_date: bill.due_date, status:'paid', paid_at: new Date().toISOString(), pay_mode:'CASH', receipt_no: cashForm.receipt_no })
        remaining = 0
      }
    }
    alert(`✅ CASH ₹${amt} - ${selectedFlat} - Ledger Updated`)
    setCashForm({amount:'', date: new Date().toISOString().split('T')[0], receipt_no:`RCP-CASH-${Date.now()}`, depositor:'', remarks:''})
    loadData()
  }

  const pending = bills.filter(b=>b.status==='pending')
  const paid = bills.filter(b=>b.status==='paid')
  const totalDue = pending.reduce((s,b)=>s+Number(b.amount),0)
  const totalPaid = paid.reduce((s,b)=>s+Number(b.amount),0)
  const totalCollection = ledger.filter(l=>l.type==='credit').reduce((s,l)=>s+Number(l.amount),0)
  const totalCash = cashDeposits.reduce((s,c)=>s+Number(c.amount),0)
  const totalOnline = totalCollection - totalCash
  const oldDue = pending.filter(b=>b.type==='old_due').reduce((s,b)=>s+Number(b.amount),0)
  const monthlyDue = pending.filter(b=>b.type==='monthly').reduce((s,b)=>s+Number(b.amount),0)
  const otherDue = pending.filter(b=>b.type==='other').reduce((s,b)=>s+Number(b.amount),0)

  const filteredFlats = flats.filter(f=>{
    const matchFlat = f.flat_no.toLowerCase().includes(searchFlat.toLowerCase())
    const matchMobile = f.mobile? f.mobile.toString().includes(searchMobile) : true
    if(searchMobile) return matchFlat && matchMobile
    return matchFlat
  })

  const combinedTimeline = [
   ...bills.map(b=>({ id:'BILL-'+b.id, date: b.paid_at || b.due_date, created_at: b.created_at || b.due_date, flat: b.flat_no, title: b.title, type: b.type, amount: b.amount, status: b.status, pay_mode: b.pay_mode, receipt: b.receipt_no, ledgerType: b.status==='paid'?'credit':'debit', source:'BILL' })),
   ...ledger.map(l=>({ id:'LEDG-'+l.id, date: l.created_at, created_at: l.created_at, flat: l.flat_no, title: l.title, type: 'ledger', amount: l.amount, status: l.type==='credit'?'PAID':'DEBIT', pay_mode: l.title.toUpperCase().includes('CASH')?'CASH':'ONLINE', receipt: l.title.includes(' - ')? l.title.split(' - ')[1] : '', ledgerType: l.type, source:'LEDGER' }))
  ].sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="min-h-screen bg-slate-50 p-3 text-black">
      <div className="max-w-7xl mx-auto">
        {/* HEADER FIXED */}
        <div className="sticky top-0 z-30 bg-white border rounded-3xl p-4 shadow-sm">
          <h1 className="text-lg font-black">Admin - Resident Bills & Ledger (Fixed Total)</h1>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>setTabMode('cash')} className={`h-10 px-5 rounded-full text-xs font-bold ${tabMode==='cash'?'bg-emerald-600 text-white':'bg-slate-100 border'}`}>💵 CASH DEPOSIT</button>
            <button onClick={()=>setTabMode('due')} className={`h-10 px-5 rounded-full text-xs font-bold ${tabMode==='due'?'bg-black text-white':'bg-slate-100 border'}`}>➕ ADD NEW DUE</button>
            <button onClick={async()=>{ if(!confirm('Clear all?')) return; await supabase.from('bills').delete().neq('id','00000000-0000-0000-0000-000000000000'); location.reload() }} className="ml-auto h-10 px-4 rounded-full bg-red-50 text-red-600 border-red-200 text-xs font-bold">🗑️ Clear</button>
          </div>

          {/* TAB CONTENT */}
          <div className="mt-3">
            {tabMode==='cash'? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <input value={selectedFlat} onChange={e=>setSelectedFlat(e.target.value.toUpperCase())} placeholder="Flat No" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs font-bold" />
                <input value={cashForm.amount} onChange={e=>setCashForm({...cashForm, amount:e.target.value})} type="number" placeholder="Amount *" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs font-bold" />
                <input type="date" value={cashForm.date} onChange={e=>setCashForm({...cashForm, date:e.target.value})} className="h-10 rounded-xl bg-slate-50 border px-2 text-xs" />
                <input value={cashForm.receipt_no} onChange={e=>setCashForm({...cashForm, receipt_no:e.target.value})} placeholder="Receipt No *" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs font-bold" />
                <input value={cashForm.depositor} onChange={e=>setCashForm({...cashForm, depositor:e.target.value})} placeholder="Depositor Name" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
                <button onClick={handleCashDeposit} className="h-10 rounded-xl bg-emerald-600 text-white text-xs font-black">DEPOSIT & UPDATE LEDGER</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <input value={newBill.flat_no} onChange={e=>setNewBill({...newBill, flat_no:e.target.value})} placeholder="Flat No B-302" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
                <select value={newBill.type} onChange={e=>setNewBill({...newBill, type:e.target.value})} className="h-10 rounded-xl bg-slate-50 border px-2 text-xs">
                  <option value="monthly">Monthly</option><option value="old_due">Old Due</option><option value="other">Other</option>
                </select>
                <input type="date" value={newBill.due_date} onChange={e=>setNewBill({...newBill, due_date:e.target.value})} className="h-10 rounded-xl bg-slate-50 border px-2 text-xs" />
                <input value={newBill.amount} onChange={e=>setNewBill({...newBill, amount:e.target.value})} placeholder="Amount" type="number" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
                <input value={newBill.title} onChange={e=>setNewBill({...newBill, title:e.target.value})} placeholder="Title Ex: Water Sep" className="h-10 rounded-xl bg-slate-50 border px-3 text-xs" />
                <button onClick={addBill} className="h-10 rounded-xl bg-black text-white text-xs font-bold">Add Bill</button>
              </div>
            )}
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mt-4 p-4 rounded-3xl bg-white border">
          <div className="text-xs font-black">SEARCH / FILTER - Flat No, Mobile, Date From & To</div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            <input value={searchFlat} onChange={e=>setSearchFlat(e.target.value)} placeholder="Flat No Search B-302" className="h-11 rounded-xl bg-slate-50 border px-3 text-sm font-bold" />
            <input value={searchMobile} onChange={e=>setSearchMobile(e.target.value)} placeholder="Mobile No Search" className="h-11 rounded-xl bg-slate-50 border px-3 text-sm font-bold" />
            <div className="flex items-center gap-1 bg-slate-50 border rounded-xl px-2"><span className="text- font-bold">From</span><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="bg-transparent text-xs w-full h-11" /></div>
            <div className="flex items-center gap-1 bg-slate-50 border rounded-xl px-2"><span className="text- font-bold">To</span><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="bg-transparent text-xs w-full h-11" /></div>
            <button onClick={()=>{setSearchFlat(''); setSearchMobile(''); setFromDate(''); setToDate('')}} className="h-11 rounded-xl bg-black text-white text-xs font-bold">Clear Filter</button>
          </div>
          <div className="mt-3 max-h- overflow-y-auto flex flex-wrap gap-1">
            {filteredFlats.map(f=>(
              <button key={f.flat_no} onClick={()=>setSelectedFlat(f.flat_no)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${selectedFlat===f.flat_no?'bg-black text-white':'bg-slate-50'}`}>{f.flat_no} • {f.mobile||'-'}</button>
            ))}
          </div>
        </div>

        {/* RESIDENT COMPLETE DETAILS */}
        {resident && (
          <div className="mt-4 p-5 rounded-3xl bg-white border">
            <h2 className="font-bold text-sm">Complete Flat Details - {resident.flat_no} <span className="ml-2 text- px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{resident.owner_type||'Owner'}</span></h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Name</div><div className="font-bold">{resident.name}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Flat No</div><div className="font-bold">{resident.flat_no}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Mobile</div><div className="font-bold">{resident.mobile}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Tower</div><div className="font-bold">{resident.tower||resident.flat_no?.split('-')[0]}</div></div>
              <div className="p-3 rounded-2xl bg-slate-50 border"><div className="opacity-60">Email</div><div className="font-bold truncate">{resident.email||'-'}</div></div>
              <div className="p-3 rounded-2xl bg-slate-900 text-white"><div className="opacity-60">Total Due</div><div className="font-bold">₹{totalDue}</div></div>
            </div>
            <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-white border-2 border-slate-900"><div className="opacity-60">Monthly</div><div>₹{monthlyDue}</div></div>
              <div className="p-3 rounded-2xl bg-amber-400 border-2 border-black"><div>Old Due</div><div>₹{oldDue}</div></div>
              <div className="p-3 rounded-2xl bg-white border"><div className="opacity-60">Other</div><div>₹{otherDue}</div></div>
              <div className="p-3 rounded-2xl bg-emerald-600 text-white"><div className="opacity-80">Paid Bills</div><div>₹{totalPaid}</div></div>
              <div className="p-3 rounded-2xl bg-black text-white border-2 border-emerald-400"><div className="opacity-60">Ledger (Cash+Online)</div><div>₹{totalCollection}</div></div>
              <div className="p-3 rounded-2xl bg-white border"><div className="opacity-60">Cash ₹{totalCash} / Online ₹{totalOnline}</div><div>Records {combinedTimeline.length}</div></div>
            </div>
          </div>
        )}

        {/* COMPLETE TABLE WITH LEDGER FULL INFO */}
        <div className="mt-4 p-4 rounded-3xl bg-white border">
          <div className="flex justify-between items-center"><h3 className="font-bold text-sm">Complete Flat Details + Ledger Full History (Scroll)</h3><span className="text- bg-black text-white px-2 py-1 rounded-full">{combinedTimeline.length} rows</span></div>
          <div className="mt-3 rounded-2xl border overflow-hidden">
            <div className="max-h- overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900 text-white text- z-10"><tr><th className="text-left p-3">Date/Time</th><th className="text-left p-3">Flat + Mobile</th><th className="text-left p-3">Title / Type</th><th className="text-right p-3">Amount</th><th className="text-center p-3">Status</th><th className="text-left p-3">Pay Mode / Receipt</th><th className="text-center p-3">Ledger Type</th><th className="text-left p-3">Source</th></tr></thead>
                <tbody>
                  {combinedTimeline.map((r:any)=>(
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-3"><div className="font-bold">{new Date(r.date).toLocaleDateString()}</div><div className="text- opacity-60">{new Date(r.created_at).toLocaleTimeString()}</div></td>
                      <td className="p-3"><div className="font-bold">{r.flat}</div><div className="text- opacity-60">{resident?.mobile||''}</div></td>
                      <td className="p-3"><div className="font-medium truncate max-w-">{r.title}</div><div className="text- opacity-60">{r.type}</div></td>
                      <td className="p-3 text-right font-black">₹{r.amount}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text- font-bold ${r.status==='paid'||r.status==='PAID'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{r.status}</span></td>
                      <td className="p-3"><div className="font-bold">{r.pay_mode||'-'}</div><div className="text- truncate max-w-">{r.receipt||''}</div></td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text- font-bold ${r.ledgerType==='credit'?'bg-black text-white':'bg-slate-100'}`}>{r.ledgerType.toUpperCase()}</span></td>
                      <td className="p-3 text- opacity-60">{r.source}</td>
                    </tr>
                  ))}
                  {combinedTimeline.length===0 && <tr><td colSpan={8} className="p-10 text-center opacity-40">No data in this filter - Flat select karo ya Date hatayo</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">Due in Filter: ₹{totalDue}</div>
            <div className="p-3 rounded-2xl bg-emerald-600 text-white">Collection Ledger: ₹{totalCollection} (Cash ₹{totalCash})</div>
            <div className="p-3 rounded-2xl bg-white border">Total Rows: {combinedTimeline.length} | Bills {bills.length} + Ledger {ledger.length}</div>
          </div>
          <div className="mt-2 p-2 bg-slate-50 rounded-xl text- text-center font-bold">↕️ Scroll up/down — Complete Flat + Ledger ki puri jankari</div>
        </div>
      </div>
    </div>
  )
}
