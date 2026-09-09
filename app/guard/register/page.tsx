'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GuardRegisterPage(){
  const [form,setForm]=useState({name:'',mobile:'',password:'',gate_no:'1'})
  const [loading,setLoading]=useState(false)

  const submit=async()=>{
    setLoading(true)
    const guard_id='G-'+Date.now().toString().slice(-6)
    const {error}=await supabase.from('guards').insert({
      guard_id, name:form.name, mobile:form.mobile, password:form.password,
      gate_no:parseInt(form.gate_no), shift:'Day', salary_per_day:500, status:'pending'
    })
    setLoading(false)
    if(error) alert(error.message)
    else alert(`Registered! ID: ${guard_id} - Pending Approval`)
  }

  return(
    <div style={{minHeight:'100vh', background:'#0A0E1A', color:'white', padding:'20px'}}>
      <h1 style={{color:'#D4AF37', fontSize:'24px', fontWeight:'bold'}}>Guard Register - 3 per Gate</h1>
      <div style={{maxWidth:'400px', marginTop:'20px', background:'#151A27', padding:'20px', borderRadius:'16px'}}>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name" style={{width:'100%', height:'48px', marginBottom:'10px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0 16px', color:'white'}}/>
        <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="Mobile" style={{width:'100%', height:'48px', marginBottom:'10px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0 16px', color:'white'}}/>
        <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password" style={{width:'100%', height:'48px', marginBottom:'10px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0 16px', color:'white'}}/>
        <select value={form.gate_no} onChange={e=>setForm({...form,gate_no:e.target.value})} style={{width:'100%', height:'48px', marginBottom:'10px', borderRadius:'12px', background:'#151A27', border:'1px solid rgba(255,255,255,0.1)', padding:'0 16px', color:'white'}}>
          <option value="1">Gate 1</option><option value="2">Gate 2</option><option value="3">Gate 3</option><option value="4">Gate 4</option><option value="5">Gate 5</option>
        </select>
        <button onClick={submit} disabled={loading} style={{width:'100%', height:'48px', borderRadius:'24px', background:'#D4AF37', color:'black', fontWeight:'bold'}}>{loading?'Saving...':'Register Guard'}</button>
      </div>
    </div>
  )
}
