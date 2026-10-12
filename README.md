# Indian Things E-Commerce Platform

A multi-portal Indian e-commerce architecture consisting of a single Node.js/Express backend API and three independent Vite + React + TypeScript frontend applications:

- **Customer Storefront** (`frontend/customer`) — Port `5173`
- **Vendor Hub** (`frontend/vendor`) — Port `5174`
- **Admin Command Center** (`frontend/admin`) — Port `5175`

---

## 📁 Repository Layout

```
Indian_things_Ecom/
├── backend/                       # Node/Express API (MongoDB + JWT Authentication)
│   ├── src/
│   │   ├── app.js                 # Express server & CORS configuration
│   │   ├── routes/authRoutes.js   # Auth endpoints (/login, /user/sendOtp, /verifyOtp)
│   │   ├── controllers/
│   │   ├── middleware/            # JWT protect & role authorization middleware
│   │   └── services/authService.js# Login, OTP verification & role checks
│   └── .env
│
├── frontend/
│   ├── customer/                  # Customer Storefront (Port 5173)
│   │   ├── src/
│   │   │   ├── context/AuthContext.tsx  # Customer session (role: 'customer' only)
│   │   │   ├── services/api.ts          # Axios client + 401 interceptor
│   │   │   ├── components/LoginForm.tsx # Email/Password & Email OTP tabs
│   │   │   ├── components/Header.tsx    # Header & Sign Out button
│   │   │   └── App.tsx                  # Main Storefront + Modals
│   │   ├── package.json
│   │   ├── vite.config.ts         # Port 5173
│   │   ├── .env                   # VITE_API_URL=http://localhost:3000/api
│   │   ├── .env.example
│   │   └── vercel.json            # SPA routing rewrite
│   │
│   ├── vendor/                    # Vendor Hub (Port 5174)
│   │   ├── src/
│   │   │   ├── context/AuthContext.tsx  # Vendor session (role: 'vendor' only)
│   │   │   ├── services/api.ts          # Axios client + 401 interceptor
│   │   │   ├── components/ProtectedRoute.tsx
│   │   │   ├── pages/LoginPage.tsx      # Vendor Hub Login (email + password only)
│   │   │   ├── pages/DashboardPage.tsx  # Vendor Dashboard + Logout
│   │   │   └── pages/ForbiddenPage.tsx  # 403 Access Denied
│   │   ├── package.json
│   │   ├── vite.config.ts         # Port 5174
│   │   ├── .env                   # VITE_API_URL=http://localhost:3000/api
│   │   ├── .env.example
│   │   └── vercel.json            # SPA routing rewrite
│   │
│   └── admin/                     # Admin Command Center (Port 5175)
│       ├── src/
│       │   ├── context/AuthContext.tsx  # Admin session (role: 'admin' only)
│       │   ├── services/api.ts          # Axios client + 401 interceptor
│       │   ├── components/ProtectedRoute.tsx
│       │   ├── pages/LoginPage.tsx      # Admin Command Center Login (email + password only)
│       │   ├── pages/DashboardPage.tsx  # Admin Console + Logout
│       │   └── pages/ForbiddenPage.tsx  # 403 Access Denied
│       ├── package.json
│       ├── vite.config.ts         # Port 5175
│       ├── .env                   # VITE_API_URL=http://localhost:3000/api
│       ├── .env.example
│       └── vercel.json            # SPA routing rewrite
│
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **Bun** (v1.0+) or **npm**

### 2. Backend (Port 3000 / 3001)
```bash
cd backend
npm install
npm start
```
> The API will run at `http://localhost:3000` (or `http://localhost:3001` per `backend/.env`).

### 3. Running All Three Frontends

You can run each application in a separate terminal:

#### A. Customer Storefront (Port 5173)
```bash
cd frontend/customer
bun install
bun run dev
```
Open [http://localhost:5173](http://localhost:5173)

#### B. Vendor Hub (Port 5174)
```bash
cd frontend/vendor
bun install
bun run dev
```
Open [http://localhost:5174](http://localhost:5174)

#### C. Admin Command Center (Port 5175)
```bash
cd frontend/admin
bun install
bun run dev
```
Open [http://localhost:5175](http://localhost:5175)

---

## 🔐 Role Separation & Authentication Logic

All three applications communicate with the **same** backend login endpoint:
`POST /api/auth/login` (body: `{ "email", "password" }`).

| Portal | Port | Allowed Role | Non-Matching Roles Behavior |
| :--- | :--- | :--- | :--- |
| **Customer Storefront** | `5173` | `'customer'` | Session rejected: *"This account can't sign in here. Please use the vendor or admin portal."* |
| **Vendor Hub** | `5174` | `'vendor'` | Session rejected: *"Access denied: This portal is for vendors only."* |
| **Admin Command Center** | `5175` | `'admin'` | Session rejected: *"Access denied: This portal is for system administrators only."* |

- Each portal stores its own session key in browser storage (`it_customer_token`, `it_vendor_token`, `it_admin_token`) so sessions do not clash across tabs.
- Reloading the page restores the authenticated session.
- Clicking **Logout** immediately purges the tokens and redirects to the portal login view.
- Any API request returning `HTTP 401 Unauthorized` automatically purges local credentials and redirects to `/login`.

---

## ☁️ Vercel Deployment Setup

To deploy all three frontend applications to Vercel from this single GitHub repository, create **3 separate projects** in the Vercel Dashboard:

### Project 1: Customer Storefront
1. In Vercel, click **Add New Project** and select this repository.
2. Set **Project Name**: `indian-things-customer`
3. Set **Framework Preset**: `Vite`
4. Set **Root Directory**: `frontend/customer`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-production-backend-domain.com/api`
6. Click **Deploy**.

### Project 2: Vendor Hub
1. In Vercel, click **Add New Project** and select this repository.
2. Set **Project Name**: `indian-things-vendor`
3. Set **Framework Preset**: `Vite`
4. Set **Root Directory**: `frontend/vendor`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-production-backend-domain.com/api`
6. Click **Deploy**.

### Project 3: Admin Command Center
1. In Vercel, click **Add New Project** and select this repository.
2. Set **Project Name**: `indian-things-admin`
3. Set **Framework Preset**: `Vite`
4. Set **Root Directory**: `frontend/admin`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-production-backend-domain.com/api`
6. Click **Deploy**.

### Single-Page App (SPA) Routing
Each app includes a `vercel.json` file configuring rewrites so client-side routing works on full page refreshes:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## ⚙️ Backend Configuration Notes

In your `backend/.env` file, ensure your `FRONTEND_URL` lists all allowed development and production origins:
```env
FRONTEND_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175,https://your-customer-domain.vercel.app,https://your-vendor-domain.vercel.app,https://your-admin-domain.vercel.app
```
