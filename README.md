# FitPlanHub - Production-Grade MERN SaaS Application

A full-stack SaaS platform where certified fitness trainers create paid workout plans and users subscribe, follow trainers, and receive personalized feeds.

## 🚀 Features

- **Role-Based Access Control**: Single User model with USER and TRAINER roles
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Fitness Plans**: Trainers can create, edit, and delete their own workout plans
- **Subscriptions**: Dedicated subscription system with duplicate purchase prevention
- **Follow System**: Users can follow trainers to receive personalized content
- **Personalized Feed**: Backend endpoint that aggregates plans from followed trainers
- **Modern UI**: Beautiful SaaS-style interface with Tailwind CSS, gradients, and glassmorphism
- **Secure Backend**: All authorization and access control enforced server-side

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

## 📁 Project Structure

```
fitplanhub/
├── backend/
│   ├── models/
│   │   ├── User.js          # Single user model with role-based behavior
│   │   ├── Plan.js          # Fitness plan model
│   │   ├── Subscription.js  # Subscription model
│   │   └── Follow.js        # Follow relationship model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── plans.js         # Plan CRUD routes
│   │   ├── subscriptions.js # Subscription routes
│   │   ├── follow.js        # Follow/unfollow routes
│   │   └── feed.js          # Personalized feed route
│   ├── middleware/
│   │   ├── auth.js          # JWT protection & authorization
│   │   └── optionalAuth.js  # Optional auth for public routes
│   ├── utils/
│   │   └── generateToken.js # JWT token generation
│   ├── server.js            # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (AuthContext)
│   │   ├── utils/           # Utilities (API client)
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React entry point
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fitplanhub
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update `MONGODB_URI` in `.env`.

5. **Start the backend server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   Create a `.env` file in the `frontend` directory if your backend runs on a different URL:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Plans
- `GET /api/plans` - Get all plans (public, with preview)
- `GET /api/plans/:id` - Get single plan (public, with access control)
- `POST /api/plans` - Create plan (TRAINER only)
- `PUT /api/plans/:id` - Update plan (TRAINER, own plans only)
- `DELETE /api/plans/:id` - Delete plan (TRAINER, own plans only)
- `GET /api/plans/trainer/my-plans` - Get trainer's plans (TRAINER only)

### Subscriptions
- `POST /api/subscriptions` - Create subscription (protected)
- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions (protected)
- `GET /api/subscriptions/:id` - Get single subscription (protected, own only)

### Follow
- `POST /api/follow/:trainerId` - Follow a trainer (protected)
- `DELETE /api/follow/:trainerId` - Unfollow a trainer (protected)
- `GET /api/follow/following` - Get followed trainers (protected)
- `GET /api/follow/followers/:trainerId` - Get trainer's followers (public)
- `GET /api/follow/check/:trainerId` - Check if following (protected)

### Feed
- `GET /api/feed/personalized` - Get personalized feed (protected)

## 🎯 Key Features Explained

### Role-Based Access Control
- Single `User` collection with a `role` field (USER or TRAINER)
- Backend middleware enforces role-based access
- Frontend never makes security decisions

### Subscription System
- Dedicated `Subscription` collection (not boolean flags)
- Prevents duplicate subscriptions with unique index
- Simulates payment flow with realistic backend logic
- Expiration dates based on plan duration

### Follow System
- Users can only follow TRAINER accounts
- Prevents self-follow and duplicate follows
- Used to generate personalized feeds

### Personalized Feed
- Backend aggregates plans from followed trainers
- Marks which plans user has purchased
- Returns clean, ready-to-render response
- Includes trainer information

## 🔒 Security Features

- JWT tokens with configurable expiration
- Password hashing with bcrypt (salt rounds: 10)
- Protected routes with authentication middleware
- Role-based authorization
- Server-side access control (no client-side security decisions)
- Input validation on all routes
- MongoDB injection prevention via Mongoose

## 🎨 UI Features

- Modern SaaS-style design
- Gradient backgrounds and buttons
- Glassmorphism effects
- Responsive design
- Clear visual hierarchy
- Badges and status indicators
- Smooth transitions and hover effects

## 🧪 Testing the Application

1. **Create a Trainer Account:**
   - Sign up with role "Trainer"
   - Login and access the Trainer Dashboard
   - Create a fitness plan

2. **Create a User Account:**
   - Sign up with role "User"
   - Browse plans on the landing page
   - Subscribe to a plan
   - Follow a trainer
   - View personalized feed in User Dashboard

3. **Test Security:**
   - Try accessing trainer routes as a regular user
   - Try editing/deleting plans you didn't create
   - Verify subscription duplicate prevention

## 🚀 Production Deployment

### Quick Deploy (Recommended)

See **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** for a 5-minute deployment guide.

### Detailed Deployment Guide

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment instructions.

### Quick Summary:

**Backend Deployment Options:**
- **Render** (Recommended - Free tier): [render.com](https://render.com)
- **Railway**: [railway.app](https://railway.app)
- **Heroku**: [heroku.com](https://heroku.com)

**Frontend Deployment Options:**
- **Vercel** (Recommended - Free & Fast): [vercel.com](https://vercel.com)
- **Netlify**: [netlify.com](https://netlify.com)

**Required Environment Variables:**

Backend:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_key
JWT_EXPIRE=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

Frontend:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## 📝 Notes

- This is a production-grade application structure, not a tutorial
- All security decisions are made on the backend
- The codebase is designed for scalability and maintainability
- Suitable for portfolio presentation and further extension

## 🤝 Contributing

This is a portfolio project. Feel free to fork and extend it!

## 📄 License

This project is open source and available for educational purposes.

---

Built with ❤️ using the MERN stack

