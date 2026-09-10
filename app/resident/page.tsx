'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')
  const [flatNo, setFlatNo] = useState('B-302')
  const [pending, setPending] = useState<any[]>([])
  const [todayVisitors, setTodayVisitors] = useState<any[]>([])
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<any>(null)

  useEffect(()=>{
    const saved = localStorage.getItem('flat_no') || localStorage.getItem('resident_flat') || 'B-302'
    setFlatNo(saved.toUpperCase())
    const se = localStorage.getItem('sound_enabled')
    if(se==='1') setSoundEnabled(true)
    if("Notification" in window && Notification.permission==="default"){
      Notification.requestPermission()
    }
  },[])

  const enableSound = async ()=>{
    try{
      await audioRef.current?.play()
      audioRef.current?.pause()
      if(audioRef.current) audioRef.current.currentTime=0
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator(); o.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.1)
    }catch{}
    localStorage.setItem('sound_enabled','1')
    setSoundEnabled(true)
  }

  const startEmergencyBeep = ()=>{
    if(intervalRef.current) clearInterval(intervalRef.current)
    let count=0
    intervalRef.current = setInterval(()=>{
      count++
      if(count>8){ clearInterval(intervalRef.current); return }
      // beep
      try{
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const o = ctx.createOscillator()
        o.frequency.value = count%2===0? 900 : 600
        o.type='square'
        o.connect(ctx.destination)
        o.start()
        setTimeout(()=>o.stop(), 300)
      }catch{}
      if("vibrate" in navigator) navigator.vibrate(400)
      audioRef.current?.play().catch(()=>{})
    },500)
  }

  useEffect(()=>{
    const load = async () => {
      const { data: pend } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).eq('status','pending').order('entry_time',{ascending:false})
      if(pend) setPending(pend)
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: today } = await supabase.from('visitors').select('*').or(`resident_flat.eq.${flatNo},flat_no.eq.${flatNo}`).gte('entry_time', todayStr).order('entry_time',{ascending:false}).limit(20)
      if(today) setTodayVisitors(today)
    }
    load()

    const ch = supabase.channel('resident-'+flatNo)
  .on('postgres_changes', {event:'*', schema:'public', table:'visitors', filter:`resident_flat=eq.${flatNo}`}, (p:any)=>{
        if(p.eventType==='INSERT' && p.new.status==='pending'){ setPending(x=>[p.new,...x]) }
      }).subscribe()

    const ch2 = supabase.channel('emergency-resident-fix')
  .on('postgres_changes', {event:'INSERT', schema:'public', table:'emergency_broadcasts'}, payload=>{
        const data = payload.new as any
        if(data.target === 'ALL'){
          setEmergencyAlert(data)
          startEmergencyBeep()
          if("Notification" in window && Notification.permission==="granted"){
            new Notification(`🚨 ${data.emergency_type}`, {body: data.message})
          }
        }
      }).subscribe()

    return ()=>{ supabase.removeChannel(ch); supabase.removeChannel(ch2); if(intervalRef.current) clearInterval(intervalRef.current) }
  },[flatNo])

  const handleAction = async (id:string, status:any)=>{
    await supabase.from('visitors').update({status: status==='approved'?'inside':status}).eq('id',id)
    setPending(p=>p.filter(v=>v.id!==id))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col" onClick={()=>{ if(!soundEnabled) enableSound() }}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3" preload="auto" loop />

      {!soundEnabled && (
        <div className="sticky top-0 z-[100] bg-amber-400 text-black px-4 py-2 text-xs font-bold flex justify-between items-center">
          <span>🔊 Emergency Sound ke liye tap karo</span>
          <button onClick={enableSound} className="px-3 py-1 bg-black text-white rounded-full">Enable 🔊</button>
        </div>
      )}

      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-red-600 rounded-3xl p-6">
            <div className="text-4xl text-center animate-bounce">🚨</div>
            <h2 className="font-black text-2xl text-center text-red-600 mt-2">EMERGENCY ALERT</h2>
            <div className="text-center mt-1 text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full inline-block">{emergencyAlert.emergency_type} • {emergencyAlert.guard_id}</div>
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl font-bold text-center text-black text-sm">{emergencyAlert.message}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={()=>{ if(intervalRef.current) clearInterval(intervalRef.current); audioRef.current?.pause(); setEmergencyAlert(null) }} className="flex-1 h-12 bg-slate-900 text-white rounded-full font-black">Stop Sound & OK</button>
            </div>
            <div className="text-center text- text-red-500 mt-2 animate-pulse">🔊 Beeping... 5 sec</div>
          </div>
        </div>
      )}

      {/* aapka purana UI same */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur rounded-b-3xl border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">A</div><div className="font-bold text-sm">{flatNo}</div></div>
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">🔔{pending.length>0 && <span className="w-5 h-5 bg-red-500 text-white text- rounded-full flex items-center justify-center">{pending.length}</span>}</div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <div className="rounded-3xl bg-slate-900 text-white p-5">Maintenance ₹2,450 • {soundEnabled?'🔊 Sound ON':'🔇 Tap to enable sound'}</div>
        <div className="mt-4 p-4 rounded-3xl bg-white border text-xs">Test: Guard app se emergency bhejo, ab beep + vibrate ayega. Ek baar "Enable" pe tap zarur karo.</div>
      </div>
    </div>
  )
}
