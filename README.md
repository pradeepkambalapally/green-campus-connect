# 🌿 Green Campus Connect

**A Gamified Sustainability Learning and Behavioral Engagement System**

> *Learn Green. Act Green. Make an Impact.*

Green Campus Connect is a university-focused platform that transforms sustainability education into an interactive, gamified experience. Students explore learning destinations, complete quizzes, participate in real-world challenges, and earn rewards — all while building lasting eco-friendly habits.

---

## ✨ Features

- 🗺️ **Interactive Learning Map** — Adventure-style SVG map with 5 sustainability destinations
- 📝 **Quiz Engine** — Multiple-choice quizzes with instant feedback and XP rewards
- 🏆 **Gamification** — XP points, levels, badges, streaks, and leaderboards
- 🌱 **Sustainability Challenges** — Real-world missions with photo evidence submissions
- 👨‍💼 **Admin Dashboard** — Manage modules, challenges, and review submissions
- 📊 **Analytics** — Track student participation and institutional impact

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js, JWT, bcryptjs |
| **Database** | MongoDB Atlas, Mongoose |
| **Storage** | Cloudinary (images) |
| **Tools** | Git, GitHub, Postman |

---

## 📁 Project Structure

```
green-campus-connect/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── .env.example     # Environment template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account (optional for dev)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pradeepkambalapally/green-campus-connect.git
   cd green-campus-connect
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example server/.env
   # Edit server/.env with your MongoDB URI, JWT secret, etc.
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd server && npm install

   # Frontend
   cd ../client && npm install
   ```

4. **Seed admin account**
   ```bash
   cd server && node seeds/adminSeed.js
   ```

5. **Run the application**
   ```bash
   # Backend (from server/)
   npm run dev

   # Frontend (from client/)
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

---

## 👥 Roles

| Role | Access |
|------|--------|
| **Student** | Register, learn modules, take quizzes, join challenges, submit evidence |
| **Admin** | Manage modules/challenges, review submissions, view analytics |

---

## 📄 License

This project is developed as a final-year academic project.

---

*Built with 💚 for a greener campus*
