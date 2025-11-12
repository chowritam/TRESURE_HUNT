# Treasure Hunt (QR -> Passcode -> Hint) — deployable to Vercel

This is a minimal treasure-hunt system you can deploy to Vercel. Scanning a QR should point to a stage URL such as:

  https://your-site.vercel.app/stage/1

The page asks for the passcode for that stage. If correct, it reveals the stage hint and the passcode for the next stage.

Files added

- `pages/stage/[id].js` — stage page for scanned QR links
- `pages/api/verify.js` — serverless API that validates passcodes using `data/stages.json`
- `data/stages.json` — example stage data (id -> passcode, hint, next)
- `pages/index.js` — landing + demo links

How it works

- Keep your stages in `data/stages.json` using this shape:

```json
{
  "1": { "passcode": "alpha", "hint": "...", "next": "2" },
  "2": { "passcode": "bravo", "hint": "...", "next": null }
}
```

- When a user visits `/stage/:id` they enter the passcode. The client POSTs to `/api/verify`.
- The API checks the passcode against `data/stages.json`. If correct it returns the hint and the next stage's passcode.

Security notes

- This is a minimal implementation intended for small local events. The passcodes live in `data/stages.json` on the server, and the API returns the next stage passcode only after a correct submission.
- For higher security, store secrets in an external database or use server-side environment variables. Also consider rate-limiting brute-force attempts and using HTTPS (Vercel provides HTTPS by default).

# Treasure Hunt (QR -> Passcode -> Hint) — deployable to Vercel

This is a minimal treasure-hunt system you can deploy to Vercel. Scanning a QR should point to a stage URL such as:

  https://your-site.vercel.app/stage/1

The page asks for the passcode for that stage. If correct, it reveals the stage hint and the passcode for the next stage.

Files added

- `pages/stage/[id].js` — stage page for scanned QR links
- `pages/api/verify.js` — serverless API that validates passcodes using `data/stages.json`
- `data/stages.json` — example stage data (id -> passcode, hint, next)
- `pages/index.js` — landing + demo links

How it works

- Keep your stages in `data/stages.json` using this shape:

```json
{
  "1": { "passcode": "alpha", "hint": "...", "next": "2" },
  "2": { "passcode": "bravo", "hint": "...", "next": null }
}
```

- When a user visits `/stage/:id` they enter the passcode. The client POSTs to `/api/verify`.
- The API checks the passcode against `data/stages.json`. If correct it returns the hint and the next stage's passcode.

Security notes

- This is a minimal implementation intended for small local events. The passcodes live in `data/stages.json` on the server, and the API returns the next stage passcode only after a correct submission.
- For higher security, store secrets in an external database or use server-side environment variables. Also consider rate-limiting brute-force attempts and using HTTPS (Vercel provides HTTPS by default).

Deploying to Vercel

1. Install Vercel CLI (optional) and log in, or use the Vercel web dashboard.
2. Push this repository to GitHub.
3. Import the repo in Vercel and deploy — Vercel will detect Next.js automatically.

Generating QR codes

- Create QR codes that point to `https://your-site.vercel.app/stage/<id>`.
- You can use any QR generator (online or `qr` CLI tools). Example using a site: https://www.qr-code-generator.com/

Next steps / improvements

- Add an admin UI to edit stages without redeploying.
- Store stages in a DB and protect admin routes with authentication.
- Add rate limiting and monitoring.

Admin UI (added)

- There's a basic admin UI at `/admin` which can read and write `data/stages.json` and generate QR codes client-side.
- The admin API endpoints use a simple environment-protected check: set `ADMIN_PASS` in your Vercel project (or local env) and the admin endpoints will require that value in the `x-admin-pass` header. If `ADMIN_PASS` is not set, the admin endpoints allow access (convenient for local dev). Example:

  `ADMIN_PASS=supersecret`

- Notes: Writing to `data/stages.json` works on local machines and some server setups. On serverless platforms like Vercel, filesystem writes are ephemeral and not suitable for persistent storage. For production, use a real database or an external storage (e.g., Supabase, MongoDB Atlas, Airtable).

How the admin UI works

- Visit `/admin` after deployment. Use your `ADMIN_PASS` when prompted (sent in the `x-admin-pass` header by the UI).
- Add/edit stages, save. Use the "Generate QR" button on a stage to open a QR image for that stage's URL.

Security reminder

- Do not commit sensitive ADMIN_PASS values to the repo. Use Vercel's Environment Variables UI to set `ADMIN_PASS`.
