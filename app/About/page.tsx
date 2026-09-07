import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
const STATS = [
  { value: '18', label: 'Residential Towers' },
  { value: '532', label: 'Modern Flats' },
  { value: '24×7', label: 'Security & CCTV' },
  { value: '1', label: 'Premium Club House' },
]

const HIGHLIGHTS = [
  { icon: '🏢', title: '18 Residential Towers', desc: 'Well-planned towers with modern elevation and ventilation.' },
  { icon: '🏠', title: '532 Flats', desc: 'Spacious 2/3/4 BHK homes designed for family living.' },
  { icon: '🎭', title: 'Club House', desc: 'Indoor games, event hall and community spaces.' },
  { icon: '🏊', title: 'Swimming Pool & Gym', desc: 'Fitness and recreation for all age groups.' },
  { icon: '🌳', title: 'Green Gardens', desc: 'Landscaped parks, walking tracks and kids play area.' },
  { icon: '🛡️', title: '24×7 Security', desc: 'Gated campus with CCTV surveillance and guards.' },
  { icon: '🅿️', title: 'Ample Parking', desc: 'Dedicated parking for residents and visitors.' },
  { icon: '📍', title: 'Prime Location', desc: 'Near Dali Bai Circle, Jodhpur – 342001, Rajasthan.' },
]

  return (
    <>
      <SiteNav />
      <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>

        <h1 className="text-3xl md:text-4xl font-bold mt-4">
          About <span className="text-[#D4AF37]">Arihant Anchal</span>
        </h1>
        <p className="opacity-70 mt-2 text-sm">
          Near Dali Bai Circle, Jodhpur (Rajasthan) – 342001
        </p>

        <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-[#D4AF37]/30">
          <p className="leading-relaxed opacity-90">
            Arihant Anchal is a premium residential society in Jodhpur, spread across
            18 towers with 532 modern flats. With a fully-equipped club house,
            landscaped gardens and top-class amenities, it is designed for
            comfortable, secure and joyful family living.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {STATS.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-white/5 border border-[#D4AF37]/30 text-center">
              <div className="text-2xl font-bold text-[#D4AF37]">{s.value}</div>
              <div className="text-xs opacity-70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">Why Arihant Anchal? ✨</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl">{h.icon}</div>
              <div className="font-bold mt-2">{h.title}</div>
              <div className="text-sm opacity-70 mt-1">{h.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">
            🏢 3D Society View
          </Link>
          <Link href="/contact" className="px-6 py-3 rounded-full font-bold border border-[#D4AF37]/50 text-[#D4AF37]">
            📞 Contact Us
          </Link>
        </div>

        <p className="text-center text-xs opacity-50 mt-10 pb-6">
          © Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700
        </p>
           </div>
    </div>
    </>
  )
}
