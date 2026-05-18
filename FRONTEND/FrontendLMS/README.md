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

## Configuring Backend API URL for Deployment

The frontend automatically detects the backend API URL based on environment:

### Auto-Detection (Default)
- **Local development**: Uses `http://127.0.0.1:8000`
- **Production**: Uses the same domain as the frontend

If your frontend and backend are on the same domain, no configuration is needed.

### Custom Backend URL

If your backend is on a different domain, add this to `frontend/index.html` **before** the main script tag:

```html
<script>
  window.API_BASE = "https://your-backend-url.com";
</script>
<script type="module" src="/src/main.jsx"></script>
```

**Example**: Frontend at `https://myapp.com`, backend at `https://api.myapp.com`:

```html
<script>
  window.API_BASE = "https://api.myapp.com";
</script>
```

The frontend will then make all API requests to your specified backend URL.