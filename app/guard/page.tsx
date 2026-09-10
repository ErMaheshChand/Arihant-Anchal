"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useSearchParams, useRouter } from "next/navigation"

export default function GuardPage(){
  const gate = useSearchParams().get('gate') || '3'
  const router = useRouter()
  const [guard, setGuard] = useState<any>(null)
  const [todayAtt, setTodayAtt] = useState<any>(null)

  useEffect(()=>{
    const gid = localStorage.getItem('guard_id')
    if(!gid){
      router.push(`/guard/login?gate=${gate}`)
      return
    }
    // attendance check
    const check = async()=>{
      const {data} = await supabase.from('guard_attendance')
        .select('*, guards(full_name, photo_url)')
        .eq('guard_id', gid)
        .gte('login_time', new Date().toISOString().split('T')[0])
        .order('login_time',{ascending:false}).limit(1).single()
      
      if(!data){
        router.push(`/guard/login?gate=${gate}`)
      }else{
        setTodayAtt(data)
        setGuard(data.guards)
      }
    }
    check()
  },[])

  if(!todayAtt) return <div className="p-10 text-center font-black">Checking Attendance...</div>

  return (
    <div>
      {/* TOP BAR - PRESENT BADGE */}
      <div className="bg-white border-b-2 border-black p-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex gap-3 items-center">
          <img src={todayAtt.photo_url} className="w-12 h-12 rounded-full border-2 border-black"/>
          <div>
            <div className="font-black">{todayAtt.guard_id} - Present {new Date(todayAtt.login_time).toLocaleTimeString()}</div>
            <div className="text-xs">Gate-{gate} | {todayAtt.date}</div>
          </div>
        </div>
        <span className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-black">PRESENT</span>
      </div>

      {/* Aapka purana dashboard code yahi se start hoga */}
      {/* ... Flat No Search etc ... */}
    </div>
  )
}'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GuardMobile() {
  const [flat, setFlat] = useState('')
  const [resident, setResident] = useState<any>(null)
  const [visitor, setVisitor] = useState('')
  const [mobile, setMobile] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [purpose, setPurpose] = useState('Meeting')
  const [photo, setPhoto] = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [tab, setTab] = useState<'entry'|'delivery'|'vehicle'|'approved'|'exit'|'emergency'>('entry')
  const [loading, setLoading] = useState(false)
  const [lastPass, setLastPass] = useState<any>(null)
  const [allVisitors, setAllVisitors] = useState<any[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const [deliveryCompany, setDeliveryCompany] = useState('Amazon')
  const [vehicleType, setVehicleType] = useState('Car')
  const [emergencyType, setEmergencyType] = useState('Fire')
  const [emergencyNote, setEmergencyNote] = useState('')
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([
    {label:'FIRE', number:'101', icon:'🔥'},
    {label:'MEDICAL', number:'108', icon:'🚑'},
    {label:'POLICE', number:'100', icon:'🚓'},
    {label:'MANAGER', number:'9876543210', icon:'👨‍💼'},
  ])

  const loadVisitors = async () => {
    const { data } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(200)
    if(data){
      setAllVisitors(data)
      const todayStr = new Date().toISOString().split('T')[0]
      setTodayCount(data.filter((v:any)=> v.created_at?.startsWith(todayStr)).length)
    }
  }

  useEffect(()=>{
    loadVisitors()
    const ch = supabase.channel('guard-all').on('postgres_changes',{event:'*', schema:'public', table:'visitors'},()=>loadVisitors()).subscribe()
    const loadContacts = async () => {
      const { data } = await supabase.from('emergency_contacts').select('*')
      if(data && data.length>0) setEmergencyContacts(data)
    }
    loadContacts()
    return ()=>{ supabase.removeChannel(ch) }
  }, [])

  useEffect(()=>{
    if(flat.length < 2){ setResident(null); return }
    const fetchResident = async () => {
      const { data } = await supabase.from('residents').select('*').eq('flat_no', flat.toUpperCase()).maybeSingle()
      setResident(data || null)
    }
    const t = setTimeout(fetchResident, 350)
    return ()=>clearTimeout(t)
  }, [flat])

  const handlePhoto = (e:any) => {
    const f = e.target.files?.[0]
    if(f){ setPhoto(f); setPhotoPreview(URL.createObjectURL(f)) }
  }

  const insertVisitor = async (payload:any) => {
    setLoading(true)
    let photoUrl = ''
    if(photo){
      const fileName = `visitor_${Date.now()}_${photo.name}`
      await supabase.storage.from('visitor-photos').upload(fileName, photo)
      const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }
    const { data, error } = await supabase.from('visitors').insert({
   ...payload,
      photo_url: photoUrl,
      entry_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    }).select().single()
    setLoading(false)
    if(!error && data){
      setLastPass(data)
      setShowQR(true)
      setVisitor(''); setMobile(''); setVehicle(''); setPhoto(null); setPhotoPreview('')
      loadVisitors()
      return data
    } else {
      alert(error?.message)
      return null
    }
  }

  const handleApproveAndSend = async () => {
    if(!flat ||!resident) return alert('Pehle Flat No daal ke Resident verify karo')
    if(!visitor ||!mobile) return alert('Visitor Name + Mobile bharo')
    const res = await insertVisitor({
      visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose, guard_id:'Gate 1', status:'pending'
    })
    if(res) alert(`✅ ${resident.name} ko Approval Alert gaya! Flat: ${flat.toUpperCase()}\nResident Approve karega tabhi entry hogi.`)
  }

  const handleDelivery = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    const res = await insertVisitor({
      visitor_name: `${deliveryCompany} - ${visitor || 'Delivery'}`, name: `${deliveryCompany} Delivery`,
      mobile: mobile || 'Delivery', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Delivery - ${deliveryCompany}`, guard_id:'Gate 1', status:'pending'
    })
    if(res) alert(`📦 Delivery Approval Sent to ${resident.name} (${resident.mobile})`)
  }

  const handleVehicle = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    if(!vehicle) return alert('Gadi No bharo')
    const res = await insertVisitor({
      visitor_name: `${vehicleType} - ${vehicle}`, name: `${vehicleType} - ${vehicle}`,
      mobile: mobile || 'Vehicle', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Vehicle Entry - ${vehicleType}`, guard_id:'Gate 1', status:'pending'
    })
    if(res) alert(`🚗 Vehicle Approval Sent to ${resident.name}`)
  }

  const handleEmergency = async () => {
    if(!emergencyNote) return alert('Emergency detail likho')
    setLoading(true)
    await supabase.from('complaints').insert({
      flat_no: flat.toUpperCase() || 'ALL',
      title: `🚨 EMERGENCY - ${emergencyType}`,
      description: emergencyNote,
      category:'Emergency',
      priority:'high',
      status:'open'
    })
    const { data: residents } = await supabase.from('residents').select('flat_no')
    const alertMsg = `🚨 EMERGENCY: ${emergencyType} - ${emergencyNote} (Reported from ${flat.toUpperCase() || 'Guard'})`
    await supabase.from('emergency_alerts').insert({
      type: emergencyType,
      flat_no: flat.toUpperCase() || 'ALL',
      message: alertMsg
    })
    await supabase.from('visitors').insert({
      visitor_name: `🚨 ${emergencyType}`, name: `🚨 ${emergencyType}`,
      flat_no: (flat.toUpperCase() || 'ALL'), resident_flat: (flat.toUpperCase() || 'ALL'),
      purpose: `EMERGENCY - ${emergencyType}: ${emergencyNote}`, guard_id:'Gate 1', status:'inside',
      entry_time: new Date().toISOString()
    })
    setLoading(false)
    setEmergencyNote('')
    alert(`🚨 Emergency Broadcast Done!\n${residents?.length || 0} Registered Residents ko alert gaya + Admin ko gaya`)
    loadVisitors()
  }

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id)
    loadVisitors()
  }

  const filteredByFlat = allVisitors.filter(v=> v.flat_no?.toUpperCase() === flat.toUpperCase() || v.resident_flat?.toUpperCase() === flat.toUpperCase())
  const insideList = allVisitors.filter(v=> v.status==='inside' || v.status==='approved')
  const pendingList = allVisitors.filter(v=> v.status==='pending')

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-amber-300">A</div>
          <div><div className="font-bold text-sm">Arihant Anchal • Gate 1</div><div className="text- text-slate-500">{todayCount} Today • {pendingList.length} Pending • {insideList.length} Inside</div></div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text- font-bold">● LIVE</span>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={()=>setTab('entry')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='entry'?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-100'}`}><span className="text-lg">👤</span><span className="text- font-bold">VISITOR</span></button>
          <button onClick={()=>setTab('delivery')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='delivery'?'bg-amber-400 border-amber-400 text-black':'bg-amber-50 border-amber-100'}`}><span className="text-lg">📦</span><span className="text- font-bold">DELIVERY</span></button>
          <button onClick={()=>setTab('vehicle')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='vehicle'?'bg-cyan-500 text-white border-cyan-500':'bg-cyan-50 border-cyan-100'}`}><span className="text-lg">🚗</span><span className="text- font-bold">VEHICLE</span></button>
          <button onClick={()=>setTab('approved')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='approved'?'bg-emerald-500 text-white border-emerald-500':'bg-emerald-50 border-emerald-100'}`}><span className="text-lg">✅</span><span className="text- font-bold">INSIDE {insideList.length}</span></button>
          <button onClick={()=>setTab('exit')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='exit'?'bg-slate-800 text-white border-slate-800':'bg-slate-100 border-slate-200'}`}><span className="text-lg">↩</span><span className="text- font-bold">EXIT</span></button>
          <button onClick={()=>setTab('emergency')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='emergency'?'bg-red-600 text-white border-red-600':'bg-red-50 border-red-100 text-red-700'}`}><span className="text-lg">🚨</span><span className="text- font-bold">EMERGENCY</span></button>
        </div>

        <div className="mt-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="text-sm font-bold flex justify-between"><span>Step 1: Flat No Search → Resident Verify</span><span className="text-xs text-slate-500">{flat? `${flat.toUpperCase()} • ${filteredByFlat.length} rec`:''}</span></div>
          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 pl-10 pr-3 text-sm font-bold outline-none focus:bg-amber-50 focus:border-amber-200" placeholder="Flat No ex: B-302" />
          </div>
          {flat && (
            <div className={`mt-3 p-3 rounded-2xl border flex gap-2.5 items-center ${resident?'bg-emerald-50 border-emerald-100':'bg-red-50 border-red-100'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${resident?'bg-emerald-600 text-white':'bg-red-500 text-white'}`}>{resident? resident.name[0] : '!'}</div>
              <div className="text-xs flex-1">
                {resident? (<><div className="font-bold">{flat.toUpperCase()} • {resident.name} • {resident.mobile}</div><div className="text-emerald-700 font-bold">✅ Verified - Ab details bharo</div></>):(<><div className="font-bold text-red-700">Resident Not Found</div><div className="text-slate-500">Supabase residents me {flat.toUpperCase()} add karo</div></>)}
              </div>
            </div>
          )}
          {tab==='entry' && resident && (
            <div className="mt-4 space-y-3">
              <div className="text-sm font-bold">Step 2: Name/Phone/Gadi/Foto</div>
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <div className="grid grid-cols-2 gap-3">
                <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Gadi No" className="h-12 rounded-2xl bg-slate-50 border px-3 text-sm"/>
                <select value={purpose} onChange={e=>setPurpose(e.target.value)} className="h-12 rounded-2xl bg-slate-50 border px-3 text-sm"><option>Meeting</option><option>Guest</option><option>Service</option></select>
              </div>
              <label className="h-12 rounded-2xl border border-dashed flex items-center justify-center cursor-pointer bg-slate-50 text-sm overflow-hidden">{photoPreview? <img src={photoPreview} className="h-10 w-10 rounded-xl object-cover"/> : '📷 Photo'}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto}/></label>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">{loading? 'Sending...' : `✅ ${resident.name} ko Approval Bhejo →`}</button>
            </div>
          )}
          {tab==='delivery' && resident && (
            <div className="mt-4 space-y-3">
              <select value={deliveryCompany} onChange={e=>setDeliveryCompany(e.target.value)} className="w-full h-12 rounded-2xl bg-amber-50 border border-amber-100 px-3 text-sm font-bold"><option>Amazon</option><option>Flipkart</option><option>Swiggy</option><option>Zomato</option><option>BlueDart</option></select>
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Delivery Person Name" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Gadi No" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <button onClick={handleDelivery} disabled={loading} className="w-full h-12 rounded-full bg-amber-400 text-black font-bold text-sm">📦 Approval Bhejo</button>
            </div>
          )}
          {tab==='vehicle' && resident && (
            <div className="mt-4 space-y-3">
              <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)} className="w-full h-12 rounded-2xl bg-cyan-50 border border-cyan-100 px-3 text-sm font-bold"><option>Car</option><option>Bike</option><option>Auto</option><option>Truck</option></select>
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="RJ14 AB 1234 *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Driver Mobile" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <button onClick={handleVehicle} disabled={loading} className="w-full h-12 rounded-full bg-cyan-500 text-white font-bold text-sm">🚗 Approval Bhejo</button>
            </div>
          )}
          {!resident && flat && (tab==='entry' || tab==='delivery' || tab==='vehicle') && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 text-xs text-red-700 font-bold">⚠️ Sahi Flat No daalo, Resident verify hoga tabhi form khulega</div>
          )}
        </div>

        {tab==='approved' && (
          <div className="mt-4 p-5 rounded-3xl bg-white border shadow-sm">
            <div className="text-sm font-bold flex justify-between"><span>Pending + Inside</span><span className="text-xs bg-amber-100 px-2.5 py-1 rounded-full">{pendingList.length} Pending</span></div>
            <div className="mt-3 space-y-2 max-h- overflow-auto">
              {pendingList.map(v=>(
                <div key={v.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex justify-between items-center"><div><div className="font-bold text-sm">⏳ {v.visitor_name||v.name} → {v.flat_no}</div><div className="text- text-slate-600">Waiting Approval</div></div><span className="text- px-2 py-1 rounded-full bg-amber-200 font-bold">PENDING</span></div>
              ))}
              {insideList.map(v=>(
                <div key={v.id} className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center"><div><div className="font-bold text-sm">✅ {v.visitor_name||v.name} → {v.flat_no}</div><div className="text-">{v.purpose}</div></div><button onClick={()=>markExit(v.id)} className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">Exit</button></div>
              ))}
            </div>
          </div>
        )}

        {tab==='exit' && (
          <div className="mt-4 p-5 rounded-3xl bg-white border shadow-sm">
            <div className="text-sm font-bold">Exit: Search karke Exit karo - Record Save</div>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Name / Flat / Mobile se search" className="mt-3 w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
            <div className="mt-3 space-y-2 max-h- overflow-auto">
              {allVisitors.filter(v=>v.status==='inside' && (v.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) || v.flat_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||!searchQuery)).slice(0,20).map(v=>(
                <div key={v.id} className="p-3 rounded-2xl bg-white border shadow-sm flex justify-between items-center"><div><div className="font-bold text-sm">{v.visitor_name||v.name} → {v.flat_no}</div><div className="text- text-slate-500">Inside since {new Date(v.entry_time||v.created_at).toLocaleTimeString()}</div></div><button onClick={()=>markExit(v.id)} className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold">Exit Karo</button></div>
              ))}
            </div>
          </div>
        )}

        {tab==='emergency' && (
          <div className="mt-4 space-y-4">
            <div className="p-5 rounded-3xl bg-white border shadow-sm">
              <div className="text-sm font-bold">🚨 Emergency Broadcast - ALL Residents</div>
              <div className="text- text-red-600 font-bold mt-1">Ye message ALL registered residents ko jayega</div>
              <div className="mt-3 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border pl-10 pr-3 text-sm font-bold" placeholder="Flat No (khali = Society Wide)" />
              </div>
              <select value={emergencyType} onChange={e=>setEmergencyType(e.target.value)} className="mt-3 w-full h-12 rounded-2xl bg-red-50 border border-red-100 px-3 text-sm font-bold">
                <option>Fire</option><option>Medical</option><option>Theft</option><option>Water Leak</option><option>Power Failure</option><option>Society Wide Emergency</option>
              </select>
              <textarea value={emergencyNote} onChange={e=>setEmergencyNote(e.target.value)} placeholder="Emergency detail likho..." className="mt-3 w-full h-24 rounded-2xl bg-slate-50 border p-3 text-sm" />
              <button onClick={handleEmergency} disabled={loading} className="mt-3 w-full h-12 rounded-full bg-red-600 text-white font-bold text-sm animate-pulse">
                {loading? 'Broadcasting to ALL...' : `🚨 ALL Residents ko Emergency Bhejo`}
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-sm">
              <div className="text-sm font-bold tracking-widest">EMERGENCY NUMBERS • ONE TAP CALL</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {emergencyContacts.map((c:any)=>(
                  <a key={c.label} href={`tel:${c.number}`} className="p-4 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1 active:scale-95 transition">
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text- font-bold tracking-widest opacity-70">{c.label}</span>
                    <span className="text-sm font-bold">{c.number}</span>
                    <span className="text- px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold mt-1">📞 CALL</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showQR && lastPass && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={()=>setShowQR(false)}>
          <div className="w-full max-w-md bg-white rounded-t- p-6 pb-10" onClick={e=>e.stopPropagation()}>
            <div className="text-center"><div className="text-xs font-bold tracking-widest">⏳ PENDING APPROVAL - RECORD SAVED</div><div className="text-xs text-slate-500 mt-1">{lastPass.flat_no} • {lastPass.visitor_name}</div><div className="mt-5 mx-auto w-64 h-64 rounded-3xl bg-slate-900 p-3"><div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center p-3"><div className="text-sm font-bold">{lastPass.visitor_name}</div><div className="text-xs mt-1">{lastPass.flat_no}</div><div className="mt-2 text-xs bg-amber-100 px-3 py-1 rounded-full font-bold">Pending</div></div></div><button onClick={()=>setShowQR(false)} className="mt-6 w-full h-12 rounded-full bg-slate-100 text-sm font-bold">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
