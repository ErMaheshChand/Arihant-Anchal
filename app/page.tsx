import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white selection:bg-[#D4AF37]/30">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.96] border-b border-black/5">
        <div className="max-w- mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B1120] flex items-center justify-center font-serif font-bold text-[#D4AF37]">A</div>
            <div className="leading-tight">
              <div className="font-bold text- text-[#0B1120]">Arihant Anchal</div>
              <div className="text- text-black/60 -mt-1">Society & Club House • 530 Flats</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#F1F5F9]">
            <Link href="/" className="px-4 py-1.5 rounded-full bg-[#0B1120] text-white text- font-medium">Home</Link>
            <Link href="/about" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">About</Link>
            <Link href="/3d-view" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">Clubhouse</Link>
            <Link href="/amenities" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">Amenities</Link>
            <Link href="/gallery" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">Gallery</Link>
            <Link href="/events" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">Events</Link>
            <Link href="/notices" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">Notices</Link>
            <Link href="/contact" className="px-3 py-1.5 rounded-full text- text-black/70 hover:text-black">Contact</Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full bg-[#F1F5F9] text- text-black/60">
              <span>Q</span> Search <span className="ml-2 px-1.5 py-0.5 rounded bg-black/10 text-">⌘K</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center">🌙</div>
            <Link href="/login" className="px-4 h-9 rounded-full bg-[#0B1120] text-white text- font-bold flex items-center">Login</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background map blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8A8B6A]/40 via-[#0B1120]/80 to-[#0F766E]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.15),_transparent_60%)]" />

        <div className="relative max-w- mx-auto px-4 md:px-6 py-10 md:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text- tracking-widest uppercase">Near Dali Bai Circle • Jodhpur • 19 Towers</div>
            <h1 className="mt-5 text- md:text- leading-[0.95] font-serif font-bold tracking-tight">
              Welcome to Arihant Anchal <br /> Society & Club House
            </h1>
            <p className="mt-4 text- leading-relaxed text-white/70 max-w-">
              Smart Community • Better Living • Connected Neighbourhood — <span className="text-white">530</span> premium residences with 15,000 sqft clubhouse.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/login" className="px-5 h-10 rounded-full bg-white text-black text- font-medium flex items-center">Resident Login</Link>
              <Link href="/visitor" className="px-5 h-10 rounded-full bg-white text-black text- font-medium flex items-center">Visitor Entry</Link>
              <Link href="/clubhouse" className="px-5 h-10 rounded-full bg-white text-black text- font-medium flex items-center">Clubhouse Booking</Link>
              <Link href="/maintenance" className="px-5 h-10 rounded-full bg-white text-black text- font-medium flex items-center">Maintenance</Link>
              <Link href="/contact" className="px-5 h-10 rounded-full bg-white text-black text- font-medium flex items-center">Contact Society</Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-">
              <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-[#D4AF37]/20 backdrop-blur">
                <div className="text- font-bold font-serif">530</div>
                <div className="text- text-white/60 mt-1">Premium Flats</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-white/10 backdrop-blur">
                <div className="text- font-bold font-serif">19</div>
                <div className="text- text-white/60 mt-1">Towers A-S</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-white/10 backdrop-blur">
                <div className="text- font-bold font-serif">15k</div>
                <div className="text- text-white/60 mt-1">Clubhouse sqft</div>
              </div>
            </div>
          </div>

          {/* RIGHT - MAP CARDS */}
          <div className="relative h- md:h-">
            {/* Map placeholder */}
            <div className="absolute right-0 top-0 w-[92%] h-[72%] rounded- bg-[#CBD5E1] overflow-hidden border border-white/20 shadow-2xl rotate-[-2deg]">
              <div className="w-full h-full bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Jodhpur&zoom=13&size=600x400')] bg-cover opacity-60" />
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-red-500 rounded-full border-4 border-white -translate-x-1/2" />
            </div>

            {/* Swimming card */}
            <div className="absolute right-[5%] top-[18%] w-[62%] h-[52%] rounded- bg-gradient-to-br from-[#0F766E] to-[#0B1120] border border-white/10 shadow-2xl rotate-[-4deg] flex items-center justify-center">
              <div className="text-4xl">🏊‍♂️</div>
            </div>

            {/* Clubhouse view pill */}
            <div className="absolute left-0 bottom-[28%] w-[52%] p-3 rounded- bg-white/90 backdrop-blur border border-black/5 shadow-xl rotate-[-1deg]">
              <div className="text- text-black/50">Clubhouse View</div>
              <div className="absolute top-3 right-3 text- px-2 py-0.5 rounded-full bg-[#FEF08A] text-black">Live</div>
            </div>

            {/* Tonight card */}
            <div className="absolute left-[2%] bottom-[8%] w-[58%] p-4 rounded- bg-[#E5E7EB]/95 backdrop-blur border border-black/5 shadow-2xl rotate-">
              <div className="text- tracking-widest text-black/40">TONIGHT</div>
              <div className="mt-1 text- font-bold text-[#0B1120]">Badminton • 8 slots left</div>
              <div className="mt-3 h-1.5 rounded-full bg-black/10 overflow-hidden">
                <div className="h-full w-[72%] bg-[#D4AF37] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STATS */}
        <div className="relative max-w- mx-auto px-4 md:px-6 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              ['530','Flats'],
              ['487','Occupied'],
              ['19','Towers'],
              ['1,842','Residents'],
              ['127','Visitors Today'],
              ['₹18.7L','Collected'],
            ].map(([n,l])=>(
              <div key={l} className="h- px-4 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur flex items-center gap-2">
                <span className="font-serif font-bold text-">{n}</span>
                <span className="text- text-white/60 mt-0.5">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-center text- text-white/30 mt-6">© Arihant Anchal Society • Site developed by Er. Mahesh Chand – 8769909700</p>
        </div>
      </section>
    </div>
  )
}
