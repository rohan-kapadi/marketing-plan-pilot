# Project Setup and Vercel Deployment

This project is a TanStack Start + Vite app with Supabase.

## 1. Prerequisites

- Node.js `20.19+` or `22.12+`
- `npm` installed
- A Supabase project
- A Vercel account for deployment

## 2. Install dependencies

From the project root, run:

```bash
npm install
```

## 3. Configure environment variables

Create or update your local environment file.

Recommended local variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Optional server-only variable:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Notes:

- `VITE_*` variables are used in browser/client code.
- `SUPABASE_*` variables are used in server code.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- The current repo `.env` has `SUPABASE_PUBLISHABLE_KEY`, but it is missing `VITE_SUPABASE_PUBLISHABLE_KEY`. Add that before running locally or deploying.

## 4. Start the app locally

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually `http://localhost:3000` or the Vite-assigned port.

## 5. Create a production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 6. Deploy to Vercel

### Important note for this repo

This project uses TanStack Start. For Vercel, the official deployment path is to use Nitro with TanStack Start.

This repo now uses the Nitro Vite plugin for Vercel in [vite.config.ts](/abs/path/c:/Rohan/Projects/Lovable NxtWave project/marketing-plan-pilot/vite.config.ts).

If you still see `404: NOT_FOUND` on Vercel, it usually means the project was deployed before the Nitro config was added, or Vercel still has old build settings cached.

### Vercel deployment steps

1. Push this project to GitHub, GitLab, or Bitbucket.
2. In Vercel, click **Add New Project** and import the repository.
3. In the project settings, add these environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` only if you use server-side admin operations
4. Save and deploy.

### Build settings

Use these values in Vercel:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

After changing the config, trigger a fresh redeploy from the newest commit.

## 7. Recommended deployment checklist

- Confirm local dev works with `npm run dev`
- Confirm production build works with `npm run build`
- Make sure `VITE_SUPABASE_PUBLISHABLE_KEY` exists
- Add all required env vars in Vercel before the first deploy
- Do not put `SUPABASE_SERVICE_ROLE_KEY` in client code

## 8. Official references

- TanStack Start env vars:
  https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables
- TanStack Start hosting guide:
  https://tanstack.dev/start/latest/docs/framework/react/guide/hosting
- Vercel TanStack Start guide:
  https://vercel.com/docs/frameworks/full-stack/tanstack-start/
- Vite deployment guide:
  https://vite.dev/guide/static-deploy.html

## 9. Current repo status

The project now builds locally with `npm run build`.
