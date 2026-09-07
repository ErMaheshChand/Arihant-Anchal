"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage(){
  const [flat, setFlat] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('flat_no', flat)
      .eq('mobile', mobile)
      .single()

    if(data){
      localStorage.setItem('flat_no', data.flat_no)
      localStorage.setItem('resident_name', data.name)
      window.location.href = '/resident'
    } else {
      alert('Flat No ya Mobile galat hai! SQL me jo data dala tha wahi use karo: B-302 / 9876543210')
    }
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Resident Login</h1>
      <input className="border p-2 w-full mt-4" placeholder="Flat No - ex: B-302" value={flat} onChange={e=>setFlat(e.target.value)} />
      <input className="border p-2 w-full mt-2" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} />
      <button onClick={handleLogin} className="bg-black text-white w-full p-3 mt-4 rounded">
        {loading ? 'Checking...' : 'Login'}
      </button>
    </div>
  )
}
