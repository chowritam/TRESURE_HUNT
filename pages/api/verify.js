import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { route, qrId, passcode } = req.body || {}
  if (!passcode || typeof passcode !== 'string') {
    return res.status(400).json({ error: 'Missing passcode' })
  }

  let stages = {}
  try {
    stages = await kv.get('stages') || {}
  } catch (err) {
    console.error('Failed to read stages data', err)
    return res.status(500).json({ error: 'Server error' })
  }

  // Handle startQR
  if (!route && !qrId) {
    const start = stages.startQR
    if (!start) return res.status(404).json({ error: 'Start QR not found' })
    if (passcode !== start.passcode) {
      return res.status(401).json({ error: 'Incorrect passcode' })
    }
    return res.status(200).json({ ok: true, hint: start.hint, nextRoutes: start.nextRoutes })
  }

  // Validate route exists
  if (!route || !stages[route]) {
    return res.status(404).json({ error: 'Route not found' })
  }

  // Handle endQR separately if route is 'endQR'
  if (route === 'endQR') {
    const end = stages.endQR
    if (!end) return res.status(404).json({ error: 'End QR not found' })
    if (passcode !== end.passcode) {
      return res.status(401).json({ error: 'Incorrect passcode' })
    }
    return res.status(200).json({ ok: true, hint: end.hint, nextStage: null, nextPasscode: null })
  }

  // Validate qrId in route exists
  const qrStages = stages[route]
  if (!qrId || !qrStages[qrId]) {
    return res.status(404).json({ error: 'QR stage not found in route' })
  }

  const qrStage = qrStages[qrId]
  if (passcode !== qrStage.passcode) {
    return res.status(401).json({ error: 'Incorrect passcode' })
  }

  // Determine next stage within the route or endQR
  const nextId = qrStage.next
  let nextStage = null
  let nextPasscode = null

  if (nextId === 'endQR') {
    nextStage = 'endQR'
    nextPasscode = stages.endQR ? stages.endQR.passcode : null
  } else if (nextId && qrStages[nextId]) {
    nextStage = nextId
    nextPasscode = qrStages[nextId].passcode
  }

  return res.status(200).json({ ok: true, hint: qrStage.hint, nextStage, nextPasscode })
}
