# Deploy Antropi Precision to Vercel

This copy is configured to run as a standard Next.js app on Vercel. The visible landing page and `/api/explain` API route deploy together.

## 1. Local check

Requirements: Node.js 22+.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The AI guide still works without a Gemini key because the app has a curated fallback.

## 2. Push to GitHub

Create an empty GitHub repository, then run from this folder:

```powershell
git init
git add .
git commit -m "Antropi design assignment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/antropi-precision.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Sign in to Vercel with GitHub.
2. Choose **Add New > Project**.
3. Import the `antropi-precision` repository.
4. Framework should be detected as **Next.js**.
5. Leave Root Directory as `./`.
6. Keep Build Command as `next build` / default.
7. Add environment variables:
   - `GEMINI_API_KEY` = your Google AI Studio key (optional, recommended).
   - `GEMINI_MODEL` = `gemini-3.8-flash` (optional).
   - Leave `NEXT_PUBLIC_API_BASE_URL` empty or do not create it.
8. Click **Deploy**.

After the first deployment, copy the public `https://...vercel.app` URL. Add one more environment variable:

- `NEXT_PUBLIC_SITE_URL` = your final Vercel URL

Then redeploy once so canonical metadata points at the Vercel URL.

## 4. Public-access check

Open the Vercel URL in an incognito/private window. Verify:

- Home page loads without login.
- Precision tier tabs work.
- AI part-guide panel opens.
- File chooser UI works.
- External Antropi links open.
- Mobile width does not overflow.

## 5. Optional custom domain

In Vercel: **Project > Settings > Domains > Add Domain**. This is optional; a `.vercel.app` URL is already public and suitable for an assignment submission.

## 6. Submission document URLs

The project already includes both submission PDFs in `public/`, so Vercel will serve them automatically:

- PDF / Export: `https://YOUR-PROJECT.vercel.app/Antropi_Design_Rationale.pdf`
- Design Approach: `https://YOUR-PROJECT.vercel.app/Antropi_Design_Approach.pdf`

Open both URLs in an incognito window before submitting.
