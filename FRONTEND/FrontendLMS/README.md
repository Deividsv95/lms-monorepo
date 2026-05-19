# FrontendLMS

Frontend application for the LMS project, built with React and Vite.

This is the frontend-specific guide. For the fullstack project overview, see [../../README.md](../../README.md).

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

Open the URL shown in terminal (typically `http://localhost:5173`).

For full application behavior (login, course data, real-time updates), make sure the backend API is running.

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