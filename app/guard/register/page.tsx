"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function GuardRegister(){
  const [form,setForm]=useState({name:'',mobile:'',gate:'1',aadhaar:''})
  const [photo,setPhoto]=useState<File|null>(null)
  const [msg,setMsg]=useState('')

  const submit=async()=>{
    if(!form.name ||!form.mobile ||!photo) return setMsg("Name, Mobile, Photo bharo")
    const fileName=`guard_${Date.now()}_${photo.name}`
    const {error:upErr}=await supabase.storage.from("guard-photos").upload(fileName,photo)
    if(upErr) return setMsg(upErr.message)
    const url=supabase.storage.from("guard-photos").getPublicUrl(fileName).data.publicUrl
    const {error}=await supabase.from("guards").insert({
      name:form.name, mobile:form.mobile, gate_no:parseInt(form.gate),
      aadhaar_no:form.aadhaar, photo_url:url, status:'active'
    })
    if(error) setMsg(error.message)
    else setMsg(`✅ Guard Registered: ${form.name} - Gate ${form.gate}`)
  }

  return(
    <div className="min-h-screen bg-white p-6">
      <div className="max-w- mx-auto border rounded-xl p-6">
        <h1 className="text-lg font-bold">New Guard Registration</h1>
        <p className="text-sm text-gray-500">Record ke liye - attendance/salary isi se</p>

        <input placeholder="Guard Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-4 w-full border p-3 rounded" />
        <input placeholder="Mobile" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} className="mt-3 w-full border p-3 rounded" />
        <select value={form.gate} onChange={e=>setForm({...form,gate:e.target.value})} className="mt-3 w-full border p-3 rounded">
          <option value="1">Gate 1</option><option value="2">Gate 2</option><option value="3">Gate 3</option><option value="4">Gate 4</option><option value="5">Gate 5</option>
        </select>
        <input placeholder="Aadhaar No" value={form.aadhaar} onChange={e=>setForm({...form,aadhaar:e.target.value})} className="mt-3 w-full border p-3 rounded" />
        <input type="file" onChange={e=>setPhoto(e.target.files?.[0]||null)} className="mt-3 w-full" />

        {msg && <div className="mt-3 text-sm">{msg}</div>}
        <button onClick={submit} className="mt-4 w-full bg-black text-white p-3 rounded">Register</button>
      </div>
    </div>
  )
}
