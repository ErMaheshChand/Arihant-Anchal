"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GuardPage(){
  const [visitors, setVisitors] = useState<any[]>([])
  const [form, setForm] = useState({ visitor_name:'', mobile:'', flat_no:'', purpose:'Guest' })

  const load = async () => {
    const { data } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(30)
    if(data) setVisitors(data)
  }
  useEffect(()=>{ load() },[])

  const add = async () => {
    if(!form.visitor_name || !form.flat_no) return alert('Name + Flat No bhare')
    await supabase.from('visitors').insert({...form, status:'inside', entered_by:'Guard'})
    setForm({ visitor_name:'', mobile:'', flat_no:'', purpose:'Guest' })
    load()
  }
  const exit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id)
    load()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">🛡️ Guard - Visitor Entry</h1>
      <div className="mt-4 bg-white rounded-3xl border p-5 space-y-3 shadow-sm">
        <input className="w-full h-11 rounded-2xl border bg-slate-50 px-4 text-sm" placeholder="Visitor Name" value={form.visitor_name} onChange={e=>setForm({...form, visitor_name:e.target.value})}/>
        <input className="w-full h-11 rounded-2xl border bg-slate-50 px-4 text-sm" placeholder="Mobile" value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})}/>
        <input className="w-full h-11 rounded-2xl border bg-slate-50 px-4 text-sm" placeholder="Flat No ex: B-302" value={form.flat_no} onChange={e=>setForm({...form, flat_no:e.target.value})}/>
        <select className="w-full h-11 rounded-2xl border bg-slate-50 px-4 text-sm" value={form.purpose} onChange={e=>setForm({...form, purpose:e.target.value})}>
          <option>Guest</option><option>Delivery</option><option>Maid</option><option>Driver</option><option>Other</option>
        </select>
        <button onClick={add} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold">+ Entry Mark Karo</button>
      </div>

      <div className="mt-6">
        <div className="font-bold text-sm">Inside: {visitors.filter(v=>v.status==='inside').length} | Today: {visitors.length}</div>
        <div className="mt-3 space-y-2">
          {visitors.map(v=>(
            <div key={v.id} className="bg-white rounded-2xl border p-3 flex justify-between items-center shadow-sm">
              <div><div className="font-bold text-sm">{v.visitor_name} → {v.flat_no}</div><div className="text-xs text-slate-500">{v.purpose} • {new Date(v.entry_time).toLocaleTimeString('en-IN')}</div></div>
              {v.status==='inside'?<button onClick={()=>exit(v.id)} className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold">Exit</button>:<span className="text-xs bg-gray-100 px-3 py-1 rounded-full">Exited</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
