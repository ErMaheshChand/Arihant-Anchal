'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function GuardDashboard() {
  const [flat, setFlat] = useState('B-302')
  const [showQR, setShowQR] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black">
      {/* HEADER - same as your screenshot */}
      <header className="sticky top-0 z-50 bg-white border-b border-black/5">
        <div className="max-w- mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B1120] flex items-center justify-center font-serif font-bold text-[#D4AF37]">A</div>
            <div className="leading-tight">
              <div className="font-bold text- text-[#0B1120]">Arihant Anchal</div>
              <div className="text- text-black/60 -mt-1">Society & Club House • 530 Flats</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#F1F5F9]">
            <Link href="/" className="px-4 py-1.5 rounded-full text-">Home</Link>
            <Link href="/about" className="px-3 py-1.5 text- text-black/60">About</Link>
            <Link href="/clubhouse" className="px-3 py-1.5 text- text-black/60">Clubhouse</Link>
            <Link href="/amenities" className="px-3 py-1.5 text- text-black/60">Amenities</Link>
            <Link href="/gallery" className="px-3 py-1.5 text- text-black/60">Gallery</Link>
            <Link href="/contact" className="px-3 py-1.5 text- text-black/60">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center">🌙</div>
            <div className="px-3 h-7 rounded-full bg-[#FEF9C3] text- flex items-center font-medium">Guard</div>
            <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center">↩</div>
          </div>
        </div>
      </header>

      <div className="max-w- mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text- font-serif font-bold">Guard Dashboard</h1>
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text- font-medium">On Duty • Gate 1</span>
        </div>

        {/* 6 CARDS - Exactly like screenshot */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button onClick={()=>setShowQR(true)} className="h- rounded- bg-[#0B1120] text-white flex flex-col items-center justify-center gap-2 shadow">
            <span className="text-">👤</span>
            <span className="text- font-bold tracking-wide">VISITOR ENTRY</span>
          </button>

          <button className="h- rounded- bg-white border border-black/5 shadow-sm flex flex-col items-center justify-center gap-2">
            <span className="text-">📦</span>
            <span className="text- font-bold tracking-wide">DELIVERY ENTRY</span>
          </button>

          <button className="h- rounded- bg-[#D4AF37] text-black flex flex-col items-center justify-center gap-2 shadow">
            <span className="text-">✅</span>
            <span className="text- font-bold tracking-wide">PRE-APPROVED VISITOR</span>
          </button>

          <button className="h- rounded- bg-white border border-black/5 shadow-sm flex flex-col items-center justify-center gap-2">
            <span className="text-">🚒</span>
            <span className="text- font-bold tracking-wide">VEHICLE ENTRY</span>
          </button>

          <button className="h- rounded- bg-[#F1F5F9] border border-black/5 shadow-sm flex flex-col items-center justify-center gap-2">
            <span className="text-">🔄</span>
            <span className="text- font-bold tracking-wide">VISITOR EXIT</span>
          </button>

          <button className="h- rounded- bg-[#DC2626] text-white flex flex-col items-center justify-center gap-2 shadow">
            <span className="text-">🚨</span>
            <span className="text- font-bold tracking-wide">EMERGENCY</span>
          </button>
        </div>

        {/* Flat Search - like screenshot */}
        <div className="mt-8 p-4 rounded- bg-white border border-black/5 shadow-sm">
          <div className="text- font-bold">Flat Search • Quick resident lookup</div>

          <div className="mt-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">Q</span>
            <input value={flat} onChange={e=>setFlat(e.target.value)} placeholder="Search Flat - e.g. B-302" className="w-full h-11 rounded-xl bg-[#F8FAFC] border border-black/5 pl-9 pr-3 text- outline-none focus:border-[#D4AF37]" />
          </div>

          <div className="mt-3 p-3 rounded-xl bg-[#FEF9C3]/60 border border-[#FDE68A] text-">
            Found: <span className="font-bold">B-302</span> • Aarav Sharma • 98765 43210 • Owner • Intercom 302
          </div>

          <div className="mt-4 space-y-3">
            <input placeholder="Visitor Name" className="w-full h-11 rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text- outline-none" />
            <input placeholder="Mobile" className="w-full h-11 rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text- outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select className="h-11 rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text- outline-none">
                <option>Purpose - Meeting, Delivery...</option>
                <option>Meeting</option><option>Delivery</option><option>Guest</option>
              </select>
              <input type="number" placeholder="No. of Persons" className="h-11 rounded-xl bg-[#F8FAFC] border border-black/5 px-3 text- outline-none" />
            </div>
            <button className="w-full h-12 rounded-full bg-[#0B1120] text-white font-bold text-">Approve & Generate QR →</button>
          </div>
        </div>

        {/* QR Modal */}
        {showQR && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowQR(false)}>
            <div className="w-full max-w- rounded- bg-white p-6 text-center shadow-2xl" onClick={e=>e.stopPropagation()}>
              <div className="text- font-bold">Visitor Entry QR</div>
              <div className="mt-4 w- h- mx-auto rounded-2xl bg-[#0B1120] flex items-center justify-center">
                <div className="w- h- bg-white rounded-xl flex items-center justify-center text-">QR CODE<br/>B-302 • {new Date().toLocaleTimeString()}<br/>Aarav Sharma</div>
              </div>
              <div className="mt-4 text- text-black/60">Show this QR at Gate • Valid 30 mins</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 h-10 rounded-full bg-[#F1F5F9] text-">Print</button>
                <button onClick={()=>setShowQR(false)} className="flex-1 h-10 rounded-full bg-[#0B1120] text-white text-">Done</button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text- text-black/30 mt-8">© Arihant Anchal • Guard System • Er. Mahesh Chand – 8769909700</p>
      </div>
    </div>
  )
}
