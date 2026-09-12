"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_ID = "ARI9700"
const ADMIN_PASS = "ARI#9700"

export default function AdminDashboard(){
  const [isAuth, setIsAuth] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState('Overview')
  const [residents, setResidents] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])
  const [search, setSearch] = useState('')

  // Check already login
  useEffect(()=>{
    if(localStorage.getItem('admin_auth') === 'true') setIsAuth(true)
  },[])

  const handleAdminLogin = () => {
    if(adminId === ADMIN_ID && adminPass === ADMIN_PASS){
      localStorage.setItem('admin_auth', 'true')
      setIsAuth(true)
      setLoginError('')
    } else {
      setLoginError('❌ ID ya Password galat hai')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setIsAuth(false)
    setAdminId('')
    setAdminPass('')
  }

  const load = async () => {
    const { data: allRes } = await supabase.from('residents').select('*').order('created_at',{ascending:false})
    const { data: vAll } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(100)
    if(allRes) setResidents(allRes)
    if(vAll) setVisitors(vAll)
  }
  useEffect(()=>{ if(isAuth) load() },[isAuth])

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time: new Date().toISOString()}).eq('id', id)
    load()
  }

  const fRes = residents.filter(r=> `${r.flat_no} ${r.name} ${r.mobile}`.toLowerCase().includes(search.toLowerCase()))
  const fVis = visitors.filter(v=> `${v.visitor_name} ${v.flat_no}`.toLowerCase().includes(search.toLowerCase()))

  // LOGIN SCREEN
  if(!isAuth){
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded- p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black">AΛ</div>
            <h1 className="mt-4 text-2xl font-black text-slate-900">Admin Login</h1>
            <p className="text- text-slate-500 mt-1">Arihant Anchal Society & Club House</p>
          </div>
          <div className="mt-8 space-y-4">
            <input value={adminId} onChange={e=>setAdminId(e.target.value)} placeholder="Admin ID (ARI9700)" className="w-full h-12 rounded-full border border-slate-200 px-5 text-sm font-bold outline-none focus:border-slate-900"/>
            <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password (ARI#9700)" className="w-full h-12 rounded-full border border-slate-200 px-5 text-sm font-bold outline-none focus:border-slate-900"/>
            {loginError && <div className="text- text-red-600 font-bold text-center">{loginError}</div>}
            <button onClick={handleAdminLogin} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">Login to Admin Dashboard →</button>
            <div className="text-center text- text-slate-400 mt-3">
              Designed by Er. Mahesh Chand<br/>B-2-304, Arihant Anchal | 8769909700
            </div>
          </div>
        </div>
      </div>
    )
  }

  // DASHBOARD AFTER LOGIN
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center bg-white rounded-3xl p-5 border shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-serif">Admin Dashboard • SOCIETY ADMIN</h1>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="h-9 px-5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold">Logout</button>
            <button className="h-9 px-5 rounded-full bg-slate-900 text-white text-xs font-bold">Add Resident</button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-slate-500 tracking-widest">TOTAL FLATS</span><span className="text-2xl font-extrabold">530</span><div className="h-1.5 bg-slate-200 rounded-full"><div className="h-full w-2/5 bg-slate-900 rounded-full"></div></div></div>
          <div className="bg-teal-50 rounded-3xl border border-teal-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-teal-700 tracking-widest">OCCUPIED</span><span className="text-2xl font-extrabold text-teal-900">{residents.filter(r=>r.status==='approved').length || 487}</span><div className="h-1.5 bg-teal-100 rounded-full"><div className="h-full w-11/12 bg-teal-700 rounded-full"></div></div></div>
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-slate-500 tracking-widest">VACANT</span><span className="text-2xl font-extrabold">43</span><div className="h-1.5 bg-slate-200 rounded-full"><div className="h-full w-1/4 bg-slate-400 rounded-full"></div></div></div>
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-gray-500 tracking-widest">RESIDENTS</span><span className="text-2xl font-extrabold">1,842</span><div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full w-3/5 bg-slate-900 rounded-full"></div></div></div>
          <div className="bg-amber-50 rounded-3xl border border-amber-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-amber-700 tracking-widest">VISITORS TODAY</span><span className="text-2xl font-extrabold text-amber-900">{visitors.length || 127}</span><div className="h-1.5 bg-amber-100 rounded-full"><div className="h-full w-1/2 bg-amber-500 rounded-full"></div></div></div>
          <div className="bg-red-50 rounded-3xl border border-red-100 p-4 h-24 flex flex-col justify-between shadow-sm"><span className="text- font-bold text-red-600 tracking-widest">PENDING MAINT</span><span className="text-2xl font-extrabold text-red-600">₹4.2L</span><div className="h-1.5 bg-red-100 rounded-full"><div className="h-full w-2/3 bg-red-500 rounded-full"></div></div></div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {['Overview','Residents','Visitors','Parking','Maintenance','Accounts','Complaints','Amenities','Notices','Documents','Guards','Events','Reports','Settings'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`h-9 px-4 rounded-full text-xs font-bold whitespace-nowrap border shadow-sm ${tab===t? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border-slate-200'}`}>{t}</button>
          ))}
        </div>

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
        {tab==='Overview' && <div className="mt-3 bg-white rounded-3xl border p-6 shadow-sm"><div className="text-sm font-bold">Welcome Admin {ADMIN_ID} — Sab kuch yaha se manage karo</div><div className="text-xs text-slate-500 mt-2">Residents approve karo, Visitors dekho, Maintenance check karo.</div></div>}

        <footer className="mt-8 text-center text- text-slate-400 py-4 border-t">
          Designed by Er. Mahesh Chand | B-2-304 Arihant Anchal, Jodhpur | er.maheshchand.dd@gmail.com | 8769909700
        </footer>
      </div>
    </div>
  )
}
