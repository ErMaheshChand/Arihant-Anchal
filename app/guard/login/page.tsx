"use client"
import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function GuardLogin(){
  const [guardId, setGuardId] = useState("")
  const [password, setPassword] = useState("")
  const [photo, setPhoto] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  const startCamera = async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({video:true})
    if(videoRef.current){ videoRef.current.srcObject = stream }
  }

  const capture = ()=>{
    const canvas = document.createElement("canvas")
    canvas.width = 320; canvas.height = 320
    const ctx = canvas.getContext("2d")
    if(videoRef.current && ctx){ ctx.drawImage(videoRef.current,0,0,320,320) }
    setPhoto(canvas.toDataURL("image/jpeg"))
  }

  const login = async()=>{
    if(!guardId ||!password ||!photo) return alert("ID, Password aur Foto teeno bharo")
    setLoading(true)

    // 1. Guard check
    const {data:guard} = await supabase.from('guards').select('*').eq('guard_id', guardId).eq('status','active').single()
    if(!guard){ setLoading(false); return alert("Guard ID galat hai ya Approve nahi hai") }
    if(guard.password!== password){ setLoading(false); return alert("Password galat hai") }

    // 2. Photo upload
    const blob = await (await fetch(photo)).blob()
    const fileName = `${guardId}_${Date.now()}.jpg`
    await supabase.storage.from('guards').upload(`attendance/${fileName}`, blob)
    const {data:urlData} = supabase.storage.from('guards').getPublicUrl(`attendance/${fileName}`)

    // 3. Attendance add
    await supabase.from('guard_attendance').insert({
      guard_id: guardId,
      gate_no: guard.gate_no,
      photo_url: urlData.publicUrl,
      status: 'present'
    })

    setLoading(false)
    alert("Login Successful - Attendance lag gayi ✅")
    router.push(`/guard/dashboard?guard_id=${guardId}`)
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded- w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-center">Guard Login</h1>
        <p className="text-center text-sm text-gray-500 mb-5">ID + Password + Live Photo</p>

        <input value={guardId} onChange={e=>setGuardId(e.target.value)} placeholder="Guard ID (G-001)" className="w-full h-12 rounded-full border px-5 mb-3 bg-[#f8fafc]"/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-full border px-5 mb-4 bg-[#f8fafc]"/>

        <div className="bg-black rounded-2xl overflow-hidden h- flex items-center justify-center relative">
          {!photo? (
            <video ref={videoRef} autoPlay className="w-full h-full object-cover"/>
          ) : (
            <img src={photo} className="w-full h-full object-cover"/>
          )}
          <div className="absolute bottom-2 flex gap-2">
            <button onClick={startCamera} className="bg-white text-black px-4 h-8 rounded-full text-xs font-bold">Camera On</button>
            <button onClick={capture} className="bg-[#facc15] px-4 h-8 rounded-full text-xs font-bold">Capture</button>
          </div>
        </div>

        <button onClick={login} disabled={loading} className="w-full mt-5 h-12 rounded-full bg-black text-white font-bold">
          {loading? "Checking..." : "Login & Attendance"}
        </button>
      </div>
    </div>
  )
}
