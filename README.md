# MERN Ticket Management System

A full-stack Ticket Management System built with MongoDB, Express, React, and Node.js.

## Features

- JWT Authentication (Login/Register)
- 3 User Roles: User, Support Agent, Admin
- Role-based Access Control
- CRUD operations for tickets
- Tickets: title, description, status, priority, createdBy, assignedTo, timestamps
- Status workflow: open, in-progress, resolved, closed
- User can only manage their own tickets
- Agents/Admins can view and manage all tickets
- Admins can manage users (activate/deactivate, change roles)
- Search, Pagination, and Filtering on tickets
- Passwords hashed with bcrypt
- Proper error handling
- .env support for dev/prod config

---

## Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB (local or Atlas)

### 1. Clone the repository

```
git clone <repo-url>
cd <repo-folder>
```

### 2. Backend Setup

```
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGO_URI=mongodb://localhost:27017/ticketdb
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

Start the backend:

```
npm run dev
```

### 3. Frontend Setup

```

---

## Default Admin User

On server startup, the following admin user is automatically created (if not already present):

- **Name:** Admin
- **Email:** admin@gmail.com
- **Password:** Admin
- **Role:** admin

Use these credentials to log in as an admin and manage the system.
```
#
