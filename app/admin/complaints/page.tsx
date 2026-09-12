'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminComplaints(){
  const [list, setList] = useState<any[]>([])
  const [fFlat, setFFlat] = useState('')
  const [fCat, setFCat] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [sel, setSel] = useState<any>(null)

  const load = async ()=>{
    const { data, error } = await supabase.from('complaints').select('*').order('created_at',{ascending:false}).limit(500)
    if(error){ alert('Load Error: '+error.message); return }
    if(data) setList(data)
  }
  useEffect(()=>{ load(); const ch=supabase.channel('admin-comp').on('postgres_changes',{event:'*',schema:'public',table:'complaints'},()=>load()).subscribe(); return ()=>{ supabase.removeChannel(ch)} },[])

  const updateStatus = async (id:string, status:string)=>{
    const upd:any = { status }
    if(status==='resolved') upd.resolved_at = new Date().toISOString()
    const { error } = await supabase.from('complaints').update(upd).eq('id', id)
    if(error){ alert('Update Error: '+error.message); return }
    alert(`✅ Status: ${status.toUpperCase()}`)
    setSel(null); load()
  }

  const filtered = list.filter(c=>{
    if(fFlat &&!c.flat_no.toLowerCase().includes(fFlat.toLowerCase())) return false
    if(fCat && c.category!==fCat) return false
    if(fStatus && c.status!==fStatus) return false
    return true
  })

  const counts = {
    pending: list.filter(c=>c.status==='pending').length,
    progress: list.filter(c=>c.status==='in_progress').length,
    resolved: list.filter(c=>c.status==='resolved').length,
    closed: list.filter(c=>c.status==='closed').length,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-4 text-black">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* HEADER */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="font-black text-lg">📝 Complaint Dashboard</h1>
            <div className="text-xs opacity-60 mt-1 flex gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{counts.pending} Pending</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">{counts.progress} In Progress</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">{counts.resolved} Resolved</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold">{counts.closed} Closed + Feedback</span>
            </div>
          </div>
          <button onClick={load} className="px-4 h-10 rounded-full bg-slate-900 text-white text-xs font-bold">🔄 Refresh</button>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <input value={fFlat} onChange={e=>setFFlat(e.target.value)} placeholder="🔍 Flat No B-302" className="h-11 rounded-xl border bg-slate-50 px-3 text-sm font-bold" />
            <select value={fCat} onChange={e=>setFCat(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-3 text-xs font-bold">
              <option value="">All Category</option>
              <option>Light</option><option>Pani</option><option>Safai</option><option>Parking</option><option>Lift</option><option>Security</option><option>Gardening</option><option>Noise</option><option>Other</option>
            </select>
            <select value={fStatus} onChange={e=>setFStatus(e.target.value)} className="h-11 rounded-xl border bg-slate-50 px-3 text-xs font-bold">
              <option value="">All Status</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
            </select>
            <button onClick={()=>{setFFlat(''); setFCat(''); setFStatus('')}} className="h-11 rounded-xl bg-black text-white text-xs font-bold">Clear</button>
          </div>
          <div className="mt-2 text-xs font-bold">Showing {filtered.length} / {list.length}</div>
        </div>

        {/* LIST + DETAIL */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="font-bold text-sm mb-2">All Complaints</div>
            <div className="space-y-2 max-h- overflow-y-auto">
              {filtered.map(c=>(
                <div key={c.id} onClick={()=>setSel(c)} className={`p-4 rounded-2xl border cursor-pointer ${sel?.id===c.id?'border-black border-2 bg-slate-50':'bg-white'}`}>
                  <div className="flex justify-between">
                    <div className="font-bold text-sm">{c.category} • {c.flat_no}</div>
                    <span className={`text- px-2 py-1 rounded-full font-black border ${c.status==='pending'?'bg-amber-100 text-amber-700 border-amber-200':c.status==='in_progress'?'bg-blue-100 text-blue-700 border-blue-200':c.status==='resolved'?'bg-emerald-100 text-emerald-700 border-emerald-200':'bg-slate-100'}`}>{c.status.toUpperCase()}</span>
                  </div>
                  <div className="text-sm mt-1 font-bold">{c.title}</div>
                  <div className="text-xs opacity-60">{new Date(c.created_at).toLocaleString()} • {c.description?.slice(0,60)}</div>
                </div>
              ))}
              {filtered.length===0 && <div className="p-8 text-center text-xs opacity-40">Koi complaint nahi</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-black shadow-lg p-4 sticky top-2">
            {!sel? <div className="p-10 text-center text-xs opacity-40">Left se complaint select karo bhai</div> : (
              <>
                <div className="flex justify-between">
                  <div><div className="font-black text-lg">{sel.category} - {sel.flat_no}</div><div className="text-xs opacity-60">{new Date(sel.created_at).toLocaleString()}</div></div>
                  <button onClick={()=>setSel(null)} className="w-8 h-8 rounded-full bg-slate-100 font-bold">✕</button>
                </div>
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border">
                  <div className="font-bold text-sm">{sel.title}</div>
                  <div className="text-sm mt-1">{sel.description}</div>
                </div>
                {sel.photo_url && <img src={sel.photo_url} className="mt-3 w-full h-64 object-cover rounded-2xl border" />}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-amber-50 border"><div className="text- opacity-60 font-bold">FLAT</div><div className="font-black">{sel.flat_no}</div></div>
                  <div className="p-3 rounded-2xl bg-blue-50 border"><div className="text- opacity-60 font-bold">STATUS</div><div className="font-black">{sel.status}</div></div>
                </div>
                {sel.feedback && (
                  <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs font-black text-emerald-700">🙏 Resident Feedback: ⭐ {sel.rating}/5</div>
                    <div className="text-sm mt-1">"{sel.feedback}"</div>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={()=>updateStatus(sel.id,'in_progress')} className="h-12 rounded-full bg-blue-600 text-white text-xs font-black">🔧 In Progress</button>
                  <button onClick={()=>updateStatus(sel.id,'resolved')} className="h-12 rounded-full bg-emerald-600 text-white text-xs font-black">✅ Resolved</button>
                  <button onClick={()=>updateStatus(sel.id,'closed')} className="h-12 rounded-full bg-slate-900 text-white text-xs font-black">🔒 Close</button>
                </div>
                <div className="mt-2 text- text-center opacity-50">Pending → In Progress → Resolved → Resident Thank You → Closed</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
