# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitplanhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

Start MongoDB (if local):
```bash
# Windows (if MongoDB is installed as service, it should auto-start)
# Or use MongoDB Compass

# Mac/Linux
mongod
```

Start backend:
```bash
npm start
# or for development
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

(Optional) Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

### 3. Test the Application

1. Open `http://localhost:3000`
2. Sign up as a **Trainer**
3. Create a fitness plan in the Trainer Dashboard
4. Sign up as a **User** (in a different browser/incognito)
5. Browse plans, subscribe, and follow trainers
6. Check the personalized feed in User Dashboard

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, verify connection string includes credentials

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: React will prompt to use a different port

### CORS Errors
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` matches backend URL

### JWT Errors
- Ensure `JWT_SECRET` is set in backend `.env`
- Clear browser localStorage and login again

