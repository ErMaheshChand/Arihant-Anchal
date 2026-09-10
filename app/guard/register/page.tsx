"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function GuardRegister(){
  const [form,setForm]=useState({gate:'1',name:'',mobile:'',pass:'',cpass:''})
  const [photo,setPhoto]=useState<File|null>(null)
  const [idProof,setIdProof]=useState<File|null>(null)
  const [preview,setPreview]=useState<string>('')
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)

  const onPhoto=(f:File)=>{
    setPhoto(f); setPreview(URL.createObjectURL(f))
  }

  const submit=async()=>{
    if(!form.name ||!form.mobile) return setMsg("Name + Mobile bharo")
    if(form.pass!==form.cpass) return setMsg("❌ Password match nahi hai")
    if(form.pass.length<4) return setMsg("❌ Password min 4")
    if(!photo) return setMsg("❌ Photo upload karo")

    setLoading(true)
    setMsg("Upload ho raha hai...")
    try{
      const gid=`G-${form.gate}-${Math.floor(100000+Math.random()*900000)}`

      // Photo upload
      await supabase.storage.from('guard-photos').upload(`g_${gid}.jpg`, photo, {upsert:true})
      const pUrl = supabase.storage.from('guard-photos').getPublicUrl(`g_${gid}.jpg`).data.publicUrl

      // ID Proof upload
      let proofUrl=''
      if(idProof){
        await supabase.storage.from('guard-idproof').upload(`id_${gid}.jpg`, idProof, {upsert:true})
        proofUrl = supabase.storage.from('guard-idproof').getPublicUrl(`id_${gid}.jpg`).data.publicUrl
      }

      const {error}=await supabase.from('guards').insert({
        guard_id: gid,
        gate_no: parseInt(form.gate),
        full_name: form.name,
        full_name: form.name,
        mobile: form.mobile,
        password: form.pass,
        photo_url: pUrl,
        id_proof_url: proofUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      })

      if(error) setMsg("❌ "+error.message)
      else setMsg(`✅ Admin Approval ke liye bheja - ID: ${gid} | Time: ${new Date().toLocaleString()}`)
    }catch(e:any){
      setMsg("❌ "+e.message)
    }
    setLoading(false)
  }

  return(
    <div className="min-h-screen bg-[#f6f7fb] flex justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl w-full max-w-md p-6">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-gray-50 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden">
            {preview? <img src={preview} className="w-full h-full object-cover"/> : <span className="text-2xl">👤</span>}
          </div>
          <label className="bg-black text-white rounded-full px-6 py-2 text-sm cursor-pointer font-bold">📷 Upload
            <input type="file" hidden accept="image/*" onChange={e=>e.target.files && onPhoto(e.target.files[0])}/>
          </label>
        </div>
        <div className="mt-4 space-y-3">
          <div><label className="text-xs font-bold">GATE NO *</label>
            <select value={form.gate} onChange={e=>setForm({...form,gate:e.target.value})} className="w-full h-12 rounded-full bg-[#f8fafc] border px-5 font-bold">
              <option value="1">Gate 1</option><option value="2">Gate 2</option><option value="3">Gate 3</option><option value="4">Gate 4</option>
            </select>
          </div>
          <input placeholder="Full Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full h-12 rounded-full bg-[#f8fafc] border px-5 text-sm"/>
          <input placeholder="10 digit mobile *" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} className="w-full h-12 rounded-full bg-[#f8fafc] border px-5 text-sm"/>
          <input placeholder="Password * (min 4)" type="password" value={form.pass} onChange={e=>setForm({...form,pass:e.target.value})} className="w-full h-12 rounded-full bg-[#f8fafc] border px-5 text-sm"/>
          <input placeholder="Confirm Password *" type="password" value={form.cpass} onChange={e=>setForm({...form,cpass:e.target.value})} className="w-full h-12 rounded-full bg-[#f8fafc] border px-5 text-sm"/>
          <div><label className="text-xs font-bold">ID Proof (Aadhaar/PAN) *</label>
            <input type="file" onChange={e=>setIdProof(e.target.files?.[0]||null)} className="w-full h-12 rounded-full bg-[#f8fafc] border px-5 py-2 text-sm"/>
          </div>
          {msg && <div className="text-sm text-center font-bold p-3 rounded-2xl bg-amber-50 border">{msg}</div>}
          <button onClick={submit} disabled={loading} className="w-full h-12 rounded-full bg-[#facc15] font-bold text-black">{loading? "Bhej raha hu..." : "📩 Admin Approval ke liye Bhejo"}</button>
          <div className="text-center text-xs">Already ID hai? <a href={`/guard/login?gate=${form.gate}`} className="font-bold underline">Login</a></div>
        </div>
      </div>
    </div>
  )
}
