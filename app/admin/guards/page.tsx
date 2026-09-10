"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminGuards(){
  const [list, setList] = useState<any[]>([])
  const [filterGate, setFilterGate] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selected, setSelected] = useState<any>(null)

  const load = async()=>{
    let q = supabase.from('guards').select('*').order('created_at',{ascending:false})
    if(filterGate!== "all") q = q.eq('gate_no', parseInt(filterGate))
    if(statusFilter!== "all") q = q.eq('status', statusFilter)
    const {data} = await q
    setList(data||[])
  }
  useEffect(()=>{load()},[filterGate, statusFilter])

  const filtered = list.filter(g =>
    g.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.mobile?.includes(search) ||
    g.guard_id?.toLowerCase().includes(search.toLowerCase())
  )

  const approve = async(g:any)=>{
    await supabase.from('guards').update({status:'active', approved_at: new Date().toISOString()}).eq('guard_id', g.guard_id)
    setSelected(null); load()
  }
  const reject = async(g:any)=>{
    await supabase.from('guards').update({status:'rejected'}).eq('guard_id', g.guard_id)
    setSelected(null); load()
  }
  const saveUpdate = async()=>{
    if(!selected) return
    await supabase.from('guards').update({
      full_name: selected.full_name,
      mobile: selected.mobile,
      gate_no: selected.gate_no,
      address: selected.address
    }).eq('guard_id', selected.guard_id)
    setSelected(null); load()
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4">
      {/* FIXED TABS */}
      <div className="max-w-6xl mx-auto sticky top-0 z-20 bg-[#f6f7fb] pt-2 pb-3">
        <div className="bg-white border-2 border-black rounded-2xl p-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {["all","1","2"].map(g=>(
              <button key={g} onClick={()=>setFilterGate(g)}
                className={`px-5 h-10 rounded-full font-bold border ${filterGate===g?'bg-black text-white border-black':'bg-white text-black border-black'}`}>
                {g==="all"?"All Gates":`Gate-${g}`}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1 md:flex-none">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name / mobile / ID" className="input flex-1" />
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input w-">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* SCROLL TABLE */}
      <div className="max-w-6xl mx-auto bg-white border-2 border-black rounded-2xl overflow-hidden">
        <div className="max-h- overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-black text-white">
              <tr>
                <th className="p-3 text-left">Guard</th>
                <th className="p-3 text-left">Mobile / ID</th>
                <th className="p-3">Gate</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g=>(
                <tr key={g.guard_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex gap-2 items-center">
                    <img src={g.photo_url} className="w-10 h-10 rounded-full object-cover border"/>
                    <div><div className="font-bold">{g.full_name}</div><div className="text-xs text-gray-500">{new Date(g.created_at).toLocaleDateString()}</div></div>
                  </td>
                  <td className="p-3"><div>{g.mobile}</div><div className="text-xs font-mono">{g.guard_id}</div></td>
                  <td className="p-3 text-center"><span className="bg-[#facc15] px-3 py-1 rounded-full font-bold">G-{g.gate_no}</span></td>
                  <td className="p-3 text-center"><span className={`px-3 py-1 rounded-full text-xs ${g.status==='active'?'bg-green-100 text-green-700':g.status==='pending'?'bg-yellow-100':'bg-red-100'}`}>{g.status}</span></td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button onClick={()=>setSelected(g)} className="bg-white border border-black px-3 h-8 rounded-full text-xs font-bold">View</button>
                    {g.status==='pending' && <button onClick={()=>approve(g)} className="bg-green-600 text-white px-3 h-8 rounded-full text-xs">Approve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div className="p-10 text-center text-gray-500">No guard found</div>}
        </div>
      </div>

      {/* DETAIL + EDIT MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-black max-w-2xl w-full p-5 max-h- overflow-auto">
            <h2 className="font-bold text-lg mb-3">Guard Full Detail - {selected.guard_id}</h2>
            <div className="grid grid-cols-2 gap-3">
              <img src={selected.photo_url} className="w-32 h-32 rounded-xl object-cover border-2 border-black"/>
              <img src={selected.id_proof_url} className="w-32 h-32 rounded-xl object-cover border"/>
              <input value={selected.full_name} onChange={e=>setSelected({...selected, full_name:e.target.value})} className="input col-span-2" placeholder="Full Name"/>
              <input value={selected.mobile} onChange={e=>setSelected({...selected, mobile:e.target.value})} className="input" placeholder="Mobile"/>
              <select value={selected.gate_no} onChange={e=>setSelected({...selected, gate_no:parseInt(e.target.value)})} className="input">
                <option value={1}>Gate-1</option><option value={2}>Gate-2</option>
              </select>
              <textarea value={selected.address||''} onChange={e=>setSelected({...selected, address:e.target.value})} className="input col-span-2 h-20 rounded-2xl pt-3" placeholder="Address"/>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-3 mt-3 text-xs grid grid-cols-2 gap-2">
              <div><b>Entry:</b> {selected.created_at}</div>
              <div><b>Status:</b> {selected.status}</div>
              <div><b>Approved:</b> {selected.approved_at||'Not yet'}</div>
              <div><b>Last Duty:</b> -</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveUpdate} className="btn-black flex-1">Save Update</button>
              <button onClick={()=>approve(selected)} className="btn-yellow flex-1">Approve & Active</button>
              <button onClick={()=>setSelected(null)} className="bg-white border border-black flex-1 h-12 rounded-full font-bold">Close</button>
            </div>
            <button onClick={()=>reject(selected)} className="w-full mt-2 text-red-600 text-xs underline">Reject Guard</button>
          </div>
        </div>
      )}
    </div>
  )
}
