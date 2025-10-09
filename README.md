0.Payment System
Current:Demo mode (development)
Planned:Stripe integration (production)

FreshWash Laundry - Complete E-commerce Solution

Project Overview
FreshWash Laundry - "Clean Clothes, Happy You"

A full-featured, responsive laundry e-commerce platform built with modern technologies and ready for cloud deployment.

Tech Stack
- Frontend:React + Vite + TailwindCSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Authentication: JWT with refresh tokens
- Payment: Stripe (test mode)but now card(demo)
- Email: Nodemailer
- Deployment: Vercel (frontend) + Render (backend)

Quick Start

 Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Stripe test account

 Local Development

1.Clone and Setup
```bash
git clone <your-repo>
cd freshwash-laundry
```

2.Backend Setup\
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your credentials
npm run seed    # Seed database
npm run dev     # Start development server (port 5000)
```

3.Frontend Setup (New terminal)
```bash
cd frontend
npm install
npm run dev     # Start development server (port 3000)
```

4.Environment Setup
-Copy `.env.example` to `backend/.env`
-Fill in your MongoDB Atlas, Stripe, and SMTP credentials
-Create Stripe account: https://dashboard.stripe.com/test/apikeys
-Create MongoDB Atlas: https://cloud.mongodb.com/

Deployment

Frontend (Vercel)
1.Push code to GitHub
2.Connect to Vercel
3.Set build directory: `frontend`
4.Set output directory: `dist`
5.Add env var: `VITE_API_URL=https://your-backend.onrender.com`
6.Add env var: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

 Backend (Render)
1.Connect GitHub repo to Render
2.Select backend folder as root
3.Build command: `npm install`
4.Start command: `npm start`
5.Add all environment variables from `.env.example`

Database (MongoDB Atlas)
1.Create free cluster
2.Create database user
3.Whitelist IP: 0.0.0.0/0
4.Get connection string

Test Credentials
-- Admin: admin@freshwash.com / password123
-- Test User: test@example.com / password123
-- Stripe Test Card: 4242 4242 4242 4242

Features
-- User Authentication (JWT)
-- Service Catalog
-- Shopping Cart
-- Stripe Payments
-- Order Tracking
-- Admin Dashboard
-- Responsive Design