import path from 'path'
import fs from 'fs'

export default function handler(req, res) {
  // Simple protection: check for ADMIN_PASS header if provided in deployment
  const adminPass = process.env.ADMIN_PASS || 'admin123'
  const provided = req.headers['x-admin-pass'] || req.headers['authorization'] || ''
  // If an ADMIN_PASS is set in env, require it; otherwise allow local dev but warn
  if (process.env.ADMIN_PASS && provided !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const dataPath = path.join(process.cwd(), 'data', 'stages.json')
  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    const stages = JSON.parse(raw)
    return res.status(200).json(stages)
  } catch (err) {
    console.error('Failed to read stages', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
