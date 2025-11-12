import path from 'path'
import fs from 'fs'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require admin pass if set
  const provided = req.headers['x-admin-pass'] || req.headers['authorization'] || ''
  if (process.env.ADMIN_PASS && provided !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid body' })
  }

  const dataPath = path.join(process.cwd(), 'data', 'stages.json')
  try {
    fs.writeFileSync(dataPath, JSON.stringify(body, null, 2), 'utf8')
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to save stages', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
