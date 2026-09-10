"use client"
import { useState, useRef, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

function GuardLoginInner(){
  const [guardId, setGuardId] = useState("")
  const [password, setPassword] = useState("")
  const [photo, setPhoto] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const gate = searchParams?.get('gate') || '3'

  const startCamera = async()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"}})
      if(videoRef.current){ videoRef.current.srcObject = stream }
    }catch(e){ alert("Camera allow karo") }
  }

  const capture = ()=>{
    const canvas = document.createElement("canvas")
    canvas.width = 320; canvas.height = 320
    const ctx = canvas.getContext("2d")
    if(videoRef.current && ctx){ ctx.drawImage(videoRef.current,0,0,320,320) }
    setPhoto(canvas.toDataURL("image/jpeg",0.8))
    // camera band
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(t=>t.stop())
  }

  const login = async()=>{
    if(!guardId ||!password ||!photo) return alert("ID, Password aur Foto teeno bharo")
    setLoading(true)

    try{
      // 1. Guard check
      const {data:guard, error:gErr} = await supabase.from('guards').select('*').eq('guard_id', guardId.trim()).eq('status','active').single()
      if(gErr ||!guard){ setLoading(false); return alert("Guard ID galat hai ya Approve nahi hai") }
      if(guard.password!== password){ setLoading(false); return alert("Password galat hai") }

      // 2. Photo upload - bucket sahi wala
      const blob = await (await fetch(photo)).blob()
      const fileName = `attendance/${guardId}_${Date.now()}.jpg`
      const {error:upErr} = await supabase.storage.from('guard-photos').upload(fileName, blob, {upsert:true})
      if(upErr){
        // agar guard-photos nahi hai to guards bucket try
        await supabase.storage.from('guards').upload(fileName, blob, {upsert:true})
      }
      let publicUrl = ""
      const {data:url1} = supabase.storage.from('guard-photos').getPublicUrl(fileName)
      publicUrl = url1.publicUrl
      if(!publicUrl){
        const {data:url2} = supabase.storage.from('guards').getPublicUrl(fileName)
        publicUrl = url2.publicUrl
      }

      // 3. Attendance add
      await supabase.from('guard_attendance').insert({
        guard_id: guardId.trim(),
        gate_no: gate,
        photo_url: publicUrl,
        date: new Date().toISOString().split('T')[0],
        login_time: new Date().toISOString(),
        status: 'present'
      })

      // 4. Save local
      localStorage.setItem('guard_id', guardId.trim())
      localStorage.setItem('guard_gate', gate)

      setLoading(false)
      alert("Login Successful - Attendance lag gayi ✅")
      // 404 fix ke liye window.location
      window.location.href = `/guard?gate=${gate}`

    }catch(e:any){
      setLoading(false)
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl w-full max-w-md p-6 shadow-xl">
        <h1 className="text-2xl font-extrabold text-center">Guard Login</h1>
        <p className="text-center text-sm text-gray-500 mb-5">Gate-{gate} • ID + Password + Live Photo</p>

        <input value={guardId} onChange={e=>setGuardId(e.target.value.toUpperCase())} placeholder="Guard ID (G-001)" className="w-full h-12 rounded-full border-2 border-black px-5 mb-3 bg-[#f8fafc] font-bold"/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-full border-2 border-black px-5 mb-4 bg-[#f8fafc]"/>

        <div className="bg-black rounded-2xl overflow-hidden h-64 flex items-center justify-center relative border-2 border-black">
          {!photo? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"/>
          ) : (
            <img src={photo} className="w-full h-full object-cover"/>
          )}
          <div className="absolute bottom-2 flex gap-2">
            <button onClick={startCamera} className="bg-white text-black px-4 h-8 rounded-full text-xs font-bold border-2 border-black">Camera On</button>
            <button onClick={capture} className="bg-[#facc15] px-4 h-8 rounded-full text-xs font-bold border-2 border-black">Capture</button>
          </div>
        </div>

        <button onClick={login} disabled={loading} className="w-full mt-5 h-12 rounded-full bg-black text-white font-bold">
          {loading? "Checking..." : "Login & Attendance"}
        </button>

        <div className="mt-3 text-center text-xs">ID: G-001 se test karo • Gate-{gate}</div>
      </div>
    </div>
  )
}

export default function GuardLogin(){
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">Loading Login...</div>}>
      <GuardLoginInner/>
    </Suspense>
  )
}
