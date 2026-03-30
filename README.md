# 📚 StudyTracker

A full-stack web application designed to help students efficiently track their exam preparation progress. Organize your subjects, break them into manageable topics, monitor deadlines, and stay on track with visual analytics and productivity tools.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 📊 Progress Tracking
- **Subject Management**: Create and organize subjects with custom icons and colors
- **Topic Breakdown**: Break subjects into manageable topics with individual progress tracking
- **Visual Analytics**: Real-time pie charts, progress bars, and completion statistics
- **Dashboard Overview**: Comprehensive view of overall progress and study statistics

### ⏰ Deadline Management
- **Exam Date Tracking**: Set exam dates for each subject
- **Live Countdowns**: Real-time countdown timers showing days remaining
- **Urgency Warnings**: Visual alerts for subjects behind schedule or nearing deadlines
- **Upcoming Exams**: Quick view of exams in the next 30 days

### 🎯 Productivity Tools
- **Pomodoro Timer**: Built-in focus timer with 25-min work sessions and break modes
- **Status Tracking**: Easy status management (Not Started → In Progress → Completed)
- **Progress Slider**: Adjust completion percentage with visual feedback
- **Session Counter**: Track completed focus sessions

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes with persistent settings
- **Responsive Design**: Fully mobile-responsive interface (mobile-first approach)
- **Smooth Animations**: Polished UI with fade-in, slide-up, and pulse effects
- **User Preferences**: Customizable display name and appearance settings

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v4.18.3
- **Database**: MongoDB with Mongoose v8.2.4
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Security**: bcryptjs v2.4.3 for password hashing
- **Validation**: express-validator v7.1.0
- **CORS**: Enabled with configurable origins

### Frontend
- **Framework**: React v18.3.1
- **Build Tool**: Vite v5.2.11
- **Routing**: React Router v6.23.1
- **HTTP Client**: Axios v1.6.8
- **Styling**: Tailwind CSS v3.4.4
- **Charts**: Recharts v2.12.7
- **Date Utilities**: date-fns v3.6.0

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (or local MongoDB instance)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Tracker
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configurations
# - Set MONGODB_URI to your MongoDB connection string
# - Change JWT_SECRET to a strong secret key (minimum 32 characters)
# - Adjust other variables as needed
```

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studytracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
Tracker/
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js             # MongoDB connection
│       ├── models/               # Mongoose schemas
│       │   ├── User.js           # User model (auth)
│       │   ├── Subject.js        # Subject model
│       │   ├── Topic.js          # Topic model
│       │   └── StudySession.js   # Study session model
│       ├── controllers/          # Business logic
│       │   ├── authController.js
│       │   ├── subjectController.js
│       │   ├── topicController.js
│       │   └── dashboardController.js
│       ├── middleware/
│       │   ├── auth.js           # JWT verification
│       │   └── errorHandler.js   # Global error handling
│       └── routes/
│           ├── auth.js           # Auth routes
│           ├── subjects.js       # Subject CRUD
│           ├── topics.js         # Topic CRUD
│           └── dashboard.js      # Dashboard analytics
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # Router configuration
        ├── index.css             # Global styles
        ├── components/
        │   ├── Layout.jsx        # Protected layout wrapper
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   ├── Navbar.jsx        # Top navigation bar
        │   ├── SubjectCard.jsx   # Subject display card
        │   ├── ProgressBar.jsx   # Progress visualization
        │   ├── CountdownTimer.jsx # Exam countdown
        │   ├── PomodoroTimer.jsx  # Pomodoro widget
        │   └── Modal.jsx         # Reusable modal
        ├── pages/
        │   ├── LandingPage.jsx   # Public landing page
        │   ├── LoginPage.jsx     # Login form
        │   ├── RegisterPage.jsx  # Registration form
        │   ├── DashboardPage.jsx # Main dashboard
        │   ├── SubjectsPage.jsx  # Subject management
        │   ├── SubjectDetailPage.jsx # Topic management
        │   └── SettingsPage.jsx  # User preferences
        ├── context/
        │   └── AuthContext.jsx   # Authentication state
        └── services/
            └── api.js            # Axios configuration
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | User login, returns JWT | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/preferences` | Update user preferences | Yes |

### Subjects (`/api/subjects`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user subjects | Yes |
| POST | `/` | Create new subject | Yes |
| GET | `/:id` | Get single subject with topics | Yes |
| PUT | `/:id` | Update subject | Yes |
| DELETE | `/:id` | Delete subject (cascade topics) | Yes |
| POST | `/:subjectId/topics` | Add topic to subject | Yes |

### Topics (`/api/topics`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/:id` | Update topic | Yes |
| DELETE | `/:id` | Delete topic | Yes |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/summary` | Get dashboard analytics | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **User-Scoped Queries**: All data operations filtered by authenticated user
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: express-validator on all inputs
- **Error Handling**: Global error middleware with specific handlers

## 🎨 Customization

### Adding New Subject Icons
Edit the icon options in `frontend/src/pages/SubjectsPage.jsx` to add more emoji options.

### Changing Color Schemes
Modify the color palette in `frontend/tailwind.config.js` to customize the theme.

### Adjusting Pomodoro Timer Durations
Edit the duration constants in `frontend/src/components/PomodoroTimer.jsx`.

## 🐛 Known Issues & Limitations

- Study session tracking is not fully implemented (model exists but no routes)
- No pagination on subject/topic lists (could affect performance with many items)
- No password reset functionality
- JWT stored in localStorage (consider HttpOnly cookies for enhanced security)
- No rate limiting on API endpoints

## 🚀 Future Enhancements

- [ ] Password reset via email
- [ ] Email verification on registration
- [ ] Study session analytics and history
- [ ] Export progress reports (PDF/CSV)
- [ ] Collaboration features (share subjects with peers)
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Notifications and reminders
- [ ] Search and filter functionality
- [ ] Data import/export
- [ ] Study statistics and insights

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Icons: Emoji-based icons for simplicity
- Charts: Recharts library for beautiful visualizations
- UI Framework: Tailwind CSS for rapid development
- Inspiration: Student productivity and exam preparation needs

## 📧 Contact

For questions or support, please open an issue on GitHub or contact [your-email@example.com].

---

**Built with ❤️ for students everywhere**
