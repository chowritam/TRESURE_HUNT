const { kv } = require('@vercel/kv')
const fs = require('fs')
const path = require('path')

async function initKV() {
  try {
    const dataPath = path.join(__dirname, 'data', 'stages.json')
    const raw = fs.readFileSync(dataPath, 'utf8')
    const stages = JSON.parse(raw)
    await kv.set('stages', stages)
    console.log('Stages data loaded into KV successfully')
  } catch (err) {
    console.error('Failed to initialize KV', err)
  }
}

initKV()
