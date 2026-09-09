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

  useEffect(()=>{
    const fetchResident = async () => {
      if(flat.length < 3) return
      const { data } = await supabase.from('residents').select('*').eq('flat_no', flat.toUpperCase()).maybeSingle()
      setResident(data || null)
    }
    const t = setTimeout(fetchResident, 400)
    return ()=>clearTimeout(t)
  }, [flat])

  const handlePhoto = (e:any) => {
    const file = e.target.files?.[0]
    if(file){
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleApproveAndSend = async () => {
    if(!visitor ||!mobile ||!flat) return alert('Visitor Name, Mobile, Flat bharo')
    setLoading(true)
    let photoUrl = ''
    if(photo){
      const fileName = `visitor_${Date.now()}_${photo.name}`
      await supabase.storage.from('visitor-photos').upload(fileName, photo)
      const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }

    // FIXED: visitor_name + name dono bhej rahe hain taaki admin + guard dono me dikhe
    const { data, error } = await supabase.from('visitors').insert({
      visitor_name: visitor,
      name: visitor,
      mobile: mobile,
      vehicle_no: vehicle,
      flat_no: flat.toUpperCase(),
      resident_flat: flat.toUpperCase(),
      purpose: purpose,
      photo_url: photoUrl,
      guard_id: 'Gate 1',
      status: 'pending'
    }).select().single()

    setLoading(false)
    if(!error && data){
      setLastPass(data)
      setShowQR(true)
      setVisitor(''); setMobile(''); setVehicle(''); setPhoto(null); setPhotoPreview('')
    } else {
      alert('Error: ' + error?.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col">
      {/* TOP BAR - ROUND */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-amber-300">A</div>
          <div>
            <div className="font-bold text-sm leading-none">Arihant Anchal</div>
            <div className="text- text-slate-500">Gate 1 • On Duty</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text- font-bold border border-emerald-200">● LIVE</span>
          <Link href="/" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">⌂</Link>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <div className="flex gap-2 overflow-x-auto">
          <div className="shrink-0 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">127 Visitors Today</div>
          <div className="shrink-0 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">Realtime Approval</div>
        </div>

        {/* 6 ACTION GRID - ROUND + LIGHT COLORS */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={()=>{setTab('entry'); setShowQR(false)}} className="h-24 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center gap-1.5 shadow-sm">
            <span className="text-xl">👤</span><span className="text-xs font-bold tracking-wider">VISITOR ENTRY</span>
          </button>
          <button className="h-24 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">📦</span><span className="text-xs font-bold">DELIVERY ENTRY</span>
          </button>
          <button onClick={()=>setTab('approved')} className="h-24 rounded-3xl bg-amber-100 border border-amber-200 text-amber-900 flex flex-col items-center justify-center gap-1.5 shadow-sm">
            <span className="text-xl">✅</span><span className="text-xs font-bold">PRE-APPROVED</span>
          </button>
          <button className="h-24 rounded-3xl bg-cyan-50 border border-cyan-100 flex flex-col items-center justify-center gap-1.5 shadow-sm">
            <span className="text-xl">🚗</span><span className="text-xs font-bold">VEHICLE ENTRY</span>
          </button>
          <button onClick={()=>setTab('exit')} className="h-24 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">↩</span><span className="text-xs font-bold">VISITOR EXIT</span>
          </button>
          <button className="h-24 rounded-3xl bg-red-50 border border-red-100 text-red-700 flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">🚨</span><span className="text-xs font-bold">EMERGENCY</span>
          </button>
        </div>

        {/* FLAT SEARCH - ROUND 3XL */}
        <div className="mt-5 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="text-sm font-bold">Flat Search • Quick resident lookup</div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 pl-10 pr-3 text-sm font-medium outline-none focus:border-amber-300 focus:bg-amber-50/50" placeholder="B-302" />
            </div>
          </div>

          <div className={`mt-3 p-3 rounded-2xl border flex gap-2.5 ${resident?'bg-emerald-50 border-emerald-100':'bg-amber-50 border-amber-100'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${resident?'bg-emerald-600 text-white':'bg-slate-900 text-white'}`}>{resident? resident.name?.[0] : '?'}</div>
            <div className="text-xs leading-tight">
              <div className="font-bold">{flat.toUpperCase()} • {resident? `${resident.name} • Owner` : 'Searching...'}</div>
              <div className="text-slate-600 mt-0.5">{resident? `${resident.mobile} • Intercom ${flat.split('-')[1]}` : 'Flat nahi mila to Supabase me add karo'}</div>
            </div>
          </div>

          <div className="mt-4 flex p-1 rounded-full bg-slate-100">
            <button onClick={()=>setTab('entry')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='entry'?'bg-white shadow text-slate-900':'text-slate-500'}`}>New Entry</button>
            <button onClick={()=>setTab('approved')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='approved'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Approved</button>
            <button onClick={()=>setTab('exit')} className={`flex-1 h-9 rounded-full text-xs font-bold ${tab==='exit'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Exit</button>
          </div>

          {tab==='entry' && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none focus:border-amber-300" />
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle No - RJ14 AB 1234" className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={purpose} onChange={e=>setPurpose(e.target.value)} className="h-12 rounded-2xl bg-slate-50 border border-slate-100 px-3 text-sm">
                  <option>Meeting</option><option>Delivery</option><option>Guest</option><option>Service</option>
                </select>
                <label className="h-12 rounded-2xl border border-dashed border-slate-200 px-3 text-sm flex items-center justify-center cursor-pointer bg-slate-50 overflow-hidden">
                  {photoPreview? <img src={photoPreview} className="h-10 w-10 rounded-xl object-cover" /> : '📷 Photo *'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm active:scale-[0.98] shadow">
                {loading? 'Sending...' : 'Approve & Send to Resident →'}
              </button>
              <div className="text-center text- text-slate-400">Resident ko app me approval message jayega</div>
            </div>
          )}
        </div>
      </div>

      {showQR && lastPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={()=>setShowQR(false)}>
          <div className="w-full max-w-md bg-white rounded-t- p-6 pb-10 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="text-center">
              <div className="text-xs font-bold tracking-widest">VISITOR PASS - PENDING APPROVAL</div>
              <div className="text-xs text-slate-500 mt-1">{lastPass.flat_no} • {lastPass.visitor_name || lastPass.name}</div>
              <div className="mt-5 mx-auto w-64 h-64 rounded-3xl bg-slate-900 p-3">
                <div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center p-3">
                  {lastPass.photo_url && <img src={lastPass.photo_url} className="w-20 h-20 rounded-2xl object-cover mb-2" />}
                  <div className="text-sm font-bold">{lastPass.visitor_name || lastPass.name}</div>
                  <div className="text-xs text-slate-500">{lastPass.mobile} {lastPass.vehicle_no && `• ${lastPass.vehicle_no}`}</div>
                  <div className="mt-2 text-xs bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1 rounded-full font-bold">⏳ Waiting for Resident Approval</div>
                </div>
              </div>
              <button onClick={()=>setShowQR(false)} className="mt-6 w-full h-12 rounded-full bg-slate-100 text-sm font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
