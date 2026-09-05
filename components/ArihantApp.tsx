
'use client'
import { useState } from 'react'

export default function ArihantApp() {
  const [name, setName] = useState('')
  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-white shadow p-4 text-center">
        <h1 className="text-2xl font-bold text-orange-700">Arihant Anchal Society - Jodhpur Nagar Vritt</h1>
        <p className="text-sm text-gray-600">Jodhpur Nagar Vritt | Jodhpur</p>
      </header>
      <main className="max-w-3xl mx-auto p-6 mt-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome</h2>
        <p className="text-gray-700 mb-4">Site successfully deployed on Vercel! Supabase connection ready.</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Apna naam likhe" className="border p-2 rounded w-full mb-3" />
        <button className="bg-orange-600 text-white px-4 py-2 rounded">Save</button>
        <p className="mt-6 text-xs text-gray-500">Build Fixed: @/components/ArihantApp, @/lib/supabase/server, @/lib/razorpay/server</p>
      </main>
    </div>
  )
}
