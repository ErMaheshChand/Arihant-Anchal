import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/amenities', label: 'Amenities' },
  { href: '/3d-view', label: '3D View' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-[#020617]/90 border-b border-[#D4AF37]/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-[#D4AF37]">Arihant Anchal</Link>
        <div className="flex gap-2 overflow-x-auto">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text- px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
