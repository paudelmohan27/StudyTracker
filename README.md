# 📚 StudyTracker

> A premium, full-stack study management app built for serious students. Track subjects, monitor syllabus completions, log focused study sessions with a built-in Pomodoro timer, and get visual warnings about approaching exam deadlines — all in one beautifully designed dashboard.

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | [https://studytracker.vercel.app](https://tracker.paudelmohan.com.np) *(update after deploy)* |
| Backend  | [https://studytracker-api.onrender.com](https://studytracker-8x3m.onrender.com/) *(update after deploy)* |

---

## ✨ Features

### 🎓 Core Functionality
- **Subjects & Topics Management** — Create subjects with icons, colors, and exam dates. Organize topics within each subject and track completion status.
- **Study Session Logging** — Log study sessions manually or directly via the timer. View your history and daily study analytics.
- **Pomodoro Timer** — Built-in focus timer with customizable work/break intervals and audio notifications.
- **Exam Countdown** — Automatic countdown timers and behind-schedule warnings based on your syllabus completion vs. exam date.

### 📊 Analytics & Dashboard
- **Overall Progress Overview** — Unified progress stats across all subjects.
- **Pie Chart Breakdown** — Topic completion status (Not Started / In Progress / Completed).
- **Study Hours Bar Chart** — Rolling 7-day bar graph of daily study minutes using Recharts.
- **Urgent Alerts** — Subjects that are behind schedule are surfaced prominently.

### 🎨 UI & UX
- **Glassmorphism Design** — Frosted glass sidebar and sticky navbar with backdrop blur.
- **Premium Dark Mode** — Deep `#0B0F19` Midnight Slate palette with full dark/light toggle.
- **Framer Motion Animations** — Elegant page-load transitions and interactive micro-animations.
- **Loading Skeletons** — Context-aware loading placeholders instead of spinners (dark/light mode aware).
- **Drag & Drop Subjects** — Reorder subject cards with smooth drag-and-drop via `@dnd-kit`.
- **Mobile Bottom Navigation** — Responsive native-app-style bottom nav bar for mobile screens.
- **Custom Toast Notifications** — Branded success/error messages via `react-hot-toast` that adapt to dark mode.

### 👤 User Account
- **JWT Authentication** — Secure registration & login with token-based sessions.
- **Avatar Upload** — Crop your profile photo with `react-image-crop` before uploading securely to Cloudinary via the backend.
- **Dark Mode Preference** — Persisted across sessions in the database.

### 🔐 Security
- **API Rate Limiting** — `express-rate-limit` applied globally to all `/api` routes.
- **Express Validator** — Input sanitization and validation on all write operations.
- **Centralized Auth Middleware** — Protected routes enforced server-side.
- **Environment Variables Only** — Zero hardcoded credentials across the entire codebase.

---

## 🛠 Tech Stack

**Frontend**
| Library | Purpose |
|---------|---------|
| React + Vite | Core UI framework |
| Tailwind CSS v3 | Styling & design system |
| React Router DOM v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Framer Motion | Animations & transitions |
| @dnd-kit | Drag and drop |
| Recharts | Data visualization |
| react-hot-toast | Notifications |
| react-image-crop | Avatar cropping |
| react-loading-skeleton | Loading states |

**Backend**
| Library | Purpose |
|---------|---------|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database & ORM |
| JSON Web Tokens | Authentication |
| Cloudinary + Multer | Media storage |
| express-rate-limit | API protection |
| express-validator | Input validation |
| bcryptjs | Password hashing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/StudyTracker.git
cd StudyTracker
```

### 2. Setup the Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌍 Deployment

This project uses a **decoupled deployment** strategy:

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** → `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add all environment variables from `backend/.env.example`
6. Set `CLIENT_URL` → your Vercel frontend URL

### Frontend → Vercel
1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. Framework auto-detected as **Vite**
4. Add environment variable `VITE_API_URL` → your Render backend URL

---

## 📁 Project Structure

```
StudyTracker/
├── backend/
│   ├── src/
│   │   ├── config/         # DB & Cloudinary config
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # Auth, error handling, rate limit
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # Express route definitions
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Full page views
│   │   ├── services/       # API service functions
│   │   └── utils/          # Constants & helpers
│   └── .env.example
├── plans.md                # Implementation notes
└── README.md
```

---

## 📄 Environment Variables

Refer to `backend/.env.example` and `frontend/.env.example` for a complete list of required variables with descriptions and security notes.

---

*Built with ❤️ for serious students.*
