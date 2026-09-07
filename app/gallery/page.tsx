import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

const IMAGES = [
  { id: 1, title: 'Main Entrance', cat: 'Exterior' },
  { id: 2, title: 'Club House Night View', cat: 'Club House' },
  { id: 3, title: 'Swimming Pool', cat: 'Amenities' },
  { id: 4, title: 'Garden & Play Area', cat: 'Garden' },
  { id: 5, title: 'Tower Elevation', cat: 'Exterior' },
  { id: 6, title: '3D Society View', cat: '3D View' },
]

export default function GalleryPage() {
  return (
    <>
      <SiteNav />
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>

          <h1 className="text-3xl font-bold mt-4">Gallery – <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
          <p className="opacity-70 text-sm mt-2">Real photos & 3D renders of our premium society.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {IMAGES.map(img => (
              <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center">
                  <span className="text-4xl opacity-30">🏢</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs opacity-60">{img.cat}</p>
                  <p className="text-sm font-bold">{img.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <p className="text-sm"><span className="font-bold text-[#D4AF37]">Note:</span> Abhi demo images hain. Aap real society photos `/public/gallery/` me daal sakte ho, main code se connect kar dunga.</p>
          </div>

          <div className="flex gap-3 mt-8">
            <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">🏢 3D View</Link>
            <Link href="/contact" className="px-6 py-3 rounded-full font-bold border border-white/20">Contact</Link>
          </div>

          <p className="text-center text-xs opacity-50 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
        </div>
      </div>
    </>
  )
}
