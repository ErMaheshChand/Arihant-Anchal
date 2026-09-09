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

  const fRes = residents.filter(r=> `${r.flat_no} ${r.name} ${r.mobile}`.toLowerCase().includes(search.toLowerCase()))
  const fVis = visitors.filter(v=> `${v.visitor_name} ${v.flat_no}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4">

        <div className="flex justify-between items-center bg-white rounded-3xl p-5 border shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-serif">Admin Dashboard • SOCIETY ADMIN</h1>
          <div className="flex gap-2">
            <button className="h-9 px-5 rounded-full bg-slate-900 text-white text-xs font-bold">Add Resident</button>
            <button className="h-9 px-5 rounded-full bg-white border text-xs hidden md:block">Generate Bills</button>
          </div>
        </div>

        {/* CARDS - ROUND + LIGHT COLOR - FIXED */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-slate-500 tracking-widest">TOTAL FLATS</span><span className="text-2xl font-extrabold">530</span><div className="h-1.5 bg-slate-200 rounded-full"><div className="h-full w-2/5 bg-slate-900 rounded-full"></div></div></div>
          <div className="bg-teal-50 rounded-3xl border border-teal-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-teal-700 tracking-widest">OCCUPIED</span><span className="text-2xl font-extrabold text-teal-900">{residents.filter(r=>r.status==='approved').length || 487}</span><div className="h-1.5 bg-teal-100 rounded-full"><div className="h-full w-11/12 bg-teal-700 rounded-full"></div></div></div>
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-slate-500 tracking-widest">VACANT</span><span className="text-2xl font-extrabold">43</span><div className="h-1.5 bg-slate-200 rounded-full"><div className="h-full w-1/4 bg-slate-400 rounded-full"></div></div></div>
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-gray-500 tracking-widest">RESIDENTS</span><span className="text-2xl font-extrabold">1,842</span><div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full w-3/5 bg-slate-900 rounded-full"></div></div></div>
          <div className="bg-amber-50 rounded-3xl border border-amber-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-amber-700 tracking-widest">VISITORS TODAY</span><span className="text-2xl font-extrabold text-amber-900">{visitors.length || 127}</span><div className="h-1.5 bg-amber-100 rounded-full"><div className="h-full w-1/2 bg-amber-500 rounded-full"></div></div></div>
          <div className="bg-red-50 rounded-3xl border border-red-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-red-600 tracking-widest">PENDING MAINT</span><span className="text-2xl font-extrabold text-red-600">₹4.2L</span><div className="h-1.5 bg-red-100 rounded-full"><div className="h-full w-2/3 bg-red-500 rounded-full"></div></div></div>

          <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-emerald-700 tracking-widest">COLLECTION MAY</span><span className="text-2xl font-extrabold text-emerald-900">₹18.7L</span><div className="h-1.5 bg-emerald-100 rounded-full"><div className="h-full w-4/5 bg-emerald-500 rounded-full"></div></div></div>
          <div className="bg-orange-50 rounded-3xl border border-orange-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-orange-700 tracking-widest">COMPLAINTS</span><span className="text-2xl font-extrabold">12</span><div className="h-1.5 bg-orange-100 rounded-full"><div className="h-full w-2/5 bg-orange-400 rounded-full"></div></div></div>
          <div className="bg-violet-50 rounded-3xl border border-violet-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-violet-700 tracking-widest">BOOKINGS</span><span className="text-2xl font-extrabold">8</span><div className="h-1.5 bg-violet-100 rounded-full"><div className="h-full w-1/3 bg-violet-500 rounded-full"></div></div></div>
          <div className="bg-cyan-50 rounded-3xl border border-cyan-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-cyan-700 tracking-widest">PARKING FREE</span><span className="text-2xl font-extrabold">64</span><div className="h-1.5 bg-cyan-100 rounded-full"><div className="h-full w-2/5 bg-cyan-500 rounded-full"></div></div></div>
          <div className="bg-teal-50 rounded-3xl border border-teal-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-teal-700 tracking-widest">GUARDS</span><span className="text-2xl font-extrabold">11/12</span><div className="h-1.5 bg-teal-100 rounded-full"><div className="h-full w-11/12 bg-teal-700 rounded-full"></div></div></div>
          <div className="bg-green-50 rounded-3xl border border-green-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-green-700 tracking-widest">COLLECTION %</span><span className="text-2xl font-extrabold">82%</span><div className="h-1.5 bg-green-100 rounded-full"><div className="h-full w-4/5 bg-green-500 rounded-full"></div></div></div>
        </div>

        {/* GRAPHS */}
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border p-5 shadow-sm"><div className="text-sm font-bold">Monthly Collection (₹L)</div><div className="mt-6 flex items-end gap-2 h-24">{[40,55,38,62,56,80].map((h,i)=><div key={i} className="flex-1 bg-slate-900 rounded-t-2xl" style={{height:h+'%'}}></div>)}</div><div className="flex justify-between text- text-slate-400 mt-2"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>
          <div className="bg-amber-50 rounded-3xl border border-amber-100 p-5 shadow-sm"><div className="text-sm font-bold">Expense Breakdown</div><div className="mt-4 flex items-center gap-6"><div className="w-20 h-20 rounded-full border-8 border-slate-900 border-t-teal-600 border-r-amber-400 border-b-slate-300"></div><div className="text-xs space-y-1"><div>● Security 35%</div><div>● Cleaning 20%</div><div>● Electricity 25%</div><div>● Maintenance 20%</div></div></div></div>
          <div className="bg-teal-50 rounded-3xl border border-teal-100 p-5 shadow-sm"><div className="text-sm font-bold">Visitor Trend</div><div className="mt-4 h-24"><svg viewBox="0 0 100 40" className="w-full h-full"><path d="M0,30 Q20,25 30,28 T50,15 T70,20 T85,5 T100,15" fill="none" stroke="#0F766E" strokeWidth="2"/><path d="M0,30 Q20,25 30,28 T50,15 T70,20 T85,5 T100,15 L100,40 L0,40 Z" fill="#0F766E" opacity="0.1"/></svg></div></div>
        </div>

        {/* TABS - LIGHT COLORS */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {[
            {n:'Overview', bg:'bg-slate-900 text-white'},
            {n:'Residents', bg:'bg-blue-100 text-blue-800 border-blue-200'},
            {n:'Visitors', bg:'bg-amber-100 text-amber-800 border-amber-200'},
            {n:'Parking', bg:'bg-cyan-100 text-cyan-800 border-cyan-200'},
            {n:'Maintenance', bg:'bg-red-100 text-red-800 border-red-200'},
            {n:'Accounts', bg:'bg-emerald-100 text-emerald-800 border-emerald-200'},
            {n:'Complaints', bg:'bg-orange-100 text-orange-800 border-orange-200'},
            {n:'Amenities', bg:'bg-violet-100 text-violet-800 border-violet-200'},
            {n:'Notices', bg:'bg-yellow-100 text-yellow-800 border-yellow-200'},
            {n:'Documents', bg:'bg-slate-100 text-slate-700 border-slate-200'},
            {n:'Guards', bg:'bg-teal-100 text-teal-800 border-teal-200'},
            {n:'Events', bg:'bg-pink-100 text-pink-800 border-pink-200'},
            {n:'Reports', bg:'bg-indigo-100 text-indigo-800 border-indigo-200'},
            {n:'Settings', bg:'bg-gray-100 text-gray-700 border-gray-200'},
          ].map(t=>(
            <button key={t.n} onClick={()=>setTab(t.n)} className={`h-9 px-4 rounded-full text-xs font-bold whitespace-nowrap border shadow-sm ${tab===t.n ? t.bg : 'bg-white text-slate-600 border-slate-200'}`}>{t.n}</button>
          ))}
        </div>

        {tab==='Overview' && (
          <div className="mt-3 bg-white rounded-3xl border p-6 grid md:grid-cols-2 gap-8 shadow-sm">
            <div><div className="text-sm font-bold">Complaints by Category</div><div className="mt-4 space-y-3">{[{k:'Electrical',w:'w-2/3'},{k:'Plumbing',w:'w-1/2'},{k:'Parking',w:'w-4/5'},{k:'Cleaning',w:'w-3/5'},{k:'Security',w:'w-1/2'}].map(c=><div key={c.k} className="flex gap-3 items-center text-xs"><span className="w-16">{c.k}</span><div className="flex-1 h-2 bg-slate-100 rounded-full"><div className={`h-full bg-teal-700 rounded-full ${c.w}`}></div></div></div>)}</div></div>
            <div><div className="text-sm font-bold">Quick Actions</div><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={()=>setTab('Residents')} className="h-12 rounded-2xl bg-slate-900 text-white text-xs font-bold">Add Resident</button><button className="h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold">Generate Bills</button><button className="h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold">Post Notice</button><button className="h-12 rounded-2xl bg-slate-50 border text-xs font-bold">View Reports</button></div></div>
          </div>
        )}

        {tab==='Residents' && (
          <div className="mt-3 bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-4 flex gap-3 bg-slate-50 border-b"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile" className="h-10 flex-1 rounded-full bg-white border px-5 text-sm outline-none"/><span className="h-10 px-5 rounded-full bg-slate-900 text-white text-xs flex items-center font-bold">Total {fRes.length}</span></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-900 text-white text-xs"><tr><th className="p-4 text-left">Flat</th><th className="p-4 text-left">Name</th><th className="p-4 text-left">Mobile</th><th className="p-4 text-left">Status</th></tr></thead><tbody>{fRes.map(r=><tr key={r.id} className="border-t"><td className="p-4 font-bold">{r.flat_no}</td><td className="p-4">{r.name}</td><td className="p-4">{r.mobile}</td><td className="p-4"><span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{r.status}</span></td></tr>)}</tbody></table></div>
          </div>
        )}

        {tab==='Visitors' && (
          <div className="mt-3 bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-4 flex gap-3 bg-amber-50 border-b border-amber-100"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Visitor / Flat" className="h-10 flex-1 rounded-full bg-white border border-amber-200 px-5 text-sm outline-none"/><span className="h-10 px-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center">Inside: {visitors.filter(v=>v.status==='inside').length}</span></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-900 text-white text-xs"><tr><th className="p-4 text-left">Visitor</th><th className="p-4 text-left">Flat</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Action</th></tr></thead><tbody>{fVis.map(v=><tr key={v.id} className="border-t"><td className="p-4 font-bold">{v.visitor_name}</td><td className="p-4">{v.flat_no}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${v.status==='inside'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{v.status}</span></td><td className="p-4">{v.status==='inside'?<button onClick={()=>markExit(v.id)} className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold">Exit</button>:<span className="text-xs text-gray-400">Exited</span>}</td></tr>)}</tbody></table></div>
          </div>
        )}
      </div>
    </div>
  )
}
