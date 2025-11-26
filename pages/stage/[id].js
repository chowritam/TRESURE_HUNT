import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Stage() {
  const router = useRouter()
  const { id } = router.query

  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // New states for route and QR selection
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState('')
  const [qrStages, setQrStages] = useState([])
  const [selectedQr, setSelectedQr] = useState('')

  // Fetch startQR info on mount to get available routes
  useEffect(() => {
    async function fetchStart() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: '' }) // No passcode to get startQR? Instead, fetch startQR separately...
        })
        if (res.ok) {
          const data = await res.json()
          if (data.nextRoutes) {
            setRoutes(data.nextRoutes)
            setSelectedRoute(data.nextRoutes[0])
          }
        }
      } catch (error) {
        setError('Failed to fetch start QR data')
      } finally {
        setLoading(false)
      }
    }
    fetchStart()
  }, [])

  // Update QR stages when selectedRoute changes
  useEffect(() => {
    if (!selectedRoute) {
      setQrStages([])
      setSelectedQr('')
      return
    }

    // Fetch the route object from stages.json
    async function fetchRouteData() {
      try {
        const res = await fetch('/api/admin/get-stages')
        if (!res.ok) {
          setError('Error fetching stages')
          return
        }
        const stages = await res.json()
        if (stages && stages[selectedRoute]) {
          const qrs = Object.keys(stages[selectedRoute])
          setQrStages(qrs)
          setSelectedQr(qrs[0])
        }
      } catch (err) {
        setError('Network error fetching stages')
      }
    }
    fetchRouteData()
  }, [selectedRoute])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    // For initial start QR passcode, route and qrId may be empty
    const body = selectedRoute && selectedQr
      ? { route: selectedRoute, qrId: selectedQr, passcode }
      : { passcode }

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Incorrect passcode')
      } else {
        setResult(data)
        // Optionally update UI based on result (e.g., show nextQR or route)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Treasure Hunt Stage</h1>

      {/* Route select */}
      {routes.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="route-select">Select Route: </label>
          <select
            id="route-select"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            {routes.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {/* QR select */}
      {qrStages.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="qr-select">Select QR: </label>
          <select
            id="qr-select"
            value={selectedQr}
            onChange={(e) => setSelectedQr(e.target.value)}
          >
            {qrStages.map((qr) => (
              <option key={qr} value={qr}>{qr}</option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
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
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Correct!</h2>
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
