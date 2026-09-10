"use client"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function GuardLogin(){
  const [guardId, setGuardId] = useState("")
  const [password, setPassword] = useState("")
  const [photo, setPhoto] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [reqGate, setReqGate] = useState("3")
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(()=>{
    const g = new URLSearchParams(window.location.search).get('gate')
    if(g) setReqGate(g)
  },[])

  const startCamera = async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({video:true})
    if(videoRef.current){ videoRef.current.srcObject = stream }
  }
  const capture = ()=>{
    const canvas = document.createElement("canvas")
    canvas.width=320; canvas.height=320
    const ctx=canvas.getContext("2d")
    if(videoRef.current && ctx){ ctx.drawImage(videoRef.current,0,0,320,320) }
    setPhoto(canvas.toDataURL("image/jpeg"))
  }

  const login = async()=>{
    if(!guardId ||!password ||!photo) return alert("ID, Password, Photo bharo")
    setLoading(true)
    const {data:guard} = await supabase.from('guards').select('*').eq('guard_id', guardId).eq('status','active').single()
    if(!guard || guard.password!==password){ setLoading(false); return alert("ID/Password galat") }

    // GATE CHECK - yahi main logic hai
    if(String(guard.gate_no)!== String(reqGate)){
      setLoading(false)
      return alert(`Aap Gate-${guard.gate_no} ke liye register ho, Gate-${reqGate} par login nahi kar sakte`)
    }

    const blob = await (await fetch(photo)).blob()
    const fileName = `attendance/${guardId}_${Date.now()}.jpg`
    await supabase.storage.from('guard-photos').upload(fileName, blob).catch(async()=>{ await supabase.storage.from('guards').upload(fileName, blob) })
    const {data:urlData} = supabase.storage.from('guard-photos').getPublicUrl(fileName)

    await supabase.from('guard_attendance').insert({
      guard_id: guardId, gate_no: guard.gate_no, photo_url: urlData.publicUrl,
      date: new Date().toISOString().split('T')[0],
      login_time: new Date().toISOString(), status: 'present'
    })

    localStorage.setItem('guard_id', guardId)
    setLoading(false)
    alert("Login Successful ✅")
    window.location.href = `/guard?gate=${guard.gate_no}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f7fb]">
      <div className="bg-white border-2 border-black rounded-3xl w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-center">Guard Login - Gate-{reqGate}</h1>
        <input value={guardId} onChange={e=>setGuardId(e.target.value.toUpperCase())} placeholder="G-001" className="w-full h-12 rounded-full border-2 border-black px-5 mb-3 font-bold mt-4"/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-full border-2 border-black px-5 mb-4"/>
        <div className="bg-black rounded-2xl h-64 flex items-center justify-center relative">
          {!photo? <video ref={videoRef} autoPlay className="w-full h-full object-cover"/> : <img src={photo} className="w-full h-full object-cover"/>}
          <div className="absolute bottom-2 flex gap-2">
            <button onClick={startCamera} className="bg-white px-4 h-8 rounded-full text-xs font-bold">Camera On</button>
            <button onClick={capture} className="bg-[#facc15] px-4 h-8 rounded-full text-xs font-bold">Capture</button>
          </div>
        </div>
        <button onClick={login} className="w-full mt-5 h-12 rounded-full bg-black text-white font-bold">{loading? "Wait...":"Login & Attendance"}</button>
      </div>
    </div>
  )
}
