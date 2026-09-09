'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function GuardMobile() {
  const [flat, setFlat] = useState('B-302')
  const [resident, setResident] = useState<any>(null)
  const [visitor, setVisitor] = useState('')
  const [mobile, setMobile] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [purpose, setPurpose] = useState('Meeting')
  const [photo, setPhoto] = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [tab, setTab] = useState<'entry'|'approved'|'exit'>('entry')
  const [loading, setLoading] = useState(false)
  const [lastPass, setLastPass] = useState<any>(null)

  // REAL DATA
  const [allVisitors, setAllVisitors] = useState<any[]>([])
  const [todayCount, setTodayCount] = useState(0)

  const loadVisitors = async () => {
    const { data } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(100)
    if(data){
      setAllVisitors(data)
      const todayStr = new Date().toISOString().split('T')[0]
      setTodayCount(data.filter((v:any)=> v.created_at?.startsWith(todayStr)).length)
    }
  }

  useEffect(()=>{
    loadVisitors()
    // REALTIME UPDATE
    const ch = supabase.channel('visitors-realtime').on('postgres_changes',{event:'*', schema:'public', table:'visitors'}, ()=> loadVisitors()).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  }, [])

  useEffect(()=>{
    const fetchResident = async () => {
      if(flat.length < 3) return
      const { data } = await supabase.from('residents').select('*').eq('flat_no', flat.toUpperCase()).maybeSingle()
      setResident(data || null)
    }
    const t = setTimeout(fetchResident, 300)
    return ()=>clearTimeout(t)
  }, [flat])

  const handlePhoto = (e:any) => {
    const f = e.target.files?.[0]
    if(f){ setPhoto(f); setPhotoPreview(URL.createObjectURL(f)) }
  }

  const handleApproveAndSend = async () => {
    if(!visitor ||!mobile ||!flat) return alert('Name, Mobile, Flat bharo')
    setLoading(true)
    let photoUrl = ''
    if(photo){
      const fileName = `visitor_${Date.now()}_${photo.name}`
      await supabase.storage.from('visitor-photos').upload(fileName, photo)
      const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }
    const { data, error } = await supabase.from('visitors').insert({
      visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose, photo_url: photoUrl, guard_id:'Gate 1', status:'inside'
    }).select().single()
    setLoading(false)
    if(!error && data){
      setLastPass(data); setShowQR(true)
      setVisitor(''); setMobile(''); setVehicle(''); setPhoto(null); setPhotoPreview('')
      loadVisitors()
    } else alert(error?.message)
  }

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id)
    loadVisitors()
  }

  // FLAT SE FILTER
  const filteredByFlat = allVisitors.filter(v=> v.flat_no?.toLowerCase() === flat.toUpperCase().toLowerCase() || v.resident_flat?.toLowerCase() === flat.toUpperCase().toLowerCase())
  const insideList = filteredByFlat.filter(v=> v.status==='inside' || v.status==='pending')
  const exitList = filteredByFlat.filter(v=> v.status==='exited')

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-amber-300">A</div>
          <div><div className="font-bold text-sm leading-none">Arihant Anchal</div><div className="text- text-slate-500">Gate 1 • On Duty</div></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text- font-bold border border-emerald-200">● LIVE</span>
          <Link href="/" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">⌂</Link>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        {/* REAL COUNT */}
        <div className="flex gap-2 overflow-x-auto">
          <div className="shrink-0 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm">{todayCount} Visitors Today • REAL</div>
          <div className="shrink-0 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">{allVisitors.filter(v=>v.status==='inside').length} Inside Now</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={()=>{setTab('entry'); setShowQR(false)}} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='entry'?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-100'}`}><span className="text-xl">👤</span><span className="text-xs font-bold">VISITOR ENTRY</span></button>
          <button className="h-24 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1.5"><span className="text-xl">📦</span><span className="text-xs font-bold">DELIVERY</span></button>
          <button onClick={()=>setTab('approved')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='approved'?'bg-amber-300 border-amber-300 text-black':'bg-amber-50 border-amber-100'}`}><span className="text-xl">✅</span><span className="text-xs font-bold">PRE-APPROVED • {insideList.length}</span></button>
          <button className="h-24 rounded-3xl bg-cyan-50 border border-cyan-100 flex flex-col items-center justify-center gap-1.5 shadow-sm"><span className="text-xl">🚗</span><span className="text-xs font-bold">VEHICLE</span></button>
          <button onClick={()=>setTab('exit')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='exit'?'bg-slate-800 text-white border-slate-800':'bg-slate-100 border-slate-200'}`}><span className="text-xl">↩</span><span className="text-xs font-bold">EXIT • {exitList.length}</span></button>
          <button className="h-24 rounded-3xl bg-red-50 border border-red-100 text-red-700 flex flex-col items-center justify-center gap-1.5"><span className="text-xl">🚨</span><span className="text-xs font-bold">EMERGENCY</span></button>
        </div>

        {/* FLAT SEARCH */}
        <div className="mt-5 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="text-sm font-bold flex justify-between"><span>Flat Search • Real Visitors</span><span className="text-xs font-normal text-slate-500">{flat.toUpperCase()} → {filteredByFlat.length} found</span></div>
          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 pl-10 pr-3 text-sm font-bold outline-none focus:border-amber-300 focus:bg-amber-50/30" placeholder="Flat No ex: B-302" />
          </div>

          <div className={`mt-3 p-3 rounded-2xl border flex gap-2.5 ${resident?'bg-emerald-50 border-emerald-100':'bg-amber-50 border-amber-100'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${resident?'bg-emerald-600 text-white':'bg-slate-900 text-white'}`}>{resident?.name?.[0]||'?'}</div>
            <div className="text-xs"><div className="font-bold">{flat.toUpperCase()} • {resident? `${resident.name} • Owner` : 'Resident not found'}</div><div className="text-slate-600 mt-0.5">{resident?.mobile||'Add resident in Supabase'}</div></div>
          </div>

          <div className="mt-4 flex p-1 rounded-full bg-slate-100">
            <button onClick={()=>setTab('entry')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='entry'?'bg-white shadow':'text-slate-500'}`}>New Entry</button>
            <button onClick={()=>setTab('approved')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='approved'?'bg-white shadow':'text-slate-500'}`}>Inside ({insideList.length})</button>
            <button onClick={()=>setTab('exit')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='exit'?'bg-white shadow':'text-slate-500'}`}>Exit ({exitList.length})</button>
          </div>

          {tab==='entry' && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle No" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={purpose} onChange={e=>setPurpose(e.target.value)} className="h-12 rounded-2xl bg-slate-50 border border-slate-100 px-3 text-sm"><option>Meeting</option><option>Delivery</option><option>Guest</option><option>Service</option></select>
                <label className="h-12 rounded-2xl border border-dashed border-slate-200 px-3 text-sm flex items-center justify-center cursor-pointer bg-slate-50 overflow-hidden">{photoPreview? <img src={photoPreview} className="h-10 w-10 rounded-xl object-cover" /> : '📷 Photo'}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} /></label>
              </div>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm shadow active:scale-[0.98]">{loading? 'Sending...' : 'Approve & Send →'}</button>
            </div>
          )}

          {tab==='approved' && (
            <div className="mt-4 space-y-2 max-h- overflow-auto">
              {insideList.length===0 && <div className="text-center text-xs text-slate-400 py-6">No visitors for {flat.toUpperCase()}. Entry karo to yaha dikhega.</div>}
              {insideList.map(v=>(
                <div key={v.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex justify-between items-center">
                  <div className="flex gap-2.5 items-center"><img src={v.photo_url||'https://ui-avatars.com/api/?name='+v.visitor_name} className="w-10 h-10 rounded-2xl object-cover"/><div><div className="font-bold text-sm">{v.visitor_name||v.name} → {v.flat_no}</div><div className="text- text-slate-600">{v.purpose} • {v.mobile} • {new Date(v.created_at||v.entry_time).toLocaleTimeString('en-IN')}</div></div></div>
                  <button onClick={()=>markExit(v.id)} className="px-3 py-1.5 rounded-full bg-slate-900 text-white text- font-bold">Exit</button>
                </div>
              ))}
            </div>
          )}

          {tab==='exit' && (
            <div className="mt-4 space-y-2 max-h- overflow-auto">
              {exitList.length===0 && <div className="text-center text-xs text-slate-400 py-6">No exit history for {flat.toUpperCase()}</div>}
              {exitList.map(v=>(
                <div key={v.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div><div className="font-bold text-sm">{v.visitor_name||v.name} → {v.flat_no}</div><div className="text- text-slate-500">Exited {v.exit_time? new Date(v.exit_time).toLocaleTimeString('en-IN'):''}</div></div>
                  <span className="text- px-3 py-1 rounded-full bg-slate-200">Exited</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showQR && lastPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={()=>setShowQR(false)}>
          <div className="w-full max-w-md bg-white rounded-t- p-6 pb-10 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="text-center"><div className="text-xs font-bold tracking-widest">VISITOR PASS - INSIDE</div><div className="text-xs text-slate-500 mt-1">{lastPass.flat_no} • {lastPass.visitor_name}</div>
              <div className="mt-5 mx-auto w-64 h-64 rounded-3xl bg-slate-900 p-3"><div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center p-3">{lastPass.photo_url && <img src={lastPass.photo_url} className="w-20 h-20 rounded-2xl object-cover mb-2" />}<div className="text-sm font-bold">{lastPass.visitor_name}</div><div className="text-xs text-slate-500">{lastPass.mobile}</div><div className="mt-2 text-xs bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full font-bold">✅ Inside • Real-time updated</div></div></div>
              <button onClick={()=>setShowQR(false)} className="mt-6 w-full h-12 rounded-full bg-slate-100 text-sm font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
