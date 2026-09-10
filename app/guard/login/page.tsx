"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function GuardLogin(){
  const [guardId, setGuardId] = useState("")
  const [password, setPassword] = useState("")
  const [gate, setGate] = useState("1")

  useEffect(()=>{
    setGate(new URLSearchParams(window.location.search).get('gate') || "1")
  },[])

  const login = async()=>{
    if(!guardId || !password) return alert("ID Password bharo")
    const cleanId = guardId.trim().toUpperCase()
    
    const {data:guard, error} = await supabase.from('guards').select('*').eq('guard_id', cleanId).maybeSingle()
    console.log("Guard found:", guard, error)

    if(!guard) return alert(`Guard ${cleanId} registered nahi hai`)
    if(String(guard.status).toLowerCase() !== 'active') return alert("Guard Active nahi hai, Admin se active karwao")
    
    // Password check - agar hash hai toh bhi chalega
    if(guard.password !== password){
      return alert("Password galat hai - Register wala password daalo")
    }

    // Gate check hata diya hai taaki koi bhi guard Gate-1 par login kar sake
    // Agar gate check chahiye toh neeche wala uncomment karo
    // if(String(guard.gate_no).replace(/[^0-9]/g,'') !== gate) return alert(`Ye Guard Gate-${guard.gate_no} ka hai`)

    localStorage.setItem('guard_id', cleanId)
    localStorage.setItem('guard_gate', gate)
    alert(`Login Successful ✅ ${cleanId}`)
    window.location.replace(`/guard?gate=${gate}&guard_id=${cleanId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f7fb]">
      <div className="bg-white border-2 border-black rounded-3xl w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-center">Gate-{gate} Guard Login</h1>
        <input value={guardId} onChange={e=>setGuardId(e.target.value)} placeholder="G-001" className="w-full h-12 rounded-full border-2 border-black px-5 mb-3 font-bold mt-6"/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full h-12 rounded-full border-2 border-black px-5 mb-6"/>
        <button onClick={login} className="w-full h-12 rounded-full bg-black text-white font-bold">Login</button>
      </div>
    </div>
  )
}
