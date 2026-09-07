'use client'
import { useState } from 'react'
import Link from 'next/link'

const FACILITIES = [
  { id: 'badminton', name: 'Badminton Court', icon: '🏸', price: '₹100 / hr', slots: '6 AM - 10 PM', left: '8 slots left' },
  { id: 'hall', name: 'AC Party Hall', icon: '🎭', price: '₹2500 / event', slots: '9 AM - 11 PM', left: '2 slots left' },
  { id: 'gym', name: 'Gym', icon: '💪', price: 'Free for Residents', slots: '5 AM - 10 PM', left: 'Open' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', price: 'Free', slots: '6 AM - 8 PM', left: 'Live' },
  { id: 'tabletennis', name: 'Table Tennis', icon: '🏓', price: '₹50 / hr', slots: '6 AM - 10 PM', left: '4 slots left' },
]

const TIMES = ['06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','06:00 PM','07:00 PM','08:00 PM','09:00 PM']

export default function ClubhousePage() {
  const [selected, setSelected] = useState('badminton')
  const [date, setDate] = useState('Today')
  const [time, setTime] = useState('07:00 PM')

  const fac = FACILITIES.find(f=>f.id===selected)!

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* NAV - same as Home */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.96] border-b border-black/5">
        <div className="max-w- mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B1120] flex items-center justify-center font-serif font-bold text-[#D4AF37]">A</div>
            <div className="leading-tight">
              <div className="font-bold text- text-[#0B1120]">Arihant Anchal</div>
              <div className="text- text-black/60 -mt-1">Clubhouse Booking • 15k sqft</div>
            </div>
          </Link>
          <Link href="/" className="px-4 h-9 rounded-full bg-[#F1F5F9] text-black text- flex items-center">← Home</Link>
        </div>
      </header>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8A8B6A]/15 via-[#0B1120] to-[#0F766E]/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12),_transparent_60%)]" />

        <div className="relative max-w- mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text- tracking-widest uppercase">Near Dali Bai Circle • 19 Towers • 530 Flats</div>
          <h1 className="mt-4 text- md:text- leading-[0.9] font-serif font-bold">Clubhouse <span className="text-[#D4AF37]">Booking</span></h1>
          <p className="mt-2 text- text-white/60">Book badminton, party hall, gym slot — live availability.</p>

          <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-6 items-start">
            {/* LEFT - Facilities */}
            <div className="space-y-3">
              {FACILITIES.map(f=>(
                <button key={f.id} onClick={()=>setSelected(f.id)} className={`w-full text-left p-4 rounded- border transition-all ${selected===f.id? 'bg-white text-black border-black/5 shadow-xl scale-[1.02]' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.09] text-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-">{f.icon}</div>
                      <div>
                        <div className="text- font-bold">{f.name}</div>
                        <div className={`text- ${selected===f.id? 'text-black/60' : 'text-white/50'}`}>{f.slots} • {f.price}</div>
                      </div>
                    </div>
                    <span className={`text- px-2 py-1 rounded-full ${f.left==='Live'? 'bg-[#FEF08A] text-black' : 'bg-[#F1F5F9] text-black/70'} ${selected===f.id? '' : 'bg-white/10 text-white/70'}`}>{f.left}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* RIGHT - Booking Card */}
            <div className="rounded- bg-white text-black shadow-2xl overflow-hidden border border-black/5">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B1120] flex items-center justify-center text-">{fac.icon}</div>
                  <div>
                    <div className="text- font-serif font-bold">{fac.name}</div>
                    <div className="text- text-black/60">{fac.price} • Tonight: {fac.left}</div>
                  </div>
                </div>

                {/* Date */}
                <div className="mt-6">
                  <div className="text- tracking-widest text-black/50">SELECT DATE</div>
                  <div className="mt-2 flex gap-2">
                    {['Today','Tomorrow','12 Sep','13 Sep'].map(d=>(
                      <button key={d} onClick={()=>setDate(d)} className={`px-4 h-9 rounded-full text- border ${date===d? 'bg-[#0B1120] text-white border-[#0B1120]' : 'bg-[#F1F5F9] text-black/70 border-black/5'}`}>{d}</button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="mt-6">
                  <div className="text- tracking-widest text-black/50">SELECT SLOT</div>
                  <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {TIMES.map(t=>(
                      <button key={t} onClick={()=>setTime(t)} className={`h-10 rounded-full text- border font-medium ${time===t? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-[#F1F5F9] text-black/70 border-black/5 hover:bg-black/5'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 rounded-2xl bg-[#F8FAFC] border border-black/5">
                  <div className="flex justify-between text-">
                    <span className="text-black/60">Facility</span><span className="font-bold">{fac.name}</span>
                  </div>
                  <div className="flex justify-between text- mt-2">
                    <span className="text-black/60">Date & Time</span><span className="font-bold">{date} • {time}</span>
                  </div>
                  <div className="flex justify-between text- mt-2">
                    <span className="text-black/60">Charges</span><span className="font-bold text-[#0B1120]">{fac.price}</span>
                  </div>
                </div>

                <button className="mt-5 w-full h-12 rounded-full bg-[#0B1120] text-white font-bold text- hover:bg-black">Confirm Booking →</button>
                <p className="text-center text- text-black/40 mt-3">Free cancellation 2 hrs before. Payment at clubhouse desk.</p>
              </div>
            </div>
          </div>

          <p className="text-center text- text-white/30 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
        </div>
      </div>
    </div>
  )
}
