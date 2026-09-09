"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard(){
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState({ occupied:487, visitors:127, complaints:12, guards:'11/12' })
  const [residents, setResidents] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data: allRes } = await supabase.from('residents').select('*').order('created_at',{ascending:false})
    const { data: vAll } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(100)
    const { data: cData } = await supabase.from('complaints').select('*')
    const { data: gData } = await supabase.from('guards').select('*')
    if(allRes) setResidents(allRes)
    if(vAll) setVisitors(vAll)
    const active = gData?.filter(g=>g.status==='active').length || 11
    setStats({ occupied: allRes?.filter(r=>r.status==='approved').length || 487, visitors: vAll?.length || 127, complaints: cData?.length || 12, guards: `${active}/${gData?.length||12}` })
  }
  useEffect(()=>{ load() },[])

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time: new Date().toISOString()}).eq('id', id)
    load()
  }

  const fRes = residents.filter(r=> `${r.flat_no} ${r.name} ${r.mobile}`.toLowerCase().includes(search.toLowerCase()))
  const fVis = visitors.filter(v=> `${v.visitor_name} ${v.flat_no}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <div className="max-w- mx-auto px-4 py-4 md:px-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text- md:text- font-bold text-[#1A2332] tracking-tight" style={{fontFamily:'serif'}}>Admin Dashboard • SOCIETY ADMIN</h1>
          <div className="flex gap-2">
            <button className="h- px- rounded-full bg-[#0B1120] text-white text- font-semibold shadow-sm">Add Resident</button>
            <button className="h- px- rounded-full bg-white border border-[#E5E7EB] text- font-medium">Generate Bills</button>
            <button className="h- px- rounded-full bg-white border border-[#E5E7EB] text- font-medium hidden md:block">Post Notice</button>
          </div>
        </div>

        {/* 12 CARDS - EXACT SAME */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {l:'TOTAL FLATS', v:530, bar:'w-[42%]', color:'bg-[#0B1120]', text:'text-[#0B1120]'},
            {l:'OCCUPIED', v:stats.occupied, bar:'w-[58%]', color:'bg-[#115E59]', text:'text-[#115E59]'},
            {l:'VACANT', v:530-stats.occupied, bar:'w-[28%]', color:'bg-[#94A3B8]', text:'text-[#334155]'},
            {l:'RESIDENTS', v:'1,842', bar:'w-[62%]', color:'bg-[#0B1120]', text:'text-[#0B1120]'},
            {l:'VISITORS TODAY', v:stats.visitors, bar:'w-[48%]', color:'bg-[#D4A017]', text:'text-[#0B1120]'},
            {l:'PENDING MAINT', v:'₹4.2L', bar:'w-[55%]', color:'bg-[#EF4444]', text:'text-[#EF4444]', red:true},
            {l:'COLLECTION MAY', v:'₹18.7L', bar:'w-[45%]', color:'bg-[#10B981]', text:'text-[#0B1120]'},
            {l:'COMPLAINTS', v:stats.complaints, bar:'w-[42%]', color:'bg-[#E3A008]', text:'text-[#0B1120]'},
            {l:'BOOKINGS', v:8, bar:'w-[35%]', color:'bg-[#8B5CF6]', text:'text-[#0B1120]'},
            {l:'PARKING FREE', v:64, bar:'w-[38%]', color:'bg-[#06B6D4]', text:'text-[#0B1120]'},
            {l:'GUARDS', v:stats.guards, bar:'w-[82%]', color:'bg-[#115E59]', text:'text-[#0B1120]'},
            {l:'COLLECTION %', v:'82%', bar:'w-[72%]', color:'bg-[#10B981]', text:'text-[#0B1120]'},
          ].map((c,i)=>(
            <div key={i} className="bg-white rounded- border border-[#EEF2F7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p- h- flex flex-col justify-between">
              <div className="text- tracking-[0.08em] text-[#8A9BB0] font-medium">{c.l}</div>
              <div className={`text- font-bold leading-none ${c.red?'text-[#EF4444]':'text-[#1A2332]'}`}>{c.v}</div>
              <div className="mt-2 h- w-full bg-[#EEF2F7] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.color} ${c.bar}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* 3 GRAPHS - EXACT SAME */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Monthly Collection */}
          <div className="bg-white rounded- border border-[#EEF2F7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
            <div className="text- font-semibold text-[#1A2332]">Monthly Collection (₹L)</div>
            <div className="mt-6 flex items-end justify-between gap-2 h- px-2">
              {[72,84,66,92,84,110].map((h,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#0B1120] rounded-t- rounded-b-" style={{height:h+'px'}}></div>
                  <span className="mt-2 text- text-[#8A9BB0]">{['Jan','Feb','Mar','Apr','May','Jun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Expense Breakdown */}
          <div className="bg-white rounded- border border-[#EEF2F7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
            <div className="text- font-semibold text-[#1A2332]">Expense Breakdown</div>
            <div className="mt-4 flex items-center gap-6">
              <div className="relative">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="34" fill="none" stroke="#EEF2F7" strokeWidth="12"/>
                  <circle cx="48" cy="48" r="34" fill="none" stroke="#0B1120" strokeWidth="12" strokeDasharray="74 214" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                  <circle cx="48" cy="48" r="34" fill="none" stroke="#115E59" strokeWidth="12" strokeDasharray="42 214" strokeDashoffset="-74" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                  <circle cx="48" cy="48" r="34" fill="none" stroke="#C9A23C" strokeWidth="12" strokeDasharray="53 214" strokeDashoffset="-116" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                  <circle cx="48" cy="48" r="34" fill="none" stroke="#94A3B8" strokeWidth="12" strokeDasharray="42 214" strokeDashoffset="-169" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text- space-y-2.5">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0B1120]"></span>Security 35%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#115E59]"></span>Cleaning 20%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C9A23C]"></span>Electricity 25%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span>Maintenance 20%</div>
              </div>
            </div>
          </div>
          {/* Visitor Trend */}
          <div className="bg-white rounded- border border-[#EEF2F7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
            <div className="text- font-semibold text-[#1A2332]">Visitor Trend</div>
            <div className="mt-2 relative h-">
              <svg viewBox="0 0 200 80" className="w-full h-full">
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A23C" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#C9A23C" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,50 C20,55 20,35 40,40 C60,45 60,15 90,25 C110,35 115,60 130,55 C145,50 155,5 175,8 L200,12 L200,80 L0,80 Z" fill="url(#goldGrad)"/>
                <path d="M0,50 C20,55 20,35 40,40 C60,45 60,15 90,25 C110,35 115,60 130,55 C145,50 155,5 175,8 L200,12" fill="none" stroke="#C9A23C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* TABS - EXACT PILL STYLE */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['Overview','Residents','Visitors','Parking','Maintenance','Accounts','Complaints','Amenities','Notices','Documents','Guards','Events','Reports','Settings'].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`h- px-4 rounded-full text-[12.5px] font-medium whitespace-nowrap border transition-all
              ${tab===t?'bg-[#0B1120] text-white border-[#0B1120] shadow':'bg-white text-[#475569] border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {tab==='Overview' && (
          <div className="mt-3 bg-white rounded- border border-[#EEF2F7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 grid md:grid-cols-2 gap-8">
            <div>
              <div className="text- font-semibold text-[#1A2332]">Complaints by Category</div>
              <div className="mt-4 space-y-3.5">
                {[{k:'Electrical',v:'68%'},{k:'Plumbing',v:'48%'},{k:'Parking',v:'78%'},{k:'Cleaning',v:'58%'},{k:'Security',v:'52%'}].map(c=>(
                  <div key={c.k} className="flex items-center gap-3">
                    <span className="w- text- text-[#475569]">{c.k}</span>
                    <div className="flex-1 h- bg-[#EEF2F7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#115E59] rounded-full" style={{width:c.v}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text- font-semibold text-[#1A2332]">Quick Actions</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={()=>setTab('Residents')} className="h- bg-[#F1F5F9] hover:bg-[#E8EEF4] rounded- text- font-medium text-[#1A2332]">Add Resident</button>
                <button className="h- bg-[#F1F5F9] hover:bg-[#E8EEF4] rounded- text- font-medium text-[#1A2332]">Generate Bills</button>
                <button className="h- bg-[#F1F5F9] hover:bg-[#E8EEF4] rounded- text- font-medium text-[#1A2332]">Post Notice</button>
                <button className="h- bg-[#F1F5F9] hover:bg-[#E8EEF4] rounded- text- font-medium text-[#1A2332]">View Reports</button>
              </div>
            </div>
          </div>
        )}

        {tab==='Residents' && (
          <div className="mt-3 bg-white rounded- border border-[#EEF2F7] overflow-hidden">
            <div className="p-3 flex gap-3">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile" className="h- flex-1 md:w- md:flex-none rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-4 text- outline-none"/>
              <span className="h- px-4 rounded-full bg-[#F8FAFC] border text- flex items-center">Total {fRes.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-"><thead className="bg-[#0B1120] text-white text-"><tr><th className="p-3 text-left">Flat</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Mobile</th><th className="p-3 text-left">Status</th></tr></thead>
              <tbody>{fRes.map(r=><tr key={r.id} className="border-t border-[#F1F5F9]"><td className="p-3 font-bold">{r.flat_no}</td><td className="p-3">{r.name}</td><td className="p-3">{r.mobile}</td><td className="p-3">{r.status}</td></tr>)}</tbody></table>
            </div>
          </div>
        )}

        {tab==='Visitors' && (
          <div className="mt-3 bg-white rounded- border border-[#EEF2F7] overflow-hidden">
            <div className="p-3 flex gap-3">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Visitor / Flat" className="h- flex-1 md:w- md:flex-none rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-4 text- outline-none"/>
              <span className="h- px-4 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text- font-bold flex items-center">Inside: {visitors.filter(v=>v.status==='inside').length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-"><thead className="bg-[#0B1120] text-white text-"><tr><th className="p-3 text-left">Visitor</th><th className="p-3 text-left">Flat</th><th className="p-3 text-left">Purpose</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Action</th></tr></thead>
              <tbody>{fVis.map(v=><tr key={v.id} className="border-t border-[#F1F5F9]"><td className="p-3 font-bold">{v.visitor_name}</td><td className="p-3">{v.flat_no}</td><td className="p-3">{v.purpose}</td><td className="p-3"><span className={`px-2 py-1 rounded-full text- ${v.status==='inside'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{v.status}</span></td><td className="p-3">{v.status==='inside'?<button onClick={()=>markExit(v.id)} className="px-3 py-1 bg-black text-white rounded-full text-">Exit</button>:<span className="text- text-gray-400">Exited</span>}</td></tr>)}</tbody></table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
