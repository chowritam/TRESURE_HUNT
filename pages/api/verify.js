import path from 'path'
import fs from 'fs'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, passcode } = req.body || {}
  if (!id || typeof passcode !== 'string') {
    return res.status(400).json({ error: 'Missing id or passcode' })
  }

  // Read stages data from data/stages.json at runtime (server-side)
  const dataPath = path.join(process.cwd(), 'data', 'stages.json')
  let stages = {}
  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    stages = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read stages data', err)
    return res.status(500).json({ error: 'Server error' })
  }

  const stage = stages[id]
  if (!stage) {
    return res.status(404).json({ error: 'Stage not found' })
  }

  // Compare passcodes (case-sensitive). You can change to case-insensitive if desired.
  if (passcode !== stage.passcode) {
    return res.status(401).json({ error: 'Incorrect passcode' })
  }

  // Lookup next stage passcode (if any)
  const nextStageId = stage.next
  const nextPasscode = nextStageId && stages[nextStageId] ? stages[nextStageId].passcode : null

  return res.status(200).json({ ok: true, hint: stage.hint, nextStage: nextStageId, nextPasscode })
}
