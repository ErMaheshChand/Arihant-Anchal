"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from "next/navigation"

export default function GuardMobile() {
  const searchParams = useSearchParams()
  const gate = searchParams.get('gate') || '1'
  const router = useRouter()

  // --- Attendance Check ---
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
  },[gate])

  // --- Aapka purana code ---
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
    const res = await insertVisitor({
      visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose, guard_id: guardId || `Gate ${gate}`, status:'pending'
    })
    if(res) alert(`✅ ${resident.name} ko Approval Alert gaya!`)
  }

  const handleDelivery = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    const res = await insertVisitor({
      visitor_name: `${deliveryCompany} - ${visitor || 'Delivery'}`, name: `${deliveryCompany} Delivery`,
      mobile: mobile || 'Delivery', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Delivery - ${deliveryCompany}`, guard_id: guardId || `Gate ${gate}`, status:'pending'
    })
    if(res) alert(`📦 Delivery Approval Sent`)
  }

  const handleVehicle = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    if(!vehicle) return alert('Gadi No bharo')
    const res = await insertVisitor({
      visitor_name: `${vehicleType} - ${vehicle}`, name: `${vehicleType} - ${vehicle}`,
      mobile: mobile || 'Vehicle', vehicle_no: vehicle,
      flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(),
      purpose: `Vehicle Entry - ${vehicleType}`, guard_id: guardId || `Gate ${gate}`, status:'pending'
    })
    if(res) alert(`🚗 Vehicle Approval Sent`)
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

  const filteredByFlat = allVisitors.filter(v=> v.flat_no?.toUpperCase() === flat.toUpperCase())
  const insideList = allVisitors.filter(v=> v.status==='inside' || v.status==='approved')
  const pendingList = allVisitors.filter(v=> v.status==='pending')

  if(checking) return <div className="min-h-screen flex items-center justify-center font-black">Checking Guard Login...</div>

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src={todayAtt?.photo_url} className="w-9 h-9 rounded-full border-2 border-black"/>
          <div><div className="font-bold text-sm">Gate-{gate} • {guardId} • Present</div><div className="text-xs text-slate-500">{todayCount} Today • {pendingList.length} Pending • {insideList.length} Inside</div></div>
        </div>
        <button onClick={()=>{localStorage.removeItem('guard_id'); router.push(`/guard/login?gate=${gate}`)}} className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold">Logout</button>
      </div>
      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={()=>setTab('entry')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='entry'?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-100'}`}><span className="text-lg">👤</span><span className="text-xs font-bold">VISITOR</span></button>
          <button onClick={()=>setTab('delivery')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='delivery'?'bg-amber-400 border-amber-400 text-black':'bg-amber-50 border-amber-100'}`}><span className="text-lg">📦</span><span className="text-xs font-bold">DELIVERY</span></button>
          <button onClick={()=>setTab('vehicle')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='vehicle'?'bg-cyan-500 text-white border-cyan-500':'bg-cyan-50 border-cyan-100'}`}><span className="text-lg">🚗</span><span className="text-xs font-bold">VEHICLE</span></button>
          <button onClick={()=>setTab('approved')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='approved'?'bg-emerald-500 text-white border-emerald-500':'bg-emerald-50 border-emerald-100'}`}><span className="text-lg">✅</span><span className="text-xs font-bold">INSIDE {insideList.length}</span></button>
          <button onClick={()=>setTab('exit')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='exit'?'bg-slate-800 text-white border-slate-800':'bg-slate-100 border-slate-200'}`}><span className="text-lg">↩</span><span className="text-xs font-bold">EXIT</span></button>
          <button onClick={()=>setTab('emergency')} className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border shadow-sm ${tab==='emergency'?'bg-red-600 text-white border-red-600':'bg-red-50 border-red-100 text-red-700'}`}><span className="text-lg">🚨</span><span className="text-xs font-bold">EMERGENCY</span></button>
        </div>
        <div className="mt-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="text-sm font-bold">Step 1: Flat No Search → Resident Verify</div>
          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border pl-10 pr-3 text-sm font-bold" placeholder="Flat No ex: B-302" />
          </div>
          {flat && resident && <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-bold">✅ {flat.toUpperCase()} • {resident.name} • {resident.mobile}</div>}
          {tab==='entry' && resident && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Gadi No" className="w-full h-12 rounded-2xl bg-slate-50 border px-3 text-sm"/>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">{loading? 'Sending...' : `✅ Approval Bhejo`}</button>
            </div>
          )}
          {tab==='delivery' && resident && <button onClick={handleDelivery} className="mt-4 w-full h-12 rounded-full bg-amber-400 text-black font-bold">📦 Delivery Approval</button>}
          {tab==='vehicle' && resident && <button onClick={handleVehicle} className="mt-4 w-full h-12 rounded-full bg-cyan-500 text-white font-bold">🚗 Vehicle Approval</button>}
        </div>
        {tab==='approved' && <div className="mt-4 p-5 rounded-3xl bg-white border"><div className="font-bold text-sm">Inside: {insideList.length} | Pending: {pendingList.length}</div>{insideList.map(v=><div key={v.id} className="mt-2 p-3 rounded-2xl bg-emerald-50 flex justify-between"><span className="text-sm font-bold">{v.visitor_name} → {v.flat_no}</span><button onClick={()=>markExit(v.id)} className="px-3 py-1 rounded-full bg-black text-white text-xs">Exit</button></div>)}</div>}
        {tab==='exit' && <div className="mt-4 p-5 rounded-3xl bg-white border"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search" className="w-full h-12 rounded-2xl bg-slate-50 border px-4"/><div className="mt-3">{allVisitors.filter(v=>v.status==='inside').slice(0,20).map(v=><div key={v.id} className="p-3 border-b flex justify-between"><span className="text-sm">{v.visitor_name} → {v.flat_no}</span><button onClick={()=>markExit(v.id)} className="px-3 py-1 bg-black text-white rounded-full text-xs">Exit</button></div>)}</div></div>}
      </div>
    </div>
  )
}
