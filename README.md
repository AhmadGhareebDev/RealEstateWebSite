# Real Estate Website

Full-stack real estate platform with:
- React + Vite frontend
- Express + MongoDB backend

## Project Structure

- `RealEstate-frontend` - frontend app
- `backend` - backend API

## Prerequisites

- Node.js 18+
- npm
- MongoDB database (Atlas or local)
- Cloudinary account (for image uploads)
- Email SMTP credentials (for verification emails)

## Environment Setup

1. Backend:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill real values
2. Frontend:
   - Copy `RealEstate-frontend/.env.example` to `RealEstate-frontend/.env`

## Install

Run in each app folder:

```bash
npm install
```

## Run Locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd RealEstate-frontend
npm run dev
```

Frontend default URL is usually `http://localhost:5173`.

## Useful Backend Scripts

```bash
npm run dev
npm run start
npm run seed:licenses
npm run seed:all
```

## Useful Frontend Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- API docs are served by backend at `/api-docs`.

