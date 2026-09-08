"use client"
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { useState, useEffect, useRef } from 'react'

const LINKS = [
  { label: 'Resident Login', href: '/resident/login', desc: 'Flat owners & tenants', icon: '🏠' },
  { label: 'Guard Login', href: '/guard/login', desc: 'Security access', icon: '🛡️' },
  { label: 'Admin Login', href: '/admin/daily-report', desc: 'Management portal', icon: '📊', live: true },
  { label: 'Clubhouse Booking', href: '/clubhouse/booking', desc: 'Events & facilities', icon: '🏸' },
  { label: 'Contact Society', href: '/contact', desc: 'Help & support', icon: '📞' },
];

const ITEMS = [
  { id:0, title:'Grand Towers', sub:'19 Towers', icon:'🏢', grad:'from-[#1e3a5f] to-[#0f223a]' },
  { id:1, title:'Clubhouse', sub:'15k sqft', icon:'🏛️', grad:'from-[#8b6914] to-[#5a4510]' },
  { id:2, title:'Infinity Pool', sub:'Resort Pool', icon:'🏊', grad:'from-[#0f4c5c] to-[#0a2f3a]' },
  { id:3, title:'Fitness Gym', sub:'Gym & Yoga', icon:'💪', grad:'from-[#2a2a2a] to-[#1a1a1a]' },
  { id:4, title:'Lush Gardens', sub:'40% Open', icon:'🌳', grad:'from-[#1a4d2e] to-[#0f2d1a]' },
  { id:5, title:'Main Gate', sub:'24x7 Security', icon:'🛡️', grad:'from-[#1a1a2e] to-[#0f0f1f]' },
];

export default function HomePage() {
  const [angle,setAngle]=useState(0);
  const [paused,setPaused]=useState(false);
  const [active,setActive]=useState<number|null>(null);
  const raf=useRef<number|null>(null);
  const last=useRef(0);

  useEffect(()=>{
    const loop=(t:number)=>{
      if(!last.current) last.current=t;
      const dt=t-last.current; last.current=t;
      if(!paused && active===null) setAngle(a=>(a+dt*0.014)%360);
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{ if(raf.current) cancelAnimationFrame(raf.current); };
  },[paused,active]);

  return (
    <>
      <SiteNav />
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-[#D4AF37]">🏠 Home • Dali Bai Circle, Jodhpur – 342001 | 530 Flats | 19 Towers</Link>

          <div className="mt-6 text-center">
            <div className="inline-flex px-3 py-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text- tracking-[0.18em] uppercase text-[#D4AF37] font-semibold">Jodhpur&apos;s Premier Community</div>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-[0.95]">Welcome to <span className="text-[#D4AF37]">Arihant Anchal</span><br/>Society & Club House</h1>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {LINKS.map(i=>(
                <Link key={i.label} href={i.href} className={`px-5 py-2.5 rounded-full text- font-bold border ${i.live? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 border-white/10'}`}>{i.icon} {i.label}</Link>
              ))}
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="h- relative" style={{perspective:'1200px'}} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{setPaused(false); setActive(null)}}>
                <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  {active!==null? (
                    <div className="w- h- rounded-2xl bg-[#020617] border border-[#D4AF37]/50 shadow-[0_20px_80px_rgba(212,175,55,0.4)] grid place-items-center p-6 text-center">
                      <div className="text-3xl">{ITEMS[active!].icon}</div><div className="text-lg font-bold mt-2">{ITEMS[active!].title}</div><div className="text-xs text-[#D4AF37]">{ITEMS[active!].sub}</div>
                    </div>
                  ) : <div className="w- h- rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 grid place-items-center text-[#D4AF37] text- font-bold">360°<br/>ROTATE</div>}
                </div>
                <div className="absolute top-1/2 left-1/2"><div style={{transform:`translate(-50%,-50%) rotateY(${angle}deg)`, transformStyle:'preserve-3d' as any}}>
                  {ITEMS.map((it,i)=>{
                    const r=210, th=i*60;
                    return <div key={it.id} style={{position:'absolute', transform:`rotateY(${th}deg) translateZ(${r}px) translate(-50%,-50%)`, transformStyle:'preserve-3d' as any}}>
                      <button onMouseEnter={()=>setActive(it.id)} className={`h- w- rounded-xl border text- font-bold bg-gradient-to-br ${it.grad} ${active===it.id?'border-[#D4AF37] scale-110':'border-white/15'}`}><div className="text-">{it.icon}</div>{it.title}</button></div>
                  })}
                </div></div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-3 h-fit">
              <div className="flex justify-between px-2 py-1"><span className="text- uppercase opacity-40">Society Services</span><span className="text- px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">5 ONLY</span></div>
              {LINKS.map(l=><Link key={l.label} href={l.href} className="rounded-xl bg-[#020617] border border-white/10 p-4 hover:border-[#D4AF37]/30"><div className="flex gap-2 font-bold text-"><span>{l.icon}</span>{l.label}</div><div className="text- opacity-60 mt-1">{l.desc}</div></Link>)}
              <div className="mt-2 rounded-xl border border-[#D4AF37]/30 bg-[#020617] overflow-hidden">
                <div className="p-3 bg-[#D4AF37]/10 flex gap-2 border-b border-[#D4AF37]/20"><span className="text-[#D4AF37]">📍</span><span className="text- font-bold tracking-widest">SOCIETY LOCATION</span></div>
                <div className="h- bg-gradient-to-br from-[#1a3a4a] to-[#0a2a3a] grid place-items-center"><div className="text-center"><div className="text-3xl">📍</div><div className="text- text-[#D4AF37] font-bold">Arihant Anchal</div><div className="text- opacity-60">Dali Bai Circle</div></div></div>
                <div className="p-3">
                  <div className="text- opacity-70">Arihant Anchal, Near Dali Bai Circle,<br/>Jodhpur, Rajasthan 342001</div>
                  <a href="https://maps.google.com/?q=Arihant+Anchal+Jodhpur" target="_blank" className="mt-3 w-full h-9 rounded-full bg-[#D4AF37] text-black font-bold text- grid place-items-center">Open in Google Maps →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
