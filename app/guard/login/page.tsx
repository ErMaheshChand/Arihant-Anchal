"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

export default function GuardLogin(){
  const [guardId, setGuardId] = useState("")
  const [password, setPassword] = useState("")
  const [reqGate, setReqGate] = useState("1")
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(()=>{
    const g = new URLSearchParams(window.location.search).get('gate')
    if(g) setReqGate(g)
  },[])

  const login = async()=>{
    if(!guardId || !password) return alert("ID Password bharo")
    
    const {data:guard} = await supabase.from('guards').select('*').eq('guard_id', guardId).eq('status','active').single()
    
    if(!guard || guard.password!==password){
      return alert("ID/Password galat")
    }

    if(String(guard.gate_no) !== "1"){
      return alert(`Ye Guard Gate-${guard.gate_no} ka hai, Gate-1 par login nahi hoga`)
    }

    localStorage.setItem('guard_id', guardId)
    localStorage.setItem('guard_gate', "1")
    alert("Login Successful ✅")
    window.location.replace(`/guard?gate=1&guard_id=${guardId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f7fb]">
      <div className="bg-white border-2 border-black rounded-3xl w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-center">Gate-1 Guard Login</h1>
        <input value={guardId} onChange={e=>setGuardId(e.target.value.toUpperCase())} placeholder="G-001" className="w-full h-12 rounded-full border-2 border-black px-5 mb-3 font-bold mt-6"/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-full border-2 border-black px-5 mb-6"/>
        <button onClick={login} className="w-full h-12 rounded-full bg-black text-white font-bold">Login</button>
      </div>
    </div>
  )
}
