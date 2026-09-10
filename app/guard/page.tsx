"use client"
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from "next/navigation"

function GuardInner() {
  const searchParams = useSearchParams()
  const gate = searchParams?.get('gate') || '1'
  const router = useRouter()

  // --- Attendance check ---
  const [guardId, setGuardId] = useState<string|null>(null)
  const [todayAtt, setTodayAtt] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(()=>{
    const gid = localStorage.getItem('guard_id')
    if(!gid){ router.push(`/guard/login?gate=${gate}`); return }
    setGuardId(gid)
    const check = async()=>{
      const {data} = await supabase.from('guard_attendance').select('*').eq('guard_id', gid).gte('login_time', new Date().toISOString().split('T')[0]).order('login_time',{ascending:false}).limit(1).maybeSingle()
      if(!data){ router.push(`/guard/login?gate=${gate}`); return }
      setTodayAtt(data); setChecking(false)
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
    const loadContacts = async () => {
      const { data } = await supabase.from('emergency_contacts').select('*')
      if(data && data.length>0) setEmergencyContacts(data)
    }
    loadContacts()
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
    const res = await insertVisitor({ visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle, flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(), purpose, guard_id: guardId || `Gate ${gate}`, status:'pending' })
    if(res) alert(`✅ ${resident.name} ko Approval Alert gaya!`)
  }

  const handleDelivery = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    const res = await insertVisitor({ visitor_name: `${deliveryCompany} - ${visitor || 'Delivery'}`, name: `${deliveryCompany} Delivery`, mobile: mobile || 'Delivery', vehicle_no: vehicle, flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(), purpose: `Delivery - ${deliveryCompany}`, guard_id: guardId || `Gate ${gate}`, status:'pending' })
    if(res) alert(`📦 Delivery Approval Sent`)
  }

  const handleVehicle = async () => {
    if(!flat ||!resident) return alert('Flat No + Resident verify karo')
    if(!vehicle) return alert('Gadi No bharo')
    const res = await insertVisitor({ visitor_name: `${vehicleType} - ${vehicle}`, name: `${vehicleType} - ${vehicle}`, mobile: mobile || 'Vehicle', vehicle_no: vehicle, flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(), purpose: `Vehicle Entry - ${vehicleType}`, guard_id: guardId || `Gate ${gate}`, status:'pending' })
    if(res) alert(`🚗 Vehicle Approval Sent`)
  }

  const handleEmergency = async () => {
    if(!emergencyNote) return alert('Emergency detail likho')
    setLoading(true)
    await supabase.from('complaints').insert({ flat_no: flat.toUpperCase() || 'ALL', title: `🚨 EMERGENCY - ${emergencyType}`, description: emergencyNote, category:'Emergency', priority:'high', status:'open' })
    setLoading(false); setEmergencyNote(''); alert(`🚨 Emergency Broadcast Done!`); loadVisitors()
  }

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id); loadVisitors()
  }

  const insideList = allVisitors.filter(v=> v.status==='inside' || v.status==='approved')
  const pendingList = allVisitors.filter(v=> v.status==='pending')

  if(checking) return <div className="min-h-screen flex items-center justify-center font-black">Checking Guard Login...</div>

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src={todayAtt?.photo_url} className="w-9 h-9 rounded-full border-2 border-black object-cover"/>
          <div><div className="font-bold text-sm">Gate-{gate} • {guardId} • Present</div><div className="text-xs text-slate-500">{todayCount} Today • {pendingList.length} Pending • {insideList.length} Inside • {todayAtt? new Date(todayAtt.login_time).toLocaleTimeString():''}</div></div>
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
          <div className="text-sm font-bold flex justify-between"><span>Step 1: Flat No Search → Resident Verify</span></div>
          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 pl-10 pr-3 text-sm font-bold outline-none focus:bg-amber-50 focus:border-amber-200" placeholder="Flat No ex: B-302" />
          </div>
          {flat && (
            <div className={`mt-3 p-3 rounded-2xl border flex gap-2.5 items-center ${resident?'bg-emerald-50 border-emerald-100':'bg-red-50 border-red-100'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${resident?'bg-emerald-600 text-white':'bg-red-500 text-white'}`}>{resident? resident.name[0] : '!'}</div>
              <div className="text-xs flex-1">
                {resident? (<><div className="font-bold">{flat.toUpperCase()} • {resident.name} • {resident.mobile}</div><div className="text-emerald-700 font-bold">✅ Verified</div></>):(<><div className="font-bold text-red-700">Resident Not Found</div></>)}
              </div>
            </div>
          )}
          {tab==='entry' && resident && (
            <div className="mt-4 space-y-3">
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
              <button onClick={handleDelivery} disabled={loading} className="w-full h-12 rounded-full bg-amber-400 text-black font-bold text-sm">📦 Approval Bhejo</button>
            </div>
          )}
          {tab==='vehicle' && resident && (
            <div className="mt-4 space-y-3">
              <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)} className="w-full h-12 rounded-2xl bg-cyan-50 border border-cyan-100 px-3 text-sm font-bold"><option>Car</option><option>Bike</option><option>Auto</option><option>Truck</option></select>
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="RJ14 AB 1234 *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
              <button onClick={handleVehicle} disabled={loading} className="w-full h-12 rounded-full bg-cyan-500 text-white font-bold text-sm">🚗 Approval Bhejo</button>
            </div>
          )}
        </div>

        {tab==='approved' && (
          <div className="mt-4 p-5 rounded-3xl bg-white border shadow-sm">
            <div className="text-sm font-bold">Pending + Inside</div>
            <div className="mt-3 space-y-2">{pendingList.map(v=>(<div key={v.id} className="p-3 rounded-2xl bg-amber-50 border flex justify-between"><span className="text-sm font-bold">⏳ {v.visitor_name} → {v.flat_no}</span><span className="text-xs bg-amber-200 px-2 py-1 rounded-full">PENDING</span></div>))}{insideList.map(v=>(<div key={v.id} className="p-3 rounded-2xl bg-emerald-50 border flex justify-between"><span className="text-sm font-bold">✅ {v.visitor_name} → {v.flat_no}</span><button onClick={()=>markExit(v.id)} className="px-3 py-1 rounded-full bg-black text-white text-xs">Exit</button></div>))}</div>
          </div>
        )}
        {tab==='exit' && (
          <div className="mt-4 p-5 rounded-3xl bg-white border shadow-sm">
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Name / Flat se search" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
            <div className="mt-3 space-y-2">{allVisitors.filter(v=>v.status==='inside').slice(0,20).map(v=>(<div key={v.id} className="p-3 rounded-2xl border flex justify-between"><span className="text-sm font-bold">{v.visitor_name} → {v.flat_no}</span><button onClick={()=>markExit(v.id)} className="px-4 py-2 rounded-full bg-black text-white text-xs">Exit Karo</button></div>))}</div>
          </div>
        )}
        {tab==='emergency' && (
          <div className="mt-4 space-y-4">
            <div className="p-5 rounded-3xl bg-white border shadow-sm">
              <div className="text-sm font-bold">🚨 Emergency Broadcast</div>
              <select value={emergencyType} onChange={e=>setEmergencyType(e.target.value)} className="mt-3 w-full h-12 rounded-2xl bg-red-50 border px-3 text-sm font-bold"><option>Fire</option><option>Medical</option><option>Theft</option><option>Water Leak</option></select>
              <textarea value={emergencyNote} onChange={e=>setEmergencyNote(e.target.value)} placeholder="Detail likho..." className="mt-3 w-full h-24 rounded-2xl border p-3 text-sm" />
              <button onClick={handleEmergency} disabled={loading} className="mt-3 w-full h-12 rounded-full bg-red-600 text-white font-bold text-sm">🚨 Broadcast</button>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900 text-white">
              <div className="text-sm font-bold">EMERGENCY NUMBERS</div>
              <div className="mt-3 grid grid-cols-2 gap-3">{emergencyContacts.map(c=>(<a key={c.label} href={`tel:${c.number}`} className="p-4 rounded-2xl bg-white/10 border flex flex-col items-center"><span className="text-xl">{c.icon}</span><span className="text-xs">{c.label}</span><span className="text-sm font-bold">{c.number}</span></a>))}</div>
            </div>
          </div>
        )}
      </div>
      {showQR && lastPass && (<div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={()=>setShowQR(false)}><div className="w-full max-w-md bg-white rounded-t-3xl p-6" onClick={e=>e.stopPropagation()}><div className="font-bold text-center">Pending - {lastPass.flat_no}</div><button onClick={()=>setShowQR(false)} className="mt-4 w-full h-12 bg-black text-white rounded-full font-bold">Close</button></div></div>)}
    </div>
  )
}

export default function GuardPage(){
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">Loading...</div>}>
      <GuardInner/>
    </Suspense>
  )
}
