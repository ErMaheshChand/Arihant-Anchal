"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard(){
  const [tab, setTab] = useState('Overview')
  const [residents, setResidents] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data: allRes } = await supabase.from('residents').select('*').order('created_at',{ascending:false})
    const { data: vAll } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(100)
    if(allRes) setResidents(allRes)
    if(vAll) setVisitors(vAll)
  }
  useEffect(()=>{ load() },[])

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time: new Date().toISOString()}).eq('id', id)
    load()
  }

  const fRes = residents.filter(r=> `${r.flat_no} ${r.name} ${r.mobile} ${r.aadhaar_no||''}`.toLowerCase().includes(search.toLowerCase()))
  const fVis = visitors.filter(v=> `${v.visitor_name} ${v.mobile||''} ${v.flat_no} ${v.aadhaar_no||''}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4">

        {/* HEADER - LIGHT ROUND */}
        <div className="sticky top-3 z-20 bg-white/90 backdrop-blur rounded- p-4 md:p-5 border border-black/5 shadow-sm flex justify-between items-center">
          <h1 className="text- md:text- font-black tracking-tight">Admin Dashboard <span className="font-normal text-black/40">• SOCIETY ADMIN</span></h1>
          <div className="flex gap-2">
            <button className="h-10 px-5 rounded-full bg-black text-white text-xs font-bold">Add Resident</button>
            <button className="h-10 px-5 rounded-full bg-[#F8FAFC] border border-black/5 text-xs hidden md:block font-bold">Generate Bills</button>
          </div>
        </div>

        {/* CARDS - ROUND + LIGHT - FIXED DASHBOARD */}
        <div className="sticky top- z-10 bg-[#FAFAFB]/90 backdrop-blur pt-4 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded- border border-black/5 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-black/40 tracking-widest">TOTAL FLATS</span><span className="text- font-black">530</span><div className="h-1.5 bg-[#F1F5F9] rounded-full"><div className="h-full w-2/5 bg-black rounded-full"></div></div></div>
            <div className="bg-[#ECFDF5] rounded- border border-emerald-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-emerald-700 tracking-widest">OCCUPIED</span><span className="text- font-black text-emerald-900">{residents.filter(r=>r.status==='approved').length || 487}</span><div className="h-1.5 bg-emerald-100 rounded-full"><div className="h-full w-11/12 bg-emerald-600 rounded-full"></div></div></div>
            <div className="bg-white rounded- border border-black/5 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-black/40 tracking-widest">VACANT</span><span className="text- font-black">43</span><div className="h-1.5 bg-[#F1F5F9] rounded-full"><div className="h-full w-1/4 bg-black/30 rounded-full"></div></div></div>
            <div className="bg-white rounded- border border-black/5 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-black/40 tracking-widest">RESIDENTS</span><span className="text- font-black">1,842</span><div className="h-1.5 bg-[#F1F5F9] rounded-full"><div className="h-full w-3/5 bg-black rounded-full"></div></div></div>
            <div className="bg-[#FFFBEB] rounded- border border-amber-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-amber-700 tracking-widest">VISITORS TODAY</span><span className="text- font-black text-amber-900">{visitors.length || 127}</span><div className="h-1.5 bg-amber-100 rounded-full"><div className="h-full w-1/2 bg-amber-400 rounded-full"></div></div></div>
            <div className="bg-[#FEF2F2] rounded- border border-red-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-red-600 tracking-widest">PENDING MAINT</span><span className="text- font-black text-red-600">₹4.2L</span><div className="h-1.5 bg-red-100 rounded-full"><div className="h-full w-2/3 bg-red-400 rounded-full"></div></div></div>

            <div className="bg-[#ECFDF5] rounded- border border-emerald-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-emerald-700 tracking-widest">COLLECTION MAY</span><span className="text- font-black text-emerald-900">₹18.7L</span><div className="h-1.5 bg-emerald-100 rounded-full"><div className="h-full w-4/5 bg-emerald-500 rounded-full"></div></div></div>
            <div className="bg-[#FFF7ED] rounded- border border-orange-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-orange-700 tracking-widest">COMPLAINTS</span><span className="text- font-black">12</span><div className="h-1.5 bg-orange-100 rounded-full"><div className="h-full w-2/5 bg-orange-400 rounded-full"></div></div></div>
            <div className="bg-[#F5F3FF] rounded- border border-violet-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-violet-700 tracking-widest">BOOKINGS</span><span className="text- font-black">8</span><div className="h-1.5 bg-violet-100 rounded-full"><div className="h-full w-1/3 bg-violet-500 rounded-full"></div></div></div>
            <div className="bg-[#ECFEFF] rounded- border border-cyan-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-cyan-700 tracking-widest">PARKING FREE</span><span className="text- font-black">64</span><div className="h-1.5 bg-cyan-100 rounded-full"><div className="h-full w-2/5 bg-cyan-500 rounded-full"></div></div></div>
            <div className="bg-[#ECFDF5] rounded- border border-emerald-200 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-emerald-700 tracking-widest">GUARDS</span><span className="text- font-black">11/12</span><div className="h-1.5 bg-emerald-100 rounded-full"><div className="h-full w-11/12 bg-emerald-600 rounded-full"></div></div></div>
            <div className="bg-[#F0FDF4] rounded- border border-green-100 p-4 h-28 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-green-700 tracking-widest">COLLECTION %</span><span className="text- font-black">82%</span><div className="h-1.5 bg-green-100 rounded-full"><div className="h-full w-4/5 bg-green-500 rounded-full"></div></div></div>
          </div>
        </div>

        {/* GRAPHS */}
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded- border border-black/5 p-5 shadow-sm"><div className="text-sm font-bold">Monthly Collection (₹L)</div><div className="mt-6 flex items-end gap-2 h-24">{[40,55,38,62,56,80].map((h,i)=><div key={i} className="flex-1 bg-black rounded-t-" style={{height:h+'%'}}></div>)}</div><div className="flex justify-between text- text-black/40 mt-2"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>
          <div className="bg-[#FFFBEB] rounded- border border-amber-100 p-5 shadow-sm"><div className="text-sm font-bold">Expense Breakdown</div><div className="mt-4 flex items-center gap-6"><div className="w-20 h-20 rounded-full border-8 border-black border-t-emerald-600 border-r-amber-400 border-b-gray-200"></div><div className="text-xs space-y-1"><div>● Security 35%</div><div>● Cleaning 20%</div><div>● Electricity 25%</div><div>● Maintenance 20%</div></div></div></div>
          <div className="bg-[#ECFDF5] rounded- border border-emerald-100 p-5 shadow-sm"><div className="text-sm font-bold">Visitor Trend</div><div className="mt-4 h-24"><svg viewBox="0 0 100 40" className="w-full h-full"><path d="M0,30 Q20,25 30,28 T50,15 T70,20 T85,5 T100,15" fill="none" stroke="#059669" strokeWidth="2"/><path d="M0,30 Q20,25 30,28 T50,15 T70,20 T85,5 T100,15 L100,40 L0,40 Z" fill="#059669" opacity="0.1"/></svg></div></div>
        </div>

        {/* TABS - LIGHT ROUND */}
        <div className="mt-5 bg-white rounded- border border-black/5 p-2 shadow-sm overflow-x-auto">
          <div className="flex gap-2 w-max">
            {[
              {n:'Overview', bg:'bg-black text-white'},
              {n:'Residents', bg:'bg-blue-50 text-blue-700 border-blue-100'},
              {n:'Visitors', bg:'bg-amber-50 text-amber-700 border-amber-100'},
              {n:'Parking', bg:'bg-cyan-50 text-cyan-700 border-cyan-100'},
              {n:'Maintenance', bg:'bg-red-50 text-red-600 border-red-100'},
              {n:'Guards', bg:'bg-emerald-50 text-emerald-700 border-emerald-100'},
            ].map(t=>(
              <button key={t.n} onClick={()=>setTab(t.n)} className={`h-9 px-5 rounded-full text-xs font-bold whitespace-nowrap border ${tab===t.n? t.bg : 'bg-[#F8FAFC] text-black/60 border-black/5'}`}>{t.n}</button>
            ))}
          </div>
        </div>

        {/* RESIDENTS - SEPARATE VISITOR / MOBILE + AADHAAR */}
        {tab==='Residents' && (
          <div className="mt-4 bg-white rounded- border border-black/5 shadow-sm overflow-hidden max-w- mx-auto">
            <div className="p-4 flex gap-3 bg-[#F8FAFC] border-b border-black/5"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile / Aadhaar" className="h-11 flex-1 rounded-full bg-white border border-black/5 px-5 text-sm outline-none"/><span className="h-11 px-5 rounded-full bg-black text-white text-xs flex items-center font-bold">Total {fRes.length}</span></div>
            <div className="overflow-auto max-h-">
              <div className="min-w-">
                <table className="w-full text-"><thead className="sticky top-0 bg-[#F8FAFC] text-black/50"><tr><th className="p-4 text-left">Photo</th><th className="p-4 text-left">Visitor Name</th><th className="p-4 text-left">Mobile</th><th className="p-4 text-left">Flat / Gate</th><th className="p-4 text-left">Aadhaar No</th><th className="p-4 text-left">Status</th></tr></thead><tbody>{fRes.map((r,i)=><tr key={r.id} className={`border-t border-black/[0.04] ${i%2===0?'bg-white':'bg-[#FBFCFE]'}`}><td className="p-4"><div className="w-9 h-9 rounded- bg-[#F1F5F9] border"/></td><td className="p-4 font-bold">{r.name}</td><td className="p-4 text-black/60">{r.mobile}</td><td className="p-4 font-medium">{r.flat_no}</td><td className="p-4 text-black/60">{r.aadhaar_no? `XXXX-XXXX-${String(r.aadhaar_no).slice(-4)}` : 'XXXX-XXXX-'+String(r.mobile||'').slice(-4)}</td><td className="p-4"><span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-emerald-700 text- font-bold">{r.status}</span></td></tr>)}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* VISITORS - SEPARATE COLUMNS */}
        {tab==='Visitors' && (
          <div className="mt-4 bg-white rounded- border border-black/5 shadow-sm overflow-hidden max-w- mx-auto">
            <div className="p-4 flex gap-3 bg-[#FFFBEB] border-b border-amber-100"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Visitor / Mobile / Aadhaar" className="h-11 flex-1 rounded-full bg-white border border-amber-100 px-5 text-sm outline-none"/><span className="h-11 px-5 rounded-full bg-black text-white text-xs font-bold flex items-center">Inside: {visitors.filter(v=>v.status==='inside').length}</span></div>
            <div className="overflow-auto max-h-">
              <div className="min-w-">
                <table className="w-full text-"><thead className="sticky top-0 bg-[#F8FAFC] text-black/50"><tr><th className="p-4 text-left">Date/Time</th><th className="p-4 text-left">Photo</th><th className="p-4 text-left">Visitor Name</th><th className="p-4 text-left">Mobile</th><th className="p-4 text-left">Aadhaar No</th><th className="p-4 text-left">Flat</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Action</th></tr></thead><tbody>{fVis.map((v,i)=><tr key={v.id} className={`border-t border-black/[0.04] ${i%2===0?'bg-white':'bg-[#FBFCFE]'}`}><td className="p-4"><div className="font-bold">{new Date(v.created_at).toLocaleDateString()}</div><div className="text- text-black/40">{new Date(v.created_at).toLocaleTimeString()}</div></td><td className="p-4"><img src={v.photo_url||'https://i.pravatar.cc/100'} className="w-9 h-9 rounded- object-cover border"/></td><td className="p-4 font-bold uppercase">{v.visitor_name}</td><td className="p-4 text-black/60">{v.mobile||'-'}</td><td className="p-4 text-black/60">{v.aadhaar_no?`XXXX-XXXX-${String(v.aadhaar_no).slice(-4)}`:'XXXX-XXXX-1234'}</td><td className="p-4 font-bold">{v.flat_no}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text- font-bold ${v.status==='inside'?'bg-[#ECFDF5] text-emerald-700':'bg-[#F1F5F9] text-black/40'}`}>{v.status}</span></td><td className="p-4">{v.status==='inside'?<button onClick={()=>markExit(v.id)} className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-bold">Exit</button>:<span className="text-xs text-black/30">Exited</span>}</td></tr>)}</tbody></table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
