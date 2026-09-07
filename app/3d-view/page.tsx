import Link from 'next/link'
import Society3D from '../../components/Society3D'

export default function ThreeDViewPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/" className="text-sm text-[#D4AF37] font-semibold">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">3D Society View</h1>
        <p className="opacity-60 mt-1 mb-6">19 Towers A-S • 530 Flats • Near Dali Bai Circle, Jodhpur • Tower par click karo</p>
        <Society3D />
        <p className="text-center text-sm font-bold text-[#D4AF37] mt-8">@site developed by Er. Mahesh Chand-8769909700</p>
      </div>
    </div>
  )
}
