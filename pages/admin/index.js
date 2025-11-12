import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function Admin() {
  const [stages, setStages] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [adminPass, setAdminPass] = useState('')

  useEffect(() => {
    // Try to load adminPass from localStorage for convenience
    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin_pass') : null
    if (stored) setAdminPass(stored)
  }, [])

  useEffect(() => {
    if (!adminPass && !stages) return
    // Load stages using admin header when adminPass is set
    const headers = {}
    if (adminPass) {
      headers['x-admin-pass'] = adminPass
    }
    fetch('/api/admin/get-stages', { headers })
      .then((r) => r.json())
      .then((data) => setStages(data || {}))
  }, [adminPass])

  function updateStage(id, field, value) {
    setStages((s) => ({ ...s, [id]: { ...(s[id] || {}), [field]: value } }))
  }

  async function save() {
    setLoading(true)
    setMessage('')
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (adminPass) headers['x-admin-pass'] = adminPass

      const res = await fetch('/api/admin/save-stages', {
        method: 'POST',
        headers,
        body: JSON.stringify(stages)
      })
      const data = await res.json()
      if (!res.ok) setMessage(data.error || 'Save failed')
      else setMessage('Saved successfully')
    } catch (err) {
      setMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  function addStage() {
    // find next numeric id
    const ids = Object.keys(stages).map((x) => parseInt(x, 10)).filter(Boolean)
    const next = ids.length ? Math.max(...ids) + 1 : 1
    setStages((s) => ({ ...s, [String(next)]: { passcode: '', hint: '', next: null } }))
  }

  async function generateQR(stageId) {
    const url = `${location.origin}/stage/${stageId}`
    try {
      const uri = await QRCode.toDataURL(url)
      const w = window.open('about:blank')
      if (w) w.document.write(`<img src="${uri}" /><p>${url}</p><p><a href="${uri}" download="stage-${stageId}-qr.png">Download QR</a></p>`)
    } catch (err) {
      alert('Failed to generate QR')
    }
  }

  function saveAdminPassToLocal() {
    try {
      localStorage.setItem('admin_pass', adminPass)
      setMessage('Admin pass saved locally')
    } catch (e) {
      setMessage('Failed to save admin pass locally')
    }
  }

  return (
    <div className="container">
      <h1>Admin — Stages</h1>
      <p>Enter the admin password to access protected admin endpoints. (Set `ADMIN_PASS` in your environment for production.)</p>

      <div style={{marginBottom:12}} className="row">
        <input
          className="input"
          placeholder="Admin pass (x-admin-pass)"
          value={adminPass}
          onChange={(e) => setAdminPass(e.target.value)}
          style={{marginRight:8, maxWidth: '360px'}}
        />
        <button className="btn secondary" onClick={saveAdminPassToLocal}>Save pass locally</button>
      </div>

      <div style={{marginBottom:12}}>
        <button className="btn" onClick={addStage}>Add stage</button>
      </div>

      <div style={{display:'grid',gap:12}}>
        {Object.keys(stages).sort((a,b)=>Number(a)-Number(b)).map((id) => (
          <div key={id} className="card">
            <h3 style={{marginTop:0}}>Stage {id}</h3>
            <div className="field">
              <label>Passcode<br />
                <input className="input" value={stages[id].passcode||''} onChange={(e)=>updateStage(id,'passcode',e.target.value)} />
              </label>
            </div>
            <div className="field">
              <label>Hint<br />
                <input className="input" value={stages[id].hint||''} onChange={(e)=>updateStage(id,'hint',e.target.value)} />
              </label>
            </div>
            <div className="field">
              <label>Next stage id (or empty)<br />
                <input className="input" value={stages[id].next||''} onChange={(e)=>updateStage(id,'next',e.target.value||null)} />
              </label>
            </div>
            <div style={{marginTop:8}}>
              <button className="btn secondary" onClick={() => generateQR(id)} style={{marginRight:8}}>Generate QR for this stage</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:16}}>
        <button className="btn" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save stages'}</button>
        <span style={{marginLeft:12}}>{message}</span>
      </div>
    </div>
  )
}
