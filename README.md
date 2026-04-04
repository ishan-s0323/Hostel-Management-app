# 🏠 Smart Hostel Management System

A full-stack, modern Hostel Management System built with **React JS** (frontend) and **Node.js / Express** (backend), backed by an **Oracle Database**. The UI follows an **Apple-inspired design language** — clean, minimal, and highly functional.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS (Apple / iOS Design Language) |
| Backend | Node.js + Express |
| Database | Oracle DB (OracleDB npm driver) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Icons | Emoji-based navigation |

---

## 📋 Features by Role

### 👤 Student Portal
| Module | Functionality |
|---|---|
| **Dashboard** | Room number, block, floor, department, year of study, pending fees, open complaints |
| **Rooms** | Browse available rooms, apply for a room |
| **Fees** | View pending/overdue fees, pay online, see full payment history in INR (₹) |
| **Complaints** | File new complaints, track status (Open → Processing → Resolved) |
| **Inquiries** | View disciplinary actions (e.g., reduced biometric curfew, restrictions) |
| **Parcels** | View incoming parcels, self-mark as collected |
| **Lost & Found** | Report lost items with description |
| **Roommates** | Set preferences (sleep/study/neatness), view compatibility % with other students |
| **Feedback** | Submit category-based feedback with 1–5 star rating |
| **Laundry** | Request laundry service with item list, track status (Pending → Washing → Ready → Collected) |
| **Room Change** | Submit room/block change request |
| **Emergency** | Contact details for Warden, Ambulance, Fire, Police, Caretaker |

### 🛡️ Admin / Warden Portal
| Module | Functionality |
|---|---|
| **Dashboard** | Live stats: students, occupancy, fees collected, open complaints |
| **Students** | View all registered students |
| **Staff** | View staff directory |
| **Blocks** | Hostel block listing |
| **Rooms** | All rooms with occupancy, type, floor |
| **Allocations** | Allocate room to a student, release allocation |
| **Fees** | All student fees, mark payments |
| **Payments** | Full payment ledger |
| **Complaints** | Update complaint status (Open / Processing / Resolved / Closed) |
| **Inquiries** | View and manage disciplinary inquiries |
| **Parcels** | All incoming parcels |
| **Visitors** | Visitor log |
| **Lost & Found** | Mark lost items as found/claimed |
| **Roommates** | View all compatibility scores |
| **Feedback** | View all student feedback ratings |
| **Laundry** | Update laundry statuses |
| **Room Requests** | Approve or reject room change requests |
| **Emergency** | Emergency contact directory |

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@hostel.edu | password123 |
| Admin | admin@hostel.edu | password123 |
| Warden | rajesh@hostel.edu | password123 |
| Student | amit@student.edu | password123 |
| Student | priya@student.edu | password123 |
| Student | rahul@student.edu | password123 |
| Student | sneha@student.edu | password123 |
| Student | david@student.edu | password123 |
| Student | sarah@student.edu | password123 |
| Student | bob@student.edu | password123 |

---

## 🏗️ Project Structure

```
Smart_hostel_Management-main/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── routes/            # All API route handlers
│   │   ├── middleware/        # JWT auth, authorization
│   │   ├── utils/             # DB connection, helpers
│   │   └── server.js          # Express entry point
│   └── package.json
│
├── frontend-react/             # React + Vite Web App
│   ├── src/
│   │   ├── components/        # Layout, Modal, Badge, DataGrid
│   │   ├── pages/             # All 15+ page components
│   │   ├── utils/api.js       # Axios instance with JWT interceptors
│   │   ├── App.jsx            # Router setup
│   │   └── index.css          # Apple design system
│   └── package.json
│
├── database/
│   ├── schema.sql             # Full Oracle DB schema
│   ├── procedures.sql         # Stored procedures & triggers
│   └── sample_data.sql        # Seed data
│
└── README.md
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js (v18+)
- Oracle Database (21c or higher recommended)
- Oracle Instant Client (for `oracledb` npm driver)

### 1. Database Setup
```sql
-- Run in Oracle SQL Developer or SQL*Plus:
@database/schema.sql
@database/procedures.sql
@database/sample_data.sql
```

### 2. Backend Setup
```bash
cd backend

# Create .env file
cp .env.example .env
# Fill in DB_USER, DB_PASSWORD, DB_CONNECTION_STRING, JWT_SECRET

# Install dependencies
npm install

# Start server (dev with auto-reload)
npm run dev
# ➜ API running at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend-react

# Install dependencies
npm install

# Start dev server
npm run dev
# ➜ App running at http://localhost:5173
```

### 4. Open the App
Navigate to **http://localhost:5173** in Chrome, Edge, or Safari.

---

## 🔑 Environment Variables (backend/.env)

```env
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=localhost:1521/XEPDB1
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

---
