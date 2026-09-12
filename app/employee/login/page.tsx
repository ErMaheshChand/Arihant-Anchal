'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmpLogin(){
  const [code,setCode]=useState('')
  const [pass,setPass]=useState('')
  const [emp,setEmp]=useState<any>(null)
  const [myAtt,setMyAtt]=useState<any[]>([])
  const [loading,setLoading]=useState(false)

  useEffect(()=>{
    const saved=localStorage.getItem('emp_code')
    if(saved){ loginWith(saved, localStorage.getItem('emp_pass')||'1234') }
  },[])

  const loginWith=async(c:string,p:string)=>{
    const {data}=await supabase.from('employees').select('*').eq('employee_code',c.toUpperCase()).eq('password',p).eq('status','approved').single()
    if(data){ setEmp(data); localStorage.setItem('emp_code',data.employee_code); localStorage.setItem('emp_pass',p); loadAtt(data.employee_code) }
  }

  const loadAtt=async(code:string)=>{
    const {data}=await supabase.from('employee_attendance').select('*').eq('employee_code',code).order('date',{ascending:false}).limit(31)
    if(data) setMyAtt(data)
  }

  const doLogin=async()=>{
    if(!code.trim()){alert('Login ID likho — jaise EMP1234');return}
    setLoading(true)
    const {data,error}=await supabase.from('employees').select('*').eq('employee_code',code.toUpperCase()).eq('password',pass).single()
    if(error||!data){alert('❌ Galat ID / Password');setLoading(false);return}
    if(data.status!=='approved'){alert('⏳ Abhi Admin ne approve nahi kiya');setLoading(false);return}
    setEmp(data); localStorage.setItem('emp_code',data.employee_code); localStorage.setItem('emp_pass',pass)
    await loadAtt(data.employee_code); setLoading(false)
    alert(`✅ Welcome ${data.name}!`)
  }

  const markPresent=async()=>{
    const today=new Date().toISOString().split('T')[0]
    if(myAtt.find(a=>a.date===today)){alert('Aaj ki attendance lag chuki hai');return}
    const {error}=await supabase.from('employee_attendance').insert({employee_code:emp.employee_code,date:today,status:'present'})
    if(!error){alert('✅ Aaj Present lag gayi');loadAtt(emp.employee_code)} else alert(error.message)
  }

  const logout=()=>{ localStorage.removeItem('emp_code'); localStorage.removeItem('emp_pass'); setEmp(null); setCode(''); setPass('') }

  if(!emp){
    return(
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-black">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-3">
          <div className="text-center"><div className="text-4xl">👷</div><h1 className="font-black text-lg mt-1">Employee Login</h1><div className="text-xs opacity-60">ID Admin dega approve ke baad</div></div>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Login ID — EMP1234" className="w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm font-black tracking-wider"/>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" className="w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm"/>
          <button disabled={loading} onClick={doLogin} className="w-full h-12 rounded-full bg-slate-900 text-white font-black">{loading?'...':'Login →'}</button>
          <div className="text-xs text-center opacity-50">Default password: 1234<br/>ID nahi hai? Pehle <b>Register</b> karo</div>
        </div>
      </div>
    )
  }

  const presentDays=myAtt.filter(a=>a.status==='present').length
  const halfDays=myAtt.filter(a=>a.status==='half').length
  const salary=Math.round(presentDays*Number(emp.salary_per_day)+halfDays*Number(emp.salary_per_day)/2)
  const todayStr=new Date().toISOString().split('T')[0]
  const todayDone=myAtt.find(a=>a.date===todayStr)

  return(
    <div className="min-h-screen bg-slate-50 p-4 text-black pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-slate-900 text-white rounded-3xl p-5 flex justify-between items-center">
          <div><div className="font-black">{emp.name}</div><div className="text-xs opacity-70">{emp.employee_code} • {emp.job_title}</div></div>
          <button onClick={logout} className="px-4 h-9 rounded-full bg-white/10 text-xs font-bold">Logout</button>
        </div>

        <div className="bg-white rounded-3xl border-4 border-slate-900 p-4 text-center">
          <div className="text-xs font-black tracking-widest">ARIHANT ANCHAL — ID CARD</div>
          {emp.photo_url&&<img src={emp.photo_url} className="w-24 h-24 rounded-full mx-auto mt-2 object-cover border-2"/>}
          <div className="font-black mt-2">{emp.name}</div>
          <div className="text-xs font-bold">{emp.employee_code} • {emp.job_title}</div>
          <div className="text-xs opacity-60">{emp.mobile} • Age {emp.age}</div>
          <div className="text-xs opacity-60">{emp.address}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border p-3 text-center"><div className="text-xl font-black text-emerald-600">{presentDays}</div><div className="text- font-bold opacity-60">PRESENT</div></div>
          <div className="bg-white rounded-2xl border p-3 text-center"><div className="text-xl font-black text-amber-600">{halfDays}</div><div className="text- font-bold opacity-60">HALF DAY</div></div>
          <div className="bg-emerald-600 text-white rounded-2xl p-3 text-center"><div className="text-xl font-black">₹{salary}</div><div className="text- font-bold opacity-80">SALARY (30 din)</div></div>
        </div>

        <div className="bg-white rounded-3xl border p-5 text-center">
          <div className="font-bold text-sm">Aaj ki Attendance — {todayStr}</div>
          {todayDone?
            <div className="mt-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 font-black text-emerald-700 text-sm">✅ {todayDone.status.toUpperCase()} lag chuki hai</div>
          :
            <button onClick={markPresent} className="mt-3 w-full h-12 rounded-full bg-emerald-600 text-white font-black">✅ Main Aa Gaya — Present Lagao</button>
          }
          <div className="text-xs opacity-50 mt-2">₹{emp.salary_per_day}/day ke hisab se salary banegi</div>
        </div>

        <div className="bg-white rounded-3xl border p-4">
          <div className="font-bold text-sm mb-2">Meri Attendance (last 31 din)</div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {myAtt.map(a=>(
              <div key={a.id} className="flex justify-between text-xs p-2 rounded-xl bg-slate-50"><span className="font-bold">{a.date}</span><span className={`font-black ${a.status==='present'?'text-emerald-600':a.status==='absent'?'text-red-600':'text-amber-600'}`}>{a.status.toUpperCase()}</span></div>
            ))}
            {myAtt.length===0&&<div className="text-xs opacity-40 text-center p-4">Abhi koi attendance nahi</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
