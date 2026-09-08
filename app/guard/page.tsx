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

  // Flat search -> Supabase se real resident nikalo
  useEffect(()=>{
    const fetchResident = async () => {
      if(flat.length < 3) return
      const { data } = await supabase.from('residents').select('*').eq('flat_no', flat.toUpperCase()).single()
      if(data) setResident(data)
    }
    const t = setTimeout(fetchResident, 500)
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
      const { error } = await supabase.storage.from('visitor-photos').upload(fileName, photo)
      if(!error){
        const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
        photoUrl = data.publicUrl
      }
    }

    const { data, error } = await supabase.from('visitors').insert({
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
      // Form clear
      setVisitor(''); setMobile(''); setVehicle(''); setPhoto(null); setPhotoPreview('')
      alert(`Request Bhej Diya! ${resident?.name || flat} ko approval message gaya hai.`)
    } else {
      alert('Error: ' + error?.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black flex flex-col">
      {/* TOP BAR */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B1120] flex items-center justify-center font-bold text-[#D4AF37]">A</div>
          <div>
            <div className="font-bold text-sm leading-none">Arihant Anchal</div>
            <div className="text- text-black/50">Gate 1 • On Duty</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text- font-bold">● LIVE</span>
          <Link href="/" className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center">⌂</Link>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#0B1120] text-white text-xs">127 Visitors Today</div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#FEF9C3] text-black text-xs">Realtime Approval</div>
        </div>

        {/* 6 ACTION GRID */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={()=>{setTab('entry'); setShowQR(false)}} className="h-24 rounded-2xl bg-[#0B1120] text-white flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">👤</span><span className="text-xs font-bold tracking-wider">VISITOR ENTRY</span>
          </button>
          <button className="h-24 rounded-2xl bg-white border border-black/5 shadow-sm flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">📦</span><span className="text-xs font-bold">DELIVERY ENTRY</span>
          </button>
          <button onClick={()=>setTab('approved')} className="h-24 rounded-2xl bg-[#D4AF37] text-black flex flex-col items-center justify-center gap-1.5 shadow">
            <span className="text-xl">✅</span><span className="text-xs font-bold">PRE-APPROVED</span>
          </button>
          <button className="h-24 rounded-2xl bg-white border border-black/5 shadow-sm flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">🚗</span><span className="text-xs font-bold">VEHICLE ENTRY</span>
          </button>
          <button onClick={()=>setTab('exit')} className="h-24 rounded-2xl bg-[#F1F5F9] border border-black/5 flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">↩</span><span className="text-xs font-bold">VISITOR EXIT</span>
          </button>
          <button className="h-24 rounded-2xl bg-[#DC2626] text-white flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl">🚨</span><span className="text-xs font-bold">EMERGENCY</span>
          </button>
        </div>

        {/* FLAT SEARCH */}
        <div className="mt-5 p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Flat Search • Quick resident lookup</div>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30">⌕</span>
              <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h-11 rounded-xl bg-[#F8FAFC] border border-black/5 pl-9 pr-3 text-sm font-medium outline-none focus:border-[#D4AF37]" placeholder="B-302" />
            </div>
          </div>

          {/* Real Resident Result */}
          <div className="mt-3 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex gap-2">
            <div className="w-9 h-9 rounded-full bg-[#0B1120] text-white flex items-center justify-center text-xs font-bold">{resident? resident.name?.[0] : '?'}</div>
            <div className="text-xs leading-tight">
              <div className="font-bold">{flat.toUpperCase()} • {resident? `${resident.name} • Owner` : 'Searching...'}</div>
              <div className="text-black/60 mt-0.5">{resident? `${resident.mobile} • Intercom ${flat.split('-')[1]}` : 'Flat nahi mila to Supabase me add karo'}</div>
            </div>
          </div>

          <div className="mt-4 flex p-1 rounded-full bg-[#F1F5F9]">
            <button onClick={()=>setTab('entry')} className={`flex-1 h-8 rounded-full text-xs font-medium ${tab==='entry'?'bg-white shadow text-black':'text-black/50'}`}>New Entry</button>
            <button onClick={()=>setTab('approved')} className={`flex-1 h-8 rounded-full text-xs font-medium ${tab==='approved'?'bg-white shadow text-black':'text-black/50'}`}>Approved</button>
            <button onClick={()=>setTab('exit')} className={`flex-1 h-8 rounded-full text-xs font-medium ${tab==='exit'?'bg-white shadow text-black':'text-black/50'}`}>Exit</button>
          </div>

          {tab==='entry' && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h-12 rounded-xl bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none focus:border-[#D4AF37]" />
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" className="w-full h-12 rounded-xl bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none" />
              <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle No - RJ14 AB 1234" className="w-full h-12 rounded-xl bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={purpose} onChange={e=>setPurpose(e.target.value)} className="h-12 rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text-sm">
                  <option>Meeting</option><option>Delivery</option><option>Guest</option><option>Service</option>
                </select>
                <label className="h-12 rounded-xl border border-dashed border-black/20 px-3 text-sm flex items-center justify-center cursor-pointer bg-[#F8FAFC]">
                  {photoPreview? <img src={photoPreview} className="h-8 w-8 rounded object-cover" /> : '📷 Photo *'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
              <button onClick={handleApproveAndSend} disabled={loading} className="w-full h-12 rounded-full bg-[#0B1120] text-white font-bold text-sm active:scale-[0.98]">
                {loading? 'Sending...' : 'Approve & Send to Resident →'}
              </button>
              <div className="text-center text- text-black/40">Resident ko app me approval message jayega</div>
            </div>
          )}

          {tab==='approved' && (
            <div className="mt-4 text-xs text-center text-black/50">Resident jab Approve karega tab yaha Approved list me aayega</div>
          )}
        </div>
      </div>

      {/* QR SHEET */}
      {showQR && lastPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0" onClick={()=>setShowQR(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-4" />
            <div className="text-center">
              <div className="text-xs font-bold tracking-widest">VISITOR PASS - PENDING APPROVAL</div>
              <div className="text-xs text-black/50 mt-1">{lastPass.flat_no} • {lastPass.name} • Waiting for Resident</div>
              <div className="mt-5 mx-auto w-64 h-64 rounded-2xl bg-[#0B1120] p-3">
                <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-2">
                  {lastPass.photo_url && <img src={lastPass.photo_url} className="w-20 h-20 rounded-full object-cover mb-2" />}
                  <div className="text- font-bold">PENDING: {lastPass.name}</div>
                  <div className="text-">{lastPass.mobile} • {lastPass.vehicle_no}</div>
                  <div className="mt-2 text- bg-yellow-100 px-2 py-1 rounded-full">⏳ Waiting for Resident Approval</div>
                </div>
              </div>
              <button onClick={()=>setShowQR(false)} className="mt-5 w-full h-12 rounded-full bg-[#F1F5F9] text-sm">Close - Approval ka wait karo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
