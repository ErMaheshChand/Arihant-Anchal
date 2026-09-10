"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminGuards(){
  const [list, setList] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [filterGate, setFilterGate] = useState("all")
  const [searchType, setSearchType] = useState<"name"|"mobile"|"id">("name")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selected, setSelected] = useState<any>(null)

  const today = new Date().toISOString().split('T')[0]

  const load = async()=>{
    let q = supabase.from('guards').select('*').order('created_at',{ascending:false})
    if(filterGate!="all") q = q.eq('gate_no', parseInt(filterGate))
    if(statusFilter!="all") q = q.eq('status', statusFilter)
    const {data} = await q
    setList(data||[])
    const {data: att} = await supabase.from('guard_attendance').select('*').gte('login_time', new Date().toISOString().split('T')[0])
    setAttendance(att||[])
  }
  useEffect(()=>{load()},[filterGate, statusFilter])

  const isPresent = (id:string)=> attendance.find(a=>a.guard_id===id)

  const approve = async(g:any)=>{
    await supabase.from('guards').update({status:'active'}).eq('guard_id', g.guard_id)
    load(); setSelected(null)
  }
  const reject = async(g:any)=>{
    if(!confirm("Reject karna hai?")) return
    await supabase.from('guards').update({status:'rejected'}).eq('guard_id', g.guard_id)
    load(); setSelected(null)
  }
  const pendingAgain = async(g:any)=>{
    await supabase.from('guards').update({status:'pending'}).eq('guard_id', g.guard_id)
    load(); setSelected(null)
  }

  const filtered = list.filter(g =>{
    if(!search) return true
    if(searchType==="name") return g.full_name?.toLowerCase().includes(search.toLowerCase())
    if(searchType==="mobile") return g.mobile?.includes(search)
    return g.guard_id?.toLowerCase().includes(search.toLowerCase())
  })

  const count = (s:string)=> list.filter(g=>g.status===s).length

  const gateTabs = [
    {id:"all", label:"ALL GATES", color:"bg-black text-white"},
    {id:"1", label:"GATE-1", color:"bg-[#facc15] text-black"},
    {id:"2", label:"GATE-2", color:"bg-black text-white"},
    {id:"3", label:"GATE-3", color:"bg-blue-600 text-white"},
    {id:"4", label:"GATE-4", color:"bg-green-600 text-white"},
  ]

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-3">
      {/* TOP BIG TABS */}
      <div className="max-w-7xl mx-auto sticky top-0 z-30 bg-[#f6f7fb] py-3">
        <div className="bg-white border- border-black rounded- p-5 shadow-[6px_6px_0px_0px_black]">

          {/* GATE TABS - BADE BADE */}
          <h2 className="font-black text-lg mb-3">FILTER BY GATE</h2>
          <div className="flex flex-wrap gap-4">
            {gateTabs.map(t=>(
              <button key={t.id} onClick={()=>setFilterGate(t.id)}
                className={`min-w- h- px-8 rounded-full font-black text- border- border-black shadow-[3px_3px_0px_0px_black] ${t.color} ${filterGate===t.id?'scale-110 ring-4 ring-black':''}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* STATUS TABS - BADE BADE */}
          <h2 className="font-black text-lg mt-6 mb-3">APPROVAL STATUS</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={()=>setStatusFilter("pending")} className={`min-w- h- px-8 rounded-full font-black text- border- border-black shadow-[3px_3px_0px_0px_black] ${statusFilter==="pending"?'bg-yellow-400 text-black scale-110 ring-4 ring-black':'bg-white text-black'}`}>PENDING ({list.filter(g=>g.status==='pending').length})</button>
            <button onClick={()=>setStatusFilter("active")} className={`min-w- h- px-8 rounded-full font-black text- border- border-black shadow-[3px_3px_0px_0px_black] ${statusFilter==="active"?'bg-green-600 text-white scale-110 ring-4 ring-black':'bg-white text-black'}`}>APPROVED ({list.filter(g=>g.status==='active').length})</button>
            <button onClick={()=>setStatusFilter("rejected")} className={`min-w- h- px-8 rounded-full font-black text- border- border-black shadow-[3px_3px_0px_0px_black] ${statusFilter==="rejected"?'bg-red-600 text-white scale-110 ring-4 ring-black':'bg-white text-black'}`}>REJECTED</button>
            <button onClick={()=>setStatusFilter("all")} className={`min-w- h- px-8 rounded-full font-black text- border- border-black ${statusFilter==="all"?'bg-black text-white':'bg-white'}`}>ALL</button>
          </div>

          {/* SEARCH ALAG ALAG */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex bg-black p-1.5 rounded-full gap-1">
              <button onClick={()=>setSearchType("name")} className={`px-6 h-10 rounded-full font-black text-sm ${searchType==="name"?'bg-[#facc15] text-black':'text-white'}`}>NAME</button>
              <button onClick={()=>setSearchType("mobile")} className={`px-6 h-10 rounded-full font-black text-sm ${searchType==="mobile"?'bg-[#facc15] text-black':'text-white'}`}>MOBILE</button>
              <button onClick={()=>setSearchType("id")} className={`px-6 h-10 rounded-full font-black text-sm ${searchType==="id"?'bg-[#facc15] text-black':'text-white'}`}>GUARD ID</button>
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search by ${searchType}`} className="flex-1 min-w- h- rounded-full border- border-black px-6 font-bold bg-[#f8fafc]"/>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white border- border-black rounded- overflow-hidden mt-4 shadow-[6px_6px_0px_0px_black]">
        <div className="max-h- overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-black text-white text-">
              <tr><th className="p-4 text-left">Guard</th><th className="p-4">Mobile / ID</th><th className="p-4">Gate</th><th className="p-4">Date</th><th className="p-4">Present</th><th className="p-4">Status</th><th className="p-4">ACTION - Approve/Reject</th></tr>
            </thead>
            <tbody>
              {filtered.map(g=>{
                const att = isPresent(g.guard_id)
                return (
                <tr key={g.guard_id} className="border-b-2 border-gray-100">
                  <td className="p-3 flex gap-2 items-center"><img src={g.photo_url} className="w-12 h-12 rounded-full border-2 border-black"/><b>{g.full_name}</b></td>
                  <td className="p-3 text-center"><div className="font-bold">{g.mobile}</div><div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-full">{g.guard_id}</div></td>
                  <td className="p-3 text-center"><span className="px-4 py-1 rounded-full font-black border-2 border-black bg-[#facc15]">G-{g.gate_no}</span></td>
                  <td className="p-3 text-center text-xs">{new Date(g.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-center">{att?<span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-black">Present {new Date(att.login_time).toLocaleTimeString()}</span>:<span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">Absent</span>}</td>
                  <td className="p-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black border-2 border-black ${g.status==='active'?'bg-green-600 text-white':g.status==='pending'?'bg-yellow-400 text-black':'bg-red-600 text-white'}`}>{g.status.toUpperCase()}</span></td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      {g.status==='pending' && <><button onClick={()=>approve(g)} className="bg-green-600 text-white px-5 h-10 rounded-full font-black border-2 border-black">APPROVE</button><button onClick={()=>reject(g)} className="bg-red-600 text-white px-5 h-10 rounded-full font-black border-2 border-black">REJECT</button></>}
                      {g.status!=='pending' && <><button onClick={()=>pendingAgain(g)} className="bg-yellow-400 text-black px-4 h-10 rounded-full font-black border-2 border-black">PENDING</button><button onClick={()=>setSelected({...g, att})} className="bg-white border-2 border-black px-4 h-10 rounded-full font-black">VIEW</button></>}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {filtered.length===0 && <div className="p-10 text-center font-black text-xl">Koi Guard nahi mila {statusFilter} me</div>}
        </div>
      </div>
    </div>
  )
}
