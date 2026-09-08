'use client'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase'
export default function Admin(){
 const [reqs,setReqs]=useState<any[]>([])
 useEffect(()=>{ supabase.from('admin_requests').select('*').eq('status','pending').order('created_at',{ascending:false}).then(({data})=>{if(data)setReqs(data)}); const ch=supabase.channel('admin').on('postgres_changes',{event:'*',schema:'public',table:'admin_requests'},()=>{supabase.from('admin_requests').select('*').eq('status','pending').then(({data})=>{if(data)setReqs(data)})}).subscribe(); return()=>{supabase.removeChannel(ch)} },[])
 const ok=async(r:any)=>{await supabase.from('residents').update({status:'approved'}).eq('flat_no',r.flat_no).eq('mobile',r.mobile); await supabase.from('admin_requests').update({status:'approved'}).eq('id',r.id); setReqs(s=>s.filter(x=>x.id!==r.id))}
 const no=async(r:any)=>{await supabase.from('residents').update({status:'rejected'}).eq('flat_no',r.flat_no).eq('mobile',r.mobile); await supabase.from('admin_requests').update({status:'rejected'}).eq('id',r.id); setReqs(s=>s.filter(x=>x.id!==r.id))}
 return(<div className="p-4 max-w- mx-auto"><h1 className="font-bold">Admin Requests 🔔 {reqs.length}</h1><div className="mt-4 space-y-3">{reqs.map(r=><div key={r.id} className="p-4 bg-white rounded-xl border"><div className="font-bold">{r.flat_no} • {r.name} ({r.role})</div><div className="text- opacity-60">{r.mobile}</div><div className="grid grid-cols-2 gap-2 mt-3"><button onClick={()=>no(r)} className="h-11 rounded-full bg-gray-100 font-bold">Reject</button><button onClick={()=>ok(r)} className="h-11 rounded-full bg-green-600 text-white font-bold">Approve</button></div></div>)}</div></div>)
}
