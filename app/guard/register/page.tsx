'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function GuardRegister(){
  const [form,setForm]=useState({name:'',mobile:'',password:'',gate_no:'1',shift:'Day'})
  const [photo,setPhoto]=useState<File|null>(null)
  const [idProof,setIdProof]=useState<File|null>(null)
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')

  const uploadFile = async (file:File, prefix:string)=>{
    const fileName = `${prefix}_${Date.now()}_${file.name.replace(/\s/g,'_')}`
    const { data, error } = await supabase.storage.from('guard-photos').upload(fileName, file)
    if(error) throw error
    const { data: urlData } = supabase.storage.from('guard-photos').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const submit = async()=>{
    if(!form.name ||!form.mobile ||!form.password) return setMsg('❌ Name/Mobile/Password bharo')
    if(form.mobile.length!=10) return setMsg('❌ 10 digit mobile')
    if(!photo) return setMsg('❌ Photo zaruri hai')
    if(!idProof) return setMsg('❌ ID Proof zaruri hai')

    setLoading(true); setMsg('Checking gate capacity...')

    // 
    const gateNo = parseInt(form.gate_no)
    const { data: existing, error: countErr } = await supabase.from('guards').select('id').eq('gate_no', gateNo).neq('status','rejected')
    if(countErr){ setLoading(false); return setMsg('❌ '+countErr.message) }
    if(existing && existing.length >= 3){
      setLoading(false)
      return setMsg(`❌ Gate ${gateNo} par already 3 guards hain (Pending+Approved). Naya register nahi ho sakta.`)
    }

    try{
      setMsg('Photo upload ho raha hai...')
      const photoUrl = await uploadFile(photo,'photo')
      setMsg('ID Proof upload ho raha hai...')
      const idProofUrl = await uploadFile(idProof,'idproof')

      const guard_id = 'G-'+gateNo+'-'+Date.now().toString().slice(-6)

      const { error } = await supabase.from('guards').insert({
        guard_id,
        name: form.name,
        mobile: form.mobile,
        password: form.password,
        gate_no: gateNo,
        shift: form.shift,
        salary_per_day: 500,
        photo_url: photoUrl,
        id_proof_url: idProofUrl,
        status: 'pending'
      })

      if(error) throw error

      setMsg(`✅ Registered! Guard ID: ${guard_id} | Gate ${gateNo} | Status: Pending Approval`)
      setForm({name:'',mobile:'',password:'',gate_no:'1',shift:'Day'})
      setPhoto(null); setIdProof(null)
    }catch(e:any){
      setMsg('❌ Error: '+e.message)
    }
    setLoading(false)
  }

  return(
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      <header className="max-w-7xl mx-auto px-6 h- flex items-center justify-between border-b border-white/10">
        <Link href="/" className="text-[#D4AF37] text-sm">← Back to Home</Link>
        <div className="font-bold text-sm">Guard Registration <span className="text-white/40 font-normal"></span></div>
        <Link href="/guard" className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Guard Login</Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text- font-bold leading-tight">Guard Registration at <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
        <p className="text-white/50 text-sm mt-2">Gate 1-5 ke liye max 3 guards. Photo + ID Proof ke saath registration → Pending Approval</p>

        <div className="mt-6 bg-[#151A27] border border-white/10 rounded- p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text- tracking-widest text-white/40">GUARD NAME *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ram Singh" className="mt-2 w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-[#D4AF37]/50"/>
            </div>
            <div>
              <label className="text- tracking-widest text-white/40">MOBILE (10 DIGIT) *</label>
              <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="9876543210" maxLength={10} className="mt-2 w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm outline-none"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text- tracking-widest text-white/40">PASSWORD *</label>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="1234" className="mt-2 w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm outline-none"/>
            </div>
            <div>
              <label className="text- tracking-widest text-white/40">GATE NO (1-5) *</label>
              <select value={form.gate_no} onChange={e=>setForm({...form,gate_no:e.target.value})} className="mt-2 w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm outline-none">
                <option className="text-black" value="1">Gate 1 - Main</option>
                <option className="text-black" value="2">Gate 2</option>
                <option className="text-black" value="3">Gate 3</option>
                <option className="text-black" value="4">Gate 4</option>
                <option className="text-black" value="5">Gate 5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text- tracking-widest text-white/40">SHIFT *</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Day','Night','Rotational'].map(s=>(
                <button key={s} onClick={()=>setForm({...form,shift:s})} className={`h-12 rounded-2xl border text-sm font-medium ${form.shift===s?'bg-[#D4AF37] text-black border-[#D4AF37]':'bg-white/5 border-white/10 text-white/60'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text- tracking-widest text-white/40">PHOTO *</label>
              <input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)} className="mt-2 w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-xs file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-[#D4AF37] file:text-black file:text- file:font-bold"/>
              {photo && <p className="text- text-[#D4AF37] mt-1 truncate">{photo.name}</p>}
            </div>
            <div>
              <label className="text- tracking-widest text-white/40">ID PROOF (Aadhaar) *</label>
              <input type="file" accept="image/*,.pdf" onChange={e=>setIdProof(e.target.files?.[0]||null)} className="mt-2 w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-xs file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-white/10 file:text-white file:text-"/>
              {idProof && <p className="text- text-white/60 mt-1 truncate">{idProof.name}</p>}
            </div>
          </div>

          {msg && <div className={`rounded-xl p-3 text- border ${msg.startsWith('✅')?'bg-green-500/10 border-green-500/20 text-green-300':'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]'}`}>{msg}</div>}

          <button onClick={submit} disabled={loading} className="w-full h-12 rounded-full bg-[#D4AF37] text-black font-bold text-sm disabled:opacity-50">
            {loading?'Processing...':'Register → Status Pending'}
          </button>

          <p className="text-center text- text-white/30">Gate {form.gate_no} par 3 se zyada register nahi hoga • Admin approval ke baad login active</p>
        </div>
      </div>
    </div>
  )
}
