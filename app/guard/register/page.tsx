"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GuardRegisterPastel(){
  const [form,setForm]=useState({name:'',mobile:'',password:'',gate_no:'1',shift:'Day'})
  const [photo,setPhoto]=useState<File|null>(null)
  const [idProof,setIdProof]=useState<File|null>(null)
  const [msg,setMsg]=useState(''); const [loading,setLoading]=useState(false)

  const submit=async()=>{
    if(!form.name||!form.mobile||!form.password) return setMsg('❌ Name/Mobile/Password bharo')
    if(!photo||!idProof) return setMsg('❌ Photo & ID Proof chahiye')
    setLoading(true)
    try{
      const {data:ex}=await supabase.from('guards').select('id').eq('gate_no',parseInt(form.gate_no)).neq('status','rejected')
      if(ex && ex.length>=3) throw new Error(`Gate ${form.gate_no} full - 3 guards`)
      const upload=async(f:File,p:string)=>{const n=`${p}_${Date.now()}_${f.name}`; const {error}=await supabase.storage.from('guard-photos').upload(n,f); if(error) throw error; return supabase.storage.from('guard-photos').getPublicUrl(n).data.publicUrl}
      const photoUrl=await upload(photo,'photo'); const idUrl=await upload(idProof,'id')
      const gid=`G-${form.gate_no}-${Date.now().toString().slice(-6)}`
      const {error}=await supabase.from('guards').insert({guard_id:gid,name:form.name,mobile:form.mobile,password:form.password,gate_no:parseInt(form.gate_no),shift:form.shift,salary_per_day:500,photo_url:photoUrl,id_proof_url:idUrl,status:'pending'})
      if(error) throw error
      setMsg(`✅ Registered! ${gid} - Pending`); setForm({name:'',mobile:'',password:'',gate_no:'1',shift:'Day'})
    }catch(e:any){setMsg('❌ '+e.message)} setLoading(false)
  }

  return(
    <div className="min-h-screen bg-[#F6F7FB] p-3 md:p-6">
      <div className="max-w- mx-auto">

        {/* TOP - SAME LOOK AS YOUR PHOTO - 2 CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded- border border-black/5 p-4 shadow-sm flex flex-col justify-between h-">
            <span className="text- font-bold tracking-widest text-[#6B7280]">TOTAL GUARDS</span>
            <span className="text- font-black">12</span>
            <div className="h- bg-[#EEF2F7] rounded-full"><div className="h-full w-4/5 bg-black rounded-full"></div></div>
          </div>
          <div className="bg-[#ECFEF8] rounded- border border-emerald-100 p-4 shadow-sm flex flex-col justify-between h-">
            <span className="text- font-bold tracking-widest text-[#0F766E]">GATE 1-5 LIMIT</span>
            <span className="text- font-black text-black">3 / Gate</span>
            <div className="h- bg-[#D1FAE5] rounded-full"><div className="h-full w-full bg-[#0F766E] rounded-full"></div></div>
          </div>
        </div>

        {/* FORM - SAME CARD STYLE */}
        <div className="mt-4 bg-white rounded- border border-black/5 shadow-sm p-6 md:p-7">
          <h1 className="text- font-black">Guard Registration at <span className="text-[#0F766E]">Arihant Anchal</span></h1>
          <p className="text- text-black/40 mt-1">Gate 1-5 ke liye max 3 guards. Photo + ID Proof ke saath → Pending Approval</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text- font-bold tracking-widest text-black/40">GUARD NAME *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ram Singh" className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none focus:bg-white focus:border-black/10"/></div>
            <div><label className="text- font-bold tracking-widest text-black/40">MOBILE (10 DIGIT) *</label><input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="9876543210" className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none"/></div>
            <div><label className="text- font-bold tracking-widest text-black/40">PASSWORD *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="1234" className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none"/></div>
            <div><label className="text- font-bold tracking-widest text-black/40">GATE NO (1-5) *</label><select value={form.gate_no} onChange={e=>setForm({...form,gate_no:e.target.value})} className="mt-2 w-full h-12 rounded- bg-[#F8FAFC] border border-black/5 px-4 text-sm outline-none"><option value="1">Gate 1 - Main</option><option value="2">Gate 2</option><option value="3">Gate 3</option><option value="4">Gate 4</option><option value="5">Gate 5</option></select></div>
          </div>

          <div className="mt-5"><label className="text- font-bold tracking-widest text-black/40">SHIFT *</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Day','Night','Rotational'].map(s=>(
                <button key={s} onClick={()=>setForm({...form,shift:s})} className={`h-12 rounded- border text-xs font-bold ${form.shift===s?'bg-[#FFFBEB] border-amber-200 text-black':'bg-[#F8FAFC] border-black/5 text-black/40'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text- font-bold tracking-widest text-black/40">PHOTO *</label><div className="mt-2 h-12 rounded- bg-[#F8FAFC] border border-black/5 px-3 flex items-center gap-2"><label className="h-7 px-4 rounded-full bg-white border border-black/5 text- font-bold flex items-center cursor-pointer"><input type="file" hidden accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)}/>Choose File</label><span className="text- text-black/40 truncate">{photo?.name||'No file chosen'}</span></div></div>
            <div><label className="text- font-bold tracking-widest text-black/40">ID PROOF (Aadhaar) *</label><div className="mt-2 h-12 rounded- bg-[#F8FAFC] border border-black/5 px-3 flex items-center gap-2"><label className="h-7 px-4 rounded-full bg-white border border-black/5 text- font-bold flex items-center cursor-pointer"><input type="file" hidden accept="image/*,.pdf" onChange={e=>setIdProof(e.target.files?.[0]||null)}/>Choose File</label><span className="text- text-black/40 truncate">{idProof?.name||'No file chosen'}</span></div></div>
          </div>

          {msg && <div className="mt-5 rounded- bg-[#FFFBEB] border border-amber-100 p-3 text- font-bold">{msg}</div>}

          <button onClick={submit} disabled={loading} className="mt-6 w-full h- rounded-full bg-black text-white font-bold text-sm">{loading?'Saving...':'Register → Status Pending'}</button>
          <p className="mt-3 text-center text- text-black/30">Gate {form.gate_no} par 3 se zyada nahi • Admin approval ke baad active</p>
        </div>
      </div>
    </div>
  )
}
