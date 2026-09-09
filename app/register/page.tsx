'use client' 
          <div>
            <div className="text- font-bold text-slate-500 mb-2">FLAT NO *</div>
            <select value={form.flat_no} onChange={e=>setForm({...form, flat_no:e.target.value})} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold">
              <option value="">— Flat Select —</option>
              {flats.map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <div className="text- font-bold text-slate-500 mb-2">FULL NAME *</div>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Ex: Mahesh Chand" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          </div>

          <div>
            <div className="text- font-bold text-slate-500 mb-2">MOBILE NO *</div>
            <input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} placeholder="10 digit" maxLength={10} className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          </div>

          {/* PASSWORD - FINAL */}
          <div>
            <div className="text- font-bold text-slate-500 mb-2">PASSWORD * (Flat Login ke liye)</div>
            <div className="relative">
              <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Min 4 digit password" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 pr-12 text-sm font-bold"/>
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-3 w-6 h-6 text-xs">{showPass?'🙈':'👁️'}</button>
            </div>
          </div>

          <div>
            <div className="text- font-bold text-slate-500 mb-2">CONFIRM PASSWORD *</div>
            <input type={showPass?'text':'password'} value={form.confirm_password} onChange={e=>setForm({...form, confirm_password:e.target.value})} placeholder="Password dobara likho" className="w-full h-12 rounded-2xl bg-slate-50 border px-4 text-sm font-bold"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="h-12 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
              <option value="owner">Owner</option><option value="tenant">Tenant</option><option value="family">Family</option>
            </select>
            <select value={form.family_size} onChange={e=>setForm({...form, family_size:e.target.value})} className="h-12 rounded-2xl bg-slate-50 border px-3 text-sm font-bold">
              <option value="1">Family 1</option><option value="2">Family 2</option><option value="3">Family 3</option><option value="4">Family 4</option><option value="5+">Family 5+</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center gap-2 text-">
            <span className="px-2 py-1 rounded-full bg-white/20">Flat</span><span>+</span>
            <span className="px-2 py-1 rounded-full bg-white/20">Password</span><span>→</span>
            <span className="px-2 py-1 rounded-full bg-amber-400 text-black font-bold">Pending</span><span>→</span>
            <span className="px-2 py-1 rounded-full bg-white/20">Approved</span>
          </div>

          <button onClick={handleRegister} disabled={loading} className="w-full h-12 rounded-full bg-amber-400 text-black font-bold text-sm shadow-lg">
            {loading? '⏳ Sending...' : '📩 Register • Admin Approval'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
) }
