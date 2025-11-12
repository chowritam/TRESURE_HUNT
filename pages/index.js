import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Treasure Hunt</h1>
          <p>This site handles QR-scanned stage links. Each stage URL asks for a passcode. If the passcode is correct, the stage's hint and the passcode for the next stage are displayed.</p>
        </div>
      </div>

      <h2 style={{marginTop:20}}>Quick demo links</h2>
      <ul>
        <li><Link href="/stage/1">Stage 1 (demo)</Link></li>
        <li><Link href="/stage/2">Stage 2 (demo)</Link></li>
        <li><Link href="/stage/3">Stage 3 (demo)</Link></li>
      </ul>

      <h3 style={{marginTop:18}}>How to use</h3>
      <ol>
        <li>Create QR codes that point to <code>https://your-site.vercel.app/stage/&lt;id&gt;</code></li>
        <li>Scan QR to open that URL. Enter the passcode the hunt master gave you for that stage.</li>
        <li>If correct, you'll see the hint and the passcode for the next QR/stage.</li>
      </ol>
    </div>
  )
}
