"use client"
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from "next/navigation"

function GuardInner(){
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
  const [showQR, setShowQR] = useState(false)
  const [tab, setTab] = useState<'entry'|'delivery'|'vehicle'|'approved'|'exit'|'emergency'>('entry')
  const [loading, setLoading] = useState(false)
  const [lastPass, setLastPass] = useState<any>(null)
  const [allVisitors, setAllVisitors] = useState<any[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [deliveryCompany, setDeliveryCompany] = useState('Amazon')
  const [vehicleType, setVehicleType] = useState('Car')
  const [emergencyNote, setEmergencyNote] = useState('')

  const loadVisitors = async () => {
    const { data } = await supabase.from('visitors').select('*').order('created_at',{ascending:false}).limit(200)
    if(data){
      setAllVisitors(data)
      const todayStr = new Date().toISOString().split('T')[0]
      setTodayCount(data.filter((v:any)=> v.created_at?.startsWith(todayStr)).length)
    }
  }

  useEffect(()=>{ if(checking) return; loadVisitors() }, [checking])

  useEffect(()=>{
    if(flat.length < 2){ setResident(null); return }
    const t = setTimeout(async()=>{
      const { data } = await supabase.from('residents').select('*').eq('flat_no', flat.toUpperCase()).maybeSingle()
      setResident(data || null)
    },350)
    return ()=>clearTimeout(t)
  }, [flat])

  const insertVisitor = async (payload:any) => {
    setLoading(true)
    const { data, error } = await supabase.from('visitors').insert({...payload, entry_time: new Date().toISOString()}).select().single()
    setLoading(false)
    if(!error && data){ setLastPass(data); setShowQR(true); setVisitor(''); setMobile(''); setVehicle(''); loadVisitors() }
  }

  const handleApproveAndSend = async () => {
    if(!flat ||!resident) return alert('Flat No verify karo')
    if(!visitor ||!mobile) return alert('Name + Mobile bharo')
    await insertVisitor({ visitor_name: visitor, name: visitor, mobile, vehicle_no: vehicle, flat_no: flat.toUpperCase(), resident_flat: flat.toUpperCase(), purpose, guard_id: guardId || `Gate ${gate}`, status:'pending' })
  }

  const markExit = async (id:string) => {
    await supabase.from('visitors').update({status:'exited', exit_time:new Date().toISOString()}).eq('id',id); loadVisitors()
  }

  const insideList = allVisitors.filter(v=> v.status==='inside' || v.status==='approved')
  const pendingList = allVisitors.filter(v=> v.status==='pending')

  if(checking) return <div className="min-h-screen flex items-center justify-center font-black">Checking Guard Login...</div>

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <div className="sticky top-0 z-40 bg-white border-b-2 border-black px-4 h-14 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <img src={todayAtt?.photo_url} className="w-9 h-9 rounded-full border-2 border-black object-cover"/>
          <div className="text-xs font-black">Gate-{gate} • {guardId} • <span className="text-green-600">PRESENT {todayAtt? new Date(todayAtt.login_time).toLocaleTimeString():''}</span></div>
        </div>
        <button onClick={()=>{localStorage.removeItem('guard_id'); router.push(`/guard/login?gate=${gate}`)}} className="px-3 py-1 bg-black text-white rounded-full text-xs">Logout</button>
      </div>
      <div className="max-w-md mx-auto p-4">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={()=>setTab('entry')} className={`h-16 rounded-2xl border-2 border-black font-black ${tab==='entry'?'bg-black text-white':'bg-white'}`}>VISITOR</button>
          <button onClick={()=>setTab('delivery')} className={`h-16 rounded-2xl border-2 border-black font-black ${tab==='delivery'?'bg-[#facc15]':'bg-white'}`}>DELIVERY</button>
          <button onClick={()=>setTab('vehicle')} className={`h-16 rounded-2xl border-2 border-black font-black ${tab==='vehicle'?'bg-blue-600 text-white':'bg-white'}`}>VEHICLE</button>
          <button onClick={()=>setTab('approved')} className={`h-16 rounded-2xl border-2 border-black font-black ${tab==='approved'?'bg-green-600 text-white':'bg-white'}`}>INSIDE {insideList.length}</button>
          <button onClick={()=>setTab('exit')} className={`h-16 rounded-2xl border-2 border-black font-black ${tab==='exit'?'bg-black text-white':'bg-white'}`}>EXIT</button>
          <button onClick={()=>setTab('emergency')} className="h-16 rounded-2xl border-2 border-black font-black bg-red-100">SOS</button>
        </div>
        <div className="mt-4 p-4 bg-white border-2 border-black rounded-2xl">
          <input value={flat} onChange={e=>setFlat(e.target.value)} placeholder="Flat No B-302" className="w-full h-12 border-2 border-black rounded-xl px-4 font-bold"/>
          {resident && <div className="mt-2 p-2 bg-green-100 border-2 border-black rounded-xl font-bold text-xs">✅ {resident.name} • {resident.mobile}</div>}
          {tab==='entry' && resident && <div className="mt-3 space-y-2"><input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Name" className="w-full h-11 border rounded-xl px-3"/><input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile" className="w-full h-11 border rounded-xl px-3"/><button onClick={handleApproveAndSend} className="w-full h-12 bg-black text-white rounded-full font-black">Approval Bhejo</button></div>}
          {tab==='approved' && <div className="mt-3">{insideList.map(v=><div key={v.id} className="p-2 border-b flex justify-between text-sm"><span>{v.visitor_name} → {v.flat_no}</span><button onClick={()=>markExit(v.id)} className="bg-black text-white px-3 py-1 rounded-full text-xs">Exit</button></div>)}</div>}
        </div>
      </div>
    </div>
  )
}

export default function GuardPage(){
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">Loading Gate...</div>}>
      <GuardInner/>
    </Suspense>
  )
}
