import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>

          <h1 className="text-3xl md:text-4xl font-bold mt-4">
            About <span className="text-[#D4AF37]">Arihant Anchal</span>
          </h1>
          <p className="opacity-70 text-sm mt-2">Near Dali Bai Circle, Jodhpur – 342001 | 530 Flats | 19 Towers A-S</p>

          <div className="mt-6 space-y-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="font-bold text-[#D4AF37] text-lg">🏢 Our Society</h2>
              <p className="text-sm opacity-80 mt-3 leading-relaxed">
                Arihant Anchal Society & Club House is a premium gated township located near Dali Bai Circle, Jodhpur. 
                With 530 flats across 19 Towers (A to S), it offers modern living with Rajasthani heritage touch, 
                glassmorphism design, and gold #D4AF37 theme.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <h3 className="font-bold">✨ Highlights</h3>
                <ul className="text-sm opacity-80 mt-3 space-y-1.5 list-disc ml-4">
                  <li>19 Towers (A-S) with modern elevation</li>
                  <li>530 Premium Flats</li>
                  <li>Club House with AC hall & indoor games</li>
                  <li>Swimming Pool, Gym, Garden</li>
                  <li>24×7 Security, CCTV, Intercom</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold">🎯 Vision</h3>
                <p className="text-sm opacity-80 mt-3 leading-relaxed">
                  To provide a safe, luxurious, and community-driven living experience 
                  with full digital management – resident management, visitor QR, 
                  parking map, maintenance billing, complaints and more.
                </p>
                <p className="text-xs opacity-60 mt-4">Stack: Next.js 15 + Supabase + Premium 3D</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold">👨‍💻 Developed By</h3>
              <p className="text-sm mt-2"><span className="text-[#D4AF37] font-bold">Er. Mahesh Chand</span> – 8769909700</p>
              <p className="text-xs opacity-60 mt-1">Full-stack Premium SPA with 6 roles, 34 modules, RLS & seed data</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/amenities" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">View Amenities</Link>
            <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold border border-[#D4AF37]/50 text-[#D4AF37]">🏢 3D View</Link>
            <Link href="/contact" className="px-6 py-3 rounded-full font-bold border border-white/20">Contact Us</Link>
          </div>

          <p className="text-center text-xs opacity-50 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
        </div>
      </div>
    </>
  )
}
