'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ResidentRegister(){
  const [form, setForm] = useState({flat_no:'', name:'', mobile:'', role:'owner', password:''})
  const [photo, setPhoto] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async ()=>{
    if(!form.flat_no ||!form.name ||!form.mobile) return alert('Flat, Name, Mobile bharo')
    setLoading(true)

    // Check flat pehle se approved hai kya
    const { data: existing } = await supabase.from('residents').select('*').eq('flat_no', form.flat_no.toUpperCase()).eq('status','approved').maybeSingle()
    if(existing){
      setLoading(false)
      return alert(`❌ ${form.flat_no} par pehle se ${existing.name} registered hai. Admin se contact karo.`)
    }

    let photoUrl = ''
    if(photo){
      const fileName = `resident_${Date.now()}_${photo.name}`
      await supabase.storage.from('visitor-photos').upload(fileName, photo)
      const { data } = supabase.storage.from('visitor-photos').getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }

    const { error } = await supabase.from('residents').insert({
      flat_no: form.flat_no.toUpperCase(),
      name: form.name,
      mobile: form.mobile,
      role: form.role,
      photo_url: photoUrl,
      status: 'pending' // Admin approve karega
    })

    setLoading(false)
    if(error) alert(error.message)
    else {
      alert(`✅ Registration Sent!\nFlat ${form.flat_no.toUpperCase()} ka request Admin ko gaya hai.\nAdmin approval ke baad login kar payoge.`)
      setForm({flat_no:'', name:'', mobile:'', role:'owner', password:''})
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded- border shadow-sm p-6">
        <div className="font-bold text-lg">🏠 New Resident Registration</div>
        <div className="text-xs text-slate-500 mt-1">Flat No select karo → Admin approval → Tabhi access milega</div>

        <div className="mt-5 space-y-3">
          <input value={form.flat_no} onChange={e=>setForm({...form, flat_no:e.target.value})} placeholder="Flat No ex: B-302 *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
          <input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} placeholder="Mobile No *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-3 text-sm">
            <option value="owner">Owner</option><option value="tenant">Tenant</option><option value="family">Family Member</option>
          </select>
          <label className="h-12 rounded-2xl border border-dashed flex items-center justify-center bg-slate-50 text-sm cursor-pointer">
            {photo? photo.name : '📷 Photo Upload'} <input type="file" accept="image/*" className="hidden" onChange={e=>setPhoto(e.target.files?.[0]||null)}/>
          </label>

          <button onClick={handleRegister} disabled={loading} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm">
            {loading? 'Sending...' : '📩 Admin ko Approval ke liye Bhejo'}
          </button>

          <Link href="/resident" className="block text-center text-xs text-slate-500 mt-2">Already registered? Login</Link>
        </div>
      </div>
    </div>
  )
}
