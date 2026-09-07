'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ResidentApp() {
  const [tab, setTab] = useState<'home'|'visitors'|'bills'|'book'|'more'>('home')

  return (
    <div className="min-h- bg-[#F8FAFC] text-black flex flex-col">
      {/* TOP - App Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/5 px-4 h- flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0B1120] text-[#D4AF37] flex items-center justify-center font-bold">A</div>
          <div className="leading-tight">
            <div className="font-bold text-">B-302 • Aarav Sharma</div>
            <div className="text- text-black/50">Owner • Tower B • Intercom 302</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-[#F1F5F9]">🔔</button>
          <button className="w-9 h-9 rounded-full bg-[#F1F5F9]">👤</button>
        </div>
      </div>

      <div className="flex-1 max-w- w-full mx-auto px-4 py-4 pb-">

        {tab==='home' && (
          <>
            {/* BALANCE CARD */}
            <div className="rounded- bg-[#0B1120] text-white p-5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#D4AF37]/20" />
              <div className="text- tracking-widest opacity-60">MAINTENANCE DUE</div>
              <div className="mt-1 flex items-baseline gap-2"><span className="text- font-serif font-bold">₹2,450</span><span className="text- opacity-60">Due 10 Sep</span></div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 h-10 rounded-full bg-white text-black text- font-bold">Pay Now →</button>
                <button className="flex-1 h-10 rounded-full bg-white/10 text-white text-">History</button>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                {icon:'👤', label:'Add Visitor', id:'visitors'},
                {icon:'📦', label:'Delivery', id:'visitors'},
                {icon:'🎭', label:'Club Book', id:'book'},
                {icon:'🚗', label:'My Vehicles', id:'more'},
              ].map(a=>(
                <button key={a.label} onClick={()=>setTab(a.id as any)} className="flex flex-col items-center gap-1.5">
                  <div className="w- h- rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center text-">{a.icon}</div>
                  <span className="text- font-medium text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>

            {/* TODAY */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text- font-bold">Today at Anchal</div>
                <div className="text- px-2 py-1 rounded-full bg-[#DCFCE7]">Live</div>
              </div>
              <div className="mt-3 space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] flex items-center justify-center">🏸</div>
                    <div><div className="text- font-bold">Badminton • 7 PM</div><div className="text- text-black/50">Court 1 booked by you</div></div>
                  </div>
                  <span className="text- px-2 py-1 rounded-full bg-[#0B1120] text-white">Your Slot</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/5">
                  <div className="text- font-bold">Visitors Today • 3</div>
                  <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#F1F5F9] text-">Zomato 10:30 AM ✓</div>
                    <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#FEF9C3] text-">Electrician - Inside</div>
                    <div className="shrink-0 px-3 py-1.5 rounded-full bg-white border text-">Guest 6 PM - Expected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SOCIETY FEED */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-black/5">
              <div className="text- font-bold">Society Notices</div>
              <div className="mt-3 space-y-2">
                <div className="text-">🔧 Lift B maintenance - 9 Sep 10am-2pm</div>
                <div className="text-">🎉 Ganesh Utsav meeting - Clubhouse 8 PM</div>
              </div>
            </div>
          </>
        )}

        {tab==='visitors' && (
          <div>
            <h2 className="text- font-bold font-serif">Pre-Approve Visitor</h2>
            <p className="text- text-black/50 mt-1">Guard ko auto alert jayega, QR banega</p>

            <div className="mt-5 p-4 rounded- bg-white border border-black/5 space-y-3">
              <input placeholder="Visitor Name *" className="w-full h- rounded-xl bg-[#F8FAFC] border px-4 text-" />
              <input placeholder="Mobile Number" inputMode="numeric" className="w-full h- rounded-xl bg-[#F8FAFC] border px-4 text-" />
              <div className="grid grid-cols-2 gap-3">
                <select className="h- rounded-xl bg-[#F8FAFC] border px-3 text-"><option>Guest</option><option>Delivery</option><option>Service</option></select>
                <input type="date" className="h- rounded-xl bg-[#F8FAFC] border px-3 text-" />
              </div>
              <select className="w-full h- rounded-xl bg-[#F8FAFC] border px-3 text-"><option>Valid for Today only</option><option>Valid for 2 Days</option></select>
              <button className="w-full h- rounded-full bg-[#0B1120] text-white font-bold">Generate QR & Notify Guard →</button>
            </div>

            <div className="mt-6">
              <div className="text- font-bold">My Active Passes • 2</div>
              <div className="mt-3 p-4 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex justify-between items-center">
                <div><div className="text- font-bold">Aunt • Today 6 PM</div><div className="text- text-black/60">QR: AN-302-4821 • Valid till 10 PM</div></div>
                <button className="px-4 h-8 rounded-full bg-[#0B1120] text-white text-">Show QR</button>
              </div>
            </div>
          </div>
        )}

        {tab==='bills' && (
          <div>
            <h2 className="text- font-bold font-serif">Bills & Payments</h2>
            <div className="mt-4 p-5 rounded- bg-[#0B1120] text-white">
              <div className="text- opacity-60">TOTAL DUE</div>
              <div className="text- font-bold">₹2,450</div>
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-[#D4AF37]" /></div>
              <button className="mt-4 w-full h-11 rounded-full bg-white text-black font-bold">Pay with UPI / Razorpay</button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="p-4 rounded-2xl bg-white border flex justify-between"><span className="text-">Aug Maintenance</span><span className="text- font-bold text-[#16A34A]">Paid ✓</span></div>
              <div className="p-4 rounded-2xl bg-white border flex justify-between"><span className="text-">Sep Maintenance</span><span className="text- font-bold text-[#DC2626]">Due</span></div>
            </div>
          </div>
        )}

        {tab==='book' && (
          <div>
            <h2 className="text- font-bold font-serif">Clubhouse Booking</h2>
            <div className="mt-4 grid gap-3">
              {[
                {name:'Badminton Court', price:'₹100/hr', left:'8 slots'},
                {name:'Party Hall AC', price:'₹2500/event', left:'2 slots'},
              ].map(f=>(
                <div key={f.name} className="p-4 rounded-2xl bg-white border flex justify-between items-center">
                  <div><div className="font-bold text-">{f.name}</div><div className="text- text-black/50">{f.price} • {f.left}</div></div>
                  <Link href="/clubhouse" className="px-4 h-8 rounded-full bg-[#0B1120] text-white text- flex items-center">Book</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='more' && (
          <div className="space-y-3">
            <h2 className="text- font-bold font-serif">My Profile & More</h2>
            <div className="p-4 rounded-2xl bg-white border">🏠 B-302 • Owner • 2 Vehicles • 4 Members</div>
            <Link href="/about" className="block p-4 rounded-2xl bg-white border">ℹ️ About Society • 19 Towers</Link>
            <Link href="/contact" className="block p-4 rounded-2xl bg-white border">📞 Contact Society • 8769909700</Link>
            <div className="p-4 rounded-2xl bg-[#0B1120] text-white text-">Developed by Er. Mahesh Chand • 8769909700</div>
          </div>
        )}

      </div>

      {/* BOTTOM TAB BAR - App Like */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-black/5">
        <div className="max-w- mx-auto grid grid-cols-5 gap-1 px-2 py-2">
          {[
            {id:'home', icon:'🏠', label:'Home'},
            {id:'visitors', icon:'👤', label:'Visitors'},
            {id:'book', icon:'🎭', label:'Book'},
            {id:'bills', icon:'💳', label:'Bills'},
            {id:'more', icon:'☰', label:'More'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`h- rounded-xl flex flex-col items-center justify-center transition ${tab===t.id?'bg-[#0B1120] text-white':'text-black/50'}`}>
              <span className="text-">{t.icon}</span>
              <span className="text- mt-0.5 font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
