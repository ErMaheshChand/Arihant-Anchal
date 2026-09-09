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

  const cards = [
    {l:'TOTAL FLATS', v:530, bar:'w-[42%]', c:'bg-[#0B1120]', bg:'bg-[#F8FAFC]', border:'border-[#E2E8F0]'},
    {l:'OCCUPIED', v:residents.filter(r=>r.status==='approved').length || 487, bar:'w-[92%]', c:'bg-[#0F766E]', bg:'bg-[#F0FDFA]', border:'border-[#CCFBF1]'},
    {l:'VACANT', v:530-(residents.filter(r=>r.status==='approved').length||487), bar:'w-[22%]', c:'bg-[#64748B]', bg:'bg-[#F8FAFC]', border:'border-[#E2E8F0]'},
    {l:'RESIDENTS', v:'1,842', bar:'w-[62%]', c:'bg-[#1E293B]', bg:'bg-[#F1F5F9]', border:'border-[#E2E8F0]'},
    {l:'VISITORS TODAY', v:visitors.length||127, bar:'w-[48%]', c:'bg-[#D97706]', bg:'bg-[#FFFBEB]', border:'border-[#FDE68A]'},
    {l:'PENDING MAINT', v:'₹4.2L', bar:'w-[55%]', c:'bg-[#EF4444]', bg:'bg-[#FEF2F2]', border:'border-[#FECACA]'},
    {l:'COLLECTION MAY', v:'₹18.7L', bar:'w-[78%]', c:'bg-[#059669]', bg:'bg-[#ECFDF5]', border:'border-[#A7F3D0]'},
    {l:'COMPLAINTS', v:12, bar:'w-[42%]', c:'bg-[#F59E0B]', bg:'bg-[#FFFBEB]', border:'border-[#FDE68A]'},
    {l:'BOOKINGS', v:8, bar:'w-[35%]', c:'bg-[#8B5CF6]', bg:'bg-[#F5F3FF]', border:'border-[#DDD6FE]'},
    {l:'PARKING FREE', v:64, bar:'w-[52%]', c:'bg-[#06B6D4]', bg:'bg-[#ECFEFF]', border:'border-[#A5F3FC]'},
    {l:'GUARDS', v:'11/12', bar:'w-[90%]', c:'bg-[#0D9488]', bg:'bg-[#F0FDFA]', border:'border-[#99F6E0]'},
    {l:'COLLECTION %', v:'82%', bar:'w-[82%]', c:'bg-[#10B981]', bg:'bg-[#ECFDF5]', border:'border-[#6EE7B7]'},
  ]

  const tabColors: any = {
    Overview: 'bg-[#0B1120] text-white border-[#0B1120]',
    Residents: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
    Visitors: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    Parking: 'bg-[#CFFAFE] text-[#0E7490] border-[#A5F3FC]',
    Maintenance: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    Accounts: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
    Complaints: 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]',
    Amenities: 'bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]',
    Notices: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
    Documents: 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]',
    Guards: 'bg-[#CCFBF1] text-[#115E59] border-[#99F6E0]',
    Events: 'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]',
    Reports: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
    Settings: 'bg-[#F3F4F6] text-[#1F2937] border-[#E5E7EB]',
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <div className="max-w- mx-auto px-4 py-4 md:px-6">

        <div className="flex items-center justify-between">
          <h1 className="text- md:text- font-bold text-[#1A2332]" style={{fontFamily:'serif'}}>Admin Dashboard • SOCIETY ADMIN</h1>
          <div className="flex gap-2">
            <button className="h- px-5 rounded-full bg-[#0B1120] text-white text- font-semibold">Add Resident</button>
            <button className="h- px-5 rounded-full bg-white border text- hidden md:block">Generate Bills</button>
            <button className="h- px-5 rounded-full bg-white border text- hidden md:block">Post Notice</button>
          </div>
        </div>

        {/* CARDS - ROUND + LIGHT TEAM COLOR */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {cards.map((c,i)=>(
            <div key={i} className={`${c.bg} rounded- border ${c.border} shadow-sm p- h- flex flex-col justify-between hover:shadow-md transition-all`}>
              <div className="text- tracking-[0.08em] text-[#64748B] font-bold">{c.l}</div>
              <div className="text- font-extrabold text-[#0F172A] leading-none">{c.v}</div>
              <div className="mt-2 h- w-full bg-white/70 rounded-full overflow-hidden border border-black/5">
                <div className={`h-full rounded-full ${c.c} ${c.bar}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* GRAPHS - ROUND + LIGHT */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="bg-[#F8FAFC] rounded- border border-[#E2E8F0] p-5 shadow-sm">
            <div className="text- font-bold text-[#0F172A]">Monthly Collection (₹L)</div>
            <div className="mt-6 flex items-end justify-between gap-2 h- px-2">
              {[72,84,66,92,84,110].map((h,i)=>(
                <div key={i} className="flex-1 bg-[#0B1120] rounded-t- rounded-b- shadow-sm" style={{height:h+'px'}}></div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text- text-[#94A3B8] px-1"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
          </div>

          <div className="bg-[#FFFBEB] rounded- border border-[#FDE68A] p-5 shadow-sm">
            <div className="text- font-bold text-[#0F172A]">Expense Breakdown</div>
            <div className="mt-4 flex items-center gap-6">
              <svg width="92" height="92" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="34" fill="none" stroke="#fff" strokeWidth="12"/>
                <circle cx="48" cy="48" r="34" fill="none" stroke="#0B1120" strokeWidth="12" strokeDasharray="74 214" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                <circle cx="48" cy="48" r="34" fill="none" stroke="#0F766E" strokeWidth="12" strokeDasharray="42 214" strokeDashoffset="-74" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                <circle cx="48" cy="48" r="34" fill="none" stroke="#D97706" strokeWidth="12" strokeDasharray="53 214" strokeDashoffset="-116" transform="rotate(-90 48 48)" strokeLinecap="round"/>
                <circle cx="48" cy="48" r="34" fill="none" stroke="#94A3B8" strokeWidth="12" strokeDasharray="42 214" strokeDashoffset="-169" transform="rotate(-90 48 48)" strokeLinecap="round"/>
              </svg>
              <div className="text- space-y-2">
                <div className="flex gap-2 items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#0B1120]"></span>Security 35%</div>
                <div className="flex gap-2 items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]"></span>Cleaning 20%</div>
                <div className="flex gap-2 items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>Electricity 25%</div>
                <div className="flex gap-2 items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span>Maintenance 20%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#F0FDFA] rounded- border border-[#CCFBF1] p-5 shadow-sm">
            <div className="text- font-bold text-[#0F172A]">Visitor Trend</div>
            <div className="mt-3 h-">
              <svg viewBox="0 0 200 80" className="w-full h-full">
                <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0F766E" stopOpacity="0.25"/><stop offset="100%" stopColor="#0F766E" stopOpacity="0"/></linearGradient></defs>
                <path d="M0,50 C20,55 20,35 40,40 C60,45 60,15 90,25 C110,35 115,60 130,55 C145,50 155,5 175,8 L200,12 L200,80 L0,80 Z" fill="url(#g2)"/>
                <path d="M0,50 C20,55 20,35 40,40 C60,45 60,15 90,25 C110,35 115,60 130,55 C145,50 155,5 175,8 L200,12" fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* TABS - LIGHT COLORS */}
        <div className="mt-5 flex gap-2.5 overflow-x-auto pb-2">
          {['Overview','Residents','Visitors','Parking','Maintenance','Accounts','Complaints','Amenities','Notices','Documents','Guards','Events','Reports','Settings'].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`h- px- rounded-full text- font-semibold whitespace-nowrap border shadow-sm transition-all
              ${tab===t? tabColors[t]+' shadow-md scale-[1.02]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* CONTENTS */}
        {tab==='Overview' && (
          <div className="mt-3 bg-white rounded- border border-[#E2E8F0] p-6 grid md:grid-cols-2 gap-8 shadow-sm">
            <div>
              <div className="text- font-bold">Complaints by Category</div>
              <div className="mt-5 space-y-4">
                {[
                  {k:'Electrical',v:'68%',bg:'bg-[#DBEAFE]',c:'bg-[#1E40AF]'},
                  {k:'Plumbing',v:'48%',bg:'bg-[#CCFBF1]',c:'bg-[#0F766E]'},
                  {k:'Parking',v:'78%',bg:'bg-[#FEF3C7]',c:'bg-[#D97706]'},
                  {k:'Cleaning',v:'58%',bg:'bg-[#F1F5F9]',c:'bg-[#64748B]'},
                  {k:'Security',v:'52%',bg:'bg-[#D1FAE5]',c:'bg-[#059669]'},
                ].map(x=>(
                  <div key={x.k} className="flex items-center gap-3">
                    <span className="w- text- text-[#475569]">{x.k}</span>
                    <div className={`flex-1 h- ${x.bg} rounded-full overflow-hidden`}><div className={`h-full rounded-full ${x.c}`} style={{width:x.v}}></div></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text- font-bold">Quick Actions</div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={()=>setTab('Residents')} className="h- rounded- bg-[#0B1120] text-white text- font-semibold">Add Resident</button>
                <button className="h- rounded- bg-[#F0FDFA] border border-[#CCFBF1] text- font-semibold text-[#115E59]">Generate Bills</button>
                <button className="h- rounded- bg-[#FFFBEB] border border-[#FDE68A] text- font-semibold text-[#92400E]">Post Notice</button>
                <button className="h- rounded- bg-[#F1F5F9] border border-[#E2E8F0] text- font-semibold">View Reports</button>
              </div>
            </div>
          </div>
        )}

        {tab==='Residents' && (
          <div className="mt-3 bg-white rounded- border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-4 bg-[#F8FAFC] flex gap-3">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Flat / Name / Mobile" className="h- flex-1 rounded-full bg-white border border-[#E2E8F0] px-5 text- outline-none"/>
              <span className="h- px-5 rounded-full bg-[#0B1120] text-white text- flex items-center font-bold">Total {fRes.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-"><thead className="bg-[#0B1120] text-white"><tr><th className="p-4 text-left rounded-tl-">Flat</th><th className="p-4 text-left">Name</th><th className="p-4 text-left">Mobile</th><th className="p-4 text-left">Status</th></tr></thead>
              <tbody>{fRes.map(r=><tr key={r.id} className="border-t"><td className="p-4 font-bold">{r.flat_no}</td><td className="p-4">{r.name}</td><td className="p-4">{r.mobile}</td><td className="p-4"><span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] text- font-bold">{r.status}</span></td></tr>)}</tbody></table>
            </div>
          </div>
        )}

        {tab==='Visitors' && (
          <div className="mt-3 bg-white rounded- border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-4 bg-[#FFFBEB] flex gap-3 border-b border-[#FDE68A]">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Visitor / Flat" className="h- flex-1 rounded-full bg-white border border-[#FDE68A] px-5 text- outline-none"/>
              <span className="h- px-5 rounded-full bg-[#059669] text-white text- font-bold flex items-center">Inside: {visitors.filter(v=>v.status==='inside').length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-"><thead className="bg-[#0B1120] text-white"><tr><th className="p-4 text-left">Visitor</th><th className="p-4 text-left">Flat</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Action</th></tr></thead>
              <tbody>{fVis.map(v=><tr key={v.id} className="border-t"><td className="p-4 font-bold">{v.visitor_name}</td><td className="p-4">{v.flat_no}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text- font-bold ${v.status==='inside'?'bg-[#D1FAE5] text-[#065F46]':'bg-gray-100'}`}>{v.status}</span></td><td className="p-4">{v.status==='inside'?<button onClick={()=>markExit(v.id)} className="px-4 py-1.5 bg-[#0B1120] text-white rounded-full text- font-bold">Exit</button>:<span className="text- text-gray-400">Exited</span>}</td></tr>)}</tbody></table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
