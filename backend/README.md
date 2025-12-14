# FitPlanHub Backend

## Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitplanhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important:** 
- Replace `JWT_SECRET` with a strong, random string in production
- For MongoDB Atlas, use your connection string as `MONGODB_URI`
- Ensure MongoDB is running before starting the server

## Installation

```bash
npm install
```

## Running

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Base URL

Default: `http://localhost:5000/api`

