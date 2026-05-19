
# FrontendLMS

Frontend application for the LMS project, built with React and Vite.

**For fullstack setup and project overview, see the root [README.md](../../README.md).**

---

## Prerequisites
- Node.js 18+
- npm

## Setup

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

App runs at http://localhost:5173

---

## Build (Production)

Create a production build:
```bash
npm run build
```

Build output is generated in the `dist/` folder.

---

## Testing

Run API/feature tests:
```powershell
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1 -BaseUrl http://localhost:8000
```

Optional local verification of the production build:

```bash
npm run preview
```