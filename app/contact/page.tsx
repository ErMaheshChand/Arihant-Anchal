import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[#D4AF37]">← Back to Home</Link>
        
        <h1 className="text-3xl font-bold mt-4">Contact <span className="text-[#D4AF37]">Arihant Anchal</span></h1>
        <p className="opacity-70 text-sm mt-2">Near Dali Bai Circle, Jodhpur – 342001, Rajasthan</p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-[#D4AF37]/30">
            <h3 className="font-bold text-[#D4AF37]">📍 Society Address</h3>
            <p className="text-sm opacity-80 mt-2 leading-relaxed">
              Arihant Anchal Society & Club House,<br/>
              Near Dali Bai Circle,<br/>
              Jodhpur – 342001, Rajasthan, India
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>📞 <span className="opacity-70">Admin:</span> +91 8769909700</p>
              <p>📧 <span className="opacity-70">Email:</span> arihant.anchal@society.com</p>
              <p>🕒 <span className="opacity-70">Office:</span> 10 AM – 6 PM (Mon-Sat)</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-bold">✉️ Quick Enquiry</h3>
            <p className="text-xs opacity-60 mt-2">Form demo hai - Supabase se connect baad me karenge</p>
            <div className="mt-4 space-y-3">
              <input placeholder="Your Name" className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-sm outline-none focus:border-[#D4AF37]" />
              <input placeholder="Phone / Flat No." className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-sm outline-none focus:border-[#D4AF37]" />
              <textarea placeholder="Message" rows={3} className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-sm outline-none focus:border-[#D4AF37]"></textarea>
              <button className="w-full py-3 rounded-xl font-bold bg-[#D4AF37] text-black">Send Message</button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-sm opacity-80">🗺️ Map</p>
          <p className="text-xs opacity-50 mt-1">Google Maps embed yaha lagega - location: Dali Bai Circle, Jodhpur</p>
          <div className="mt-3 h-32 rounded-xl bg-black/40 flex items-center justify-center text-xs opacity-50">
            [ Map Placeholder - 342001 Jodhpur ]
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Link href="/3d-view" className="px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black">🏢 3D View</Link>
          <Link href="/amenities" className="px-6 py-3 rounded-full font-bold border border-[#D4AF37]/50 text-[#D4AF37]">Amenities</Link>
        </div>

        <p className="text-center text-xs opacity-50 mt-10">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
      </div>
    </div>
  )
}
