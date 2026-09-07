import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
const AMENITIES = [
  { icon: '🏊', title: 'Swimming Pool', desc: 'Crystal clear pool with kids section and lifeguard.' },
  { icon: '💪', title: 'Modern Gym', desc: 'Fully-equipped gym with trainer for residents.' },
  { icon: '🎭', title: 'Club House', desc: 'AC hall, indoor games, party & event space.' },
  { icon: '🌳', title: 'Landscaped Garden', desc: 'Lush green parks, walking track, senior citizen area.' },
  { icon: '🏏', title: 'Kids Play & Sports', desc: 'Playground, badminton court and play equipment.' },
  { icon: '🛡️', title: '24×7 Security', desc: 'Gated society, CCTV, intercom & professional guards.' },
  { icon: '🅿️', title: 'Parking', desc: 'Covered & open parking for all flats + visitor parking.' },
  { icon: '🔌', title: 'Power Backup', desc: 'Lift & common area power backup.' },
]

return (
  <>
    <SiteNav />
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-4">Amenities at <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
        <p className="opacity-70 text-sm mt-2">Premium living with everything you need inside campus.</p>

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          {AMENITIES.map(a => (
            <div key={a.title} className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl">{a.icon}</div>
              <div className="font-bold mt-2">{a.title}</div>
              <div className="text-sm opacity-70 mt-1">{a.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">🏢 3D View</Link>
          <Link href="/about" className="px-6 py-3 rounded-full font-bold border border-[#D4AF37]/50 text-[#D4AF37]">About Society</Link>
        </div>

        <p className="text-center text-xs opacity-50 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
      </div>
    </div>
    </>
  )
}
