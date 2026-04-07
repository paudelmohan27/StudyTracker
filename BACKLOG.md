# 📋 StudyTracker Feature Backlog

This backlog tracks planned features, enhancements, and ideas for the StudyTracker application.

---

## 🔐 Security & Account Management (Completed)
*Implemented Forgot Password & Change Password features*

### 1. Forgot / Reset Password via Email
- **Description:** Allow users who forgot their password to request a secure reset link via email.
- **Backend Stack:** 
  - `nodemailer` (or similar service like SendGrid/Resend) to send emails.
  - Generates a secure, temporary reset token (e.g., using `crypto`) saved to the user model with an expiration time.
  - New endpoints: `POST /api/auth/forgotpassword` and `PUT /api/auth/resetpassword/:resettoken`.
- **Frontend Stack:** 
  - New Page: `/forgot-password` (enter email).
  - New Page: `/reset-password/:token` (enter new password).
- **Difficulty:** 🟡 Medium

### 2. Change Password (Authenticated)
- **Description:** Allow logged-in users to update their password from their settings profile.
- **Backend Stack:** New endpoint `PUT /api/auth/updatepassword` requiring current password and new password.
- **Frontend Stack:** Update `SettingsPage.jsx` to include a password change form.
- **Difficulty:** 🟢 Easy

---

## ⚡ Quick Wins (1–3 hours)

### 3. Daily Study Goal
- **Description:** Let users set a daily study goal (e.g., 2 hours/day) and show progress toward it on the Dashboard.
- **Implementation:** Add `dailyGoalMinutes` to the User model. Display a progress ring on the Dashboard.

### 4. Topic Checklist with Sub-Tasks
- **Description:** Allow topics to have a list of sub-tasks/checkboxes.
- **Implementation:** Add `subtasks: [{ label, done }]` to `Topic.js` model. Render as a checklist in `SubjectDetailPage`.

### 5. Notes / Rich-Text per Topic
- **Description:** Add a notes field to each Topic that supports rich text.
- **Implementation:** `tiptap` or `react-quill` on frontend, `notes` string field to `Topic` model.

### 6. Study Reminders / Notifications
- **Description:** Let users schedule a daily study reminder time.
- **Implementation:** Web Notifications API (`Notification.requestPermission`), stored in user settings.

### 7. Export Study Report (PDF)
- **Description:** A "Download Report" button on the Dashboard that exports a weekly study summary as a PDF.
- **Implementation:** `jspdf` + `html2canvas` on the frontend.

---

## 🔥 High-Impact Features (Half to Full Day)

### 8. Live Study Timer with Auto-Log
- **Description:** A persistent, floating stopwatch. On stop, it auto-creates a StudySession entry.
- **Implementation:** Floating widget persisting in the Layout, auto-POSTs to `/api/sessions`.

### 9. Streak & Achievement System
- **Description:** Track consecutive study days and award badges.
- **Implementation:** Add `streak`, `lastStudiedDate`, `badgesEarned[]` to User model. Gamification.

### 10. Global Search (Ctrl+K)
- **Description:** A command-palette-style search across subjects, topics, and sessions.
- **Implementation:** Frontend-only fuzzy search with `fuse.js`.

### 11. Per-Subject Analytics Page
- **Description:** Deep-dive analytics for a single subject.
- **Implementation:** Add Recharts graphs inside `SubjectDetailPage`.

### 12. Study Planner / Calendar View
- **Description:** A monthly calendar showing exam dates and daily study minutes.
- **Implementation:** `react-big-calendar`.

---

## 🚀 Advanced Features (Multi-Day)

### 13. AI Study Recommendations
- **Description:** AI assistant analyzing progress and generating study suggestions.
- **Implementation:** Backend endpoint using OpenAI/Gemini APIs.

### 14. Progressive Web App (PWA)
- **Description:** Make the app installable on mobile/desktop with offline cache.
- **Implementation:** `vite-plugin-pwa` + manifest.

### 15. Shared Subjects & Study Groups
- **Description:** Let users create groups to share collective study hours and progress.
- **Implementation:** `Group` model, relationships, WebSockets (Socket.io) for real-time syncing.

### 16. Public Profile & Sharing
- **Description:** Public `/u/username` profile page showing study stats.
- **Implementation:** No-auth public API endpoint, `isPublic` setting toggle.

### 17. Pinned Resources per Subject
- **Description:** Attach links or uploaded PDFs to a subject.
- **Implementation:** `resources` array on Subject model, frontend panel.
