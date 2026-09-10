"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminGuards(){
  const [list, setList] = useState<any[]>([])
  const [filterGate, setFilterGate] = useState<string>("all")
  const [searchType, setSearchType] = useState<"name"|"mobile"|"id">("name")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<any>(null)

  const load = async()=>{
    let q = supabase.from('guards').select('*').order('created_at',{ascending:false})
    if(filterGate!== "all") q = q.eq('gate_no', parseInt(filterGate))
    if(statusFilter!== "all") q = q.eq('status', statusFilter)
    const {data} = await q
    setList(data||[])
  }
  useEffect(()=>{load()},[filterGate, statusFilter])

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
      {/* FIXED TABS - BIG + COLOUR */}
      <div className="max-w-7xl mx-auto sticky top-0 z-30 bg-[#f6f7fb] py-3">
        <div className="bg-white border- border-black rounded- p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setFilterGate(t.id)}
                className={`px-7 h- rounded-full font-extrabold text- border- transition-all ${t.color} ${filterGate===t.id?'scale-105 ring-2 ring-black ring-offset-2':''}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* SEARCH - ALAG ALAG TAB */}
          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <div className="flex bg-[#f1f5f9] p-1 rounded-full border">
              {[
                {id:"name", label:"Name"},
                {id:"mobile", label:"Mobile"},
                {id:"id", label:"Guard ID"},
              ].map(s=>(
                <button key={s.id} onClick={()=>{setSearchType(s.id as any); setSearch("")}}
                  className={`px-5 h-9 rounded-full text-sm font-bold ${searchType===s.id?'bg-black text-white':'text-black'}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={searchType==="name"?"Search by Name":searchType==="mobile"?"Search by Mobile":"Search by Guard ID"}
              className="flex-1 min-w- h- rounded-full bg-[#f8fafc] border px-6 outline-none" />
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h- rounded-full bg-white border-2 border-black px-5 font-bold">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white border- border-black rounded- overflow-hidden mt-2">
        <div className="max-h- overflow-auto">
          <table className="w-full text-">
            <thead className="sticky top-0 bg-black text-white text- uppercase tracking-wide">
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
              {filtered.map(g=>(
                <tr key={g.guard_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex gap-3 items-center">
                    <img src={g.photo_url} className="w-11 h-11 rounded-full border-2 border-black object-cover"/>
                    <span className="font-bold">{g.full_name}</span>
                  </td>
                  <td className="p-3 font-medium">{g.mobile}</td>
                  <td className="p-3 font-mono text-xs">{g.guard_id}</td>
                  <td className="p-3 text-center"><span className={`px-4 py-1 rounded-full font-bold border
                    ${g.gate_no==1?'bg-[#facc15]':g.gate_no==2?'bg-black text-white':g.gate_no==3?'bg-blue-600 text-white':'bg-green-600 text-white'}`}>G-{g.gate_no}</span></td>
                  <td className="p-3 text-center text-xs">{new Date(g.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-center"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">--</span></td>
                  <td className="p-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${g.status==='active'?'bg-green-600 text-white':g.status==='pending'?'bg-yellow-400 text-black':'bg-red-500 text-white'}`}>{g.status}</span></td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button onClick={()=>setSelected(g)} className="h-9 px-4 rounded-full border-2 border-black font-bold bg-white">View</button>
                    {g.status!=='active' && <button onClick={()=>approve(g)} className="h-9 px-4 rounded-full bg-black text-white font-bold">Approve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div className="p-12 text-center text-gray-400 font-bold">No Guard Found</div>}
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded- border-2 border-black max-w-xl w-full p-5">
            <h2 className="font-extrabold text-lg">{selected.full_name} - {selected.guard_id}</h2>
            <div className="flex gap-3 mt-3"><img src={selected.photo_url} className="w-24 h-24 rounded-xl border-2 border-black"/><img src={selected.id_proof_url} className="w-24 h-24 rounded-xl border"/></div>
            <input value={selected.full_name} onChange={e=>setSelected({...selected, full_name:e.target.value})} className="mt-4 w-full h-12 rounded-full border px-5"/>
            <div className="flex gap-2 mt-4">
              <button onClick={async()=>{await supabase.from('guards').update({full_name:selected.full_name, mobile:selected.mobile, gate_no:selected.gate_no}).eq('guard_id',selected.guard_id); setSelected(null); load()}} className="flex-1 h-12 rounded-full bg-black text-white font-bold">Save</button>
              <button onClick={()=>setSelected(null)} className="flex-1 h-12 rounded-full border-2 border-black font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
