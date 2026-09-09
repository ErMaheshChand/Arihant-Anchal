"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard(){
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState({ total:530, occupied:0, vacant:530, residents:0, visitorsToday:0, complaints:0, guards:'0/0' })
  const [residents, setResidents] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data: allRes } = await supabase.from('residents').select('*').order('created_at',{ascending:false})
    const { data: vAll } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(100)
    const { data: cData } = await supabase.from('complaints').select('*')
    const { data: gData } = await supabase.from('guards').select('*')

    const approved = allRes?.filter(r=>r.status==='approved').length || 0
    const activeGuards = gData?.filter(g=>g.status==='active').length || 0
    const todayStr = new Date().toISOString().split('T')[0]
    const vToday = vAll?.filter(v=> v.created_at?.startsWith(todayStr) ).length || 0

    setStats({
      total: 530,
      occupied: approved,
      vacant: 530 - approved,
      residents: approved > 0? approved * 3 + 2 : 3,
      visitorsToday: vToday || vAll?.length || 0,
      complaints: cData?.length || 0,
      guards: `${activeGuards}/${gData?.length || 12}`
    })
    setResidents(allRes||[])
    setVisitors(vAll||[])
  }
  useEffect(()=>{ load() },[])

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time: new Date().toISOString()}).eq('id', id)
    load()
  }

  const filteredResidents = residents.filter(r=>
    r.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.mobile?.includes(search)
  )
  const filteredVisitors = visitors.filter(v=>
    v.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.visitor_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <div className="max-w- mx-auto p-3 md:p-5">
        {/* HEADER - SOCIETY LOOK */}
        <div className="bg-white rounded- p-4 md:p-5 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text- md:text- font-bold tracking-tight font-serif text-[#0B1120]">Admin Dashboard • SOCIETY ADMIN</h1>
            <p className="text- text-[#64748B] mt-1">Arihant Anchal • 530 Flats • Real-time overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setTab('Residents')} className="h- px-5 bg-[#0B1120] text-white rounded-full text- font-semibold shadow">Add Resident</button>
            <button className="h- px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text- font-semibold">Generate Bills</button>
            <button className="h- px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text- font-semibold hidden md:block">Post Notice</button>
          </div>
        </div>

        {/* TOP 12 CARDS - ROUND CORNER + COLOR BARS */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label:'TOTAL FLATS', value: stats.total, sub:'All blocks', color:'bg-[#0B1120]', bar:90 },
            { label:'OCCUPIED', value: stats.occupied, sub:'Approved', color:'bg-[#0F766E]', bar: (stats.occupied/530)*100 },
            { label:'VACANT', value: stats.vacant, sub:'Available', color:'bg-[#94A3B8]', bar: (stats.vacant/530)*100 },
            { label:'RESIDENTS', value: stats.residents, sub:'Members', color:'bg-[#0B1120]', bar:60 },
            { label:'VISITORS TODAY', value: stats.visitorsToday, sub:`Inside ${visitors.filter(v=>v.status==='inside').length}`, color:'bg-[#D97706]', bar:75 },
            { label:'PENDING MAINT', value:'₹4.2L', sub:'Due', color:'bg-[#EF4444]', bar:30 },
            { label:'COLLECTION MAY', value:'₹18.7L', sub:'+12%', color:'bg-[#10B981]', bar:82 },
            { label:'COMPLAINTS', value: stats.complaints || 12, sub:'Open', color:'bg-[#F59E0B]', bar:40 },
            { label:'BOOKINGS', value: 8, sub:'Amenities', color:'bg-[#8B5CF6]', bar:35 },
            { label:'PARKING FREE', value: 64, sub:'Slots', color:'bg-[#06B6D4]', bar:55 },
            { label:'GUARDS', value: stats.guards, sub:'Active', color:'bg-[#0F766E]', bar:90 },
            { label:'COLLECTION %', value:'82%', sub:'Target 100%', color:'bg-[#10B981]', bar:82 },
          ].map((c,i)=>(
            <div key={i} className="bg-white rounded- p- border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
              <div className="text- tracking-[0.12em] text-[#94A3B8] font-semibold">{c.label}</div>
              <div className="text- font-bold text-[#0B1120] mt-1 leading-none">{c.value}</div>
              <div className="text- text-[#64748B] mt-1">{c.sub}</div>
              <div className="mt-3 h- bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.color}`} style={{width:`${Math.min(100, Math.max(10,c.bar))}%`}}></div>
              </div>
            </div>
          ))}
        </div>

        {/* 3 GRAPHS WITH ROUNDED BARS */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded- p-4 border border-[#E2E8F0] shadow-sm">
            <div className="flex justify-between items-center">
              <div className="text- font-bold text-[#0B1120]">Monthly Collection (₹L)</div>
              <span className="text- px-2 py-1 bg-[#ECFDF5] text-[#10B981] rounded-full font-bold">+12%</span>
            </div>
            <div className="mt-5 flex items-end gap- h-">
              {[14,18,12,20,19,24].map((h,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#0B1120] rounded-t- rounded-b-" style={{height:(h*3.5)+'px'}}></div>
                  <span className="text- text-[#94A3B8]">{['Jan','Feb','Mar','Apr','May','Jun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded- p-4 border border-[#E2E8F0] shadow-sm">
            <div className="text- font-bold text-[#0B1120]">Expense Breakdown</div>
            <div className="mt-4 flex gap-5 items-center">
              <div className="relative w- h- rounded-full"
                style={{background:`conic-gradient(#0B1120 0% 35%, #0F766E 35% 55%, #D97706 55% 80%, #94A3B8 80% 100%)`}}>
                <div className="absolute inset- bg-white rounded-full"></div>
              </div>
              <div className="text- space-y- text-[#334155]">
                <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-[#0B1120]"></span>Security 35%</div>
                <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>Cleaning 20%</div>
                <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-[#D97706]"></span>Electricity 25%</div>
                <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span>Maintenance 20%</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border border-[#E2E8F0] shadow-sm">
            <div className="text- font-bold text-[#0B1120]">Visitor Trend</div>
            <div className="mt-3">
              <svg viewBox="0 0 100 40" className="w-full h-">
                <path d="M0,30 Q10,25 20,28 T40,15 T60,20 T80,5 T100,15" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M0,30 Q10,25 20,28 T40,15 T60,20 T80,5 T100,15 L100,40 L0,40 Z" fill="#D97706" opacity="0.12"/>
              </svg>
              <div className="flex justify-between text- text-[#94A3B8] mt-1"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div>
            </div>
          </div>
        </div>

        {/* TABS - ORIGINAL JAISE ROUND */}
        <div className="mt-5 bg-white rounded- p- border border-[#E2E8F0] shadow-sm flex gap- overflow-x-auto scrollbar-none">
          {['Overview','Residents','Visitors','Parking','Maintenance','Accounts','Complaints','Amenities','Notices','Documents','Guards','Events','Reports','Settings'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`h- px-4 rounded-full text- font-semibold whitespace-nowrap transition-all ${tab===t?'bg-[#0B1120] text-white shadow':'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'}`}>{t}</button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {tab==='Overview' && (
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded- p-4 border border-[#E2E8F0] shadow-sm">
              <div className="font-bold text- text-[#0B1120]">Complaints by Category</div>
              <div className="mt-4 space-y-3">
                {[{k:'Electrical',v:70, c:'bg-[#0B1120]'},{k:'Plumbing',v:50, c:'bg-[#0F766E]'},{k:'Parking',v:80, c:'bg-[#D97706]'},{k:'Cleaning',v:60, c:'bg-[#94A3B8]'},{k:'Security',v:55, c:'bg-[#10B981]'}].map(c=>(
                  <div key={c.k} className="flex items-center gap-3 text-">
                    <span className="w- text-[#475569] font-medium">{c.k}</span>
                    <div className="flex-1 h- bg-[#F1F5F9] rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.c}`} style={{width:c.v+'%'}}></div></div>
                    <span className="w- text-right text-[#94A3B8]">{c.v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded- p-4 border border-[#E2E8F0] shadow-sm">
              <div className="font-bold text- text-[#0B1120]">Quick Actions</div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {['Add Resident','Generate Bills','Post Notice','View Reports'].map(a=>(
                  <button key={a} onClick={()=>{ if(a==='Add Resident') setTab('Residents')}} className="h- bg-[#F8FAFC] hover:bg-[#EEF2F7] border border-[#E2E8F0] rounded- text- font-semibold text-[#0B1120]">{a}</button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded- text- text-[#92400E]">💡 Tip: Residents tab me filter se flat-wise check karo, Visitors tab me Exit mark karo.</div>
            </div>
          </div>
        )}

        {tab==='Residents' && (
          <div className="mt-3 bg-white rounded- border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row gap-3 justify-between md:items-center bg-[#F8FAFC] border-b">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search Flat / Name / Mobile" className="h- w-full md:w- rounded-full bg-white border border-[#E2E8F0] px-4 text- outline-none"/>
              <div className="text- font-semibold text-[#475569] bg-white border px-3 py-2 rounded-full">Total: {filteredResidents.length} / 530</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-">
                <thead className="bg-[#0B1120] text-white"><tr><th className="p-3.5 text-left font-semibold">Flat</th><th className="p-3.5 text-left">Name</th><th className="p-3.5 text-left">Mobile</th><th className="p-3.5 text-left">Role</th><th className="p-3.5 text-left">Status</th><th className="p-3.5 text-left">Date</th></tr></thead>
                <tbody>{filteredResidents.map(r=><tr key={r.id} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]"><td className="p-3.5 font-bold">{r.flat_no}</td><td className="p-3.5">{r.name}</td><td className="p-3.5">{r.mobile}</td><td className="p-3.5"><span className={`px-2.5 py-1 rounded-full text- font-bold ${r.role==='owner'?'bg-[#ECFDF5] text-[#065F46]':'bg-[#EFF6FF] text-[#1E40AF]'}`}>{r.role}</span></td><td className="p-3.5"><span className={`px-2.5 py-1 rounded-full text- font-bold ${r.status==='approved'?'bg-[#ECFDF5] text-[#065F46]': r.status==='pending'?'bg-[#FFFBEB] text-[#92400E]':'bg-[#FEF2F2] text-[#991B1B]'}`}>{r.status}</span></td><td className="p-3.5 text- text-[#64748B]">{r.created_at?new Date(r.created_at).toLocaleDateString('en-IN'):''}</td></tr>)}{filteredResidents.length===0 && <tr><td colSpan={6} className="p-8 text-center text-[#94A3B8]">No records</td></tr>}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='Visitors' && (
          <div className="mt-3 bg-white rounded- border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row gap-3 justify-between md:items-center bg-[#F8FAFC] border-b">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search Visitor / Flat" className="h- w-full md:w- rounded-full bg-white border border-[#E2E8F0] px-4 text- outline-none"/>
              <div className="flex gap-2 text- font-bold"><span className="px-3 py-2 bg-white border rounded-full">Today: {stats.visitorsToday}</span><span className="px-3 py-2 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-full">Inside: {visitors.filter(v=>v.status==='inside').length}</span></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-">
                <thead className="bg-[#0B1120] text-white"><tr><th className="p-3.5 text-left">Visitor</th><th className="p-3.5 text-left">Flat</th><th className="p-3.5 text-left">Purpose</th><th className="p-3.5 text-left">Entry</th><th className="p-3.5 text-left">Status</th><th className="p-3.5 text-left">Action</th></tr></thead>
                <tbody>{filteredVisitors.map(v=><tr key={v.id} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]"><td className="p-3.5 font-bold">{v.visitor_name} <span className="text- text-[#94A3B8] font-normal">{v.mobile}</span></td><td className="p-3.5 font-semibold">{v.flat_no}</td><td className="p-3.5">{v.purpose}</td><td className="p-3.5 text- text-[#64748B]">{v.entry_time?new Date(v.entry_time).toLocaleTimeString('en-IN'):''}</td><td className="p-3.5"><span className={`px-2.5 py-1 rounded-full text- font-bold ${v.status==='inside'?'bg-[#ECFDF5] text-[#065F46]':'bg-[#F1F5F9] text-[#64748B]'}`}>{v.status}</span></td><td className="p-3.5">{v.status==='inside'?<button onClick={()=>markExit(v.id)} className="px-3.5 py-1.5 bg-[#0B1120] text-white rounded-full text- font-bold hover:bg-black">Mark Exit</button>:<span className="text- text-[#94A3B8]">{v.exit_time?new Date(v.exit_time).toLocaleTimeString('en-IN'):''}</span>}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab!=='Overview' && tab!=='Residents' && tab!=='Visitors' && (
          <div className="mt-3 bg-white rounded- p-12 border border-[#E2E8F0] shadow-sm text-center">
            <div className="text- font-bold text-[#0B1120]">{tab}</div>
            <div className="text- text-[#94A3B8] mt-1">Module coming soon — Dummy data ready, logic will be added in STEP 4</div>
          </div>
        )}
      </div>
    </div>
  )
}
