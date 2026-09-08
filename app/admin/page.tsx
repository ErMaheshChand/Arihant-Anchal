"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin(){
  const [all, setAll] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('residents').select('*').order('created_at',{ascending:false})
    if(data){ setAll(data); setFiltered(data) }
  }
  useEffect(()=>{ load() },[])

  useEffect(()=>{
    let f = [...all]
    if(search){
      f = f.filter(r =>
        r.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.mobile?.includes(search)
      )
    }
    if(roleFilter!=='all') f = f.filter(r=>r.role===roleFilter)
    if(statusFilter!=='all') f = f.filter(r=>r.status===statusFilter)
    if(dateFilter==='today'){
      const today = new Date().toDateString()
      f = f.filter(r=> new Date(r.created_at).toDateString()===today)
    }
    if(dateFilter==='week'){
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7)
      f = f.filter(r=> new Date(r.created_at) >= weekAgo)
    }
    setFiltered(f)
  },[search, roleFilter, statusFilter, dateFilter, all])

  const approve = async (r:any) => {
    await supabase.from('residents').update({status:'approved', approved_at: new Date().toISOString()}).eq('id', r.id)
    load()
  }
  const reject = async (r:any) => {
    await supabase.from('residents').update({status:'rejected', approved_at: new Date().toISOString()}).eq('id', r.id)
    load()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3">
      <div className="max-w- mx-auto">
        <h1 className="text- font-bold">Arihant Anchal - Resident Listing</h1>
        <p className="text- text-black/60">Total {all.length} | Filtered {filtered.length}</p>

        {/* FILTER BAR */}
        <div className="mt-4 p-3 bg-white rounded- border shadow-sm space-y-3">
          <input
            className="w-full h- rounded- bg-[#F8FAFC] border px-4 text-"
            placeholder="🔍 Search - Flat No / Naam / Mobile"
            value={search} onChange={e=>setSearch(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="h- rounded- bg-[#F8FAFC] border px-2 text-">
              <option value="all">All Role</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
            </select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h- rounded- bg-[#F8FAFC] border px-2 text-">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className="h- rounded- bg-[#F8FAFC] border px-2 text-">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* LISTING TABLE -
