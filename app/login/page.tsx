"use client"
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage(){
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    flat_no:'', name:'', mobile:'', email:'', role:'owner', password:'', cpassword:''
  })

  const handleLogin = async () => {
    if(!form.flat_no ||!form.mobile ||!form.password) return alert('Flat No, Mobile, Password bharo')
    setLoading(true)
    const { data } = await supabase.from('residents').select('*').eq('flat_no', form.flat_no.toUpperCase()).eq('mobile', form.mobile).eq('password', form.password).single()
    if(!data){ alert('Flat / Mobile / Password galat hai!'); setLoading(false); return }
    if(data.status === 'pending'){ alert('Admin approval pending hai!'); setLoading(false); return }
    if(data.status === 'rejected'){ alert('Admin ne reject kiya'); setLoading(false); return }
    localStorage.setItem('flat_no', data.flat_no)
    localStorage.setItem('resident_name', data.name)
    localStorage.setItem('resident_role', data.role)
    localStorage.setItem('resident_mobile', data.mobile)
    window.location.href = '/resident'
  }

  const handleRegister = async () => {
    if(!form.flat_no ||!form.name ||!form.mobile ||!form.password) return alert('Sab * wale bharo')
    if(form.password!== form.cpassword) return alert('Password match nahi hua')
    if(form.mobile.length!== 10) return alert('10 digit mobile dalo')
    setLoading(true)
    const { data: exists } = await supabase.from('residents').select('id').eq('flat_no', form.flat_no.toUpperCase()).eq('mobile', form.mobile).single()
    if(exists){ alert('Already registered! Login karo'); setMode('login'); setLoading(false); return }

    const { error } = await supabase.from('residents').insert({
      flat_no: form.flat_no.toUpperCase(), name: form.name, mobile: form.mobile, email: form.email, role: form.role, password: form.password, status: 'pending'
    })

    if(error){ alert(error.message) }
    else {
      // 🔔 ADMIN KO REQUEST BHEJO - YE LINE ADD KI HAI
      await supabase.from('admin_requests').insert({
        flat_no: form.flat_no.toUpperCase(), name: form.name, mobile: form.mobile, role: form.role, status: 'pending'
      })
      alert('✅ Registration Success! Request Admin ke paas bhej di gayi.')
      setMode('login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h- bg-[#F8FAFC] flex flex-col">
      <div className="px-4 h- flex items-center gap-3 bg-white border-b border-black/5">
        <Link href="/" className="w-9 h-9 rounded-full bg-[#0B1120] text-[#D4AF37] grid place-items-center font-bold text-">A</Link>
        <div className="font-bold text-">Arihant Anchal - Resident</div>
      </div>

      <div className="flex-1 w-full max-w- mx-auto px-4 py-6">
        <h1 className="text- font-bold">Welcome to Anchal</h1>
        <p className="text- text-black/60 mt-1">Owner/Tenant - Register karo, Admin approve karega</p>

        <div className="mt-6 grid grid-cols-2 p-1 bg-[#E2E8F0] rounded-full">
          <button onClick={()=>setMode('login')} className={`h-10 rounded-full text- font-bold ${mode==='login'?'bg-[#0B1120] text-white shadow':'text-black/60'}`}>Login</button>
          <button onClick={()=>setMode('register')} className={`h-10 rounded-full text- font-bold ${mode==='register'?'bg-[#0B1120] text-white shadow':'text-black/60'}`}>Register</button>
        </div>

        <div className="mt-6 p-5 bg-white rounded- border border-black/5 shadow-sm space-y-3">
          <input className="w-full h- rounded- bg-[#F8FAFC] border border-black/10 px-4 text-" placeholder="Flat No * ex: B-302" value={form.flat_no} onChange={e=>setForm({...form, flat_no:e.target.value})} />
          {mode==='register' && <>
            <input className="w-full h- rounded- bg-[#F8FAFC] border px-4 text-" placeholder="Full Name *" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <input className="w-full h- rounded- bg-[#F8FAFC] border px-4 text-" placeholder="Email (optional)" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>setForm({...form, role:'owner'})} className={`h- rounded-full border text- font-bold ${form.role==='owner'?'bg-[#0B1120] text-white':'bg-[#F8FAFC]'}`}>🏠 Owner</button>
              <button onClick={()=>setForm({...form, role:'tenant'})} className={`h- rounded-full border text- font-bold ${form.role==='tenant'?'bg-[#0B1120] text-white':'bg-[#F8FAFC]'}`}>👤 Tenant</button>
            </div>
          </>}
          <input className="w-full h- rounded- bg-[#F8FAFC] border px-4 text-" placeholder="Mobile * 10 digit" inputMode="numeric" value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} />
          <input type="password" className="w-full h- rounded- bg-[#F8FAFC] border px-4 text-" placeholder="Password *" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          {mode==='register' && <input type="password" className="w-full h- rounded- bg-[#F8FAFC] border px-4 text-" placeholder="Confirm Password *" value={form.cpassword} onChange={e=>setForm({...form, cpassword:e.target.value})} />}
          {mode==='login'? <button onClick={handleLogin} className="w-full h- rounded-full bg-[#0B1120] text-white font-bold text-">{loading?'Checking...':'Login → /resident'}</button> : <button onClick={handleRegister} className="w-full h- rounded-full bg-[#D4AF37] text-black font-bold text-">{loading?'Saving...':'Register - Admin ko bhejo'}</button>}
          <div className="text- text-black/50 text-center pt-2">{mode==='login'? 'Demo: B-302 / 9876543210 / 123456' : 'Mobile fix hoga - Admin approve karega'}</div>
        </div>
      </div>
    </div>
  )
}
