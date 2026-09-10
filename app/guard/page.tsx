"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from "next/navigation"

export default function GuardMobile() {
  const searchParams = useSearchParams()
  const gate = searchParams?.get('gate') || '1'
  const router = useRouter()

  const [guardId, setGuardId] = useState<string | null>(null)
  const [todayAtt, setTodayAtt] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(()=>{
    const gid = localStorage.getItem('guard_id')
    if(!gid){ router.push(`/guard/login?gate=${gate}`); return }
    setGuardId(gid)
    const check = async()=>{
      const {data} = await supabase.from('guard_attendance')
      .select('*')
      .eq('guard_id', gid)
      .gte('login_time', new Date().toISOString().split('T')[0])
      .order('login_time',{ascending:false}).limit(1).maybeSingle()
      if(!data){ router.push(`/guard/login?gate=${gate}`); return }
      setTodayAtt(data)
      setChecking(false)
    }
    check()
  },[gate, router])

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
  const [emergencyContacts] = useState<any[]>([
    {label:'FIRE', number:'101', icon:'🔥'},
    {label:'MEDICAL', number:'108', icon:'🚑'},
    {label:'POLICE', number:'100', icon:'🚓'},
    {label:'MANAGER', number:'9876543210', icon:'👨💼'},
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
    if(checking) return
    loadVisitors()
    const ch = supabase.channel('guard-all').on('postgres_changes',{event:'*', schema:'public', table:'visitors'},()=>loadVisitors()).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  }, [checking])

  useEffect(()=>{
    if(flat.length < 2){ setResident(null); return }
    const fetchResident = async () => {
      const { data } = await supabase.from('residents').select('*').eq('flat_no', flat.toUpperCase()).maybeSingle()
      setResident(data || null)
    }
    const t = setTimeout(fetchResident, 350)
    return ()=>clearTimeout(t)
  }, [flat])

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
   ...payload, photo_url: photoUrl, entry_time: new Date().toISOString(), created_at: new Date().toISOString()
    }).select().single()
    setLoading(false)
    if(!error && data){
      setLastPass(data); setShowQR(true)
      setVisitor(''); setMobile(''); setVehicle(''); setPhoto(null); setPhotoPreview('')
      loadVisitors(); return data
    } else { alert(error?.message); return null }
  }

  const handleApproveAndSend = async () => {
    if(!flat ||!resident) return alert('Pehle Flat No daal ke Resident verify karo')
    if(!visitor ||!mobile) return alert('Visitor Name + Mobile bharo')
    await insertVisitor({
      visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose, guard_id: guardId || `Gate ${gate}`, status:'pending'
    })
  }

  const handleDelivery = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    await insertVisitor({
      visitor_name: `${deliveryCompany} - ${visitor || 'Delivery'}`, name: `${deliveryCompany} Delivery`,
      mobile: mobile || 'Delivery', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Delivery - ${deliveryCompany}`, guard_id: guardId || `Gate ${gate}`, status:'pending'
    })
  }

  const handleVehicle = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    if(!vehicle) return alert('Gadi No bharo')
    await insertVisitor({
      visitor_name: `${vehicleType} - ${vehicle}`, name: `${vehicleType} - ${vehicle}`,
      mobile: mobile || 'Vehicle', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Vehicle Entry - ${vehicleType}`, guard_id: guardId || `Gate ${gate}`, status:'pending'
    })
  }

  const handleEmergency = async () => {
    if(!emergencyNote) return alert('Emergency detail likho')
    setLoading(true)
    await supabase.from('complaints').insert({ flat_no: flat.toUpperCase() || 'ALL', title: `🚨 EMERGENCY - ${emergencyType}`, description: emergencyNote, category:'Emergency', priority:'high', status:'open' })
    setLoading(false); setEmergencyNote(''); alert(`🚨 Emergency Broadcast Done!`); loadVisitors()
  }

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id)
    loadVisitors()
  }

  const insideList = allVisitors.filter(v=> v.status==='inside' || v.status==='approved')
  const pendingList = allVisitors.filter(v=> v.status==='pending')

  if(checking) return <div className="min-h-screen flex items-center justify-center font-black">Checking Guard Login...</div>

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b-2 border-black px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={todayAtt?.photo_url} className="w-9 h-9 rounded-full border-2 border-black object-cover"/>
          <div><div className="font-black text-sm">Gate-{gate} • {guardId}</div><div className="text-xs">{todayCount} Today • {pendingList.length} Pending • {insideList.length} Inside</div></div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-black">PRESENT {todayAtt? new Date(todayAtt.login_time).toLocaleTimeString() : ''}</span>
          <button onClick={()=>{localStorage.removeItem('guard_id'); router.push(`/guard/login?gate=${gate}`)}} className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold">Logout</button>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={()=>setTab('entry')} className={`h-20 rounded-3xl border font-bold ${tab==='entry'?'bg-black text-white':'bg-white'}`}>👤 VISITOR</button>
          <button onClick={()=>setTab('delivery')} className={`h-20 rounded-3xl border font-bold ${tab==='delivery'?'bg-[#facc15]':'bg-white'}`}>📦 DELIVERY</button>
          <button onClick={()=>setTab('vehicle')} className={`h-20 rounded-3xl border font-bold ${tab==='vehicle'?'bg-blue-600 text-white':'bg-white'}`}>🚗 VEHICLE</button>
          <button onClick={()=>setTab('approved')} className={`h-20 rounded-3xl border font-bold ${tab==='approved'?'bg-green-600 text-white':'bg-white'}`}>✅ INSIDE {insideList.length}</button>
          <button onClick={()=>setTab('exit')} className={`h-20 rounded-3xl border font-bold ${tab==='exit'?'bg-black text-white':'bg-white'}`}>↩ EXIT</button>
          <button onClick={()=>setTab('emergency')} className={`h-20 rounded-3xl border font-bold ${tab==='emergency'?'bg-red-600 text-white':'bg-red-50 text-red-700'}`}>🚨 SOS</button>
        </div>

        <div className="mt-4 p-5 rounded-3xl bg-white border-2 border-black">
          <div className="font-black text-sm">Flat No Search</div>
          <input value={flat} onChange={e=>setFlat(e.target.value)} className="mt-2 w-full h-12 rounded-2xl bg-slate-50 border-2 border-black px-4 font-bold" placeholder="Flat No ex: B-302" />
          {resident && <div className="mt-3 p-3 rounded-2xl bg-green-100 border-2 border-black font-bold text-sm">✅ {flat.toUpperCase()} • {resident.name} • {resident.mobile}</div>}
          {tab==='entry' && resident && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl border px-4"/>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile *" className="w-full h-12 rounded-2xl border px-4"/>
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Gadi No" className="w-full h-12 rounded-2xl border px-4"/>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-black text-white font-black">{loading? 'Sending...' : '✅ Approval Bhejo'}</button>
            </div>
          )}
          {tab==='delivery' && resident && <button onClick={handleDelivery} className="mt-4 w-full h-12 rounded-full bg-[#facc15] font-black border-2 border-black">📦 Delivery Approval</button>}
          {tab==='vehicle' && resident && <button onClick={handleVehicle} className="mt-4 w-full h-12 rounded-full bg-blue-600 text-white font-black">🚗 Vehicle Approval</button>}
        </div>

        {tab==='approved' && <div className="mt-4 space-y-2">{insideList.map(v=><div key={v.id} className="p-3 bg-white border-2 border-black rounded-2xl flex justify-between"><span className="font-bold text-sm">{v.visitor_name} → {v.flat_no}</span><button onClick={()=>markExit(v.id)} className="px-3 py-1 bg-black text-white rounded-full text-xs">Exit</button></div>)}</div>}
        {tab==='exit' && <div className="mt-4 p-4 bg-white border-2 border-black rounded-2xl"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search" className="w-full h-12 rounded-2xl border-2 border-black px-4"/>{allVisitors.filter(v=>v.status==='inside').slice(0,20).map(v=><div key={v.id} className="p-2 border-b flex justify-between"><span className="text-sm">{v.visitor_name}</span><button onClick={()=>markExit(v.id)} className="bg-black text-white px-3 py-1 rounded-full text-xs">Exit</button></div>)}</div>}
        {tab==='emergency' && <div className="mt-4 p-4 bg-white border-2 border-black rounded-2xl"><textarea value={emergencyNote} onChange={e=>setEmergencyNote(e.target.value)} placeholder="Emergency likho" className="w-full h-24 border-2 border-black rounded-2xl p-3"/><button onClick={handleEmergency} className="mt-3 w-full h-12 rounded-full bg-red-600 text-white font-black">🚨 Broadcast</button></div>}
      </div>

      {showQR && lastPass && <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={()=>setShowQR(false)}><div className="w-full max-w-md bg-white rounded-t-3xl p-6" onClick={e=>e.stopPropagation()}><div className="font-black text-center">Pending Approval - {lastPass.flat_no}</div><button onClick={()=>setShowQR(false)} className="mt-4 w-full h-12 bg-black text-white rounded-full font-bold">Close</button></div></div>}
    </div>
  )
}
