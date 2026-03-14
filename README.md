# 🏢 Employee Management System (EMS Pro)
### Full-Stack MERN Application — MongoDB Atlas · Express.js · React · Node.js

---

## 📁 Project Structure

```
EmployeeManagementSystem/
├── backend/
│   ├── config/db.js               # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js      # Signup / Login / getMe
│   │   └── employeeController.js  # CRUD + soft delete + stats
│   ├── middleware/authMiddleware.js # JWT token verification
│   ├── models/
│   │   ├── userModel.js           # User schema (bcrypt hashed)
│   │   ├── employeeModel.js       # Employee schema + isDeleted
│   │   └── deleteCountModel.js    # Deletion audit log
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── employeeRoutes.js
│   ├── uploads/employeePhotos/    # Uploaded photos (Multer)
│   ├── utils/multerConfig.js      # File upload config
│   ├── .env                       # Environment variables
│   └── server.js                  # Express entry point
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   └── ProtectedRoute.js
        ├── pages/
        │   ├── Login.js
        │   ├── Signup.js
        │   ├── Home.js             # Dashboard with stats
        │   ├── AddEmployee.js      # Create + Edit form
        │   └── EmployeeList.js     # List + Delete History
        ├── services/api.js         # Axios API layer
        ├── App.js
        ├── index.js
        └── App.css                 # Premium dark design system
```

---

## ⚙️ Prerequisites

| Tool         | Version   |
|--------------|-----------|
| Node.js      | >= 18.x   |
| npm          | >= 9.x    |
| MongoDB Atlas | Free tier or above |

---

## 🚀 Step-by-Step Setup

### Step 1 — Clone / Extract the project

```bash
cd EmployeeManagementSystem
```

---

### Step 2 — Set up MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0 Sandbox)
3. Under **Database Access** → Add a database user (username + password)
4. Under **Network Access** → Add IP Address → Allow from anywhere (`0.0.0.0/0`)
5. Under **Databases** → Click **Connect** → **Drivers** → Copy the connection string

It will look like:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### Step 3 — Configure Backend Environment

Open `backend/.env` and update:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/employeeDB?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_now_abc123
NODE_ENV=development
```

> ⚠️ Replace `<username>` and `<password>` with your Atlas credentials.  
> ⚠️ Change `JWT_SECRET` to a long random string in production.

---

### Step 4 — Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `multer` — File uploads
- `cors` — Cross-origin requests
- `dotenv` — Environment variables
- `nodemon` — Dev auto-restart

---

### Step 5 — Start Backend Server

```bash
# Development (auto-restart)
npm run dev

# OR Production
npm start
```

✅ You should see:
```
🚀 Server running on port 5000
✅ MongoDB Atlas Connected: cluster0.xxxxx.mongodb.net
```

---

### Step 6 — Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

This installs:
- `react` + `react-dom`
- `react-router-dom` v6
- `axios`
- `react-scripts`

---

### Step 7 — Start Frontend

```bash
npm start
```

✅ Opens at: **http://localhost:3000**

---

## 🌐 API Reference

### Auth Routes

| Method | Endpoint           | Access  | Description         |
|--------|--------------------|---------|---------------------|
| POST   | /api/auth/signup   | Public  | Register new user   |
| POST   | /api/auth/login    | Public  | Login, returns JWT  |
| GET    | /api/auth/me       | Private | Get current user    |

### Employee Routes (all protected with JWT)

| Method | Endpoint                         | Description                   |
|--------|----------------------------------|-------------------------------|
| POST   | /api/employees                   | Create employee (+ photo)     |
| GET    | /api/employees                   | Get all active employees      |
| GET    | /api/employees/:id               | Get single employee           |
| PUT    | /api/employees/:id               | Update employee               |
| DELETE | /api/employees/:id               | Soft delete (isDeleted=true)  |
| GET    | /api/employees/stats             | Dashboard statistics          |
| GET    | /api/employees/delete-history    | All deletion records          |

---

## 🗄️ MongoDB Schemas

### User
```json
{
  "name": "String (required)",
  "email": "String (unique, required)",
  "password": "String (bcrypt hashed)",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

### Employee
```json
{
  "name": "String (required)",
  "employeeId": "String (unique, required)",
  "department": "String (required)",
  "salary": "Number (required)",
  "email": "String (unique, required)",
  "photo": "String (optional, path)",
  "isDeleted": "Boolean (default: false)",
  "deletedAt": "Date (null by default)",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

### DeleteCount (Audit Log)
```json
{
  "employeeId": "ObjectId (ref: Employee)",
  "employeeEmpId": "String",
  "employeeName": "String",
  "employeeEmail": "String",
  "department": "String",
  "salary": "Number",
  "deletedBy": "ObjectId (ref: User)",
  "deletedByName": "String",
  "deletedAt": "Date",
  "reason": "String"
}
```

---

## 🔐 Frontend Routes

| Path              | Page                    | Protected |
|-------------------|-------------------------|-----------|
| /login            | Login Page              | ❌        |
| /signup           | Signup Page             | ❌        |
| /home             | Dashboard               | ✅        |
| /employee-form    | Add New Employee        | ✅        |
| /employee-form?edit=:id | Edit Employee   | ✅        |
| /employees        | Employee List           | ✅        |
| /employees?tab=deleted | Delete History   | ✅        |

---

## ✨ Features

- 🔐 JWT Authentication with bcrypt password hashing
- 📊 Live dashboard with department breakdown & stats
- 📸 Employee photo upload (Multer, 5MB limit)
- 🔍 Search + Department filter with pagination
- ✏️ Edit employees with pre-filled form
- ⊘ Soft delete — records stored in MongoDB (isDeleted: true)
- 📋 Deletion audit log tracked in `DeleteCount` collection
- 🌙 Premium dark UI with Syne + Space Grotesk fonts
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔔 Toast notifications & confirmation modals

---

## 🛠️ Troubleshooting

**MongoDB connection fails?**
- Check your Atlas IP whitelist (allow `0.0.0.0/0`)
- Verify username/password in `.env`

**CORS error?**
- Ensure backend is running on port 5000
- Frontend proxy in `package.json` → `"proxy": "http://localhost:5000"`

**Photos not showing?**
- Backend serves static files from `/uploads`
- Images use `http://localhost:5000` prefix

---

## 📦 Quick Install Commands

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm start
```
