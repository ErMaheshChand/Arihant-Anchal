'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GuardRegisterLight(){
  const [form,setForm]=useState({name:'',mobile:'',password:'',gate_no:'1',shift:'Day'})
  const [photo,setPhoto]=useState<File|null>(null)
  const [idProof,setIdProof]=useState<File|null>(null)
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')

  const submit=async()=>{
    if(!form.name||!form.mobile||!form.password) return setMsg('❌ All fields required')
    if(!photo||!idProof) return setMsg('❌ Photo & ID required')
    setLoading(true)
    try{
      const { data: ex } = await supabase.from('guards').select('id').eq('gate_no',parseInt(form.gate_no)).neq('status','rejected')
      if(ex && ex.length>=3) throw new Error(`Gate ${form.gate_no} full - 3 guards already`)

      const upload = async(f:File,p:string)=>{
        const name=`${p}_${Date.now()}_${f.name}`
        const { error } = await supabase.storage.from('guard-photos').upload(name,f)
        if(error) throw error
        return supabase.storage.from('guard-photos').getPublicUrl(name).data.publicUrl
      }
      const photoUrl = await upload(photo,'photo')
      const idUrl = await upload(idProof,'idproof')
      const guard_id=`G-${form.gate_no}-${Date.now().toString().slice(-6)}`
      const { error } = await supabase.from('guards').insert({guard_id,name:form.name,mobile:form.mobile,password:form.password,gate_no:parseInt(form.gate_no),shift:form.shift,salary_per_day:500,photo_url:photoUrl,id_proof_url:idUrl,status:'pending'})
      if(error) throw error
      setMsg(`✅ Registered! ID: ${guard_id} - Pending Approval`)
      setForm({name:'',mobile:'',password:'',gate_no:'1',shift:'Day'})
    }catch(e:any){ setMsg('❌ '+e.message) }
    setLoading(false)
  }

  return(
    <div className="min-h-screen bg-[#FAFAFB] p-4 md:p-8">
      <div className="max-w- mx-auto">
        <h1 className="text- font-bold">Guard Registration at <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
        <p className="text- text-black/50 mt-1">Gate 1-5 ke liye max 3 guards. Photo + ID Proof ke saath registration → Pending Approval</p>

        <div className="mt-5 bg-white rounded- border border-black/5 shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="text- tracking-widest text-black/40">GUARD NAME *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ram Singh" className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none focus:border-amber-200"/></div>
            <div><label className="text- tracking-widest text-black/40">MOBILE (10 DIGIT) *</label><input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="9876543210" className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none"/></div>
            <div><label className="text- tracking-widest text-black/40">PASSWORD *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="1234" className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none"/></div>
            <div><label className="text- tracking-widest text-black/40">GATE NO (1-5) *</label><select value={form.gate_no} onChange={e=>setForm({...form,gate_no:e.target.value})} className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none"><option value="1">Gate 1 - Main</option><option value="2">Gate 2</option><option value="3">Gate 3</option><option value="4">Gate 4</option><option value="5">Gate 5</option></select></div>
          </div>

          <div className="mt-5"><label className="text- tracking-widest text-black/40">SHIFT *</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Day','Night','Rotational'].map(s=><button key={s} onClick={()=>setForm({...form,shift:s})} className={`h-12 rounded- border text-sm font-bold ${form.shift===s?'bg-[#FEF3C7] border-amber-200 text-black':'bg-[#F8FAFC] border-black/5 text-black/40'}`}>{s}</button>)}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="text- tracking-widest text-black/40">PHOTO *</label><div className="mt-2 flex items-center gap-3 h-12 rounded- bg-[#F8FAFC] border border-black/5 px-3"><label className="h-7 px-4 rounded-full bg-white border text- font-bold flex items-center cursor-pointer"><input type="file" hidden accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)}/>Choose File</label><span className="text- text-black/40 truncate">{photo?.name||'No file chosen'}</span></div></div>
            <div><label className="text- tracking-widest text-black/40">ID PROOF (Aadhaar) *</label><div className="mt-2 flex items-center gap-3 h-12 rounded- bg-[#F8FAFC] border border-black/5 px-3"><label className="h-7 px-4 rounded-full bg-white border text- font-bold flex items-center cursor-pointer"><input type="file" hidden accept="image/*,.pdf" onChange={e=>setIdProof(e.target.files?.[0]||null)}/>Choose File</label><span className="text- text-black/40 truncate">{idProof?.name||'No file chosen'}</span></div></div>
          </div>

          {msg && <div className="mt-5 rounded- p-3 text- border bg-[#FFFBEB] border-amber-100">{msg}</div>}

          <button onClick={submit} disabled={loading} className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-[#FDE68A] to-[#FCD34D] text-black font-bold text-sm shadow-sm">{loading?'Saving...':'Register → Status Pending'}</button>
          <p className="mt-3 text-center text- text-black/30">Gate {form.gate_no} par 3 se zyada register nahi hoga • Admin approval ke baad login active</p>
        </div>
      </div>
    </div>
  )
}
