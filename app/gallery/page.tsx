import Link from 'next/link'

const IMAGES = [
  { title: 'Tower Elevation', tag: 'Exterior' },
  { title: 'Club House Interior', tag: 'Club' },
  { title: 'Swimming Pool', tag: 'Amenities' },
  { title: 'Landscaped Garden', tag: 'Green' },
  { title: 'Kids Play Area', tag: 'Kids' },
  { title: 'Gym & Fitness', tag: 'Fitness' },
  { title: 'Lobby & Entrance', tag: 'Interior' },
  { title: 'Parking Area', tag: 'Parking' },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>
        
        <h1 className="text-3xl font-bold mt-4">Gallery - <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
        <p className="opacity-70 text-sm mt-2">19 Towers A-S | 530 Flats | Premium Views</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {IMAGES.map(img => (
            <div key={img.title} className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 transition">
              <div className="h-32 bg-gradient-to-br from-[#D4AF37]/20 to-black/50 flex items-center justify-center text-3xl">
                🏢
              </div>
              <div className="p-3">
                <div className="text-xs px-2 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] inline-block">{img.tag}</div>
                <div className="font-bold text-sm mt-2">{img.title}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-sm">
          <p className="opacity-80">📸 Note: Abhi placeholder images hain. Aapke asli photos (tower, flat, clubhouse) ko <code className="px-1 bg-black/30 rounded">public/gallery/</code> folder me daal kar yaha dikha sakte hain.</p>
        </div>

        <div className="flex gap-3 mt-8">
          <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">🏢 3D View</Link>
          <Link href="/contact" className="px-6 py-3 rounded-full font-bold border border-[#D4AF37]/50 text-[#D4AF37]">Contact</Link>
        </div>

        <p className="text-center text-xs opacity-50 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
      </div>
    </div>
  )
}
