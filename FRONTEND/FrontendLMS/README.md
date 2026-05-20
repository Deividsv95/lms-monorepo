
# FrontendLMS

React and Vite frontend for the LMS project.

For the full project overview, see [README.md](../../README.md).

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Testing

Frontend smoke test:

```bash
npm run test
```

Optional API check script:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1 -BaseUrl http://localhost:8000
```

Preview the production build:

```bash
npm run preview
```