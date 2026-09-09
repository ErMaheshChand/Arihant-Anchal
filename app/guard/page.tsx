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
  const [tab, setTab] = useState<'entry'|'approved'|'exit'|'delivery'|'vehicle'|'emergency'>('entry')
  const [loading, setLoading] = useState(false)
  const [lastPass, setLastPass] = useState<any>(null)

  // REAL DATA
  const [allVisitors, setAllVisitors] = useState<any[]>([])
  const [todayCount, setTodayCount] = useState(0)

  // DELIVERY / VEHICLE / EMERGENCY states
  const [deliveryCompany, setDeliveryCompany] = useState('Amazon')
  const [vehicleType, setVehicleType] = useState('Car')
  const [emergencyType, setEmergencyType] = useState('Fire')
  const [emergencyNote, setEmergencyNote] = useState('')

  const loadVisitors = async () => {
    const { data } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(150)
    if(data){
      setAllVisitors(data)
      const todayStr = new Date().toISOString().split('T')[0]
      setTodayCount(data.filter((v:any)=> v.created_at?.startsWith(todayStr)).length)
    }
  }

  useEffect(()=>{
    loadVisitors()
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

  // COMMON INSERT
  const insertVisitor = async (payload:any) => {
    setLoading(true)
    let photoUrl = ''
    if(photo){
      const fileName = `visitor_${Date.now()}_${photo.name}`
      await supabase.storage.from('visitor-photos').upload(fileName, photo)
      const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }
    const { data, error } = await supabase.from('visitors').insert({...payload, photo_url: photoUrl}).select().single()
    setLoading(false)
    if(!error && data){
      setLastPass(data); setShowQR(true)
      setVisitor(''); setMobile(''); setVehicle(''); setPhoto(null); setPhotoPreview('')
      loadVisitors()
    } else alert(error?.message)
  }

  const handleApproveAndSend = () => insertVisitor({
    visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle,
    flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
    purpose, guard_id:'Gate 1', status:'inside'
  })

  const handleDelivery = () => {
    if(!flat) return alert('Flat No bharo')
    insertVisitor({
      visitor_name: `${deliveryCompany} Delivery`, name: `${deliveryCompany} Delivery`,
      mobile: mobile || 'Delivery', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Delivery - ${deliveryCompany}`, guard_id:'Gate 1', status:'inside'
    })
  }

  const handleVehicle = () => {
    if(!vehicle) return alert('Vehicle No bharo')
    insertVisitor({
      visitor_name: `${vehicleType} - ${vehicle}`, name: `${vehicleType} - ${vehicle}`,
      mobile: mobile || 'Vehicle Entry', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Vehicle Entry - ${vehicleType}`, guard_id:'Gate 1', status:'inside'
    })
  }

  const handleEmergency = async () => {
    if(!emergencyNote) return alert('Emergency detail likho')
    setLoading(true)
    await supabase.from('complaints').insert({
      flat_no: flat.toUpperCase(),
      title: `🚨 EMERGENCY - ${emergencyType}`,
      description: emergencyNote,
      category: 'Emergency',
      priority: 'high',
      status: 'open'
    })
    await supabase.from('visitors').insert({
      visitor_name: `🚨 ${emergencyType}`, name: `🚨 ${emergencyType}`,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `EMERGENCY - ${emergencyType}: ${emergencyNote}`,
      guard_id:'Gate 1', status:'inside'
    })
    setLoading(false)
    setEmergencyNote('')
    alert(`🚨 Emergency Logged! Admin ko alert gaya: ${emergencyType}`)
    setTab('entry')
    loadVisitors()
  }

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id)
    loadVisitors()
  }

  const filteredByFlat = allVisitors.filter(v=> v.flat_no?.toLowerCase() === flat.toUpperCase().toLowerCase() || v.resident_flat?.toLowerCase() === flat.toUpperCase().toLowerCase())
  const insideList = filteredByFlat.filter(v=> v.status==='inside' || v.status==='pending')
  const exitList = filteredByFlat.filter(v=> v.status==='exited')
  const deliveryList = allVisitors.filter(v=> v.purpose?.toLowerCase().includes('delivery')).slice(0,10)
  const vehicleList = allVisitors.filter(v=> v.purpose?.toLowerCase().includes('vehicle')).slice(0,10)

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
        <div className="flex gap-2 overflow-x-auto">
          <div className="shrink-0 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm">{todayCount} Visitors Today • REAL</div>
          <div className="shrink-0 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">{allVisitors.filter(v=>v.status==='inside').length} Inside</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={()=>setTab('entry')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='entry'?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-100'}`}><span className="text-xl">👤</span><span className="text-xs font-bold">VISITOR ENTRY</span></button>
          <button onClick={()=>setTab('delivery')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='delivery'?'bg-amber-400 border-amber-400 text-black':'bg-amber-50 border-amber-100'}`}><span className="text-xl">📦</span><span className="text-xs font-bold">DELIVERY • {deliveryList.length}</span></button>
          <button onClick={()=>setTab('approved')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='approved'?'bg-amber-300 border-amber-300':'bg-white border-slate-100'}`}><span className="text-xl">✅</span><span className="text-xs font-bold">INSIDE • {insideList.length}</span></button>
          <button onClick={()=>setTab('vehicle')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='vehicle'?'bg-cyan-500 text-white border-cyan-500':'bg-cyan-50 border-cyan-100'}`}><span className="text-xl">🚗</span><span className="text-xs font-bold">VEHICLE • {vehicleList.length}</span></button>
          <button onClick={()=>setTab('exit')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='exit'?'bg-slate-800 text-white border-slate-800':'bg-slate-100 border-slate-200'}`}><span className="text-xl">↩</span><span className="text-xs font-bold">EXIT • {exitList.length}</span></button>
          <button onClick={()=>setTab('emergency')} className={`h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-sm border ${tab==='emergency'?'bg-red-600 text-white border-red-600':'bg-red-50 border-red-100 text-red-700'}`}><span className="text-xl">🚨</span><span className="text-xs font-bold">EMERGENCY</span></button>
        </div>

        {/* COMMON FLAT SEARCH */}
        <div className="mt-5 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="text-sm font-bold flex justify-between"><span>{tab==='delivery'?'Delivery':tab==='vehicle'?'Vehicle':tab==='emergency'?'Emergency Alert': 'Flat Search'}</span><span className="text-xs font-normal text-slate-500">{flat.toUpperCase()} → {filteredByFlat.length} found</span></div>
          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 pl-10 pr-3 text-sm font-bold outline-none focus:border-amber-300" placeholder="Flat No ex: B-302" />
          </div>

          {/* ENTRY */}
          {tab==='entry' && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle No (optional)" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={purpose} onChange={e=>setPurpose(e.target.value)} className="h-12 rounded-2xl bg-slate-50 border border-slate-100 px-3 text-sm"><option>Meeting</option><option>Guest</option><option>Service</option></select>
                <label className="h-12 rounded-2xl border border-dashed border-slate-200 px-3 text-sm flex items-center justify-center cursor-pointer bg-slate-50 overflow-hidden">{photoPreview? <img src={photoPreview} className="h-10 w-10 rounded-xl object-cover" /> : '📷 Photo'}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} /></label>
              </div>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm shadow">{loading? 'Sending...' : 'Approve & Send →'}</button>
            </div>
          )}

          {/* DELIVERY */}
          {tab==='delivery' && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select value={deliveryCompany} onChange={e=>setDeliveryCompany(e.target.value)} className="h-12 rounded-2xl bg-amber-50 border border-amber-100 px-3 text-sm font-bold"><option>Amazon</option><option>Flipkart</option><option>Swiggy</option><option>Zomato</option><option>BlueDart</option><option>Other</option></select>
                <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Delivery Boy Mobile" className="h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm" />
              </div>
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle No (optional)" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm" />
              <button onClick={handleDelivery} disabled={loading} className="w-full h-12 rounded-full bg-amber-400 text-black font-bold text-sm shadow">{loading? 'Adding...' : `📦 ${deliveryCompany} Entry Mark Karo`}</button>
              <div className="mt-3 space-y-2 max-h- overflow-auto">
                {deliveryList.map(v=>(
                  <div key={v.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex justify-between items-center"><div><div className="font-bold text-sm">{v.visitor_name}</div><div className="text- text-slate-600">{v.flat_no} • {new Date(v.created_at).toLocaleTimeString('en-IN')}</div></div><button onClick={()=>markExit(v.id)} className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">Exit</button></div>
                ))}
              </div>
            </div>
          )}

          {/* VEHICLE */}
          {tab==='vehicle' && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)} className="h-12 rounded-2xl bg-cyan-50 border border-cyan-100 px-3 text-sm font-bold"><option>Car</option><option>Bike</option><option>Auto</option><option>Truck</option><option>Visitor Car</option></select>
                <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="RJ14 AB 1234 *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold" />
              </div>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Driver Mobile (optional)" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm" />
              <button onClick={handleVehicle} disabled={loading} className="w-full h-12 rounded-full bg-cyan-500 text-white font-bold text-sm shadow">{loading? 'Adding...' : `🚗 ${vehicleType} Entry Karo`}</button>
              <div className="mt-3 space-y-2 max-h- overflow-auto">
                {vehicleList.map(v=>(
                  <div key={v.id} className="p-3 rounded-2xl bg-cyan-50 border border-cyan-100 flex justify-between items-center"><div><div className="font-bold text-sm">{v.vehicle_no} • {v.flat_no}</div><div className="text- text-slate-600">{v.purpose} • {new Date(v.created_at).toLocaleTimeString('en-IN')}</div></div><button onClick={()=>markExit(v.id)} className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">Exit</button></div>
                ))}
              </div>
            </div>
          )}

          {/* EMERGENCY */}
          {tab==='emergency' && (
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-800 font-bold">⚠️ Ye alert Admin + All Residents ko jayega. Sirf sach me emergency par use karo.</div>
              <select value={emergencyType} onChange={e=>setEmergencyType(e.target.value)} className="w-full h-12 rounded-2xl bg-red-50 border border-red-100 px-3 text-sm font-bold"><option>Fire</option><option>Medical</option><option>Theft</option><option>Water Leak</option><option>Power Failure</option><option>Other Emergency</option></select>
              <textarea value={emergencyNote} onChange={e=>setEmergencyNote(e.target.value)} placeholder="Emergency detail likho ex: B-Block me smoke..." className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-sm outline-none" />
              <button onClick={handleEmergency} disabled={loading} className="w-full h-12 rounded-full bg-red-600 text-white font-bold text-sm shadow animate-pulse">{loading? 'Sending Alert...' : `🚨 ${emergencyType} Emergency Alert Bhejo`}</button>
              <div className="text-center text- text-slate-400">Complaints table me high priority ke roop me save hoga</div>
            </div>
          )}

          {/* APPROVED / EXIT */}
          {(tab==='approved' || tab==='exit') && (
            <div className="mt-4">
              <div className="flex p-1 rounded-full bg-slate-100">
                <button onClick={()=>setTab('approved')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='approved'?'bg-white shadow':'text-slate-500'}`}>Inside ({insideList.length})</button>
                <button onClick={()=>setTab('exit')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='exit'?'bg-white shadow':'text-slate-500'}`}>Exit ({exitList.length})</button>
              </div>
              <div className="mt-3 space-y-2 max-h- overflow-auto">
                {tab==='approved' && insideList.map(v=>(
                  <div key={v.id} className="p-3 rounded-2xl bg-white border border-slate-100 flex justify-between items-center shadow-sm"><div className="flex gap-2.5 items-center"><img src={v.photo_url||`https://ui-avatars.com/api/?name=${v.visitor_name}`} className="w-10 h-10 rounded-2xl object-cover"/><div><div className="font-bold text-sm">{v.visitor_name||v.name} → {v.flat_no}</div><div className="text- text-slate-600">{v.purpose} • {v.mobile}</div></div></div><button onClick={()=>markExit(v.id)} className="px-3 py-1.5 rounded-full bg-slate-900 text-white text- font-bold">Exit</button></div>
                ))}
                {tab==='exit' && exitList.map(v=>(
                  <div key={v.id} className="p-3 rounded-2xl bg-slate-50 border flex justify-between items-center"><div><div className="font-bold text-sm">{v.visitor_name||v.name} → {v.flat_no}</div><div className="text- text-slate-500">Exited {v.exit_time? new Date(v.exit_time).toLocaleTimeString('en-IN'):''}</div></div><span className="text- px-3 py-1 rounded-full bg-slate-200">Exited</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showQR && lastPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={()=>setShowQR(false)}>
          <div className="w-full max-w-md bg-white rounded-t- p-6 pb-10 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="text-center"><div className="text-xs font-bold tracking-widest">{lastPass.purpose?.includes('Delivery')?'DELIVERY PASS': lastPass.purpose?.includes('Vehicle')?'VEHICLE PASS':'VISITOR PASS'}</div>
              <div className="mt-5 mx-auto w-64 h-64 rounded-3xl bg-slate-900 p-3"><div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center p-3"><div className="text-sm font-bold">{lastPass.visitor_name}</div><div className="text-xs text-slate-500 mt-1">{lastPass.flat_no}</div><div className="mt-2 text-xs bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full font-bold">✅ Inside</div></div></div>
              <button onClick={()=>setShowQR(false)} className="mt-6 w-full h-12 rounded-full bg-slate-100 text-sm font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
