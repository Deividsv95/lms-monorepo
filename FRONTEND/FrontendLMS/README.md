# FrontendLMS

Frontend application for the LMS project, built with React and Vite.

## Installation

Prerequisites:
- Node.js 18+
- npm

Install dependencies from this folder:

```bash
npm install
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Then open the URL shown in terminal (typically `http://localhost:5173`).

Note: this frontend expects the LMS backend API to be reachable (default: `http://127.0.0.1:8000`) for login, course data, and real-time updates.

## Build Instructions (Deployment)

Create a production build:

```bash
npm run build
```

Build output is generated in the `dist/` folder.

Optional local verification of the production build:

```bash
npm run preview
```

If deploying to GitHub Pages (already configured in scripts):

```bash
npm run deploy
```