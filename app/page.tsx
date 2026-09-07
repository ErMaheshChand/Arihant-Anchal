import Link from 'next/link'
import ArihantApp from '@/components/ArihantApp'
export default function Page() {
  return (
    <>
      <ArihantApp />
      <Link
        href="/3d-view"
        className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full font-bold bg-[#D4AF37] text-black shadow-xl hover:scale-105 transition"
      >
        🏢 3D View
      </Link>
    </>
  )
}
