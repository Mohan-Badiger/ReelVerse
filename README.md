# ReelVerse - Modern MERN Stack Movie Booking Application

A production-ready Movie Booking Website inspired by Netflix and BookMyShow, featuring a premium dark theme, glassmorphism UI, advanced Framer Motion animations, comprehensive authentication (OTP, JWT), and a multi-entity relational booking logic with Stripe.

## Features
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Redux Toolkit, React Router, and Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Auth, Bcrypt, Nodemailer, Cloudinary, Stripe.
- **Auth Flow**: Registration with Nodemailer OTP (10 min expiry), Login, Forgot Password.
- **Booking Flow**: Seat selection locking, Stripe Mock Payment, dynamically grouped show dates.
- **Admin Flow**: Dashboard with metrics, Movie/Theatre/Show CRUD operations, poster file upload.

## Environment Variables
Refer to `backend/.env.example` for all required keys. You must create a `.env` file in the `backend/` directory:
- `MONGO_URI`: Use your MongoDB Atlas connection string here (e.g., `mongodb+srv://<user>:<pwd>@cluster...`)
- `JWT_SECRET`, `SESSION_SECRET`
- `SMTP_USER`, `SMTP_PASS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`

## Setup & Execution
1. Open the `/backend` folder. Run `npm install` and then `npm run dev` to start the server on *:5000*.
2. Open the `/frontend` folder. Run `npm install` and then `npm run dev` to start the Vite server.

## Deployment Guide
### Backend (Render / Heroku)
1. Push your code to GitHub.
2. Link the repository to Render as a Web Service.
3. Set the Root Directory to `backend/`.
4. Add all environment variables in Render's dashboard.

### Frontend (Vercel / Netlify)
1. Link your repository to Vercel.
2. Set Root Directory to `frontend/`.
3. Add `VITE_API_URL` if not using local proxy configurations.
4. Vercel will automatically use `vercel.json` to handle React Router client-side routing.
