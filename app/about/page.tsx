"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

const LINKS = [
  { label: 'Resident Login', href: '/resident/login', desc: 'Flat owners & tenants', icon: '🏠' },
  { label: 'Guard Login', href: '/guard/login', desc: 'Security access', icon: '🛡️' },
  { label: 'Admin Login', href: '/admin/daily-report', desc: 'Management portal', icon: '📊', live: true },
  { label: 'Clubhouse Booking', href: '/clubhouse/booking', desc: 'Events & facilities', icon: '🏸' },
  { label: 'Contact Society', href: '/contact', desc: 'Help & support', icon: '📞' },
];

const ITEMS = [
  { id:0, title:"Grand Entrance Towers", sub:"19 Towers • 530 Residences", grad:"from-[#1e3a5f] to-[#0f223a]", icon:"🏢" },
  { id:1, title:"Clubhouse", sub:"15,000 sqft Luxury Lounge", grad:"from-[#8b6914] to-[#5a4510]", icon:"🏛️" },
  { id:2, title:"Infinity Pool", sub:"Resort-style Pool", grad:"from-[#0f4c5c] to-[#0a2f3a]", icon:"🏊" },
  { id:3, title:"Lush Gardens", sub:"40% Open Space", grad:"from-[#1a4d2e] to-[#0f2d1a]", icon:"🌳" },
  { id:4, title:"Fitness Center", sub:"Modern Gym & Yoga", grad:"from-[#2a2a2a] to-[#1a1a1a]", icon:"💪" },
  { id:5, title:"24x7 Security", sub:"Gated + CCTV", grad:"from-[#1a1a2e] to-[#0f0f1f]", icon:"🛡️" },
];

