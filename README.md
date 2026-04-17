# Quantity Measurement App - Frontend

A React + Vite frontend for quantity measurement workflows, including authentication, dashboard views, and measurement history.

## Tech Stack

- React
- Vite
- React Router
- Axios
- ESLint

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app in your browser (Vite will print the URL, usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```text
src/
  api/                # API client modules (auth, measurement, history)
  components/         # Reusable UI/layout components
  pages/              # Route-level pages (Dashboard, Login, Signup, etc.)
  routes/             # Application routing configuration
  utils/              # Utility helpers (auth, unit config)
  App.jsx             # App shell
  main.jsx            # Entry point
```

## Authentication Flow

The app includes:

- Login and signup pages
- Protected routes
- OAuth success handling

Related files:

- `src/components/ProtectedRoute.jsx`
- `src/pages/Login.jsx`
- `src/pages/Signup.jsx`
- `src/pages/OAuthSuccess.jsx`

## API Layer

Axios-based API modules are under `src/api/`:

- `axiosConfig.js` - Shared Axios setup
- `authApi.js` - Authentication requests
- `measurementApi.js` - Measurement-related requests
- `historyApi.js` - History-related requests

## Build for Production

```bash
npm run build
```

The output is generated in the `dist/` folder.

## Notes

- Keep backend/API base URL configuration aligned with your target environment.
- Update any environment-specific values before deployment.
