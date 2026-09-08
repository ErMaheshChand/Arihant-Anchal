import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DailyReport() {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({total:0, approved:0, pending:0})

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('visitors').select('*').gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).order('created_at', {ascending:false})
      if(data) {
        setVisitors(data)
        setStats({
          total: data.length,
          approved: data.filter(v=>v.status==='approved').length,
          pending: data.filter(v=>v.status==='pending').length
        })
      }
    }
    load()
  }, [])

  return (
    <div style={{padding:20}}>
      <h1>Arihant Anchal - Daily Report</h1>
      <p>Total: {stats.total} | Approved: {stats.approved} | Pending: {stats.pending}</p>
      <table border="1" cellPadding="10" style={{width:'100%', marginTop:20}}>
        <thead><tr><th>Name</th><th>Flat No</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>
          {visitors.map(v=>(
            <tr key={v.id}><td>{v.name}</td><td>{v.flat_no || v.flate_no}</td><td>{v.status}</td><td>{new Date(v.created_at).toLocaleTimeString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
