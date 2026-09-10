'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function GuardRegister(){
  const router = useRouter()
  const [form, setForm] = useState({gate:'1', name:'', mobile:'', pass:''})
  const [photo, setPhoto] = useState<File|null>(null)
  const [proof, setProof] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if(!form.name ||!form.mobile ||!form.pass) return alert('Name + Mobile + Password bharo')
    setLoading(true)
    try{
      let pUrl = '', proofUrl = ''
      if(photo){
        const fName = `guard_${Date.now()}_${photo.name}`
        await supabase.storage.from('guard-photos').upload(fName, photo)
        pUrl = supabase.storage.from('guard-photos').getPublicUrl(fName).data.publicUrl
      }
      if(proof){
        const fName = `guard_id_${Date.now()}_${proof.name}`
        await supabase.storage.from('guard-photos').upload(fName, proof)
        proofUrl = supabase.storage.from('guard-photos').getPublicUrl(fName).data.publicUrl
      }

      const gid = `G-${form.gate}-${Math.floor(100000 + Math.random()*900000)}`

      // ✅ YAHI FIX HAI - full_name SIRF 1 BAAR
      const { error } = await supabase.from('guards').insert({
        guard_id: gid,
        gate_no: parseInt(form.gate),
        full_name: form.name,
        mobile: form.mobile,
        password: form.pass,
        photo_url: pUrl,
        id_proof_url: proofUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      })

      if(error) throw error

      alert(`✅ Registered! Aapki ID: ${gid} - Admin approval ke baad login kar sakoge`)
      router.push(`/guard/login?gate=${form.gate}`)
    }catch(e:any){
      alert(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 border shadow-sm">
        <h1 className="font-black text-xl text-center">🛡 Guard Registration</h1>
        <div className="mt-6 space-y-3">
          <select value={form.gate} onChange={e=>setForm({...form, gate:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold">
            <option value="1">Gate 1</option>
            <option value="2">Gate 2</option>
            <option value="3">Gate 3</option>
            <option value="4">Gate 4</option>
            <option value="5">Gate 5</option>
          </select>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full Name *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
          <input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} placeholder="Mobile No *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
          <input type="password" value={form.pass} onChange={e=>setForm({...form, pass:e.target.value})} placeholder="Password *" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm"/>
          <label className="w-full h-12 rounded-2xl border border-dashed flex items-center justify-center text-sm cursor-pointer">📷 Photo <input type="file" className="hidden" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>
          <label className="w-full h-12 rounded-2xl border border-dashed flex items-center justify-center text-sm cursor-pointer">🪪 ID Proof <input type="file" className="hidden" onChange={e=>setProof(e.target.files?.[0]||null)}/></label>
          <button onClick={handleRegister} disabled={loading} className="w-full h-12 rounded-full bg-black text-white font-bold text-sm">{loading?'Register ho raha...':'Register Karo'}</button>
        </div>
      </div>
    </div>
  )
}
