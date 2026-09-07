'use client'
import { useState } from 'react'
import Link from 'next/link'

type Role = 'resident' | 'admin' | 'guard'

export default function LoginPage() {
  const [role, setRole] = useState<Role>('resident')
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen bg-[#0B1120] text-white selection:bg-[#D4AF37]/30">
      {/* NAVBAR - same as Home */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.96] border-b border-black/5">
        <div className="max-w- mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B1120] flex items-center justify-center font-serif font-bold text-[#D4AF37]">A</div>
            <div className="leading-tight">
              <div className="font-bold text- text-[#0B1120]">Arihant Anchal</div>
              <div className="text- text-black/60 -mt-1">Society & Club House • 530 Flats</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-4 h-9 rounded-full bg-[#F1F5F9] text-black text- flex items-center">← Home</Link>
          </div>
        </div>
      </header>

      {/* BACKGROUND */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8A8B6A]/20 via-[#0B1120] to-[#0F766E]/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12),_transparent_60%)]" />

        <div className="relative max-w- mx-auto px-4 md:px-6 py-12 md:py-20 grid lg:grid-cols-[1fr_440px] gap-10 items-center">

          {/* LEFT INFO */}
          <div className="hidden lg:block">
            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text- tracking-widest uppercase">Secure Login • 6 Roles • RLS Protected</div>
            <h1 className="mt-6 text- leading-[0.9] font-serif font-bold">
              Welcome <span className="text-[#D4AF37]">Back</span><br/>to Anchal
            </h1>
            <p className="mt-4 text- text-white/60 max-w- leading-relaxed">
              Resident, Admin & Guard ke liye alag dashboard. Apna role select karke login karo.
              530 Flats, 19 Towers A-S, 15k sqft Clubhouse management.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-">
              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="text- text-white/50">RESIDENT</div>
                <div className="mt-1 text-">Flat, Maintenance, Visitors, Booking</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <div className="text- text-[#D4AF37]">ADMIN</div>
                <div className="mt-1 text-">All 34 Modules, Billing, RLS</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="text- text-white/50">GUARD</div>
                <div className="mt-1 text-">Gate Entry, QR Scan, Visitors Today</div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="w-full max-w- mx-auto">
            <div className="rounded- bg-white text-black shadow-2xl overflow-hidden border border-black/5">
              {/* Role Tabs */}
              <div className="p-2 bg-[#F1F5F9] flex gap-1">
                {[
                  { id: 'resident', label: 'Resident', icon: '🏠' },
                  { id: 'admin', label: 'Admin', icon: '🛡️' },
                  { id: 'guard', label: 'Guard', icon: '👮' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id as Role)}
                    className={`flex-1 h-10 rounded-full text- font-medium flex items-center justify-center gap-1.5 transition-all ${role===r.id? 'bg-[#0B1120] text-white shadow' : 'text-black/60 hover:text-black'}`}
                  >
                    <span>{r.icon}</span> {r.label}
                  </button>
                ))}
              </div>

              <div className="p-7">
                <h2 className="text- font-serif font-bold leading-tight">
                  {role==='resident' && 'Resident Login'}
                  {role==='admin' && 'Admin / Manager Login'}
                  {role==='guard' && 'Security Guard Login'}
                </h2>
                <p className="text- text-black/60 mt-1">
                  {role==='resident' && 'Tower & Flat number se login karo'}
                  {role==='admin' && 'Full access with 34 modules'}
                  {role==='guard' && 'Gate duty ke liye quick access'}
                </p>

                <div className="mt-6 space-y-4">
                  {role==='resident' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text- tracking-widest text-black/50">TOWER</label>
                        <select className="mt-1 w-full h-11 rounded-xl bg-[#F1F5F9] px-3 text- outline-none border border-transparent focus:border-[#D4AF37]">
                          <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                        </select>
                      </div>
                      <div>
                        <label className="text- tracking-widest text-black/50">FLAT NO</label>
                        <input placeholder="101" className="mt-1 w-full h-11 rounded-xl bg-[#F1F5F9] px-3 text- outline-none border border-transparent focus:border-[#D4AF37]" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text- tracking-widest text-black/50">
                      {role==='guard'? 'MOBILE / ID' : 'EMAIL / MOBILE'}
                    </label>
                    <input placeholder={role==='guard'? 'Guard ID / Mobile' : 'resident@email.com / 87699xxxxx'} className="mt-1 w-full h-11 rounded-xl bg-[#F1F5F9] px-3 text- outline-none border border-transparent focus:border-[#D4AF37]" />
                  </div>

                  <div>
                    <label className="text- tracking-widest text-black/50">PASSWORD</label>
                    <div className="mt-1 relative">
                      <input type={showPass? 'text' : 'password'} placeholder="••••••••" className="w-full h-11 rounded-xl bg-[#F1F5F9] px-3 pr-10 text- outline-none border border-transparent focus:border-[#D4AF37]" />
                      <button onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text- text-black/50">{showPass? 'Hide' : 'Show'}</button>
                    </div>
                  </div>

                  <button className="w-full h-11 rounded-full bg-[#0B1120] text-white text- font-bold hover:bg-black transition">
                    {role==='resident'? 'Login as Resident →' : role==='admin'? 'Login as Admin →' : 'Start Duty →'}
                  </button>

                  <div className="flex items-center justify-between text- text-black/50">
                    <Link href="#" className="hover:text-black">Forgot password?</Link>
                    <span className="px-2 py-1 rounded-full bg-[#FEF9C3] text- text-black">Demo: resident / 123456</span>
                  </div>
                </div>

                <div className="mt-7 pt-5 border-t border-black/5">
                  <div className="text- text-black/40 tracking-widest">DEMO ACCOUNTS</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-">
                    <div className="p-2 rounded-xl bg-[#F1F5F9]">🏠 Resident<br/><span className="text-black/50">A-101 / 123456</span></div>
                    <div className="p-2 rounded-xl bg-[#FEF9C3]">🛡️ Admin<br/><span className="text-black/50">admin / admin123</span></div>
                    <div className="p-2 rounded-xl bg-[#F1F5F9]">👮 Guard<br/><span className="text-black/50">guard1 / guard123</span></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text- text-white/30 mt-4">© Arihant Anchal • Er. Mahesh Chand – 8769909700</p>
          </div>
        </div>
      </div>
    </div>
  )
}
