import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>

          <h1 className="text-3xl font-bold mt-4">Contact <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
          <p className="opacity-70 text-sm mt-2">Near Dali Bai Circle, Jodhpur – 342001</p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-6 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <h3 className="font-bold text-[#D4AF37]">📞 Society Office</h3>
              <p className="text-sm mt-3">Manager: +91-XXXXXXXXXX</p>
              <p className="text-sm mt-1">Security Gate: +91-XXXXXXXXXX</p>
              <p className="text-sm mt-3 opacity-70">Email: arihantanchal@gmail.com</p>
              <p className="text-xs mt-4 opacity-60">Timing: 10 AM - 6 PM</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold">👨‍💻 Developer Contact</h3>
              <p className="text-sm mt-3"><span className="font-bold text-[#D4AF37]">Er. Mahesh Chand</span></p>
              <p className="text-sm mt-1">📱 8769909700</p>
              <p className="text-sm mt-1 opacity-70">For website support, updates, 3D view</p>
              <a href="tel:8769909700" className="inline-block mt-4 px-5 py-2 rounded-full bg-[#D4AF37] text-black font-bold text-sm">Call Now</a>
            </div>
          </div>

          <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-bold">📍 Location</h3>
            <p className="text-sm opacity-80 mt-2">Arihant Anchal Society & Club House, Near Dali Bai Circle, Jodhpur – 342001, Rajasthan</p>
            <a href="https://maps.google.com/?q=Arihant+Anchal+Jodhpur" target="_blank" className="inline-block mt-4 px-5 py-2 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] text-sm">Open in Google Maps</a>
          </div>

          <div className="flex gap-3 mt-8">
            <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">🏢 3D View</Link>
            <Link href="/gallery" className="px-6 py-3 rounded-full font-bold border border-white/20">Gallery</Link>
          </div>

          <p className="text-center text-xs opacity-50 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
        </div>
      </div>
    </>
  )
}
