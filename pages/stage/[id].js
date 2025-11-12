import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Stage() {
  const router = useRouter()
  const { id } = router.query
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, passcode })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Incorrect passcode')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Stage {id || '—'}</h1>
      <p>Enter the passcode you received for this stage.</p>

      <form onSubmit={handleSubmit} style={{marginBottom:16}}>
        <div className="row">
          <input
            className="input"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Checking...' : 'Submit'}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="card" style={{marginTop:16}}>
          <h2 style={{marginTop:0}}>Correct!</h2>
          <p><strong>Hint:</strong> {result.hint}</p>
          {result.nextStage ? (
            <>
              <p><strong>Passcode for next stage:</strong> {result.nextPasscode}</p>
            </>
          ) : (
            <p>This was the final stage. Congrats!</p>
          )}
        </div>
      )}
    </div>
  )
}
