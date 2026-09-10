"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminGuards(){
  const [list, setList] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [filterGate, setFilterGate] = useState<string>("all")
  const [searchType, setSearchType] = useState<"name"|"mobile"|"id">("name")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<any>(null)

  const today = new Date().toISOString().split('T')[0]

  const load = async()=>{
    let q = supabase.from('guards').select('*').order('created_at',{ascending:false})
    if(filterGate!== "all") q = q.eq('gate_no', parseInt(filterGate))
    if(statusFilter!== "all") q = q.eq('status', statusFilter)
    const {data} = await q
    setList(data||[])

    // TODAY ATTENDANCE FETCH
    const {data: att} = await supabase.from('guard_attendance').select('*').eq('date', today)
    setAttendance(att||[])
  }
  useEffect(()=>{load()},[filterGate, statusFilter])

  const isPresent = (guard_id:string)=> attendance.find(a=>a.guard_id===guard_id)

  const filtered = list.filter(g =>{
    if(!search) return true
    if(searchType==="name") return g.full_name?.toLowerCase().includes(search.toLowerCase())
    if(searchType==="mobile") return g.mobile?.includes(search)
    if(searchType==="id") return g.guard_id?.toLowerCase().includes(search.toLowerCase())
    return true
  })

  const approve = async(g:any)=>{
    await supabase.from('guards').update({status:'active', approved_at: new Date().toISOString()}).eq('guard_id', g.guard_id)
    setSelected(null); load()
  }

  const tabs = [
    {id:"all", label:"All Gates", color:"bg-black text-white border-black"},
    {id:"1", label:"Gate-1", color:"bg-[#facc15] text-black border-black"},
    {id:"2", label:"Gate-2", color:"bg-black text-white border-black"},
    {id:"3", label:"Gate-3", color:"bg-blue-600 text-white border-blue-600"},
    {id:"4", label:"Gate-4", color:"bg-green-600 text-white border-green-600"},
  ]

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-3">
      {/* FIXED TABS */}
      <div className="max-w-7xl mx-auto sticky top-0 z-30 bg-[#f6f7fb] py-3">
        <div className="bg-white border- border-black rounded- p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setFilterGate(t.id)}
                className={`px-7 h- rounded-full font-extrabold text- border- ${t.color} ${filterGate===t.id?'scale-105 ring-2 ring-black ring-offset-2':''}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <div className="flex bg-[#f1f5f9] p-1 rounded-full border">
              {[{id:"name",label:"Name"},{id:"mobile",label:"Mobile"},{id:"id",label:"Guard ID"}].map(s=>(
                <button key={s.id} onClick={()=>{setSearchType(s.id as any); setSearch("")}}
                  className={`px-5 h-9 rounded-full text-sm font-bold ${searchType===s.id?'bg-black text-white':'text-black'}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={searchType==="name"?"Search Name":searchType==="mobile"?"Search Mobile":"Search Guard ID"}
              className="flex-1 min-w- h- rounded-full bg-[#f8fafc] border px-6 outline-none" />
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h- rounded-full bg-white border-2 border-black px-5 font-bold">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE WITH PRESENT + DATE */}
      <div className="max-w-7xl mx-auto bg-white border- border-black rounded- overflow-hidden mt-2">
        <div className="max-h- overflow-auto">
          <table className="w-full text-">
            <thead className="sticky top-0 bg-black text-white text- uppercase">
              <tr>
                <th className="p-4 text-left">Guard Name</th>
                <th className="p-4 text-left">Mobile</th>
                <th className="p-4 text-left">ID</th>
                <th className="p-4">Gate No</th>
                <th className="p-4">Date</th>
                <th className="p-4">Present</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g=>{
                const att = isPresent(g.guard_id)
                return (
                <tr key={g.guard_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex gap-3 items-center">
                    <img src={att?.photo_url || g.photo_url} className="w-11 h-11 rounded-full border-2 border-black object-cover"/>
                    <span className="font-bold">{g.full_name}</span>
                  </td>
                  <td className="p-3">{g.mobile}</td>
                  <td className="p-3 font-mono text-xs">{g.guard_id}</td>
                  <td className="p-3 text-center"><span className={`px-4 py-1 rounded-full font-bold border ${g.gate_no==1?'bg-[#facc15]':g.gate_no==2?'bg-black text-white':g.gate_no==3?'bg-blue-600 text-white':'bg-green-600 text-white'}`}>G-{g.gate_no}</span></td>
                  <td className="p-3 text-center text-xs font-bold">{att? new Date(att.login_time).toLocaleDateString() : new Date(g.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    {att? <span className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold">Present {new Date(att.login_time).toLocaleTimeString()}</span>
                    : <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-bold">Absent</span>}
                  </td>
                  <td className="p-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${g.status==='active'?'bg-green-600 text-white':'bg-yellow-400'}`}>{g.status}</span></td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button onClick={()=>setSelected({...g, att})} className="h-9 px-4 rounded-full border-2 border-black font-bold bg-white">View</button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded- border-2 border-black max-w-xl w-full p-5 max-h- overflow-auto">
            <h2 className="font-extrabold">{selected.full_name} - {selected.guard_id}</h2>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div><p className="text-xs font-bold">Register Photo</p><img src={selected.photo_url} className="w-full h-32 rounded-xl object-cover border-2 border-black"/></div>
              <div><p className="text-xs font-bold">Today Attendance</p>{selected.att? <img src={selected.att.photo_url} className="w-full h-32 rounded-xl object-cover border-2 border-green-600"/> : <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center text-xs">No Attendance Today</div>}</div>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-3 mt-3 text-xs">
              <div><b>Login Time:</b> {selected.att? new Date(selected.att.login_time).toLocaleString() : 'Absent'}</div>
              <div><b>Gate:</b> G-{selected.gate_no}</div>
              <div><b>Mobile:</b> {selected.mobile}</div>
            </div>
            <button onClick={()=>setSelected(null)} className="w-full mt-4 h-12 rounded-full bg-black text-white font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
