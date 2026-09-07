'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function GuardMobile() {
  const [flat, setFlat] = useState('B-302')
  const [visitor, setVisitor] = useState('')
  const [mobile, setMobile] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [tab, setTab] = useState<'entry'|'approved'|'exit'>('entry')

  return (
    <div className="min-h- bg-[#F8FAFC] text-black flex flex-col">
      {/* TOP BAR - Mobile */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/5 px-4 h- flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B1120] flex items-center justify-center font-bold text-[#D4AF37] text-">A</div>
          <div>
            <div className="font-bold text- leading-none">Arihant Anchal</div>
            <div className="text- text-black/50">Gate 1 • On Duty</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text- font-bold">● LIVE</span>
          <Link href="/" className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-">⌂</Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 max-w- w-full mx-auto px-4 py-4 pb-">

        {/* QUICK STATS - Mobile chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#0B1120] text-white text-">127 Visitors Today</div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#FEF9C3] text-black text-">12 Inside</div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-white border text-">B-302 Found</div>
        </div>

        {/* 6 ACTION GRID - Big touch targets */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={()=>{setTab('entry'); setShowQR(false); window.scrollTo(0,400)}} className="h- rounded- bg-[#0B1120] text-white flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition">
            <span className="text-">👤</span>
            <span className="text- font-bold tracking-wider">VISITOR ENTRY</span>
            <span className="text- opacity-60">Tap to add</span>
          </button>
          <button className="h- rounded- bg-white border border-black/5 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-[0.98]">
            <span className="text-">📦</span>
            <span className="text- font-bold">DELIVERY ENTRY</span>
          </button>
          <button onClick={()=>setTab('approved')} className="h- rounded- bg-[#D4AF37] text-black flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] shadow">
            <span className="text-">✅</span>
            <span className="text- font-bold">PRE-APPROVED</span>
            <span className="text- opacity-70">3 waiting</span>
          </button>
          <button className="h- rounded- bg-white border border-black/5 shadow-sm flex flex-col items-center justify-center gap-1.5">
            <span className="text-">🚗</span>
            <span className="text- font-bold">VEHICLE ENTRY</span>
          </button>
          <button onClick={()=>setTab('exit')} className="h- rounded- bg-[#F1F5F9] border border-black/5 flex flex-col items-center justify-center gap-1.5">
            <span className="text-">↩️</span>
            <span className="text- font-bold">VISITOR EXIT</span>
          </button>
          <button className="h- rounded- bg-[#DC2626] text-white flex flex-col items-center justify-center gap-1.5 active:scale-[0.98]">
            <span className="text-">🚨</span>
            <span className="text- font-bold">EMERGENCY</span>
          </button>
        </div>

        {/* FLAT SEARCH - Sticky searchable */}
        <div className="mt-5 p-4 rounded- bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text- font-bold">Flat Search</div>
            <div className="text- px-2 py-1 rounded-full bg-[#F1F5F9]">Quick lookup</div>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30">⌕</span>
              <input value={flat} onChange={e=>setFlat(e.target.value)} className="w-full h- rounded-xl bg-[#F8FAFC] border border-black/5 pl-9 pr-3 text- font-medium outline-none focus:border-[#D4AF37]" placeholder="B-302" inputMode="text" />
            </div>
            <button className="w- h- rounded-xl bg-[#0B1120] text-white text-">📷</button>
          </div>

          {/* Result */}
          <div className="mt-3 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex gap-2">
            <div className="w-9 h-9 rounded-full bg-[#0B1120] text-white flex items-center justify-center text- font-bold">AS</div>
            <div className="text- leading-tight">
              <div className="font-bold">B-302 • Aarav Sharma • Owner</div>
              <div className="text-black/60 mt-0.5">98765 43210 • Intercom 302 • Tower B</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex p-1 rounded-full bg-[#F1F5F9]">
            <button onClick={()=>setTab('entry')} className={`flex-1 h-8 rounded-full text- font-medium ${tab==='entry'?'bg-white shadow text-black':'text-black/50'}`}>New Entry</button>
            <button onClick={()=>setTab('approved')} className={`flex-1 h-8 rounded-full text- font-medium ${tab==='approved'?'bg-white shadow text-black':'text-black/50'}`}>Approved (3)</button>
            <button onClick={()=>setTab('exit')} className={`flex-1 h-8 rounded-full text- font-medium ${tab==='exit'?'bg-white shadow text-black':'text-black/50'}`}>Exit</button>
          </div>

          {tab==='entry' && (
            <div className="mt-4 space-y-3">
              <input value={visitor} onChange={e=>setVisitor(e.target.value)} placeholder="Visitor Name *" className="w-full h- rounded-xl bg-[#F8FAFC] border border-black/5 px-4 text- outline-none focus:border-[#D4AF37]" />
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile Number *" inputMode="numeric" className="w-full h- rounded-xl bg-[#F8FAFC] border border-black/5 px-4 text- outline-none focus:border-[#D4AF37]" />
              <div className="grid grid-cols-2 gap-3">
                <select className="h- rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text-">
                  <option>Meeting</option><option>Delivery</option><option>Guest</option><option>Service</option>
                </select>
                <select className="h- rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text-">
                  <option>1 Person</option><option>2 Persons</option><option>3 Persons</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 h- rounded-xl border border-black/10 text-">📷 Photo</button>
                <button className="flex-1 h- rounded-xl border border-black/10 text-">🆔 ID</button>
              </div>
              <button onClick={()=>setShowQR(true)} className="w-full h- rounded-full bg-[#0B1120] text-white font-bold text- active:scale-[0.98]">Approve & QR →</button>
              <div className="text-center text- text-black/40">Resident ko auto SMS + Intercom alert jayega</div>
            </div>
          )}

          {tab==='approved' && (
            <div className="mt-4 space-y-2">
              {[
                {name:'Rahul - Zomato', flat:'A-101', time:'5 min ago'},
                {name:'Electrician', flat:'B-302', time:'12 min ago'},
                {name:'Aunt', flat:'C-504', time:'Pre-approved'},
              ].map((v,i)=>(
                <div key={i} className="p-3 rounded-xl bg-[#F8FAFC] border border-black/5 flex items-center justify-between">
                  <div><div className="text- font-bold">{v.name}</div><div className="text- text-black/60">{v.flat} • {v.time}</div></div>
                  <button onClick={()=>setShowQR(true)} className="px-4 h-8 rounded-full bg-[#0B1120] text-white text-">QR</button>
                </div>
              ))}
            </div>
          )}

          {tab==='exit' && (
            <div className="mt-4">
              <input placeholder="Scan QR / Enter Visitor ID" className="w-full h- rounded-xl bg-[#F8FAFC] border border-black/5 px-4 text-" />
              <button className="mt-3 w-full h- rounded-full bg-[#DC2626] text-white font-bold">Mark Exit →</button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV - Mobile thumb */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-black/5 px-2 py-2 safe-area">
        <div className="max-w- mx-auto grid grid-cols-4 gap-1">
          <button className="h- rounded-xl bg-[#0B1120] text-white flex flex-col items-center justify-center"><span>🏠</span><span className="text- mt-0.5">Home</span></button>
          <button className="h- rounded-xl bg-[#F1F5F9] flex flex-col items-center justify-center"><span>📷</span><span className="text-">Scan</span></button>
          <button className="h- rounded-xl bg-[#F1F5F9] flex flex-col items-center justify-center"><span>📋</span><span className="text-">Log</span></button>
          <button className="h- rounded-xl bg-[#F1F5F9] flex flex-col items-center justify-center"><span>👮</span><span className="text-">Guard</span></button>
        </div>
      </div>

      {/* QR SHEET - Bottom sheet for mobile */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0" onClick={()=>setShowQR(false)}>
          <div className="w-full max-w- bg-white rounded-t- p-6 pb-10 shadow-2xl animate-slide-up" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-4" />
            <div className="text-center">
              <div className="text- font-bold tracking-widest">VISITOR PASS</div>
              <div className="text- text-black/50 mt-1">B-302 • Aarav Sharma • Valid 30 min</div>
              <div className="mt-5 mx-auto w- h- rounded- bg-[#0B1120] p-3">
                <div className="w-full h-full bg-white rounded- flex flex-col items-center justify-center">
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({length:36}).map((_,i)=><div key={i} className={`w-5 h-5 ${Math.random()>0.5?'bg-black':'bg-white'}`} />)}
                  </div>
                  <div className="mt-2 text- font-bold">QR-{flat}-{Date.now().toString().slice(-4)}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 h-12 rounded-full border border-black/10 text-">🖨️ Print</button>
                <button className="flex-1 h-12 rounded-full bg-[#0B1120] text-white text- font-bold">WhatsApp Resident</button>
              </div>
              <button onClick={()=>setShowQR(false)} className="mt-3 w-full h-12 rounded-full bg-[#F1F5F9] text-">Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.safe-area{padding-bottom:env(safe-area-inset-bottom)}`}</style>
    </div>
  )
}
