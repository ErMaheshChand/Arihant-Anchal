'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DailyReport() {
  const [visitors, setVisitors] = useState([])

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
       .from('visitors')
       .select('*')
       .gte('created_at', `${today}T00:00:00`)
       .lte('created_at', `${today}T23:59:59`)
       .order('created_at', { ascending: false })
      if (data) setVisitors(data)
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Arihant Anchal - Daily Report</h1>
      <h2>Total Today: {visitors.length}</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
        <thead><tr><th>Name</th><th>Flat</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>
          {visitors.map(v => (
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.flat_no || v.flate_no}</td>
              <td>{v.status}</td>
              <td>{new Date(v.created_at).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
