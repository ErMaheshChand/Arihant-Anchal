'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewResidentRegister(){
  const [flats, setFlats] = useState<any[]>([])
  const [form, setForm] = useState({flat_no:'', name:'', mobile:'', role:'owner', family_size:'1'})
  const [photo, setPhoto] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Available flats (jisme approved nahi hai)
  useEffect(()=>{
    const loadFlats = async ()=>{
      // All flats list - aapke project ke hisab se B-101 to D-... tak
      const allFlats = []
      for(let block of ['A','B','C','D']){
        for(let i=101;i<=110;i++) allFlats.push(`${block}-${i}`)
      }
      // Jo approved hai wo hatao
      const { data: approved } = await supabase.from('residents').select('flat_no').eq('status','approved')
      const approvedSet = new Set((approved||[]).map((r:any)=>r.flat_no))
      const available = allFlats.filter(f=>!approvedSet.has(f))
      setFlats(available)
    }
    loadFlats()
  },[])

  useEffect(()=>{
    if(photo){
      const url = URL.createObjectURL(photo)
      setPreview(url)
      return ()=> URL.revokeObjectURL(url)
    }
  },[photo])

  const handleRegister = async ()=>{
    if(!form.flat_no) return alert('Flat Select karo')
    if(!form.name ||!form.mobile) return alert('Name + Mobile bharo')
    if(form.mobile.length!==10) return alert('10 digit mobile daalo')

    setLoading(true)

    // Double check flat already approved?
    const { data: existing } = await supabase.from('residents').select('id').eq('flat_no', form.flat_no).eq('status','approved').maybeSingle()
    if(existing){
      setLoading(false)
      return alert(`❌ ${form.flat_no} par pehle se owner registered hai`)
    }

    let photoUrl = ''
    if(photo){
      const fileName = `resident_${form.flat_no}_${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage.from('visitor-photos').upload(fileName, photo)
      if(!upErr){
        const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
        photoUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('residents').insert({
      flat_no: form.flat_no,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      role: form.role,
      family_size: form.family_size,
      photo_url: photoUrl,
      status: 'pending'
    })

    setLoading(false)
    if(error){
      alert('Error: '+error.message)
    }else{
      setSuccess(true)
    }
  }

  if(success){
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded- border p-8 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mx-auto">✅</div>
          <div className="mt-4 font-bold text-xl">Request Sent!</div>
          <div className="text-sm text-slate-500 mt-2">Flat <b>{form.flat_no}</b> ka registration Admin ko gaya hai.<br/>Approval ke baad aap login kar payoge.</div>
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-left">
            <div className="font-bold">📋 Aage kya hoga?</div>
            <div className="mt-1">1. Admin aapki details check karega</div>
            <div>2. Status <b>pending → approved</b> karega</div>
            <div>3. Tabhi aap Landing Page se login kar payoge</div>
          </div>
          <Link href="/" className="mt-6 w-full h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">🏠 Landing Page par Jao</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* GUARD PAGE JAISA HEADER */}
      <div className="shrink-0 h-14 px-4 flex items-center justify-between bg-[#141414] border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">←</Link>
          <div>
            <div className="font-bold text-sm tracking-wide">NEW RESIDENT REGISTRATION</div>
            <div className="text- text-white/50">Flat Select • Pending → Admin Approval → Approved</div>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-400 text-black text- font-bold">● LIVE</div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto">
          {/* GUARD CARD JAISA DESIGN */}
          <div className="bg-white text-black rounded- border shadow-2xl overflow-hidden">
            <div className="p-5 border-b bg-slate-50/50">
              <div className="font-bold text- tracking-wide">🏠 FLAT SELECT + REGISTRATION</div>
              <div className="text- text-slate-500 mt-1">Guard page ke jaisa design • Same inputs</div>
            </div>

            <div className="p-5 space-y-4">
              {/* PHOTO - GUARD JAISA */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded- bg-slate-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                  {preview? <img src={preview} className="w-full h-full object-cover"/> : <span className="text-2xl">👤</span>}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">Resident Photo</div>
                  <div className="text- text-slate-500">Guard page jaisa upload</div>
                  <label className="mt-2 inline-flex px-4 h-8 rounded-full bg-slate-900 text-white text-xs font-bold items-center cursor-pointer">
                    📷 Upload <input type="file" accept="image/*" className="hidden" onChange={e=>setPhoto(e.target.files?.[0]||null)}/>
                  </label>
                </div>
              </div>

              {/* FLAT SELECT - SEARCH + DROPDOWN GUARD STYLE */}
              <div>
                <div className="text- font-bold tracking-wide text-slate-500 mb-2">FLAT NO * (Available Only)</div>
                <select value={form.flat_no} onChange={e=>setForm({...form, flat_no:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold">
                  <option value="">— Flat Select Karo —</option>
                  {flats.map(f=><option key={f} value={f}>{f} — Available</option>)}
                </select>
                <div className="text- text-slate-400 mt-1">{flats.length} flats available • Approved wale list me nahi dikhenge</div>
              </div>

              <div>
                <div className="text- font-bold tracking-wide text-slate-500 mb-2">FULL NAME *</div>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Ex: Mahesh Chand" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
              </div>

              <div>
                <div className="text- font-bold tracking-wide text-slate-500 mb-2">MOBILE NO *</div>
                <input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} placeholder="10 digit mobile" maxLength={10} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text- font-bold tracking-wide text-slate-500 mb-2">ROLE</div>
                  <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
                    <option value="owner">Owner</option><option value="tenant">Tenant</option><option value="family">Family</option>
                  </select>
                </div>
                <div>
                  <div className="text- font-bold tracking-wide text-slate-500 mb-2">FAMILY SIZE</div>
                  <select value={form.family_size} onChange={e=>setForm({...form, family_size:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5+">5+</option>
                  </select>
                </div>
              </div>

              {/* STATUS FLOW */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center gap-2 text-">
                <span className="px-2 py-1 rounded-full bg-white/20">1. Flat Select</span><span>→</span>
                <span className="px-2 py-1 rounded-full bg-amber-400 text-black font-bold">2. Pending</span><span>→</span>
                <span className="px-2 py-1 rounded-full bg-white/20">3. Approved</span>
              </div>

              <button onClick={handleRegister} disabled={loading} className="w-full h-12 rounded-full bg-amber-400 text-black font-bold text-sm shadow-lg disabled:opacity-50">
                {loading? '⏳ Sending to Admin...' : '📩 Admin Approval ke liye Bhejo'}
              </button>

              <div className="text- text-center text-slate-400">Approval ke baad hi Landing Page se login hoga</div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-3xl bg-white/5 border border-white/10 text- text-white/60">
            <div className="font-bold text-white">📌 Security Note (Guard Design):</div>
            <div className="mt-1">• Ek flat par ek hi approved resident</div>
            <div>• Photo + Mobile verification</div>
            <div>• Admin panel me jaake approve karna hoga</div>
          </div>
        </div>
      </div>
    </div>
  )
}
