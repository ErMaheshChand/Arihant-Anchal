'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function EmpRegister(){
  const [f,setF]=useState({name:'',mobile:'',age:'',address:'',job_title:'Safai',experience:''})
  const [photo,setPhoto]=useState<File|null>(null)
  const [idp,setIdp]=useState<File|null>(null)
  const [loading,setLoading]=useState(false)
  const submit=async()=>{
    if(!f.name||f.mobile.length!==10){alert('Name + 10 digit mobile likho');return}
    setLoading(true)
    try{
      let photoUrl='',idUrl=''
      if(photo){ const n=`${f.mobile}_${Date.now()}_p`; const {error}=await supabase.storage.from('emp-photos').upload(n,photo); if(!error) photoUrl=supabase.storage.from('emp-photos').getPublicUrl(n).data.publicUrl }
      if(idp){ const n=`${f.mobile}_${Date.now()}_id`; const {error}=await supabase.storage.from('emp-photos').upload(n,idp); if(!error) idUrl=supabase.storage.from('emp-photos').getPublicUrl(n).data.publicUrl }
      const {error}=await supabase.from('employees').insert({name:f.name,mobile:f.mobile,age:parseInt(f.age)||0,address:f.address,job_title:f.job_title,experience:f.experience,photo_url:photoUrl,idproof_url:idUrl,status:'pending'})
      if(error) throw error
      alert('✅ Ho gaya! Ab Admin approve karega — fir EMP ID milegi'); setF({name:'',mobile:'',age:'',address:'',job_title:'Safai',experience:''}); setPhoto(null); setIdp(null)
    }catch(e:any){alert('Error: '+e.message)}
    setLoading(false)
  }
  return(
    <div className="min-h-screen bg-slate-50 p-4 text-black"><div className="max-w-md mx-auto bg-white rounded-3xl border p-5 space-y-3">
      <h1 className="font-black text-lg">👷 Employee Registration</h1>
      <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-3">Register karo → Admin <b>app/admin/employees</b> me approve karega → Tab <b>EMP ID + 1234</b> se login hoga</div>
      <input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Name *" className="w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm font-bold"/>
      <input value={f.mobile} onChange={e=>setF({...f,mobile:e.target.value.replace(/\D/g,'')})} placeholder="Mobile 10 digit *" maxLength={10} className="w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm font-bold"/>
      <div className="grid grid-cols-2 gap-2">
        <input value={f.age} onChange={e=>setF({...f,age:e.target.value})} placeholder="Age" type="number" className="h-12 rounded-2xl border bg-slate-50 px-4 text-sm"/>
        <select value={f.job_title} onChange={e=>setF({...f,job_title:e.target.value})} className="h-12 rounded-2xl border bg-slate-50 px-3 text-sm font-bold">
          <option>Safai</option><option>Guard</option><option>Mali</option><option>Electrician</option><option>Plumber</option><option>Lift Tech</option><option>Manager</option><option>Other</option>
        </select>
      </div>
      <input value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="Address" className="w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm"/>
      <input value={f.experience} onChange={e=>setF({...f,experience:e.target.value})} placeholder="Work Experience" className="w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm"/>
      <label className="block p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer text-sm font-bold"><input type="file" accept="image/*" className="hidden" onChange={e=>setPhoto(e.target.files?.[0]||null)}/>📸 {photo?photo.name:'Photo upload karo'}</label>
      <label className="block p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer text-sm font-bold"><input type="file" accept="image/*" className="hidden" onChange={e=>setIdp(e.target.files?.[0]||null)}/>🪪 {idp?idp.name:'ID Card upload karo'}</label>
      <button disabled={loading} onClick={submit} className="w-full h-12 rounded-full bg-slate-900 text-white font-black">{loading?'...':'Send for Approval →'}</button>
    </div></div>
  )
}