export default function HomePage() {
  const [angle,setAngle]=useState(0)
  const [paused,setPaused]=useState(false)
  const [active,setActive]=useState(null)
  const raf=useRef(null)
  const last=useRef(0)

  useEffect(()=>{
    const loop=(t)=>{
      if(!last.current) last.current=t
      const dt=t-last.current; last.current=t
      if(!paused && active===null) setAngle(a=>(a+dt*0.015)%360)
      raf.current=requestAnimationFrame(loop)
    }
    raf.current=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(raf.current)
  },[paused,active])

  return (
    <>
      <SiteNav />
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="max-w- mx-auto px-4 py-8">

          {/* HEADER BADGE */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text- tracking-widest text-[#D4AF37]">NEAR DALI BAI CIRCLE • JODHPUR • 530 FLATS</div>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">Welcome to <span className="text-[#D4AF37]">Arihant Anchal</span><br/>Society & Club House</h1>
            <p className="opacity-60 text-sm mt-3 max-w-2xl mx-auto">Smart Community • 19 Towers A-S • 530 Premium Flats • 15,000 sqft Club House</p>
            <Link href="/" className="inline-block mt-2 text-xs text-[#D4AF37]">← Back to Home (You are here)</Link>
          </div>

          {/* MAIN 2-COL: 3D + SERVICES WITH GPS */}
          <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">

            {/* CENTER - 3D ROTATING - BIG */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="h- relative" style={{perspective:'1400px'}} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{setPaused(false);setActive(null)}}>
                <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  {active!==null? (
                    <div className="w- h- rounded-2xl bg-[#020617] border border-[#D4AF37] shadow-[0_20px_60px_rgba(212,175,55,0.4)] grid place-items-center text-center p-4">
                      <div className="text-3xl">{ITEMS[active].icon}</div>
                      <div className="font-bold mt-1">{ITEMS[active].title}</div>
                      <div className="text-xs text-[#D4AF37]">{ITEMS[active].sub}</div>
                    </div>
                  ) : (
                    <div className="w- h- rounded-full border border-dashed border-white/10 bg-white/5 grid place-items-center text- text-white/30">360°<br/>ROTATE</div>
                  )}
                </div>
                <div className="absolute left-1/2 top-1/2"><div style={{transform:`translate(-50%,-50%) rotateY(${angle}deg)`, transformStyle:'preserve-3d'}}>
                  {ITEMS.map((it,i)=>{
                    const r=230, th=i*(360/ITEMS.length)
                    return (
                      <div key={it.id} style={{position:'absolute', transform:`rotateY(${th}deg) translateZ(${r}px) translate(-50%,-50%)`, transformStyle:'preserve-3d'}}>
                        <button onMouseEnter={()=>setActive(it.id)} className={`h- w- rounded-xl border text- font-medium bg-white/5 backdrop-blur ${active===it.id?'border-[#D4AF37] scale-110':'border-white/10 hover:border-[#D4AF37]/40'}`}>
                          <div className="text-lg">{it.icon}</div>{it.title}<div className="text- opacity-50">{it.sub}</div>
                        </button>
                      </div>
                    )
                  })}
                </div></div>
              </div>
              <div className="text-center text- opacity-40 py-2 border-t border-white/5">Hover to pause • Hover card to enlarge in center</div>
            </div>

            {/* RIGHT - ONLY 5 LINKS + GPS AT BOTTOM */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 h-fit">
              <div className="flex justify-between items-center px-2 py-2">
                <span className="text- tracking-widest opacity-40">SOCIETY SERVICES</span>
                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-">5 ONLY</span>
              </div>
              <div className="space-y-2.5 mt-2">
                {LINKS.map(l=>(
                  <Link key={l.label} href={l.href} className="block rounded-xl bg-[#020617] border border-white/10 p-4 hover:border-[#D4AF37]/30 transition">
                    <div className="flex items-center gap-2 font-bold text-sm"><span>{l.icon}</span>{l.label} {l.live && <span className="text- px-1.5 py-0.5 rounded-full bg-red-500 animate-pulse text-white">LIVE</span>}</div>
                    <div className="text- opacity-50 mt-1">{l.desc}</div>
                    <div className="text- text-[#D4AF37] mt-2">Go → {l.href}</div>
                  </Link>
                ))}
              </div>

              {/* GPS LOCATION - SABSE NICHE */}
              <div className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#020617] overflow-hidden">
                <div className="p-3 bg-[#D4AF37]/10 flex items-center gap-2 text-[#D4AF37] font-bold text-xs">📍 SOCIETY LOCATION</div>
                <div className="h- bg-gradient-to-br from-[#1a3a4a] to-[#0f223a] relative grid place-items-center">
                  <div className="text-center">
                    <div className="text-3xl animate-bounce">📍</div>
                    <div className="text- text-[#D4AF37] mt-1">Arihant Anchal</div>
                    <div className="text- opacity-40">Dali Bai Circle, Jodhpur</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text- opacity-60 leading-snug">Arihant Anchal Society & Club House,<br/>Near Dali Bai Circle, Jodhpur,<br/>Rajasthan 342001</div>
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    <div className="rounded bg-white/5 p-2 text-center"><div className="font-bold text-xs">19</div><div className="text- opacity-40">TOWERS</div></div>
                    <div className="rounded bg-white/5 p-2 text-center"><div className="font-bold text-xs">530</div><div className="text- opacity-40">FLATS</div></div>
                    <div className="rounded bg-white/5 p-2 text-center"><div className="font-bold text-xs">15k</div><div className="text- opacity-40">CLUBHOUSE</div></div>
                  </div>
                  <a href="https://maps.google.com/?q=Arihant+Anchal+Jodhpur+Dali+Bai+Circle" target="_blank" className="mt-3 w-full h-9 rounded-full bg-[#D4AF37] text-black font-bold text-xs grid place-items-center">Open in Google Maps →</a>
                  <a href="https://maps.google.com/?q=Arihant+Anchal+Jodhpur" target="_blank" className="mt-2 w-full h-9 rounded-full border border-white/10 text-xs grid place-items-center hover:bg-white/5">Get Directions</a>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs opacity-30 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
        </div>
      </div>
    </>
  )
}
