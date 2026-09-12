'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage(){
  const [flats, setFlats] = useState<string[]>([])
  const [form, setForm] = useState({flat_no:'', name:'', mobile:'', password:'', confirm_password:'', role:'owner', family_size:'1'})
  const [photo, setPhoto] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(()=>{
    const load = async ()=>{
      const all: string[] = []
      for(let b of ['A','B','C','D']){
        for(let i=101;i<=110;i++) all.push(`${b}-${i}`)
      }
      for(let i=301;i<=310;i++) all.push(`B-${i}`)
      const { data } = await supabase.from('residents').select('flat_no').eq('status','approved')
      const approvedSet = new Set((data||[]).map((r:any)=>r.flat_no))
      setFlats(all.filter(f=>!approvedSet.has(f)))
    }
    load()
  },[])

  useEffect(()=>{
    if(photo){
      const u=URL.createObjectURL(photo)
      setPreview(u)
      return ()=>URL.revokeObjectURL(u)
    }
  },[photo])

  const register = async ()=>{
    if(!form.flat_no) return alert('Flat select karo')
    if(!form.name ||!form.mobile ||!form.password) return alert('Name/Mobile/Password bharo')
    if(form.mobile.length!==10) return alert('10 digit mobile')
    if(form.password.length<4) return alert('Password min 4 digit')
    if(form.password!==form.confirm_password) return alert('Confirm password match nahi')

    setLoading(true)
    const { data: ex } = await supabase.from('residents').select('id').eq('flat_no',form.flat_no).eq('status','approved').maybeSingle()
    if(ex){ setLoading(false); return alert(`${form.flat_no} already approved hai`) }

    let photoUrl:any = null
    if(photo){
      try{
        const name=`resident_${form.flat_no}_${Date.now()}.jpg`
        await supabase.storage.from('visitor-photos').upload(name, photo)
        const { data } = supabase.storage.from('visitor-photos').getPublicUrl(name)
        photoUrl=data.publicUrl
      }catch{}
    }

    const { error } = await supabase.from('residents').insert({
      flat_no: form.flat_no,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      password: form.password.trim(),
      role: form.role,
      family_size: form.family_size,
      photo_url: photoUrl,
      status: 'pending'
    })

    setLoading(false)
    if(error) alert(error.message)
    else setSuccess(true)
  }

  if(success){
    return(
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded- p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-3xl">✅</div>
          <div className="mt-4 font-bold text-xl">Registration Sent!</div>
          <div className="text-sm text-slate-500 mt-2">Flat {form.flat_no} Admin approval par hai</div>
          <button onClick={()=>{ window.location.href=`/?flat=${form.flat_no}` }} className="mt-6 w-full h-12 rounded-full bg-amber-400 text-black font-bold">🔐 Login Page → Approval Check</button>
        </div>
      </div>
    )
  }

  return(
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="h-14 px-4 flex items-center justify-between bg-[#141414] border-b border-white/10">
        <Link href="/" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">←</Link>
        <div className="font-bold text-sm">NEW RESIDENT • FLAT + PASSWORD</div>
        <div className="px-3 py-1 rounded-full bg-amber-400 text-black text- font-bold">LIVE</div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto bg-white text-black rounded- p-5 space-y-4 shadow-2xl">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded- bg-slate-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
              {preview? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : '👤'}
            </div>
            <label className="px-4 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center cursor-pointer">
              📷 Upload
              <input type="file" accept="image/*" className="hidden" onChange={e=>setPhoto(e.target.files?.[0]||null)} />
            </label>
          </div>

          <div>
            <div className="text- font-bold text-slate-500 mb-2">FLAT NO *</div>
            <select value={form.flat_no} onChange={e=>setForm({...form, flat_no:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 font-bold text-sm">
              <option value="">Flat Select</option>
              {flats.map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          <input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} placeholder="10 digit mobile *" maxLength={10} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password * (min 4)" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          <input type="password" value={form.confirm_password} onChange={e=>setForm({...form, confirm_password:e.target.value})} placeholder="Confirm Password *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>

          <button onClick={register} disabled={loading} className="w-full h-12 rounded-full bg-amber-400 text-black font-bold text-sm">
            {loading?'Sending...':'📩 Admin Approval ke liye Bhejo'}
          </button>
        </div>
      </div>
    </div>
  )
}
