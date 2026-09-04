# Antropi Precision

A redesigned customer-facing landing page for Antropi Robotics, built for the Design Intern assignment at a 1440px desktop target.

**Original preview:** https://antropi-precision.rishavptn.chatgpt.site

**Third-party deployment:** see `VERCEL_DEPLOY.md` and replace this line with your final Vercel URL before submission.

## What is included

- Responsive React landing page with the supplied Antropi brand assets
- Interactive Standard (100 μm), Pro (10 μm) and Ultra (5 μm) precision tiers
- Quality-control proof, repeat-order story and direct traditional-shop comparison
- Gemini-powered CNC component guide with a server-side key and curated fallback
- API gateway plus separate component, AI and quote-intake microservices
- Docker Compose configuration
- Submission-ready one-page design rationale in `docs/Antropi_Design_Rationale.pdf`

## Run the landing page

Requirements: Node.js 22 or later.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

To enable live Gemini responses, create a key in Google AI Studio and set `GEMINI_API_KEY` in `.env.local`. Keep the key server-side and never rename it with a `NEXT_PUBLIC_` prefix. Without a key, the guide automatically serves its curated CNC explanations.

## Run the microservices

```bash
docker compose up --build
```

The gateway is available at `http://localhost:8080`. To route the React guide through it, set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Main endpoints:

- `GET /api/components`
- `GET /api/components/:id`
- `POST /api/explain`
- `POST /api/quotes`
- `GET /health`

## Project structure

```text
app/                         React page and hosted API route
public/                      Antropi logos and hero artwork
services/api-gateway/        Public microservice entry point
services/component-service/  CNC component catalogue
services/ai-service/         Gemini integration and fallback
services/quote-service/      Requirements intake validation
docs/                        Rationale and architecture notes
```

## Tools used

React 19, Vinext, TypeScript, CSS, Lucide, Gemini Interactions API, Node.js, Docker Compose and OpenAI image generation.
