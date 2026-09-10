"use client"
import {useEffect,useState} from "react"
import {supabase} from "@/lib/supabase"
export default function AdminGuards(){
  const [list,setList]=useState<any[]>([])
  const load=async()=>{ const {data}=await supabase.from('guards').select('*').eq('status','pending'); setList(data||[]) }
  useEffect(()=>{load()},[])
  const approve=async(g:any)=>{ await supabase.from('guards').update({status:'active'}).eq('guard_id',g.guard_id); load() }
  return <div className="p-6 max-w-3xl mx-auto">{list.map(g=>(
    <div key={g.guard_id} className="bg-white border rounded-xl p-4 mb-3 flex justify-between">
      <div className="flex gap-3"><img src={g.photo_url} className="w-12 h-12 rounded-full"/><div><b>{g.full_name}</b> - Gate {g.gate_no}<div className="text-xs">{g.mobile} | {g.guard_id}</div></div></div>
      <button onClick={()=>approve(g)} className="bg-green-600 text-white px-4 rounded-full h-9">Approve</button>
    </div>
  ))}</div>
}
